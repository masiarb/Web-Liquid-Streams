/**
 * Process manager: all the commands
 */

var util = require('util');

/*
	Returns the array of nodes in the network.
*/
var get_nodes = function() {
	
	var r = []
	for(x in this.R.nodes) r.push(x)
	return r
}

/*
	Returns the array of remote nodes (remote_worker) in
	the network.
*/
var get_remotes = function() {
	
	var r = []
	for(x in this.R.remotes) r.push(x)	
	return r
}

/*
	Gets the list of scripts that can be run on the master.
*/
var get_scripts = function() {

	return require('fs').readdirSync('./scripts')///Users/masiar/Documents/workspace/Koala/scripts')
}

/*
	Runs a new process on a node.
	@params: cmd A command issued to run a new process on a node
	@params: {function} cb The callback function
*/
var run_new_process = function(cmd, cb) {

	// Check that the script exists
	var script = cmd[1]
		
	var dir = this.get_scripts()
	
	if( dir.indexOf(script) == -1 ) 
	{
		outmsg+= 'No such script! "'+script+'"'
		cb(outmsg)
		return;
	}
		
	// Pick a node for execution
	var node = this.R.default_node_id
	if(cmd[2]) node = cmd[2]
		
	// Get number of processes		
	var replicas = 1
	if(cmd.length == 4) replicas = parseInt(cmd[3])
		
		
	// run [src] [node]		
	if(( ! this.R.nodes[node])&&( ! this.R.remotes[node])) 
	{
		cb('No such node! "'+node+'"')
		return;
	}
	else if(this.R.nodes[node]) 
	{
		//update routing table with new process
		this.RT.processes.push({
			id: this.R.uid,
			bindings: [],
		});
		
		var cmd = { 
			cmd: 'run', 	
			src: script, 
			uid: this.R.uid++, 
			port: this.R.current_free_port++,
			replicas: replicas 
		}
		this.R.nodes[node].socket.cb['newProc'] = cb				
		this.R.nodes[node].socket.write(JSON.stringify(cmd))	
	}
	else if(this.R.remotes[node])
	{
		//update routing table with new process
		this.RT.processes.push({
			id: this.R.uid,
			bindings: [],
		});
		
		var cmd = { 
			cmd: 'run', 	
			src: script, 
			uid: this.R.uid++, 
			port: this.R.current_free_port++,
			replicas: replicas 
		}
			
		this.R.remotes[node].socket.send(JSON.stringify(cmd))
	}	
	
}

/*
	The function binds two processes (relation cmd[1] -> cmd[2])
	@param: cmd A command issued to bind two processes
	@param: {function} cb The callback function
*/
var bind_processes = function(cmd, cb) {
 
	// bind [id1] [id2]
	if(cmd.length == 3) {
		
		//gets both the ids of the two processes
		var id1 = parseInt(cmd[1])
		var id2 = parseInt(cmd[2])
		
		//
		// Connect to the actual process or use koala_root as the proxy for the connection		
		//

		// node --> node
		if( this.R.processes[id1].host && this.R.processes[id2].host ) {
		
			//gets host from the node from which the relation should start
			//and host&port from the node from which the relation should end
			var node = this.R.processes[id1].host
			var port = this.R.processes[id2].port
			var host = this.R.processes[id2].host
		
			//update the routing table
			this.RT.processes[id1].bindings.push(id2);
		
			//if binding node->node
			if(this.R.nodes[node]) {
				//issues the bind command for the two nodes
				var cmd = { cmd:'bind_node', from:id1, to_port:port, to_host:host }				
				this.R.nodes[node].socket.write(JSON.stringify(cmd))
			}
			else {
				// TODO: error! the process is running in a dead node
				throw "The process is running in a dead node!"
			}
			
			cb('binding started')			
		}

		// node --> browser
		if( this.R.processes[id1].host && this.R.processes[id2].remote ) {

			//gets host from the node from which the relation should start
			//and host&port from the node from which the relation should end
			var node = this.R.processes[id1].host
			var port = this.R.processes[id2].port
			var remote = this.R.processes[id2].remote
		
			//update the routing table
			this.RT.processes[id1].bindings.push(id2);
		
			//if binding node->node
			if(this.R.nodes[node]) {
				//issues the bind command for the two nodes
				var cmd = { cmd:'bind_remote', from:id1, to_remote:remote, to_uid:id2 }				
				this.R.nodes[node].socket.write(JSON.stringify(cmd))
			}
			else {
				// TODO: error! the process is running in a dead node
				throw "The process is running in a dead node!"
			}
			
			cb('binding started')
		}
		
		// browser --> node
		if( this.R.processes[id1].remote && this.R.processes[id2].host ) {
			// TODO: we have to connect directly to id2, as we are now a proxy for id1
		}
		
		// browser --> browser
		if( this.R.processes[id1].remote && this.R.processes[id2].remote ) {
			// TODO: tell the browser that id1 and id2 shall be connected
		}
	}
}


 /*
	The function processes the console command issued by the user
	@param: cmd A command issued to bind two processes
	@param: {function} cb The callback function
*/
var process_console_command = function(cmd, cb) {

	var outmsg = ''

	switch(cmd[0]) 
	{
	//
	// help
	//
	case 'help':
	
		outmsg+= '  -- Available commands --\n'
		outmsg+= '  help                     - show this help\n'
		outmsg+= '  ls                       - list all cluster resources\n'			
		outmsg+= '  ls nodes                 - list all cluster nodes\n'
		outmsg+= '  ls remote                - list all remote nodes\n'
		outmsg+= '  ls scripts               - list all the available scripts\n'
		outmsg+= '  ls processes             - list all running processes\n'
		outmsg+= '\n'
		outmsg+= '  run [src]                - run the script [src] on any worker on any node\n'
		outmsg+= '  run [src] [node]         - run the script [src] on any worker in node [node]\n'
		outmsg+= '  run [src] [node] [num]   - run the script [src] in [num] copies in node [node]\n'			
		outmsg+= '\n'
		outmsg+= '  bind [id1] [id2]         - connect process [id1] to process [id2]\n'
		outmsg+= '  unbind [id1] [id2]       - disconnect process [id1] from process [id2]\n'
		outmsg+= '\n'
		outmsg+= '  kill [id]                - kill process [id]\n'
		outmsg+= '  killall [node]           - kill all processes of node [node]\n'
		
		cb(outmsg)
		
	break;
		
	//
	// ls
	//		
	case 'ls':
	
		if(cmd.length == 1) {
	
			outmsg+= 'Cluster nodes: '+ this.get_nodes() + '\n'
			outmsg+= 'Remote nodes:  '+ this.get_remotes() + '\n'
		}
		
		else {
		
			switch(cmd[1]) 
			{
			case 'nodes':	
			
				outmsg+= 'Cluster nodes: '+ this.get_nodes() + '\n'
				
			break
		
			case 'remote':
			
				outmsg+= 'Remote nodes:  '+ this.get_remotes() + '\n'
				
			break
		
			case 'processes':
			case 'scripts':
		
				outmsg+= 'Scripts: ' + this.get_scripts() + '\n'				
				
			break;						
			}
		}
		
		cb(outmsg)		
		
		break;
	

	//
	// run
	//		
	case 'run':
	
		this.run_new_process(cmd, cb)

	break;

	case 'bind':
		
		this.bind_processes(cmd, cb)
		
	break;

	}// end switch
}


/*
	Function that processes the commands received from the input.
	@param cmd The issued command
	@param {function} cb The callback function
*/
var process_command = function(cmd, cb) {

	var result = {}

	switch(cmd[0]) 
	{
		
	//
	// ls
	//		
	case 'ls':
	
		result = {
			nodes: this.get_nodes(),
			remotes: this.get_remotes(),
			scripts: this.get_scripts()
		}

		cb(result)		
		
	break;
	

	//
	// run
	//		
	case 'run':
	
		this.run_new_process(cmd, cb)

	break;

	case 'bind':
		
		this.bind_processes(cmd, cb)
		
	break;

	}// end switch
}






/*
	Function to setup the Process Manager by storing R.
	@param: {Object} R Registry with all the values of the cluster.
*/
var PM = function(R, RT) {
	
	this.R = R
	this.RT = RT
}

PM.prototype = {
	get_nodes : get_nodes,
	get_remotes : get_remotes,
	get_scripts : get_scripts,
	run_new_process : run_new_process,
	bind_processes : bind_processes,
	process_command : process_command,
	process_console_command : process_console_command
}

module.exports = PM

