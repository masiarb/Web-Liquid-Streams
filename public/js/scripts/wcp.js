/**
 * New node file
 */
var k = require('./../k_globals/koala.js')
var tokenRandom = Math.random()*1000

k.createNode(function(stream) {
	// console.log(stream)
	// if(stream) {
		k.send({
			stream:JSON.stringify(stream), 
			pid: tokenRandom + ""
		})
	// }

})


k.createHTML('esempio_webcam_html_producer' ,
	'<video id="sourcevid" autoplay>Put your fallback message here.</video>' +
    '<canvas width="1280" id="canvas" height="960" style="display: inline;"></canvas>' + 
    '<div id="errorMessage"></div>' +
    '<select onchange="change_res(this);"><option value="png">png</option><option value="jpeg">jpeg</option>'
)

k.createScript('esempio_webcam_producer', 'js/webcam_producer.js')

k.registerProducer('producerStream')

console.log('webcam producer started') 
 