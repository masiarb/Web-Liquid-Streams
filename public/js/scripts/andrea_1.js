var fs = require('fs');
var k = require('./../k_globals/koala.js')

var counter = 0;
var name = "Andrea_1"

var updateDomValue = undefined
var setDom = undefined
var getDom = undefined
var getLatency = undefined
var getOutLatency = undefined
if(isRemote) {
	updateDomValue = k.remoteUpdate()
	setDom = k.remoteSet()
	getDom = k.remoteGet()
	getOutLatency = k.remoteOutLatency()
}

var inputInterval = setInterval(function() {
	if(!k.isBinded())
		return;

	if(updateDomValue) {
		updateDomValue('#inputTest', 'val')
	}
}, 200)
 

var isEasy = true
var easy = 20
var hard = 6

var time = easy

var interval = setInterval(function() {
	if(!k.isBinded())
		return;
		
	console.log(name + "- " + counter++)
	k.send({
		c: counter,
		work: "easy"
	});
	
 }, time); 

var interval2 = setInterval(function() {
	
	if(isEasy) {
		isEasy = false
		time = hard

		clearInterval(interval)
		interval = setInterval(function() {
			if(!k.isBinded())
				return;
				
			console.log(name + "- " + counter++)
			k.send({
				c: counter,
				work: "hard"
			});
			
		 }, time); 
	} else {
		isEasy = true
		time = easy
		clearInterval(interval)
		interval = setInterval(function() {
			if(!k.isBinded())
				return;
				
			console.log(name + "- " + counter++)
			k.send({
				c: counter,
				work: "easy"
			});
			
		 }, time); 
	}
	
 }, 10000); 

k.createHTML('esempio2' ,
	'<h1>PRODUCER</h1>' +
	'<div id="feedback">This is an example of custom page</div>'
)
 
 console.log("Andrea_1 started");