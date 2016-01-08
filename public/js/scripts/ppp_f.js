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
var ideal;
var workersInFilter;
var global_uid;

var time_before = 0;
var AVERAGE = 0;
k.createNode(function(msg, uid) {
	global_uid = uid;
	time_before = received_something_time = new Date().getTime();
	console.log(msg)
	var messaggio = msg
	//console.log(messaggio);
	// var messaggio = JSON.parse(msg)
	start = messaggio.start;
	ideal = messaggio.ideal;
	LAST = messaggio.work;
	id = messaggio.id;
	workersInFilter = messaggio.workersInFilter;
	
	/*
	fs.appendFileSync("middle_rec.txt", id + "\n", encoding='utf8', function(err) {
    	if(err) {
        	console.log(err);
    	}
	});*/
	
	// console.log(messaggio.work)
	// console.log("Filter id " + uid + " -> received msg id = " + id + " with FIRST = " + FIRST + " LAST = " + LAST + ", last = " + last);
		
	//console.log(FIRST + " " + LAST);
	
	//correct filter:
	for (var i = FIRST; i < LAST; i += BATCH) {
		var first = i;
		var last = i + BATCH;
		if (last > LAST)
			last = LAST;
		
		searchPrimes(first, last);	
	};	
	
	//debug:
	/*var msg = {
				"global_count" : 1,
				"id" : id,
				"start" : start,
			}
	
//	msg = JSON.stringify(msg);
	k.send(msg, id);*/
});

function isPrime(n) {
	for (var i = 2; i*i <= n; i++) {
		if (n % i == 0)
			return 0;
	}
	return 1;
};

// this object is shared between event handlers a
var counters = {
		processed : 0,
		primes : 0
}


function inc_primes(n) {
	counters.primes += n;
	return counters.primes;
}

function inc_processed(n) {
	counters.processed += n;
	return counters.processed;
}

// returns a closure
function searchPrimes(first, last) {
		
		var local_count = 0;
		for (var i = first; i < last; i++) {
			if (isPrime(i)) {
				local_count++;
				//print('found prime :'+i)
			}
		}

		var global_count = inc_primes(local_count);
		var iii = inc_processed(last - first) 

		if (iii >= LAST - FIRST) {
			//print(' -> ' + global_count + " primes.");
			var exit_time = new Date().getTime();
			var msg = {
				"global_count" : global_count,
				"id" : id,
				"start" : start,
				"enter_filter" : time_before,
				"exit_filter" : exit_time,
				"workersInFilter" : workersInFilter,
				"ideal" : ideal,
				"from": global_uid
			}
			/*fs.appendFileSync("middle_ans.txt", id + "\n", encoding='utf8', function(err) {
    			if(err) {
        			console.log(err);
    			}
			});*/
//			msg = JSON.stringify(msg);
			
			//console.log("sending message from filter with id : " + id);
			
			k.send(msg, id);
			//reset
			counters = {
				processed : 0,
				primes : 0
			}	
			
			var time_taken = new Date().getTime() - time_before;
			if(AVERAGE == 0)
				AVERAGE = time_taken
			else
				AVERAGE = (AVERAGE + time_taken)/2
				
//			k.saveTA(AVERAGE);
		}

};
