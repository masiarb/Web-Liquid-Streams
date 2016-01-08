/**
 * New node file
 */
var k = require('./../k_globals/koala.js')

k.createNode(function(message) {
	var data = JSON.parse(JSON.parse(message.data))
	var personalId = data.pid
	var img = JSON.parse(data.stream).data

	console.log(img)

	k.done()

})
console.log('webcam producer started') 
 