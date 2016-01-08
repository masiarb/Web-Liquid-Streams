/**
 * New node file
 */
var k = require('./../k_globals/koala.js')


k.createNode(function(message,uid,options) {
	// console.log(message)
	if(message.stream) {
		var stream = JSON.parse(message.stream)
		var personalId = message.pid
		var img = stream.data

		var buf = new ArrayBuffer(img.length*2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i=0, strLen=img.length; i<strLen; i++) {
		    bufView[i] = img.charCodeAt(i);
		}

		var encrypted = CryptoJS.AES.encrypt(buf, 'nonfunzionauncazzo');

		// detected = JSON.parse(detected)[personalId]

		k.send({
			pid: personalId,
			stream: encrypted.toString()
		}, options)
	} 
})

importScripts("aes.js")

console.log('webcam filter started') 
 