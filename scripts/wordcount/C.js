/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

//
// foo : 2
// bar : 3
//

_fuffa_ = false

k.createNode(function(msg) {

	var count = k.state.get(msk.k);
	count++
	k.state.set(msk.k, count);
	
}).start()

//k.state.makeObservable('/table')


console.log('C -- Table started')


