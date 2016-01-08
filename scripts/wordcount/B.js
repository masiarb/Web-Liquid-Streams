 /**
 * New node file
 */


var k = require('./../k_globals/koala.js')


k.createNode(function(msg) {

	var chunks = msg.s.split(' ')

	chunks.map(function(v) {
	
		k.send_LB_Key({ k : v })
	})

}).start()


console.log('B -- Filter started')

