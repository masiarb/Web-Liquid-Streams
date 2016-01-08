/**
 * New node file
 */
var k = require('./../k_globals/koala.js')

var allImages = {}

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
k.createNode(function(message) {
	var data = JSON.parse(JSON.parse(message.data))
	var personalId = data.pid
	var d = JSON.parse(data.stream)
	var data = JSON.parse(d).data

	allImages[personalId] = data

	if(setDom) {
		setDom('#images', 'html', JSON.stringify(allImages), {})
	}

	k.done()

})
console.log('webcam producer started') 
 