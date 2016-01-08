var fs = require('fs');
var k = require('./../k_globals/koala.js')

var counter = 0;
var name = "Esempio_1"

var interval = setInterval(function() {
	if(!k.isBinded())
		return;
	var message = {
		ciao: 'ciao'
	}
		
	k.send(message);
	
 }, 1000); 
 
 console.log("Esempio_1 started");