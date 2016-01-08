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
	if(updateDomValue) {
		updateDomValue('#inputTest', 'val')
	}
}, 100)

k.createNode(function(message,uid,options) {
	// console.log(message)
	if(message.stream) {
		var stream = JSON.parse(message.stream)
		var personalId = message.pid
		var img = stream.data

		if(setDom) {
			setDom('#inputId', 'attr', 'val', personalId)
			setDom('#img1', 'attr', 'src', img)
		}


		var detected
		if (getDom) {
			detected = getDom('#inputTest', 'val')
		}

		detected = JSON.parse(detected)[personalId]

		k.send({
			pid: personalId,
			stream: detected
		}, options)
	} 
	// else {
	// 	var infos = JSON.parse(message)
	// 	var temperature = infos.temperature
	// 	var humidity = infos.humidity

	// 	if(setDom) {
	// 		setDom('#temperature', 'attr', 'html', temperature)
	// 		setDom('#humidity', 'attr', 'html', humidity)
	// 	}

	// 	k.done()
	// }
})

k.createHTML('esempio_webcam_html_filter' ,
	'<div id="temperature"></div>' +
	'<div id="humidity"></div>' +
	'<img width="1280" height="960" id="img1"></img>' +
    '<canvas width="1280" height="960" id="img2"></canvas>' +
    '<input id="inputId" style="visibility:hidden"></input>' +
    '<input id="inputTest" style="visibility:hidden" value="0"></input>'
)

k.createScript('ccv', 'js/ccv.js')
k.createScript('face', 'js/face.js')
k.createScript('facedetection', 'js/facedetection.js')
k.createScript('esempio_webcam_filter', 'js/face_recognition.js')

console.log('webcam filter started') 
 