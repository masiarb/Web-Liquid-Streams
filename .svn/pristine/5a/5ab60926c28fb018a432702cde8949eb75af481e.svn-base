//require WLS
var k = require('./../k_globals/koala.js')


//script of the operator
k.createNode(function(polished_temperature_data) {
	k.callFunction("updateGraph", [polished_temperature_data.temperature, polished_temperature_data.time]);
});

//create the hidden div that will contain the received data
k.createHTML('data', '<div id="newdata" style="display:none;"></div>');
k.createHTML('canvas', '<canvas id="canvas" width="500px" height="500px"></canvas>');


//add the graph script
k.createScript('ss_graph', 'js/ss_graph.js');

 