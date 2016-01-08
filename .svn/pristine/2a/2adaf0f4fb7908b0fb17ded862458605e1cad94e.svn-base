/**
 * Primes Consumer
 * This script receives the square of a number and
 * and prints it. It also prints the time that it took for computing that number.
 */

var k = require('./../k_globals/koala.js')
var fs = require('fs');


var start;

k.createNode(function(msg, uid) {

	var res = JSON.parse(msg.data);
	console.log("CONSUMER: WORKER "+uid+"\n");
	console.log(res);
	
	k.send("", "send_LB", true, res.id);
	
	var seconds = new Date().getTime() / 1000;

	console.log(res.id +" = "+res.value + " took "+ (seconds - res.start) + " s to be computed");
	
});  
