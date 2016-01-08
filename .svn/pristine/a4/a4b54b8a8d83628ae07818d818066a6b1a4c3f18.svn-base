/**
 * Commands manager: all the commands koala_root can understand. Usually the command is sent to a koala_node or koala_remote for execution. 	
 */

var util = require('util');

process.on('error', function(error) {
console.log('--> '+error) })

// var REMOTE_WORKER_MAX_CONNECTIONS = 10
var remote_tables = {
	connectedPeers: [],
	paths: ['/remote'],
	// pathsInOut: {},
	bindings: {},
	bindingsCount: {},
	pidToPath: {},
	pathToScript: {},
	pathToId: {},
	pidsInPath: {},
	pidsToRoom: {},
	scriptToId: {},
	pathToId: {},
	pathAutomatic: {}
}

// ##############################
// ##############################
// Andrea
// ##############################
// ##############################

// var STATISTICS_SERVER = 'http://agora.mobile.usilu.net:9997'
// var socketClient = require("socket.io-client");
// var statsServer = socketClient.connect(STATISTICS_SERVER);

// statsServer.on('connect', function () {
    // statsServer.emit('identification', {id: '__koala'});
 // });

//node -> remote connection server

// var galliDebug = true
// var galliText = "@@@@@ " 

// var webrtc = require('wrtc');
// var ws = require('ws')

// var stunServer = 'stun:stun.l.google.com:19302';

// var MAX_REQUEST_LENGHT = 1024;
// var pc = null;
// var offer = null;
// var answer = null;
// var remoteReceived = false;

// var dataChannelSettings = {
//   'reliable': {
//         ordered: false,
//         maxRetransmits: 0
//       },
// };

// var pendingDataChannels = {};
// var dataChannels = {}
// var pendingCandidates = [];

// var wss = new ws.Server({'port': 9999});

// nodes_waiting_remote = {}
// channel_remote = {}
// console.log('WS server listening on port: ' + 9999)
// wss.on('connection', function(ws)
// { 
//   function doComplete() {
//   }

//   function doHandleError(error) {
//     throw error;
//   }

//   function doCreateAnswer() {
//     remoteReceived = true;
//     pendingCandidates.forEach(function(candidate)
//     {
//       pc.addIceCandidate(new webrtc.RTCIceCandidate(candidate.sdp));
//     });
//     pc.createAnswer(
//       doSetLocalDesc,
//       doHandleError
//     );
//   };

//   function doSetLocalDesc(desc)
//   {
//     answer = desc;
//     pc.setLocalDescription(
//       desc,
//       doSendAnswer,
//       doHandleError
//     );
//   };

//   function doSendAnswer()
//   {
//     ws.send(JSON.stringify(answer));
//     console.log('awaiting data channels');
//   }

//   function doHandleDataChannels()
//   {
//     var labels = Object.keys(dataChannelSettings);
//     pc.ondatachannel = function(evt) {
//       var channel = evt.channel;

//       console.log('ondatachannel', channel.label, channel.readyState);
//       var label = channel.label;
//       pendingDataChannels[label] = channel;
//       channel.binaryType = 'arraybuffer';
//       channel.onopen = function() {
//       	console.log('onopen');
//         dataChannels[label] = channel;
//         delete pendingDataChannels[label];
//         if(Object.keys(dataChannels).length === labels.length) {
//           doComplete();
//         }

//       	var s = label.split("_");

//       	var remote_node = s[0]
//       	var internal_node = s[1]
//       	var direction = s[2]
      	
//       	channel_remote[s[1]] = channel
//       	var post_remote_channel = function(cid, direction) {
//       		if(direction == 'in') {
// 	      		console.log('in')
// 	      	} else if(direction == 'out') {
// 	      		var c = nodes_waiting_remote[cid]
      			
//       			channel_remote[cid].onmessage = function(message) {
//       				c.nodes[0].channel.koala_node.(cid, message.data)
// 				}
// 	      	}
//       	}

//       	post_remote_channel(s[1], direction)
//       };
//       // channel.onmessage = function(evt) {
//       //   var data = evt.data;
//       //   console.log('onmessage:', evt.data);
//       // };
//       // channel.onclose = function() {
//       //   console.log('onclose');
//       // };
//       channel.onerror = doHandleError;
//     };
//     doSetRemoteDesc();
//   };

//   function doSetRemoteDesc()
//   {
//     pc.setRemoteDescription(
//       offer,
//       doCreateAnswer,
//       doHandleError
//     );
//   }

//   ws.on('message', function(data)
//   {
//     data = JSON.parse(data);
//     if('offer' == data.type)
//     {
//       offer = new webrtc.RTCSessionDescription(data);
//       answer = null;
//       remoteReceived = false;

//       pc = new webrtc.RTCPeerConnection(
//         {
//           iceServers: [{url:stunServer}]
//         },
//         {
//           'optional': [{DtlsSrtpKeyAgreement: false}]
//         }
//       );
//       pc.onsignalingstatechange = function(state)
//       {
//         console.log('signaling state change: ' + state);
//       }
//       pc.oniceconnectionstatechange = function(state)
//       {
//         console.log('ice connection state change: ' + state);
//       }
//       pc.onicegatheringstatechange = function(state)
//       {
//         console.log('ice gathering state change: ' + state);
//       }
//       pc.onicecandidate = function(candidate)
//       {
//         // console.log('onicecandidate')
//         ws.send(JSON.stringify(
//           {'type': 'ice',
//            'sdp': {'candidate': candidate.candidate, 'sdpMid': candidate.sdpMid, 'sdpMLineIndex': candidate.sdpMLineIndex}
//           })
//         );
//       }
//       doHandleDataChannels();
//     } else if('ice' == data.type)
//     {
//       if(remoteReceived)
//       {
//         pc.addIceCandidate(new webrtc.RTCIceCandidate(data.sdp.candidate));
//       } else
//       {
//         pendingCandidates.push(data);
//       }
//     }
//   });
// });

// ##############################
// ##############################
// Fine
// ##############################
// ##############################




var CPU_PCT = "";

/*
	Array that stores the values returned by each worker. Each worker has a uid which is used as
	index in this array to store the value of the ans_rate they have. In this way we don't loose
	data when the controller kills some worker, we will always have the data of old workers.
	
	This is an array of arrays: each index of the first dimension corresponds to the cid of a 
	cluster, while on the array of the second dimension each index corresponds to a uid of a worker.
*/
var all_data_collected = new Array();
var random_token = undefined

var set_random_token = function(r) {
	random_token = r
}

var nowjs_leave = function(pid) {
	var cids = []

	for(var i = 0; i < this.clusters.length; i++) {
		if(this.clusters[i] != undefined) {
			var toRemove = false

			for(var j = 0; j < this.clusters[i].nodes.length; j++) {
				if(this.clusters[i].nodes[j].uid == pid) {
					cids.push(this.clusters[i].cid)
					toRemove = true
				}
			}

			if(toRemove)
				this.clusters[i] = undefined
		}
	}	

	for(var nn in this.N.nodes) {
		if(this.N.nodes[nn] != undefined && this.N.nodes[nn].uid == pid) {
			this.N.nodes[nn] = undefined
		}
	}

	// TODO check if still necessary
	// if(this.topologies.topologies[0]) {	
	// 	if(this.topologies.topologies[0].bindings) {
	// 		for(var index = 0; index < this.topologies.topologies[0].bindings.length; index++) {
	// 			if(this.topologies.topologies[0].bindings && cids.indexOf(this.topologies.topologies[0].bindings[index].from) != -1 || cids.indexOf(this.topologies.topologies[0].bindings[index].to) != -1) {
	// 				this.topologies.topologies[0].bindings.splice(index,1)
	// 				index--
	// 			}
	// 		}
	// 	}
	// }

	// for(var n in this.N.nodes) {
	// 	console.log(n)
	// 	console.log(this.N.nodes[n]);
	// 	if(this.N.nodes[n] != undefined && this.N.nodes[n].uid == pid) {
	// 		this.N.nodes = undefined
	// 	}
	// }
}

var set_remote_bindings = function(bs) {
	remote_tables.bindings = bs
}

var get_remote_bindings = function() {
	return remote_tables.bindings
}

var new_remote_workers = function(number, self) {
	var uids = []
	var self = this

	for(var i = 0; i < number; i++) {
		var tempId = self.G.process_uid++
		uids.push(tempId)
	}

	return uids
}

var get_paths = function() {
    return remote_tables.paths
}

var new_path = function(id, path, script, automatic /*, numberIn, numberOut, forceIn, forceOut */) {
    remote_tables.paths.push(path)

    // var tempIn = numberIn
    // var tempOut = numberOut
    // if(numberIn == 'all' || numberIn == undefined) {
    // 	tempIn = REMOTE_WORKER_MAX_CONNECTIONS
    // } 

   	// if(numberOut == 'all' || numberOut == undefined) {
    // 	tempOut = REMOTE_WORKER_MAX_CONNECTIONS
    // }

    // remote_tables.pathsInOut[path] = {
    // 	in: tempIn,
    // 	out: tempOut
    // }
    remote_tables.pathToScript[path] = script
    remote_tables.pidsInPath[path] = [] 
    remote_tables.scriptToId[script] = id
    remote_tables.pathToId[path] = id

    if(automatic) {
    	remote_tables.pathAutomatic[path] = true
    } else {
    	remote_tables.pathAutomatic[path] = false
    }
}

var has_path = function(path) {
	if(remote_tables.pathToScript[path])
		return true 
	else 
		return false
}

var get_script_from_path = function(path) {
	return remote_tables.pathToScript[path]
}

var add_pid_to_path = function(path, pid) {
	remote_tables.pidsInPath[path] = []
	remote_tables.pidsInPath[path].push(pid)
	remote_tables.pidToPath[pid] = path
	remote_tables.pidsToRoom[pid] = undefined

	var bindings = remote_tables.bindings
	for(var i = 0; i < bindings.length; i++){
		if(bindings[i].to == path) {
			remote_tables.pidsToRoom[pid] = remote_tables.pathToId[bindings[i].from]
		}
	}

	// remote_tables.bindingsCount[pid] = {
	// 	in: 0,
	// 	maxIn: remote_tables.pathsInOut[path].in,
	// 	out: 0,
	// 	maxOut: remote_tables.pathsInOut[path].out
	// }

	return remote_tables.pidsInPath
}

var new_remote_bindings = function(pid, path, cm) {
	var automatic_bind = function(from, to) {
	  cm.bind_clusters(['bindc', from, to], function(outmsg) {
	    console.log(outmsg)
	  })
	}

	var arrayPids = add_pid_to_path(path, pid)
	var bindings = remote_tables.bindings
	// var inOut = remote_tables.bindingsCount

	var newIn = []
	var newOut = [] 

	//bindings
	for(var i = 0; i < bindings.length; i++) {
		//out
	    if(path == bindings[i].from) {
	      	for(var j = 0; j < arrayPids[bindings[i].to].length; j++) {
	      		var inPid = arrayPids[bindings[i].to][j]
	      		// if(inOut[inPid].in < inOut[inPid].maxIn) {
	        		newOut.push([pid, inPid])
	      		// }
	      	}

	      	for(var j = 0; j < this.clusters.length; j++) {
				if(this.clusters[j] && this.clusters[j].alias == bindings[i].to) {
					var inPid = this.clusters[j].cid

					newOut.push([pid, inPid])
				}
			}	
	    }
	  
	  	//in
	    if(path == bindings[i].to) {
		    for(var j = 0; j < arrayPids[bindings[i].from].length; j++) {
		    	var outPid = arrayPids[bindings[i].from][j]
		    	// if(inOut[outPid].in < inOut[outPid].maxIn) {
		    		newIn.push([outPid, pid])
		    	// }
		    }

		    for(var j = 0; j < this.clusters.length; j++) {
				if(this.clusters[j] && this.clusters[j].alias == bindings[i].from) {
					var outPid = this.clusters[j].cid

					newIn.push([outPid, pid])
				}
			}
	    }     
	}

	// var bestIn = find_best_bind(newIn, inOut[pid].maxIn)
	// var bestOut = find_best_bind(newOut, inOut[pid].maxOut)

	// for(var i = 0; i < bestIn.length; i++) {
	// 	automatic_bind(bestIn[i][0], bestIn[i][1])
	// }

	// for(var i = 0; i < bestOut.length; i++) {
	// 	automatic_bind(bestOut[i][0], bestOut[i][1])
	// }

	//console.log(newIn)
	//console.log(newOut)

	for(var i = 0; i < newIn.length; i++) {
		automatic_bind(newIn[i][0], newIn[i][1])
	}

	for(var i = 0; i < newOut.length; i++) {
		automatic_bind(newOut[i][0], newOut[i][1])
	}
}

// var find_best_bind = function(a, max) {
// 	var c = []

// 	for(var i = 0; i < a.length; i++) {
// 		if(c.length < max) {
// 			c.push(a[i])
// 		}
// 	}

// 	return c
// }

/*
	Adds a hook to the controller 
*/
var addController = function(controller){
	this.controller = controller;
}

/*
	Returns a usable uid for workers
*/
var generate_worker_uid = function(){
	return this.G.process_uid++;
}

/*
	Returns a usable cid for operators
*/
var generate_operator_cid = function(){
	return this.G.cluster_id++;
}

/*
	Starts the collection of data. Should be started after all the setup has been done.
*/
var start_controller = function(cmd, cb){
	this.controller.update_clusters(this.clusters);
	this.controller.start_collect();
	
	
	
	for(var i = 0; i < this.N.nodes.length; i++){
		if(this.N.nodes[i].channel && !this.N.nodes[i].remote) {
			this.N.nodes[i].channel.koala_node.start_controller();
		}
	}	
}

/*
	Returns the array of nodes in the network.
*/
var get_nodes = function() {
	
	console.log(this.N.nodes.length+' <<l')
	
	var r = []
	for(var i=0; i<this.N.nodes.length; i++) {
		var x = this.N.nodes[i]; 
			r.push(x)
	}
	return r
}


/*
	Returns the array of remote nodes (remote_worker) in
	the network.
*/
var get_remotes = function() {
	
	var r = []
	for(var i=0; i<this.N.nodes.length; i++) {
		var x = this.N.nodes[i]
		if(x.remote)
			r.push(x)
	}
	return r
}


/*
	Returns the names of nodes in the network.
*/
var get_nodes_names = function() {
	
	var r = []
	
	for(var n in this.N.nodes) {
		var x = this.N.nodes[n]; 
		if(x.uid != undefined && ! x.remote){
			r[x.uid] = ' '+x.uid+' ('+ x.alias+') ';
		}
	}
	return r
}


/*
	Returns the names of remote nodes (browsers)
*/
var get_remotes_names = function() {
	
	var r = []
	for(var n in this.N.nodes) {
		var x = this.N.nodes[n]
		if(x.uid && x.remote)
			r.push(' '+x.uid+' ('+ x.alias+') ')
	}
	return r
}


/*
	Gets the list of scripts that can be run on the master.
*/
var get_scripts = function() {

	return require('fs').readdirSync('./scripts')
}

/*
	Gets the list of processes running
*/
var get_processes = function() {
	
	var proc = []
	for(var entry in this.P.processes){
		proc.push(this.P.processes[entry]);
	}
	
	return proc;
}

/*
	Returns the bindings of the topology (for now it's general, can be more specified by
	adding, in the future, the id of the interested topology).
*/
var get_bindings_cli = function() {
	var str = "";	
	for(var i = 0; i < this.topologies.topologies[0].bindings.length; i++)
		str += JSON.stringify(this.topologies.topologies[0].bindings[i]) + ", ";
	return str;
}

/*
	Returns the clusters in the system right now.
*/
var get_clusters = function() {
	var text = "No Operators Found";
	var that = this;
	for(var i = 0; i < this.N.nodes.length; i++){
		if(!this.N.nodes[i].remote) {
			this.N.nodes[i].channel.koala_node.get_clusters(function(clusters){
				for(var j = 0; j < clusters.length; j++){
					//same reason
					if(clusters[j]){
						//var text = "Cluster id : " + clusters[j].cid + ", script running : " + clusters[j].script + ", is it a producer? " + clusters[j].producer + ", ";
						var text = "Cluster id : " + clusters[j].cid + ", script running : " + clusters[j].script;
						text += ", workers ids: ";
						for(var k = 0; k < clusters[j].workers.length; k++){
							text += clusters[j].workers[k].uid + ", ";
						}
						console.log(text);
					}
					
					if(i+1 == that.N.nodes.length){
						//all nodes traversed
						if(j+1 == clusters.length){
							//all operators of the last node traversed
							return text;
						}
					}
				}
			});
		}
	}
}

/*
	Gets all the connections (that is, workers and their connections)
*/
var get_connections = function(){
	//return this.RT.get_table();
	var res = "";
	for(var i = 0; i < this.topologies.topologies.length; i++)
		res += JSON.stringify(this.topologies.topologies[i].bindings) + ", ";
	return res;
}

/*
	Gets the list of bindings (that is, the RT)
*/
var get_bindings = function() {
	var binds = [];
	for(var entry in this.RT.__table)
		binds.push(this.RT.__table[entry])
		
	return binds;
}

/*
	Returns a not used host. It iterates through the host list and
	finds the less used one. Has also a variable for loops if needed (i.e. in koala_root).
	Check that the host reflects the capabilities (sensors)
*/
var find_host = function(that, sensors, cb, indx){
	
	var less_used = 100; //max value
	var node_index;
	var counter = 0;
	
	for(var i = 0; i < that.N.nodes.length; i++){
		
		if(that.N.nodes[i] && !that.N.nodes[i].remote && that.N.nodes[i].channel) {
			
			if(sensors && that.N.nodes[i].hostname === "raspberrypi"){
				cb(i, indx);
				return;
			}
				
			else{
				that.N.nodes[i].channel.koala_node.cpu_usage(i, function(index, usage){
					
					if(less_used > usage){
						node_index = index;
						less_used = usage;
					}
					counter++;
					
					//TODO
					if(that.N.nodes.length === counter /*&& indx !== node_index*/){
						cb(node_index, indx);
					}
					// else{
					// 	cb(-1, indx);
					// }
				});
			}
			
		} else {
			counter++
		}
	}
}

/*
	Runs a new cluster on a node. The cluster is a block of x processes
	all executing the same script. For now, each process of this cluster
	is run on the same node. This method spawns x processes executing the
	same script. They are bounded by a cid (cluster id) which will is
	used in the 'bindc' command, that binds two clusters together.
	
	The communication flows in this way:
	
	[ koala_root ]  --(RPC)-->  [ koala_node ] --(IPC)--> [ new js process ]  
	
	@params: cmd A command issued to run a new process on a node
	@params: {function} cb The callback function
*/


var run_new_cluster = function(cmd, cb) {
	var self = this;
	var alias = "";
	var node_uid;
	var outmsg ="";
	// Check that the script exists
	var script = cmd[1]
	
	var dir = this.get_scripts()
	
	if( dir.indexOf(script) == -1 ) {
		outmsg+= 'No such script! "'+script+'"'
		cb(outmsg)
		return;
	}
	
	if(cmd[2]) node_uid = cmd[2]
	
	// Take the number of processes to spawn (1 default if none provided)
	var to_spawn = 1
	if(cmd[3])
		var to_spawn = cmd[3]
	
	//check the flag, if no flag specified goes in automatic
	var control_flag = cmd[4]
	var automatic = false;
		
	if(!control_flag || control_flag == "-a")
		automatic = true;
		
	var uids = [];		
	//generate uid for each worker
	for(var i = 0; i < to_spawn; i++)
		uids.push(this.G.process_uid++);


	


	
	//if the node_uid is not provided (uid of the operator where the
	//operator is supposed to run) then root will find the less used 
	//host (smallest cpu_usage) and run it there.
	if(!node_uid){
		console.log("not given uid, iterating through operators");
		
		var less_used = 100; //max value
		var node_index;
		var counter = 0;
		var that = this;
		for(var i = 0; i < this.N.nodes.length; i++){
			this.N.nodes[i].channel.koala_node.cpu_usage(i, function(index, usage){
				
    			if(less_used > usage){
    				node_index = index;
    				less_used = usage;
    			}
    			counter++;
    			
    			//finished
    			if(that.N.nodes.length == counter){
    				var new_cid = that.G.cluster_id++;
					var node = that.N.nodes[node_index];
					
					//create the cluster entry for the array of clusters
					var cluster = {
						cid : new_cid,
						alias: alias,
						nodes: [node],
						script: script,
						processes : [],
						from : [],
						to : [],
						automatic: automatic,
					}
				
					that.clusters[cluster.cid] = cluster;

					


					//add the new cluster to the controller list
					that.controller.add_comp(new_cid);
					that.controller.update_clusters(that.clusters);
					

					run_operator(node, new_cid, script, uids, automatic, to_spawn, "", this, cb);
    			}
    		});
		}
	}	
		
	// run [src] [node]		

	if(node_uid == -1) {
		var rank = this.controller.get_first_best_rank()

		node_uid = rank
	}

	if(!this.N.nodes[node_uid]) {
		
		cb('No such node! "'+node+'"')
		return;
	} else {


		var new_cid = this.G.cluster_id++;
		var node = this.N.nodes[node_uid];

		
		//here there was the cluster creation and adding to the controller part that was moved in run_operator


		run_operator(node, new_cid, script, uids, automatic, to_spawn, "", this, cb);
		
	}
}

var find_browser = function(cb) {
	cb(this.controller.get_first_best_rank())
}

/*
	Helper function to run an operator on a particular host.
	@params: host (node_uid) where the script has to be run
	@params: cid of the operator
	@params: script to run
	@params: list of uids (one for each worker to be spawned)
	@params: boolean value that tells if the controller has to watch over this operator and add/remove workers
	@params: number of workers (if provided) -> otherwise 1 by default
	@params: alias (if provided) -> otherwise "" by default
	@params: callback to execute when done (if provided)
	
	This function has to be refactored even further and probaby remove the workers id: they
	should and will be generated and handled by the host.
*/

var run_operator = function(node, new_cid, script, uids, automatic, to_spawn, alias, self, cb){

	if(self.topologies.topologies.length == 0) {
		self.topologies.topologies = [];
		var mainTopology = {
			tid: 1,
			operators: []
		}
		self.topologies.topologies.push(mainTopology);
	}


	var operators = self.topologies.topologies[0].operators;



	var operator = {
		oid: new_cid,
		peer: node != undefined ? node.host : undefined,
		script: script,
		browser:node.remote,
		topology: "main",
		automatic: automatic,
	};
	if(typeof(operators) === undefined) {
		self.topologies.topologies[0].operators = [];
	} 
	self.topologies.topologies[0].operators[new_cid] = operator;
	
	if(self.topologies.topologies[0].operators[new_cid].workers == undefined) {
		self.topologies.topologies[0].operators[new_cid].workers = [];
	}

	//UPDATE TOPOLOGY
	for (var i = 0; i < uids.length; i++) {
		var newWorker = {
			wid: uids[i],
			href: "/topologies/example/operators/"+new_cid+"/workers/"+uids[i],
            operator: "/topologies/example/operators/"+new_cid,
            automatic: automatic,
            //TODO: ADD   UPTIME, MESSAGES, REQ-RES-STATION
		}; 
		self.topologies.topologies[0].operators[new_cid].workers.push(newWorker);
	};

	
	//create the cluster entry for the array of clusters
	var cluster = {
		cid : new_cid,
		alias: alias,
		nodes: [node],
		script: script,
		processes : [],
		from : [],
		to : [],
		automatic: automatic,
	}

	
	self.clusters[cluster.cid] = cluster;
	clusters = self.clusters

	// console.log('###')
	// console.log(self.clusters)
	//add the new cluster to the controller list
	self.controller.add_comp(new_cid);
	self.controller.update_clusters(self.clusters);
	
	if(!node.remote)
		node.channel.koala_node.run_cluster(new_cid, script, to_spawn, uids, automatic, alias, self, function(){
			cb(new_cid);
		});
	else {
		node.channel.koala_remote.run_cluster(new_cid, script, to_spawn, uids, automatic, alias, function(){
			cb(new_cid);
		}, random_token, remote_tables.scriptToId[script]);
	}
	
	var container = [];
	
	all_data_collected[new_cid] = new Array();
}

/*
	Runs a new process on a node. The communication flows in this way:
	
	[ koala_root ]  --(RPC)-->  [ koala_node ] --(IPC)--> [ new js process ]  
	
	@params: cmd A command issued to run a new process on a node
	@params: {function} cb The callback function
*/
var run_new_process = function(cmd, cb, migrate_cb) {

	var self = this

	// Check that the script exists
	var script = cmd[1]

	var dir = this.get_scripts()
	
	if( dir.indexOf(script) == -1 ) {
		outmsg+= 'No such script! "'+script+'"'
		cb(outmsg)
		return;
	}
		
	// If the node is not specified, use the first one (ie 0)
	var node_uid = 0
	if(cmd[2]) node_uid = cmd[2]
	
		
	// run [src] [node]		
	if( ! this.N.nodes[node_uid] ) {
	
		cb('No such node! "'+node+'"')
		return;
	}
	else {
		
		var node = this.N.nodes[node_uid]
		
		// If the node is a cluster node
		if( ! node.remote) {
		
			var uid = this.G.process_uid++
			var port = this.G.current_free_port++
		
			var new_process = { 
				src: script, 
				uid: uid,
				port: port
			}
			
			// call koala_node and ask him to start the new process
			node.channel.koala_node.run_process( new_process, function( started ) {
			
				if(started) {
			
					self.P.processes[uid] = {
						uid: uid,
						node: self.N.nodes[node_uid],
						port: port,
						script: script,
					}
				
					cb('Cluster process started (pid: '+uid+', src:'+script+')')
					if(migrate_cb)
						migrate_cb(new_process);
				}
				else
					throw "Cannot start the process!"					
			})
		}
		
		// If we have to start the process in the browser
		else {
			var uid = this.G.process_uid++
			var port = this.G.current_free_port++
		
			var new_process = { 
				src: script, 
				uid: uid
			}
			// call koala_node and ask him to start the new process
			node.channel.koala_remote.run_process( new_process, function( started ) {
				
				if(started) {
					
					self.P.processes[uid] = {
						uid: uid,
						node: self.N.nodes[node_uid],
						script: script,
					}				
					
					cb('Remote process started (pid: '+uid+')')
					if(migrate_cb)
						migrate_cb(new_process);
				}
				else
					throw "Cannot start the process!"					
			})		
		}
	}
}


/*
	The function binds two processes (relation cmd[1] -> cmd[2])
	The communication flows in this way:
	
	[ koala_root ]  --(RPC)-->  [ koala_node ]  --(IPC)--> [ js process 1 ]  --(TCP)-->  [ js process 2 ]     

	@param: cmd A command issued to bind two processes
	@param: {function} cb The callback function
*/
var bind_processes = function(cmd, cb) {
	var self = this
 
	// bind [id1] [id2]
	if(cmd.length == 3) {
		
		//gets both the ids of the two processes
		var id1 = parseInt(cmd[1])
		var id2 = parseInt(cmd[2])
		
		//
		// Connect to the actual process or use koala_root as the proxy for the connection		
		//
		
		// node --> node
		//console.log(this.P.processes);
		
		//this is another check to prevent that while they are binded, some is already killed, thus 
		//there is no process with that id anymore in the processes array.
		if(!this.P.processes[id1] || !this.P.processes[id2]){
			cb("No more processes with id " + id1 + " or " + id2);
			return;
		}
		
		if(( ! this.P.processes[id1].node.remote )&&( ! this.P.processes[id2].node.remote )){
			
			console.log("In bind server -> server");
			
			var cid_to = getCluster(id2);
			var cid_from = getCluster(id1);
			
			var msg = {
				pid: id1,
				to: id2,
				host: this.P.processes[id2].node.host,
				port: this.P.processes[id2].port,
				cid_to: cid_to,
				cid_from: cid_from,
			}
			
			this.P.processes[id1].node.channel.koala_node.bind_process_node( msg, function() {
				
				//sometimes one of those (usually the one with id1) was undefined, probably because
				//while getting on it was immediately killed, so this avoids the .node of undefined error
				if(!self.P.processes[id1] || !self.P.processes[id2])
					return;
			

				console.log('SHOULD NEVER BE HERE')
				// Save the new link in the RT
				// self.RT.link( 
				// 	{ cid: id1, node: self.P.processes[id1].node},
				//   	{ cid: id2, node: self.P.processes[id2].node}
				//   )
				
				cb('Binding done ('+id1+' --> '+id2+')')
			})
		}
		
		// node --> remote
		if(( ! this.P.processes[id1].node.remote )&&( this.P.processes[id2].node.remote ))
		{
			console.log("in bind node->remote");
			//
			//	id1 --> id of the process running in a koala_node
			//
			//  id2 --> id of the process running in a koala_remote (browser)
			//	
			
			// (1) Tell id1 (node) to connect to Proxy
			
			var msg = {
				pid: id1,
				to: id2,
				host: this.K.PROXY.host, // TODO DON'T USE LOCALHOST
				port: this.K.PROXY.port_ZMQ,
				proxy: true,
			}
			
			this.P.processes[id1].node.channel.koala_node.bind_process_node( msg, function() {
				

				console.log('SHOULD NEVER BE HERE')
				// Save the new link in the RT
				// self.RT.link( 
				// 	{ cid: id1, node: self.P.processes[id1].node},
				//   	{ cid: id2, node: self.P.processes[id2].node}
				//   )
				// (2) Send updated routing table to proxy --> [ process_id : browser_id ]
				// self.proxy.send({ cmd:'new_rt', RT: self.RT.__table , koala_remote : self.RT.__table[id2].node.channel.koala_remote})
				//console.log(self.RT.__table);
				//console.log(self.RT.__table[id2].node.channel.koala_remote);
				cb('Binding done ('+id1+' --> '+id2+')')
			})			
			
			
			// (3) Tell id2 (browser) to connect to Proxy
			
			// 1) root --> browser [ msg: { new px binding { your_process_id2 --> proxy_port/host } ]
			var node = this.P.processes[id2].node
			var msg = {
				pid: id2,
				host: this.K.PROXY.host, // TODO DON'T USE LOCALHOST
				port: this.K.PROXY.port_HTTP,
				cmd: 'bind',
			}
			
			/*node.channel.koala_remote.bind_process_node(msg, function(){
				//callback of RPC message to browser
			});*/
			// 2) browser --> wworker [ fwd ] done in koala_bootloader+koala_remote
			// 3) wworker --> proxy [ http connect / wsocket bootstrap ]
			//
			// !!! koala_client_side !!!
			//
			//	Watch out: new communication library
			//
						
		}		
		
		// remote --> node
		if(( this.P.processes[id1].node.remote )&&( ! this.P.processes[id2].node.remote ))
		{
			console.log("in remote->node");
			
			//
			//	id1 --> id of the process running in a koala_remote (browser)
			//
			//  id2 --> id of the process running in a koala_node
			//	
			
			// (1) Tell id2 (node) to connect to Proxy
			
			var msg = {
				pid: id2,
				host: this.K.PROXY.host, // TODO DON'T USE LOCALHOST
				port: this.K.PROXY.port_ZMQ,
				proxy: true,
			}
			
			this.P.processes[id2].node.channel.koala_node.bind_process_node( msg, function() {
				

				console.log('SHOULD NEVER BE HERE')
				// Save the new link in the RT
				// self.RT.link( 
				// 	{ cid: id1, node: self.P.processes[id1].node},
				//   	{ cid: id2, node: self.P.processes[id2].node}
				//   )
				// (2) Send updated routing table to proxy --> [ process_id : browser_id ]
				// self.proxy.send({ cmd:'new_rt', RT: self.RT.__table})
				// self.proxy.send({
				// 	cmd : 'new_conn', 
				// 	host : self.P.processes[id2].node.host , 
				// 	port : self.P.processes[id2].port, 
				// 	uid: id2
				// });
				
				//console.log(self.RT.__table[id2].node.channel.koala_remote);
				cb('Binding done ('+id1+' --> '+id2+')')
			})			
			
			// (3) Tell id1 (remote) that he is now binded
			var msg = {
				uid : id1,
				cmd : 'bind',
			};
			this.P.processes[id1].node.channel.koala_remote.bind_process_node(msg, function(){
				//callback of RPC message to browser
			});
			
			
			// (4) Tell id2 (browser) to connect to Proxy
			
			// 1) root --> browser [ msg: { new px binding { your_process_id2 --> proxy_port/host } ]
			/*var node = this.P.processes[id2].node
			var msg = {
				pid: id2,
				host: this.K.PROXY.host, // TODO DON'T USE LOCALHOST
				port: this.K.PROXY.port_HTTP,
				cmd: 'bind',
			}*/
			
			/*node.channel.koala_remote.bind_process_node(msg, function(){
				//callback of RPC message to browser
			});*/
			// 2) browser --> wworker [ fwd ] done in koala_bootloader+koala_remote
			// 3) wworker --> proxy [ http connect / wsocket bootstrap ]
			//
			// !!! koala_client_side !!!
			//
			//	Watch out: new communication library
			//
		}	
		
		// remote --> remote (same browser and different browsers!) 
		if(( this.P.processes[id1].node.remote )&&( this.P.processes[id2].node.remote ))
		{
			//TODO
		}
	}
}

/*
	Unbind two processes from the routing table
*/
var unbind_processes = function(cmd, cb, self) {
	if(cmd.length == 3) {
		
		//gets both the ids of the two processes
		var pid1 = parseInt(cmd[1])
		var pid2 = parseInt(cmd[2])
		
		//console.log("==============================================================================================================unbinding " + pid1 + " from " + pid2);
		

		console.log('SHOULD NEVER BE HERE')
		// this.RT.unlink(pid1, pid2, this.proxy, function(proxy, __table){
		// 	proxy.send({ cmd:'new_rt', RT: __table})
		// });
		
		var msg = {
			pid1: pid1,
			pid2: pid2,
		}
		
		if(!this.P.processes[pid1]){
			cb("pid1 ("+pid1+") not found in unbind_process() when unbinding processes");
			return;
		}
		
		//If it's a "to" (meaning this worker has a connection with somebody else) I don't remove the connection.
		//the connection will be removed by itself once the node is killed, and this shouldn't be a problem since 
		//it's already removed from the RT, and the only remaining of the connection is inside the worker itself
		//in the array of connections. TEST IT
		//if(!to){
			if(!this.P.processes[pid1].node.remote){
				this.P.processes[pid1].node.channel.koala_node.unbind_process_node(msg, function(self){
					cb(self);
				}, self);		
			}
			else{
				//too few parameters
				cb("Too few parameters");
			}
		/*}
		
		else{
			//console.log("it's a to, dont remove connection with command: " + cmd);
			//do nothing, the worker has a "to" connection to somebody, thus it will take care of it by itself
			//(that is, it will kill itself and do nothing since the only remaining connection is inside of it
			//in the array of connections, the RT is updated in this function 30 lines top from here).
			cb();
		}*/
	}
}

/*
	Binds two clusters together.
	cmd only contains the command input which should be only ids and not aliases
*/
var bind_clusters = function(cmd, cb, s, algorithm) {
 	//when called from migrate its from nested callbacks and need locality
 	if(!s)
 		s = this;
	//for now we avoid defining the sending protocol
	if(!algorithm)
 		var algorithm;
	// bindc [cid1] [cid2]
	// [cid1] --> [cid2]
	
	if(cmd.length == 3) {
		
		//console.log(cid1 + " " + cid2 + " " + "======================================================================================================");
		
		//gets both the ids of the two clusters
		var cid1 = parseInt(cmd[1])
		var cid2 = parseInt(cmd[2])
		

		var c1 = s.clusters[cid1];
		var c2 = s.clusters[cid2];
		
		//no aliases ("false") for now
		bind_operators(cid1, cid2, false, algorithm, s, cb);
	}
}



/*
	Actual function that performs the binding
	@param: from, cid or alias of the first cluster
	@param: to, cid or alias of the second cluster
	@param: aliases, boolean value that specifies if from and to are aliases or real cids
	@param: protocol to send data
	@param: cb, callback function
*/
var bind_operators = function(from_a, to_a, aliases, protocol, self, cb){

	var from = from_a
	var to = to_a

	//UPDATE TOPOLOGY
	if(!self.topologies.topologies[0].bindings) {
		self.topologies.topologies[0].bindings = [];
	}

	var c1;
	var c2;
	//clusters value
	if(!aliases){
		c1 = self.clusters[from_a];
		c2 = self.clusters[to_a];
		//console.log("from : " + from + " to: " + to + " " + JSON.stringify(c1) + " " + JSON.stringify(c2));
	}
	else {
		for(var i = 0; i < self.clusters.length; i++){
			//overwriting from and to because they will be used later when calling the actual bind
			if(self.clusters[i]) {
				if(self.clusters[i].alias === from_a || self.clusters[i].cid === from_a){
					c1 = self.clusters[i];
					from = self.clusters[i].cid;
				}
				else if(self.clusters[i].alias === to_a || self.clusters[i].cid === to_a){
					c2 = self.clusters[i];
					to = self.clusters[i].cid;
				}	
			}
		}
	}

	// console.log('c2 ###')
	// console.log(c2)

	//update clusters
	c1.to.push(c2)
	c2.from.push(c1);

	// var from_id = ;
	var binding = {
			from: c1.cid,
			to: c2.cid,
			type: protocol
	};
	
	self.topologies.topologies[0].bindings.push(binding);	
	
	// console.log("C1.nodes: " + c1.nodes.length);
	//get the node(s) where c1 is
	for(var i = 0; i < c1.nodes.length; i++){
		//get the list of nodes of c2, get proxy & call function
		if(!c1.nodes[i].remote){
			for(var j = 0; j < c2.nodes.length; j++){
			
				//C1 and C2 are not remote, it's a server -> server connection
				if(!c2.nodes[j].remote){
					// console.log('Nuova connessione server -> server');
					c1.nodes[i].channel.koala_node.bind_cluster(from, to, c2.nodes, protocol, cb, undefined, {from: from_a, to: to_a})
				} 
				
				//C1 is not remote, C2 is remote, it's a server -> remote connection
				else {
					// console.log('Nuova connessione server -> remoto')

					var call_closure = function(local_operator, remote_operator, local_node, remote_node, protocol, api_cb) {
						remote_node.channel.koala_remote.bind_cluster_server_in(local_operator, remote_operator, local_node, remote_node, protocol, function(remote_uids, remote_workers, cb) {
							local_node.channel.koala_node.outgoing_connection_remote([local_node.uid], remote_workers, local_node, remote_node, function(proxy){
						      //proxy.host proxy.port
						      cb(proxy, function(cid) {
						      	api_cb(cid);
						      })
						      // for(var i = 0; i < clusters[to].workers.length; i++){
						      //   //send a connection message that the koala_remote.js (worker) can interpret
						      //   clusters[to].workers[i].process.postMessage(proxy);
						      // }
						    })

						    local_node.channel.koala_node.bind_cluster(local_operator, to, c2.nodes, protocol, cb, undefined, {from: from_a, to: to_a})
						})
					}
					call_closure(from, to, c1.nodes[i], c2.nodes[j], protocol, cb)
					
					var fromInfo = {
						id: c1.nodes[i].uid,
						operator: from
					}
					
					c2.nodes[j].channel.koala_remote.add_bind_table(to, fromInfo, undefined, function(){})
					

					// nodes_waiting_remote[from] = c1

					// remote_tables.bindingsCount[to].in++
				}
			}
		}
		else{
			for(var j = 0; j < c2.nodes.length; j++){
			
				//C1 is remote, C2 is server, it's a remote -> server conneciton
				if(!c2.nodes[j].remote){
					// console.log('Nuova connessione remoto -> server')

					var call_closure = function(remote_operator, local_operator, remote_node, local_node, protocol, api_cb) {
						remote_node.channel.koala_remote.bind_cluster_server_out(local_operator, remote_operator, local_node, remote_node, protocol, function(remote_uids, remote_workers, cb) {
							local_node.channel.koala_node.incoming_connection_remote(local_operator, local_node.uid, remote_workers, local_node, remote_node, {from: from_a, to: to_a}, function(proxy){
						      //proxy.host proxy.port
						      cb(proxy, function(cid) {
						      	api_cb(cid);
						      });	
						      // for(var i = 0; i < clusters[to].workers.length; i++){
						      //   //send a connection message that the koala_remote.js (worker) can interpret
						      //   clusters[to].workers[i].process.postMessage(proxy);
						      // }
						    }, c1.cid)
						})
					}

					call_closure(from, to, c1.nodes[i], c2.nodes[j], protocol, cb)
					

					var toInfo = {
						id: c2.nodes[j].uid,
						operator: to
					}

					c1.nodes[i].channel.koala_remote.add_bind_table(from, undefined, toInfo, function(){})

					// c1.nodes[i].channel.koala_remote.bind_cluster_server_out(from, to, c2.nodes[j], c1.nodes[i], protocol, cb)
					// nodes_waiting_remote[to] = c2
					// remote_tables.bindingsCount[from].out++
				} 
				
				//C1 and C2 are remote, it's a remote -> remote connection
				else {
					// console.log("Nuova connessione remoto -> remoto");
					c1.nodes[j].channel.koala_remote.bind_cluster_remote(from, to, c1.nodes[i], c2.nodes[j], protocol, function(){
						cb()
					}, random_token, remote_tables.pidsToRoom[to]);
					
					var fromInfo = {
						id: c1.nodes[i].uid,
						operator: from
					}

					var toInfo = {
						id: c2.nodes[j].uid,
						operator: to
					}

					c1.nodes[i].channel.koala_remote.add_bind_table(from, undefined, toInfo, function(){})
					c2.nodes[j].channel.koala_remote.add_bind_table(to, fromInfo, undefined, function(){})
					

					// statsServer.emit('bind', {from: c2.nodes[j].uid, to: c1.nodes[i].uid})

					// remote_tables.bindingsCount[to].in++
					// remote_tables.bindingsCount[from].out++
				}
			}

		}
	}
} 



/*
	Finds cluster based on user input. The user input may be a cid or an
	alias, thus the function has to pay attention to this.
	@param input : user input (either alias or cid)
*/
var find_cluster = function(input, self){
	//iterates through the clusters to find which cluster is which
	for(var i = 0; i < self.clusters.length; i++){
		if(self.clusters[i] && (self.clusters[i].cid === parseInt(input) || self.clusters[i].alias === input)){
			return self.clusters[i].cid
		}
	}
	console.err("no cid found in find_cluster!");
}



/*
	Unbinds two clusters that were previously bound.
	The function has to be expanded to support unbinding from just one cluster.
	For now it calls unbind_cluster in koala_node.js which just unbinds the workers
	from everything they are binded.
	@param cmd : the input command
	@param cb : callback
*/
var unbind_clusters = function(cmd, cb, migrate){

	//correct number of parameters
	if(cmd.length == 3) {

		var from = parseInt(cmd[1])
		var to = parseInt(cmd[2])

		var cluster_from = undefined
		var cluster_to = undefined

		for(var i = 0; i < this.clusters.length; i++){
			//overwriting from and to because they will be used later when calling the actual bind
			if(this.clusters[i]) {
				if(this.clusters[i].alias === from || this.clusters[i].cid == from){
					cluster_from = this.clusters[i];
					from = this.clusters[i].cid;
				}
				else if(this.clusters[i].alias === to || this.clusters[i].cid == to){
					cluster_to = this.clusters[i];
					to = this.clusters[i].cid;
				}	
			}
		}
	
		//console.log("in unbindc unbinding from " + from + " to " + to);
		
		// var cluster_from = this.clusters[find_cluster(cmd[1], this)]
		// var cluster_to = this.clusters[find_cluster(cmd[2], this)]

		//update topologies data structure
		del(this.topologies.topologies[0].bindings, function(element) {
			return element.from == cluster_from.cid && element.to == cluster_to.cid;
		});
					
		for(var i = 0; i < cluster_from.nodes.length; i++){	
			
			if(!cluster_from.nodes[i].remote && !cluster_to.nodes[i].remote){
								// console.log("unbind server -> server")
				cluster_from.nodes[i].channel.koala_node.unbind_cluster(cluster_from.cid, cluster_to.cid, function(){
					cb(cluster_from.cid);
				}, this);	
			}
			else if(cluster_from.nodes[i].remote && cluster_to.nodes[i].remote){
				// console.log("unbind remote -> remote")
				if(migrate) {
					cluster_from.nodes[i].channel.koala_remote.unbind_remote_out(cluster_from.cid, cluster_to.cid, function(cid){
						// console.log("unbound "+cid);
						cb(cid);
					});

				} else {
					cluster_to.nodes[i].channel.koala_remote.unbind_remote_in(cluster_from.cid, cluster_to.cid, function(cid){
						// console.log("unbound "+cid);
						cb(cid);
					});
				}
			} else if(cluster_from.nodes[i].remote) {
				// console.log("unbind remote -> server")

				cluster_from.nodes[i].channel.koala_remote.unbind_remote_out(cluster_from.cid, cluster_to.cid, function(cid){
					// console.log("unbound "+cid);
					cluster_to.nodes[0].channel.koala_node.unbind_remote(cluster_from.cid, cluster_to.cid)
					cb(cid);
				});
			} else if (cluster_to.nodes[i].remote) {
				console.log("unbind server -> remote")

				cluster_to.nodes[i].channel.koala_remote.unbind_remote_in(cluster_from.cid, cluster_to.cid, function(cid){
					// console.log("unbound "+cid);
					cluster_from.nodes[0].channel.koala_node.unbind_remote(cluster_from.cid, cluster_to.cid)
					cb(cid);
				});
			}
		}
	}
	else{
		//too few parameters
		cb("Too few parameters for unbind");
	}
}





/*
	Function that adds a new worker to a given cluster id. Then runs the given script
	in the worker and finally connects the worker to and/or from any other node/cluster
	connected to the cluster it has been added to.
	
	E.G. cid1 ---> cid2
	addworker x.js cid1
	cid1+NewWorker ---> cid2
	
	and viceversa.
	
	The run new process procedure can't be called from the run_process function. The reason
	is that the run_process function doesn't return an id and a *pointer* to the newly run
	process. We need that since we need to add it to the cluster AND bind it to or from
	other nodes.
*/

var add_worker = function(cmd, cb){
	//addworker [src] [cid] [nid]
	if(cmd.length == 4){
		//get the input values
		var script = cmd[1]
		var cid = parseInt(cmd[2])
		var nid = parseInt(cmd[3])
		
		var self = this;
			
		var uid = this.G.process_uid++
		var port = this.G.current_free_port++
		
		//this.clusters[cid] cluster that has to receive the new worker
		var container = [];
		
		var dir = this.get_scripts()
		if(!this.N.nodes[nid]){
			cb("Given nid doesn't represent a node!");
			return;
		}
		
		if( dir.indexOf(script) == -1 ) {
			outmsg+= 'No such script! "'+script+'"'
			cb(outmsg)
			return;
		}
			
		var node = this.N.nodes[nid];
		
		//run new process
		if( ! node.remote) {
				container.push({ 
					src: script, 
					uid: uid,
					port: port,
					node_uid : node.uid
				});
				// call koala_node and ask him to start the new process
				node.channel.koala_node.run_process( container[0], function( proc, started ) {
					//console.log(proc)
					if(started) {
						self.P.processes[proc.uid] = {
							uid: proc.uid,
							node: self.N.nodes[proc.node_uid],
							port: proc.port,
							script: proc.src,
						}
						
						//if(i + 1 == to_spawn)
						
						//put the process in the cluster aswell
						self.clusters[cid].processes.push({uid: uid, node: self.N.nodes[node.uid], port: port});
						for(var i = 0; i < self.clusters[cid].from.length; i++){
							//console.log("im connecting from cid : " + self.clusters[cid].from[i]);
							self.bind_process_cluster(uid, self.clusters[cid].from[i], true, self.clusters, cb);
						}
						for(var i = 0; i < self.clusters[cid].to.length; i++){
							//console.log("im connecting to cid : " + self.clusters[cid].to[i]);
							self.bind_process_cluster(uid, self.clusters[cid].to[i], false, self.clusters, cb);
						}
						
						self.controller.update_clusters(self.clusters);
						
						cb('Process started (pid: '+uid+', src:'+script+')')
					}
					else
						throw "Cannot start the process!"					
				})
			}
			// If we have to start the process in the browser
			else {
			
				container.push({ 
					src: script, 
					uid: uid,
					node_uid : node.uid
				});
				// call koala_node and ask him to start the new process
				node.channel.koala_remote.run_process( container[0], function(proc, started ) {
				
					if(started) {
					
						self.P.processes[proc.uid] = {
							uid: proc.uid,
							node: self.N.nodes[proc.node_uid],
							script: proc.script,
						}				
						//if(i + 1 == to_spawn)
						cb('Remote process started (pid: '+proc.uid+')')
						
						//put the process in the cluster aswell
						self.clusters[cid].processes.push({uid: uid, node: self.N.nodes[node.uid]});
						for(var i = 0; i < self.clusters[cid].from.length; i++){
							//console.log("im connecting from cid : " + cid);
							self.bind_process_cluster(uid, self.clusters[cid].from[i], true, self.clusters, cb);
						}
						for(var i = 0; i < self.clusters[cid].to.length; i++){
							//console.log("im connecting to cid : " + cid);
							self.bind_process_cluster(uid, self.clusters[cid].to[i], false, self.clusters, cb);
						}
					}
					else
						throw "Cannot start the process!"					
				})
			}
		
	}
	else {
		throw "Not enough parameters in add_worker!";
	}
}

/*
	Helper function for the add_worker functionality. Binds the given pid to 
	a cluster with id cid.
*/
var bind_process_cluster = function(pid, cid, from, clusters, cb){
	cmd = ['bind'];
	if(!from){
		cmd[1] = pid;
		//console.log("binding to cid " + cid);
		for(var i = 0; i < this.clusters[cid].processes.length; i++){
			//console.log(this.clusters[cid].processes);
			//console.log(i);
			cmd[2] =  this.clusters[cid].processes[i].uid;
			//console.log(cmd)
			this.bind_processes(cmd, cb);
		}
	}
	
	else{
		cmd[2] = pid;
		for(var i = 0; i < this.clusters[cid].processes.length; i++){
			cmd[1] =  this.clusters[cid].processes[i].uid;
			this.bind_processes(cmd, cb);
			//console.log(cmd)
		}
	}
}

/*
	Gets the values of the given varname
*/
var get_varname = function(cmd, cb){
	var varname = cmd[1];
	
	var res = [];
	for(var i = 0; i < this.runtime_register.length; i++){
		if(this.runtime_register[i].name == varname){
			var el = {};
			el[varname] = this.runtime_register[i].value;
			el.pid = this.runtime_register[i].pid;
			res.push(el);
		}
	}
	
	//console.log("[koala:root] " + varname + "" + JSON.stringify(res) + "\n");
	cb("[koala:root] " + varname + "" + JSON.stringify(res) + "\n")
}

/*
	Kills a random process given the id of the cluster containing it.
	Useful when shrinking a cluster with too many nodes. In this case
	we don't (need to) know the id of the process to be killed, anyone
	would fit.
*/
var kill_process_cluster = function(cmd, cb){
	//kill_process [cid]
	if(cmd.length == 2){
		var cid = parseInt(cmd[1]);
		var pid_to_kill;
		if(this.clusters[cid].processes.length == 0){
			cb("No more processes to kill on cluster with id " + cid );
			return;
		}
		else {
			var rand = Math.floor(Math.random() * this.clusters[cid].processes.length)
			if(this.clusters[cid].processes.length == 1)
				rand = 0;
			pid_to_kill = this.clusters[cid].processes[rand].uid;
			
			//remove it from the list of processes in the cluster
			delete this.clusters[cid].processes[rand];
			this.clusters[cid].processes = clean(this.clusters[cid].processes, undefined);
			
			cmd[1] = ""+pid_to_kill;
			
			//console.log("pid chosen to kill " + pid_to_kill);
			
			//THIS PART IS COMMENTED BECAUSE IT'S ALREADY PERFORMED IN kill_process();
		
			var unbind_cmd = ['unbind', '', ""+pid_to_kill];
			
			this.kill_process(cmd, cb);
		}
	}
}

/*
	Kills a specific process
*/
var kill_process = function(cmd, cb){
	var self = this
	
	var pid_to_kill = parseInt(cmd[1]);
	
	//TODO: remove this and check workness
	if(!this.P.processes[pid_to_kill]){
		return;
	}
	
	var node_containing_pid = this.P.processes[pid_to_kill].node;
	
	var from_arr = this.RT.getFrom(pid_to_kill);
	var to_arr = this.RT.getTo(pid_to_kill);

	for(var i = 0; i < to_arr.length; i++){
		//console.log(['unbind', ''+pid_to_kill, ''+to_arr[i]])
		this.unbind_processes(['unbind', ''+pid_to_kill, ''+to_arr[i]], cb)
	}
	
	for(var i = 0; i < from_arr.length; i++){
		//console.log(['unbind', ''+from_arr[i], ''+pid_to_kill])
		this.unbind_processes(['unbind', ''+from_arr[i], ''+pid_to_kill], cb)
	}
	
	
	//remove it from the list of processes
	delete this.P.processes[pid_to_kill];
	
	//remove it from the routing table (if it's inside)
	this.RT.removeEntry(pid_to_kill);
	
	//physically kill the process [difference between remote & k_node!]
	
	if(!node_containing_pid.remote)
		node_containing_pid.channel.koala_node.kill_process_node(pid_to_kill, node_containing_pid.uid, cb/*function(node_id){
			console.log("prima del callabck che non  chiamato");
			console.log(JSON.stringify(cb))
			cb(node_id);
		}*/);
	else{
		node_containing_pid.channel.koala_remote.kill_process_remote(pid_to_kill, node_containing_pid.uid, cb/*function(node_id){
			cb(node_id)
		}*/);
	}
	
}

/*
	Kills a node with all the processes inside it
*/
var kill_node = function(cmd, cb){


	var self = this
	var node_id_to_kill = undefined;
	var alias = undefined;
	
	//get correct alias/id from input
	if(cmd[1].indexOf("N") != -1){
		alias = cmd[1];
		node_id_to_kill = alias.replace('N', '');
	}
	else if(cmd[1].indexOf("B") != -1){
		alias = cmd[1];
		node_id_to_kill = alias.replace('B', '');
	}	
	else{
		node_id_to_kill = parseInt(cmd[1]);
		
		//check if remote or not
		for(var n in this.N.nodes){
			if(this.N.nodes[n].uid == node_id_to_kill)
				if(this.N.nodes[n].remote)
					alias = "B" + node_id_to_kill;
				else
					alias = "N" + node_id_to_kill;
		}
	}
	
	var pcss = [];
	var node = undefined;
	//get the list of all processes inside the node
	for(var pr in this.P.processes){
		if(this.P.processes[pr].node && (this.P.processes[pr].node.alias == alias || this.P.processes[pr].node.uid == node_id_to_kill)){
			pcss.push(this.P.processes[pr].uid)
			node = this.P.processes[pr].node;
		}
	}
	
	
	//call kill_process for each process
	for(var i = 0; i < pcss.length; i++){
		this.kill_process(["kill", ""+pcss[i]], function(node_id) {
			var processes_in_node = 0;
			for(var p in self.P.processes){
				if(self.P.processes[p].node && self.P.processes[p].node.uid == node_id)
					processes_in_node++;
			}
			//console.log(processes_in_node);
			if(processes_in_node == 0){
				//physically kill the node
				if(!node.remote){
					node.channel.koala_node.kill_node(cb);
				}
				else{
					node.channel.koala_remote.kill_remote(cb);
				}
			}
		});
	}
	
	//remove it from the list of nodes
	delete this.N.nodes[alias];
	for(var n in this.N.nodes)
		if(this.N.nodes[n].uid == node_id_to_kill) 
			delete this.N.nodes[n]
}

/*
	Kills a cluster, so removes it from the list of clusters and
	kills all the processes inside it
*/
var kill_cluster = function(cmd, cb){
	
	//OLD VERSION
	// var cid = cmd[1];

	// console.log("CLUSTERS");
	// console.log(this.clusters);
	// var cluster = this.clusters[cid]
	// //kill each process in the cluster
	// for(var i = 0; i < cluster.processes.length; i++){
	// 	this.kill_process(["kill", ""+cluster.processes[i].uid], function(){})
	// }
	
	// delete this.clusters[cid];
	// this.clusters = clean(this.clusters, undefined);
	// cb("Cluster with id "+ cid +" succesfully killed");
	
	// this.controller.update_clusters(this.clusters);
	var cid = cmd[1];
	//get node

	


	var node = filter(this.N.nodes, function(element) {
		return element.host == cluster.peer;
	});

	
	node.channel.koala_node.get_clusters(function(clusters) {
		for(var j = 0; j < clusters.length; j++) {
			if(clusters[j].uid == cid) {
				for(var i = 0; i < clusters[j].workers.length; i++){
				 node.channel.koala_node.kill_worker(cluster.workers[i], function(outmsg) {
					cb(outmsg);
				 });
				}
			}
		}
	});

}


/*
	Migrates a single operator from one node to another
*/
var migrate_cluster = function(cmd, cb, self){
	
	if(!self)
		self = this;
	var total_workers_number = 0;
	var alias;
	var script;
	var automatic;
	
	//cmd correct length: command, cid_to_mode, new_node_id
	if(cmd.length == 3) {
		var cid_to_move = parseInt(cmd[1]);
		var new_node_id = parseInt(cmd[2]);
		
		// console.log("migrating " +  cid_to_move + " to node " + new_node_id);
		
		var old_nodes = [];
		 console.log(clusters)
		for(var n in self.clusters) {
			if(self.clusters[n] && self.clusters[n].cid == cid_to_move) {
				old_nodes = self.clusters[n].nodes.slice()
			}
		}

		//all the nodes where the cid is deployed
		// var old_nodes = self.clusters[cid_to_move].nodes.slice();
		// console.log(old_nodes)
		//for each of those nodes gather data about the operator
		//run a new cluster in new_node_id with the same number of workers
		//bind the new cluster with the connections of the previous
		//stop the cid there in the old_node[i]
		
		//get all the operators running on the host to move
		for(var index = 0; index < old_nodes.length; index++){
			//console.log("before get_clusters");
			//control if remote
			var channel = undefined

			if(old_nodes[index].remote) {
				channel = old_nodes[index].channel.koala_remote
			} else {
				channel = old_nodes[index].channel.koala_node
			}

			channel.get_clusters(function(clusters, i){
				// console.log(clusters)
				for(var j in clusters){
					if(clusters[j] != null && clusters[j].cid == cid_to_move){
						//get the number of workers
							total_workers_number += clusters[j].workers.length;
						//and the alias (should be the same across the deployment)
						alias = clusters[j].alias;
						//and the script (same discussion as the alias)
						script = clusters[j].script;
						//and the automation (not producer = automatic usually)
						automatic = !clusters[j].producer;
					}
				}

				if(i + 1 == old_nodes.length){
					//run new operator and bind it
					
    				var new_cid = self.G.cluster_id++;
					var node = self.N.nodes[new_node_id];

					if(!alias)
						alias = "";
					
					//create the cluster entry for the array of clusters
					var cluster = {
						cid : new_cid,
						alias: alias,
						nodes: [node],
						script: script,
						processes : [],
						from : [],
						to : [],
						automatic: automatic,
					}

					// console.log(cluster)
					
					var uids = [];		
					//generate uid for each worker
					for(var k = 0; k < total_workers_number; k++)
						uids.push(self.G.process_uid++);
					
					self.clusters[cluster.cid] = cluster;

					
					//add the new cluster to the controller list
					self.controller.add_comp(new_cid);
					self.controller.update_clusters(self.clusters);

					//store the from and to of the previous binding
					var old_bindings_from = [];
					var old_bindings_to   = [];

					if(self.topologies.topologies[0].bindings != undefined) {
						for(var n = 0; n < self.topologies.topologies[0].bindings.length; n++){
							if(self.topologies.topologies[0].bindings[n].from == cid_to_move){
								old_bindings_to.push(self.topologies.topologies[0].bindings[n].to);
							}
							else if(self.topologies.topologies[0].bindings[n].to == cid_to_move){
								old_bindings_from.push(self.topologies.topologies[0].bindings[n].from);
							}
						}
					}

					run_operator(node, new_cid, script, uids, automatic, total_workers_number, alias, self, function(){
						// console.log("### run operator")
						var bindLenght = old_bindings_from.length + old_bindings_to.length
						var bindCounter = 0

						var bindCallback = function() {
							// console.log('### finished bind')
							var unbindLenght = old_bindings_from.length + old_bindings_to.length
							var unbindCounter = 0

							var unbindCallback = function() {

								// console.log('### finished unbind')

								// console.log(self.topologies.topologies[0].bindings)
								for(var n = 0; n < old_bindings_from.length; n++){
									var toRemove = -1;
									for(var j = 0; j < self.topologies.topologies[0].bindings.length; j++){
								        if(self.topologies.topologies[0].bindings[j].from == old_bindings_from[n] && self.topologies.topologies[0].bindings[j].to == cid_to_move){	
								        	toRemove = j;
								        }
								    }
								    if(toRemove >= 0) {
								    	self.topologies.topologies[0].bindings.splice(toRemove, 1);
								    }
									
								}

								//(to)
								for(var n = 0; n < old_bindings_to.length; n++){
									var toRemove = -1;
									for(var j = 0; j < self.topologies.topologies[0].bindings.length; j++){
								        if(self.topologies.topologies[0].bindings[j].from == cid_to_move && self.topologies.topologies[0].bindings[j].to == old_bindings_to[n]){	
								        	toRemove = j;
								        }
								    }

								    if(toRemove >= 0) {
								    	self.topologies.topologies[0].bindings.splice(toRemove, 1);
								    }
								}

								//remove old cluster
								for(var index = 0; index < old_nodes.length; index++) {
									var nodeTemp

									if(old_nodes[index].remote) {
										nodeTemp = old_nodes[index].channel.koala_remote
									} else {
										nodeTemp = old_nodes[index].channel.koala_node
									}
								}

								// console.log('### remove')
								nodeTemp.remove_cluster(cid_to_move, function(){
									self.clusters[cid_to_move] = undefined
									self.controller.update_clusters(self.clusters)
									cb();
								});
							}

							for(var m = 0; m < old_bindings_from.length; m++){
								// console.log('### unbind')
								unbind_clusters.apply(self, [['unbind', old_bindings_from[m], cid_to_move], function(){
									unbindCounter++

									if(unbindCounter == unbindLenght) {
										unbindCallback()
									} 
								}, true])
							}

							for(var n = 0; n < old_bindings_to.length; n++){
								// console.log('### unbind')
								unbind_clusters.apply(self, [['unbind', cid_to_move, old_bindings_to[n]], function(){
									unbindCounter++

									if(unbindCounter == unbindLenght) {
										unbindCallback()
									} 
								}, true])
							}

							if(bindLenght == 0) {
								unbindCallback()
							}
						}
						
						for(var n = 0; n < old_bindings_to.length; n++) {
							// console.log('### bind')
							bind_operators(new_cid, old_bindings_to[n], true, "round_robin", self, function(){
								bindCounter++
								// console.log('bind counter ' + bindCounter + " bind length " + bindLenght)
								if(bindCounter == bindLenght) {
									bindCallback()
								} 
							}, self)
						}

						for(var m = 0; m < old_bindings_from.length; m++) {
							// console.log('### bind')
							bind_operators(old_bindings_from[m], new_cid, true, "round_robin", self, function(){
								bindCounter++
								// console.log('bind counter ' + bindCounter + " bind length " + bindLenght)
								if(bindCounter == bindLenght) {
									bindCallback()
								} 
							}, self)
						}

						if(bindLenght == 0) {
							bindCallback()
						}
					}/*, path, only*/);
    			
				} 


			}, index)
		// } else {
		// 	old_nodes[index].channel.koala_node.get_clusters(function(clusters, i){
				
		// 		for(var j = 0; j < clusters.length; j++){
		// 			if(clusters[j] && clusters[j].cid == cid_to_move){
						
		// 				//get the number of workers
		// 				total_workers_number += clusters[j].workers.length;
		// 				//and the alias (should be the same across the deployment)
		// 				alias = clusters[j].alias;
		// 				//and the script (same discussion as the alias)
		// 				script = clusters[j].script;
		// 				//and the automation (not producer = automatic usually)
		// 				automatic = !clusters[j].producer;
		// 			}
		// 		}
			
		// 		//console.log(index +" and old_nodes.length = " + old_nodes.length);
				
		// 		//iterated through all the hosts where the operator is deployed (i is sent to get_clusters)
		// 		if(i + 1 == old_nodes.length){
		// 			//run new operator and bind it
					
  //   				var new_cid = self.G.cluster_id++;
		// 			var node = self.N.nodes[new_node_id];
					
		// 			if(!alias)
		// 				alias = "";
					
		// 			//create the cluster entry for the array of clusters
		// 			var cluster = {
		// 				cid : new_cid,
		// 				alias: alias,
		// 				nodes: [node],
		// 				script: script,
		// 				processes : [],
		// 				from : [],
		// 				to : [],
		// 				automatic: automatic,
		// 			}
					
		// 			var uids = [];		
		// 			//generate uid for each worker
		// 			for(var k = 0; k < total_workers_number; k++)
		// 				uids.push(self.G.process_uid++);
					
		// 			self.clusters[cluster.cid] = cluster;
					
		// 			//add the new cluster to the controller list
		// 			self.controller.add_comp(new_cid);
		// 			self.controller.update_clusters(self.clusters);
					
		// 			//store the from and to of the previous binding
		// 			var old_bindings_from = [];
		// 			var old_bindings_to   = [];
		// 			for(var n = 0; n < self.topologies.topologies[0].bindings.length; n++){
		// 				if(self.topologies.topologies[0].bindings[n].from == cid_to_move){
		// 					old_bindings_to.push(self.topologies.topologies[0].bindings[n].to);
		// 				}
		// 				else if(self.topologies.topologies[0].bindings[n].to == cid_to_move){
		// 					old_bindings_from.push(self.topologies.topologies[0].bindings[n].from);
		// 				}
		// 			}
					
		// 			//console.log(old_bindings_from)
		// 			//console.log(old_bindings_to)
					
		// 			run_operator(node, new_cid, script, uids, automatic, total_workers_number, alias, self, function(){
		// 				//find the bindings of the operator by querying the last operator
						
						
		// 				/*
		// 					Before this point the three for-loops were sequential.
		// 					If in the future migrate doesn't work, try to put them sequential again
		// 					(and not in the callbacks).
		// 				*/
						
		// 				//bind both from and to
		// 				//console.log("========self.clusters[3]=========");
		// 				//console.log(self.clusters[3]);
		// 				console.log(self.topologies.topologies[0].bindings);
		// 				for(var m = 0; m < old_bindings_from.length; m++){
		// 					//console.log(self.clusters[cid_to_move].from[m]);
		// 					console.log("binding from the following number of 'from': "+ self.clusters[cid_to_move].from.length + " to the cid_to_move: " + cid_to_move);
		// 					bind_operators(old_bindings_from[m], new_cid, false, "round_robin", self, function(){
		// 						console.log("bound from -> new_cid");
		// 						//delete local cid from clusters
		// 						console.log("bidning from " + cid_to_move + " to the folloeing number of 'to': " + self.clusters[cid_to_move].to.length);
		// 						for(var m = 0; m < old_bindings_to.length; m++){
		// 							bind_operators(new_cid, old_bindings_to, false, "round_robin", self, function(){
		// 								console.log("bound new_cid -> to");
		// 								//delete local cid from clusters
										
		// 								//remove old bindings from old cluster
		// 								for(var index = 0; index < old_nodes.length; index++){
		// 									console.log("cid_to_move in migration: " + cid_to_move + " with index parameter: " + index);
		// 									old_nodes[index].channel.koala_node.unbind_cluster(cid_to_move, function(i){
		// 										//[UNBIND]
		// 										//update topologies data structure (from)
		// 										for(var n = 0; n < old_bindings_from.length; n++){
		// 											var toRemove;
		// 											for(var j = 0; j < self.topologies.topologies[0].bindings.length; j++){
		// 										        if(self.topologies.topologies[0].bindings[j].from == old_bindings_from[n] && self.topologies.topologies[0].bindings[j].to == cid_to_move){	
		// 										        	toRemove = j;
		// 										        }
		// 										    }
		// 											self.topologies.topologies[0].bindings.splice(toRemove, 1);
		// 										}
												
		// 										//(to)
		// 										for(var n = 0; n < old_bindings_to.length; n++){
		// 											var toRemove;
		// 											for(var j = 0; j < self.topologies.topologies[0].bindings.length; j++){
		// 										        if(self.topologies.topologies[0].bindings[j].from == cid_to_move && self.topologies.topologies[0].bindings[j].to == old_bindings_to[n]){	
		// 										        	toRemove = j;
		// 										        }
		// 										    }
		// 											self.topologies.topologies[0].bindings.splice(toRemove, 1);
		// 										}
												
												
		// 										//remove old cluster
		// 										old_nodes[i].channel.koala_node.remove_cluster(cid_to_move, function(){
		// 											cb();
		// 										});
		// 									}, index);
		// 								}
		// 							}, self);
		// 						}
		// 					}, self);
		// 				}
						
		// 			}/*, path, only*/);
    			
		// 		}
		// 	}, index);
		// }
		}		
	}
	else {
		cb("Too few arguments for migrate!");
	}
}

var migrate_cluster_options = function(cmd, options, cb, self) {
	
	if(!self)
		self = this;
	
	if(!self.topologies || !self.topologies.topologies[0]){
		return;
	}
	var total_workers_number = 0;
	var alias;
	var script;
	var automatic;
	
	//cmd correct length: command, cid_to_mode, new_node_id
	if(cmd.length == 3) {
		var cid_to_move = parseInt(cmd[1]);
		var new_node_id = parseInt(cmd[2]);

		var old_nodes = undefined
		for(var n in self.clusters) {
			if(self.clusters[n] && self.clusters[n].cid == cid_to_move) {
				old_nodes = self.clusters[n].nodes.slice()
			}
		}

		total_workers_number = options.workers.length
		alias = options.alias;
		script = options.script;
		automatic = !options.producer;
			
		//run new operator and bind it
		var new_cid = self.G.cluster_id++;
		var node = self.N.nodes[new_node_id];

		if(!alias)
			alias = "";
		
		//create the cluster entry for the array of clusters
		var cluster = {
			cid : new_cid,
			alias: alias,
			nodes: [node],
			script: script,
			processes : [],
			from : [],
			to : [],
			automatic: automatic,
		}
		
		var uids = [];		
		//generate uid for each worker
		for(var k = 0; k < total_workers_number; k++)
			uids.push(self.G.process_uid++);
		
		self.clusters[cluster.cid] = cluster;
		
		//add the new cluster to the controller list
		self.controller.add_comp(new_cid);
		self.controller.update_clusters(self.clusters);

		//store the from and to of the previous binding
		var old_bindings_from = [];
		var old_bindings_to   = [];
		if(self.topologies.topologies[0].bindings != undefined) {
			for(var n = 0; n < self.topologies.topologies[0].bindings.length; n++){
				if(self.topologies.topologies[0].bindings[n].from == cid_to_move){
					old_bindings_to.push(self.topologies.topologies[0].bindings[n].to);
				}
				else if(self.topologies.topologies[0].bindings[n].to == cid_to_move){
					old_bindings_from.push(self.topologies.topologies[0].bindings[n].from);
				}
			}
		}

		run_operator(node, new_cid, script, uids, automatic, total_workers_number, alias, self, function(){
			// console.log("### run operator")
			var bindLenght = old_bindings_from.length + old_bindings_to.length
			var bindCounter = 0
			console.log(bindLenght)

			var bindCallback = function() {
				// console.log('### finished bind')
				var unbindLenght = old_bindings_from.length + old_bindings_to.length
				var unbindCounter = 0


				//(from)
				for(var n = 0; n < old_bindings_from.length; n++){
					var toRemove = -1;
					for(var j = 0; j < self.topologies.topologies[0].bindings.length; j++){
				        if(self.topologies.topologies[0].bindings[j].from == old_bindings_from[n] && self.topologies.topologies[0].bindings[j].to == cid_to_move){	
				        	toRemove = j;
				        	
				        	var existing_operator = self.clusters[self.topologies.topologies[0].bindings[j].from]
					    	for(var nn in existing_operator.nodes) {
					        	var nodeTemp = undefined

						    	if(existing_operator.nodes[nn].remote) {
									nodeTemp = existing_operator.nodes[nn].channel.koala_remote
								} else {
									nodeTemp = existing_operator.nodes[nn].channel.koala_node

									var from_cid = self.topologies.topologies[0].bindings[j].from
									var to_cid = cid_to_move
									nodeTemp.unbind_remote(from_cid, to_cid, undefined, undefined, function(){}, undefined)
								}
					    	}
				        }
				    }
				    if(toRemove >= 0) {
				  //   	console.log(self.proxy)
				  //   	self.proxy.send({ 
						// 	cmd:'del_rt', 
						// 	from: self.topologies.topologies[0].bindings[toRemove].from,
						//     to:  cid_to_move
						// })

						self.topologies.topologies[0].bindings.splice(toRemove, 1);
				    }
					
				}
				
				//(to)
				for(var n = 0; n < old_bindings_to.length; n++){
					var toRemove = -1;
					for(var j = 0; j < self.topologies.topologies[0].bindings.length; j++){
				        if(self.topologies.topologies[0].bindings[j].from == cid_to_move && self.topologies.topologies[0].bindings[j].to == old_bindings_to[n]){	
				        	toRemove = j;

				        	var existing_operator = self.clusters[self.topologies.topologies[0].bindings[j].to]
					    	for(var nn in existing_operator.nodes) {
					        	var nodeTemp = undefined

						    	if(existing_operator.nodes[nn].remote) {
									nodeTemp = existing_operator.nodes[nn].channel.koala_remote
								} else {
									nodeTemp = existing_operator.nodes[nn].channel.koala_node

									var from_cid = cid_to_move
									var to_cid = self.topologies.topologies[0].bindings[j].to
									nodeTemp.unbind_remote(from_cid, to_cid, undefined, undefined, function(){}, undefined)
								}
					    	}
				        }
				    }

				    if(toRemove >= 0) {
				  //   	self.proxy.send({ 
						// 	cmd:'del_rt', 
						// 	from: cid_to_move,
						//     to:  self.topologies.topologies[0].bindings[toRemove].to
						// })
				    	self.topologies.topologies[0].bindings.splice(toRemove, 1);
				    }
				}
			}

			for(var n = 0; n < old_bindings_to.length; n++) {
				// console.log('### bind')
				bind_operators(new_cid, old_bindings_to[n], true, "round_robin", self, function(){
					bindCounter++
					if(bindCounter == bindLenght) {
						bindCallback()
					} 
				}, self)
			}

			for(var m = 0; m < old_bindings_from.length; m++) {
				// console.log('### bind')
				bind_operators(old_bindings_from[m], new_cid, true, "round_robin", self, function(){
					bindCounter++
					if(bindCounter == bindLenght) {
						bindCallback()
					} 
				}, self)
			}

			if(bindLenght == 0) {
				bindCallback()
			}
		}/*, path, only*/);	
	} else {
		cb("Too few arguments for migrate!");
	}
}

/*
	Migrates a single worker to a destination node. Not in line with the 
	new data structures, has to be refactored or deleted if functionality
	is useless. Anyways, is not connected to the console commands (can't be invoked)
	as of now.
*/
var migrate_single_worker = function(cmd, cb){
	var self = this;
	if(cmd.length == 3) {
		var script = this.P.processes[proc_id_to_move].script
		
		//get current connections of the process
		var connections = this.RT.getTo(proc_id_to_move);
		
		//get current process that sends things to proc_id_to_move
		var producers_for_this = this.RT.getFrom(proc_id_to_move);
		
		//kill the current process
		this.kill_process(["kill", ""+proc_id_to_move], function(){});
		
		//prepare the callback
		var callback = function(new_process){
			//if producer
			for(var i = 0; i < connections.length; i++){
				self.bind_processes(["bindw", ""+new_process.uid, ""+connections[i]], cb);
			}
			
			//if consumer
			for(var i = 0; i < producers_for_this.length; i++){
				self.bind_processes(["bindw", ""+producers_for_this[i], ""+new_process.uid], cb);
			}
		}
		
		//run it elsewhere
		this.run_new_process(["runw", script, ""+new_node_id], cb, callback);
		
	}
	else {
		cb("Too few arguments for migrate!");
	}
}

/*
	Returns the cluster containing such uid
*/
var get_cluster = function(uid, self){

	if(!self)
		self = this;
	
	for(var i = 0; i < self.clusters.length; i++){
		for(var j = 0; j < self.clusters[i].processes.length; j++){
			if(uid == self.clusters[i].processes[j].uid)
				return self.clusters[i].cid;
		}
	}
}


var deleteNode = function(nid) {

	// var pcss = [];
	// var node = undefined;
	// //get the list of all processes inside the node
	// for(var pr in this.P.processes){
	// 	if(this.P.processes[pr].node && (this.P.processes[pr].node.alias == alias || this.P.processes[pr].node.uid == node_id_to_kill)){
	// 		pcss.push(this.P.processes[pr].uid)
	// 		node = this.P.processes[pr].node;
	// 	}
	// }
	
	
	// //call kill_process for each process
	// for(var i = 0; i < pcss.length; i++){
	// 	this.kill_process(["kill", ""+pcss[i]], function(node_id) {
	// 		var processes_in_node = 0;
	// 		for(var p in self.P.processes){
	// 			if(self.P.processes[p].node && self.P.processes[p].node.uid == node_id)
	// 				processes_in_node++;
	// 		}
	// 		//console.log(processes_in_node);
	// 		if(processes_in_node == 0){
	// 			//physically kill the node
	// 			if(!node.remote){
	// 				node.channel.koala_node.kill_node(cb);
	// 			}
	// 			else{
	// 				node.channel.koala_remote.kill_remote(cb);
	// 			}
	// 		}
	// 	});
	// }
	
	// //remove it from the list of nodes
	// delete this.N.nodes[alias];
	// for(var n in this.N.nodes)
	// 	if(this.N.nodes[n].uid == node_id_to_kill) 
	// 		delete this.N.nodes[n]
}



/*
	Data collection for the PID algorithm
*/
var collect_index = -1;
var collect_times = new Array();

var collect_data = function(cb) {
	var node;
	var data_all = new Array();
	var self = this;
	var i = 1;
	var tot_cpu = 0;
	var CPU_IDLE = 0;
	var self = this;
	var tot_cpu = 0;
	var node_cpu = [];
	
	for(var i = 0; i < this.N.nodes.length; i++){
		
		//console.log("collect data cpu usage for node " + this.N.nodes[i].uid);
		//to be fixed: the processors variable is not set if the node is a remote!
		//either have it in some way, fix it to some value or dunno
		if(this.N.nodes[i].processors){
			tot_cpu = tot_cpu + this.N.nodes[i].processors.length;
			node_cpu[i] = this.N.nodes[i].processors.length;
		}
		
		if(this.N.nodes[i].remote){
			//collect cpu on remote to be implemented (or fixed to single value)
		}
		
		else{
			if(this.N.nodes[i].channel) {
			this.N.nodes[i].channel.koala_node.cpu_collect(i, function(i, cpu_usage){
				//console.log("asked for cpu_collect : " + JSON.stringify(cpu_usage));
				//save current processes in the correct node variable
		    	self.N.nodes[i].processors = cpu_usage.slice();
		    	
		    	//console.log(cpu_usage);
		    	
		    	//if it's first time do nothing
		    	if(!self.N.nodes[i].previous_tick_processors){
		    		//set variable for next time
		    		self.N.nodes[i].previous_tick_processors = cpu_usage.slice();
		    	}
		    	
		    	
		    	//else do something: compute percentage from delta!
		    	else{
		    		var TMP_CPU_PCT = "";
		    		//console.log("in the else");
		    		for(var index = 0, len = cpu_usage.length; index < len; index++) {
		    						
		    			//console.log("CPU %s:", index);
		    			var cpu = self.N.nodes[i].processors[index], total = 0;
		    			var prev_cpu = self.N.nodes[i].previous_tick_processors[index];
		    			var total = 0;
		    			var total_idle = cpu.times["idle"] - prev_cpu.times["idle"];
		    			//for each type compute delta
		    			for(type in cpu.times){
		    				//console.log(cpu.times[type] +"-"+ prev_cpu.times[type])
	        				total += cpu.times[type] - prev_cpu.times[type];
		    			}
		    			
		    			//WRONG ITERATING ON ALL THE TIMES AND SUMMING THEM!!
		    			
		    			
		    			
		    			
		    			
		    			//SOMETHING WRONG IN THIS CALCULATION!!!! THE IDLE IS ILL COMPUTED!!!
			
		
		    			if(total === 0){
		    				CPU_IDLE += 100;
		    			}
		    			else {
		    				var idle_result = Math.round(100 * (cpu.times["idle"] - prev_cpu.times["idle"])/ total);
		    				//var idle_result = Math.round(100 * (cpu.times["idle"] - prev_cpu.times["idle"]) / total_idle);
		    				//console.log("idle for this processor: " + idle_result);
		    				CPU_IDLE += idle_result;
		    			}
		    		
		    		}//close for
		    		
		    		//console.log(CPU_PCT);
		    		//CPU_PCT = TMP_CPU_PCT;
		    		//console.log(CPU_IDLE + "/" + tot_cpu);
		    		CPU_PCT = CPU_IDLE / node_cpu[i];
		    		self.N.nodes[i].previous_tick_processors = cpu_usage.slice();
		    		//console.log("CPU usage test: " + JSON.stringify(CPU_PCT))
		    		
		    		//if CPU_PCT is very low then move something
		    		if(CPU_PCT <= 25){
		    			//find the cluster with highest number of workers (you can check it)
		    			self.N.nodes[i].channel.koala_node.get_clusters(function(clstrs){
		    				var max = 0;
		    				var bottleneck_index;
		    				for(var c = 0; c < clstrs.length; c++){
		    					//console.log(clstrs);
		    					if(clstrs[c] && clstrs[c].workers.length > max){
		    						max = clstrs[c].workers.length;
		    						bottleneck_index = c;
		    					}
		    				}
		    				//if more than one machine, find a free machine
		    				find_host(self, function(node_index /*, index*/){
		    					
		    					//if only one machine connected, or this machine is the least used (all used)
		    					//console.log("NODE INDEX = " + node_index);
		    					if(node_index === -1 || !node_index || node_index === bottleneck_index){
		    						return;
		    					}
			    				//call migrate on that cluster on the free machine
			    				migrate_cluster(['migrate', clstrs[bottleneck_index].cid, node_index], function(){
			    					self.N.nodes[node_index].channel.koala_node.start_controller();
			    				}, self);
			    				
			    			}, bottleneck_index);
		    			}, 0);
		    		}
		    	}
			});
		}
	}
	}
	
	this.controller.compute_workers(tot_cpu);
	
	var counter = 0;
	collect_index++;
	collect_times[collect_index] = [];
	
	//console.log("creating timeout for check_add_worker");
	//collect_times[collect_index]['to'] = setTimeout(check_add_worker, 5000, self, collect_index);
	
	//iterates through all the processes, creates the entry for the waiting matrix
	//if it's a producer don't add it to the matrix as it doesn't need adds
	for(var pr in this.P.processes){
		var c_id = get_cluster(this.P.processes[pr].uid, this)
		if(!this.clusters[c_id])
			console.log(this.P.processes[pr].uid)
		
		if(this.clusters[c_id] && this.clusters[c_id].automatic)
			collect_times[collect_index][this.P.processes[pr].uid] = false;
		
		counter++;
		
	}
	
	for(var pr in this.P.processes){
		node = this.P.processes[pr].node;
		
		
		//added check on this.P.processes[pr] because sometimes undefined. try to figure out why, this solution should be temporary
		//because it's index of a more deeply radicated bug.
		if(node && !node.remote && this.P.processes[pr])
			node.channel.koala_node.data_collect(this.P.processes[pr].uid, pr, collect_index, function(data, pr, isProducer, exec_time, AVG, rcvd, ci){
				
				if(self.P.processes[pr])
					collect_times[ci][self.P.processes[pr].uid] = true;
				
				//this check is needed. the reason is that while this process is gathering data
				//from the various workers around the topology, workers may be killed in the 
				//meantime, effectively breaking this code. This solution may be not temporary as
				//i don't see any other way to do this.
				if(self.P.processes[pr]) {
					//console.log("data collect reply in k_root_command with data = " + data + " in uid " + self.P.processes[pr].uid);
					
					data_all.push({
						uid: self.P.processes[pr].uid,
						data: data,
						rcvd: rcvd,
						isProducer: isProducer,
						exec_time : exec_time,
						avg : AVG,
					})
					
					
	    			
	    			
	    			
	    				/*for(var index = 0, len = cpu_usage.length; index < len; index++) {
    						console.log("CPU %s:", index);
    						var cpu = cpu_usage[index], total = 0;
    						for(type in cpu.times)
        						total += cpu.times[type];

   							for(type in cpu.times)
        						console.log("\t", type, Math.round(100 * cpu.times[type] / total));
						}*/
						
				
				//console.log("cpu usage: " + cpu_usage + "% for uid " + self.P.processes[pr].uid);
				
				//all_data_collected
				var cid = get_cluster(self.P.processes[pr].uid, self)
				
				//console.log(rcvd)
				
				all_data_collected[cid][self.P.processes[pr].uid] = {
						uid: self.P.processes[pr].uid,
						data: data,
						rcvd : rcvd,
						isProducer: isProducer,
						exec_time : exec_time,
						avg : AVG,
					}
				}
				if(i == counter){
					// last element
					//console.log(ci)
					
					cb(all_data_collected);
				}
				else
					i++;
				
			});
		else if(node && node.remote && this.P.processes[pr]){
			node.channel.koala_remote.data_collect(this.P.processes[pr].uid, function(data){
				
				//reasons for this check are explained in the same check which is up here,
				//for the !node.remote code.
				if(self.P.processes[pr]) {
					data_all.push({
						uid: self.P.processes[pr].uid,
						data: data,
					})
				}
				
				//console.log("i = " + i + " and counter = " + counter);
				
				if(i == counter){
					// last element
					cb(data_all);	
				}
				else
					i++;
			});
		}
		
		else{
			i++;
			//console.log("data algorithm, else condition not a node and not a node_remote nor node_local");
		}
	}
}



/*
	===================================================================================
	= The following is a series of callbacks created with the intention to run on 	  =
	= a koala_node.js process. The idea is that koala_node.js cannot contact directly =
	= k_root_commands.js, thus it needs a way to ask something (i.e. uids for new     =
	= workers. The following callbacks are stored in koala_node.js and solve          =
	= these kind of problems.      													  =
	===================================================================================
*/



/*
	This function sets in the newly born node (newly connected node) a graceful kill
	callback, which basically will tell this script that there is a worker not receiving
	work, thus it has to be killed. This will then trigger a call to kill the process
	removing it from routing table / process array / cluster array-object and tell
	the controller that a worker no longer exists.
*/
var add_graceful_kill_callback = function(nid){
	var self = this;
	this.N.nodes[nid].channel.koala_node.set_graceful_kill_calback(function(pid_to_kill) {
		
		//find the cluster containing the worker to kill
		var cid;
		for(var i = 0; i < self.clusters.length; i++){
			for(var j = 0; j < self.clusters[i].processes.length; j++){
				if(self.clusters[i].processes[j].uid == pid_to_kill){
					cid = i;
				}
			}
		}
		
		//we don't want to kill the only process remaining.
		if(self.clusters[cid].processes.length == 1)
			return;
		
		//remove the process from the list of processes in the cluster
		for(var i = 0; i < self.clusters[cid].processes.length; i++){
			if(self.clusters[cid].processes[i].uid == pid_to_kill){
				//remove it from the list of processes in the cluster
				delete self.clusters[cid].processes[i];
				self.clusters[cid].processes = clean(self.clusters[cid].processes, undefined);
				self.controller.update_clusters(self.clusters);
			}
		}
		
		//remove the process from the list of processes in P
		for(var i = 0; i < self.P.processes.length; i++){
			if(self.P.processes[i] && self.P.processes[i].uid == pid_to_kill)
				delete self.P.processes[i]
		}
		
		//unbind process starts here
		if(!self.unbind_counter)
			self.unbind_counter = new Array();
		
		self.unbind_counter[pid_to_kill] = 0;
		
		var that = self;
		
		//get every connection this worker receives
		for(var i = 0; i < self.clusters[cid].from.length; i++){
			//iterating through all the clusters connected TO the cluster which contains the worker to shut off
			for(var j = 0; j < self.clusters[self.clusters[cid].from[i]].processes.length; j++){
				//iterating through each worker inside the cluster connected TO the one containing the worker that has to die
				//issue the unbind
				
				var unbind_cmd = ["unbind", ""+self.clusters[self.clusters[cid].from[i]].processes[j].uid, ""+pid_to_kill];
				self.unbind_processes(unbind_cmd, function(length){
					self.unbind_counter[pid_to_kill]++;
					//when all responded, kill
					if(self.unbind_counter[pid_to_kill] == length){
						self.unbind_counter[pid_to_kill] = 0;
						//call to kill the process that is ready to be killed
						self.kill_process(["kill", ""+pid_to_kill], function(node_id){
							//console.log("Process " + pid_to_kill + " killed which was in cluster cid " + cid)
							self.controller.kill_process(self.clusters, cid);
						});
					}
					
				}, self.clusters[self.clusters[cid].from[i]].processes.length);
			}
		}
		
	});
}

/*
	This function adds a callback in the newly connected node. It let the node contact the ROOT for a
	new uid for its workers. When the host-level (also cluster-level?) controller has to create a new
	worker, it has to contact the ROOT to get the next available uid, in order to avoid having two 
	workers with the same id. Only root can do that by storing this counter.
*/
var add_uid_callback = function(nid){
	var self = this;
	this.N.nodes[nid].channel.koala_node.set_get_uid_cb(function(cid, script, producer) {
		var uid = self.G.process_uid++;
		//console.log("in k_root_commands the cb of set_get_uid_cb called");
		
		//@WARNING
		//calling !producer because in the following executions it is called "automatic"
		//console.log("creating worker with cid = " + cid + " uid = " + uid);
		self.N.nodes[nid].channel.koala_node.run_worker(cid, script, uid, !producer);
	});
}

/*
	This function adds a callback in the newly connected node. It let the node contact the ROOT for a
	new Operator in the Peer. When the host-level (also cluster-level?) controller has to create a new
	Operator, it has to contact the ROOT. The ROOT will help creating the Operator in some place.
	@param {number} ID of the Peer where the function has to be set.
*/
var add_add_operator_callback = function(nid){
	var self = this;
	this.N.nodes[nid].channel.koala_node.set_add_operator_callback(function(new_cid, script, uids, automatic, to_spawn, alias){
		//this is done to maintain consistency
		self.G.cluster_id++;
		for(var k = 0; k < to_spawn; k++)
			self.G.process_uid++
		
		if(self.topologies.topologies.length == 0) {
			self.topologies.topologies = [];
			var mainTopology = {
				tid: 1,
				operators: []
			}
			self.topologies.topologies.push(mainTopology);
		}


		var operators = self.topologies.topologies[0].operators;
	
		
	
		var operator = {
			oid: new_cid,
			peer: self.N.nodes[nid].host,
			script: script,
			browser: self.N.nodes[nid].remote,
			topology: "main",
			automatic: automatic,
		};
		if(typeof(operators) === undefined) {
			self.topologies.topologies[0].operators = [];
		} 
		self.topologies.topologies[0].operators[new_cid] = operator;
		
		if(self.topologies.topologies[0].operators[new_cid].workers == undefined) {
			self.topologies.topologies[0].operators[new_cid].workers = [];
		}
	
		//UPDATE TOPOLOGY
		for (var i = 0; i < uids.length; i++) {
			var newWorker = {
				wid: uids[i],
				href: "/topologies/example/operators/"+new_cid+"/workers/"+uids[i],
	            operator: "/topologies/example/operators/"+new_cid,
	            automatic: automatic,
	            //TODO: ADD   UPTIME, MESSAGES, REQ-RES-STATION
			}; 
			self.topologies.topologies[0].operators[new_cid].workers.push(newWorker);
		};
	
	
		//create the cluster entry for the array of clusters
		var cluster = {
			cid : new_cid,
			alias: alias,
			nodes: [self.N.nodes[nid]],
			script: script,
			processes : [],
			from : [],
			to : [],
			automatic: automatic,
		}
	
		
		self.clusters[cluster.cid] = cluster;
		//add the new cluster to the controller list
		self.controller.add_comp(new_cid);
		self.controller.update_clusters(self.clusters);
		
		var container = [];
		
		all_data_collected[new_cid] = new Array();
	});
}

var add_bind_callback = function(nid) {
	var self = this;
	this.N.nodes[nid].channel.koala_node.set_bind_callback(function(from, to, aliases, protocol){
		//UPDATE TOPOLOGY
		if(!self.topologies.topologies[0].bindings) {
			self.topologies.topologies[0].bindings = [];
		}
		var c1;
		var c2;
		//clusters value
		if(!aliases){
			c1 = self.clusters[from];
			c2 = self.clusters[to];
			//console.log("from : " + from + " to: " + to + " " + JSON.stringify(c1) + " " + JSON.stringify(c2));
		}
		else {
			for(var i = 0; i < self.clusters.length;i++){
				//overwriting from and to because they will be used later when calling the actual bind
				if(self.clusters[i].alias === from){
					c1 = self.clusters[i];
					from = self.clusters[i].cid;
				}
				else if(self.clusters[i].alias === to){
					c2 = self.clusters[i];
					to = self.clusters[i].cid;
				}
			}
		}
	
		//update clusters
		c1.to.push(c2)
		c2.from.push(c1);
	
		// var from_id = ;
		var binding = {
				from: c1.cid,
				to: c2.cid,
				type: protocol
		};
		self.topologies.topologies[0].bindings.push(binding);	
	});
}


/*
	This function adds a callback in the newly connected node. It let the node contact the ROOT for a
	unbind Operator procedure. When the host-level (also cluster-level?) controller has to unbind an
	Operator, it has to contact the ROOT. The ROOT will help unbinding the Operator in some place.
	@param {number} ID of the Peer where the function has to be set.
*/
var add_unbind_callback = function(nid) {
	var self = this;
	this.N.nodes[nid].channel.koala_node.set_unbind_callback(function(from, to){
		
		var cluster_from = self.clusters[find_cluster(from, self)];
		var cluster_to = self.clusters[find_cluster(to, self)];
		
		console.log("unbinding " + cluster_from.cid + " --//--> " + cluster_to.cid);
		
		
		
		var toRemove;
		for(var j = 0; j < self.clusters[from].to.length; j++){
			if(self.clusters[from].to[j].cid == cluster_to.cid){
				toRemove = j;
				console.log("to remove found: " + j + " for " + cluster_from.cid + " unbinding " + cluster_to.cid);
			}
		}
		
		if(toRemove)
			self.clusters[from].to.splice(toRemove, 1);
		
		var toRemove = undefined;
		
		for(var j = 0; j < self.clusters[to].from.length; j++){
			if(self.clusters[to].from[j].cid === cluster_from.cid){
				toRemove = j;
				console.log("to remove found: " + j + " for " + cluster_from.cid + " unbinding " + cluster_to.cid);
			}
		}
		
		if(toRemove)
			self.clusters[to].from.splice(toRemove, 1);
	
		console.log(self.clusters[from]);
		//update topologies data structure
		del(self.topologies.topologies[0].bindings, function(element) {
			return element.from == cluster_from.cid && element.to == cluster_to.cid;
		});
	});
}

/*
	This function triggers the migrate here in the root from a koala_node.js process.
	It is needed because koala_node.js has no other means to contact the root and
	from the JavaScript API I have to be able to send a migrate command.
	@param {number} ID of the Peer where the function has to be set.
*/
var add_migrate_callback = function(nid) {
	var self = this;
	this.N.nodes[nid].channel.koala_node.set_migrate_callback(function(cid_to_migrate, node_url, cb){ 
		var node_id;
		if(!node_url){
			node = find_host(self, function(node_index /*don't need second param here*/){
				var cmd = ["migrate", ""+cid_to_migrate, ""+node_index];
				//build command and send
				migrate_cluster(cmd, cb, self);
			}, 0);
		}
		else{
			for(var i = 0; i < self.N.nodes.length; i++){
				//find the one sent
				if(self.N.nodes[i].host == node_url){
					var cmd = ["migrate", ""+cid_to_migrate, ""+i];
					//build command and send
					migrate_cluster(cmd, cb, self);
				}
			}
		}	
	});
}

/*
	Function to setup the Commands Manager by storing R.
	@param: {Object} R Registry with all the values of the cluster.
	@param: {Object} G Global variables
	@param: {Object} P List of processes running
	@param: {Object} RT The Routing Table object
	@param: {Object} px The proxy forked process (koala_proxy)
	@param: {Object} K The global variable configurations
	@param: {Object} clusters The list of clusters with cluster id 
					 and list of processes running
	@param: {Object} runtime_register the runtime_register of the messages
*/
var CommandsManager = function( N, G, P, RT, px, K, clusters, topologies, runtime_register, controller) {
	
	this.N = N			                     // Nodes (koala_node + browsers)
	this.G = G			                     // Global variables (ports, ...)
	this.P = P			                     // Processes (eg prod.js, cons.js, ...)
	this.RT = RT		                     // Routing table object (k_routing_table)
	this.proxy = px		                     // Proxy forked process (koala_proxy)
	this.K = K			                     // Cluster global configurations (contains proxy port)
	this.clusters = clusters                 // cluster of processes
	this.topologies = topologies			 // Topologies
	this.runtime_register = runtime_register // runtime register of the messages
}

CommandsManager.prototype = {
	generate_worker_uid : generate_worker_uid,
	generate_operator_cid : generate_operator_cid,
	bind_process_cluster : bind_process_cluster,
	get_nodes : get_nodes,
	get_remotes : get_remotes,
	get_nodes_names : get_nodes_names,
	get_remotes_names : get_remotes_names,
	get_scripts : get_scripts,
	get_bindings : get_bindings,
	get_processes : get_processes,
	get_clusters : get_clusters,
	get_connections: get_connections,
	get_bindings_cli : get_bindings_cli,
	run_new_cluster : run_new_cluster,
	find_host : find_host,
	find_browser: find_browser,
	run_operator : run_operator,
	run_new_process : run_new_process,
	bind_processes : bind_processes,
	unbind_processes : unbind_processes,
	bind_clusters : bind_clusters,
	bind_operators : bind_operators,
	unbind_clusters : unbind_clusters,
	get_varname : get_varname,
	add_worker : add_worker,
	migrate_cluster : migrate_cluster,
	migrate_cluster_options : migrate_cluster_options,
	kill_process_cluster : kill_process_cluster, 
	kill_process : kill_process,
	kill_node : kill_node,
	kill_cluster : kill_cluster,
	collect_data : collect_data,
	addController : addController,
	start_controller : start_controller,
	add_graceful_kill_callback : add_graceful_kill_callback,
	add_uid_callback : add_uid_callback,
	add_migrate_callback : add_migrate_callback,
	add_add_operator_callback : add_add_operator_callback,
	add_bind_callback : add_bind_callback,
	add_unbind_callback : add_unbind_callback,
	set_remote_bindings : set_remote_bindings,
	get_remote_bindings : get_remote_bindings,
	get_paths : get_paths,
	nowjs_leave: nowjs_leave,
	new_path : new_path,
	has_path : has_path,
	get_script_from_path : get_script_from_path,
	add_pid_to_path : add_pid_to_path,
	new_remote_bindings: new_remote_bindings,
	new_remote_workers: new_remote_workers,
	set_random_token: set_random_token
}

var fs = require('fs');



module.exports = CommandsManager

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
	Select the element according to the predicate function
*/
var filter = function(collection, predicate)
{
    var result;
    var length = collection.length;

    for(var j = 0; j < length; j++)
    {
        if(predicate(collection[j]))
        {
             result = collection[j];
        }
    }
    return result;
}



function del(collection, f) {

	var result;
	var toRemove;
    var length = collection.length;
    for(var j = 0; j < length; j++)
    {
        if(f(collection[j]))
        {	
        	toRemove = j;
        }
    }
    collection.splice(toRemove, 1);
    return collection;
}

	