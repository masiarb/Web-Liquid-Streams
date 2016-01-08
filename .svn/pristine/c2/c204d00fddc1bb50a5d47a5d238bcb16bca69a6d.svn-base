/**
 *  Runtime setup
 */
var connection = {} // <-- PX
var worker_id;
var b_id;
var pid;
var callback = {};
var binded = false;
var xmlhttp = new XMLHttpRequest();

var drawUI = false


var throughput = {
	in: 0,
	out: 0
}
var isInitThroughput = false;

//TODO: TO BE CHANGED WITH ACTUAL VALUES
var k_root_host = '127.0.0.1';
var k_root_port = 9298;


isRemote = true
var latency = {
	in: undefined,
	out: undefined
}
var DOMvalues = {}

var controller = {
	defaultWorkerLimit: 64, // Positive number, default 64

	cycleLength: 40, // Positive number, default 40

	outgoingThreshold: 0.1, // In the interval [0; 1], default 0.189

	limitThreshold: 1.9, // In the interval [1; 2], default 1.9

	queueSize: {
		warn: 100, // Positive number, default 100
		critical: 200, // Positive number, default 200
	}
}

var activeCallbacks = 0
var waitingCallbacks = {}

var require = function() { 
	return {
		send: function(message, options) {
	        var timestamp = new Date().getTime()
	        var last_checkpoint = undefined
	        var exectime = undefined

			if(options == undefined || typeof options !== 'object') {
				options = {
					__checkpoints: []
				}
			}  else if(options.__checkpoints == undefined) {
	            options.__checkpoints = []
	        } else {
		        last_checkpoint = options.__checkpoints[options.__checkpoints.length-1]
		  		exectime = timestamp - last_checkpoint.timestamp
	        }

			options.__checkpoints.push({
				worker: worker_id,
                event: 'finished executing',
                timestamp: timestamp,
                exectime: exectime
			})

			var m = {
				type: 'send',
				message: JSON.stringify(message),
				options: options
			}

			postMessage(m)

			throughput.out++
			if(drawUI) {
				postMessage({
					type: 'throughout',
					throughput: throughput
				})
			} else {
				postMessage({
					type: 'writeThoughput',
					throughput: throughput
				})
			}
		},

		sendTo: function(message, to) {
			var timestamp = new Date().getTime()
	        var last_checkpoint = undefined
	        var exectime = undefined

			if(options == undefined || typeof options !== 'object') {
				options = {
					__checkpoints: []
				}
			}  else if(options.__checkpoints == undefined) {
	            options.__checkpoints = []
	        } else {
		        last_checkpoint = options.__checkpoints[options.__checkpoints.length-1]
		  		exectime = timestamp - last_checkpoint.timestamp
	        }

			options.__checkpoints.push({
				worker: worker_id,
                event: 'finished executing',
                timestamp: timestamp,
                exectime: exectime
			})

			var m = {
				type: 'send',
				message: JSON.stringify(message),
				options: options,
				alias: to
			}

			postMessage(m)

			throughput.out++
			if(drawUI) {
				postMessage({
					type: 'throughout',
					throughput: throughput
				})
			} else {
				postMessage({
					type: 'writeThoughput',
					throughput: throughput
				})
			}
		},
		makeCallback: function(f) {
			if(typeof(f) == 'function') {
				return function() {
					activeCallbacks++
					f.apply(this, arguments)
					activeCallbacks--
					__k.done()
				}
			} else {
				console.log("Warning: makeCallback parameter isn't a function")
			}
		},
		makeAlternativeCallback: function(f) {
			if(typeof(f) == 'function') {
				return function() {
					f.apply(this, arguments)
					activeCallbacks--
					__k.done()
				}
			} else {
				console.log("Warning: makeCallback parameter isn't a function")
			}
		},

		isBinded: function(){
			return binded;
		},
		createNode : function(cb) {
			scriptCallback = cb;
		},
		done: function() {
			if(activeCallbacks == 0) {
				postMessage({
					type: 'free'
				})
			}
		},

		registerProducer: function(identifier) {
			postMessage({
				type: "registerProducer",
				identifier: identifier
			})
		},

		remoteUpdate: function(identifier, command) {
			return function(identifier, command) {
				postMessage({
					type: 'domGet',
					identifier: identifier,
					command: command
				})
			}
		},
		remoteGet: function(identifier, command) {
			return function(identifier, command) {
				if(DOMvalues[identifier] && DOMvalues[identifier][command]) {
					return (DOMvalues[identifier][command])
				} else {
					return undefined
				}
			}
		},
		remoteSet: function() {
			return function(identifier, command, value, extra) {
				postMessage({
					type: 'domSet',
					identifier: identifier,
					command: command,
					value: value,
					extra: extra
				})
			}
		},
		remoteInLatency: function() {
			return function() {
				return latency['in']
			}
		},
		remoteOutLatency: function() {
			return function() {
				return latency['out']
			}
		},
		createHTML: function(id, html) {
			postMessage({
				type: 'addHtml',
				identifier: id,
				html: html,
			})
		},
		createScript: function(id, script) {
			postMessage({
				type: 'addScript',
				identifier: id,
				script: script,
			})
		},
		callFunction: function(name, args, callback) {
			var m = {
					type: 'callFunction',
					name: name,
					args: args,
					token: undefined
			}

			if(typeof(callback) == 'function') {
				activeCallbacks++
				var token = new Date().getTime()
				waitingCallbacks[token] = callback
				m.token = token
			}

			postMessage(m)
		},
		getThroughput: function() {
			return throughput
		},

		setControllerVariable: function(variables) {
			for(var key in variables) {
				controller[key] = variables[key]
			}

			postMessage({
				type: 'controllerVariables',
				variables: controller
			})
		},
		
		getWorkerNumber: function(id, callback){
			callback([""])
		},
		
		storage: {
			getMergedSortList: function() {
				postMessage({
					type: "getMergedSortList",
					content: arguments
				})
			}
		}
	}
	// self = this;
	// return {
	// 	self: this,
		
	// 	//send a stringified version of the object
	// 	//containing the msg and the uid of the worker
	// 	send: function( msg ) {
	// 		if(connection != {}){
	// 			// TODO: if browser --> node, then send, else if browser--> browser use self.send
	// 			try{
	// 			var ts = new Date().getTime();
	// 			connection.send(JSON.stringify({
	// 				cmd: "fwd",
	// 				data: msg,
	// 				from: worker_id,
	// 				ts: ts,
	// 			}))
	// 			}
	// 			catch (err) {
	// 				console.log(err.message);
	// 			}
	// 		}
	// 	},
		
	// 	//send a stringified version of the object
	// 	//containing the msg and the uid of the worker
	// 	send_LB: function( msg ) {
	// 		if(connection != {}){
	// 			// TODO: if browser --> node, then send, else if browser--> browser use self.send
	// 			try{
	// 			var ts = new Date().getTime();
	// 			connection.send(JSON.stringify({
	// 				cmd: "fwd",
	// 				data: msg,
	// 				from: worker_id,
	// 				ts: ts,
	// 			}))
	// 			}
	// 			catch (err) {
	// 				console.log(err.message);
	// 			}
	// 		}
	// 	},
		
	// 	//isBinded is a function that tells if the current node is binded to somebody or not
	// 	//if it's not, usually nothing is sent to avoid message loss
	// 	isBinded: function(){
	// 		return binded;
	// 	},
		
	// 	//send values to the runtime_register of koala_root
	// 	runtime_register : function(msg){
	// 		xmlhttp.open("PUT", 'http://'+k_root_host+':'+k_root_port+'/API/vars?name='+msg.name+'&value=' + msg.value + '&pid=' + worker_id, true);
	// 		xmlhttp.send();
	// 	},
		
	// 	createNode : function( cb ) {
	// 		self.callback = cb;
	// 		self.onmessage = function(msg) {
	// 			cb(msg.data) 
	// 		}
			
	// 		return {
	// 			start : function(){
	// 			}
	// 		}
	// 	},
		
	// 	notifyPage : function (object) {

	// 		notification = {"IsNotify": 1, "Object" : object}
	// 		postMessage(notification)
		
	// 	}
	// }
}

// var console = {
// 	log : function (msg) {
// 		postMessage(JSON.stringify(msg));
// 	}
// };

var __k = require()

self.onmessage = function(message) {
	var type = message.data.type

	if(type == 'incoming_message') {
		var options = message.data.options
		if(options == undefined || typeof options !== 'object') {
			options = {
				__checkpoints: []
			}
		}  else if(options.__checkpoints == undefined) {
            options.__checkpoints = []
        }

		options.__checkpoints.push({
			worker: worker_id,
            event: 'starting execution',
            timestamp: new Date().getTime()
		})

		throughput.in++
		if(drawUI) {
			if(!throughput.timein) {
				throughput.timein = (new Date()).getTime()
			}

			postMessage({
				type: 'throughin',
				throughput: throughput
			})
		} else {
			postMessage({
				type: 'writeThoughput',
				throughput: throughput
			})
		}

		if(scriptCallback) {	
			var msg = undefined
			try {
				msg = JSON.parse(message.data.message)
			} catch(e) {
				msg = message.data.message
			}

			scriptCallback(msg, worker_id, options)
			__k.done()
		}
	} else if(type == 'got_mergedList') {
		var state = message.data.state
		console.log("Worker received state")
		console.log(state)
	} else if (type == 'returnFunction') {
		var r = message.data.content
		var token = message.data.token

		if(token != undefined) {
			waitingCallbacks[token](r)
			activeCallbacks--
			__k.done()
		}

	} else if(type == 'bind'){
		binded = true;
	} else if(type == 'unbind'){
		binded = false;
	} else if(type == 'domGet'){	
		if(!DOMvalues[message.data.identifier])
			DOMvalues[message.data.identifier] = {}

		DOMvalues[message.data.identifier][message.data.command] = message.data.data
	} else if(type == 'in_latency'){	
		latency['in'] = message.data.data
	} else if(type == 'out_latency'){	
		latency['out'] = message.data.data
	}
	else if(type == "producer"){
		if(scriptCallback) {
			scriptCallback({
				data: message.data.message
			}, worker_id)
		}
	}
	else if(type == 'script') {
		worker_id = message.data["uid"];
		b_id = message.data["b_id"]
		pid = message.data['pid']

		importScripts(message.data["script_src"])
	} else if(type == 'throughput') {
		postMessage({
			type: 'throughput',
			throughput: throughput
		})
	} else if(type == 'startin') {
		throughput.timein = (new Date()).getTime()
	} else if(type == 'statout') {
		if(!isInitThroughput) {
			isInitThroughput = true
			throughput.timeout = (new Date()).getTime()
		}
	} else if(type == 'forcefree') {
		postMessage({
			type: 'free'
		})
	} else if(type == 'drawUI') {
		drawUI = message.data.data
	}else {

	}
};
