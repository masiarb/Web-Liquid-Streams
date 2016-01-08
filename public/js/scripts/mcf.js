/**
 * New node file
 */
var k = require('./../k_globals/koala.js')

var updateDomValue = undefined
var setDom = undefined
var getDom = undefined
var getLatency = undefined
var getInLatency = undefined
var getOutLatency = undefined
if(isRemote) {
	updateDomValue = k.remoteUpdate()
	setDom = k.remoteSet()
	getDom = k.remoteGet()
	getInLatency = k.remoteInLatency()
	getOutLatency = k.remoteOutLatency()
}

var inputInterval = setInterval(function() {
	if(!k.isBinded())
		return;

	if(updateDomValue) {
		updateDomValue('#inputTest', 'val')
	}
}, 1000)

k.createNode(function(message) {
	var data = JSON.parse(JSON.parse(message.data))
	var personalId = data.pid
	var img = JSON.parse(data.stream).data

	if(setDom) {
		setDom('#img1', 'attr', 'src', img)
	}

	var detected
	if (getDom) {
		detected = getDom('#inputTest', 'val')
	}

	k.send(JSON.stringify({
		pid: personalId,
		stream: JSON.stringify(detected)
	}))

})
console.log('webcam producer started') 
 