var debug = require('debug')
var log = {
	proxy: debug('wls:proxy'),
	ws: debug('wls:proxy:WS')
}

var RoutingTable = require('./k_globals/k_root/k_routing_table.js')
var RT = new RoutingTable()
var CT = [] //connection table, keeping conn/proc_id/type(ws or zmq)
var K = {}

var WebSocketServer = require('ws').Server
var wss = undefined

var setupQueue = new Array();

try
{
	var zmq = require('zmq');
}
catch(e)
{
	var l = "[root:ERROR] - No ZMQ support on this machine!"
	var f = function() {log.proxy(l); return { on : f, bindSync : f } }
	var zmq = {
		socket : f
	}
	f()
}
var receiver = zmq.socket('pull');

var lastSent = {}
var lastReceive = {}
var isSlowMode = {}

receiver.on("EINTR", function(e){
	//log.proxy("Receiver EINTR: " + e);
});


process.on('error', function(error) {
	//log.proxy('Process error: ' + error) 
})

process.on('message', function(msg) {
	//log.proxy('Process received new message: ' + msg.cmd)

	/*
	 * Proxy must insert a new connection to the Routing Table
	 */		
	if(msg.cmd == 'new_rt')
	{
		RT.link(msg.from, msg.to, msg.aliases);
	}

	/*
	 * Proxy must delete a connection from the RT 
	 */		
	if(msg.cmd == 'del_rt')
	{
		RT.unlink(msg.from, msg.to);
	}
	
	/*
	 * Proxy must open a new zmq connection:
	 *
	 * A zmq push channel must connect to the node and the Connection table must be updated
	 */		
	if(msg.cmd == 'new_conn')
	{
		var sender = zmq.socket('push');
		sender.connect("tcp://" + msg.host + ":" + msg.port, function(err) {
    		if (err) throw err;
		});
		CT[msg.uid] = sender;
	}

	/*
	 * Setup a new connection
	 *
	 * bind the receiver to the incoming zmq connections (many zmq connections)
	 * open the ws server
	 * create a new event to the bound channel 'on message' which will send data to the browsers
	 */
	if(msg.cmd == 'setup') {
	
		K = msg.K

		receiver.bindSync('tcp://*:'+K.PROXY.port_ZMQ)
		
		/*
		 * Server -> Remote connection
		 *
		 * zmq sends messages that must be forwarded to the browser through ws
		 */
		receiver.on('message', function(buf) {
			var msg = JSON.parse(buf);
			var recipients = [];
			
			//unfortunately this check here is needed because the asynchronous behaviour can lead
			//to connecting while checking for connection, thus leading to messages never leaving
			//the setupqueue array
			recipients = RT.getTo(msg.sender_operator);
			if(recipients){
				for(var i = 0; i < recipients.length; i++){
					if(setupQueue[recipients[i]]){
						var cid = recipients[i];
						for(var queue_m = 0; queue_m < setupQueue[cid].length; queue_m++){
							if(setupQueue[cid][queue_m]){
								//console.log("proxy received a message from zmq and found something in the setupQueue, so its sending it (or at least trying to)");
								if(!CT[recipients[i]].in) return;
								CT[recipients[i]].in.connection.send(JSON.stringify(setupQueue[cid][queue_m]));
								delete setupQueue[cid][queue_m];
							}
						}
					}
				}
			}
			
			//setup message
			if(msg._WLS_SETUP == "bind"){
				console.log("setup binding received");
				recipients = RT.getTo(msg.sender_operator);
				var found = false;
				if(recipients){
					for(var i = 0; i < recipients.length; i++){
						if(recipients[i] == msg.receiver && CT[recipients[i]].in){ //check if the message for the in connection arrived yet...
							found = true;
							CT[recipients[i]].in.connection.send(JSON.stringify(msg));
						}
					}
				}
				
				
				
				if(!found){
					//there is already a message setup sent awaiting to be executed
					if(setupQueue[msg.receiver]){
						console.log("second happening");
						setupQueue[msg.receiver].push(msg);
					}
					//no message awaiting
					else{
						console.log("first happening");
						setupQueue[msg.receiver] = [];
						setupQueue[msg.receiver].push(msg);
					}
				}
			}
			
			
			if(msg.sendTo) {
				recipients = RT.getAlias(msg.from, msg.to);
			} else {
				recipients = RT.getTo(msg.from);
			}
			
			var isBroadcast = false

			if(isBroadcast) {
				//BROADCAST
				for(var i = 0 ; i < recipients.length; i++){
					msg["to"] = recipients[i];
					
					if(!CT[recipients[i]]) return;
					
					CT[recipients[i]].in.connection.send(JSON.stringify(msg));
				}
			} else {
				//ROUND ROBIN
				var out = [];
				var slowOut = [];
				for(var i in recipients) {
					if(isSlowMode[recipients[i]] == false || isSlowMode[recipients[i]] == undefined) {
						out.push(recipients[i])
					} else {
						slowOut.push(recipients[i])
					}
				} 

				var pool = undefined
				if(out.length == 0) {
					pool = slowOut
				} else {
					pool = out
				}

				if(lastSent[msg.from] == undefined) {
					lastSent[msg.from] = 0
				}

				if(lastSent[msg.from] >= pool.length) {
					lastSent[msg.from] = 0
				}

				msg.to = pool[lastSent[msg.from]]
				msg.type = 'incoming_message'

				if(CT[pool[lastSent[msg.from]]] != undefined && CT[pool[lastSent[msg.from]]].readyState == 1)
					CT[pool[lastSent[msg.from]]].send(JSON.stringify(msg));

				lastSent[msg.from]++
			}
		});		
		

		wss = new WebSocketServer({port: K.PROXY.port_HTTP});
		wss.on('connection', function connection(ws) {
			log.ws('New connection')

			var on_error = wsError.bind(null, ws)
			var on_close = wsClose.bind(null, ws)
			var on_open = wsOpen.bind(null, ws)
			var on_message = wsMessage.bind(null, ws)

			ws.on('error', on_error)
			ws.on('close', on_close)
			ws.on('open', on_open)
			ws.on('message', on_message)
		})
	}
})

var wsError = function(ws, error) {
	log.ws('Error: ' + error)
}

var wsClose = function(ws) {
	log.ws('Closed a connection')
}

var wsOpen = function(ws) {
	log.ws('Opened a connection');
}

var wsMessage = function(ws, data, flags) {
	try{
		var message = JSON.parse(data)
	} catch(e) {
		//console.log(data)
	}

	log.ws('New data received with command: ' + message.type)

	if(message.type === 'setup') {
		log.ws('Setup received from cid: ' + message.cid);
		console.log('Setup received from cid: ' + message.cid);
		CT[message.cid] = ws;
		
		//there may be more than one message awaiting, always stored as array
		if(setupQueue[message.cid]){
			for(var queue_m = 0; queue_m < setupQueue[message.cid].length; queue_m++){
				//console.log("proxy received a message type=setup from a browser, it found something in the setupqueue so its trying to send it");
				if(setupQueue[message.cid][queue_m]){
					console.log("send setup ws");
					ws.send(JSON.stringify(setupQueue[message.cid][queue_m]));
					delete setupQueue[message.cid][queue_m];
				}
			}
		}
		
		var recipients = RT.getTo(message.cid);
		for(var i = 0; i < recipients.length; i++){
			if(CT[recipients[i]]){
				CT[recipients[i]].send(JSON.stringify({
					"_WLS_SETUP"			: "bind",
					"sender_operator" 		: message.cid,
					"sender_operator_alias" : message.alias,
					"sender_worker" 		: undefined,
					"receiver"				: recipients[i]
				}));
			}
		}
		
		log.ws('Setup finished')
	} else if (message.type == 'incoming_message') {
		
		var cid = message.from
		
		//needed for join
		message.from_operator = cid;
		
		var recipients = undefined
		if(message.alias == undefined) {
			recipients = RT.getTo(cid)
		} else {
			recipients = RT.getAlias(cid, message.alias)
		}
		
		//unfortunately this check here is needed because the asynchronous behaviour can lead
		//to connecting while checking for connection, thus leading to messages never leaving
		//the setupqueue array
		//console.log(recipients);
		if(setupQueue[message.from]){
			for(var queue_m = 0; queue_m < setupQueue[message.from].length; queue_m++){
				//console.log("proxy received a message type=incoming_message from a browser, it found something in the setupqueue so its trying to send it");
				if(setupQueue[message.from][queue_m]){
					ws.send(JSON.stringify(setupQueue[message.from][queue_m]));
					delete setupQueue[message.from][queue_m];
				}
			}
		}
	
		var isBroadcast = false

		if(isBroadcast) {
			//TODO
		} else {
			if(lastReceive[cid] == undefined) {
				lastReceive[cid] = 0
			}

			if(lastReceive[cid] >= recipients.length) {
				lastReceive[cid] = 0
			}

			message.to = recipients[lastReceive[cid]]
			if(CT[recipients[lastReceive[cid]]] != undefined){
				CT[recipients[lastReceive[cid]]].send(JSON.stringify(message));
			}

			lastReceive[cid]++
		}
	} else if(message.type == 'start_slow_mode') {
		isSlowMode[message.from] = true
	} else if(message.type == 'stop_slow_mode') {
		isSlowMode[message.from] = false
	}
	
	if(message._WLS_SETUP == "unbind"){
		var recipients = RT.getTo(message.sender_operator);
		for(var i = 0; i < recipients.length; i++){
			if(CT[recipients[i]]){
				CT[recipients[i]].send(JSON.stringify(message));
			}
		}
	}
}