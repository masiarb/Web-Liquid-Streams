//require WLS
var k = require('./../k_globals/koala.js')

//some remote functions to be defined
var setDom;
if(isRemote) {
	setDom = k.remoteSet();
}


//script of the operator
k.createNode(function(actuator) {
	if(actuator.start)
		setDom("#fan", "css", "visibility", "visible");
});

//create the hidden div that will contain the received data
k.createHTML('viewer', 
	'<div>' +

	'</div>');


//add the graph script
k.createScript('hasler_script', 'js/hasler_script.js');