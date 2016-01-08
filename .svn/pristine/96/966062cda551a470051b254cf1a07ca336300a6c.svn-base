/**
 * COUNTER
 * Simple producer that sends 1 message per second.
 * The message contains an increasing counter. This
 * script can be used to test for data loss with 
 * particularly complex configurations.
 */


var k = require('./../k_globals/koala.js') 
var count = 0;
 
var interval = setInterval(function() {
	
	console.log("producer counter is sending " + count);
	
	//if(count <= 0)
	k.sendTo(JSON.stringify(
		{
			'count'      : count,
			'start_date' : new Date().getTime(),
			'who shall receive' : "consumer1"
		}
	), "consumer1");
	
	k.sendTo(JSON.stringify(
		{
			'content' : "number 2 stinks!",
			'count'      : count,
			'who shall receive' : "consumer2"
		}
	), "consumer2");
	
	count++;
 }, 1000);