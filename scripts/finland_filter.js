//import WLS
var k = require('./../k_globals/koala.js');

//create the Worker callback function
//TODO: to be changed
k.createNode(function(raw_data){

	//polish data
	var date = new Date(raw_data.time);
	var time = date.getHours(date) + ":" + date.getMinutes(date);

	raw_data.time = time;
	//send it to browsers
	k.send(raw_data);

});
