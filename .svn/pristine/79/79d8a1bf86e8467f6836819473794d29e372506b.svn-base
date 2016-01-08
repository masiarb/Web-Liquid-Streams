var debug = require('debug')
var log = {
	node: debug('wls:node'),
  	runc: debug('wls:node:runc'),
  	bindc: debug('wls:node:bindc')
}

/**
 * == Koala Cluster == NODE process ==
 *
 * MIT licence 
 *
 */

process.on('error', function(error) {
	console.log('--> '+error) 
})

//
// Globals
//
var andrea_controller = false;
var limit_counter = 64;
var dnode = require('dnode')
var net = require('net');
var g = require('./k_globals/globals.js')
var os = require('os')
var cp = require('child_process');
var OS = require('os');
var fs = require('fs');
var mod_overcpu = require('./overcpu/build/Release/overcpu');
var ocpu = new mod_overcpu.OverCpu();
//var ocpu = {setUpdateInterval : function(){}};
var PORT = 9088;
ocpu.setUpdateInterval(500);
var Controller = require('./controller/host_controller.js');
var controller = new Controller( collect_data, add_worker, get_ans_rate )

var graceful_kill_cb;
var get_uid_cb;
var migrate_cb;
var operator_cb;
var unbind_cb;
var bind_cb;
var clusters = new Array();
var this_node;
var all_data_collected = new Array();
/*
	Stuff for data gathering
*/
var start = new Date().getTime() / 1000;
var cumulative_add = 0;
var cumulative_rem = 0;
/*
	Variable for Andrea's controller on the Server.
	connections[cid] = {
		__throughput : {
			startingSampleDate : ... -> date of beginning in ms
			in : ... -> effective tp in
			out : ... -> effective tp out
			throughputIn : ... -> computed tp in (tp in / (data fine - data inizio))
			throughputOut : ... -> computed tp out (tp out / (data fine - data nizio))
		}
		limitCounter : ... -> numero di worker nell'operatore quando hai raggiunto il limite
		limitReached : ... -> boolean che mi dice se ho raggiunto il limite
		__workerCounter : ... -> numero di workers nell operator cid
		__lastSampledThroughputOut : ... -> last value of tp out
		__workersLastUsed : [
		   uid : number_of_usages -> conta quanti messaggi sono stati processati dal worker con id uid (reset at every cycle)!
		]
		__message_pool : ... (this is the queue, we don't have a queue...)
	}
*/

if(andrea_controller){
	var connections = new Array();
	var samplingMessages = 10;
	var andrea_control = require("./controller/server_browser_controller.js");
	
	/*var to_andrea_check = setInterval(function(){
		for(var i = 0; i < clusters.length; i++){
			var msg = { cid: clusters[i].cid};
			if((samplingMessages * clusters[msg.cid].workers.length) === connections[msg.cid].__throughput.out){
			//compute tpin tpout
			var now = (new Date()).getTime();
			//connections[msg.cid].__throughput.throughputIn = connections[msg.cid].__throughput.in / ((now - connections[msg.cid].__throughput.startingSampleDate)/1000);
			//from the other controller!
			
			var clust = getControllerClusters();
			connections[msg.cid].__throughput.throughputIn = clust.req_rate;
			connections[msg.cid].__throughput.throughputOut = connections[msg.cid].__throughput.out / ((now - connections[msg.cid].__throughput.startingSampleDate)/1000);
			console.log( "connections[msg.cid].__throughput.in / (now - connections[msg.cid].__throughput.startingSampleDate) = " + connections[msg.cid].__throughput.in + " / (" + now + " - " + connections[msg.cid].__throughput.startingSampleDate + ")");
			console.log("tpIn (other controller): " + connections[msg.cid].__throughput.throughputIn + " , tpOut: " + connections[msg.cid].__throughput.throughputOut);
			//call andrea's controller
			andrea_control.runController(connections, msg.cid, add_worker);
			
			//empty the __workersLastUsed variable
			connections[msg.cid].__workersLastUsed = {}
	        connections[msg.cid].__throughput = {
	          startingSampleDate: (new Date()).getTime(),
	          in: 0,
	          out: 0,
	          throughputIn: 0,
	          throughputOut: 0
	        }
		}
	}
	}, 1000);*/
}
 
/*
	If an argument has been given when running koala_node.js this is the port of the RPC channel
*/
if(process.argv[2])
	PORT = parseInt(process.argv[2]);

//===heartbeat data gathering
var hb_data = new Array();
//function that checks the data received
var hb_check = function(){
	//BLOCK the use of the controller before testing!!!!
	//console.log(hb_data)
	//check data received vs. clusters/workers
	var data = new Array();
	for(var i = 0; i < clusters.length; i++){
		//if a cluster is removed, the entry stays undefined, this is a safe-check to that
		//in the future a sanitization of the arrays may be thought, and this statement
		//won't affect the result after the sanitization too.
		if(clusters[i]){
			data[clusters[i].cid] = new Array();
			//iterate on the workers uids
			for(var j = 0; j < clusters[i].workers.length; j++){
				//same as before
				if(clusters[i].workers[j] && hb_data[clusters[i].workers[j].uid]){
					
					//check that the worker replied
					//5 because check every 5 sec
					if(hb_data[clusters[i].workers[j].uid].length < 5){
						//if somebody did not answer, add a worker?
						console.log("somebody did not answer, length hb_data[uid] < 5");
					}
					else{
						//put it into the data array
						data[clusters[i].cid].push(hb_data[clusters[i].workers[j].uid]);
						
						
						
						/*
						//aggregate results to use the data received to compute if workers are needed
						var aggr_sent = 0;
						var aggr_rcvd = 0;
						for(var k = 0; k < hb_data[clusters[i].workers[j].uid].length; k++){
							aggr_send += hb_data[clusters[i].workers[j].uid][k].data;
							aggr_rcvd += hb_data[clusters[i].workers[j].uid][k].rcvd;
						}
						
						var aggregated_result = {
							data: Math.floor(aggr_send / hb_data[clusters[i].workers[j].uid].length),
							rcvd: Math.floor(aggr_rcvd / hb_data[clusters[i].workers[j].uid].length)
						};*/
						
						
						
					}
				}
			}
		}
	}
	
	if(data){
		//console.log(data);
		//use same function as Controller, send the aggregated_result to it
		controller.data_analysis(data);
		hb_data = new Array();
	}
}
//interval that calls the hb_check function every 5 secs
//var hb_control = setInterval(function(){hb_check();}, 5000);
//===end heartbeat data gathering


/*
	Data collect callback is a callback that is called each time the data needs to
	be collected by the controller.
*/
var cbid = 0
var cbtable = {}
var data_collect_cb = function(data, ci, cluster, index, exec_time, AVG, rcvd) {
		
		//console.log("============= finally callback calling!: " + (rcvd_index[ci] + 1) +" ==  " + counter_array[ci]);
		
		if(!clusters[cluster])
			return	
		//check because it may happen that a worker responds to the message
		//and then suicides since it has not much work to do.
		if(clusters[cluster].workers[index])
			collect_times[ci][clusters[cluster].workers[index].uid] = true;
		
		if(!all_data_collected[clusters[cluster].cid])
			all_data_collected[clusters[cluster].cid] = new Array();
		
		if(clusters[cluster].workers[index])
			all_data_collected[clusters[cluster].cid][clusters[cluster].workers[index].uid] = {
				uid: clusters[cluster].workers[index].uid,
				data: data,
				rcvd : rcvd,
				isProducer: clusters[cluster].producer,
				exec_time : exec_time,
				avg : AVG,
			}
		
		if(rcvd_index[ci] + 1 == counter_array[ci]){
			// last element
			controller_cb[ci](all_data_collected);
		}
		else{
			rcvd_index[ci]++;
		}
};

//index: cid, { from: x, to: y}
var bindings = new Array();

var hostname = os.hostname();
if(hostname == "neha")
	hostname = "neha.inf.unisi.ch";
console.log(hostname);
var K = {
	HTTP : { port: 9080 },
	RPC : { port: PORT },
	//TODO change to os.hostname()
	PROXY : { host: hostname, port_ZMQ: PORT+1, port_HTTP: PORT+2 } //DONT USE LOCALHOST
}

/*
	Global (to the host) variables and constants
*/

var H = {
	current_free_port : PORT+4,
	proxy : { host: hostname, port_ZMQ: PORT+1, port_HTTP: PORT+2 }
}

var proxy = cp.fork('./koala_proxy.js', [ K.PROXY.port_HTTP ]);
proxy.on('message', function() {

  // TODO : messages from proxy

})
proxy.send({ cmd:'setup', K: K }) //send proxy setup


//check if rasp

var hostname = os.hostname();
var timeoutIP = 0;


/*
	The following checks check if the hostname is not nicely formatted (fixed for local servers)
*/
if(hostname == "agora")
	hostname = "agora.mobile.usilu.net";
	
if(hostname == "neha")
	hostname = "neha.inf.unisi.ch";

if (hostname == "raspberrypi"){
	timeoutIP = 2000;  
	/*ipGrep = cp.exec('sudo ip addr show | tail -1', function(error, stdout, stderr){ //| grep -o "[0-9]\{1,3}\.[0-9]\{1,3}\.[0-9]\{1,3}\.[0-9]\{1,3}[\/]"', function(error, stdout, stderr){ 
			parseOne = stdout.split(" ")[5];
			hostname = parseOne.split("/")[0];
	});*/
	hostname = os.networkInterfaces().eth0[0].address;
	K.PROXY.host = hostname;
	H.proxy = hostname;
}




//l.setLevel(6)



/*
	Koala node configuration
*/
var K = {
	/*
		Address of the koala_root node
	*/
	Koala_root_RPC : {		 
		port : PORT,
		host : '127.0.0.1'  //"127.0.0.1" HAS TO BE MODIFIED //WAS: neha.inf.unisi.ch
	},
	/*
		Configuration of the local RPC server. 
		-- Warning: Must be unique for the entire node!
	*/
	RPC_server : {
		port : PORT+3,
		host: hostname,
	},
	
	uid: -1,
	alias: ''
}


/*

	Registry of the processes running in the node

*/
var P = {
	processes : []
}




/*
	To handle every IPC message coming from the Workers spawned locally
*/
var handle_ipc = function( msg ) {
	
	if(msg.cbid)
	{
		if(cbtable[cbid]){
		
			//TODO: might be improved
			if(msg.response == "messages_sent") {
				cbtable[cbid].cb(msg);
			} else {
				cbtable[cbid].cb(cbtable[cbid].args)
			}
			delete cbtable[cbid]
			cbid--;
		}
	}
	
	
	//API for adding an operator from within a Worker/Operator
	//msg contains the following fields: cid, script, workers_number, uids, automatic, alias, cb
	if(msg.response == "add_operator"){
		//if this is the first element of the cluster then create an entry for the cluster
		if(!clusters[msg.cid]){
			clusters[msg.cid] = {
				cid : msg.cid,
				alias: msg.alias,
				script: msg.script,
				workers: [],
				producer: !msg.automatic,
			};
		}
			
		// console.log("automatic in run_cluster: " + msg.automatic);
		
		for(var i = 0; i < msg.workers; i++) {
			console.log("Running workers with uid = " + msg.uids[i])
			run_worker(msg.uids[i], msg.cid, msg.script, msg.automatic, (++cbid));
		}
		
		//console.log(msg);
		controller.update_clusters(clusters);
		
		//reply with callback
		/*ALL THIS MUST GO INTO A CALLBACK CALLED AFTER WORKER CREATION*/
		var cb = function(){
			for(var i = 0; i < clusters.length; i++)
				for(var j = 0; j < clusters[i].workers.length; j++)
					if(clusters[i].workers[j].uid === msg.uid)
						clusters[i].workers[j].process.send({command: 'API_callback', cb : msg.cb});
		}
		cbtable[cbid] = {
			cb : cb,
			args: "",
		}			
		
		operator_cb(msg.cid, msg.script, msg.uids, true, msg.uids.length, "");
	}
	
	
	//API for removing a binding from within a Worker/Operator
	//msg contains the following fields: from, to, cb
	if(msg.response == "unbind_operator"){
		//call other node and get unbinded
		//console.log("in unbind_cluster unbinding cid " + msg.to + " from clusters " + clusters);
		//console.log(clusters);
		
		/*
			The following for-loop finds the real index of the cid in the array. Before having
			a distributed approach, the cluster with cid "cid" was always at the [cid] index
			of the array. With a distributed approach this is not the same, thus this code
			fixes the problem by finding the right index and overwriting the cid variable
			that is then used in the big chunk of code afterwars (the two nested loops).
		*/
		var real_index;
		for(var i = 0; i < clusters.length; i++){
			//console.log("cid msg.to search: " + msg.to);
			//console.log(clusters[i]);
			if(clusters[i] && clusters[i].cid === msg.to){
				real_index = i;
			}
		}
		msg.to = real_index;
		
		var from_value = 0;
		//console.log("from_value = " + from_value + " = clusters[msg.to].workers.length(" +clusters[msg.to].workers.length+") * bindings[msg.to].from.length(" + bindings[msg.to].from.length + ")" );
		//console.log(JSON.stringify(bindings[msg.to].from));
		//iterate for each worker in the cid and get it unbinded from everybody
		for(var k = 0; k < clusters[msg.to].workers.length; k++){
			for(var i = 0; i < bindings[msg.to].from.length; i++){
				if(bindings[msg.to].from[i]){
					from_value++;
					//if a binding from cid i exists
					//from is an array of arrays because it contains the cid and all the nodes that cid is roaming on i = cid [i][j] = node
					for(var j = 0; j < bindings[msg.to].from[i].length; j++){
						/*
							ask to each node to unbind the workers they have for that cid 
							binded to this worker which is going to die
							for now avoid removing the node from the array of nodes inside the other node
							if this was the last worker in this node for that cluster (if it is the last worker
							of the cluster this has not to be removed but the check maybe should be done at the ROOT?
						*/
						bindings[msg.to].from[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid*/, clusters[msg.to].workers[k].uid /*uid of the worker to unbind*/, function(uid) {
							//console.log("UNBIND DONE, DON'T KILL THE WORKER!");
							
							//TODO: executed right away, should be executed when ALL returned (for now it's ok like this).
							//reply with callback
							from_value--;
							console.log("callback of first unbind, from_value = " + from_value);
							if(from_value == 0)
								for(var i = 0; i < clusters.length; i++)
									for(var j = 0; j < clusters[i].workers.length; j++)
										if(clusters[i].workers[j].uid === msg.uid)
											clusters[i].workers[j].process.send({command: 'API_callback', cb : msg.cb});
						});
						
						
					}
				}
			}
		}
		
		controller.update_clusters(clusters);
		controller.update_bindings(bindings);
		unbind_cb(msg.from, msg.to);
	}
	
	
	//API for adding a binding from within a Worker/Operator
	//msg contains the following fields: from, to, protocol, cb
	if(msg.response == "bind_operator"){
		log.bindc("node bind cluster "+msg.from +" -> "+msg.to);
		var self = this; 
		//save the bindings 
		if(!bindings[msg.from])
			bindings[msg.from] = {
				//its an array with index the cid and result another array of nodes
				from : [],
				to : [],
				to_cid : msg.to,
				protocol : protocol,
			};
		
		if(!bindings[msg.from].to[msg.to])
			bindings[msg.from].to[msg.to] = new Array();
		
		
		
		//TODO: the following hack only works with Operators on the same Peer
		bindings[msg.from].to[msg.to].push(msg.to);
		
		//call bind for single process
		//for each node ask for the number of workers inside that cluster
		//console.log("to.length in bind_cluster: " + to.length);
		//for(var i = 0; i < to.length; i++){
			//if not remote call get_workers of koala_node
			//if(!to[i].remote){
				

				//TODO: calls local notify_binding since its on the same Peer, should call the notify_binding remote if Peer is different
				//same for get_workers
				notify_binding(msg.from, msg.to, this_node);
				console.log("before get_workers");
				get_workers(msg.to, function(workers){
				
					//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
					console.log('workers.length = ' + workers.length);
					for(var k = 0; k < workers.length; k++){
						for(var j = 0; j < clusters[msg.from].workers.length; j++){
							var to_send = {
								command: 'bind_node',
								host: workers[k].host,
								port: workers[k].port,
								from: clusters[msg.from].workers[j].uid,
								to: workers[k].uid,
								to_cid : msg.to,
								from_alias : clusters[from_cid].alias,
								to_alias : clusters[to_cid].alias,
								protocol: msg.protocol,
								proxy: false,
							
							}
							clusters[msg.from].workers[j].process.send(to_send)
							
						}
						//console.log("out of the for loop for the binding, k = " + k + " and workers.length = " + workers.length);
						if(k == (workers.length - 1)){
							//reply with callback
							for(var i = 0; i < clusters.length; i++)
								for(var j = 0; j < clusters[i].workers.length; j++)
									if(clusters[i].workers[j].uid === msg.uid)
										clusters[i].workers[j].process.send({command: 'API_callback', cb : msg.cb});
						}
					}
					
					
				});
			//}
			
			//TODO: if it's remote is todo, for now only works with Operators in the same Peer
			
			//if remote call get_workers of koala_remote
			//our worker --(ZMQ)--> proxy --(websockets)--> remoteworker
			/*else{
				//first notify this nodes that proxy is sending messages to them
				for(var j = 0; j < clusters[from_cid].workers.length; j++){
					var to_send = {
						command: 'bind_node',
						host: H.proxy.host,
						port: H.proxy.port_ZMQ,
						from: clusters[from_cid].workers[j].uid,
						to: "proxy",
						proxy: true,	
					}

					var closure_bind = function(tempI, tempJ) {
						to[tempI].channel.koala_remote.get_workers(to_cid, function(workers){
							//notify proxy of the binding
							for(var k = 0; k < workers.length; k++){
								proxy.send({ 
									cmd:'new_rt', 
									from: {
											pid: clusters[from_cid].workers[tempJ].uid, 
											node: this_node,
										  }, 
								    to:  {
								         	pid: workers[k].uid,
								         	node: to[i],
								         } 
									}
								);
							}

						});
					}

					closure_bind(i,j)

				
					clusters[from_cid].workers[j].process.send(to_send)
				}
				
				controller.update_clusters(clusters);
				/*to[i].channel.koala_node.get_workers(to_cid, function(workers){
					//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
					for(var k = 0; k < workers.length; k++){
						for(var j = 0; j < self.clusters[from_cid].workers.length; j++){
							var to_send = {
								command: 'bind_node',
								host: workers[j].host,
								port: workers[j].port,
								from: self.clusters[from_cid].workers[k].uid,
								to: workers[j].uid,
								proxy: true,	
							}
								
							self.clusters[from_cid].workers[k].process.send(to_send)
						}
					}
				});
			}
		}*/
		
		controller.update_bindings(bindings);
		//from-to-aliases-protocol (TODO: aliases to be implemented)
		bind_cb(msg.from, msg.to, false, msg.protocol);
		//tell somehow the other machine we are a machine, we have a cluster and it is connected to one of their clusters
	}
	
	//API for migrating an Operator from within a Worker/Operator
	//msg contains the following fields: cid, node_url (not mandatory), cb
	if(msg.response == "migrate_operator"){
		console.log("in migrate_operator in msg.response in koala_node.js");
		migrate_cb(msg.cid, msg.node_url, function(){
			//find the correct worker that issued the call to sort out the callback
			for(var i = 0; i < clusters.length; i++){
				if(clusters[i]){
					//console.log("here");
					for(var j = 0; j < clusters[i].workers.length; j++){
						//console.log("finding right worker (searching for uid = " + msg.uid + ", iterating on " + clusters[i].workers[j].uid + ")");
						if(clusters[i].workers[j].uid === msg.uid){
							//console.log("right worker found, sending back!");
							clusters[i].workers[j].process.send({command: 'API_callback', cb : msg.cb});
						}
					}
				}
			}
		});
	}
	
	
	//API for checking how many workers are there in an operator
	if(msg.response == "get_worker_number"){
		
		//this only works if the Peer is hosting the Operator we are looking for
		//TODO: for the case in which the Operator is on another Peer.
		for(var i = 0; i < clusters.length; i++)
			// console.log(clusters[i]);
			/*if(clusters[i].cid == msg.operatorCid)
				msg.operatorCid = clusters[i].cid*/
				
		var workerNumber = clusters[msg.operatorCid].workers.length;
		//some stuff happening
		
		for(var i = 0; i < clusters[msg.cid].workers.length; i++){
			if(clusters[msg.cid].workers[i].uid === msg.uid){
				//maybe add the number of workers as the returning variable
				clusters[msg.cid].workers[i].process.send({command: 'API_callback', cb : msg.cb, params: [workerNumber]});
			}
		}
	}
	
	//workers responding with a data_collect message
	if(msg.response == "data_collect"){
		//data_collect_cb takes: data, ci, cluster, index, exec_time, AVG, rcvd
		//console.log("data_collect returned, msg.ci : " + msg.ci);
		data_collect_cb(msg.data, msg.ci, msg.cluster, msg.index, msg.exec_time, msg.avg, msg.rcvd);
	}
	
	else if(msg.response == "graceful_kill"){
		var self = this;
		
		/*
			send a message to the guys conencted to this worker (*from*) and tell them to disconnect (unbind)
			remove this guy from the list of processes in the cluster
			send a message to the guy and tell him to die
		*/
		
		//find the cid associated with this worker
		var cid;
		for(var i = 0; i < clusters.length; i++){
			//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
			if(clusters[i]){
				for(var j = 0; j < clusters[i].workers.length; j++){
					if(clusters[i].workers[j].uid == msg.uid)
						cid = clusters[i].cid;
				}
			}
		}
			
		console.log("msg uid = "+msg.uid + " IN GRACEFUL_KILL " + clusters[cid].workers.length);

		//console.log("CID = "+cid);
		//console.log(clusters);
		//if only one we don't want to kill it (to be fixed when deploying a cluster on different nodes)
		if(clusters[cid].workers.length == 1){
			console.log("LAST ONE IN CLUSTER " + cid + " BEING KILLED");
			return;
		}
		
		console.log("BEFORE 'FOR' UNBINDING AND KILLING and bindings[cid].from.length = " + bindings[cid].from.length);
		for(var i = 0; i < bindings[cid].from.length; i++){
			if(bindings[cid].from[i]){
				//if a binding from cid i exists
				for(var j = 0; j < bindings[cid].from[i].length; j++){
					/*
						ask to each node to unbind the workers they have for that cid 
						binded to this worker which is going to die
						for now avoid removing the node from the array of nodes inside the other node
						if this was the last worker in this node for that cluster (if it is the last worker
						of the cluster this has not to be removed but the check maybe should be done at the ROOT?
					*/
					
					var seconds = new Date().getTime() / 1000;
					cumulative_rem++;
					
					fs.appendFileSync("removing.txt", "" + (seconds - start) + ":" + cumulative_rem + "\n", encoding='utf8', function(err) {
				    	if(err) {
				        	console.log(err);
				    	}
					});

					bindings[cid].from[i][j].channel.koala_node.unbind_cluster_process(i, msg.uid, function(uid) {
						kill_worker(uid);
					});					
				}
			}
		}
		//console.log(bindings[cid].from)	
		//graceful_kill_cb(msg.uid);
	}
	
	//heartbeat handler
	else if(msg.response == "heartbeat"){
		//if array doesn't exist to store data of the uid create it
		if(!hb_data[msg.uid])
			hb_data[msg.uid] = new Array();
		
		//store the data
		hb_data[msg.uid].push(msg);
		
	} 
	
	//handler for data coming from the Worker in the case andrea's controller is up (received message)
	else if (msg.response == "andrea_controller_new_message_arrived" && andrea_controller){
		//do something with the data structure of andrea's controller
		//console.log("andrea_controller_new_message_arrived to msg.cid = " + JSON.stringify(msg));
		connections[msg.cid].__throughput.in++;
	}
	
	//handler for data coming from the Worker in the case andrea's controller is up (sent message)
	else if (msg.response == "andrea_controller_new_message_left" && andrea_controller){
		//console.log("andrea_controller_new_message_left");
		//do something with the data structure of andrea's controller
		connections[msg.cid].__throughput.out++;
		
		if(connections[msg.cid].__workersLastUsed[msg.uid])
			connections[msg.cid].__workersLastUsed[msg.uid]++;
		else
			connections[msg.cid].__workersLastUsed[msg.uid] = 1;
		
		checkSamplingMessages(msg);
	}
}


var getControllerClusters = function(){
	return controller.getClusters();
}

/*
	This function is used to check, every time a worker receives a message, if it's time for
	andrea_controller to check the status of the Operator and double the number of Workers
	inside the Operator.
*/
var checkSamplingMessages = function(msg){
	console.log("======================checkSamplingMEssages CALLED========================== samplingMessages * clusters[msg.cid].workers.length) === connections[msg.cid].__throughput.out = " + ((samplingMessages * clusters[msg.cid].workers.length) === connections[msg.cid].__throughput.out));
	console.log("samplingMessages = " + samplingMessages + ", clusters[msg.cid].workers.length = " + clusters[msg.cid].workers.length + ", connections[msg.cid].__throughput.out = " + connections[msg.cid].__throughput.out);
	if((samplingMessages * clusters[msg.cid].workers.length) === connections[msg.cid].__throughput.out){
		//compute tpin tpout
		var now = (new Date()).getTime();
		//connections[msg.cid].__throughput.throughputIn = connections[msg.cid].__throughput.in / ((now - connections[msg.cid].__throughput.startingSampleDate)/1000);
		//from the other controller!
		
		var clust = getControllerClusters();
		
		//there is something wrong with the clust, it always contains 4 tpIn, 4 tpOut
		//ragionamento a caldo: prova a loggare quello che ha dentro anche dall'altro controller
		//ovvero runnando gli esperimenti su neha dove andrea_controller  disabilitato
		//anche solo un timeout o qualcosa che logga il contenuto di clust per vedere se  sempre lo stesso
		//salvarlo su un file -> best idea (anche per andrea_controller, ma si vede quindi np)
		
		
		//console.log(connections[msg.cid].__throughput.throughputIn);
		connections[msg.cid].__throughput.throughputIn = clust[msg.cid].req_mean;
		//connections[msg.cid].__throughput.throughputOut = connections[msg.cid].__throughput.out / ((now - connections[msg.cid].__throughput.startingSampleDate)/1000);
		connections[msg.cid].__throughput.throughputOut = clust[msg.cid].ans_mean;
		console.log( "connections[msg.cid].__throughput.in / (now - connections[msg.cid].__throughput.startingSampleDate) = " + connections[msg.cid].__throughput.in + " / (" + now + " - " + connections[msg.cid].__throughput.startingSampleDate + ")");
		console.log("tpIn (other controller): " + connections[msg.cid].__throughput.throughputIn + " , tpOut: " + connections[msg.cid].__throughput.throughputOut);
		//call andrea's controller
		andrea_control.runController(connections, msg.cid, add_worker, function(){
			//empty the __workersLastUsed variable
			console.log(connections);
			connections[msg.cid].__workersLastUsed = {}
	        connections[msg.cid].__throughput = {
	          startingSampleDate: (new Date()).getTime(),
	          in: 0,
	          out: 0,
	          throughputIn: 0,
	          throughputOut: 0
	        }
		});
	}
}

/*
	RPC server
	
	Receives commands from koala_root and executes them:
*/
var rpc_server = dnode({
	

	/*
		Gets the clusters of this node with their content
		@param: cb - the callback to be executed, clusters is required to be passed. If i is defined, then is passed too
		@param: i - index of whichever computation
	*/
	get_clusters : function(cb, i){
		// clusters[0].workers[0].process.send({command: "messages_sent"});
		cb(clusters, i);
	},
	
	/*
		Sends data about the status of the CPU on this host
	*/
	cpu_usage : function(i, cb){
		//console.log("CPU: " + ocpu.getCpuUsage() + ", rel CPU: " + ocpu.getRelCpuUsage() + ", tot CPU: " + ocpu.getTotCpuUsage()/100);	
		//cb(i, ocpu.getTotCpuUsage()/100);
		cb(i, 0);
	},
	
	/*
		Set this node (useful when sending information about itself)
	*/
	set_node : function(node){
		this_node = node;
	},
	
	/*
		Updates the script ran by a cluster (operator) on this host (node).
		It takes the script, starts the same number of workers that there were
		before, binds them and finally kills the old ones.
		@param : script - the script file to run
		@param : cid - the id of the cluster (operator) that has to run the new script
		@param : cb - callback called at the end of the execution
	*/
	update_script : function(script, cid, cb){
		console.log("changing script in cid : " + cid + " with script " + script + " where before was " + clusters[cid].script);
		
		//update script in description
		clusters[cid].script = script;
		

		var wrks = [];
		//run new workers
		for(var i = 0; i < clusters[cid].workers.length; i++){
			try {
				var port = H.current_free_port++;
				var p = cp.fork('./scripts/'+script, [port]);
				p.send({command: 'setup', uid: clusters[cid].workers[i].uid, cid: cid});
				p.on('message', handle_ipc)
				var newborn_worker = {
					uid: clusters[cid].workers[i].uid,
					process : p,
					port : port,
					host : clusters[cid].workers[i].host,
				};
				
				wrks.push(newborn_worker);
			}
		
			catch(e) {
				console.log("Error running a new process with uid : " + clusters[cid].workers.uid + " and script " + script);
				console.log(JSON.stringify(e));
			}
		}
		
		var to = bindings[cid].to;

	

		//binds them
		for(var i = 0; i < to.length; i++){
				
			//if not remote call get_workers of koala_node
			if(to[i] != undefined && !to[i].remote){
				//no need to notify the binding as it was already bound (only the script changed);
			
			
				to[i][0].channel.koala_node.get_workers(bindings[cid].to_cid, function(workers){
					//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
					//console.log(clusters[from_cid])
					var protocol = "";
					for(var k = 0; k < wrks.length; k++){
						for(var j = 0; j < wrks.length; j++){
							var to_send = {
								command: 'bind_node',
								host: workers[k].host,
								port: workers[k].port,
								from: clusters[cid].workers[j].uid,
								to: workers[k].uid,
								to_cid : bindings[cid].to_cid,
								from_alias : clusters[from_cid].alias,
								to_alias : clusters[to_cid].alias,
								protocol: protocol,
								proxy: false,
							}
							
							clusters[cid].workers[j].process.send(to_send)
							
						}
					
						if(k === wrks.length){
							
							//done binding, now we can unbind the old ones and kill them
							/*
							//unbind & kill old workers
							for(var k = 0; k < clusters[cid].workers.length; k++){
								var cnt = 0;
								
								for(var i = 0; i < bindings[cid].from.length; i++)
									for(var j = 0; j < bindings[cid].from[i].length; j++){
										console.log(bindings[cid].from[i][j]);
										cnt += bindings[cid].from[i][j].workers.length;
										}
								
								for(var i = 0; i < bindings[cid].from.length; i++){
									if(bindings[cid].from[i]){
										var killed = 0;
										console.log("iterating the 'from' to kill");
										//if a binding from cid i exists
										//from is an array of arrays because it contains the cid and all the nodes that cid is roaming on i = cid [i][j] = node
										for(var j = 0; j < bindings[cid].from[i].length; j++){
											/*
												ask to each node to unbind the workers they have for that cid 
												binded to this worker which is going to die
												for now avoid removing the node from the array of nodes inside the other node
												if this was the last worker in this node for that cluster (if it is the last worker
												of the cluster this has not to be removed but the check maybe should be done at the ROOT?
											
											console.log("killing...");
											bindings[cid].from[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid, clusters[cid].workers[k].uid /*uid of the worker to unbind, function(uid) {
												kill_worker(uid);
												killed++;
												if(killed === cnt){
													//save new workers
													console.log("killed everybody!");
													clusters[cid].workers = wrks.slice();
												}
											});
										}
									}
								}
							}*/
							
							unbind_kill(cid, wrks);
							clusters[cid].workers = wrks.slice();
						}
						
					}				
				});
			}
		}
		
		
		//from
		if(bindings[cid].from.length){
			for(var i = 0; i < bindings[cid].from.length; i++){
				if(bindings[cid].from[i]){
					for(var j = 0; j < bindings[cid].from[i].length; j++){
						for(var k = 0; k < wrks.length; k++){
							bindings[cid].from[i][j].channel.koala_node.bind_cluster_worker(i, wrks[k], function(){
								//if to.length = zero it did not execute everything up there, so call it again
								
								if(to.length === 0){
									unbind_kill(cid, wrks);
									clusters[cid].workers = wrks.slice();
								}
							});
						}
					}
				}
			}
		}
		cb();
		
	},
		
	
	/*
		Remove a cluster (operator) from the array
	*/
	remove_cluster : function(cid_to_remove, cb){
		delete clusters[cid_to_remove];
		controller.update_clusters(clusters);
		cb();
	},
	

	/*
		Bind processes (from root, issued by user)
	*/	
	bind_process_node : function(msg, cb) {


		//probably all wrong + this function will die soon (maybe)
		/*var process_id = msg.pid;
		var host = msg.host;
		var port = msg.port;
		
		var cid_to = msg.cid_to;
		var cid_from = msg.cid_from; // from is here
		
		if(bindings[cid_from])
			bindings[cid_from].to[cid_to] = cid_to;
		else {
			bindings[cid_from] = {
				from : [],
				to : [],
			};
			
			bindings[cid_from].to[cid_to] = cid_to;
		}
		
		var to_send = {
			command: 'bind_node',
			host: host,
			port: port,
			cbid: (++cbid),
			from: process_id,
			to: msg.to,
			proxy: msg.proxy,	
		}
		
		if(msg.proxy)
			to_send.proxy = true;
			
		//console.log("binding " + to_send.from + " to " + to_send.to);
		
		P.processes[process_id].process.send(to_send)	
		
		//console.log("filling cbtable with cbid " + cbid);
		cbtable[cbid] = {
			cb : cb,
			args: "",
		} */
	},
	
	/*
		When a cluster has to be unbinded as a whole, this function is called from the
		root. This is only called for a migration and for a new binding.
	*/
	unbind_cluster : function(from_cid, to_cid, cb, s){
	
		//call other node and get unbinded
		//console.log("in unbind_cluster unbinding cid " + cid + " from clusters " + clusters);
		//console.log(clusters);
		
		/*
			The following for-loop finds the real index of the cid in the array. Before having
			a distributed approach, the cluster with cid "cid" was always at the [cid] index
			of the array. With a distributed approach this is not the same, thus this code
			fixes the problem by finding the right index and overwriting the cid variable
			that is then used in the big chunk of code afterwars (the two nested loops).
		*/
		var real_index;
		for(var i = 0; i < clusters.length; i++){
			//console.log("cid to search: " + cid);
			console.log(clusters[i]);
			if(clusters[i] && clusters[i].cid === to_cid){
				real_index = i;
			}
		}
		var cid = real_index;
		
		//console.log("cid found: " + cid);
		
		//iterate for each worker in the to_cid and get it unbinded from the from_cid
		for(var k = 0; k < clusters[cid].workers.length; k++){
			//iterate on the array containing the workers in the from
			for(var i = 0; i < bindings[cid].from.length; i++){
				//the following is stupid and can be improved but i don't feel like doing it right now
				if(bindings[cid].from[i] && i == from_cid){
					console.log("bindings to cid : " + cid + " at index " + i + " are : " + JSON.stringify(bindings[cid].from[i]));
					//if a binding from cid i exists
					//from is an array of arrays because it contains the cid and all the nodes that cid is roaming on i = cid [i][j] = node
					for(var j = 0; j < bindings[cid].from[i].length; j++){
						/*
							ask to each node to unbind the workers they have for that cid 
							binded to this worker which is going to die
							for now avoid removing the node from the array of nodes inside the other node
							if this was the last worker in this node for that cluster (if it is the last worker
							of the cluster this has not to be removed but the check maybe should be done at the ROOT?
						*/
						bindings[cid].from[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid*/, clusters[cid].workers[k].uid /*uid of the worker to unbind*/, function(uid) {
							//console.log("UNBIND DONE, DON'T KILL THE WORKER!");
							//kill_worker(uid);
						});
						
						
					}
				}
			}
		}
		
		controller.update_clusters(clusters);
		controller.update_bindings(bindings);
		
		//iterate through all the workers
		//unbind them actually not needed as these are dieing anyways
		
		cb(s);
		
	},
	
	/*
		When a node decides to die, this function is called: it will take each worker in
		the cluster cid and unbind it from worker uid.
	*/
	unbind_cluster_process : function(cid, uid, cb){
		for(var i = 0; i < clusters[cid].workers.length; i++){
			clusters[cid].workers[i].process.send({
				command: 'unbind_node',
				process_id : clusters[cid].workers[i].uid,
				to_unbind: uid,
				cbid: (++cbid),
			});
		}
		
		cbtable[cbid] = {
			cb : cb,
			args: uid,
		}
	},
	
	/*
		Asks the controller the ans_rate of a particular cid
	*/
	get_ans_rate : function(cid, i, cb){
		controller.get_ar(cid, i, cb)
	},


	/*
		Unbind worker from operators to which the worker is bound
	*/
	unbind_worker : function(oid, wid, cb) {
			
		var cnt_from = 0;
		for(var i = 0; i < bindings[oid].from.length; i++){
			//TODO: QUICK FIX
			if(bindings[oid].from[i]) {
				cnt_from += bindings[oid].from[i].length;
			}
		}

		var cnt_to = 0;
		for(var i = 0; i < bindings[oid].to.length; i++){
			//TODO: QUICK FIX
			if(bindings[oid].to[i]) {
				cnt_to += bindings[oid].to[i].length;
			}
		}

		
		

		for(var i = 0; i < bindings[oid].from.length; i++){			
			if(bindings[oid].from[i]){
				var killed_from = 0;
				for(var j = 0; j < bindings[oid].from[i].length; j++){
					bindings[oid].from[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid*/, wid /*uid of the worker to unbind*/, function(uid) {
						kill_worker(uid);
						killed_from++;
						if(killed_from === cnt_from){
							//save new workers
							// cb();
							//REMOVE BINDINGS TO
							if(cnt_to == 0) {
								cb();
							} else {
								for(var i = 0; i < bindings[oid].to.length; i++){	
								
									if(bindings[oid].to[i] != undefined){
										
										var killed_to = 0;
										for(var j = 0; j < bindings[oid].to[i].length; j++){
											bindings[oid].to[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid*/, wid /*uid of the worker to unbind*/, function(uid) {
												kill_worker(uid);
												killed_to++;
												if(killed_to == cnt_to) {
													cb();
												}
											});
										}
									}
								}
							}
						}
					});
				}
			}
		}

		if(cnt_from == 0) {
			//REMOVE ONLY BINDINGS TO
			for(var i = 0; i < bindings[oid].to.length; i++){	
		
				if(bindings[oid].to[i] != undefined){
					
					var killed_to = 0;
					for(var j = 0; j < bindings[oid].to[i].length; j++){
						bindings[oid].to[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid*/, wid /*uid of the worker to unbind*/, function(uid) {
							kill_worker(uid);
							killed_to++;
							if(killed_to == cnt_to) {
								cb();
							}
						});
					}
				}
			}
		}


		


	},
	
	/*
		Unbind processes
	*/
	unbind_process_node : function(msg, cb, self){
		var process_id = msg.pid1
		var to_unbind = msg.pid2
		
		P.processes[process_id].process.send({
			command: 'unbind_node',
			process_id : process_id,
			to_unbind: to_unbind,
			cbid: (++cbid),		
		})
		
		cbtable[cbid] = {
			cb : cb,
			args: self,
		}
	},
	
	/*
		get_workers returns the workers in an array for a particular cluster
		used for the connection koala_node -> koala_node to avoid passing by the root
	*/
	get_workers : function(cid, cb){
		if(clusters[cid])
			cb(clusters[cid].workers.slice());
		else
			cb();
	},


	
	
	/*
		Collecting data for CPU usage.
	*/
	cpu_collect : function(i, cb){
		var cpus = OS.cpus();
		cb(i, cpus);
	},
	
	/*
		Set graceful kill callback
	*/
	set_graceful_kill_calback : function(cb){
		graceful_kill_cb = cb;
	},
	
	/*
		Sets the callback to get a new uid for a newly created worker
	*/
	set_get_uid_cb : function(cb){
		get_uid_cb = cb;
	},
	
	/*
		Sets the callback to migrate an Operator. This works differently from
		the previous sets as this function is going to be called from the
		Worker itself for the JavaScript API.
	*/
	set_migrate_callback : function(cb){
		migrate_cb = cb;
	},
	
	/*
		Sets the callabck to add a new Operator, called from the JSAPI.
	*/
	set_add_operator_callback : function(cb){
		operator_cb = cb;
	},
	
	/*
		Sets the callabck to unbind an operator, called from the JSAPI.
	*/
	set_unbind_callback : function(cb){
		unbind_cb = cb;
	},
	
	/*
		Sets the callabck to bind an operator, called from the JSAPI.
	*/
	set_bind_callback : function(cb){
		bind_cb = cb;
	},
	
	/*
		Kills process
	*/
	kill_process_node : function(pid_to_kill, node_id, cb) {

		if(P.processes.length == 0){
			var process = P.processes[pid_to_kill].process.pid;
		} else {

		}

		
		process = process+"";
		P.processes[pid_to_kill].process.send({
			command: 'kill',
			pid_to_kill: pid_to_kill,
			proc_pid: process,
			cbid: (++cbtableid),		
		})
		
		delete P.processes[pid_to_kill];
		
		if(P.processes == undefined)
			P.processes = [];
		cb(node_id);
	},
	
	
	/*
		Kill this node
	*/
	kill_node : function(cb){
		cb("Killing node");
		process.exit(0);
	},
	
	/*
		This function from the ROOT notifies this host, especially the proxy, of the existence of an
		incoming connection from a remote. The idea is to set the proxy's RT for routing the incoming
		messages and send the proxy info (host+port) to let the workers in the remote bind to it.
	*/
	incoming_connection : function(from_uids, to_cid, from, cb){
		//update RT
		for(var i = 0; i < from_uids.length; i++) {
			for(var j = 0; j < clusters[to_cid].workers.length; j++){
				proxy.send({ 
							cmd:'new_rt', 
							from: {
									cid: from_uids[i], 
									node: from,
								  }, 
						    to:  {
						         	cid: clusters[to_cid].workers[j].uid,
						         	node: this_node,
						         } 
							}
				);
				
				//connect proxy to my workers
				proxy.send({
					cmd : 'new_conn', 
					host : clusters[to_cid].workers[j].host , 
					port : clusters[to_cid].workers[j].port, 
					uid: clusters[to_cid].workers[j].uid,
				});
			}
		}
		
		cb({
			host: H.proxy.host,
			port: H.proxy.port_HTTP,
		})
	},

	incoming_connection_remote : function(local_cid, local_uid, remote_workers, local_node, remote_node, aliases, cb, remote_cid){
		var local_workers = clusters[local_cid].workers

		// update RT
		for(var i = 0; i < local_workers.length; i++) {
			// for(var j = 0; j < remote_workers.length; j++){
				proxy.send({ 
						cmd:'new_rt', 
						from: {
					         	// pid: remote_workers[j].uid,
					         	cid: remote_cid,
					         	node: remote_node,
					    }, 
						to: {
								cid: local_workers[i].uid, 
								node: local_node,
						}, 
					    
						aliases: aliases
					}
				);
				
				//connect proxy to my workers
				proxy.send({
					cmd : 'new_conn', 
					host : local_workers[i].host , 
					port : local_workers[i].port, 
					uid: local_workers[i].uid,
				});
			// }
		}

		// console.log('@@@ Proxy')

		// console.log(H.proxy)
		
		cb({
			host: H.proxy.host,
			port: H.proxy.port_HTTP,
		})
	},

	outgoing_connection_remote : function(local_uids, remote_workers, local_node, remote_node, cb){
		cb({
			host: H.proxy.host,
			port: H.proxy.port_HTTP,
		})
	},


	get_worker : function(oid, wid, cb) {
		
		var to_send = {
			command: "messages_sent",
			uid: wid,
			cid: oid,
			cbid: (++cbid)
		};

		var cluster = filter(clusters, function(element) {
			return element.cid == oid;
		});


		for (var key in cluster.workers) {
			if(cluster.workers[key].uid == wid) {
				cluster.workers[key].process.send(to_send);
			}
		};
		
		cbtable[cbid] = {
			cb : cb,
			args: wid
		}	
	},
	
	/*
		Run cluster
		The idea here is to run the cluster directly from the koala_node. ROOT should send here the
		info (like the number of workers to be created) and here we create them.
	*/
	
	run_cluster : function(cid, script, workers_number, uids, automatic, alias, self, cb){
		
		//if this is the first element of the cluster then create an entry for the cluster
		if(!clusters[cid]){
			clusters[cid] = {
				cid : cid,
				alias: alias,
				script: script,
				workers: [],
				producer: !automatic,
			}
		}
		
		//if andrea_controller is active, create the data structure for connections
		if(andrea_controller){
			connections[cid] = {
				__throughput : {
					startingSampleDate : (new Date()).getTime(),
					in : 0,
					out : 0,
					throughputIn : 0,
					throughputOut : 0
				},
				limitCounter : 0,
				limitReached : false,
				__workerCounter : workers_number,
				__lastSampledThroughputOut : 0,
				__workersLastUsed : {},
				__limitCounter : 100,
				__message_pool : "" //(we do not have a queue)
			}
		}
			
		// console.log("automatic in run_cluster: " + automatic);
		
		for(var i = 0; i < workers_number; i++) {
			log.runc("Running worker with uid = " + uids[i]);
			run_worker(uids[i], cid, script, automatic)
		}
		

		controller.update_clusters(clusters);
		cb(self);
	},
	
	/*
		Function to start the collection of data from the controller
	*/
	start_controller : function(){
		controller.update_clusters(clusters);
		
		if(!controller.started())
			controller.start_collect(andrea_controller);
			
	},
	
	
	
	/*
		Bind cluster
		Again the idea is moving the work from the ROOT here. In this case ROOT should send all the info
		needed to bind the workers here (the "FROM") to the other workers in the cluster we have to be
		binded to (the "TO"); In the meantime we also save the info here so that if a new worker has to be
		added to the cluster, it knows where it has to be binded.
		I expect "to" to be an array of nodes (a cluster may be spread across multiple nodes).
	*/	
	bind_cluster : function(from_cid, to_cid, to, protocol, cb, s, aliases){
		//console.log('###')
		//console.log(aliases)

		log.bindc("node bind cluster "+from_cid +" -> "+to_cid);
		var self = this; 
		//save the bindings 
		if(!bindings[from_cid])
			bindings[from_cid] = {
				//its an array with index the cid and result another array of nodes
				from : [],
				to : [],
				to_cid : to_cid,
				protocol : protocol,
			};
		
		if(!bindings[from_cid].to[to_cid])
			bindings[from_cid].to[to_cid] = new Array();
		
		for(var i = 0; i < to.length; i++)
			bindings[from_cid].to[to_cid].push(to[i]);
		
		//call bind for single process
		//for each node ask for the number of workers inside that cluster
		// console.log("to.length in bind_cluster: " + to.length);
		for(var i = 0; i < to.length; i++){
			//if not remote call get_workers of koala_node
			if(!to[i].remote){
				

				to[i].channel.koala_node.notify_binding(from_cid, to_cid, this_node);
				to[i].channel.koala_node.get_workers(to_cid, function(workers){
					//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
					//console.log(clusters[from_cid])
					//check on workers because to may be a long array and not every node has a worker of this cid!
					if(workers){
						for(var k = 0; k < workers.length; k++){
							for(var j = 0; j < clusters[from_cid].workers.length; j++){
								var to_send = {
									command: 'bind_node',
									host: workers[k].host,
									port: workers[k].port,
									from: clusters[from_cid].workers[j].uid,
									to: workers[k].uid,
									from_alias : aliases.from,
									to_alias : aliases.to,
									protocol: protocol,
									proxy: false,
								
								}
								clusters[from_cid].workers[j].process.send(to_send)
								
							}
							
							if(k == (workers.length - 1)){
								if(!s) {
									cb("binding done in cid " + from_cid + " to cid " + to_cid);
								}else{
									cb(s)
								}
							}
						}
					}
					
				});
			}
			
			//if remote call get_workers of koala_remote
			
			//our worker --(ZMQ)--> proxy --(websockets)--> remoteworker
			else{
				// console.log("to_cid = " + to_cid);
				// console.log(clusters);
				//first notify this nodes that proxy is sending messages to them
				for(var j = 0; j < clusters[from_cid].workers.length; j++){
					var to_send = {
						command: 'bind_node',
						host: H.proxy.host,
						port: H.proxy.port_ZMQ,
						from: clusters[from_cid].workers[j].uid,
						to: "proxy",
						to_cid: to_cid,
						from_alias : aliases.from,
						to_alias : aliases.to,
						proxy: true,	
					}

					var closure_bind = function(tempI, tempJ) {
						// console.log("@@@@@@@@@@@ " + to_cid)
						to[tempI].channel.koala_remote.get_workers(to_cid, function(workers){
							//notify proxy of the binding
							// for(var k = 0; k < workers.length; k++){
								proxy.send({ 
									cmd:'new_rt', 
									from: {
											cid: clusters[from_cid].workers[tempJ].uid, 
											node: this_node,
										  }, 
								    to:  {
								         	cid: to_cid,
								         	node: to[tempI],
								         },
								    aliases: aliases 
									}
								);
							// }

						});
					}

					closure_bind(i,j)

				
					clusters[from_cid].workers[j].process.send(to_send)
				}
				
				controller.update_clusters(clusters);
				/*to[i].channel.koala_node.get_workers(to_cid, function(workers){
					//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
					for(var k = 0; k < workers.length; k++){
						for(var j = 0; j < self.clusters[from_cid].workers.length; j++){
							var to_send = {
								command: 'bind_node',
								host: workers[j].host,
								port: workers[j].port,
								from: self.clusters[from_cid].workers[k].uid,
								to: workers[j].uid,
								proxy: true,	
							}
								
							self.clusters[from_cid].workers[k].process.send(to_send)
						}
					}
				});*/
			}
		}
		
		controller.update_bindings(bindings);
		
		//tell somehow the other machine we are a machine, we have a cluster and it is connected to one of their clusters
	},
	
	unbind_remote: function(from_cid, to_cid, to, protocol, cb, s) {
		proxy.send({ 
			cmd:'del_rt', 
			from: from_cid,
		    to:  to_cid
		});
	},

	/*                                                     .
		Kills a cluster (kills all the workers inside it) /|\
		It implies workers have already been killed!     /_*_\
	*/
	kill_cluster : function(cid, cb){
		clusters[cid] = undefined;
	},
	
	/*
		Bind cluster to worker. When a new worker appears in a cluster we are conencted to, we will be
		notified by the other cluster that it spawned a new node and needs us to connect to it. This function
		handles that RPC call from the other koala_node and will bind a whole cluster to a single (the newborn) worker
	*/
	bind_cluster_worker : function(cid, worker, cb){
		for(var k = 0; k < clusters[cid].workers.length; k++){
			var to_send = {
				command: 'bind_node',
				host: worker.host,
				port: worker.port,
				from: clusters[cid].workers[k].uid,
				to: worker.uid,
				proxy: false,	
			}
				
			clusters[cid].workers[k].process.send(to_send)
		}
		
		if(cb)
			cb();
	},
	

	/*
		Kills a specific worker
	*/
	kill_worker: function(uid, cb) {
		var cid;
		var pos;
		for(var i = 0; i < clusters.length; i++){
			//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
			if(clusters[i]){
				for(var j = 0; j < clusters[i].workers.length; j++){
					if(uid == clusters[i].workers[j].uid){
						
						
						cid = clusters[i].cid;
						pos = j;
						
						//send a message to the worker, now it can die pacefully. R.I.P. little Stakhanovite
						clusters[i].workers[j].process.send({
							command: 'kill',
							pid_to_kill: uid,
							proc_pid: clusters[i].workers[j].process.pid+"",	
						})
						
					}
				}
			}
		}
		
		//remove it from the list of workers of that cluster
		//check here if the cluster has been removed but workers are still there (i.e. to finish computation)
		if(clusters[cid]){
			delete clusters[cid].workers[pos];
			clean(clusters[cid].workers, undefined);
		}
		
		controller.update_clusters(clusters);
		cb("Worker with id = "+uid+" successfully killed");
	},


	/*
		Function triggered by koala_node when asking a new uid for a worker, but called from ROOT 
		which will send a new unique id.
	*/
	run_worker : function(cid, script, uid, automatic) {
		var port = H.current_free_port++;
		
		//if this is the first element of the cluster then create an entry for the cluster
		if(!clusters[cid]){
			clusters[cid] = {
				cid : cid,
				script: script,
				workers: [],
				producer: false,
				automatic: automatic,
			}
		}
		
		console.log("run_worker " + uid + " in cid " + cid + " with automatic: " + automatic );
		//actually create the worker
		try {
			var p = cp.fork('./scripts/'+script, [port, automatic]);
			p.send({command: 'setup', uid: uid, cid: cid});
			p.on('message', handle_ipc)
			
			var newborn_worker = {
				uid: uid,
				process : p,
				port : port,
				host : hostname,
			};

			//add the worker to the workers in the list of workers (prob inside the list of clusters) ({pid, process, ...?})
			clusters[cid].workers.push(newborn_worker);
		}
		
		catch(e) {
			console.log("Error running a new process with uid : " + uid + " and script " + script);
		}
		
		if(bindings[cid]){
			//console.log(bindings[cid].from);
			if(!clusters[cid].producer){
				//bind *from* here
				for(var i = 0; i < bindings[cid].to.length; i++){
					//if bindings[cid].to[i] exists it has the uid, and channel to get contact for a binding
					if(bindings[cid].to[i]){
						//console.log("BEFORE calling koala_node.get_workers : " + JSON.stringify(bindings[cid].to[i]));
						
						if(bindings[cid].to[i][0].remote){
							bindings[cid].to[i][0].channel.koala_remote.get_workers(i, function(workers){
							//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
							for(var k = 0; k < workers.length; k++){
								var to_send = {
									command: 'bind_node',
									host: workers[k].host,
									port: workers[k].port,
									from: newborn_worker.uid,
									to: workers[k].uid,
									proxy: false,	
								}

								newborn_worker.process.send(to_send)
							}							
						});
						}
						else{
						//console.log("=========");
						bindings[cid].to[i][0].channel.koala_node.get_workers(i, function(workers){
							//bind each of our workers in from_cid to this worker in to_cid (return value remote also uselful)
							for(var k = 0; k < workers.length; k++){
								var to_send = {
									command: 'bind_node',
									host: workers[k].host,
									port: workers[k].port,
									from: newborn_worker.uid,
									to: workers[k].uid,
									from_alias : clusters[from_cid].alias,
									to_alias : clusters[to_cid].alias,
									proxy: false,	
								}

								newborn_worker.process.send(to_send)
							}							
						});
						}
					}
				}
				
				for(var i = 0; i < bindings[cid].from.length; i++){
					if(bindings[cid].from[i]){
						for(var j = 0; j < bindings[cid].from[i].length; j++){
							bindings[cid].from[i][j].channel.koala_node.bind_cluster_worker(i, newborn_worker);
						}
					}
				}
			}
		}
		else{
			//probably do nothing, wait for a binding
		}
	},
	
	/*
		Function called from other nodes (or ourselves!) to notify the 
		creation of a binding, so that if we need to add workers to our_cid
		it will immediately send a message to the from_cid through their_node
		and tell them to bind from_cid to our new worker.
	*/
	notify_binding : function(from_cid, our_cid, their_node) {
		if(!bindings[our_cid])
			bindings[our_cid] = { from : [] , to : [] };
			
		if(!bindings[our_cid].from[from_cid])
			bindings[our_cid].from[from_cid] = new Array();
		
		for(var i = 0; i < bindings[our_cid].from[from_cid].length; i++){
			if(bindings[our_cid].from[from_cid].uid == their_node.uid){
				//we already have a binding from that cluster in that node, so don't need to add a new one
				return;
			}
		}
		
		bindings[our_cid].from[from_cid].push(their_node);
	},

	post_message : function(cid, message) {
		for(var j = 0; j < clusters[cid].workers.length; j++){
			var to_send = {
				command: 'incoming_message',
				message: message
			}
			clusters[cid].workers[j].process.send(to_send)
		}
	},

	notifyStats: function(pid, cb) {
		// TODO clusters[cid].workers[i].process.send({command: notifyStats, cb: cb})
		
		var stats = {
		    peer: pid,
		    battery: -1,
		    cpu: ocpu.getTotCpuUsage()/100,
		    // pings: controller.pings,
		    // topologies: topologies,
		    network: 'server',
		    cores: os.cpus().length
		}

		cb(stats, pid)
	}

});

rpc_server.listen( K.RPC_server.port );
log.node('[Koala::Node] Node listening on port '+K.RPC_server.port);
// l.log('info', '[Koala::Node] Node listening on port '+K.RPC_server.port);

/*
	Collect data for tuning
*/

var data_collect = function(uid, pr, collect_index, cb){
	var process_id = uid;
	if(P.processes[process_id]){
	
		data_collect_cb = cb;
		P.processes[process_id].process.send({
			command : 'data_collect',
			index : pr,
			ci : collect_index,
		});
	}
};


/*
	RPC client: used to startup the node and tell koala_root we are here up and running
*/
var d = dnode.connect({ host: K.Koala_root_RPC.host, port: K.Koala_root_RPC.port });

// Handle message from koala_root
var handle_remote = function(koala_root) {

	var msg = {
		port: K.RPC_server.port,
		host: K.RPC_server.host,
		hostname : os.hostname(),
		processors: OS.cpus(),
		cpu_usage: ocpu.getTotCpuUsage()/100,
	}
	
	//console.log("CPU: " + ocpu.getCpuUsage() + ", rel CPU: " + ocpu.getRelCpuUsage() + ", tot CPU: " + ocpu.getTotCpuUsage());
	//console.log("CPU: " + ocpu.getCpuUsage() + ", rel CPU: " + ocpu.getRelCpuUsage() + ", tot CPU: " + ocpu.getTotCpuUsage());
	//console.log(msg.host + " " + msg.port);

	// Signal we want to connect
    koala_root.register_new_node(msg, function(uid, alias) {
        
		// l.log('info', '[Koala::Node] Connected to Root node (uid: '+uid+', alias:'+alias+')');
		
		K.uid = uid,
		K.alias = alias
		
		//koala_root.sendCpuUsage(cpuUsage);
    })
}

// Handle disconnection and try to reconnect
var handle_end = function() {
	
	var retry = function( every ) {
	
		setTimeout(function() {
		
			// l.log('warning', 'connection lost, retrying')
		
			try {
			
			d = dnode.connect({ host: K.Koala_root_RPC.host, port: K.Koala_root_RPC.port });
			d.on('remote', handle_remote)
			d.on('end', handle_end)
			
			} catch(e) {
				retry( every )
			}	
		}, every)
	}
	retry(1000);
}

/*
	Function to actually run a worker. Only called when a worker has to be run the first time
*/
var run_worker = function(uid, cid, script, automatic, cbid){
	var port = H.current_free_port++;
	
	//actually create the worker
	try {
		var p = cp.fork('./scripts/'+script, [port, automatic]);
		//console.log(p);
		p.send({command: 'setup', uid: uid, cid: cid, cbid : cbid});
		p.on('message', handle_ipc)
		
		//add the worker to the workers in the list of workers (prob inside the list of clusters) ({pid, process, ...?})
		clusters[cid].workers.push({
			uid: uid,
			process : p,
			port : port,
			host : hostname
		});

		//console.log(clusters);
	}
	
	catch(e) {
		console.log("Error running a new process with uid : " + uid + " and script " + script);
	}
}

/*
	Whenever a binding happens from a cluster here to another cluster (possibly on another machine)
	we have to notify that koala_node.js on the other machine (or this machine) that there is a binding.
	In this way if workers are added to that cluster in that machine by their controller, a binding
	may be set up (that is, from this cluster to the newly created worker). This binding is initiated 
	by the other koala_node.js which will contact this one and tell it that there is a new worker and
	it needs bindings to it.
*/
var notify_binding = function(cid_from/*our cluster*/, cid_to/*their cluster*/, node_to){
	node_to.channel.notify_binding(cid_from, cid_to, this_node);
}

/*
	Adds a worker to a specified cluster.
	Called by the controller after doing the polling thing.
*/
function add_worker(cid, cb){
	//add worker first by asking a new uid to the ROOT
	var seconds = new Date().getTime() / 1000;
	cumulative_add++;
	fs.appendFileSync("adding.txt", ""+ (seconds - start) + " : " + cumulative_add + " \n", encoding='utf8', function(err) {
    	if(err) {
        	console.log(err);
    	}
	});
	
	get_uid_cb(cid, clusters[cid].script, clusters[cid].producer);
	if(cb)
		cb()
}

/*
	Function called by a setTimeout that fires when a cluster didn't answer fast enough when polled.
	If that's the case, the function will check if the node where the cluster resides is packed with
	workers. If not, it will add one more (since it's slow) in order to start the "adding" phase when
	the clusters start to be slow.
*/
var check_add_worker = function(self, ci){
	//if andrea controller and availability in terms of space then double the #workers
	//console.log("check_add_worker");
	/*if(andrea_controller){
	for(var i = 0; i < clusters.length; i++){
			//console.log("check_add_worker andrea_controller");
			if(clusters[i]){
				//console.log("check_add_worker andrea_controller clusters[i] exists");
				for(var j = 0; j < clusters[i].workers.length; j++){
					//console.log("check_add_worker called and is andrea controller and clusters[i] exists and in the for-loop");
					if(collect_times[ci][clusters[i].workers[j].uid] == false && clusters[i].workers[j]){
						//console.log("check_add_worker called and is andrea controller and clusters[i] exists and worker did not answer");
						if(controller.get_availability(1) && limit_counter > clusters[i].workers.length){
							console.log("check_add_worker available space, add workers * 2 = " + clusters[i].workers.length*2 + " and limit_counter still bigger than number of workers");
							for(var k = 0; k < clusters[i].workers.length*2; k++){
								add_worker(clusters[i].cid);
							}
						}
					}
				}
			}
		}
		return;
	}*/
		
	for(var i = 0; i < clusters.length; i++){
		//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
		if(clusters[i]){
			for(var j = 0; j < clusters[i].workers.length; j++){
			
				//if it didn't collect the time for that worker (i.e. is late) and that worker exists, then add workers
				if(collect_times[ci][clusters[i].workers[j].uid] == false && clusters[i].workers[j]){
					
					if(controller.get_availability(1)){
						
						
						/*
							Added a probability of 20% of adding a new Worker.
							This is done because if the Worker is late replying, it means it is overwhelmed.
							We do not want to add a Worker every single time the Worker is overwhelmed, but
							just some times, in order not to fill the Operator with a huge amount of Workers.
						*/
						if(Math.floor((Math.random() * 10) + 1) <= 2){
							//console.log("worker " + clusters[i].workers[j].uid + " is late replying, adding workers to cid " + i);
							add_worker(clusters[i].cid);
						}
						
					} 
				}
			}
		}
	}
};

var collect_index = -1;
var collect_times = new Array();
var rcvd_index = new Array();
var controller_cb = new Array();
var counter_array = new Array();


//contacts given cid and asks for its answer_rate
function get_ans_rate(cid, to_cid, i, cb){
	bindings[to_cid].from[cid][0].channel.koala_node.get_ans_rate(cid, i, cb);
}


function collect_data(cb){
	var node;
	var data_all = new Array();
	var self = this;
	var tot_cpu = 0;
	var CPU_IDLE = 0;
	var self = this;
	
	//no more cpu collecting
	
	//console.log("=================== collect_data");
	
	var counter = 0;
	collect_index++;
	collect_times[collect_index] = [];
	//console.log("creating timeout for check_add_worker");
	collect_times[collect_index]['to'] = setTimeout(check_add_worker, 5000, self, collect_index);
	
	//iterates through all the processes, creates the entry for the waiting matrix
	//if it's a producer don't add it to the matrix as it doesn't need adds
	for(var i = 0; i < clusters.length; i++){
	
		//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected
		//because index is id so if here we have id 0 and 2 at i = 1 it's undefined)
		if(clusters[i])
			for(var j = 0; j < clusters[i].workers.length; j++){
				var c_id = clusters[i].cid
				
				if(clusters[c_id] && !clusters[c_id].producer)
					collect_times[collect_index][clusters[i].workers[j].uid] = false;
				
				counter++;
			}
	}
	
	controller_cb[collect_index] = cb;
	rcvd_index[collect_index] = 0;
	counter_array[collect_index] = counter;
	
	
	
	//send to each worker the info gathering message
	for(var i = 0; i < clusters.length; i++){
		
		//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
		if(clusters[i])
			for(var j = 0; j < clusters[i].workers.length; j++){
				clusters[i].workers[j].process.send({
					command : 'data_collect',
					cluster: i,
					index: j,
					ci: collect_index,
				});
				
			}
	}
}

//function to bind a specific cluster to somebody
//cid_from should reside in THIS host, while cid_to *can* be on another host
//MIND THE INFO RETRIEVAL FOR THE OTHER_HOST option
var bind_cluster = function(cid_from, cid_to){
	//get all the workers for a specific cluster
	//bind them to some other cluster (that is, bind workers to workers)
	
}

//function to bind a worker to another worker
var bind_worker = function(uid_from, uid_to){
	//basic bind operation worker->worker 
}

var kill_worker = function(uid){
	//find in which cluster it 
	var cid;
	var pos;
	for(var i = 0; i < clusters.length; i++){
		//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
		if(clusters[i]){
			for(var j = 0; j < clusters[i].workers.length; j++){
				if(uid == clusters[i].workers[j].uid){
					
					//console.log("KILLING UID " + uid);
					
					cid = clusters[i].cid;
					pos = j;
					
					//send a message to the worker, now it can die pacefully. R.I.P. little Stakhanovite
					clusters[i].workers[j].process.send({
						command: 'kill',
						pid_to_kill: uid,
						proc_pid: clusters[i].workers[j].process.pid+"",	
					})
					
					//console.log(clusters[i].workers[j].process.pid+"")
				}
			}
		}
	}
	
	//remove it from the list of workers of that cluster
	//check here if the cluster has been removed but workers are still there (i.e. to finish computation)
	if(clusters[cid]){
		delete clusters[cid].workers[pos];
		clean(clusters[cid].workers, undefined);
	}
	

	
	controller.update_clusters(clusters);
}

/*
	This functon is the function the RPC call.
	Returns the list of workers as a parameter of the callback.
	@param {number}   CID of the Cluster to return the workers.
	@param {function} Callback function.
*/
var get_workers = function(cid, cb){
	cb(clusters[cid].workers.slice());
}

/*
	This function is the function in the RPC call.
	It is called when a new binding happens, thus saves it into the Peer.
	@param {number} The CID from wich the connection comes.
	@param {number} The CID to which the connection goes.
	@param {object} The Node Object of the receiving connection.
*/
var notify_binding = function(from_cid, our_cid, their_node) {
	if(!bindings[our_cid])
		bindings[our_cid] = { from : [] , to : [] };
		
	if(!bindings[our_cid].from[from_cid])
		bindings[our_cid].from[from_cid] = new Array();
	
	for(var i = 0; i < bindings[our_cid].from[from_cid].length; i++){
		if(bindings[our_cid].from[from_cid].uid == their_node.uid){
			//we already have a binding from that cluster in that node, so don't need to add a new one
			return;
		}
	}
	
	bindings[our_cid].from[from_cid].push(their_node);
}





var unbind_kill = function(cid, wrks){
	//unbind & kill old workers
	for(var k = 0; k < clusters[cid].workers.length; k++){
		var cnt = 0;
			
		for(var i = 0; i < bindings[cid].from.length; i++){
			//TODO: QUICK FIX
			if(bindings[cid].from[i]) {
				cnt += bindings[cid].from[i].length;
			}
		}
		

		for(var i = 0; i < bindings[cid].from.length; i++){
			if(bindings[cid].from[i]){
				var killed = 0;
				//if a binding from cid i exists
				//from is an array of arrays because it contains the cid and all the nodes that cid is roaming on i = cid [i][j] = node
				for(var j = 0; j < bindings[cid].from[i].length; j++){
					/*
						ask to each node to unbind the workers they have for that cid 
						binded to this worker which is going to die
						for now avoid removing the node from the array of nodes inside the other node
						if this was the last worker in this node for that cluster (if it is the last worker
						of the cluster this has not to be removed but the check maybe should be done at the ROOT?
					*/
					bindings[cid].from[i][j].channel.koala_node.unbind_cluster_process(i /*is the cid*/, clusters[cid].workers[k].uid /*uid of the worker to unbind*/, function(uid) {
						kill_worker(uid);
						killed++;
						if(killed === cnt){
							//save new workers
							console.log("killed everybody!");
						}
					});
				}
			}
		}
	}
}

//returns the clusters
var get_clusters = function(){
	return clusters;
}

//returns the bindings
var get_bindings = function(){
	return bindings;
}

var KoalaNode = function(){

}

KoalaNode.prototype = {
	add_worker : add_worker,
	get_clusters : get_clusters,	
	get_bindings : get_bindings
}

module.exports = KoalaNode;	

d.on('remote', handle_remote)	
d.on('end', handle_end)
d.on('error', handle_end)	
/*	
        Cleanse array of "undefined" when removing workers from arrays in clusters	
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