/**
 * Dummy bot that sends data about temperature humidity and pressure.
 * Used to test stuff for the demo of WoT.
 */

var k = require('./../k_globals/koala.js')

var tick = 0

setInterval(function() {

	k.send({
		"temperature" : 20,
		"pressure" : 0.1,
		"humidity" : "50%"
	});

}, 1000)

console.log('producer started');