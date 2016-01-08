/**
 * koala console manager
 */

var util = require('util');
var fs = require('fs');


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
	
	    var n = spawn('killall', ['-9', 'nodejs']);
	    var n = spawn('killall', ['node']);
	    	
	break;
	
	//
	// help
	//
	case 'help':
	
		outmsg+= '  -- Available commands --\n'
		outmsg+= '  help                          - show this help\n'
		outmsg+= '  ls                            - list all peer resources\n'			
		outmsg+= '  ls peers                      - list all server peers \n'
		outmsg+= '  ls remote                     - list all remote (web) peers\n'
		outmsg+= '  ls scripts                    - list all the available scripts\n'
		outmsg+= '  ls bindings                   - list all the bindings\n'
		outmsg+= '  ls processes                  - list all running workers\n'
		outmsg+= '  ls operators                  - list all running operators\n'
		outmsg+= '  ls connections                - list all the workers and their connections\n';
		outmsg+= '\n'
		outmsg+= '  run {src}                     - run the script [src] on any worker on any node\n'
		outmsg+= '  run {src} [node]              - run the script [src] in node [node]\n'
		outmsg+= '  runw {src} [node]             - run the script [src] on any worker in node [node]\n'
		outmsg+= '  runc {src} [node] [num] [flag]- run the script [src] in [num] copies in node [node] with flag [flag]. If no flag specified, the program runs the cluster as if it was run with -a.\n'			
		outmsg+= '\n'
		outmsg+= '  update_script {src} {cid}     - updates the script {src} in the operator with cid {cid}.\n'
		outmsg+= '\n'
		outmsg+= '  bind  [cid1] [cid2]           - connect operator [cid1] to operator [cid2]\n'
		outmsg+= '  bindw   [id1] [id2]           - connect operator [id1] to worker [id2]\n'
		outmsg+= '  bindc  [cid1] [cid2]          - connect operator [cid1] to operator [cid2] (deprecated)\n'
		outmsg+= '  bindc_content_based [cid1] [cid2] - connect worker [cid1] to operator [cid2] in a content_based sending algorithm (hash function to be provided)\n'
		outmsg+= '  unbind [id1] [id2]            - disconnect worker [id1] from worker [id2]\n'
		outmsg+= '  unbindc [cid1] [cid2]         - disconnect all the workers in [cid1] from all the workers in [cid2]\n'
		outmsg+= '\n'
		outmsg+= '  addworker [src] [cid] [nid]   - adds a worker to an operator with id [cid] and runs script [src]\n'
		outmsg+= '\n'
		outmsg+= '  get [varname]                 - gets the list of values for the given [varname]\n'
		outmsg+= '  migrate [cid] [nid]           - migrates the operator [cid] to the new location peer [nid]\n'
		outmsg+= '\n'
		outmsg+= '  kill [id]                     - kills worker [id]\n'
		outmsg+= '  killp [cid]				      - kills a worker in an operator [cid] taken out randomly\n'
		outmsg+= '  killall [peer]                - kills all workers of peer [peer]\n'
		outmsg+= '  killc [cid]                   - kills an operator [cid] with all the workers inside of it\n'
		outmsg+= '\n'
		outmsg+= '  start_controller              - starts the controller\n'
		outmsg+= '  sc                            - starts the controller (shortcut version)\n'
		outmsg+= '\n'
		outmsg+= '  exec file.k                   - executes the content of a .k file (list of manual inputs).\n'
		outmsg+= '  exec file.js                  - executes the content of a .js file (JSON object describing the topology).\n'
		outmsg+= '\n'
		outmsg+= ' -- Flags --\n'
		outmsg+= '-a                              - Automatic. The operator\'s number of workers is adjusted automatically by the controller (if started).\n'
		outmsg+= '-m                              - Manual. The operator\'s number of workers is not adjusted by the controller, but manually (by the sysadmin).\n'
		
		cb(outmsg)
		
	break;
	
	//
	// exec is defined in koala_root.js!
	//
	
	
	//
	// ls
	//		
	case 'ls':
	
		if(cmd.length == 1) {
			outmsg+= '\n Cluster nodes: '+ this.PM.get_nodes_names() + '\n'
			outmsg+= 'Remote nodes:  '+ this.PM.get_remotes_names() + '\n'
		}
		
		else {
		
			switch(cmd[1]) 
			{
			case 'peers':	
				outmsg+= 'Server Operators: '+ this.PM.get_nodes_names() + '\n'
				
			break
		
			case 'remote':
			
				outmsg+= 'Remote Operators:  '+ this.PM.get_remotes_names() + '\n'
				
			break
		
			case 'processes':
				
				outmsg += "Processes: " + this.PM.get_processes() + '\n'
			
			break
			
			case 'scripts':
		
				outmsg+= 'Scripts: ' + this.PM.get_scripts() + '\n'				
				
			break;		
			
			case 'bindings':
			
				outmsg += "Bindings: " + this.PM.get_bindings_cli() + '\n'
			
			break
			
			case 'operators':
				
				outmsg += "Clusters: " + this.PM.get_clusters() + '\n'
			
			break
			
			case 'connections':
				
				outmsg += "Connections: " + this.PM.get_connections() + '\n'
			
			break
			
							
			}
		}
		
		cb(outmsg)		
		
		break;
	

	//
	// run
	//		
	case 'run':
	
		this.PM.run_new_cluster(cmd, cb)

	break;
	
	//
	// runw
	//		
	case 'runw':
	
		this.PM.run_new_process(cmd, cb)

	break;
	
	//
	// runc -> runs a cluster of processes
	//		
	case 'runc':
	
		this.PM.run_new_cluster(cmd, cb)

	break;
	
	//
	// update_script -> adds a new script
	//
	case 'update_script':
		
		if(cmd.length === 3){
			this.PM.update_script(cmd[1], cmd[2], cb);
		}
		else{
			console.log("update_script received either too many or too few parameters.");
		}
			
	break;
	//
	// bind
	//	
	case 'bind':
		
		renewTimeout();
		this.PM.bind_clusters(cmd, cb)
		
	break;
	
	//
	// bindw
	//	
	case 'bindw':
		
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
		renewTimeout();
		this.PM.bind_clusters(cmd, cb)
		
	break;
	
	//
	// bindc_content_based -> binds two operators in a content_based algorithm based off a hash function
	//	
	case 'bindc_content_based':
		renewTimeout();
		this.PM.bind_clusters(cmd, cb, undefined, "content_based")
		
	break;
	
	//
	// unbindc -> unbinds two clusters
	//	
	case 'unbindc':
		
		this.PM.unbind_clusters(cmd, cb)
		
	break;
	
	//
	// addworker -> adds a new worker to a cluster with a src
	//	
	case 'addworker':
		
		this.PM.add_worker(cmd, cb)
		
	break;
	
	//
	// get [varname]
	//
	case 'get':
		this.PM.get_varname(cmd, cb)
	break;
	
	//
	// migrate [cid] [nid]
	//
	case 'migrate':
		this.PM.migrate_cluster(cmd, cb)
	break;
	
	//
	// kill [pid]
	//
	case 'kill' :
		this.PM.kill_process(cmd, cb)
	break;
	
	//
	// killp [cid]
	//
	case 'killp' :
		this.PM.kill_process_cluster(cmd, cb)
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
	
	//
	// start_controller
	//
	case 'start_controller' :
		this.PM.start_controller(cmd, cb)
	break;
	
	case 'sc' :
		this.PM.start_controller(cmd, cb)
	break;
	
	}// end switch
}

/*
	Stuff to kill processes after some fixed time
*/
var t;
var renewTimeout = function() {
	//fixed timeout
	//t = setTimeout(killall, 300000);
}

var killall = function() {
	var spawn = require('child_process').spawn
	
	var n = spawn('killall', ['-9', 'nodejs']);
	var n = spawn('killall', ['node']);
}

var proxy_migrate_command = function(cmd, options, cb) {
	this.PM.migrate_cluster_options(cmd, options, cb)
}

/*
	Function to setup the Process Manager by storing it.
	@param: {Object} process_manager The Process Manager.
*/
var ConsoleManager = function( process_manager ) {
	        
    this.PM = process_manager
}

ConsoleManager.prototype = {
        
    process_console_command : process_console_command,
    proxy_migrate_command : proxy_migrate_command
}


module.exports = ConsoleManager