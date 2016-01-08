/**
 * Primes Consumer
 * This script receives the total number of primes found for a specific range (0 to x where x > 100000)
 * and prints it. In the future it may also save it somewhere. It's just for testing.
 */

var k = require('./../k_globals/koala.js')
var fs = require('fs');
  
k.createNode(function(msg, uid) {
	var res = JSON.parse(msg.data);
	//console.log("received msg with id " + res.id + " and im uid " + uid);
	
	fs.appendFileSync("middle.txt", res.id + "\n", encoding='utf8', function(err) {
    	if(err) {
        	console.log(err);
    	}
	});
	
	
	var msg = {
				work : res.work,
				id : res.id,
			}
	k.send(JSON.stringify(msg), 'send_LB');
});  
