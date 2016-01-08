exports.getPeers = function( req, res ) {	
	var peers = commands_manager.N.nodes;
	console.log("GET PEERS");
	console.log(commands_manager.N.nodes);
	var jsonResponse = {};
	jsonResponse["peers"] = [];
	for(var key in peers) {

		var curPeer = peers[key];
		var remote = curPeer["remote"];
		console.log("CUR PEER");
		console.log(curPeer);


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


exports.getPeer = function(req, res, next) {

	var pid = req.params.pid;
	var peers = commands_manager.N.nodes;

	var peer = filter(peers, function(element) {
		return element.uid == pid;
	});


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

exports.deletePeerFromId = function(req, res, next) {

	var pid = req.params.pid;
	

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

		console.log(commands_manager.N.nodes);
		
		res.header("Access-Control-Allow-Origin", "*");
		res.send({"status": "ok"});
	} else {

		console.log("DELETING PEER FROM HOST");
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


exports.deletePeerFromURI = function(req, res, next) {

	var URI = req.params.URI;
	console.log("DELETING NODE = "+pid);
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

exports.createPeer = function(req, res, next) {

	var peer = JSON.parse(req.body);
	console.log("CHECKING ");
	console.log(peer);
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
			console.log("checking = "+peerObj.host);
			if(!containsPeer(jsonResponse["peers"], peerObj.host)) {
				jsonResponse["peers"].push(peerObj);
			}
		}
		var pid = commands_manager.G.node_uid++;
		peer.peer["pid"] = pid;
		jsonResponse["peers"].push({"pid": pid, "host": peer.peer["host"], "port": peer.peer["port"], "remote": false});
		commands_manager.N.nodes.push({"uid": pid, "host": peer.peer["host"], "port": peer.peer["port"], "remote" : false});
		res.header("Access-Control-Allow-Origin", "*");
		res.send(jsonResponse);

	} else {
		return next(new restify.InvalidContentError("Invalid peer schema"));	
	}

}



