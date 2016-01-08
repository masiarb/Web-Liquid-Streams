/**
 * koala console manager
 */

var util = require('util');


 /*
	The function processes the console command issued by the user
	@param: cmd A command issued to bind two processes
	@param: {function} cb The callback function
*/
var process_console_command = function(cmd, cb) {

	var outmsg = ''

	switch( cmd[0] ) 
	{
	
	case 'exit':
	case 'quit':
	case 'x':
	
		var spawn = require('child_process').spawn
	
	    var n = spawn('killall', ['node']);
	    	
	break;
	
	//
	// help
	//
	case 'help':
	
		outmsg+= '  -- Available commands --\n'
		outmsg+= '  help                     - show this help\n'
		outmsg+= '  ls                       - list all cluster resources\n'			
		outmsg+= '  ls nodes                 - list all cluster nodes\n'
		outmsg+= '  ls remote                - list all remote nodes\n'
		outmsg+= '  ls bindings              - list all the bindings\n'
		outmsg+= '  ls scripts               - list all the available scripts\n'
		outmsg+= '  ls processes             - list all running processes\n'
		outmsg+= '\n'
		outmsg+= '  run [src]                - run the script [src] on any worker on any node\n'
		outmsg+= '  run [src] [node]         - run the script [src] on any worker in node [node]\n'
		outmsg+= '  runc [src] [node] [num]  - run the script [src] in [num] copies in node [node]\n'			
		outmsg+= '\n'
		outmsg+= '  bind   [id1] [id2]       - connect process [id1] to process [id2]\n'
		outmsg+= '  bindc  [cid1] [cid2]     - connect cluster [cid1] to cluster [cid2]\n'
		outmsg+= '  unbind [id1] [id2]       - disconnect process [id1] from process [id2]\n'
		outmsg+= '  unbindc [cid1] [cid2]    - disconnect all the processes in [cid1] from all the processes in [cid2]\n'
		outmsg+= '\n'
		outmsg+= '  get [varname]            - gets the list of values for the given [varname]\n'
		outmsg+= '  migrate [pid] [nid]      - migrates the process [pid] to the new location [nid]\n'
		outmsg+= '\n'
		outmsg+= '  kill [id]                - kills process [id]\n'
		outmsg+= '  killall [node]           - kills all processes of node [node]\n'
		outmsg+= '  killc [cid]              - kills a cluster [cid] with all the processes inside it\n'
		
		cb(outmsg)
		
	break;
		
	//
	// ls
	//		
	case 'ls':
	
		if(cmd.length == 1) {
	
			outmsg+= 'Cluster nodes: '+ this.PM.get_nodes_names() + '\n'
			outmsg+= 'Remote nodes:  '+ this.PM.get_remotes_names() + '\n'
		}
		
		else {
		
			switch(cmd[1]) 
			{
			case 'nodes':	
			
				outmsg+= 'Cluster nodes: '+ this.PM.get_nodes_names() + '\n'
				
			break
		
			case 'remote':
			
				outmsg+= 'Remote nodes:  '+ this.PM.get_remotes_names() + '\n'
				
			break
		
			case 'processes':
				
				outmsg += "Processes: " + this.PM.get_processes() + '\n'
			
			break
			
			case 'bindings':
				
				outmsg += "Bindings: " + this.PM.get_bindings() + '\n'
			
			break
			
			case 'scripts':
		
				outmsg+= 'Scripts: ' + this.PM.get_scripts() + '\n'				
				
			break;						
			}
		}
		
		cb(outmsg)		
		
		break;
	

	//
	// run
	//		
	case 'run':
	
		this.PM.run_new_process(cmd, cb)

	break;
	
	//
	// runc -> runs a cluster of processes
	//		
	case 'runc':
	
		this.PM.run_new_cluster(cmd, cb)

	break;
	
	//
	// bind
	//	
	case 'bind':
		
		this.PM.bind_processes(cmd, cb)
		
	break;
	
	//
	// unbind
	//
	case 'unbind':
		this.PM.unbind_processes(cmd, cb)
	break;
	
	//
	// bindc -> binds two clusters
	//	
	case 'bindc':
		
		this.PM.bind_clusters(cmd, cb)
		
	break;
	
	//
	// unbindc -> unbinds two clusters
	//	
	case 'unbindc':
		
		this.PM.unbind_clusters(cmd, cb)
		
	break;
	
	//
	// get [varname]
	//
	case 'get':
		this.PM.get_varname(cmd, cb)
	break;
	
	//
	// migrate [pid] [nid]
	//
	case 'migrate':
		this.PM.migrate_process(cmd, cb)
	break;
	
	//
	// kill [pid]
	//
	case 'kill' :
		this.PM.kill_process(cmd, cb)
	break;
	
	//
	// killall [node_id]
	//
	case 'killall' :
		this.PM.kill_node(cmd, cb)
	break;
	
	//
	// killc [cid]
	//
	case 'killc' :
		this.PM.kill_cluster(cmd, cb)
	break;
	
	}// end switch
}





/*
	Function to setup the Process Manager by storing it.
	@param: {Object} process_manager The Process Manager.
*/
var ConsoleManager = function( process_manager ) {
	
	this.PM = process_manager
}

ConsoleManager.prototype = {
	process_console_command : process_console_command
}

module.exports = ConsoleManager


