
var k = require('./../k_globals/koala.js')
var fs = require('fs');


var counter = 0;
k.createNode(function(value) {

if (value.data == 0) { counter= counter + 1; console.log("got value: " + value.data +" for the " +counter + " time "); }


k.send("", 'send_LB');
		
}).start();

console.log("The rpi worker has started")


// returns a closure
