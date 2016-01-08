/**
 * Prime Producer
 * This file is a script that sends with fixed (or not!) intervals
 * (big) numbers to a function (on another node) which will compute
 * the number of primes between 0 and this number.
 */
var fs = require('fs');
 var k = require('./../k_globals/koala.js')
 
 var easywork = "2000000";
 var baseline = 1000000;
 var hard = 1000000;
 var index = 0;
 var MIN_LIGHT = 100;
 var MAX_HEAVY = 500;
 
 var easy = true;
 
var easycounter = 0;
var hardcounter = 0;


//send difficult work one step at the time (increase 1kk every 100 msgs)
 
 var interval = setInterval(function() {
 
 	if(!k.isBinded())
		return;
	
	var seconds = new Date().getTime() / 1000;
	var msg = {
		work : undefined,
		id : index,
		start : seconds,
	}
	
	if(index > 1000)
		return;
		
	fs.appendFileSync("sending.txt", index+" " + hard + "\n", 'utf8');
	
	//before 500 messages, increase the difficulty 1mln at a time
	if(index < 500 && index % 100 === 0){
		hard += baseline;
	}
	//after 500 messages, decrease the difficulty 1mln at a time
	else if(index >= 500 && index % 100 === 0){
		hard -= baseline;
	}
		
	msg.work = "" + hard;
	k.send(JSON.stringify(msg));
	
	
	index ++; 
	
 }, 1000); 
 
 console.log("Prime producer started");