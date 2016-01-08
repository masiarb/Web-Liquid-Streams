/**
 * Primes Consumer
 * This script receives the total number of primes found for a specific range (0 to x where x > 100000)
 * and prints it. In the future it may also save it somewhere. It's just for testing.
 */

var k = require('./../k_globals/koala.js')
var fs = require('fs');

var seconds;

var howMany = 0
var firstTimestamp = undefined
var firstTime = true;
var lastMessageReceived = 0;
var timeBetweenMessages = 0;
k.createNode(function(msg, uid) {
	
	//console.log(msg);
	var data = JSON.parse(msg.data);
	var start = data.start;
	var ideal = data.ideal;
	var msg_id = data.id;
	var workersInFilter = data.workersInFilter;
	var time_enter_filter = data.enter_filter;
	var time_exit_filter = data.exit_filter;
	var time = (new Date()).getTime();
	
	//console.log("ID AT CONSUMER: " + data.id);
	
	howMany++
	if(firstTime) {
		firstTime = false
		firstTimestamp = time;
	}
	
	if(lastMessageReceived === 0){
		lastMessageReceived = time;
	}
	else{
		timeBetweenMessages = time - lastMessageReceived;
		lastMessageReceived = time;
	}

	var now = (new Date()).getTime()

	var x = Math.round(now - firstTimestamp)/1000;
	var y = (howMany/(x));
	var delay = Math.round(now - start)/1000;

	//console.log(howMany + ' - ' + x + ' - ' + y)

	//console.log(res)
	// console.log("received msg with id " + res.id + " and im uid " + uid + " message departed at sec: " + res.start);
	
	// if(res.id == 0)
		// start = new Date().getTime() / 1000;
	
	/*
		This send has to do with some stuff in the messages_sent++ and the fact that we need
		a way to store how many messages have been processed. TODO: make a function like
		"k.messageProcessed()" in order to do all the setup stuff when a message is computed
		without the need of calling send (which is conceptually VERY wrong as nothing is sent)
	*/
	
	
	var sec = new Date().getTime() / 1000;
	
	// if(res.id == 500)
	// 	console.log("DONE================================================================================================================================================================================================================================================================================================================================");
	
	// START_TIME : ID : TIME_TAKEN : THROUGHPUT : TIME_FROM_START : TIME_BETWEEN_MESSAGES : UID_WHO_PROCESSED_IN_THE_FILTER
	//console.log(data.id + ":" + (seconds - start) + ":" + (seconds - start) );
	 fs.appendFileSync("received.txt", start + ' - ' + msg_id + ' - ' + delay + ' - ' + y + " - " + x + " - " + timeBetweenMessages + " - " + msg.from + "\n", encoding='utf8', function(err) {
     	if(err) {
         	console.log(err);
     	}
	 });
	 
	 // ID : START_TIME : WORKERS_IN_FILTER : TIME_IN_FILTER_INPUT : TIME_IN_FILTER_OUTPUT : TIME_IN_CONSUMER_INPUT
	 fs.appendFileSync("time_table.txt", msg_id + ' - ' + start + ' - ' + workersInFilter + ' - ' + time_enter_filter + ' - ' + time_exit_filter + " - " + now + "\n", encoding='utf8', function(err) {
     	if(err) {
         	console.log(err);
     	}
	 });

	/*fs.appendFileSync("test_throughput.txt", x + " " + y + "\n", encoding='utf8', function(err) {
    	if(err) {
        	console.log(err);
    	}
	});*/
	
	k.done();
}, process.argv[3]); 
