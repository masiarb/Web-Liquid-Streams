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
 var SEND_INTERVAL = 50;
 var interval
 
 var easy = true;
 
var easycounter = 0;
var hardcounter = 0;

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
	
	
	//TEST 0: only 1 step!
	/*
	if(index > 500)
		return;
	
	if(index < MIN_LIGHT || index >= MAX_HEAVY){
		msg.work = easywork;
		k.send(JSON.stringify(msg));
	}
	else if(index >= MIN_LIGHT && index < MAX_HEAVY){
		msg.work = hard;
		k.send(JSON.stringify(msg));
	}
	
	
	index ++; */
	
	//TEST 1: only easy
	
	if(index > 500)
		return;
	msg.work = hard;
	k.send(JSON.stringify(msg));
	index ++; 
	
	// console.log(index + " " + SEND_INTERVAL);
	
	
	//TEST 2: step every 100 messages (after 500 messages stop)
	
	
	/*
	if(index > 500){
		clearInterval(interval);
		return;
	}
	
	//if not easy work
	if(easy){
		easycounter++;
	}
	else{
		hardcounter++;
	}
	
	if(easycounter == 50 || hardcounter == 50){
		easy = !easy;
		easycounter = 0;
		hardcounter = 0;
	}
	
	
	var ideal = 1;
	if(!easy)
		ideal = 7;
		
	if(!isRemote) {
		fs.appendFileSync("sending.txt", ideal+"\n", 'utf8');
	}

	if(easy){
		msg.work = easywork;
		msg.id = index;
		console.log("sending easy");
		k.send(JSON.stringify(msg));
	}
	else{
		console.log("sending hard");
		msg.work = hard;
		msg.id = index;
		k.send(JSON.stringify(msg));
	}
	
	index++; */
	
	//TEST 3: increasing slope
	/*
	if(index > 1000)
		return;
	easy = "" + (parseInt(easy) + 4000);
	msg.work = easy;
	k.send(JSON.stringify(msg));
	index++; */
	
	//TEST 4: only send heavy work
	/*
	if(index > 1000)
		return
	msg.work = hard;
	k.send(JSON.stringify(msg));
	index++; 
	*/
	
	//TEST 5: only send easy work in 500 msg
	/*
	msg.work = easywork;
	if(index > 100)
		return
	
	k.send(JSON.stringify(msg));
	index++; 
			*/
 }, SEND_INTERVAL); 
 
 }
 
 producer();
 console.log("Prime producer started");