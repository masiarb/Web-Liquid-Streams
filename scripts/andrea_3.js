var k = require('./../k_globals/koala.js')
var fs = require('fs');

var name = "Andrea_3"

k.createNode(function(msg, uid) {
	var response = JSON.parse(msg.data);

	console.log(name + ": recieved -> " + JSON.stringify(response))

	k.done();
});  


 console.log("Andrea_3 started");