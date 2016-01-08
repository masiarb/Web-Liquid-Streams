/**
 * COUNTER CONSUMER
 * Receives data from the counter producer and saves the
 * index received (stored in 'count' in the message) in 
 * a file (which can be inspected to check for message loss).
 */

var k = require('./../k_globals/koala.js')
//var fs = require('fs');

k.createNode(function(msg, uid) {
	console.log("Received message " + JSON.stringify(msg) + " and I'm uid " + uid);
	
	/*
	var time_taken = (new Date().getTime()) - JSON.parse(msg.data).start_date; 
	
	fs.appendFileSync("count.txt", JSON.parse(msg.data).count + ";" + time_taken + "\n", encoding='utf8', function(err) {
     	if(err) {
         	console.log(err);
     	}
	 });*/
	
	k.done();
}, process.argv[3]); 
