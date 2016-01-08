	var k = require('./../k_globals/koala.js')
var Twitter = require('twitter');
var fs = require('fs');

var random_minute = new Date().getMinutes()
var filename = "samples/bench_tweet_" + random_minute + ".txt";

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
var iterations = 1;
//var string = "abcdeabcasdasdfasdfa";
//for (var i = 0; i < iterations; i++) {
//	  string += string+string;
//	}
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
	  if(!k.isBinded() || !fileOpened || counter > 50000)
	    return
	
	  clearInterval(startInterval)
	  startInterval = undefined
	
	  k.warn('started');

		
	  twit = (firstLine.split(','))[1]
	  //twit = string;
		
	  if (fileReader.hasNextLine()) {
	    fileReader.nextLine(function(line) {
	      newLine = line.split(",")
	      newLine[0] = parseInt(newLine[0], 10)/2
	      //newLine[0] = 1;
	      progressTimeout = setTimeout(sendNewMessage, newLine[0])
	    });
	  }
	  var d = new Date();
	  k.send({
	    counter: counter,
	    c: twit
	  })
	
	},100);
	
	var sendNewMessage = function() {
  counter++
  if(!k.isBinded() || !fileOpened || counter > 50000)
    return

    var twit = newLine[1]
    //var twit = string;
  if (fileReader.hasNextLine()) {
    fileReader.nextLine(function(line) {
//      console.log(line);
      newLine = line.split(",")
      newLine[0] = parseInt(newLine[0], 10)/2
      //newLine[0] = 1;
      progressTimeout = setTimeout(sendNewMessage, newLine[0])
    });
  }
  
   k.send({
    counter: counter,
    c: twit
  })
}

});


k.log("a1 started");


