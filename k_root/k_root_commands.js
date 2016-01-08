/**
 * Commands manager: all the commands koala_root can understand. Usually the command is sent to a koala_node or koala_remote for execution. 	
 */

var util = require('util');

/*
	Returns the array of nodes in the network.
*/
var get_nodes = function() {
	
	console.log(this.N.nodes.length+' <<l')
	
	var r = []
	for(var i=0; i<this.N.nodes.length; i++) {
		var x = this.N.nodes[i]; 
		if( ! x.remote)
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
		if(x.uid && ! x.remote)
			r.push(' '+x.uid+' ('+ x.alias+') ')
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
	Gets the list of bindings (that is, the RT)
*/
var get_bindings = function() {
	var binds = [];
	for(var entry in this.RT.__table)
		binds.push(this.RT.__table[entry])
		
	return binds;
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
	
	// Take the number of processes to spawn
	var to_spawn = cmd[3]
	
	// run [src] [node]		
	if( ! this.N.nodes[node_uid] ) {
	
		cb('No such node! "'+node+'"')
		return;
	}
	else {
		var node = this.N.nodes[node_uid]
		
		//setting up the cluster
		var cluster = {
			cid : this.G.cluster_id++,
			script: script,
			processes : [],
		}
		
		var container = [];
		
		for(var i = 0; i < to_spawn; i++){
			if( ! node.remote) {
		
				var uid = this.G.process_uid++
				var port = this.G.current_free_port++
		
				container.push({ 
					src: script, 
					uid: uid,
					port: port,
					node_uid : node_uid
				});
				// call koala_node and ask him to start the new process
				node.channel.koala_node.run_process( container[i], function( proc, started ) {
					
					if(started) {
						self.P.processes[proc.uid] = {
							uid: proc.uid,
							node: self.N.nodes[proc.node_uid],
							port: proc.port,
							script: proc.script,
						}
						
						cb('Cluster process started (pid: '+uid+', src:'+script+')')
					}
					else
						throw "Cannot start the process!"					
				})
				
				//put the process in the cluster aswell
				cluster.processes.push({uid: uid, node: this.N.nodes[node_uid], port: port});
			}
			// If we have to start the process in the browser
			else {
				var uid = this.G.process_uid++
				var port = this.G.current_free_port++
		
				container.push({ 
					src: script, 
					uid: uid,
					node_uid : node_uid
				});
				// call koala_node and ask him to start the new process
				node.channel.koala_remote.run_process( container[i], function(proc, started ) {
				
					if(started) {
					
						self.P.processes[proc.uid] = {
							uid: proc.uid,
							node: self.N.nodes[proc.node_uid],
							script: proc.script,
						}				
						
						cb('Remote process started (pid: '+proc.uid+')')
					}
					else
						throw "Cannot start the process!"					
				})
				
				//put the process in the cluster aswell
				cluster.processes.push({uid: uid, node: this.N.nodes[node_uid]});		
			}
		}
		//console.log(cluster);
		this.clusters[cluster.cid] = cluster;
		//console.log(this.P.processes);
	}
	
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
		//console.log("in new_process with new process: " + new_process.uid);
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
		if(( ! this.P.processes[id1].node.remote )&&( ! this.P.processes[id2].node.remote ))
		{
			var msg = {
				pid: id1,
				to: id2,
				host: this.P.processes[id2].node.host,
				port: this.P.processes[id2].port
			}
			
			this.P.processes[id1].node.channel.koala_node.bind_process_node( msg, function() {
			
				// Save the new link in the RT
				self.RT.link( 
					{ cid: id1, node: self.P.processes[id1].node},
				  	{ cid: id2, node: self.P.processes[id2].node}
				  )
				
				cb('Binding done ('+id1+' --> '+id2+')')
			})
		}
		
		// node --> remote
		if(( ! this.P.processes[id1].node.remote )&&( this.P.processes[id2].node.remote ))
		{
			console.log("in node->remote");
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
			
				// Save the new link in the RT
				self.RT.link( 
					{ cid: id1, node: self.P.processes[id1].node},
				  	{ cid: id2, node: self.P.processes[id2].node}
				  )
				// (2) Send updated routing table to proxy --> [ process_id : browser_id ]
				self.proxy.send({ cmd:'new_rt', RT: self.RT.__table , koala_remote : self.RT.__table[id2].node.channel.koala_remote})
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
			
				// Save the new link in the RT
				self.RT.link( 
					{ cid: id1, node: self.P.processes[id1].node},
				  	{ cid: id2, node: self.P.processes[id2].node}
				  )
				// (2) Send updated routing table to proxy --> [ process_id : browser_id ]
				self.proxy.send({ cmd:'new_rt', RT: self.RT.__table})
				self.proxy.send({
					cmd : 'new_conn', 
					host : self.P.processes[id2].node.host , 
					port : self.P.processes[id2].port, 
					uid: id2
				});
				
				//console.log(self.RT.__table[id2].node.channel.koala_remote);
				cb('Binding done ('+id1+' --> '+id2+')')
			})			
			
			
			// (3) Tell id2 (browser) to connect to Proxy
			
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
		{}
	}
}

/*
	Unbind two processes from the routing table
*/
var unbind_processes = function(cmd, cb) {
	if(cmd.length == 3) {
		
		//gets both the ids of the two processes
		var pid1 = parseInt(cmd[1])
		var pid2 = parseInt(cmd[2])
		
		this.RT.unlink(pid1, pid2, this.proxy, function(proxy, __table){
			proxy.send({ cmd:'new_rt', RT: __table})
		});
		
		var msg = {
			pid1: pid1,
			pid2: pid2,
		}
		
		if(!this.P.processes[pid1].node.remote)
			this.P.processes[pid1].node.channel.koala_node.unbind_process_node(msg, function(){});		
	}
	else{
		//too few parameters
	}
}

/*
	Binds two clusters together.
	Relies on bind_processes
*/
var bind_clusters = function(cmd, cb) {
 
	var self = this
 
	// bindc [cid1] [cid2]
	if(cmd.length == 3) {
		
		//gets both the ids of the two clusters
		var cid1 = parseInt(cmd[1])
		var cid2 = parseInt(cmd[2])
		
		var c1 = this.clusters[cid1];
		var c2 = this.clusters[cid2];
		
		/*console.log(c1);
		console.log(c2);
		console.log(c1.processes);
		console.log(c2.processes);*/
		
		//bind each process in cluster c1 with each process in cluster c2
		for(var i = 0; i < c2.processes.length; i++){
			for(var j = 0; j < c1.processes.length; j++){
				var cmd = [];
				cmd[0] = "bind "
				cmd[1] = ""+c1.processes[j].uid
				cmd[2] = ""+c2.processes[i].uid
				this.bind_processes(cmd, cb);
			}
		}
	}
}

/*
	Unbinds two clusters that were previously binded.
	Unbinds all the processes in cid1 from all the
	processes in cid2. Doesn't remove the clusters.
*/
var unbind_clusters = function(cmd, cb){
	if(cmd.length == 3) {
		
		//gets both the ids of the two clusters
		var cid1 = parseInt(cmd[1])
		var cid2 = parseInt(cmd[2])
		
		var cluster_from = this.clusters[cid1]
		var cluster_to = this.clusters[cid2]
		
		for(var i = 0; i < cluster_from.processes.length; i++){
			for(var j = 0; j < cluster_to.processes.length; j++){
				this.unbind_processes( ["unbind ", ""+cluster_from.processes[i].uid, ""+cluster_to.processes[j].uid], function(){});
			}
		}	
	}
	else{
		//too few parameters
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
	
	console.log("[koala:root] " + varname + "" + JSON.stringify(res) + "\n");
	cb("[koala:root] " + varname + "" + JSON.stringify(res) + "\n")
}

/*
	Kills a specific process
*/
var kill_process = function(cmd, cb){
	var self = this
	
	var pid_to_kill = parseInt(cmd[1]);
	
	var node_containing_pid = this.P.processes[pid_to_kill].node;
	
	//remove it from the list of processes
	delete this.P.processes[pid_to_kill];
	
	//remove it from the routing table (if it's inside)
	this.RT.removeEntry(pid_to_kill);
	
	//physically kill the process [difference between remote & k_node!]
	if(!node_containing_pid.remote)
		node_containing_pid.channel.koala_node.kill_process_node(pid_to_kill, node_containing_pid.uid, function(node_id){
			cb(node_id);
		});
	else{
		node_containing_pid.channel.koala_remote.kill_process_remote(pid_to_kill, node_containing_pid.uid, function(node_id){
			cb(node_id)
		});
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
					node.channel.koala_node.kill_node();
				}
				else{
					node.channel.koala_remote.kill_remote();
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
	
	var cid = cmd[1];
	var cluster = this.clusters[cid]
	
	//kill each process in the cluster
	for(var i = 0; i < cluster.processes.length; i++){
		this.kill_process(["kill", ""+cluster.processes[i].uid], function(){})
	}
	
	delete this.clusters[cid];
}

/*
	Migrates one process from one node to another
*/
var migrate_process = function(cmd, cb){
	var self = this;
	if(cmd.length == 3) {
		var proc_id_to_move = parseInt(cmd[1])
		var new_node_id = parseInt(cmd[2])
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
		//too few arguments
	}
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
var CommandsManager = function( N, G, P, RT, px, K, clusters, runtime_register) {
	
	this.N = N			                     // Nodes (koala_node + browsers)
	this.G = G			                     // Global variables (ports, ...)
	this.P = P			                     // Processes (eg prod.js, cons.js, ...)
	this.RT = RT		                     // Routing table object (k_routing_table)
	this.proxy = px		                     // Proxy forked process (koala_proxy)
	this.K = K			                     // Cluster global configurations (contains proxy port)
	this.clusters = clusters                 //cluster of processes
	this.runtime_register = runtime_register //runtime register of the messages
}

CommandsManager.prototype = {
	get_nodes : get_nodes,
	get_remotes : get_remotes,
	get_nodes_names : get_nodes_names,
	get_remotes_names : get_remotes_names,
	get_scripts : get_scripts,
	get_processes : get_processes,
	get_bindings : get_bindings,
	run_new_cluster : run_new_cluster,
	run_new_process : run_new_process,
	bind_processes : bind_processes,
	unbind_processes : unbind_processes,
	bind_clusters : bind_clusters,
	unbind_clusters : unbind_clusters,
	get_varname : get_varname,
	migrate_process : migrate_process,
	kill_process : kill_process,
	kill_node : kill_node,
	kill_cluster : kill_cluster,
}

module.exports = CommandsManager

 