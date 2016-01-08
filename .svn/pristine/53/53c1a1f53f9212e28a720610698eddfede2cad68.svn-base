exports.getTopologyWorkers = function(req, res, next) {

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


	var jsonResponse = {};	
	node.channel.koala_node.get_clusters(function(clusters) {	
			var nw = clusters[oid].workers.length;		
			for (var i = 0; i < clusters.length; i++) {
				var curCluster = clusters[i];
				if(clusters[i] != null && clusters[i].cid == oid) {
					
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
		});
}



exports.getTopologyOperatorWorker = function(req, res, next) {

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
			messages: msg.messages_sent,
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


exports.createTopologyWorker = function(req, res, next) {

	console.log("CREATE TOPOLOGY WORKER");
	var tid = req.params.tid;
	var oid = req.params.oid;
	if(isNaN(tid) || isNaN(oid)) {
		console.log("ERROR 4");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidArgumentError("tid and oid must be numbers"));
	}


	var topology = filter(commands_manager.topologies.topologies, function(element) {
		return element.tid == tid;
	});

	if(topology == undefined) {
		console.log("ERROR 3");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No topology with tid = "+tid));
	}

	var operator = filter(topology.operators, function(element) {
		return element.oid == oid;
	});	


	if(operator == undefined) {
		console.log("ERROR 1");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.ResourceNotFoundError("No operator with oid = "+oid));
	}


	if(req.body == undefined) {
		console.log("ERROR 2");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("No worker schema provided"));
	}


	var worker = JSON.parse(req.body);
	if(checkSchema(worker, "worker")) {

			console.log("RUNNING PROCESS = "+worker.worker.script);
			console.log("NODES DAI"+node);
			node.channel.koala_node.run_cluster(oid, worker.worker.script, 1, [worker.worker.wid], false, "", commands_manager, function(){
                            console.log("new worker started in cluster : " + oid);
                            var newWorker = {
								wid: worker.worker.wid,
								href: "/topologies/example/operators/"+oid+"/workers/"+worker.worker.wid,
					            operator: "/topologies/example/operators/"+oid,
					            //TODO: ADD   UPTIME, MESSAGES, REQ-RES-STATION
							}; 
							commands_manager.topologies.topologies[0].operators[oid].workers.push(newWorker);
                            // operator.workers.push({wid: worker.worker.wid, href: "/topologies"})
            			console.log("ERROR 7");
            			res.header("Access-Control-Allow-Origin", "*");
            			res.send(commands_manager.topologies);

            });
		
	} else {
		console.log("ERROR 6");
		res.header("Access-Control-Allow-Origin", "*");
		return next(new restify.InvalidContentError("Invalid worker schema"));	
 	}

}





exports.deleteTopologyOperatorWorker = function(req, res, next) {

	console.log("delete worker");
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

			    		
	console.log("UNBIND WORKER "+wid+ "in operator "+oid);

	node.channel.koala_node.unbind_worker(oid, wid, function(outmsg) {

		console.log("WORKER "+wid+" KILLED");
		console.log(outmsg);
		del(operator.workers, function(element) {
			return element.wid == wid;
		});

		res.header("Access-Control-Allow-Origin", "*");
		res.send(commands_manager.topologies);
	});
     	
}

