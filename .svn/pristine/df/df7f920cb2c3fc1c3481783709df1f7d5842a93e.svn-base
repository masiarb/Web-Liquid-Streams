/**
 * New node file
 */
var k = require('./../k_globals/koala.js')
var aes = require('crypto-js/aes')


k.createNode(function(message,uid,options) {
  // console.log(message)
  if(message.stream) {
    var stream = JSON.parse(message.stream)
    var personalId = message.pid
    var img = stream.data

    var encrypted = aes.encrypt(img, 'nonfunzionauncazzo');
    // console.log(encrypted.toString())

    // detected = JSON.parse(detected)[personalId]

    k.send({
      pid: personalId,
      stream: encrypted.toString()
    }, options)
  } 
})

console.log('webcam filter started') 
 


// /**
//  * WEBCAM FILTER
//  * To be run in an intermediate node in the topology
//  * Takes an image, apply some filter to it and sends
//  * it forward to the next node in the topology.
//  */

//   var k = require('./../k_globals/koala.js')
//   var gm = require('gm');
//   var Stream = require('stream');
//   var StringReader = require('./../lib/stringreader.js');
//   var spawn = require('child_process').spawn;
  
//   var fs = require('fs')
  
//   var capturing_flag = true;
  
//   var face_detect = require('face-detect');
//   var Canvas = require('canvas')
//   , canvas = new Canvas(320, 240)
//   , ctx = canvas.getContext('2d');
  
//   _fuffa_ = false;
  
//   var old_received_something_time;
//   var counter = 0;
  
//   k.createNode(function(msg, uid) {
  
//     if(msg.data) {
//       msg = msg.data
//     }
  
//   //console.log("i received something and i'm uid = " + uid);
//   //console.log("msg.msgid in wcf = " + msg.msgid);
  
//     counter++;
//     var received_something_time;
//     var time_before = received_something_time = new Date().getTime();
//     // k.saveTimeArrival(received_something_time, counter, msg.from+";"+msg.msgid); 
    
    
//     if(!old_received_something_time)
//       old_received_something_time = received_something_time;
//     else
//     //old_received_something_time = msg.ts;
//       if(TaF == 0)
//         TaF = received_something_time - old_received_something_time;
//       else{
//         TaF = ((received_something_time - old_received_something_time) + TaF) / 2;
//         //console.log("(WCF) time passed after last receive = " + (received_something_time - old_received_something_time));
//         old_received_something_time = received_something_time;
//       }
      
      
    
      
      
      
        
//     /*if(TaF == 0)
//       TaF = msg.ts
//     else
//       TaF = ((received_something_time - msg.ts) + TaF) / 2 */
    
//     //from browser

//   //  console.log(msg)
//   //  if(msg != 'undefined:1')
//     // console.log(JSON.parse(msg))
//   // msg = JSON.parse(msg).data.msg

//   var stream = JSON.parse(msg.stream)

//   // var parsed_result = JSON.parse(JSON.parse((JSON.parse(msg)).msg).stream).data
//   // var personal_id = (JSON.parse((JSON.parse(msg)).msg)).pid
//   var personal_id = msg.pid
//  //   if(msg.msg){
//   //  var parsed_result = JSON.parse(msg.msg);
//   // }
//   // else
//   //  var parsed_result = msg;

//   var img = new Canvas.Image;
//   img.src = stream.data
//   ctx.drawImage(img, 0, 0);
  
//   //console.log("(WCF) time of travel: " + (time_before - msg.ts));
  
//   /*
//     computing average time
//   */
//   var computed_travel_time = time_before - msg.ts;
  
//   if(average == 0)
//     average = computed_travel_time
//   else
//     average = (computed_travel_time + average) / 2
    
    

//   var image = img;
//   var myCanvas = canvas;
//   var myCanvasContext = ctx;
  
//   var imgWidth=image.width;
//   var imgHeight=image.height;
//   // You'll get some string error if you fail to specify the dimensions
//   myCanvas.width= imgWidth;
//   myCanvas.height=imgHeight;
//   //  alert(imgWidth);
//   myCanvasContext.drawImage(image,0,0);

//   // This function cannot be called if the image is not rom the same domain.
//   // You'll get security error if you do.
//   var imageData=myCanvasContext.getImageData(0,0, imgWidth, imgHeight);

//   // This loop gets every pixels on the image and
//     for (j=0; j<imageData.height; i++)
//     {
//       for (i=0; i<imageData.width; j++)
//       {
//          var index=(i*4)*imageData.width+(j*4);
//          var red=imageData.data[index];
//          var green=imageData.data[index+1];
//          var blue=imageData.data[index+2];
//          var alpha=imageData.data[index+3];
//          var average=(red+green+blue)/3;
//    	    imageData.data[index]=average;
//          imageData.data[index+1]=average;
//          imageData.data[index+2]=average;
//          imageData.data[index+3]=alpha;
//        }
//      }

//     if (bPlaceImage)
// 	{
// 	  var myDiv=document.createElement("div");
// 	     myDiv.appendChild(myCanvas);
// 	  image.parentNode.appendChild(myCanvas);
// 	}
// 	return myCanvas.toDataURL();
    
    
//   //console.log("(WCF) average = " + average + " in uid = " + uid);
//   /*
//   var result = face_detect.detect_objects({ "canvas" : canvas, "interval" : 0, "min_neighbors" : 1 });
  
//   var time_after = new Date().getTime()
//   //console.log(time_after - time_before);
  
//   //draw bounding box
//   ctx.strokeStyle = "purple";
//   for (var i = 0; i < result.length; i++){
//       var face =  result[i];
//       //console.log(face);
//       ctx.strokeRect(face.x, face.y, face.width, face.height);
      
//   }*/
  
//   var idata = ctx.getImageData(0, 0, canvas.width, canvas.height),
//     data = idata.data;
//     for (i = 0; i <= data.length - 4; i += 4) {
//         data[i] = 255 - data[i]
//         data[i + 1] = 255 - data[i + 1];
//         data[i + 2] = 255 - data[i + 2];
//     }
//     //console.log("LEL");
//     ctx.putImageData(idata, 0, 0);
  
//   //ctx.scale(-1,1);

//   /*ctx.fillStyle = "blue";
//   ctx.font = "bold 20px Arial";
//   ctx.fillText("New Filter", 30, 30);*/
  
//   //take the image and send it
//   var img = canvas.toDataURL('image/png');
//   var data = {data: img}
  
  
//   k.send({
//     stream: JSON.stringify(data),
//     pid: personal_id
//   })
//   //console.log(counter+";"+uid);
//   //k.saveTime(counter)
//   //k.saveTA(TaF);
  
//   //console.log("(WCF) TaF = " + TaF + " counter = " + counter);
//   //var dep_time = new Date().getTime();
//   //console.log(dep_time+";"+uid+";");
  
//   /*fs.appendFile("/home/masiar/koala/koala/Koala/output/wcfts"+uid+".txt", dep_time+";"+msg.from+";"+msg.msgid+";"+counter+";" + uid+'\n', function (err) {
//       if (err) throw err;
//      //   console.log('The "data to append" was appended to file!');
//   });*/
  
//   //console.log((dep_time - parsed_result.ts));
  
//   //if(capturing_flag){
//     /*fs.appendFile("/home/masiar/koala/Koala/output/times.txt", (dep_time - parsed_result.ts) + ";" + uid + "\n", function(err) {
//       if(err) throw err;
//         });*/
//     //}
//     //capturing_flag = !capturing_flag;
    
//     //var wctimes = spawn('wc', ['-l', 'output/times.txt']);
//   //wctimes.stdout.on('data', function (data) {
//     //if((""+data).replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(" ")[0] > 100*100){
//       //console.log("kill everybody!");
//       //kill everybody
//       //killall();
//     //} 
//   //});
  
// }).start()

// /*
//   Setup for computing average of time for message incoming
// */
// var average = 0;
// var TaF = 0;

// k.exit_callback({
//   process: "wcf",
//   average: average,
// });

// var killall = function() {
//   var spawn = require('child_process').spawn
  
//   var n = spawn('killall', ['-9', 'nodejs']);
//   var n = spawn('killall', ['-9', 'node']);
// }


// console.log("Webcam Filter Started");