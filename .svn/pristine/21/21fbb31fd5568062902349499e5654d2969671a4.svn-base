/**
 * Prime Producer
 * This file is a script that sends with fixed (or not!) intervals
 * (big) numbers to a function (on another node) which will compute
 * the number of primes between 0 and this number.
 */
var fs = require('fs');
 var k = require('./../k_globals/koala.js')
 
//only for testing, remove it afterward (also the function implementation)
//k.setProducer();
 
 var easywork = "1000000";
 var easy = "2000000";
 var medium = "3000000";
 var hard = "5000000";
 var veryhard = "8000000";
 var index = 0;
 var MIN_LIGHT = 100;
 var MAX_HEAVY = 500;
 
 var easy = true;
 
var easycounter = 0;
var hardcounter = 0;
 
 var interval = setInterval(function() {
 
 	if(!k.isBinded())
		return;
	
	//console.log(index)
	
	var seconds = new Date().getTime();
	
	var ideal = 1;
		//ideal = 11;
	
	//TEST 0: only 1 step!
	//add the current number of workers to the message
	k.getWorkerNumber(1, function(wrks){
	
		var msg = {
			work : undefined,
			id : index,
			start : seconds,
			ideal : undefined,
			workersInFilter : wrks[0]
		}
		console.log("ID AT PRODUCER: " + index);
		if(index > 1000)
			return;
		
		if(index < 300){
			ideal = 1;
			msg.work = easywork;
			msg.ideal = 1;
		}
		else if(index < 600 && index >= 300){
			ideal = 8; //to be tested
			msg.ideal = 8;
			msg.work = hard;
		}
		else {
			ideal = 11; //to be tested
			msg.ideal = 11;
			msg.work = veryhard;
		}
		/*else if (index > 300 && index < 400){
			ideal = 8; //to be tested
			msg.ideal = 8;
			msg.work = hard;
		}
		else if (index > 400 && index < 500){
			ideal = 3; //to be tested
			msg.ideal = 3;
			msg.work = easy;
		}
		else {
			ideal = 4;
			msg.work = medium;
		}
		else {
			msg.work = easywork;
			msg.ideal = 1;
			ideal = 1; 
		}*/
		k.send(msg);
		
//		fs.appendFileSync("sending.txt", seconds + " - " + index + " - " + wrks[0] +"\n", 'utf8');
		console.log(seconds + " - " + index + " - " + wrks[0] +"\n", 'utf8')
	});
	//the value of wrks is an array because of the return function callback in the Controlelr -> Peer -> Operator code
	//k.getWorkerNumber(1, function(wrks){
		//console.log(wrks[0]);
		
	//});
	
	/*if(index < MIN_LIGHT || index >= MAX_HEAVY){
		easy = true;
		msg.work = easywork;
		k.send(JSON.stringify(msg));
	}
	else if(index >= MIN_LIGHT && index < MAX_HEAVY){
		easy = false;
		msg.work = hard;
		k.send(JSON.stringify(msg));
	}*/
	
	
	index ++; 
	
	//TEST 1: only 1 step
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
		
	fs.appendFileSync("sending.txt", ideal+"\n", 'utf8');
	
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
 }, 1000); 
 
 console.log("Prime producer started");
