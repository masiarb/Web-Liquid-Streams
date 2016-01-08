/**
 * New node file
 */
 
var g = require('./../k_globals/globals.js')
var os = require('os')

/*
	Function that processes a new connection. Depending on what is received
	from the socket, the function executes accordingly.
	@param {Socket} socket The socket from which the messages are received
	@param {Object} R Registry with all the values of the cluster
*/
exports.process_new_connection = function(socket, R) {

	socket.cb = {}

	socket.on('data', function(data) {
		
		var outmsg = ''
		var msg = JSON.parse(data.toString())
		
		switch(msg.msg)
		{
		case 'newNode':

			if( ! R.nodes[msg.host]) {
				
				if( ! R.default_node_id)
					R.default_node_id = msg.host
			
				R.nodes[msg.host] = { 
					since: os.uptime(), 
					socket: socket, 
				}
				socket.node_host = msg.host
				g.log('[Koala::Root] registered new node: '+msg.host)
				process.stdout.write('> ');
			}
			
		break;
		
		case 'newProc':

			R.processes[msg.process] = { uid:msg.process, host:msg.host, port:msg.port }
			outmsg+= '[Koala::Root] started new process: '+msg.process+'\n'
		
		break;
		}
		
		// Execute callback
		if(socket.cb[msg.msg]) socket.cb[msg.msg](outmsg)
	})
	
	socket.on('end', function() {
	
		console.log('\n\n\n SOCKET CLOSED \n\n\n')
	
		delete R.nodes[socket.node_host]
	})
}