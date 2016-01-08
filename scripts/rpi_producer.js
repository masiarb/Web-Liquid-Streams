/**
 * New node file
 */

var k = require('./../k_globals/koala.js')
var rpio = require("rpio");

rpio.setInput(11)

setInterval(function(){

   console.log(rpio.read(11));
   
}, 500);

console.log('rpi producer started') 

 