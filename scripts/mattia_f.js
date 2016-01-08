/**
 * Prime Filter
 * Receives a number and computes the square of that  number.
 * The result is sent to a consumer that stores it somewhere.
 */

var k = require('./../k_globals/koala.js');
var fs = require('fs');


k.createNode(function(msg, uid) {
	
	console.log("FILTER: WORKER " + uid);
	
	
	console.log(JSON.parse(msg.data).id);
	var id = parseInt(JSON.parse(msg.data).id);
	var start = parseInt(JSON.parse(msg.data).start);

	var message = {
				"id" : id,
				"value": id*id,
				"start" : start
			};

	console.log("sending");
	console.log(message);

	k.send(JSON.stringify(message), 'send_LB');
	
});

