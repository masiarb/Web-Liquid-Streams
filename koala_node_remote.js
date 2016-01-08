/**
 * New node file
 */

 /**
 * == Koala Cluster == NODE process ==
 *
 * MIT licence 
 *
 */
 

//
// Globals
//
var dnode = require('dnode')
var net = require('net');
var g = require('./k_globals/globals.js')
var os = require('os')
var cp = require('child_process');
var Caterpillar = require('caterpillar')

var cbid = 0
var cbtable = {}
var l = new Caterpillar.Logger()
l.setLevel(6)


/*
	Koala node configuration
*/
var K = {
	/*
		Address of the koala_root node
	*/
	Koala_root_RPC : {		 
		port : 9088,
		host : "neha.inf.unisi.ch"
	},
	/*
		Configuration of the local RPC server. 
		-- Warning: Must be unique for the entire node!
	*/
	RPC_server : {
		port : 5000,
		host: os.hostname()
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
	To handle every IPC message
*/
var handle_ipc = function( msg ) {
	
	if(msg.cbid)
	{
		cbtable[cbid]()
		delete cbtable[cbid]
		cbid--;
	}
}



/*
	RPC server
	
	Receives commands from koala_root and executes them:
*/
var rpc_server = dnode({

	/*
		Run a new process
	*/
	run_process : function(msg, cb) {
	
		var src = msg.src
		var uid = msg.uid
		var port = msg.port
		
		try {
		
			var p = cp.fork('./scripts/'+src, [port]);
			p.send({command: 'setup', uid: uid});
			p.on('message', handle_ipc)
	
			P.processes[uid] = {
				process : p				
			}
		
			cb(msg, true)
		}
		catch(e) {
			cb(msg, false)
		}
	},
	

	/*
		Bind processes
	*/	
	bind_process_node : function(msg, cb) {
		
		var process_id = msg.pid
		var host = msg.host
		var port = msg.port
		
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
		cbtable[cbid] = cb
	},
	
	/*
		Unbind processes
	*/
	unbind_process_node : function(msg, cb){
		var process_id = msg.pid1
		var to_unbind = msg.pid2
		
		P.processes[process_id].process.send({
			command: 'unbind_node',
			process_id : process_id,
			to_unbind: to_unbind,
			cbid: (++cbid),		
		})
		
		cbtable[cbid] = cb
	},
	
	/*
		Kill process
	*/
	kill_process_node : function(pid_to_kill, node_id, cb) {
		P.processes[pid_to_kill].process.kill();
		delete P.processes[pid_to_kill];
		
		if(P.processes == undefined)
			P.processes = [];
			
		cb(node_id);
	},
	
	/*
		Kill this node
	*/
	kill_node : function(){
		process.exit(0);
	}

});
rpc_server.listen( K.RPC_server.port );
l.log('info', '[Koala::Node] Node listening on port '+K.RPC_server.port);




/*
	RPC client: used to startup the node and tell koala_root we are here up and running
*/
var d = dnode.connect({ host: K.Koala_root_RPC.host, port: K.Koala_root_RPC.port });

// Handle message from koala_root
var handle_remote = function(koala_root) {

	var msg = {
		port: K.RPC_server.port,
		host: K.RPC_server.host
	}

	// Signal we want to connect
    koala_root.register_new_node(msg, function(uid, alias) {
        
		l.log('info', '[Koala::Node] Connected to Root node (uid: '+uid+', alias:'+alias+')');
		
		K.uid = uid,
		K.alias = alias
    })
}

// Handle disconnection and try to reconnect
var handle_end = function() {
	
	var retry = function( every ) {
	
		setTimeout(function() {
		
			l.log('warning', 'connection lost, retrying')
		
			try {
			
			d = dnode.connect({ host: K.Koala_root_RPC.host, port: K.Koala_root_RPC.port });
			d.on('remote', handle_remote)
			d.on('end', handle_end)
			
			} catch(e) {
				retry( every )
			}	
		}, every)
	}
	retry(1000)
}


d.on('remote', handle_remote)
d.on('end', handle_end)
d.on('error', handle_end)
 