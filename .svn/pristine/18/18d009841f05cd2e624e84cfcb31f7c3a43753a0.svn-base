/**
 *  Runtime setup
 */

var connection = {} // <-- PX
var worker_id;
var b_id;
var callback = {};
var binded = false;
var xmlhttp = new XMLHttpRequest();

//TODO: TO BE CHANGED WITH ACTUAL VALUES
var k_root_host = '127.0.0.1';
var k_root_port = 9298;


var require = function() { 
	self = this;
	return {
		self: this,
		
		//send a stringified version of the object
		//containing the msg and the uid of the worker
		send: function( msg ) {
			if(connection != {}){
				// TODO: if browser --> node, then send, else if browser--> browser use self.send
				try{
				var ts = new Date().getTime();
				connection.send(JSON.stringify({
					cmd: "fwd",
					data: msg,
					from: worker_id,
					ts: ts,
				}))
				}
				catch (err) {
					console.log(err.message);
				}
			}
		},
		
		//send a stringified version of the object
		//containing the msg and the uid of the worker
		send_LB: function( msg ) {
			if(connection != {}){
				// TODO: if browser --> node, then send, else if browser--> browser use self.send
				try{
				var ts = new Date().getTime();
				connection.send(JSON.stringify({
					cmd: "fwd",
					data: msg,
					from: worker_id,
					ts: ts,
				}))
				}
				catch (err) {
					console.log(err.message);
				}
			}
		},
		
		//isBinded is a function that tells if the current node is binded to somebody or not
		//if it's not, usually nothing is sent to avoid message loss
		isBinded: function(){
			return binded;
		},
		
		//send values to the runtime_register of koala_root
		runtime_register : function(msg){
			xmlhttp.open("PUT", 'http://'+k_root_host+':'+k_root_port+'/API/vars?name='+msg.name+'&value=' + msg.value + '&pid=' + worker_id, true);
			xmlhttp.send();
		},
		
		createNode : function( cb ) {
			self.callback = cb;
			self.onmessage = function(msg) {
				cb(msg.data) 
			}
			
			return {
				start : function(){
				}
			}
		},
		
		notifyPage : function (object) {

			notification = {"IsNotify": 1, "Object" : object}
			postMessage(notification)
		
		}
	}
}

var console = {
			log : function (msg) {
				postMessage(JSON.stringify(msg));
			}
		};
		
self.onmessage = function( message ) {
	
	if(message.data["cmd"] == 'bind'){
		//it's a bind command, connect with ws to the host+port
		binded = true;
		
		new WebSocket('ws://'+message.host+':'+message.port)
		
		connection.onmessage = function(msg){
			
			//console.log(msg.data)
			callback(msg.data)
		}
		
		connection.onopen = function() {
			connection.send(JSON.stringify({cmd: 'setup', from: message.data["uid"]}));
		}
		
		connection.onclose = function() {
			postMessage("CLOSED CONNECTION");
		}
		
		connection.onerror = function(evt) {
			postMessage("WEBSOCKET CONNECTION ERROR: " + evt.data);
		}
	}
	
	//if the produces is outside the scope of the
	//producer script, we need a way to send data
	//from the upper layer to the script itself
	else if(message.cmd == "prod"){
		callback(message.data);
	}
	
	else {
		worker_id = message.data["uid"];
		b_id = message.data["b_id"]
		importScripts( message.data["script_src"] )
		//connection = new WebSocket('ws://bull.inf.unisi.ch:9298')
		connection = new WebSocket('ws://neha.inf.unisi.ch:9298')
		//connection = new WebSocket('ws://localhost:9298')
		
		connection.onmessage = function(msg){
			
			//console.log(msg.data)
			callback(msg.data)
		}
		
		connection.onopen = function() {
			connection.send(JSON.stringify({cmd: 'setup', from: message.data["uid"]}));
		}
		
		connection.onclose = function() {
			postMessage("CLOSED CONNECTION");
		}
		
		connection.onerror = function(evt) {
			postMessage("WEBSOCKET CONNECTION ERROR: " + evt.data);
		}
	}
};
