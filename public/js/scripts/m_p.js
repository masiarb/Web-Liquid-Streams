/**
 * Prime Producer
 * This file is a script that sends with fixed (or not!) intervals
 * (big) numbers to a function (on another node) which will compute
 * the number of primes between 0 and this number.
 */
var fs = require('fs');
 var k = require('./../k_globals/koala.js')
 
 var easywork = "1000000";
 var hard = "5000000";
 var index = 0;
 var MIN_LIGHT = 15;
 var MAX_HEAVY = 50;
 
 /*
 	Interval data
 */
 var SEND_INTERVAL = 500;
 var interval
 
 var easy = true;
 
var easycounter = 0;
var hardcounter = 0;

// var message_size = 819200
var message_size = 1638400

// var change_interval = setInterval(function(){

// 	if(!k.isBinded() || index > 500)
// 		return;
		
// 	clearInterval(interval);
	
// 	if(SEND_INTERVAL > 100){	
// 		SEND_INTERVAL = SEND_INTERVAL - 100;
// 	}
	
// 	producer();
// }, 10000);
 
var producer = function() {
 
 interval = setInterval(function() {
 
 	if(!k.isBinded())
		return;
	
	//console.log(index)
	
	var seconds = new Date().getTime() / 1000;
	
	var msg = {
		work : undefined,
		id : index,
		start : seconds,
	}
	
	
	if(index > 500)
		return;
	msg.work = "";

	for(var i =0; i < message_size; i++) {
		msg.work += "#";
	}

	k.send(JSON.stringify(msg));
	index ++; 
	
 }, SEND_INTERVAL); 
 
 }
 
 producer();
 console.log("Prime producer started");