var k = require('./../k_globals/koala.js')

//necessary to create Node?
k.createNode(function(msg, uid) {
	var tg = msg.t;
	//k.getState(tg);
	k.storage.getState;
	k.done();
});  


console.log("Consumer started");