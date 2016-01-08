 /**
 * New node file
 */


var k = require('./../k_globals/koala.js')


k.createNode(function(msg) {

	console.log('(B) received: '+msg)
	
	k.send_LB_Key({k: (msg.tick % 3)})
	
	k.runtime_register( { name: 'foo', value: msg } )

}).start()

console.log('consumer started')

