/*
	Retrieves the list of topologies started from this peer
															*/
exports.getTopologies = function( req, res ) {


	var topology = commands_manager.topologies.topologies[0];
	
	if(topology == undefined) {
		console.log("GET TOPOLOGIES");
		res.header("Access-Control-Allow-Origin", "*");
		res.send(commands_manager.topologies);
		return;
	}

	var operators = [];
	var ncb = 0;
	var nw = 0;
	// for (var i = 0; i < commands_manager.clusters.length; i++) {
	// 	var curCluster = commands_manager.clusters[i];
		
	// 	if(curCluster.nodes[0].remote) {
	// 		console.log("ADDING REMOTE CLUSTER");
	// 		console.log(curCluster);
	// 		operators.push({
	// 			oid: curCluster.cid,
	// 			alias: curCluster.alias,
	// 			peer: curCluster.nodes[0].host,
	// 			script: curCluster.script,
	// 			remote: true
	// 		});

	// 	}
	// };



	for (var i = 0; i < topology.operators.length; i++) {
		console.log("CHECKING OPERATOR");
		console.log(topology.operators[i]);
		if(!topology.operators[i].browser) {
			var workers = topology.operators[i].workers;		
			for (var j = 0; j < workers.length; j++) {
				nw++;
			};
		}
	};

	var uids = [];
	
	console.log("WORKER TO WAIT = "+nw);
	console.log(commands_manager.N.nodes);
	
	var jsonResponse = {};
	for (var n = 0; n < commands_manager.N.nodes.length; n++) {
			

		if(!contains(uids, commands_manager.N.nodes[n].uid) && !commands_manager.N.nodes[n].remote) {
			uids.push(commands_manager.N.nodes[n].uid);
			var curNode = commands_manager.N.nodes[n];

			console.log("GETTING CLUSTER OF "+curNode.host);
			curNode.channel.koala_node.get_clusters(function(clusters, i) {
			
				console.log("CLUSTERS OF = ");
				console.log(clusters);

				for (var i = 0; i < clusters.length; i++) {
					if(clusters[i] != null) {

						var node = filter(commands_manager.N.nodes, function(element) {
							return element.host == clusters[i].workers[0].host;
						});

						var curCluster = clusters[i];
					
						var operator = {
							oid: curCluster.cid,
							alias: curCluster.alias,
							peer: node.host,
							script: curCluster.script,
							remote: false,
							href: "/topologies/1/operators/"+curCluster.cid
						}

						operator.workers = [];
						operator.cpu_usage = 0;
						operators.push(operator);	
						



						for (var j = 0; j < curCluster.workers.length; j++) {
								node.channel.koala_node.get_worker(curCluster.cid, curCluster.workers[j].uid, function(msg) {
								

									var operator = filter(operators, function(element) {
										return element.oid == msg.cid;
									});

									var newWorker = {
										wid: msg.wid,
										messages: msg.messages_sent,
										req_res_ratio: msg.messages_received/msg.messages_sent,
										cpu_usage: msg.cpu_usage,
										uptime: msg.uptime,
										href: "/topologies/1/operators/"+msg.cid+"/workers/"+msg.wid,
										operator: "/topologies/1/operators/"+msg.cid
									}
									operator.cpu_usage += msg.cpu_usage;
									operator.workers.push(newWorker);
									ncb++;

									if(ncb == nw) {
										console.log("SHOWING ALSO BROWSERS");
										for(var o = 0; o < topology.operators.length; o++) {

											if(topology.operators[o].browser) {
												var operator = {
													oid: topology.operators[o].oid,
													alias: "B"+topology.operators[o].oid,
													peer: "Not available",
													script: topology.operators[o].script,
													remote: true,
													href: "/topologies/1/operators/"+topology.operators[o].oid
												}

												operator.workers = [];
												operator.cpu_usage = 0;
												console.log("ADDING REMOTE B"+topology.operators[o].oid);
												operators.push(operator);
											}
										}
										res.header("Access-Control-Allow-Origin", "*");
										topology.operators = operators;
										jsonResponse["topologies"] = commands_manager.topologies.topologies;
										res.send(jsonResponse);
									}
								});
						};
					
					}
				};
		
			}, node.uid);
			
		}	
	}
}


/*
	Gets topology with id tid.
*/
exports.getTopology = function(req,res, next) {
	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}

	var topologies = commands_manager.topologies.topologies;
	var topology = filter(topologies, function(element) {
		return element.tid == tid;
	});
	var jsonResponse = {};
	console.log(topology);
	if(topology != undefined) {

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
				
				var ncb = 0;
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
						operators.push(operator);
						operators[curCluster.cid].workers = [];
						operators[curCluster.cid].cpu_usage = 0;

						for (var j = 0; j < curCluster.workers.length; j++) {
							node.channel.koala_node.get_worker(curCluster.cid, curCluster.workers[j].uid, function(msg) {
							
								var newWorker = {
									wid: msg.wid,
									messages: msg.messages_sent,
									req_res_ratio: msg.messages_received/msg.messages_sent,
									cpu_usage: msg.cpu_usage,
									uptime: msg.uptime,
									href: "/topologies/1/operators/"+msg.cid+"/workers/"+msg.wid,
									operator: "/topologies/1/operators/"+msg.cid
								}
								operators[msg.cid].cpu_usage += msg.cpu_usage;
								operators[msg.cid].workers.push(newWorker);
								ncb++;
								if(ncb == nw) {
									topology.operators = operators;
									res.header("Access-Control-Allow-Origin", "*");
									jsonResponse["topology"] = topology;
									res.send(jsonResponse);
								}
							});
						};
					}
				};
			});

		
	} else {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}
	
}


/*
	Delets topology with id tid.
*/
exports.deleteTopology = function(req, res, next) {

	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}
	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology != undefined ) {
		var ncb = 0;
		//kill all operators in the topology (for every worker kill its workers and their associated processes)
		for (var i = 0; i < topology.operators.length; i++) {
			commands_manager.kill_cluster(["killc", topology.operators[i].oid], function(outmsg) {
				console.log(outmsg);
				ncb++;
				if(ncb == topology.operators.length) {
					del(commands_manager.topologies.topologies, function(element) {
						return element.tid == tid;
					});
					
					res.header("Access-Control-Allow-Origin", "*");
					res.send(commands_manager.topologies);
				}
			});
		};
	} else {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}
}


exports.createTopology = function(req, res, next) {

	//TODO: Add check json schema
	console.log("CREATE TOPOLOGY");
	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No topology schema provided"));
	}
	var topology = JSON.parse(req.body);
	if(checkSchema(topology, "topology")) {

	  	var nodes_run = 0;
		for(var i = 0; i < topology.topology.operators.length; i++){
			      //create operators
			      //console.log(i)
			      var uids = [];
			      if(!topology.topology.operators[i].workers)
			          topology.topology.operators[i].workers = 1;
			         
			      if(!topology.topology.operators[i].automatic)
			      	  topology.topology.operators[i].automatic = true;
			      
			      for(var w = 0; w < topology.topology.operators[i].workers.length; w++){
			          uids.push(commands_manager.generate_worker_uid());
			      }
			      
			      var node = commands_manager.find_host(commands_manager, function(node_index, index){
			      	  
			      	  var node = commands_manager.N.nodes[node_index];
			          var new_cid = commands_manager.generate_operator_cid();
				      //function(node, new_cid, script, uids, automatic, to_spawn, alias, self, cb)

				      commands_manager.run_operator(node, new_cid, topology.topology.operators[index].script,
				      								uids, topology.topology.operators[index].automatic, 
				      								topology.topology.operators[index].workers.length, 
				      								topology.topology.operators[index].id, 
				      								commands_manager, function(outmsg){
				      	  console.log(outmsg);
				      	     	  
				      	  nodes_run++;
				      	  //if every operator is ran
				      	  if(nodes_run === topology.topology.operators.length){
				      	  	  //create bindings -> first have to create ids/aliases and have them returned on the previous method call
				      	   	  var ncb = 0;
				      	   	  for(var j = 0; j < topology.topology.bindings.length; j++){
				      	    	  //function(from, to, aliases, protocol, self, cb)
				      	    	  commands_manager.bind_operators(topology.topology.bindings[j].from, 
				      	    	  								  topology.topology.bindings[j].to, topology.topology.bindings[j].type, 
				      	    	  								  topology.topology.bindings[j].type, commands_manager,
				      	    	  								  function(outmsg){
				      	    	  		ncb++;
				      	    	  		console.log(outmsg);
							      	    if(ncb == topology.topology.bindings.length) {
							      	    	res.header("Access-Control-Allow-Origin", "*");
											res.send(commands_manager.topologies);
							      	    }
				      	    	  		
				      	    	  		commands_manager.start_controller("", function(outmsg){
				      	    	  			console.log(outmsg);
				      	    	  		});
				      	    	  });
				      	  	  }
				      	  }
			          });
			      }, i);
			  }
	
	} else {
		return next(new restify.InvalidContentError("Invalid topology schema"));	
	}
}


exports.patchTopology = function(req, res, next) {

	console.log("PATCH TOPOLOGY");	
	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}
	var oldTopology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});
	if(oldTopology == undefined) {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	if(req.body == undefined) {

		return next(new restify.InvalidContentError("No topology schema provided"));
	}

	var topology = JSON.parse(req.body);
	if(checkSchema(topology, "topology")) {

		var new_operators = [];
		//get new operators
		for(var i = 0; i < topology.topology.operators.length; i++){
			var curOperator = topology.topology.operators[i];
			if(!containsOperator(oldTopology.operators, curOperator)) {
				new_operators.push(curOperator);
			}
		}

		console.log("NEW OPERATORS");
		console.log(new_operators);

		var nodes_run = 0;
		if(new_operators.length == 0) {
			//only change bindings
			var new_bindings = [];
			for(var i=0; i < topology.topology.bindings.length; i++) {
				var new_cluster_from = topology.topology.bindings[i].from;
				var new_cluster_to = topology.topology.bindings[i].to;
				//if not contained add new binding
				if(!containBinding(oldTopology.bindings, new_cluster_from, new_cluster_to)) {
					new_bindings.push(topology.topology.bindings[i]);			 
				}
			}


			//unbind old connections between clusters
			var to_unbind = [];
			for (var i = 0; i < oldTopology.bindings.length; i++) {
				var cluster_from = oldTopology.bindings[i].from;
				var cluster_to = oldTopology.bindings[i].to;
				if(!containBinding(topology.topology.bindings, cluster_from, cluster_to)) {
					to_unbind.push(oldTopology.bindings[i]);
				}
			};

			if(to_unbind.length == 0) {
				res.header("Access-Control-Allow-Origin", "*");
				res.send(commands_manager.topologies);
			}

			var ncb = 0;
			for (var i = 0; i < to_unbind.length; i++) {
				var cluster_from = to_unbind[i].from;
				var cluster_to = to_unbind[i].to;
				commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function(outmsg) {
					ncb++;
					if(ncb == to_unbind.length) {
						//create new bindings
						var ncbb = 0;
						for (var i = 0; i < new_bindings.length; i++) {
							var cluster_from = new_bindings[i].from;
							var cluster_to = new_bindings[i].to;
							console.log("new binding : "+cluster_from+" -> "+cluster_to);
							commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
									ncbb++;
									console.log(outmsg);
									
									if(ncbb == new_bindings.length) {

										res.header("Access-Control-Allow-Origin", "*");
										res.send(commands_manager.topologies);

									}

							}, commands_manager);
						};
					}
				});
			};
		} else {


			//create new operators and bindings
			for(var i = 0; i < new_operators.length; i++){
			     
			      	  //create operator
				      var uids = [];
				      if(!new_operators[i].workers)
				          new_operators[i].workers = 1;
				         
				      if(!new_operators[i].automatic)
				      	  new_operators[i].automatic = true;
				      
				      for(var w = 0; w < new_operators[i].workers.length; w++){
				          uids.push(commands_manager.generate_worker_uid());
				      }
				      var nodes_run = 0;
				      var node = commands_manager.find_host(commands_manager, function(node_index, index){
				      	  
				      	  var node = commands_manager.N.nodes[node_index];
				          var new_cid = commands_manager.generate_operator_cid();
					      //function(node, new_cid, script, uids, automatic, to_spawn, alias, self, cb)

					      console.log("RUN OPERATOR = "+new_cid);
					      commands_manager.run_operator(node, new_cid, new_operators[index].script,
					      								uids, new_operators[index].automatic, 
					      								new_operators[index].workers.length, 
					      								new_operators[index].id, 
					      								commands_manager, function(outmsg){
					      	  console.log(outmsg); 	     	  
					      	  nodes_run++;
					      	  //if every operator is ran
					      	  if(nodes_run === new_operators.length){

					      	  	 //GET OLD connections between clusters AND UNBIND THEM
					      	  	 var to_unbind = [];
					 				for (var i = 0; i < oldTopology.bindings.length; i++) {
										var cluster_from = oldTopology.bindings[i].from;
										var cluster_to = oldTopology.bindings[i].to;
										if(!containBinding(topology.topology.bindings, cluster_from, cluster_to)) {
											to_unbind.push(oldTopology.bindings[i]);
										}
								};

								var new_bindings = [];
								for(var i=0; i < topology.topology.bindings.length; i++) {
									var new_cluster_from = topology.topology.bindings[i].from;
									var new_cluster_to = topology.topology.bindings[i].to;
									//if not contained add new binding
									if(!containBinding(oldTopology.bindings, new_cluster_from, new_cluster_to)) {
										new_bindings.push(topology.topology.bindings[i]);			 
									}
								}

								 console.log(new_bindings);
					      	  	 console.log("UNBIND OLD CONNECTIONS");
					      	  	 if(to_unbind.length == 0) {
					      	  	 		 console.log("NOTHING TO UNBIND");
					      	  	 		 var ncbb = 0;
					      	  	 		 for (var i = 0; i < new_bindings.length; i++) {
												var cluster_from = new_bindings[i].from;
												var cluster_to = new_bindings[i].to;
												console.log("new binding : "+cluster_from+" -> "+cluster_to);
												commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
														console.log(outmsg);
														
							                            ncbb++;
							                            if(ncbb == new_bindings.length) {
							                            	res.header("Access-Control-Allow-Origin", "*");
															res.send(commands_manager.topologies);
							                            }

												}, commands_manager);	
											}	
														
					      	  	 }


					      	  	 var ncb = 0;
								 for (var i = 0; i < to_unbind.length; i++) {
									
									var cluster_from = to_unbind[i].from;
									var cluster_to = to_unbind[i].to;
									console.log("unbinding: "+cluster_from+" => "+cluster_to);
									commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function(outmsg) {
										console.log(outmsg);
										ncb++;
										if(ncb == to_unbind.length) {
											//create new bindings
											var ncbb = 0;
											console.log("NEW BINDINGS");
											for (var i = 0; i < new_bindings.length; i++) {
												var cluster_from = new_bindings[i].from;
												var cluster_to = new_bindings[i].to;
												console.log("new binding : "+cluster_from+" -> "+cluster_to);
												commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
														console.log(outmsg);														

							                            ncbb++;
							                            if(ncbb == new_bindings.length) {
							                            	res.header("Access-Control-Allow-Origin", "*");
															res.send(commands_manager.topologies);
							                            }

												}, commands_manager);
											};
										}
									});
								 };
					      	  }
				          });
				      }, i);
			  	}
			  } 
	} else {

		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("Invalid topology schema"));	
	}
}


