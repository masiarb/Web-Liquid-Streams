/**
 * New node file
 */
var k = require('./../k_globals/koala.js')

k.createNode(function(stream) {
	k.send(JSON.stringify({
		stream:JSON.stringify(stream), 
		pid: pid}))

})
console.log('webcam producer started') 
 