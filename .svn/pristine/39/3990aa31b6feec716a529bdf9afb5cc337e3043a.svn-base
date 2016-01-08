var fs = require('fs');
var k = require('./../k_globals/koala.js')

var counter = 0;
var name = "a1"
var speed = 20 // 50 per second

var message = ""
var size = 10
var max = 10000

for(var i = 0; i < size; i++) {
	message += "a"
}

var inputInterval = setInterval(function() {
	if(!k.isBinded())
		return;

	if(counter != max) {
		counter++
		k.send({
			c: message,
		});
	}
}, speed)
 
 console.log("a1 started");
