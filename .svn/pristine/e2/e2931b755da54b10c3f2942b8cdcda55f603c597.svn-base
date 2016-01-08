/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

var tick = 0

/*k.state.makeObservable('/fuffa').get( function() {


} ).delete(){}*/

// { k : v }


k.createNode(function(msg) {


	k.state.set(msg.k, msg.k);


	console.log('(C) received: ' + msg)
	
}).start()

console.log('producer started')


