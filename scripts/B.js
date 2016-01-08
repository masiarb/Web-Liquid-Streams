 /**
 * New node file
 */


var k = require('./../k_globals/koala.js')

_fuffa_ = true 

k.createNode(function(msg) {

	var chunks = msg.data.split(' ')

	chunks.map(function(v) {
		console.log("(B) sending word: " + v);
		k.send_LB_Key({ k : v })
	})

}).start()


console.log('B -- Filter started')

