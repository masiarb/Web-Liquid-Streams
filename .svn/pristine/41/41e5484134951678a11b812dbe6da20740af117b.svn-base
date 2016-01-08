var fs = require('fs');
var k = require('./../k_globals/koala.js')

var counter = 0;
var name = "Andrea_1"
 
var interval = setInterval(function() {
	if(!k.isBinded())
		return;
	
	var message = {counter: counter++}
	console.log(name + ": new message -> " + JSON.stringify(message))
		
	k.send(JSON.stringify(message));
	
 }, 1000); 
 
 console.log("Andrea_1 started");