/**
 * Prime Filter
 * Receives a number and computes the total number of primes between 2 and that number.
 * The results (each prime) is sent to a consumer that stores them somewhere.
 */

var k = require('./../k_globals/koala.js')
var fs = require('fs');


var id;
require('stream');

k.createNode(function(stream, uid) {

//data1 = JSON.parse(stream.data).data;

//k.send(JSON.stringify(data1), 'send_LB');

//console.log(stream.data);

//console.log(stream);

k.send(stream.data, 'send_LB');
		
}).start();

console.log("The worker has started")


// returns a closure
