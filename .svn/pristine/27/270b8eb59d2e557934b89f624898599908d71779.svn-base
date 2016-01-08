/**
 * Prime Filter
 * Receives a number and computes the total number of primes between 2 and that number.
 * The results (each prime) is sent to a consumer that stores them somewhere.
 */

var k = require('./../k_globals/koala.js')
var fs = require('fs');
var print = console.log
var FIRST = 2;
var BATCH = 100 
var LAST;
var id;
var start;

var time_before = 0;
var AVERAGE = 0;
k.createNode(function(msg, uid) {
	time_before = received_something_time = new Date().getTime();
	
	// if(msg.msg){
	// 	if(JSON.parse(msg.msg).data) {
	// 		start = parseInt(JSON.parse(msg.msg).data.start);
	// 		LAST = parseInt(JSON.parse(msg.msg).data.work);
	// 		id = parseInt(JSON.parse(msg.msg).data.id)
	// 	} else {
	// 		start = parseInt(JSON.parse(msg.msg).start);
	// 		LAST = parseInt(JSON.parse(msg.msg).work);
	// 		id = parseInt(JSON.parse(msg.msg).id)
	// 	}
	// }
	// else{
	// 	start = JSON.parse(msg.data).start
	// 	LAST = JSON.parse(msg.data).work;
	// 	id = JSON.parse(msg.data).id;
	// }

	// var messaggio = msg
	// if(isRemote) {
	// 	messaggio = JSON.parse(msg)
	// 	start = messaggio.start
	// 	LAST = messaggio.work;
	// 	id = messaggio.id;
	// } 

	// var messaggio = JSON.parse(JSON.parse(msg).data)
	var messaggio = JSON.parse(msg)
	console.log(messaggio)
	work = messaggio.work

	var out = {
		work: work
	}

	k.send(JSON.stringify(out))

	
	/*
	fs.appendFileSync("middle_rec.txt", id + "\n", encoding='utf8', function(err) {
    	if(err) {
        	console.log(err);
    	}
	});*/
	
	// console.log(messaggio.work)
	// console.log("Filter id " + uid + " -> received msg id = " + id + " with FIRST = " + FIRST + " LAST = " + LAST + ", last = " + last);
		
	//console.log(FIRST + " " + LAST);
	
	//correct filter:s
	
	//debug:
	/*var msg = {
				"global_count" : 1,
				"id" : id,
				"start" : start,
			}
	
	msg = JSON.stringify(msg);
	k.send(msg, id);*/
}, process.argv[3]);
