var k = require('./../k_globals/koala.js')
var fs = require('fs');

var index = 100000;
var name = "Andrea_2"

k.createNode(function(msg, uid) {
	var response = JSON.parse(msg.msg);

	var message = {counter: index - response.counter}
	console.log(name + ": new message -> " + JSON.stringify(message))

	k.send(JSON.stringify(message));
});  

 console.log("Andrea_2 started");
