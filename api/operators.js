exports.getTopologyOperators = function(req,res, next) {

	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}

	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}


	var jsonResponse = {};
	var operators = [];
	console.log(commands_manager.clusters);
	for (var i = 0; i < commands_manager.clusters.length; i++) {
		var curCluster = commands_manager.clusters[i];
		if(curCluster.nodes[0].remote) {
			operators.push({
				oid: curCluster.cid,
				alias: curCluster.alias,
				peer: curCluster.nodes[0].host,
				script: curCluster.script,
				remote: true
			});
		}
	};

	node.channel.koala_node.get_clusters(function(clusters) {
	
			//get number of workers to return
			var nw = 0;
			for (var i = 0; i < clusters.length; i++) {
				for (var j = 0; j < clusters[i].workers.length ; j++) {
					nw++;
				};
			}
	
			for (var i = 0; i < clusters.length; i++) {
				if(clusters[i] != null) {
					var curCluster = clusters[i];
					var operator = {
						oid: curCluster.cid,
						alias: curCluster.alias,
						peer: curCluster.workers[0].host,
						script: curCluster.script,
						remote: false,
						href: "/topologies/"+tid+"/operators/"+curCluster.cid
					}
				
					operator.workers = [];
					operators.push(operator);	

					var workers = [];
					operators[curCluster.cid].cpu_usage = 0;
					var ncb = 0;
					for (var j = 0; j < curCluster.workers.length; j++) {
						var curWorker = curCluster.workers[j];
						
						node.channel.koala_node.get_worker(curCluster.cid, curWorker.uid, function(msg) {
						
							var newWorker = {
								wid: msg.wid,
								messages: msg.messages_sent,
								req_res_ratio: msg.messages_received/msg.messages_sent,
								cpu_usage: msg.cpu_usage,
								href: "/topologies/1/operators/"+msg.cid+"/workers/"+msg.wid,
								operator: "/topologies/1/operators/"+msg.cid
							}
							operators[msg.cid].cpu_usage += msg.cpu_usage;
							operators[msg.cid].workers.push(newWorker);
							ncb++;
							if(ncb == nw) {
								res.header("Access-Control-Allow-Origin", "*");
								jsonResponse["operators"] = operators;
								res.send(jsonResponse);
							}
						});
					
					};
				}
			};
		});
}



exports.getTopologyOperator = function(req,res, next) {

	var tid = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}

	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	var jsonResponse = {};
	var cpu_usage = 0;

	node.channel.koala_node.get_clusters(function(clusters) {

		var nw = clusters[oid].workers.length;
		for (var i = 0; i < clusters.length; i++) {
			if(clusters[i] != null && clusters[i].cid == oid) {
				var curCluster = clusters[i];
				var operator = {
					oid: curCluster.cid,
					alias: curCluster.alias,
					peer: curCluster.workers[0].host,
					script: curCluster.script,
					remote: false
				}

				var ncb = 0;
				var workers = [];
				topology.operators[oid].workers = [];
				topology.operators[oid].cpu_usage = 0;
				for (var j = 0; j < curCluster.workers.length; j++) {
					
					node.channel.koala_node.get_worker(oid, curCluster.workers[j].uid, function(msg) {
						var newWorker = {
							wid: msg.wid,
							messages: msg.messages_sent,
							req_res_ratio: msg.messages_received/msg.messages_sent,
							cpu_usage: msg.cpu_usage,
							uptime: msg.uptime,
							href: "/topologies/1/operators/"+msg.cid+"/workers/"+msg.wid,
							operator: "/topologies/1/operators/"+msg.cid
						}
						topology.operators[oid].cpu_usage += msg.cpu_usage;
						topology.operators[oid].workers.push(newWorker);
						ncb++;
						if(ncb == nw) {
							res.header("Access-Control-Allow-Origin", "*");
							jsonResponse["operator"] = topology.operators[oid];
							res.send(jsonResponse);
						}

					});
				};
				
			}
		};
	});
}


exports.createTopologyOperator = function(req,res, next) {

	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}

	var topology = filter(commands_manager.topologies.topologies, function(element) {
				return element.tid == tid;
			});

	if(topology == undefined) {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No operator schema provided"));
	}

	var operator;
	try {
		operator = JSON.parse(req.body);
	} catch(e) {
		console.log(e);
	}


	// console.log(operator);
	if(checkSchema(operator, "operator")) {
		//get node where to run the operator

		var node = filter(commands_manager.N.nodes, function(element) {
			return element.host == operator.operator.peer;
		});

		var operators = [];
		var jsonResponse = {};
		commands_manager.run_new_cluster(["runc", operator.operator.script, node.uid+"", operator.operator.workers.length], function(outmsg) {
			
			if(outmsg.split(" ")[0] == "cluster") {
			  	//UPDATE TOPOLOGY
			  	console.log("RETURNING CLUSTERS");
			   	node.channel.koala_node.get_clusters(function(clusters) {
					console.log("NODE CLUSTERS");
					console.log(clusters);
					
					for (var i = 0; i < clusters.length; i++) {
						if(clusters[i] != null) {
							var curCluster = clusters[i];
							var operator = {
								oid: curCluster.cid,
								alias: curCluster.alias,
								peer: curCluster.workers[0].host,
								script: curCluster.script,
								remote: false
							}

							var workers = [];
							for (var j = 0; j < curCluster.workers.length; j++) {
								var curWorker = curCluster.workers[j];
								var newWorker = {
									wid: curWorker.uid,
									href: "/topologies/1/operators/"+curCluster.cid+"/workers/"+curWorker.uid,
									operator: "/topologies/1/operators/"+curCluster.cid
								}
								workers.push(newWorker);
							};
							operator.workers = workers;
							operators.push(operator);
						}
					};

					topology.operators = operators;
					jsonResponse["operators"] = topology.operators;
					console.log("RETURNING HEADERS");
					res.header("Access-Control-Allow-Origin", "*");
					res.send(jsonResponse);
				});


			} else {
				res.header("Access-Control-Allow-Origin", "*");
				return next(new restify.InvalidContentError(outmsg));	
			}
		});
	 } else {
	 	res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("Invalid operator schema"));	
 	 }

	
}


exports.updateTopologyOperatorScript = function(req,res, next) {

	var tid  = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}


	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No script schema provided"));
	}

	//get the node where oid is running
	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	var operator = filter(topology.operators, function(element) {
		return element.oid == oid;
	});

	if(operator == undefined) {
		return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
	}

	var script = JSON.parse(req.body);
	if(checkSchema(script, "script")) {

	
		//TODO OPERATOR CAN RUN ON MULTIPLE NODES?
		var node = filter(commands_manager.N.nodes, function(element) {
			return element.host == operator.peer;
		});
		node.channel.koala_node.update_script(script.script.name, oid, function(outmsg) {

				console.log(outmsg);
				//change topology structure
				var topology = filter(commands_manager.topologies.topologies, function(element) {
				 	return element.tid == tid;
				});

				update(topology.operators, script.script.name, function(element) {
					return element.oid == oid;
				});

				// console.log(commands_manager.topologies.topologies);
				res.header("Access-Control-Allow-Origin", "*");
				res.send(commands_manager.topologies);
		});

	 } else {
		return next(new restify.InvalidContentError("Invalid script schema"));	
	}

}



exports.updateTopologyOperatorBindings = function(req, res, next) {

	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}

	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No bindings schema provided"));
	}
	var bindings = JSON.parse(req.body);
	if(checkSchema(bindings, "bindings") && checkOperators(bindings.bindings)) {


		//check that 

		var topology = filter(commands_manager.topologies.topologies, function(element) {
			return element.tid == tid;
		});

		if(topology == undefined) {
			return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
		}

		var ids = [];

		// var new_bindings = getNewBindings(topology.bindings, bindings.bindings);

		//check already existing bindings and remove them
		for(var i=0; i < bindings.bindings.length; i++) {
			var new_cluster_from = bindings.bindings[i].from;
			var new_cluster_to = bindings.bindings[i].to;
			if(new_cluster_from == oid || new_cluster_to == oid) {
				if(containBinding(topology.bindings, new_cluster_from, new_cluster_to)) {
					ids.push(getIndex(bindings.bindings, function(element) {
						return element.from == new_cluster_from && element.to == new_cluster_to;
					}));				
				} 
			}
		}


		//delete already existing bindings
		if(ids.length > 0) {


			var new_bindings = [];
			for(var i=0; i < bindings.bindings.length; i++) {
				if(!contains(ids, i)) {
					console.log("pushing = "+i);
					new_bindings.push(bindings.bindings[i]);
				}
			}

					
			//identify clusters to unbind
			var to_unbind = [];
			for (var i = 0; i < topology.bindings.length; i++) {
				var cluster_from = topology.bindings[i].from;
				var cluster_to = topology.bindings[i].to;
				if(!containBinding(bindings.bindings, cluster_from, cluster_to)) {
					to_unbind.push(i);
				}
			};


			var ncb = 0;
			//unbind clusters and bind in callback
			for (var i = 0; i < to_unbind.length; i++) {
				var cluster_from = topology.bindings[to_unbind[i]].from;
				var cluster_to = topology.bindings[to_unbind[i]].to;
				console.log("unbinding : "+cluster_from+" -> "+cluster_to);
				commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function() {
					console.log("unbinded : ");
					ncb++;
					console.log(ncb);
					if(ncb == to_unbind.length) {
						for (var i = 0; i < new_bindings.length; i++) {
							var cluster_from = new_bindings[i].from;
							var cluster_to = new_bindings[i].to;
							console.log("new binding : "+cluster_from+" -> "+cluster_to);
							commands_manager.unbind_clusters(["bindc", cluster_from, cluster_to], function() {
									console.log("binded");
							}, this);
						};
					}
				});
			};
		}
	} else {
		return next(new restify.InvalidContentError("Invalid bindings schema"));	
	}

}

var checkOperators = function(bindings) {

	for (var i = 0; i < bindings.length; i++) {
		var cluster_from = bindings[i].from;
		var cluster_to = bindings[i].to;
		
		var from = filter(commands_manager.clusters, function(element) {
			return element.cid == cluster_from;
		});

		var to = filter(commands_manager.clusters, function(element) {
			return element.cid == cluster_to;
		});

		if(from == undefined || to == undefined) {

			return false;
		}

	};

	return true;

}


exports.updateTopologyBindings = function(req,res, next) {

	console.log("update TOPOLOGY node bindings");

	var tid = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}


	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No bindings schema provided"));
	}
	var bindings = JSON.parse(req.body);


	console.log("bindings");
	console.log(bindings);
	if(checkSchema(bindings, "bindings") && checkOperators(bindings.bindings)) {


		var topology = filter(commands_manager.topologies.topologies, function(element) {
			return element.tid == tid;
		});

		if(topology == undefined) {
			res.header("Access-Control-Allow-Origin", "*");
			return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
		}

		var operator = filter(topology.operators, function(element) {
			return element.oid == oid;
		});

		if(operator == undefined) {
			res.header("Access-Control-Allow-Origin", "*");
			return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
		}

		
		var ids = [];


		//check already existing bindings and remove them
		for(var i=0; i < bindings.bindings.length; i++) {
			var new_cluster_from = bindings.bindings[i].from;
			var new_cluster_to = bindings.bindings[i].to;
			if(containBinding(topology.bindings, new_cluster_from, new_cluster_to)) {
				ids.push(getIndex(bindings.bindings, function(element) {
					return element.from == new_cluster_from && element.to == new_cluster_to;
				}));				
			} 
		}

		//delete already existing bindings
		var new_bindings = [];
		for(var i=0; i < bindings.bindings.length; i++) {
			if(!contains(ids, i)) {
				console.log("pushing = "+i);
				new_bindings.push(bindings.bindings[i]);
			}
		}
	
		//identify clusters to unbind
		var to_unbind = [];
		for (var i = 0; i < topology.bindings.length; i++) {
			var cluster_from = topology.bindings[i].from;
			var cluster_to = topology.bindings[i].to;
			if(!containBinding(bindings.bindings, cluster_from, cluster_to)) {
				if(cluster_from == oid || cluster_to == oid) {
					to_unbind.push(i);
				}
			}
		};

		//count number of callbacks;
		var ncb = 0;
		//unbind clusters and bind in callback
		if(to_unbind.length > 0){
			for (var i = 0; i < to_unbind.length; i++) {
				var cluster_from = topology.bindings[to_unbind[i]].from;
				var cluster_to = topology.bindings[to_unbind[i]].to;
				console.log("unbinding : "+cluster_from+" -> "+cluster_to);
				commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function(outmsg) {
					console.log(outmsg);
					ncb++;
					console.log(ncb);
					if(ncb == to_unbind.length) {

						console.log("new BINDINGS");
						console.log(new_bindings)

						if(new_bindings.length == 0) {
							res.header("Access-Control-Allow-Origin", "*");
							res.send(commands_manager.topologies);
						}

						var ncbb = 0;
						for (var i = 0; i < new_bindings.length; i++) {

							var cluster_from = new_bindings[i].from;
							var cluster_to = new_bindings[i].to;

							if(cluster_from == oid || cluster_to == oid) {
								console.log("new binding : "+new_bindings[i].from+" -> "+new_bindings[i].to);
								console.log("not a new operator : "+cluster_from+" -> "+cluster_to);
								commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
									console.log(outmsg);
									ncbb++;
									if(ncbb == new_bindings.length) {
										res.header("Access-Control-Allow-Origin", "*");
										res.send(commands_manager.topologies);
									}
								}, commands_manager);
							}		
						};
					}
				});
			};
		} else {

			//nothing to unbind just create new bindings
			if(new_bindings.length == 0) {
				res.header("Access-Control-Allow-Origin", "*");
				res.send(commands_manager.topologies);
			}

			var ncb = 0;
			for (var i = 0; i < new_bindings.length; i++) {
				var cluster_from = new_bindings[i].from;
				var cluster_to = new_bindings[i].to;
				if(cluster_from == oid || cluster_to == oid) {
						console.log("new binding qui : "+cluster_from+" -> "+cluster_to);

						commands_manager.bind_clusters(["bindc", cluster_from+"", cluster_to+""], function(outmsg) {
							console.log(outmsg);
							ncb++;
							if(ncb == new_bindings.length) {
								res.header("Access-Control-Allow-Origin", "*");
								res.send(commands_manager.topologies);
							}
							
						}, commands_manager);
				}
					
			};
		}

		
	} else {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("Invalid bindings schema"));	
	}
}


exports.deleteTopologyOperator = function(req,res) {

	var tid = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}

	var topology = filter(commands_manager.topologies.topologies, function(element) {
		res.header("Access-Control-Allow-Origin", "*");
		return element.tid == tid;
	});


	if(topology == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}


	var operator = filter(topology.operators, function(element) {
		res.header("Access-Control-Allow-Origin", "*");
		return element.oid == oid;
	});
	if(operator == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
	}

	console.log("KILL OPERATOR = "+oid);
	commands_manager.kill_cluster(["killc", oid], function(outmsg) {

		console.log(outmsg);
		del(topology.operators, function(element) {
			return element.oid == oid;
		});

		res.header("Access-Control-Allow-Origin", "*");
		res.send(commands_manager.topologies);
	});

}

exports.createTopologyOperatorBrowser = function(req,res) {

}



