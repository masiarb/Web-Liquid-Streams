var k = require('./../k_globals/koala.js')

var tick = 0

setInterval(function() {
	if(k.isBinded()) {
		var m = {
			t:tick
		}
		k.send(m);
		tick++;
	}
},1000);

console.log('producer go go go');
