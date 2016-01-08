var debugMod = require('debug')
var log = {
	root: debugMod('wls:root'),
	api: debugMod('wls:api')
}

var debug = false;


var restify = require('restify');
var fs = require('fs');
var port, commands_manager, node;
var tv4 = require('tv4');
var validate = require('json-schema').validate;
var server = restify.createServer({ 
	name: 'root_rest_api',
	version: '1.0.0'
});
var schemas = require('../schemas.js');
var util    = require('util');
var sys = require('sys')
var exec = require('child_process').exec;

server.use(restify.bodyParser({ mapParams: false }));

/* 
	Retrieves the list of known Peers 
										*/
										
var getPeers = function( req, res ) {	
	var peers = commands_manager.N.nodes;
	var jsonResponse = {};
	jsonResponse["peers"] = [];
	for(var key in peers) {

		var curPeer = peers[key];
		var remote = curPeer["remote"];



		var peerObj = {};
		if(remote) {
			peerObj = {
				pid: curPeer['uid'],
				alias: curPeer['alias'],
				remote: true
			}
			if(!containsPeer(jsonResponse["peers"], peerObj.alias)) {
				jsonResponse["peers"].push(peerObj);
			}
		} else {
			peerObj = {
				pid: curPeer['uid'],
				alias: curPeer['alias'],
				host: curPeer['host'],
				port: curPeer['port'],
				remote: false
				//TODO
				// cpu_usage: 
			};
			if(!containsPeer(jsonResponse["peers"], peerObj.host)) {
				jsonResponse["peers"].push(peerObj);
			}
		}
	}

	res.header("Access-Control-Allow-Origin", "*");
	res.send(jsonResponse);
}



/*
	Deletes the given value from the array
*/
var clean = function(array, deleteValue) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == deleteValue) {         
      array.splice(i, 1);
      i--;
    }
  }
  return array;
};


/*
	Update the collection with the given script
*/
function update(collection, script, predicate) {

	var result;
    var length = collection.length;
    for(var j = 0; j < length; j++)
    {
        if(predicate(collection[j]))
        {
        	 collection[j].script = script;
        }
    }

    return collection;
}


/*
	Select the element according to the predicate function
*/
function filter(collection, predicate)
{
    var result;
    var length = collection.length;

    for(var key in collection)
    {
        if(predicate(collection[key]))
        {
             result = collection[key];
        }
    }
    return result;
}


/*
	Get index of element of collection
*/
function getIndex(collection, predicate)
{
    var result;
    var index = 0;
    var length = collection.length;

    for(var j = 0; j < length; j++)
    {
        if(predicate(collection[j]))
        {
             index = j;
        }
    }

    return index;
}


/*
	Checks whether the collection contain the given binding
*/
function containBinding(collection, from, to) {
	//log.api("contain binding");
	//log.api(collection);
	if(collection.length > 0) {
		var length = collection.length;
	    for(var j = 0; j < length; j++) {
	    	if(collection[j].from == from && collection[j].to == to)
	        {
	            return true;
	        }
	    }
	}
    return false;
}


function containsOperator(collection, operator) {

	var length = collection.length;
    for(var j = 0; j < length; j++) {
    	log.api("checking "+collection[j].oid);
    	if(collection[j].oid == operator.oid)
        {
            return true;
        }
    }
    return false;
}

function containsPeer(peers, host) {
			
	var peer = filter(peers, function(element) {
		return element.host == host;
	});

	if(peer == undefined) {
		return false;
	}
	return true;

}

function containsPeerRemote(peers, alias) {
			
	var peer = filter(peers, function(element) {
		return element.alias == alias;
	});

	if(peer) {
		return true;
	}
	return false;

}

/*
	Checks whether the element is contained in the collection
*/
function contains(collection, element) {

	for (var i = 0; i < collection.length; i++) {
		if(collection[i] == element) {
			return true;
		}
	}
	return false;
}

/*
	Subsistutes the element that satisfies the given condition
*/
function subst(collection, predicate, element) {

	var result;
    var length = collection.length;

    for(var j = 0; j < length; j++)
    {
        if(predicate(collection[j]))
        {
             collection[j] = element;
        }
    }
    return collection;
}

/*
	Deletes the element that satisfies the given condition
*/
function del(collection, f) {

	var result;
	var toRemove = [];
    var length = collection.length;
    for(var j = 0; j < length; j++)
    {
    	log.api("REMOVING FROM");
    	log.api(collection[j]);
        if(f(collection[j]))
        {	
        	toRemove.push(j);
        }
    }


    log.api("REMOVING INDICES ");
    log.api(toRemove);

    log.api("BEFORE");
    log.api(collection);
    for (var i = toRemove.length - 1; i >= 0; i--) {
    	collection.splice(toRemove[i], 1);
    };


    log.api("AFTER");
    log.api(collection);
    return collection;
}


function clean(collection) {
	var toRemove = [];
	for (var i = collection.length - 1; i >= 0; i--) {
		if(collection[j] == undefined) {
			toRemove.push(j);
		}
	};

	for (var i = toRemove.length - 1; i >= 0; i--) {
		collection.splice(toRemove[i], 1);
	};
}


function delNode(collection, f) {

	var result;
	var toRemove = [];
    for(var key in collection)
    {
        if(f(collection[key]))
        {	
        	delete collection[key];
        }
    }

	
    return collection;
}





/*
	Checks the format of the schema
*/
function checkSchema(obj, type) {

	var schema = null;
	if(type == "script") {
		schema = schemas.scriptSchema;
	} else if(type == "topology") {
		schema = schemas.topologySchema;
	} else if(type == "operator") {
		schema = schemas.operatorSchema;
	} else if(type == "worker") {
		schema = schemas.workerSchema;
	} else if(type == "bindings") {
		schema = schemas.bindingsSchema;
	} else if(type == "peer") {
		log.api("checking peer");
		schema = schemas.peerSchema;
	}
	var valid = tv4.validate(obj, schema);
	return valid;
}


var getPeer = function(req, res, next) {

	var pid = req.params.pid;
	var peers = commands_manager.N.nodes;

	var peer = filter(peers, function(element) {
		return element.uid == pid;
	});

	log.api(commands_manager.N.nodes);

	var jsonResponse = {};
	if(peer != undefined) {
		var peerJson = {
			pid: peer.uid,
			URI: peer.host
		};
	} else {
		return next(new restify.ResourceNotFoundError("No peer with pid = "+pid));
	}

	jsonResponse["peer"] = peerJson;
	res.header("Access-Control-Allow-Origin", "*");
	res.send(jsonResponse);
}


function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}


var deletePeerFromId = function(req, res, next) {

	var pid = req.params.pid;
	log.api(commands_manager.N.nodes);
	log.api("DELETING NODE = "+pid);
	

	if(isNumber(pid)) {
		
		var peer = filter(commands_manager.N.nodes, function(element) {
			return element.uid == pid;
		});

		if(peer == undefined) {
			return next(new restify.ResourceNotFoundError("No peer with pid = "+pid));
		}

		del(commands_manager.N.nodes, function(element) {
			return element.uid == pid;
		});

		log.api(commands_manager.N.nodes);
		
		res.header("Access-Control-Allow-Origin", "*");
		res.send({"status": "ok"});
	} else {

		log.api("DELETING PEER FROM HOST");
		var peer = filter(commands_manager.N.nodes, function(element) {
			return element.host == pid;
		});

		if(peer == undefined) {
			return next(new restify.ResourceNotFoundError("No peer with host = "+pid));
		}

		delNode(commands_manager.N.nodes, function(element) {
			return element.host == pid;
		});

		clean(commands_manager.N.nodes);


		res.header("Access-Control-Allow-Origin", "*");
		res.send({"status": "ok"});

	}


	
}


var deletePeerFromURI = function(req, res, next) {

	var URI = req.params.URI;
	log.api("DELETING NODE = "+pid);
	var peer = filter(commands_manager.N.nodes, function(element) {
		return element.uid == pid;
	});

	if(peer == undefined) {
		return next(new restify.ResourceNotFoundError("No peer with pid = "+pid));
	}

	del(commands_manager.N.nodes, function(element) {
		return element.uid == pid;
	});
	
	res.header("Access-Control-Allow-Origin", "*");
	res.send({"status": "ok"});
}


var createPeer = function(req, res, next) {

	var peer = JSON.parse(req.body);
	log.api("CHECKING ");
	log.api(peer);
	if(checkSchema(peer, "peer")){
		//CREATE PEERS ARRAY IN CM
		var peers = commands_manager.N.nodes;
		var jsonResponse = {};
		jsonResponse["peers"] = [];
		for(var key in peers) {
			var curPeer = peers[key];
			var peerObj = {
				pid: curPeer['uid'],
				host: curPeer['host'],
				port: curPeer['port']
				//TODO
				// cpu_usage: 
			};
			log.api("checking = "+peerObj.host);
			if(!containsPeer(jsonResponse["peers"], peerObj.host)) {
				jsonResponse["peers"].push(peerObj);
			}
		}
		var pid = commands_manager.G.node_uid++;
		peer.peer["pid"] = pid;
		jsonResponse["peers"].push({"pid": pid, "host": peer.peer["host"], "port": peer.peer["port"], "remote": false});
		commands_manager.N.nodes.push({"uid": pid, "host": peer.peer["host"], "port": peer.peer["port"], "remote" : false});
		// res.header("Access-Control-Allow-Origin", "*");
		res.send(jsonResponse);

	} else {
		return next(new restify.InvalidContentError("Invalid peer schema"));	
	}

}



/*
	Retrieves the list of topologies started from this peer
															*/
var getTopologies = function( req, res ) {


	var topology = commands_manager.topologies.topologies[0];
	if(topology == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		res.send(commands_manager.topologies);
		return;
	}

	var operators = [];
	var uids = [];
	var ncb = 0;
	var nw = 0;
	var jsonResponse = {};
	log.api(commands_manager.clusters);
	
	node.channel.koala_node.get_clusters(function(clusters, i) {

			if(clusters.length == 0) {
				var nr = 0;
				//compute number of remote nodes
				for (var key in commands_manager.clusters) {
					var curCluster = commands_manager.clusters[key];
					if(curCluster.nodes[0].remote) {
						nr++;
					}
				}


				var nb = 0;
				for (var key in commands_manager.clusters) {
					var curCluster = commands_manager.clusters[key];	

					if(curCluster.nodes[0].remote) {
						var operator =  {
							id: curCluster.cid,
							oid: curCluster.cid,
							alias: curCluster.alias,
							peer: node.host,
							script: curCluster.script,
							href: "/topologies/1/operators/"+curCluster.cid,
							remote: true
						};


						operator.workers = [];
						operator.cpu_usage = 0;
						operators.push(operator);
						curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers, cid) {
							nb++;
							
							var operator = filter(operators, function(element) {
										return element.oid == cid;
									});

							for (var ow = 0; ow < workers.length; ow++) {
								var worker = workers[ow];
								var newWorker = {
									wid: worker.uid,
									messages: {
												"incoming": worker.messages.incoming,
												"outoging": worker.messages.outgoing
									},
									href: "/topologies/1/operators/"+cid+"/workers/"+worker.uid,
									operator: "/topologies/1/operators/"+cid
								}
								operator.workers.push(newWorker);
							};

							if(nb == nr) {
								res.header("Access-Control-Allow-Origin", "*");
								topology.operators = operators;
								jsonResponse["topologies"] = commands_manager.topologies.topologies;
								res.send(jsonResponse);
							}
						});
					}
				};

				if(nr == 0) {
					res.header("Access-Control-Allow-Origin", "*");
					topology.operators = operators;
					jsonResponse["topologies"] = commands_manager.topologies.topologies;
					res.send(jsonResponse);
				}
			} else {
				for (var i = 0; i < clusters.length; i++) {
					if(clusters[i] != null) {
						
						var curCluster = clusters[i];
					
						var operator = {
							id: curCluster.cid,
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
						
						nw += curCluster.workers.length;
						for (var j = 0; j < curCluster.workers.length; j++) {
							node.channel.koala_node.get_worker(curCluster.cid, curCluster.workers[j].uid, function(msg) {
							
								var operator = filter(operators, function(element) {
									return element.oid == msg.cid;
								});
								
								if(!operator)
									return

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

									//compute number of remote clusters
									var nr = 0;
									for (var key in commands_manager.clusters) {
										var curCluster = commands_manager.clusters[key];	
										if(curCluster.nodes[0].remote) {
											nr++;
										}
									}


									var nb = 0;
									for (var key in commands_manager.clusters) {
										var curCluster = commands_manager.clusters[key];	
										if(curCluster.nodes[0].remote) {
											
											var operator =  {
												id: curCluster.cid,
												oid: curCluster.cid,
												alias: curCluster.alias,
												peer: node.host,
												script: curCluster.script,
												href: "/topologies/1/operators/"+curCluster.cid,
												remote: true
											};

											operator.workers = [];
											operator.cpu_usage = 0;
											operators.push(operator);
											curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers, cid) {
												nb++;	
												var operator = filter(operators, function(element) {
													return element.oid == cid;
												});											
												for (var ow = 0; ow < workers.length; ow++) {
													var worker = workers[ow];
													var newWorker = {
														wid: worker.uid,
														messages: {
															"incoming": worker.messages.incoming,
															"outoging": worker.messages.outgoing
														},
														href: "/topologies/1/operators/"+cid+"/workers/"+worker.uid,
														operator: "/topologies/1/operators/"+cid
													}
													operator.workers.push(newWorker);
												};

												if(nb == nr) {
													res.header("Access-Control-Allow-Origin", "*");
													topology.operators = operators;
													jsonResponse["topologies"] = commands_manager.topologies.topologies;
													res.send(jsonResponse);
												}
											});
										}
									};

									if(nr == 0) {
										res.header("Access-Control-Allow-Origin", "*");
										topology.operators = operators;
										jsonResponse["topologies"] = commands_manager.topologies.topologies;
										res.send(jsonResponse);
									}	
								}
							});
					};
				}
				};
			} //end of else
		
	}, node.uid);
}	



var getTopology = function(req,res, next) {
	var tid = req.params.tid;
	if(isNaN(tid)) {
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}

	var topologies = commands_manager.topologies.topologies;
	var topology = filter(topologies, function(element) {
		return element.tid == tid;
	});
	
	var jsonResponse = {};
	var operators = [];

	if(topology != undefined) {

			node.channel.koala_node.get_clusters(function(clusters) {

				if(clusters.length == 0) {
					log.api("GET REMOTES");
					//compute number of remote clusters
					var nr = 0;
					for (var key in commands_manager.clusters) {
						var curCluster = commands_manager.clusters[key];	
						if(curCluster.nodes[0].remote) {
							nr++;
						}
					}

					if(nr == 0) {
							topology.operators = operators;
							res.header("Access-Control-Allow-Origin", "*");
							jsonResponse["topology"] = topology;
							res.send(jsonResponse);
					} else {

						var nb = 0;
						for (var key in commands_manager.clusters) {
							var curCluster = commands_manager.clusters[key];	
							if(curCluster.nodes[0].remote) {
									
								var operator =  {
									id: curCluster.cid,
									oid: curCluster.cid,
									alias: curCluster.alias,
									peer: node.host,
									script: curCluster.script,
									href: "/topologies/1/operators/"+curCluster.cid,
									remote: true
								};

								operator.workers = [];
								operator.cpu_usage = 0;
								operators.push(operator);
								log.api("GET WORKERS");
								curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers, cid) {
									log.api("CID = "+cid);
									log.api(commands_manager.clusters)
									var operator = filter(operators, function(element) {
										return element.oid == cid;
									});

									log.api("OPERATOR");
									log.api(operator);

									nb++;												
									for (var ow = 0; ow < workers.length; ow++) {
										var worker = workers[ow];
										var newWorker = {
											wid: worker.uid,
											messages: {
												"incoming": worker.messages.incoming,
												"outoging": worker.messages.outgoing
											},
											href: "/topologies/1/operators/"+cid+"/workers/"+worker.uid,
											operator: "/topologies/1/operators/"+cid
										}
										operator.workers.push(newWorker);
									};

									if(nb == nr) {
										topology.operators = operators;
										res.header("Access-Control-Allow-Origin", "*");
										jsonResponse["topology"] = topology;
										res.send(jsonResponse);
									}
								});
							}
						};
					}
				} else {
				//get number of workers to return
				log.api("CLUSTERS");
				log.api(clusters);

				var nw = 0;
				for (var key in clusters) {
					if(clusters[key] != null) {
						for (var j = 0; j < clusters[key].workers.length ; j++) {
							nw++;
						};
					}
				}
				
				var ncb = 0;
				for (var key in clusters) {
					if(clusters[key] != null) {
						var curCluster = clusters[key];
						var operator = {
							id: curCluster.cid,
							oid: curCluster.cid,
							alias: curCluster.alias,
							peer: curCluster.workers[0].host,
							script: curCluster.script,
							remote: false,
							href: "/topologies/"+tid+"/operators/"+curCluster.cid
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

									log.api("GET REMOTES");
									//compute number of remote clusters
									var nr = 0;
									for (var key in commands_manager.clusters) {
										var curCluster = commands_manager.clusters[key];	
										if(curCluster.nodes[0].remote) {
											nr++;
										}
									}

									if(nr == 0) {
											topology.operators = operators;
											res.header("Access-Control-Allow-Origin", "*");
											jsonResponse["topology"] = topology;
											res.send(jsonResponse);
									} else {

										var nb = 0;
										for (var key in commands_manager.clusters) {
											var curCluster = commands_manager.clusters[key];	
											if(curCluster.nodes[0].remote) {
												var operator =  {
													id: curCluster.cid,
													oid: curCluster.cid,
													alias: curCluster.alias,
													peer: node.host,
													script: curCluster.script,
													href: "/topologies/1/operators/"+curCluster.cid,
													remote: true
												};

												operator.workers = [];
												operator.cpu_usage = 0;
												operators.push(operator);
												curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers, cid) {
													var operator = filter(operators, function(element) {
														return element.oid == cid;
													});
													nb++;												
													for (var ow = 0; ow < workers.length; ow++) {
														var worker = workers[ow];
														var newWorker = {
															wid: worker.uid,
															messages: {
																"incoming": worker.messages.incoming,
																"outoging": worker.messages.outgoing
															},
															href: "/topologies/1/operators/"+cid+"/workers/"+worker.uid,
															operator: "/topologies/1/operators/"+cid
														}
														operator.workers.push(newWorker);
													};

													if(nb == nr) {
														topology.operators = operators;
														res.header("Access-Control-Allow-Origin", "*");
														jsonResponse["topology"] = topology;
														res.send(jsonResponse);
													}
												});
											}
										};
									}
									
								}
							});
						};
					}
				};
			}

		});
		
		
	} else {
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}
	
}


var deleteTopology = function(req, res, next) {

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
				log.api(outmsg);
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



var createTopology = function(req, res, next) {

	//TODO: Add check json schema
	log.api("CREATE TOPOLOGY");
	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No topology schema provided"));
	}
	var topology = JSON.parse(req.body);
	if(checkSchema(topology, "topology")) {

	  	var nodes_run = 0;
		for(var i = 0; i < topology.topology.operators.length; i++){
			      //create operators
			      //log.api(i)
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
				      	  log.api(outmsg);
				      	     	  
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
				      	    	  		log.api(outmsg);
							      	    if(ncb == topology.topology.bindings.length) {
							      	    	res.header("Access-Control-Allow-Origin", "*");
											res.send(commands_manager.topologies);
							      	    }
				      	    	  		
				      	    	  		commands_manager.start_controller("", function(outmsg){
				      	    	  			log.api(outmsg);
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




var patchTopology = function(req, res, next) {

	log.api("PATCH TOPOLOGY");	
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

		log.api("NEW OPERATORS");
		log.api(new_operators);

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
							log.api("new binding : "+cluster_from+" -> "+cluster_to);
							commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
									ncbb++;
									log.api(outmsg);
									
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

					      log.api("RUN OPERATOR = "+new_cid);
					      commands_manager.run_operator(node, new_cid, new_operators[index].script,
					      								uids, new_operators[index].automatic, 
					      								new_operators[index].workers.length, 
					      								new_operators[index].id, 
					      								commands_manager, function(outmsg){
					      	  log.api(outmsg); 	     	  
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

								 log.api(new_bindings);
					      	  	 log.api("UNBIND OLD CONNECTIONS");
					      	  	 if(to_unbind.length == 0) {
					      	  	 		 log.api("NOTHING TO UNBIND");
					      	  	 		 var ncbb = 0;
					      	  	 		 for (var i = 0; i < new_bindings.length; i++) {
												var cluster_from = new_bindings[i].from;
												var cluster_to = new_bindings[i].to;
												log.api("new binding : "+cluster_from+" -> "+cluster_to);
												commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
														log.api(outmsg);
														
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
									log.api("unbinding: "+cluster_from+" => "+cluster_to);
									commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function(outmsg) {
										log.api(outmsg);
										ncb++;
										if(ncb == to_unbind.length) {
											//create new bindings
											var ncbb = 0;
											log.api("NEW BINDINGS");
											for (var i = 0; i < new_bindings.length; i++) {
												var cluster_from = new_bindings[i].from;
												var cluster_to = new_bindings[i].to;
												log.api("new binding : "+cluster_from+" -> "+cluster_to);
												commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
														log.api(outmsg);														

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




var getTopologyOperators = function(req,res, next) {

	var tid = req.params.tid;
	if(isNaN(tid)) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}

	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		res.header("Access-Control-Allow-Origin", "*");

		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}


	var jsonResponse = {};
	var operators = [];
	
	node.channel.koala_node.get_clusters(function(clusters) {
		
			if(clusters.length == 0) {	
				//compute number of remote clusters
				var nr = 0;
				for (var key in commands_manager.clusters) {
					var curCluster = commands_manager.clusters[key];	
					if(curCluster.nodes[0].remote) {
						nr++;
					}
				}

				if(nr == 0) {
						topology.operators = operators;
						res.header("Access-Control-Allow-Origin", "*");
						jsonResponse["operators"] = operators;
						res.send(jsonResponse);
				} else {


					log.api("CLUSTERS");
					log.api(commands_manager.clusters)
					var nb = 0;
					for (var key in commands_manager.clusters) {

						var curCluster = commands_manager.clusters[key];	
						if(curCluster.nodes[0].remote) {
							
							var operator =  {
								id: curCluster.cid,
								oid: curCluster.cid,
								alias: curCluster.alias,
								peer: node.host,
								script: curCluster.script,
								href: "/topologies/1/operators/"+curCluster.cid,
								remote: true
							};

							operator.workers = [];
							operator.cpu_usage = 0;
							operators.push(operator);
							log.api("GET WORKERS OF "+curCluster.cid)
							curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers, cid) {
								log.api("cid =- "+cid);
								var operator = filter(operators, function(element) {
									return element.oid == cid;
								});
								nb++;												
								log.api(workers);
								for (var ow = 0; ow < workers.length; ow++) {
									var worker = workers[ow];
									var newWorker = {
										wid: worker.uid,
										messages: {
											"incoming": worker.messages.incoming,
											"outoging": worker.messages.outgoing
										},
										href: "/topologies/1/operators/"+cid+"/workers/"+worker.uid,
										operator: "/topologies/1/operators/"+cid
									}

									operator.workers.push(newWorker);
								};
								log.api("pushing operator");
								
								if(nb == nr) {
									topology.operators = operators;
									res.header("Access-Control-Allow-Origin", "*");
									jsonResponse["operators"] = operators;
									res.send(jsonResponse);
								}
							});
						}
					};
				}

			} else {


			//get number of workers to return
			var nw = 0;
			for (var i = 0; i < clusters.length; i++) {
				if(clusters[i] != null) {
					for (var j = 0; j < clusters[i].workers.length ; j++) {
						nw++;
					};
				}
			}
	
			for (var i = 0; i < clusters.length; i++) {
				if(clusters[i] != null) {
					var curCluster = clusters[i];
					var operator = {
						id: curCluster.cid,
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

								//compute number of remote clusters
									var nr = 0;
									for (var key in commands_manager.clusters) {

										var curCluster = commands_manager.clusters[key];	
										if(curCluster.nodes[0].remote) {
											nr++;
										}
									}

									if(nr == 0) {
											topology.operators = operators;
											res.header("Access-Control-Allow-Origin", "*");
											jsonResponse["operators"] = operators;
											res.send(jsonResponse);
									} else {

										var nb = 0;
										for (var key in commands_manager.clusters) {
											var curCluster = commands_manager.clusters[key];	
											if(curCluster.nodes[0].remote) {
												
												var operator =  {
													id: curCluster.cid,
													oid: curCluster.cid,
													alias: curCluster.alias,
													peer: node.host,
													script: curCluster.script,
													href: "/topologies/1/operators/"+curCluster.cid,
													remote: true
												};

												operator.workers = [];
												operator.cpu_usage = 0;
												curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers) {
													nb++;												
													for (var ow = 0; ow < workers.length; ow++) {
														var worker = workers[ow];
														var newWorker = {
															wid: worker.uid,
															messages: {
																"incoming": worker.messages.incoming,
																"outoging": worker.messages.outgoing
															},
															href: "/topologies/1/operators/"+curCluster.cid+"/workers/"+worker.uid,
															operator: "/topologies/1/operators/"+curCluster.cid
														}
														operator.workers.push(newWorker);
													};

													operators.push(operator);
													if(nb == nr) {
														topology.operators = operators;
														res.header("Access-Control-Allow-Origin", "*");
														jsonResponse["operators"] = operators;
														res.send(jsonResponse);
													}
												});
											}
										};
									}
							}
						});
					
					};
				}
			};
		}
	});
}




var getTopologyOperator = function(req,res, next) {

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

	// var node = filter(commands_manager.N.nodes, function(element) {
	// 	return element.host == 
	// });


	sent = false;
	log.api("NODE HOST");
	var host = node.host;
	node.channel.koala_node.get_clusters(function(clusters) {

			log.api("clusters");
			log.api(clusters);
			if(clusters.length == 0) {
				//compute number of remote clusters
				log.api("CLUSTERS");
				log.api(commands_manager.clusters);


				var nr = 0;
				for (var key in commands_manager.clusters) {

					var curCluster = commands_manager.clusters[key];	
					if(curCluster.nodes[0].remote && curCluster.cid == oid) {
						nr++;
					}
				}



				var nb = 0;
				for (var key in commands_manager.clusters) {
					var curCluster = commands_manager.clusters[key];	
					if(curCluster.nodes[0].remote && curCluster.cid == oid) {
						
						var operator =  {
							id: curCluster.cid,
							oid: curCluster.cid,
							alias: curCluster.alias,
							peer: host,
							script: curCluster.script,
							href: "/topologies/1/operators/"+curCluster.cid,
							remote: true
						};

						operator.workers = [];
						operator.cpu_usage = 0;
						curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers) {
							nb++;												
							for (var ow = 0; ow < workers.length; ow++) {
								var worker = workers[ow];
								var newWorker = {
									wid: worker.uid,
									messages: {
										"incoming": worker.messages.incoming,
										"outoging": worker.messages.outgoing
									},
									href: "/topologies/1/operators/"+curCluster.cid+"/workers/"+worker.uid,
									operator: "/topologies/1/operators/"+curCluster.cid
								}
								operator.workers.push(newWorker);
							};

							if(nb == nr) {
								res.header("Access-Control-Allow-Origin", "*");
								jsonResponse["operator"] = operator;
								res.send(jsonResponse);
							}
						});
					}
				};
			} else {
			
			var nw = 0;
			for (var i = 0; i < clusters.length; i++) {
				if(clusters[i] != null && clusters[i].cid == oid) {
				nw += clusters[i].workers.length;
				var curCluster = clusters[i];
				var operator = {
					id: curCluster.cid,
					oid: curCluster.cid,
					alias: curCluster.alias,
					peer: curCluster.workers[0].host,
					script: curCluster.script,
					remote: false
				}

				var ncb = 0;

				var workers = [];
				operator.workers = [];
				operator.cpu_usage = 0;
				for (var j = 0; j < curCluster.workers.length; j++) {
					
					var node = filter(commands_manager.N.nodes, function(element) {
						return element.host == curCluster.workers[0].host;
					});	
					
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
						operator.cpu_usage += msg.cpu_usage;
						operator.workers.push(newWorker);
						ncb++;
						if(ncb == nw && !sent) {
							sent = true;
							log.api("settted");
							// res.removeHeader("Access-Control-Allow-Origin");
							res.header("Access-Control-Allow-Origin", "*");
							jsonResponse["operator"] = operator;
							res.send(jsonResponse);
						}

					});
				};
				
			}
		};
	}
	});



}



var createTopologyOperator = function(req,res, next) {


	var tid = req.params.tid;
	if(isNaN(tid)) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidArgumentError("tid must be a number"));
	}



	if(commands_manager.topologies.topologies.length == 0) {
		commands_manager.topologies.topologies = [];
		var mainTopology = {
			tid: 1,
			operators: []
		}
		commands_manager.topologies.topologies.push(mainTopology);
	}


	var topology = filter(commands_manager.topologies.topologies, function(element) {
				return element.tid == tid;
			});

	if(topology == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	if(req.body == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("No operator schema provided"));
	}

	var operator;
	try {
		operator = JSON.parse(req.body);
	} catch(e) {
		log.api(e);
	}


	// log.api(operator);
	if(checkSchema(operator, "operator")) {
		//get node where to run the operator
		
		//hack to create operators on neha
		var node = filter(commands_manager.N.nodes, function(element) {
			return element.host == "neha.inf.unisi.ch";
		});

		var operators = [];
		var jsonResponse = {};
		
		if(debug)
			node.uid = 1;

		log.api("RUN CLUSTER ON NODE "+node.uid);
		commands_manager.run_new_cluster(["runc", operator.operator.script, node.uid+"", operator.operator.workers], function(outmsg) {
			
			if(outmsg.split(" ")[0] == "cluster") {
			  	//UPDATE TOPOLOGY
			  	log.api("RETURNING CLUSTERS");
			   	node.channel.koala_node.get_clusters(function(clusters) {
					log.api("NODE CLUSTERS");
					log.api(clusters);
					
					for (var i = 0; i < clusters.length; i++) {
						if(clusters[i] != null) {
							var curCluster = clusters[i];
							var operator = {
								id: curCluster.cid,
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
					//log.api("RETURNING HEADERS");
					res.header("Access-Control-Allow-Origin", "*");
					res.send(operator);
					//res.send(jsonResponse);
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


var updateTopologyOperatorScript = function(req,res, next) {

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

				log.api(outmsg);
				//change topology structure
				var topology = filter(commands_manager.topologies.topologies, function(element) {
				 	return element.tid == tid;
				});

				update(topology.operators, script.script.name, function(element) {
					return element.oid == oid;
				});

				// log.api(commands_manager.topologies.topologies);
				res.header("Access-Control-Allow-Origin", "*");
				res.send(commands_manager.topologies);
		});

	 } else {
		return next(new restify.InvalidContentError("Invalid script schema"));	
	}

}




var updateTopologyOperatorBindings = function(req, res, next) {

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
					log.api("pushing = "+i);
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
				log.api("unbinding : "+cluster_from+" -> "+cluster_to);
				commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function() {
					log.api("unbinded : ");
					ncb++;
					log.api(ncb);
					if(ncb == to_unbind.length) {
						for (var i = 0; i < new_bindings.length; i++) {
							var cluster_from = new_bindings[i].from;
							var cluster_to = new_bindings[i].to;
							log.api("new binding : "+cluster_from+" -> "+cluster_to);
							commands_manager.unbind_clusters(["bindc", cluster_from, cluster_to], function() {
									log.api("binded");
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

var updateTopologyBindings = function(req,res, next) {

	log.api("update TOPOLOGY node bindings");

	var tid = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}


	if(req.body == undefined) {
		return next(new restify.InvalidContentError("No bindings schema provided"));
	}
	var bindings = JSON.parse(req.body);	
	if(checkSchema(bindings, "bindings") && checkOperators(bindings.bindings)) {


		var topology = filter(commands_manager.topologies.topologies, function(element) {
			return element.tid == tid;
		});

		if(topology == undefined) {
			res.header("Access-Control-Allow-Origin", "*");
			return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
		}

		var operator = filter(commands_manager.clusters, function(element) {
			return element.cid == oid;
		});

		if(operator == undefined) {
			res.header("Access-Control-Allow-Origin", "*");
			return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
		}

		
		var ids = [];

		log.api("PERFORM NEW BINDING");
		log.api(bindings.bindings);

		if(!topology.bindings) {
			topology.bindings = [];
		}

		//check already existing bindings and remove them
		for(var i=0; i < bindings.bindings.length; i++) {
			var new_cluster_from = bindings.bindings[i].from;
			var new_cluster_to = bindings.bindings[i].to;
			log.api("checking : "+new_cluster_from+" => "+new_cluster_to);
			if(containBinding(topology.bindings, new_cluster_from, new_cluster_to)) {
				ids.push(getIndex(bindings.bindings, function(element) {
					return element.from == new_cluster_from && element.to == new_cluster_to;
				}));				
			} 
		}

		log.api("CREATE NEW BINDINGS");

		//delete already existing bindings
		var new_bindings = [];
		for(var i=0; i < bindings.bindings.length; i++) {
			if(!contains(ids, i)) {
				log.api("pushing = "+i);
				new_bindings.push(bindings.bindings[i]);
			}
		}

		log.api("NEW BINDINGS");
		log.api(new_bindings);
	
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


			log.api("TO UNBIND = "+to_unbind.length);
			for (var i = 0; i < to_unbind.length; i++) {
				var cluster_from = topology.bindings[to_unbind[i]].from;
				var cluster_to = topology.bindings[to_unbind[i]].to;
				log.api("unbinding : "+cluster_from+" -> "+cluster_to);
				commands_manager.unbind_clusters(["unbindc", cluster_from, cluster_to], function(outmsg) {
					log.api("UNBOUND");
					log.api(outmsg);
					ncb++;
					log.api(ncb);
					if(ncb == to_unbind.length) {

						log.api("new BINDINGS");
						log.api(new_bindings)

						if(new_bindings.length == 0) {
							log.api("NO NEW BINDINGS");
							res.header("Access-Control-Allow-Origin", "*");
							res.send(commands_manager.topologies);
						}

						var ncbb = 0;
						for (var i = 0; i < new_bindings.length; i++) {

							var cluster_from = new_bindings[i].from;
							var cluster_to = new_bindings[i].to;

							if(cluster_from == oid || cluster_to == oid) {
								log.api("new binding : "+new_bindings[i].from+" -> "+new_bindings[i].to);
								log.api("not a new operator : "+cluster_from+" -> "+cluster_to);
								commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {

									log.api("BOUND "+cluster_from+" => "+cluster_to);
									log.api(outmsg);
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
						log.api("new binding qui : "+cluster_from+" -> "+cluster_to);

						commands_manager.bind_clusters(["bindc", cluster_from, cluster_to], function(outmsg) {
							log.api(outmsg);
							//log.api("BINDED EVERYTHING 1");
							ncb++;
							if(ncb == new_bindings.length) {
								//log.api("BINDED EVERYTHING 2");
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


var deleteTopologyOperator = function(req,res) {

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

	log.api("KILL OPERATOR = "+oid);
	commands_manager.kill_cluster(["killc", oid], function(outmsg) {

		log.api(outmsg);
		del(topology.operators, function(element) {
			return element.oid == oid;
		});

		res.header("Access-Control-Allow-Origin", "*");
		res.send(commands_manager.topologies);
	});

}



var getTopologyWorkers = function(req, res, next) {

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

	var operator = filter(topology.operators, function(element) {
		return element.oid == oid;
	});

	if(operator == undefined) {
		return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
	}

	var workers = [];
	var jsonResponse = {};	
	node.channel.koala_node.get_clusters(function(clusters) {	


			if(clusters.length == 0) {

				//compute number of remote clusters

				var nr = 0;
				for (var key in commands_manager.clusters) {

					var curCluster = commands_manager.clusters[key];	
					if(curCluster.nodes[0].remote && curCluster.cid == oid) {
						nr++;
					}
				}



				var nb = 0;
				for (var key in commands_manager.clusters) {
					var curCluster = commands_manager.clusters[key];	
					if(curCluster.nodes[0].remote && curCluster.cid == oid) {
						
						
						
						curCluster.nodes[0].channel.koala_remote.get_workers(curCluster.cid, function(workers) {
							nb++;												
							for (var ow = 0; ow < workers.length; ow++) {
								var worker = workers[ow];
								var newWorker = {
									wid: worker.uid,
									messages: {
										"incoming": worker.messages.incoming,
										"outoging": worker.messages.outgoing
									},
									href: "/topologies/1/operators/"+curCluster.cid+"/workers/"+worker.uid,
									operator: "/topologies/1/operators/"+curCluster.cid
								}
								workers.push(newWorker);
							};

							if(nb == nr) {
								res.header("Access-Control-Allow-Origin", "*");
								jsonResponse["workers"] = workers;
								res.send(jsonResponse);
							}
						});
					}
				};



			} else {


			var nw = clusters[oid].workers.length;		
			for(var key in clusters) {
				var curCluster = clusters[key];
				if(clusters[key] != null && clusters[key].cid == oid) {
					
					var workers = [];
					var ncb = 0;
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
							workers.push(newWorker);
							ncb++;
							if(ncb == nw) {
								res.header("Access-Control-Allow-Origin", "*");
								jsonResponse["workers"] = workers;
								res.send(jsonResponse);
							}
						});
						
					};
				}
			};
		}
		});

}



var getTopologyOperatorWorker = function(req, res, next) {

	var tid = req.params.tid;
	var oid = req.params.oid;
	var wid = req.params.wid;
	if(isNaN(tid) || isNaN(oid) || isNaN(wid)) {
		return next(new restify.InvalidArgumentError("tid, oid and wid must be numbers"));
	}


	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
			return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	var jsonResponse = {};	
	node.channel.koala_node.get_worker(oid, wid, function(msg) {

		var newWorker = {
			wid: msg.wid,
			messages: {
				incoming: msg.messages_received,
				outgoing: msg.messages_sent
			},
			req_res_ratio: msg.messages_received/msg.messages_sent,
			cpu_usage: msg.cpu_usage,
			uptime: msg.uptime,
			href: "/topologies/1/operators/"+msg.cid+"/workers/"+msg.wid,
			operator: "/topologies/1/operators/"+msg.cid
		}

		res.header("Access-Control-Allow-Origin", "*");
		jsonResponse["worker"] = newWorker;
		res.send(jsonResponse);
	});

}


var createTopologyWorker = function(req, res, next) {

	log.api("CREATE TOPOLOGY WORKER");
	var tid = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		log.api("ERROR 4");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}


	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		log.api("ERROR 3");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	var operator = filter(topology.operators, function(element) {
		return element.oid == oid;
	});	


	if(operator == undefined) {
		log.api("ERROR 1");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
	}


	if(req.body == undefined) {
		log.api("ERROR 2");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("No worker schema provided"));
	}


	var worker = JSON.parse(req.body);
	if(checkSchema(worker, "worker")) {

			log.api("RUNNING PROCESS = "+worker.worker.script);
			log.api("NODES DAI"+operator.peer);
			var node = filter(commands_manager.N.nodes, function(element) {
				return element.host == operator.peer;
			});

			node.channel.koala_node.run_cluster(oid, worker.worker.script, 1, [worker.worker.wid], false, "", commands_manager, function(){
                            log.api("new worker started in cluster : " + oid);
                            var newWorker = {
								wid: worker.worker.wid,
								href: "/topologies/1/operators/"+oid+"/workers/"+worker.worker.wid,
					            operator: "/topologies/1/operators/"+oid,
					            //TODO: ADD   UPTIME, MESSAGES, REQ-RES-STATION
							}; 
							commands_manager.topologies.topologies[0].operators[oid].workers.push(newWorker);
                            // operator.workers.push({wid: worker.worker.wid, href: "/topologies"})
            			res.header("Access-Control-Allow-Origin", "*");
            			res.send(commands_manager.topologies);

            });
		
	} else {
		log.api("ERROR 6");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("Invalid worker schema"));	
 	}

}





var deleteTopologyOperatorWorker = function(req, res, next) {

	log.api("delete worker");
	var tid = req.params.tid;								
	var oid = req.params.oid;
	var wid = req.params.wid;
	if(isNaN(tid) || isNaN(oid) || isNaN(wid)) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidArgumentError("tid, oid and wid must be numbers"));
	}

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



	var worker = filter(operator.workers, function(element) {
		return element.wid == wid;
	});
	
	if(worker == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No worker with wid = "+wid));
	}

			    		
	log.api("UNBIND WORKER "+wid+ "in operator "+oid);

	node.channel.koala_node.unbind_worker(oid, wid, function(outmsg) {

		log.api("WORKER "+wid+" KILLED");
		log.api(outmsg);
		del(operator.workers, function(element) {
			return element.wid == wid;
		});

		res.header("Access-Control-Allow-Origin", "*");
		res.send(commands_manager.topologies);
	});
     	
}




var createBrowserWorker = function(req, res, next) {

	var tid = req.params.tid;		
	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}


	var oid = req.params.oid;
	var operator = filter(topology.operators, function(element) {
		return element.oid == oid;
	});

	if(operator == undefined) {
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
	}


	var worker;
	try {
		worker = JSON.parse(req.body).worker;
	} catch(e) {
		log.api(e);
	}



	for(var key in commands_manager.clusters) {
		var curCluster = commands_manager.clusters[key];
		if(curCluster.cid == oid) {
			log.api("getting add_worker = "+worker.wid+" oid = "+oid);
			log.api(curCluster);
			log.api(curCluster.nodes[0]);
			curCluster.nodes[0].channel.koala_remote.add_worker(oid, [worker.wid], 1, function(workers) {
				log.api("GOT WORKERS");
				operator.workers = [];	
				for (var ow = 0; ow < workers.length; ow++) {
					var worker = workers[ow];
					var newWorker = {
							wid: worker.uid,
							href: "/topologies/1/operators/"+curCluster.cid+"/workers/"+worker.uid,
							operator: "/topologies/1/operators/"+curCluster.cid
					}
					operator.workers.push(newWorker);
				};

				res.header("Access-Control-Allow-Origin", "*");
				res.send(operator.workers);
			});
		}
	};


}


var getResources = function(req, res, next) {

	node.channel.koala_node.cpu_usage(node.uid, function(index, usage){
		
		var jsonResponse = {};
		jsonResponse["topologies"] = "/topologies";
		jsonResponse["peers"] = "/peers";
		jsonResponse["CPU usage"] = usage+"%";

		res.header("Access-Control-Allow-Origin", "*");
		res.send(jsonResponse);

	}); 
} 



/*******************
 *	  REST API     *
 *******************/


/*
	ROOT
*/
server.get('/', getResources); //DONE



/* 
	PEERS 
*/
server.get('/peers', getPeers); //DONE
server.post('/peers', createPeer); //DONE: Ask MASIAR
server.get('/peers/:pid', getPeer); //DONE
server.del('/peers/:pid', deletePeerFromId); //DONE: FIX kill_node 
server.del('/peers/:URI', deletePeerFromURI); //DONE: FIX kill_node



/* 
	TOPOLOGIES 
*/
server.get('/topologies', getTopologies); //DONE
server.post('/topologies', createTopology); //DONE
server.get('/topologies/:tid', getTopology); //DONE
server.del('/topologies/:tid', deleteTopology); //DONE
server.patch('/topologies/:tid', patchTopology);  //DOING


/* 
	OPERATORS 
*/
server.get('/topologies/:tid/operators', getTopologyOperators); //DONE
server.get('/topologies/:tid/operators/:oid', getTopologyOperator); //DONE
server.post('/topologies/:tid/operators', createTopologyOperator); //DONE
server.patch('/topologies/:tid/operators/:oid/script', updateTopologyOperatorScript); //DONE
server.patch('/topologies/:tid/operators/:oid/bindings', updateTopologyBindings); //DONE
server.del('/topologies/:tid/operators/:oid', deleteTopologyOperator); //DONE



/*

 	WORKERS

*/
server.get('/topologies/:tid/operators/:oid/workers', getTopologyWorkers); //DONE
server.post('/topologies/:tid/operators/:oid/workers', createTopologyWorker); //DONE
server.get('/topologies/:tid/operators/:oid/workers/:wid', getTopologyOperatorWorker); //DONE
server.del('/topologies/:tid/operators/:oid/workers/:wid', deleteTopologyOperatorWorker); //DONE
server.post('/topologies/:tid/operators/:oid/browsers', createBrowserWorker); //TODO


var RESTAPI = function(cm, p, n) {
	commands_manager = cm;
	port = p;
	node = n;
	server.listen(port, function() {
		log.root("REST API ROOT listening on port "+port);
	});

}


RESTAPI.prototype = {
	getResources: getResources,
	getPeers : getPeers,
	getPeer : getPeer,
	deletePeerFromId: deletePeerFromId,
	deletePeerFromURI : deletePeerFromURI,
	createPeer: createPeer,
	getTopologies : getTopologies,
	createTopology : createTopology,
	getTopology: getTopology,
	deleteTopology: deleteTopology,
	patchTopology: patchTopology,
	getTopologyOperator: getTopologyOperator,
	getTopologyOperators: getTopologyOperators,
	createTopologyOperator: createTopologyOperator,
	updateTopologyOperatorScript: updateTopologyOperatorScript,
	updateTopologyOperatorBindings: updateTopologyOperatorBindings,
	updateTopologyBindings: updateTopologyBindings,
	deleteTopologyOperator: deleteTopologyOperator,
	getTopologyWorkers: getTopologyWorkers,
	createTopologyWorker: createTopologyWorker,
	getTopologyOperatorWorker: getTopologyOperatorWorker,
	deleteTopologyOperatorWorker: deleteTopologyOperatorWorker,
	createBrowserWorker: createBrowserWorker
}


module.exports = RESTAPI


