var k = require('./../k_globals/koala.js')
var fs = require('fs');

var name = "Andrea_3"

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

k.createNode(function(msg, uid) {
	// if(setDom && getInLatency) {
	// 	setDom('#inlat', 'html', getInLatency(), {})
	// }

	// var response = JSON.parse(msg.data);

	console.log(name + "- " + msg.c)

	k.done();
});  

k.createHTML('esempio2' ,
	'<h1>CONSUMER</h1>' +
	'<div id="feedback">This is an example of custom page</div>'
)

k.createScript('esempio1', 'js/example.js')


 console.log("Andrea_3 started");