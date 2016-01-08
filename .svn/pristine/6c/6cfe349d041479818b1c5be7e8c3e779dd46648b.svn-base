/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

var tick = 0

setInterval(function() {

	k.send(tick++)
	
	k.runtime_register( { name: 'foo', value: tick } )

}, 1000)

console.log('producer started')


