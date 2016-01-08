/**
 * Primes Consumer
 * This script receives the total number of primes found for a specific range (0 to x where x > 100000)
 * and prints it. In the future it may also save it somewhere. It's just for testing.
 */
var fs = require('fs');
var k = require('./../k_globals/koala.js')

var start;

k.createNode(function(msg, uid) {
	// var res = JSON.parse(msg);
	//console.log(res)
	// console.log("received msg with id " + res.id + " and im uid " + uid + " message departed at sec: " + res.start);
	
	// if(res.id == 0)
	// 	start = new Date().getTime() / 1000;
	
	/*
		This send has to do with some stuff in the messages_sent++ and the fact that we need
		a way to store how many messages have been processed. TODO: make a function like
		"k.messageProcessed()" in order to do all the setup stuff when a message is computed
		without the need of calling send (which is conceptually VERY wrong as nothing is sent)
	*/
	k.done();
	
	// var seconds = new Date().getTime() / 1000;
	
	// if(res.id == 500)
	// 	console.log("DONE================================================================================================================================================================================================================================================================================================================================");
	
	// ID : TIME_TAKEN : TIME_FROM_START
	
	// fs.appendFileSync("received.txt", res.id + ":" + (seconds - res.start) + ":" + (seconds - start) + "\n", encoding='utf8', function(err) {
 //    	if(err) {
 //        	console.log(err);
 //    	}
	// });
}); 
