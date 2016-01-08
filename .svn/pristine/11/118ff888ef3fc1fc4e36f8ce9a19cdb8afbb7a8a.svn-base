/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

var i = 0;

_fuffa_ = false;

setTimeout(function() {

	k.openFileStream('/home/masiar/lorebig.txt', function(chunk) {
		console.log("(A) sending : " + chunk);
		//starting time
		if(i == 0){
			var time = new Date().getTime();
			k.runtime_register( { name: 'start-time', value: time } )
			i++;
		}
		
		k.send_LB( chunk.toString() )
	},
	function(x) {
		
		console.log('done, sent '+x+' files')
	})

	console.log('A -- file reader started')
		
}, 1000)


