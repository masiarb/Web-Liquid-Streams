/**
 * WEBCAM CONSUMER
 */

 var k = require('./../k_globals/koala.js')
//  var $ = require('jQuery');

// _fuffa_ = false;

// var webcams = new Array();
// var to_send = {};
// var index = 0;

// var previous;

// k.createState("cluster");

// var old_received_something_time;

// var counter = 0;

k.createNode(function(msg, uid, options) {

	//increase received values (ans_rate in the controller)
	k.send({},options);
	
	// k.saveTA(TaC);
	
	//console.log("(WCC) TaC = " + TaC);
	//console.log("received something in wcc and im uid " + uid );
}).start()

//.start('asap')

// k.makeObservable(webcams, '/puzzle', function(){
// 	// callback
	
// });

// var average = 0;
// var TaC = 0;
/*
k.exit_callback({
	process: "wcc",
	average: average,
});*/

/*
	Setup for computing average of time for message incoming
*/


console.log('consumer started')