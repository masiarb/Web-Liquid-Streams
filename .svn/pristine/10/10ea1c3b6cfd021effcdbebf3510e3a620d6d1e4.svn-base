/**
 * Prime Producer
 * This file is a script that sends with fixed (or not!) intervals
 * (big) numbers to a function (on another node) which will compute
 * the number of primes between 0 and this number.
 */

 var k = require('./../k_globals/koala.js')
 var flowValue = 1;
 setInterval(function() {
 	
	
	temp = Math.floor((Math.random()*20)+1);
	hum = Math.floor((Math.random()*20)+1);
	k.send({"temp": temp, "hum" : hum}, 'send_LB');

	
 }, 2000);
 
 console.log("Prime producer started " + flowValue);