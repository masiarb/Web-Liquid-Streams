/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

var previous;
_fuffa_ = false; 

/*var old_sent_something_time;
var sent_something_time;
var average = 0;*/

k.createNode(function(stream, uid) {
	//console.log("received something in wcbp and i'm uid = " + uid);
	var p = JSON.parse(stream.msg);
	p.ts = stream.ts;
	k.send_LB_ID(p);
	
	
	/*sent_something_time = new Date().getTime();
	
	if(!old_sent_something_time)
  		old_sent_something_time = sent_something_time;
  	else
  		if(TsBP == 0)
  			TsBP = sent_something_time;
  		else
  			TsBP = (sent_something_time - old_sent_something_time) / 2;
  			
  	console.log("(WCBP) TsBP = " + TsBP);
  	k.saveTA(TsBP);*/
	
}).start()
 
/* var TsBP = 0;
 
 k.exit_callback({
	process: "wcbp",
	average: average,
});*/
 
 console.log('webcam producer started')