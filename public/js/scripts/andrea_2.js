var fs = require('fs');
var k = require('./../k_globals/koala.js')

var index = 100000;
var name = "Andrea_2"

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
	for(var i = 0; i < 9000000; i++) {
		//DELAY
	}

	if(msg.work == 'easy') {
		setDom('#feedback', 'html', 'Currently receiving <span style="color: green">LIGHT</span> work from upstream', undefined)
	} else {
		setDom('#feedback', 'html', 'Currently receiving <span style="color: red">HEAVY</span> work from upstream', undefined)
	}

	k.send(msg);
});  

k.createHTML('esempio1' ,
	'<h1>FILTER</h1>' +
	'<h3 >Example of a custom HTML written in WLS</h3>' +
	'<div id="feedback"></div>'
)

 console.log("Andrea_2 started");
