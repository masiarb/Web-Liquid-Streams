/**
 * WEBCAM FILTER
 * To be run in an intermediate node in the topology
 * Takes an image, apply some filter to it and sends
 * it forward to the next node in the topology.
 */

  var k = require('./../k_globals/koala.js')
  var gm = require('gm');
  var Stream = require('stream');
  var StringReader = require('./../lib/stringreader.js');
  // var spawn = require('child_process').spawn;
  
  var fs = require('fs')
  
  var capturing_flag = true;
  
  // var face_detect = require('face-detect');
  var Canvas = require('canvas')
  , canvas = new Canvas(1280, 960)
  , ctx = canvas.getContext('2d');
  
  _fuffa_ = false;
  
  var old_received_something_time;
  var counter = 0;
  
  k.createNode(function(msg, uid, options) {
  
  	if(msg.data) {
  		msg = msg.data
  	}

  // console.log(msg)
  
  //console.log("i received something and i'm uid = " + uid);
  //console.log("msg.msgid in wcf = " + msg.msgid);
  
  	// counter++;
  	// var received_something_time;
  	// var time_before = received_something_time = new Date().getTime();
  	// // k.saveTimeArrival(received_something_time, counter, msg.from+";"+msg.msgid);	
  	
  	
  	// if(!old_received_something_time)
  	// 	old_received_something_time = received_something_time;
  	// else
  	// //old_received_something_time = msg.ts;
  	// 	if(TaF == 0)
  	// 		TaF = received_something_time - old_received_something_time;
  	// 	else{
  	// 		TaF = ((received_something_time - old_received_something_time) + TaF) / 2;
  	// 		//console.log("(WCF) time passed after last receive = " + (received_something_time - old_received_something_time));
  	// 		old_received_something_time = received_something_time;
  	// 	}
  		
  		
  	
  		
  		
  		
  			
  	/*if(TaF == 0)
  		TaF = msg.ts
  	else
  		TaF = ((received_something_time - msg.ts) + TaF) / 2 */
  	
  	//from browser

  // 	console.log(msg)
  // 	if(msg != 'undefined:1')
		// console.log(JSON.parse(msg))
	// msg = JSON.parse(msg).data.msg

	var stream = JSON.parse(msg.stream)

	// var parsed_result = JSON.parse(JSON.parse((JSON.parse(msg)).msg).stream).data
	// var personal_id = (JSON.parse((JSON.parse(msg)).msg)).pid
	var personal_id = msg.pid
 //  	if(msg.msg){
	// 	var parsed_result = JSON.parse(msg.msg);
	// }
	// else
	// 	var parsed_result = msg;

	var img = new Canvas.Image;
	img.src = stream.data
	ctx.drawImage(img, 0, 0);
	
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    for (var i = 0; i < pixels.length; i += 4) {
        pixels[i]   = 255 - pixels[i];   // red
        pixels[i+1] = 255 - pixels[i+1]; // green
        pixels[i+2] = 255 - pixels[i+2]; // blue
        // i+3 is alpha (the fourth element)
    }
  
    // overwrite original image
    ctx.putImageData(imageData, 0, 0);

	// //console.log("(WCF) time of travel: " + (time_before - msg.ts));
	
	// /*
	// 	computing average time
	// */
	// var computed_travel_time = time_before - msg.ts;
	
	// if(average == 0)
	// 	average = computed_travel_time
	// else
	// 	average = (computed_travel_time + average) / 2
		
	// //console.log("(WCF) average = " + average + " in uid = " + uid);
	
	// var result = face_detect.detect_objects({ "canvas" : canvas, "interval" : 0, "min_neighbors" : 1 });
	
	// var time_after = new Date().getTime()
	// //console.log(time_after - time_before);
	
	// //draw bounding box
	// ctx.strokeStyle = "purple";
	// for (var i = 0; i < result.length; i++){
 //  		var face =  result[i];
 //  		//console.log(face);
 //  		ctx.strokeRect(face.x, face.y, face.width, face.height);
	// }
	
	//take the image and send it
	var img = canvas.toDataURL('image/png');
	var data = {data: img}
	
	
	k.send({
		stream: JSON.stringify(data),
		pid: personal_id
	},options)
	//console.log(counter+";"+uid);
	//k.saveTime(counter)
	//k.saveTA(TaF);
	
	//console.log("(WCF) TaF = " + TaF + " counter = " + counter);
	//var dep_time = new Date().getTime();
	//console.log(dep_time+";"+uid+";");
	
	/*fs.appendFile("/home/masiar/koala/koala/Koala/output/wcfts"+uid+".txt", dep_time+";"+msg.from+";"+msg.msgid+";"+counter+";" + uid+'\n', function (err) {
	  	if (err) throw err;
		 // 	console.log('The "data to append" was appended to file!');
	});*/
	
	//console.log((dep_time - parsed_result.ts));
	
	//if(capturing_flag){
		/*fs.appendFile("/home/masiar/koala/Koala/output/times.txt", (dep_time - parsed_result.ts) + ";" + uid + "\n", function(err) {
			if(err) throw err;
        });*/
    //}
    //capturing_flag = !capturing_flag;
    
    //var wctimes = spawn('wc', ['-l', 'output/times.txt']);
	//wctimes.stdout.on('data', function (data) {
		//if((""+data).replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(" ")[0] > 100*100){
			//console.log("kill everybody!");
			//kill everybody
			//killall();
		//}	
	//});
	
}).start()

/*
	Setup for computing average of time for message incoming
*/
var average = 0;
var TaF = 0;

k.exit_callback({
	process: "wcf",
	average: average,
});

var killall = function() {
	var spawn = require('child_process').spawn
	
	var n = spawn('killall', ['-9', 'nodejs']);
	var n = spawn('killall', ['-9', 'node']);
}


console.log("Webcam Filter Started");