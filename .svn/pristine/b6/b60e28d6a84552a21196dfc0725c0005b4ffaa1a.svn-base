/**
 * New node file
 */
var fs = require('fs')
var k = require('./../k_globals/koala.js')

var date = new Date()
var filename = "trace_" + date.getHours() + ":" + date.getMinutes() + ".txt"

var first = undefined
var counter = 0

k.createNode(function(message,uid,options) {

	// if(first == undefined) {
	// 	first = new Date().getTime()
	// }

	// if(counter % 50 == 0) {
	// 	var last = new Date().getTime()
	// 	var interval = last - first
	// 	if(interval != 0)
	// 		console.log((counter / interval) * 1000)

	// 	first = last
	// 	counter = 0
	// }
	
	// counter ++

	console.log('Arrived ' + counter)
	counter++

	var s = ""

	for(var i in options.__checkpoints) {
		s += ">, "
		s += options.__checkpoints[i].worker + ", "
		s += options.__checkpoints[i].operator + ", "
		s += options.__checkpoints[i].event + ", "
		s += options.__checkpoints[i].timestamp + ", "
		s += options.__checkpoints[i].cpu + ", "
		s += options.__checkpoints[i].m_size + ", "
		s += options.__checkpoints[i].ping + ", "
		s += options.__checkpoints[i].exectime + " "
	}

	s += "\n"

	fs.appendFileSync("traces/" + filename, s, encoding='utf8', function(err) {
     	if(err) {
         	console.log(err);
     	}
	 });

	k.done()

})