/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

setTimeout(function() {

	k.openFileStream('./foo.txt', function(chunk) {

		k.send_LB({ s: chunk })
	},
	function(x) {
	
		console.log('done, sent '+x+' files')
	})

	console.log('A -- file reader started')
		
}, 10000)


