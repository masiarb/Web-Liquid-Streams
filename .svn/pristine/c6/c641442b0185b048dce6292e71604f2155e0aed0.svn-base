var debug = require('debug')
var log = {
  worker: debug('wls:worker'),
  output: debug('wls:worker:output')
}

var colors = require('colors/safe')

/**
 * Implementation backend of the Worker on the browser. This file is loaded by the Worker
 * and contains all the data structures and functions to send and receive data from other
 * Workers.
 */
var globalStatusPim = []
var startTime = new Date();
log.worker("started at "+startTime);
var util = require('util');

var mod_overcpu = require('../overcpu/build/Release/overcpu');
var ocpu = new mod_overcpu.OverCpu();
ocpu.setUpdateInterval(5000);

/*
	Controller variables. If all false, global/local controller up
	Andrea's controller is the server_browser_controller implementation
*/
var andrea_controller = false;


var assert = require('assert')

try
{
	var zmq = require('zmq');
}
catch(e)
{
	var l = "[root:ERROR] - No ZMQ support on this machine!"
	var f = function() { console.log(l); return { on : f, bindSync : f } }
	var zmq = {
		socket : f
	}
	f()
}


process.on('error', function(error) {
console.log('--> '+error) })

var sender = zmq.socket('push');
var receiver = zmq.socket('pull')
var http = require('http');
var url = require('url');
var jade = require('jade');
//var mc = require('mc');
var os = require('os');
var binded = false;
var last_message_received;
var sending_counter = [];
var data_storage = require('./cluster_storage');
/*
	execution_flag used so that if the message with a certain id is being processed,
	the controller will not kill the worker (since it is processing a message)
*/
var execution_flag = [];
var sending_protocol;

var TEST_LAST_MESSAGE_RECEIVED;
var TEST_CONSUMER;

//how much time passes from one message to the other
var AVG = 1000;

var idle_counter = 0;
var idle_max_timeout = 1000;
var kill_flag = false;
//TODO: change to variables, for now hardcoded
var options = {
	host: '127.0.0.1',
  	port: 9080,
  	method: 'PUT'
}

/*
	Global Variables
*/
var connections = new Array();
var clients = new Array();
var dest = new Array();
var cb = undefined;
var join_cb = undefined;
var exit_manager = {}
var ta_manager = -1
var uid = undefined;
var cid = undefined;
var cid_alias = undefined;
var proxy_connection;
var db_client = {};
var messages_sent = 0;
var messages_received = 0;
var isProducer = false;

//global variables to handle join
var inConnections = new Array();
var inMessagesReceived = new Array();
var cbOrdering = new Array();

//var mc_cli = new mc.Client("agora.mobile.usilu.net:11211");
//var mc_cli = new mc.Client("127.0.0.1:11211");

var fs = require('fs');

var worker_number = 1

// setInterval(function(){
// 	API_callbacks_counter++;
// 	API_callbacks[API_callbacks_counter] = function(wrks){
// 		worker_number = wrks.length
// 	};
// 	process.send({
// 		response: "get_worker_number",
// 		uid: uid,
// 		cid: cid,
// 		operatorCid: cid,
// 		cb : API_callbacks_counter
// 	});
// }, 500)

// npm debug
var debugDavide = require('debug')('davide');

//DB stuff
try
{
	/*var Db = require('mongodb').Db,
  		Connection = require('mongodb').Connection,
  		Server = require('mongodb').Server;
	var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
	var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;
	var db = new Db('koala-state', new Server(host, port, {}), {safe: true, native_parser:true});
	db.open(function(err, client) {
		db_client = client;
	});*/
	var mongoose = require('mongoose');
	var db = mongoose.createConnection('localhost', 'test');
	var schema = mongoose.Schema({ k: 'String', val : "Number" });
	var Storage = db.model('Storage', schema);

}
catch(e)
{
	var l = "[root:ERROR] - No MONGODB support on this machine!"
	var f = function() { console.log(l); return { on : f, bindSync : f } }

	var db = {}
	this.state = {}
	//f()

}

/*
	@author: Davide Nava
	Test method for memcached store functionality.
*/
// exports.putState = function(key,value){
// 	mc_cli.connect(function(){ // connect to memcached
// 		//debugDavide('Connected to the localhost memcached');
// 		mc_cli.set(key, value, {flags:0, exptime:0},function(err,status){ //try to update value
// 			if(!err){ //value stored
// 				debugDavide(status);
// 			}else{
// 				mc_cli.add(key, value, {flags:0, exptime:0},function(err,status){ // add new value
// 					if(!err){
// 						debugDavide(status); // value stored
// 					}else{
// 						debugDavide(err); // NOT STORED, NOT FOUND, EXISTS
// 					}
// 				});
// 			}
// 		});
// 	});
// }

assert(process.argv[2])
var port = process.argv[2]

/*
	Creates the server through the net library.
	Binds the connections to the server to execute
	a callback, if defined.
*/


connections.push(receiver);
if(exports.onbinding)
		exports.onbinding()

//This is the main piece of code where data is received from another Worker
try {
receiver.on('message', function(data){
	/*
		Check if this is a message from the stream or a message from the setup.
		The following means that *this* worker will receive (or not receive anymore) messages
		from the workers that sent the _WLS_SETUP message. 
	*/
	if(JSON.parse(data)._WLS_SETUP == "bind"){
		console.log("_WLS_SETUP bind received by uid " + uid);
		var w = JSON.parse(data).sender_operator;
		//check to avoid doing double the thing when more than one worker for the same operator connect
		if(!inConnections[w]){
			inConnections[w] = true;
			cbOrdering.push(w);
		}
		return;
	}
	
	if(JSON.parse(data)._WLS_SETUP == "unbind"){
		var w = JSON.parse(data).sender_operator;
		inConnections[w] = undefined;
		cbOrdering.splice(cbOrdering.indexOf(w), 1);
		return;
	}

	//andrea's controller
	if(andrea_controller){
		//send something to Operator
		if(cid & uid){
			process.send({
				response: "andrea_controller_new_message_arrived",
				uid : uid,
				cid: cid
			});
		}
	}

	var time = new Date().getTime();

	messages_received++;

	idle_counter = 0;

	//console.log("======================================================================================================================================");

	//computing how much time since the last message received
	/*if(last_message_received){
		AVG += time - last_message_received;
		AVG = AVG / 2;
	}*/
	// console.log(data.data)
	last_message_received = time;
	//console.log("LAST MESSAGE RECEIVED = " + last_message_received);
	// try {
		// if(data.data) {
		// 	data = JSON.parse(data.data);
		// }
		// if(cb != undefined){
		// 	//console.log(JSON.parse(data.data).id)
		// 	if(data.msg){
		// 		//console.log("arrived id " +JSON.parse(data.msg).data.id);
		// 		execution_flag[""+JSON.parse(data.msg).data.id] = true
		// 		TEST_LAST_MESSAGE_RECEIVED = JSON.parse(data.msg);
		// 	}
		// 	else {
		// 		// console.log("arrived id " +JSON.parse(data.data));
		// 		execution_flag[""+JSON.parse(data.data).id] = true;
		// 		TEST_LAST_MESSAGE_RECEIVED = JSON.parse(data.data);
		// 	}
		data = JSON.parse(data);

		var timestamp = new Date().getTime()

		var msg = undefined

		var toParse = undefined
		if(data.data != undefined) {
			toParse = data.data
		} else {
			toParse = data.msg
		}

		try {
			msg = JSON.parse(toParse)
		}
		catch(e) {
			msg = toParse
		}

		var options = data.options

		if(options == undefined || typeof options !== 'object') {
          options = {
            __checkpoints: []
          }
        }  else if(options.__checkpoints == undefined) {
	        options.__checkpoints = []
	    }

	    var ping = timestamp

        options.__checkpoints.push({
          operator: cid,
          event: 'message received',
          timestamp: timestamp,
          battery: Infinity,
          cpu: ocpu.getTotCpuUsage(),
          ping: ping,
          worker_number: worker_number
        })

        options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(msg) + sizeof(options)

        // console.log('@@@ HERE')
        
        if(cb)
			cb(msg, uid, options);
		else if(join_cb){
			//store the message in local buffer
			inMessagesReceived[data.from_operator] = msg;
			
			var msgArray = new Array();
			
			//check if all the messages of the join have been received
			var all_received = true;
			for(var m in inConnections){
				if(!inMessagesReceived[m] && inConnections[m] == true)
					all_received = false;
				else
					msgArray.push(inMessagesReceived[m]);
			}
			
			//if all received
			if(all_received){
				console.log("all received");
				var finalMsg = new Array();
				for(var i = 0; i < cbOrdering.length; i++){
					finalMsg.push(msgArray[cbOrdering[i]]);
				}
				join_cb(finalMsg, uid, options);
				
				//empty the inMessagesReceived array
				for(var m in inMessagesReceived){
					delete inMessagesReceived[m];
				}
			}
		}
		// }

	// }catch(e) {
	// 	console.log("error on the receiver in koala.js : " + e)
	// }
});
}


catch (e ){ console.log("ERRORE in the try as a message is received in koala.js: " + e ) }

receiver.on("EINTR", function(e){
	console.log("EINTR error in koala.js receiver: " + e);
});

sender.on("EINTR", function(e){
	console.log("EINTR error in koala.js sender: " + e);
});

//console.log("ABOUT TO : receiver.bindSync to tcp://*: " + port);
//receiver listening from other nodes
try {
receiver.bindSync("tcp://*:" + port);
}
catch (e) {
	console.log("error during bindSync in koala.js : " + e);
}


exports.server = receiver;
exports.connections = connections;
exports.clients = clients;
exports.state = {};
exports.stateful = data_storage;


exports.setProducer = function(){
	isProducer = true;
}


exports.state.get = function(k, cb){
	//save in the db at key k the value val
	Storage.findOne({'k': k}, function(err, value) {
		return cb( value );
	});
}

exports.state.set = function(k, new_val){
	//save in the db at key k the value val
	Storage.findOne({'k': k}, function(err, key_value){
  		if (err) console.log("error in findOne in koala.js");

  		if(key_value == null){
  			key_value = new Storage({k: k, val : new_val});
  		}
  		else {
  			key_value.val = new_val;

  		}

  		key_value.save(function(err) {
    		if (err) console.log("error when saving key_value in koala.js: " + err);
  		});
	});
}

/*
	State function to read the state of a val in mongodb
	@param {Object} k The koala object sending this to the DB
	@param {Object} val The value to be stored in the DB
*/
/*exports.state.get = function(k){
	//save in the db at key k the value val
	db.open(function(err, client) {
		client.collection('values', function(err, collection) {
			  collection.find({'k': k}, function(err, cursor) {
				cursor.toArray(function(err, items) {
            		db.close();
            		return items;
        		});
			});
		});
	});
}*/

/*
	State function to save the state in mongodb
	@param {Object} k The koala object sending this to the DB
	@param {Object} val The value to be stored in the DB
*/
/*exports.state.set = function(k, val){
	//save in the db at key k the value val
	db.open(function(err, client) {
		client.collection('values', function(err, collection) {
			collection.remove({'k': k}, function(err, r) {
				collection.insert([{'k': k, 'val' : JSON.stringify(val)}], function(err, docs) {
            		db.close();
        		});
			});
		});
	});
}*/

//variable to store the callbacks from the koala_node calls
var API_callbacks = [];
var API_callbacks_counter = -1;

/*
	Part of the API to control the topology directly from the operators/workers.
	Currently creating Operators on localhost only.
	TODO: create Operators on other Peers.
	@param {number}    Cid of the Operator to be created (TODO: right now can be used defined, we have to be careful if the cid already exists it will overwrite the current Operator!)
	@param {string}    Name of the script to run.
	@param {number}    Number of workers to start the Operator with (default = 1).
	@param {array}     List of uids (TODO: can be accessed with a query to koala_root, right now user-defined).
	@param {boolean}   Describes if the Operator is automatic (controlled by the Controller) or manual (controller by the user).
	@param {string}    Name that aliases the Operator. Can be empty string ("").
	@param {function}  Callback function executed when the Operator has been added.
*/
exports.addOperator = function(cid, script, workers, uids, automatic, alias, cb){
	//default
	if(!workers)
		workers = 1;

	API_callbacks_counter++;
	API_callbacks[API_callbacks_counter] = cb;

	//send to koala_node
	process.send({
		uid: uid,
		response: "add_operator",
		cid: cid,
		script: script,
		workers: workers,
		uids: uids,
		automatic: automatic,
		alias: alias,
		cb: API_callbacks_counter
	});
}

/*
	Part of the API to control the topology directly from the Operators/Workers.
	Unbinding operators.
	TODO: only works if both the Operators are on the same Peer, should be more generic.
	@param {number}   CID of the Operator FROM which the unbind should be done.
	@param {number}   CID of the Operator TO which the unbind should be done.
	@param {function} Callback function.
*/
exports.unbindOperator = function(from, to, cb) {
	API_callbacks_counter++;
	API_callbacks[API_callbacks_counter] = cb;
	
	//send to koala_node
	process.send({
		uid: uid,
		response: "unbind_operator",
		from: from,
		to: to,
		cb: API_callbacks_counter
	});
}

/*
	Part of the API to control the topology directly from the Operators/Workers.
	Binding two Operators.
	TODO: only works if the two Operators are on the same Peer, should be more generic.
	@param {number}   CID of the Operator FROM which the binding comes.
	@param {number}   CID of the Operator TO which the binding goes.
	@param {string}   Protocol of the binding (round_robin, multicast, ...).
	@param {function} Callback function.
*/
exports.bindOperator = function(from, to, protocol, cb){
	API_callbacks_counter++;
	API_callbacks[API_callbacks_counter] = cb;

	//send to koala_node
	process.send({
		uid: uid,
		response: "bind_operator",
		from: from,
		to: to,
		protocol: protocol,
		cb: API_callbacks_counter
	});
}

/*
	Part of the API to control the topology directly from the Operators/Workers.
	Migrate an Operator.
	@param {number}   CID of the Operator to be moved.
	@param {string}   Destination (usually URL).
	@param {function} Callback function.
*/
exports.migrateOperator = function(cid, dest, cb){
	API_callbacks_counter++;
	API_callbacks[API_callbacks_counter] = cb;
	console.log("in migrateOperator in koala.js");
	//send to koala_node
	process.send({
		response: "migrate_operator",
		uid: uid,
		cid: cid,
		node_url: dest,
		cb: API_callbacks_counter
	});
}

/*
	Part of the API to control the topology directly from the Operators/Workers.
	Polls the controller asking how many workers are there in a given Operator.
	@param {number} myCid The operator id of which we want to know the actual number of workers.
	@param {function} cb The callback function that will do something with the number of workers.
*/
exports.getWorkerNumber = function(myCid, cb){
	API_callbacks_counter++;
	API_callbacks[API_callbacks_counter] = cb;
	process.send({
		response: "get_worker_number",
		uid: uid,
		cid: cid,
		operatorCid: myCid,
		cb : API_callbacks_counter
	});
}

/*
	Check function called from the scripts if they need to start only
	when the underlying stuff is binded. It may be used for example when
	we only want to start sending when the binding has been done. In
	that case the script will call this function and perform a send
	operation only if there is a binding from this node to somebody else.
*/
exports.isBound = function(){
	return binded;
}

exports.isBinded = function(){
	return binded;
}

exports.message = function(m) {
	log.output(m)
}

exports.log = function(m) {
	log.output(colors.green(m))
}

exports.warn = function(m) {
	log.output(colors.yellow(m))
}

exports.error = function(m) {
	log.output(colors.red(m))
}


var idleInterval;
/*
	Assign the callback function of the "reply" given as
	parameter to the actual callback of the node.
	@param {function} func The callback function
	@param {boolean}  boolean value that sets if the script has to be executed manually or not (usually set from command line interface)
*/
exports.createNode = function(func, automatic) {
	log.worker("CREATE NODE CALLED " + automatic);
	if(automatic === "true"){
		idleInterval = setInterval(function() {console.log("idleInterval called!"); compute_idleness() }, idle_max_timeout);
	}
	cb = func

	return this;
}

/*
	Assign the callback function of the "reply" given as
	parameter to the actual callback of the node.
	@param {function} func The callback function
	@param {boolean}  boolean value that sets if the script has to be executed manually or not (usually set from command line interface)
*/
exports.createJoin = function(func, automatic) {
	log.worker("CREATE JOIN CALLED " + automatic);
	if(automatic === "true"){
		idleInterval = setInterval(function() {console.log("idleInterval called!"); compute_idleness() }, idle_max_timeout);
	}
	join_cb = func;

	return this;
}

/*
	Makes the state given as input observable by the
	outside through a node.js server.
	@param {Object} state The observable state
*/
var express = require('express');
var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
var OBSERVERD_STATE = {};
var GLOBAL_KEY;

exports.makeObservable = function(state, path, cb) {
	//OBSERVED_STATE = state;

	app.get(path, function(req, res) {
		res.sendfile('/home/andrea/usi_liquid_streams/public/webcam_puzzle.html')
		// res.sendfile('/public/webcam_demo.html')
		//console.log(OBSERVED_STATE.length);

		/*
			GET FROM MEMCACHE AND OVERRIDE OBSERVED_STATE
		*/

		//console.log("in get of /puzzle");
		// mc_cli.connect(function() {
		// 	console.log("getting GLOBAL_KEY = " + GLOBAL_KEY);
		// 	mc_cli.get( GLOBAL_KEY, function(err, response) {
		// 		if(!err){
		// 			var parsed_result = JSON.parse(response[GLOBAL_KEY]);

		// 			//console.log(parsed_result);
		// 			res.render('observable.jade', {state : parsed_result.list, path: path});

		// 			//call callback with new user
		// 			cb(req);
		// 		}
		// 		else{
		// 			console.log("MC Library had an error on /puzzle:");
		// 			console.log(err);
		// 		}
		// 	});
		// });
	});

	/*
		REFRESH PATH
		Called from the AJAX request from the /puzzle page
	*/
	app.get(path+'/refresh', function(req, res){
		/*
			GET FROM MEMCACHE AND OVERRIDE OBSERVED_STATE
		*/
		// mc_cli.connect(function() {
		// 	console.log('lol')

		// 	mc_cli.get( GLOBAL_KEY, function(err, response) {
		// 		if(!err)
		// 			mc_cli.connect(function() {

		// 				OBSERVED_STATE = new Array();

		// 				var parsed_result = JSON.parse(response[GLOBAL_KEY]);

		// 				for(var i = 0; i < parsed_result.list.length; i++){
		// 					//iterate through all the connected ids and get the list of images
		// 					(function(i){
		// 					mc_cli.get( ""+parsed_result.list[i], function(err, response) {

		// 						if(err && err.type == 'NOT_FOUND'){
		// 							//nothing added yet!
		// 							console.log("nothing found for id = " + parsed_result.list[i]);
		// 							res.send([""]);
		// 							//console.log(err);
		// 						}

		// 						else if(!err){
		// 							//console.log("found something for id: " + parsed_result.list[i])
		// 							//console.log("iteration index : " + i + " OBSERVED_STATE.length before adding more stuff = " + OBSERVED_STATE.length)

		// 							//console.log(response);

		// 							var parsed_result_from_mc = JSON.parse(response[parsed_result.list[i]])

		// 							console.log("found in mc a result.length of " + parsed_result_from_mc.length + " for id = " + parsed_result.list[i]);

		// 							for(var j = 0; j < parsed_result_from_mc.length; j++){
		// 								OBSERVED_STATE.push(parsed_result_from_mc[j]);
		// 							}



		// 							//double check, the last element in the iter can't always be the last being returned from the db
		// 							if((i + 1) == parsed_result.list.length){
		// 								//console.log("situation in which parsed_result.list.legnth == " + (i + 1));
		// 								console.log("FINISH");
		// 								res.send(OBSERVED_STATE);
		// 							}
		// 						}

		// 						else{
		// 							console.log("error in retrieving state from other ids: ");
		// 							console.log(err);
		// 						}

		// 					});
		// 					})(i);
		// 				}
		// 			})

		// 		else{
		// 			console.log("error in getting the list of ids connected to the state");
		// 			console.log(err);
		// 		}
		// 	});
		// });
		//res.send(OBSERVED_STATE);

		responsees.send(globalStatusPim)
	});


	app.listen('6969');
}

/*
	Updates the state of the observable value
*/
exports.updateObservable = function(state) {
	globalStatusPim = state

	//memcache test
	// mc_cli.connect(function() {
	// 	mc_cli.set(uid, new Buffer(JSON.stringify(state)), { flags: 0, exptime: 0}, function(err, status) {
 //  			if (!err) {
 //    			//console.log(status); // 'STORED' on success!
 //  			}
 //  			else {
 //  				console.log("MC Library had an error on updateObservable:");
 //  				console.log(err);
 //  			}
	// 	});
	// });
}

/*
	Set this as a particular cluster
*/
exports.createState = function(key) {
	GLOBAL_KEY = key;
}

setupState = function(key, flag){
mc_cli.connect(function() {
	mc_cli.gets( key, function(err, response) {
		if(err && err.type == 'NOT_FOUND'){
			//save myself
			mc_cli.connect(function() {
				console.log("creating the key " + key + " in memcache");
				var uidArray = {list: [uid]};
				mc_cli.add( key, new Buffer(JSON.stringify(uidArray)), { flags: 0, exptime: 0}, function(err, status) {
  					if (!err) {
    					console.log(status + " in creating the array of uids and my uid is = " + uid); // 'STORED' on success!
  					}
  					else {
  						console.log("in not_found in createState with db error: " );
  						console.log(err);
  						setupState(key, true);
  					}
				});
			});
		}
		if (!err) {
			//save myself
			var parsed_result = JSON.parse(response[key].val);
			parsed_result.list.push(uid);
			mc_cli.cas( GLOBAL_KEY, new Buffer(JSON.stringify(parsed_result)), response[key].cas, { flags: 0, exptime: 0}, function(err, status) {
  				if (!err) {
    				console.log(status + " in storing my uid in the array and my uid is = " + uid + "  with GLOBAL_KEY = " + GLOBAL_KEY); // 'STORED' on success!
  				}
  				else {
  					console.log("in !err of createState with error: ");
  					console.log(err);
  					setupState(key, true);
  				}
			});
		}
		else {
			console.log("in createState with error in db : " + err.type);
  			console.log(err);
  		}
	});
	});

	if(!flag)
		mc_cli.connect(function() {
			//add my state to empty string
			mc_cli.add(uid, new Buffer("{}"), { flags: 0, exptime: 0}, function(err, status) {
  				if (!err) {
    				console.log("add new empty state to the store with key my uid : " + uid) + " with status: " + status; // 'STORED' on success!
  				}
  				else {
  					console.log("error when adding own id as a key and empty state");
  					console.log(err);
  				}
			});
		});
}

/*
	Start the server by listening to the port.
*/
exports.start = function() {

	console.log(' --> listening '+port)

	//in theory listening to the port is done
	//as soon as the server is setup (in var server = ...)
	//server.listen(port)
}

/*
	This function is called by the consumer and only by the consumer.
	It is used to tell the unerlying koala instance that it is done
	with the computation of a message. In this way koala is always aware
	when one of its consumers is busy or not and can decide if workers
	have to be added.
	@param: id - The id of the message received.
*/
exports.done = function(id){
	TEST_CONSUMER = true;
	messages_sent++;
	execution_flag[""+id] = false;

	/*
		AVG computed here, the avg was a wrong measure!!!
	*/

	idle_counter = 0;
	binded = true;

	if(last_message_received){
		var time = new Date().getTime();
		AVG = (time - last_message_received)/2;
	}

	return true;
}

exports.callFunction = function(name, arguments, callback){
	if(typeof(this[name]) == 'function') {
		var r = this[name]()

		if(typeof(callback) == 'function') {
			callback(r)
		}
	} else {
		log.worker('Function ' + name + ' is not defined')
	}
}

exports.makeCallback = function(f){
	return f
}

exports.makeAlternativeCallback = function(f){
	return f
}

/*
	General send function that takes as parameter the message to be sent.
	The function calls the right send function given when the worker was instantiated.
	The idea behind this function is to group all the common procedures
	that are done across all the send functions (e.g. checking if the node
	is binded or increasing the number of sent messages for the PID algorithm).
*/
exports.send = function(message, options, id){
	//TODO ANDREA SENDER

	  var timestamp = new Date().getTime()
	  var last_checkpoint = undefined
	  var exectime = undefined

	  if(options == undefined || typeof options !== 'object') {
	    options = {
	      __checkpoints: []
	    }
	  } else if(options.__checkpoints == undefined) {
	    options.__checkpoints = []
	  } else {
	  	last_checkpoint = options.__checkpoints[options.__checkpoints.length-1]
	  	exectime = timestamp - last_checkpoint.timestamp
	  }

	  options.__checkpoints.push({
	    operator: cid,
	    event: 'leaving peer',
	    timestamp: timestamp,
	    battery: Infinity,
	    cpu: ocpu.getTotCpuUsage(),
	    exectime: exectime,
	    ping: new Date().getTime(),
	    worker_number: worker_number
	  })

	  options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(message) + sizeof(options)


	//console.log(exports.clients)

	if(exports.clients.length == 0){
		//console.log("===== SENDING TO NOBODY IN WORKER UID " + uid + " ======");
	}

	if(!binded){
		return;
	}

	if(andrea_controller)
		process.send({
			response: "andrea_controller_new_message_left",
			uid : uid,
			cid: cid
		});

	messages_sent++;
	idle_counter = 0;
	execution_flag[""+id] = false;

	//message = JSON.stringify(message)

	/*
		AVG computed here, the avg was a wrong measure!!!
	*/
	if(last_message_received){
		var time = new Date().getTime();

		AVG = (time - last_message_received)/2;
		//console.log(AVG);
	}

	//If the sending protocol is not specified, then round_robin
	if(!sending_protocol)
		sending_protocol = 'round_robin';

	switch(sending_protocol){
		case undefined :
			console.log("no sending protocol received");
			break;

		case 'multicast':
			this.sendMC(message, options);
			break;
			
		case 'content_based' :
			this.sendContentBased(message, options);
			break;

		case 'round_robin':
			this.send_LB(message, options);
			break;

		case 'send_LB_ID':
			this.send_LB_ID(message, options);
			break;

		case 'send_LB_Key':
			this.send_LB_Key(message, options);
			break;
			
		case 'send_partition':
			this.send_partition(message, options);
			break;
			
		case '' :
			//called when there is no sending, just processing
			break;
			
		default :
			//nothing happens
			break;
	}
}

/*
*	send_partiotion takes care of sending messages partitioning the 
*	messagges based on an hash function.
*
*	@author Davide Nava
*/
var emojiStrip = require('emoji-strip');

var getpartition = function(msg, clients){
	var str = msg.ht.substring(1);
 	str = emojiStrip(str);
 	var result = crc16(Buffer(str.charAt(0)));
 	var modu = mod((result),clients)
 	return modu
}

exports.sendContentBased = function(message, options){
	
	var rand =  getpartition(message, exports.clients.length)

	var c = exports.clients[rand];
	if (!c) return

	var ts = new Date().getTime();

	var msg = {
	    data: message,
	    from: uid,
	    ts: message.ts,
	    msgid: kount++,
	    options: options
	}

	//console.log("msgid in send_lb_id = " + msg.msgid);
	try {
	    if (c.sender['send']) {
	        //console.log("c.sender.send in uid " + uid + " with sender " + JSON.stringify(c.sender));
	        c.sender.send(JSON.stringify(msg))
	        //console.log("UID::" + uid);
	    } else {
	        c.sender.write(msg)
	    }
	} catch (e) {
	    console.log("ERRORE in send_content_based function: " + e)
	}
}

/*
	The SendTo function provides an easy way to send data
	directly to a certain Operator ID
*/
exports.sendTo = function(message, to){
	if(!binded)
		return;

	if(!exports.__i)
		exports.__i = Math.floor((Math.random() * exports.clients.length) + 1)

    exports.__i = exports.__i + 1
	var rand = exports.__i % exports.clients.length;

	var distribution_result;
	var biggest = 0;
	var smallest = 1000000000;
	
	var c;
	
	for(var i = 0; i < exports.clients.length; i++){
		if(exports.clients[i].to === to || exports.clients[i].to_alias === to)
			c = exports.clients[i];
	}

	if(!c) return

	var ts = new Date().getTime();

	var msg = {
		sendTo: true,
		data: message,
		from: uid,
		ts: ts,
		to: to,
		options: options
	}
	try {
		if(c.sender['send']) {
			c.sender.send(JSON.stringify(msg))
		}
		else {
			c.sender.write(msg)
		}
	}
	catch (e ){ 
		console.log("ERRORE in send_LB function: " + e );
	}
}

exports.done = function() {}

/*
	The send function takes care of sending messages to other nodes.
	TODO: The function takes care of the recipient of the message by
	checking if the connection is a websocket (remote_worker) or a
	normal socket.
	@param msg The message to send.
*/
exports.sendMC = function(message, options) {
	if(!binded)
		return;

	//console.log("sendMC of uid = " + uid + " has clients.length = " + clients.length);

	exports.clients.map(function(c) {
		//console.log(util.inspect(c, true, 10, true));

		var ts = new Date().getTime();

		var msg = {
			data: message,
			from: uid,
			ts: ts,
			options: options
		}

		try {
		if(c.sender['send']) {
			c.sender.send(JSON.stringify(msg))
		}
		else {
			c.sender.write(msg)
		}
		}
		catch (e ){ console.log("ERRORE in the catch of c.sender.send in sendMC function: " + e ) }
	})
}

/*
	Function that tells me the distribution of probability to receive
	a message given the number of messages received and the total
	number of messages sent by this worker.
	@param mex_received   {Number} Number of messages sent to a Worker
	@param total_mex_sent {Number} Total number of messages sent by this Worker
*/
var compute_distribution = function(mex_received, total_mex_sent){
	if(mex_received === 0)
		mex_received = 0.1;
	return (1/ ( (mex_received * 100) / total_mex_sent) );
}

/*
	The send function takes care of sending messages to other nodes.
	TODO: The function takes care of the recipient of the message by
	checking if the connection is a websocket (remote_worker) or a
	normal socket.
	@param msg The message to send.
*/
exports.send_LB = function(message, options) {
	
	if(!binded)
		return;

	if(!exports.__i)
		exports.__i = Math.floor((Math.random() * exports.clients.length) + 1)

    exports.__i = exports.__i + 1
	var rand = exports.__i % exports.clients.length

	//console.log("send_LB in uid = " + uid + " with clients[rand] with value rand = " + rand + " " + JSON.stringify(exports.clients) );

	var distribution_result;
	var biggest = 0;
	var smallest = 1000000000;
	//if no data of sending -> set it to 0
	//if(!sending_counter[exports.clients[rand].to])
		//sending_counter[exports.clients[rand].to] = 0;

	//instead of computing the distribution, just send to the one with less messages sent
	/*for(var i in exports.clients){
		//distribution_result = compute_distribution(sending_counter[exports.clients[i].to], messages_sent);
		//console.log("distriubution result for receiver " + exports.clients[i].to + " : " + distribution_result + ". Receiver received " + sending_counter[exports.clients[rand].to] + " messages");
		//if(distribution_result > biggest){
			//rand = i;
			//biggest = distribution_result;
		//}
		if(!sending_counter[exports.clients[i].to])
			sending_counter[exports.clients[i].to] = 0;

		if(sending_counter[exports.clients[i].to] < smallest){
			smallest = sending_counter[exports.clients[i].to];
			rand = i;
		}
	}*/

	//console.log(exports.clients[ rand ].to);
	//add to the sending variable, we want to know how many messages each worker should have received
	//console.log("clients: " + JSON.stringify(exports.clients);
	sending_counter[exports.clients[rand].to]++;

//	console.log("smallest data sent: " + smallest + " sending to " + exports.clients[ rand ].to + ". Total collection of sockets: " + exports.clients.length );

    var c = exports.clients[ rand ]

    if(isProducer){
    	//VALUE : ID_RECEIVING : COUNTER
    	fs.appendFileSync("distribution_sending.txt", biggest + " - " + exports.clients[ rand ].to + " - " + sending_counter[exports.clients[ rand ].to] + "\n", encoding='utf8', function(err) {
	    	if(err) {
	        	console.log(err);
	    	}
		});
    }

    //CHECK ZMQ_POLLIN & ZMQ_POLLOUT
    //console.log("sender : " + c.sender.getsockopt(zmq.ZMQ_EVENTS) + " in id : " + uid);
	//console.log(zmq)

	if(!c) return

	var ts = new Date().getTime();

	var msg = {
		data: message,
		from: uid,
		from_operator: cid,
		ts: ts,
		options: options
	}
	try {
	if(c.sender['send']) {
		//console.log("c.sender.send in uid " + uid + " with sender " + JSON.stringify(c.sender));
		c.sender.send(JSON.stringify(msg))
	}
	else {
		c.sender.write(msg)
	}
	}
catch (e ){ console.log("ERRORE in send_LB function: " + e ) }
}

var kount = 0;

exports.send_LB_ID = function(message, options) {
	if(!binded)
		return;
	console.log("exports__i::before::"+exports.__i);
	if(!exports.__i)
		exports.__i = Math.floor((Math.random() * exports.clients.length) + 1)
	
    exports.__i = exports.__i + 1
    console.log("exports__i::after::"+exports.__i);
	var rand = exports.__i % exports.clients.length
	console.log("rand::"+rand);
	//console.log("send_LB in uid = " + uid + " with clients[rand] with value rand = " + rand);

    var c = exports.clients[ rand ]
	if(!c) return

	var ts = new Date().getTime();

	var msg = {
			//changed message.data in message @author Davide
		data: message,
		from: uid,
		ts: message.ts,
		msgid: kount++,
		options: options
	}

	//console.log("msgid in send_lb_id = " + msg.msgid);
	try {
	if(c.sender['send']) {
		//console.log("c.sender.send in uid " + uid + " with sender " + JSON.stringify(c.sender));
		c.sender.send(JSON.stringify(msg))
		console.log("UID::"+uid);
	}
	else {
		c.sender.write(msg)
	}
	}
catch (e ){ console.log("ERRORE in send_LB_ID function: " + e ) }
}

/*
	The send function takes care of sending messages to other nodes.
	It uses a sort of sharding system.
	TODO: Merge with send_LB taking care if the message to send is
	a key: value pair or not. If it's the case use this procedure,
	otherwise just randomly send to some receiver.
	@param {Object} object The message to send with {k: some_k, v: some_v}
						   and the entry v of the message is optional
*/
exports.send_LB_Key = function(m, options) {
	if(!binded)
		return;

	var k = uid;

	if(!dest[k]){
		//console.log("DEST NOT FOUND TAKING NEW ONE from clients with length " + exports.clients.length + " with i = " + exports.__i);
		var rand = Math.floor((Math.random() * exports.clients.length) + 1)
		//console.log("taking client at position " + rand);
		exports.__i = exports.__i + 1 || 0
		dest[k] = exports.clients[rand]
		if(exports.clients.length == 1 && rand == 1 && !dest[k]){
			dest[k] = exports.clients[0]
		}
		//dest[k] = exports.clients[0]
	}

	if(!dest[k]){
		console.log("still no dest[k] after creating one through modulo here in uid " + uid)
		return;
	}

	var ts = new Date().getTime();

	var msg = {
		data: m,
		from: uid,
		ts: ts,
		options: options
	}
	try {
	if(dest[k].sender['send']) {
		//console.log("in " + uid + " sending to " + dest[k]);
		dest[k].sender.send(JSON.stringify(msg))
	}
	else {
		dest[k].sender.write(msg)
	}
	}
catch (e ){ console.log("ERRORE in send_LB_Key function: " + e ) }
}



/*
	Saves variables in koala_root with the same principle
	of the send() function.
*/
exports.runtime_register = function(msg) {

	//HTTP connection to koala_root
	options.path = '/API/vars?name='+msg.name+'&value=' + msg.value + '&pid=' + uid;
	http.request(options, function(res) {}).end()

	/*http.client.put( 'root.process.host/API/vars/' + msg.name + '?value=' + msg.value + '&pid=' + process.pid , function(){
		//some callback
	})*/
}


/*
	Saving an exit callback
*/
exports.exit_callback = function(ecm){
	exit_manager = ecm;
}

/*
	Write average
*/
exports.saveTime = function(average) {
	exit_manager.average = average;
}

exports.saveTA = function(ta) {
	ta_manager = ta;
}


var t_a = new Array();
var count = 0;
exports.saveTimeArrival = function(time_arrival, counter, msgid){
	//console.log("saving");
	//t_a.push(""+time_arrival+";"+uid+";");
	//count = counter;

	/*fs.appendFile("/home/masiar/koala/koala/Koala/output/" + exit_manager.process + "ta"+ uid + ".txt", time_arrival+";"+msgid+";"+counter+";"+uid+'\n', function (err) {
	  	if (err) throw err;
		//  	console.log('The "data to append" was appended to file!');
	});	*/
}

exports.saveTimeDeparture = function(time_departure){

}

/*
	Opens a file and generates a stream of data. The cdBhunk callback is called for each data chunk, while
	the cbEnd callback is called once the file has been entirely read.
*/
exports.openFileStream = function(filename, cbChunk, cbEnd) {

	function createLineReader(fileName) {

    	var EM = require("events").EventEmitter
    	var ev = new EM()
    	var stream = require("fs").createReadStream(fileName)
    	var remainder = null;
    	stream.on("data",function(data) {
        	if(remainder != null){//append newly received data chunk
            	var tmp = new Buffer(remainder.length+data.length)
    	       	remainder.copy(tmp)
	           	data.copy(tmp,remainder.length)
           		data = tmp;
        	}
        	var start = 0;
			for(var i=0; i<data.length; i++) {
				if(data[i] == 10){ //\n new line
					var line = data.slice(start,i)
	                ev.emit("line", line)
                	start = i+1;
				}
        	}
        	if(start<data.length) {
            	remainder = data.slice(start);
        	}
        	else {
            	remainder = null;
        	}
    	})

    	stream.on("end",function(){
        	if(null!=remainder) ev.emit("line",remainder)
        	ev.emit("end")
    	})

    	return ev
	}

	var lineReader = createLineReader(filename)
	lineReader.on('end', function() { cbEnd() })
	lineReader.on("line",function(d) { cbChunk(d) })
}

/*
	Function that checks if there is something executing right now
*/
var isExecuting = function(flags){
	console.log(flags);
	for(var i = 0; i < flags.length; i++)
		if(flags[i] == true)
			return true;
	return false;
}


/*
	Takes care of the 'message' event. If the message is
	of type "bind" it creates a connection between the two
	entities.
	@param {function} The callback function to execute.
*/
process.on('message', function(msg) {

	//listens for callback return
	//msg.params is an array, it is on the worker's implementation to decypher what's in it (TODO: better)
	if(msg.command == 'API_callback'){
		//console.log("msg.cb = " + msg.cb + ", API_callbacks_counter = " + API_callbacks_counter);
		//console.log(API_callbacks);
		API_callbacks[msg.cb](msg.params);
		API_callbacks[msg.cb] = undefined;
	}

	//console.log("on message");
	//setup telling this process which process is it
	if(msg.command == 'setup'){
		uid = msg.uid;
		cid = msg.cid;
		
		// console.log("setup a new worker, uid received = " + msg.uid + " for cid = " + msg.cid);
		/*
		setupState(GLOBAL_KEY)
		*/

		if(msg.cbid){
			//console.log("msg.cbid, process.send stuff!");
			process.send({cbid:msg.cbid})
		}
	}

	//prepare to shut down gracefully
	if(msg.command == 'kill'){

		/*console.log(exports.clients);
		console.log("last message received: " + last_message_received);
		console.log(" consumer? = " + TEST_CONSUMER)
		console.log(TEST_LAST_MESSAGE_RECEIVED);*/

		/*kill_flag = true;
		console.log("KILLING " + uid + " with last message received: " + last_message_received)
		var kill_interval = setInterval(function(proc_pid, c, last_message_received, receiver, zmq, execution_flag){

			var time_now = new Date().getTime();
			//if 10 seconds passed without receiving any message or no message received at all (producer or useless worker)
			//console.log(time_now + " - " + last_message_received + " > 10000 ? " + (time_now - last_message_received > 10000) + " " + !execution_flag);

			//console.log(execution_flag + " " + isExecuting(execution_flag));

			if(time_now - last_message_received > 7500 && !isExecuting(execution_flag) ){ //|| !last_message_received || receiver.getsockopt(zmq.ZMQ_EVENTS) | zmq.ZMQ_POLLIN == 0 && !isExecuting(execution_flag)
				console.log("killing " + uid);
				//console.log("process id = " + proc_pid)


    			var spawn = require('child_process').spawn;
				var n = spawn('kill', ['-9', ''+proc_pid]);

				clearInterval(kill_interval);
			}
		}, 1000, msg.proc_pid, exports.clients, last_message_received, receiver, zmq, execution_flag);*/
	}

	// Directly connect to the node
	if(msg.command == 'bind_node') {
		if(msg.host == 'agora') {
			msg.host = 'agora.mobile.usilu.net'
		}
		
		//console.log("received bind command: " + JSON.stringify(msg) + " and i'm in uid: " + uid);
		
		binded = true;
		sending_protocol = msg.protocol;
		//the following line should be in 'setup' but has been put here because its simpler (i don't feel like checking if 'setup' sends the alias under certain conditions)
		cid_alias = msg.from_alias;
		
		if(msg.proxy && proxy_connection){
			//already existing connection to proxy, reuse the same
			// console.log("ALREADY EXISTING CONNECTION TO PROXY");
			var sckt = {
				sender : proxy_connection.sender,
				from: msg.from,
				to: msg.to,
				to_cid : msg.to_cid,
				from_alias : msg.from_alias, 
				to_alias : msg.to_alias,
				sender_endpoint : proxy_connection.sender_endpoint,
			}
			
			exports.clients.push(sckt)
			process.send({cbid:msg.cbid})
			// console.log('connected to '+msg.host+':'+msg.port)
			return
		}
		else {
			sender = zmq.socket('push');

			try {
				sender.connect("tcp://" + msg.host + ":" + msg.port, function(err) {
    				if (err) throw err;
				});
			}
			catch (e ){
				console.log("ERROR in bind_node, response: " + e )
			}

			if(msg.proxy){
				proxy_connection = {
					sender : sender,
					sender_endpoint: "tcp://" + msg.host + ":" + msg.port,
				};
			}
			
			
			var sckt = {
				sender : sender,
				from: msg.from,
				to: msg.to,
				to_cid : msg.to_cid,
				from_alias : msg.from_alias, 
				to_alias : msg.to_alias,
				sender_endpoint : "tcp://" + msg.host + ":" + msg.port,
			}
			
			//console.log(msg);
			//console.log(sckt);

			exports.clients.push(sckt);
			
			/*	
				JOIN
				Send a first handshake message notifying the receiver that it has been connected to some worker.
				This is important because the receiver doesn't know how many workers are connected to it.
				In this way the receiver also knows how many operators his operator is receiving messages from.
				This turns out to be useful in the Join.
			*/
			sckt.sender.send(JSON.stringify({
				"_WLS_SETUP"			: "bind",
				"sender_operator" 		: cid,
				"sender_operator_alias" : cid_alias,
				"sender_worker" 		: uid,
				"receiver"				: sckt.to_cid
			}));

			// Send back a message which will cause the callback "cbid" to be called
			process.send({cbid:msg.cbid});
		}
	}

	// Directly connect to the node
	if(msg.command == 'unbind_node') {
		
		/*
			Removes the binding from the socket to the worker. Iterates through the array of connections
			and when it finds the correct one it first disconnects the socket from that enpoint and then
			removes it from the array of clients (and then cleans the array from the leftover undefined).
		*/

		for(var i = 0; i < clients.length; i++){
			if(clients[i].from == msg.process_id && clients[i].to == msg.to_unbind){
				//first, sends a final message to the bound workers/operators
				clients[i].sender.send(JSON.stringify({
						"_WLS_SETUP"			: "unbind",
						"sender_operator" 		: cid,
						"sender_operator_alias" : cid_alias,
						"sender_worker" 		: uid
				}));
				clients[i].sender.disconnect(""+clients[i].sender_endpoint);
				delete clients[i];
				clients = clean(clients, undefined);
				binded = false;
			}
		}

		// Send back a message which will cause the callback "cbid" to be called
		process.send({cbid:msg.cbid});
	}

	// Connect to the remote worker (through the proxy)
	if(msg.command == 'bind_remote') {
		// console.log('binding remote')
		// console.log(msg)
		// remote_channel = msg.channel
		// binded = true
		// // K.send = channel.send


		// remote_channel.send('AAAH')
		// remote_channel.onmessage = function(message) {
		// 	cb(message)
		// }
	}

	if(msg.command == 'incoming_message') {
		cb(msg.message)
	}

	// Collect data about node messages sent (== node messages processed)
	if(msg.command == 'data_collect'){
		if(kill_flag)
			return;


		//console.log("uid = " + uid + " data_collect message received!")


		//if(uid == 2) console.log("2 received => " + messages_received)
		process.send({
			response: "data_collect",
			data: messages_sent,
			rcvd : messages_received,
			index: msg.index,
			cluster : msg.cluster,
			exec_time : ta_manager,
			avg : AVG,
			ci : msg.ci,
		});

		//console.log("MESSAGE RECEIVED : " + messages_received + " MESSAGES_SENT " + messages_sent + " UID " + uid);
	}

	if(msg.command == "messages_sent") {

		// console.log("cpu usage of = "+getUsage(function(time) { console.log("USAGE: "+msg.uid+"= "+time+"%"); }));

		getUsage(function(time) {

			var now = new Date();

			process.send({
				cbid: msg.cbid,
				cid: msg.cid,
				wid: msg.uid,
				response: "messages_sent",
				messages_sent: messages_sent,
				messages_received: messages_received,
				uptime: now - startTime,
				cpu_usage: time
			});
		});


	}
})


var clean = function(array, deleteValue) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == deleteValue) {
      array.splice(i, 1);
      i--;
    }
  }
  return array;
};


/*
	Graceful suicide handling for processes
*/

//setInterval(function() { kill_check() }, AVG);

var kill_check = function(){
	if(last_message_received < (new Date().getTime() - AVG) && isIdle()){
		//graceful_kill();

		//this avoids calling twice graceful_kill()
		//idle_counter = undefined;
	}
}

var graceful_kill = function(){
	clearInterval(idleInterval);

	console.log("graceful_kill");

	process.send({
		response: "graceful_kill",
		uid: uid,
	});
}

var isIdle = function(){
	if(idle_counter >= 5 )
		return true;
	else
		return false;
}

var compute_idleness = function(){
	//we check that its not the first value
	if(AVG != 1000)
		idle_max_timeout = (AVG / 5); // - (AVG / 10);

	//console.log(idle_max_timeout);

	clearInterval(idleInterval);
	idleInterval = setInterval(function() {compute_idleness() }, idle_max_timeout);

	//console.log("idle_counter = " + idle_counter + " in uid = " + uid + " and binded = " + binded);

	//console.log("my id : " + uid + " before binding");

	if(!binded)
		return;

	//console.log("my id : " + uid + " after binding");
	//console.log("====== checking for idleness : " + isIdle());
	if(isIdle()){
		graceful_kill();
	}
	else{
		idle_counter++;
	}
}


//start a timeout, in the callback a function that:
	//checks if the process has received messages in the last AVG time && if it's idle
		//kill()
	//otherwise renew timeout with AVG

//kill() function
	//tell koala_node intentions to kill -> which will tell root
	//expect graceful kill message
	//root should handle also the removal of a worker from the controller... [still todo]

/*
	Function to get the usage of the CPUs.
*/
var pcnt = 0;
var getUsage = function(cb){
    fs.readFile("/proc/" + process.pid + "/stat", function(err, data){
        var elems = data.toString().split(' ');
        var utime = parseInt(elems[13]);
        var stime = parseInt(elems[14]);
        cb(utime + stime);
    });
}

/*
//interval to control the cpu usage
setInterval(function(){
    getUsage(function(startTime){
        setTimeout(function(){
            getUsage(function(endTime){
                var delta = endTime - startTime;
                pcnt = 100 * (delta / 10000);

                if (pcnt > 20){
                    console.log("CPU Usage Over 20%!");
                }
            });
        }, 1000);
    });
}, 10000); */


/*
	The following implement the heartbeat algorithm. When there hare huge
	spikes in the work, the Worker does not answer anymore to the messages
	of the Controller, thus we try the opposite and PUSH the data to koala_node.
	Everything can be commented here but be sure to uncomment whatever was
	commented when the Controller was shut down.
*/
/*
//interval to send data
var HEARTBEAT = 1000;

//set interval
var hb_to = setInterval(function() {
		process.send({
			response: "heartbeat",
			data: messages_sent,
			rcvd : messages_received,
			uid : uid,
			exec_time : ta_manager,
			avg : AVG,
		});
	},
HEARTBEAT);*/

var sizeof = function (object){

  // initialise the list of objects and size
  var objects = [object];
  var size    = 0;

  // loop over the objects
  for (var index = 0; index < objects.length; index ++){

    // determine the type of the object
    switch (typeof objects[index]){

      // the object is a boolean
      case 'boolean': size += 4; break;

      // the object is a number
      case 'number': size += 8; break;

      // the object is a string
      case 'string': size += 2 * objects[index].length; break;

      // the object is a generic object
      case 'object':

        // if the object is not an array, add the sizes of the keys
        if (Object.prototype.toString.call(objects[index]) != '[object Array]'){
          for (var key in objects[index]) size += 2 * key.length;
        }

        // loop over the keys
        for (var key in objects[index]){

          // determine whether the value has already been processed
          var processed = false;
          for (var search = 0; search < objects.length; search ++){
            if (objects[search] === objects[index][key]){
              processed = true;
              break;
            }
          }

          // queue the value to be processed if appropriate
          if (!processed) objects.push(objects[index][key]);

        }

    }

  }

  // return the calculated size
  return size;

}
/*
 * Hash function for sendContentBased
 * TODO: pass generic HASH function from JSON topology configuration
 * */
var TABLE = new Int16Array([
                            0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
                            0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
                            0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
                            0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
                            0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
                            0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
                            0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
                            0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
                            0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
                            0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
                            0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
                            0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
                            0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
                            0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
                            0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
                            0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
                            0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
                            0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
                            0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
                            0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
                            0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
                            0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
                            0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
                            0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
                            0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
                            0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
                            0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
                            0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
                            0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
                            0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
                            0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
                            0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
                            ]);


function crc16(buf) {
	var crc = 0;
	for(var i = 0, len = buf.length; i < len; i++) {
		crc = TABLE[((crc >> 8) ^ buf[i]) & 0x00ff] ^ ((crc << 8) & 0xffff);
	}
	return crc;
}

function mod(n, m) {
	return ((n % m) + m) % m;
}
