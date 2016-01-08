var k = require('./../k_globals/koala.js')
var Twitter = require('twitter');
var fs = require('fs');

var random_minute = new Date().getMinutes()
var filename = "samples/twitter_sample_" + random_minute + ".txt";

var client = new Twitter({
    consumer_key: 'qbU7JHd4Mc2XlIwxxWLWaoyPc',
    consumer_secret: 'KR2qasaCQmAak4zoaEr7OaCzyuihpcr2gCtPOvfYPT4uzeYBhA',
    access_token_key: '215976459-mFAFsaBY1cGWAi3ikJ0nQZooKjoClx3zlxbxjcgS',
    access_token_secret: '4IPgZo6F7UbNS3iueF01oVbikANLhLLQZUOjGodX3eclu'
});

var counter = 0;
var name = "a1"
var speed = 6 // 50 per second
var text = 'text'

var message = ""
var size = 10
var max = 100000
var prc = undefined;

var lineReader = require('line-reader');
var fileOpened = false
var fileReader = undefined
/*lineReader.open('scripts/tweets.txt', function(reader) {
  fileReader = reader
  fileOpened = true
})*/

// var tweets = 0
//  client.stream('statuses/filter', {track: 'twitter',language: 'en'},  function(stream){
//    stream.on('data', function(tweet) {
// // 	console.log(tweet.text);
// //     if(!k.isBinded())
// //    	return

     
//     var twit = tweet.text;
//     if(twit != undefined){
//       counter++;
      
//       twit = twit.replace(/(https?:\/\/[^\s]+)/g, '');
//       twit = twit.replace(/@+\w*/g, "");
//       twit = twit.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,''); 
//       twit = twit.trim()
//       twit = twit.replace(/\s{2,}/g, ' ');
//       twit = twit.replace(/RT+\s/g, ''); 
//       twit = twit.replace(/\r?\n|\r/g, '')

//        var d = new Date().getTime();
       
//        var delay = 0;
//        if(prc)
//         delay = d - prc;
//        prc = d;
//        var s = delay + "," + twit + "\n";

       
       
//        /*var m = {
//         counter: counter,
//         c: twit
//        }
//        k.send("", {});*/
//        if(counter > max){
//         k.error("twitter sampling done");
//         return;
//        }

//        if(counter % 500 == 0) {
//         k.log("counter: " + counter);
//        }
       
//        else {
//         fs.appendFileSync(filename, s, encoding='utf8', function(err) {
//           if(err) {
//             console.log(err);
//           }
//         });
//        }
//      }
//      k.done();
//    });

//    stream.on('error', function(error) {
//      k.error(error);
//    });
//  });

 /*setInterval(function(){
   if(!k.isBinded())
     return

   var m = {
    counter: counter,
    c: text
   }
   k.send(m);
 }, speed)*/


/*setInterval(function(){
  if(!k.isBinded() || !fileOpened || tweets >= 100000)
    return

  var c = ""

  if (fileReader.hasNextLine()) {
    fileReader.nextLine(function(line) {
      c = line
    });
  }

  tweets++

  var m = {
   counter: counter,
   c: c
  }
  k.send(m);
}, speed)*/


// ########## SEND
lineReader.open("samples/piloted_sample.txt", function(reader) {
  fileReader = reader
  fileOpened = true

  reader.nextLine(function(line) {
      firstLine = line
      counter = 1
  });
  
  	var newLine = undefined

	var progressTimeout = undefined
	
	var startInterval = setInterval(function(){
	  if(!k.isBinded() || !fileOpened || counter > 99800)
	    return
	
	  clearInterval(startInterval)
	  startInterval = undefined
	
	  k.warn('started')
	
	  twit = (firstLine.split(','))[1]
	
		
	  if (fileReader.hasNextLine()) {
	    fileReader.nextLine(function(line) {
	      newLine = line.split(",")
	      newLine[0] = parseInt(newLine[0], 10)/2
		
	      progressTimeout = setTimeout(sendNewMessage, newLine[0])
	    });
	  }
	
	  k.send({
	    counter: counter,
	    c: twit
	  })
	
	},100);
	
	var sendNewMessage = function() {
  counter++
  if(!k.isBinded() || !fileOpened || counter > 99800)
    return

  var twit = newLine[1]

  if (fileReader.hasNextLine()) {
    fileReader.nextLine(function(line) {
//      console.log(line);
      newLine = line.split(",")
      newLine[0] = parseInt(newLine[0], 10)/2

      progressTimeout = setTimeout(sendNewMessage, newLine[0])
    });
  }
  	

   k.send({
    counter: counter,
    c: twit
  })
}

});
// ########## END SEND


// ######### CREATOR
// outfilename = "samples/piloted_variable_1.txt"
// var isFast = false
// var counter = 1

// lineReader.eachLine('samples/twitter_sample_51.txt', function(line) {
//   var ms = isFast ? 3 : 50
//   var tweet = (line.split(","))[1]
//   var s = ms + "," + tweet + '\n'
//   // console.log(line)

//   fs.appendFileSync(outfilename, s, encoding='utf8', function(err) {
//     if(err) {
//       console.log(err);
//     }
//   });

//   counter++
//   if(counter % 500 == 0) {
//     isFast = !isFast
//     k.log(counter)
//   }

//   if(counter == 99801) {
//     finished = true
//     k.log(finished)
//   }
// }).then(function () {
//   console.log("I'm done!!");
// });

// // lineReader.open('samples/twitter_sample_51.txt', function(reader) {
// //   k.warn('Started')
// //   fileReader = reader
// //   fileOpened = true

// //   finished = false

// //   while(reader.hasNextLine()) {
// //     // console.log(counter)
// //     reader.nextLine(function(line) {
// //       k.warn('Inside line')
// //       var ms = isFast ? 5 : 40
// //       var tweet = (line.split(","))[1]
// //       var s = ms + "," + tweet + '\n'
// //       console.log(line)

// //       fs.appendFileSync(outfilename, s, encoding='utf8', function(err) {
// //         if(err) {
// //           console.log(err);
// //         }
// //       });

// //       counter++
// //       if(counter % 5000 == 0) {
// //         isFast = !isFast
// //         k.log(counter)
// //       }

// //       if(counter == 99801) {
// //         finished = true
// //         k.log(finished)
// //       }
// //     });
// //   }
// // })

// ######### END CREATOR

k.log("a1 started");


