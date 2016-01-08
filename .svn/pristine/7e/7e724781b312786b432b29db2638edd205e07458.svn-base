 var k = require('./../k_globals/koala.js')

//necessary to create node?
 k.createNode(function(msg, uid) {
 	var ti = msg.t;
 	//k.putState(ti,"ciao");
 	k.storage.increment("pim",1)
 	k.send(msg);

 })

 console.log("Filter:FORWARD");