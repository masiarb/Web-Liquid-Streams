var fs = require('fs');
var k = require('./../k_globals/koala.js')

var name = "a3"

k.createNode(function(msg, uid, options) {
//	console.log(msg)
	// console.log(options)
	k.done(msg, options)
});  

 console.log("a3 started");
