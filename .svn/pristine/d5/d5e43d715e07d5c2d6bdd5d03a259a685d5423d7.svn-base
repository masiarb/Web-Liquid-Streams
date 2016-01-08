//import WLS
var k = require('./../k_globals/koala.js');

//create the Worker callback function
k.createNode(function(raw_data){

	//polish data
	var date = new Date(raw_data.time);
	var time = date.getHours(date) + ":" + date.getMinutes(date);
	
	//console.log(['sensorData', "volume", ""+raw_data.volume]);
	//save it in database
	k.stateful.addToSortList(['sensorData', 1, ""+raw_data.volume], function(res){
		console.log("dentro addtosortlist callback");
		console.log(res);
	});
	
	k.stateful.addToSortList(['sensorData', 2, ""+raw_data.light], function(res){
		console.log("dentro addtosortlist callback");
		console.log(res);
	});
	
	
	
	/*k.stateful.get("prova", function(res){
		console.log(res);
	});*/
	
	/*k.stateful.getMergedSortList(['test', 0, -1], function(res) { 
		console.log(res);
	});*/
	
	//get the last 10 measurements
	//k.stateful.getRangeSortList("sensorData", -1, -10, true, func);
	k.stateful.getRangeSortList("sensorData", -1, -10, true, function(data){
		console.log("get range sort list callback");
		console.log(data);
	});
	//send a more human-readable time
	//raw_data.time = time;
	
	//send it to browsers
	//k.send(raw_data); //id, type, average, value
});
