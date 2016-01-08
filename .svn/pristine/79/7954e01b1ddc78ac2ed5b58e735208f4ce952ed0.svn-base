
/**
 * Prime Producer
 * This file is a script that sends with fixed (or not!) intervals
 * (big) numbers to a function (on another node) which will compute
 * the square of that number.
 */
var fs = require('fs');	
var k = require('./../k_globals/koala.js')
	
var index = 0;

var interval = setInterval(function() {

        if(!k.isBinded())
        	return;

        var seconds = new Date().getTime() / 1000;

        var msg = {
			id : index,
			start : seconds
		};

		console.log("SENDING");
		console.log(msg);
        k.send(JSON.stringify(msg), 'send_LB');

        index++;


 }, 1000); 


console.log("Producer started");
