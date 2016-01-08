/**
 * ROOT RESTful API
 */

var insp = require('inspect')

var execute_command = function( req, res ) {

	var outmsg = '';
	var cmd = req.url.split('/');
	
	
	if(cmd[1] == 'API') cmd.splice(0,2)
	else return false;
	
	switch(cmd[0]){
	
	//
	//help
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
		
		res.end(outmsg)
		
	return true;
	
	//
	// ls
	//		
	case 'ls':
	
		if(cmd.length == 1||cmd[1]=='') {
	
			// Genreates a string representaton of the array
			//req.end( JSON.stringify(this.commands_manager.get_nodes_names())
			
			outmsg+= 'Cluster nodes:'+ JSON.stringify(this.commands_manager.get_nodes_names()) + '\n'
			outmsg+= 'Remote nodes:'+ JSON.stringify(this.commands_manager.get_remotes_names()) + '\n'
		}
		
		else {
		
			switch(cmd[1]) 
			{
			case 'nodes':	
			
				outmsg+= JSON.stringify(this.commands_manager.get_nodes()) + '\n'
				
			break
		
			case 'remote':
			
				outmsg+= JSON.stringify(this.commands_manager.get_remotes()) + '\n'
				
			break
		
			case 'processes':
			
				outmsg += JSON.stringify(this.commands_manager.get_processes()) + "\n";
				
			break
			
			case 'scripts':
		
				outmsg+= JSON.stringify(this.commands_manager.get_scripts()) + '\n'				
				
			break;
			
			case 'bindings':
			
				outmsg += JSON.stringify(this.commands_manager.get_bindings()) + '\n';

			break;				
			}
		}
		
		res.end(outmsg)	
		
		return true;
	

	//
	// run
	//		
	case 'run':
	
		this.commands_manager.run_new_process(cmd, function(msg){res.end(msg);})

	return true;

	case 'runc':
	
		this.commands_manager.run_new_cluster(cmd, function(msg){res.end(msg);})

	return true;



	case 'bind':
	
		this.commands_manager.bind_processes(cmd, function(msg){res.end(msg);})
		
	return true;

	case 'bindc':
	
		this.commands_manager.bind_clusters(cmd, function(msg){res.end(msg);})
		
	return true;
	
	case 'get':
		this.commands_manager.get_varname(cmd, function(msg){res.end(msg)})
	break;
	
	
	
	}
	
	// no command handled by the switch: return false :(
	return false;
	

	
}




var RESTAPIManager = function( cm ) {
	
	this.commands_manager = cm
	
}


RESTAPIManager.prototype = {
	execute_command : execute_command
}

module.exports = RESTAPIManager

 