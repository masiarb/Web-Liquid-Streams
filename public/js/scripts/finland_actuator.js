//require WLS
var k = require('./../k_globals/koala.js')

//some remote functions to be defined
var setDom;
if(isRemote) {
	setDom = k.remoteSet();
}


//script of the operator
k.createNode(function(actuator) {
	console.log(actuator);
	if(actuator.start)
		setDom("#fan", "css", "visibility", "visible");
	else
		setDom("#fan", "css", "visibility", "hidden");
});

//create the hidden div that will contain the received data
k.createHTML('fan', '<div id="fan" style="visibility: hidden;"><img src="http://i.imgur.com/S3C9gjb.gif"></img></div>');


//add the graph script
k.createScript('ss_graph', 'js/ss_graph.js');