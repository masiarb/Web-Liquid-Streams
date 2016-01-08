var k = require('./../k_globals/koala.js')
var Twitter = require('twitter');
var fs = require('fs');

var client = new Twitter({
    consumer_key: 'qbU7JHd4Mc2XlIwxxWLWaoyPc',
    consumer_secret: 'KR2qasaCQmAak4zoaEr7OaCzyuihpcr2gCtPOvfYPT4uzeYBhA',
    access_token_key: '215976459-mFAFsaBY1cGWAi3ikJ0nQZooKjoClx3zlxbxjcgS',
    access_token_secret: '4IPgZo6F7UbNS3iueF01oVbikANLhLLQZUOjGodX3eclu'
});

/*
 *  Save tweets
 */

// var random_minute = new Date().getMinutes()
// var filename = "samples/nytimes/" + random_minute + ".txt";

// fs.appendFileSync(filename, "[", encoding='utf8', function(err) {
//     if(err) {
//       console.log(err);
//     }
//   });

// client.stream('statuses/filter', {follow: '807095',language: 'en'},  function(stream){
//   stream.on('data', function(tweet) {
//     k.log('New message')
//   	// var t = JSON.parse(tweet)
//   	// console.log(tweet.user.screen_name)

//   	if(tweet.user.screen_name == 'nytimes') {
//     	fs.appendFileSync(filename, JSON.stringify(tweet) + ",", encoding='utf8', function(err) {
// 	    if(err) {
// 	      console.log(err);
// 	    }
// 	  });
//   	}
//   })
// })

// k.log("ICWE producer started");




/*
 *  Read tweets
 */

var filename = 'samples/nytimes/all.txt'
var lineReader = require('line-reader');

lineReader.open(filename, function(reader) {
  reader.nextLine(function(line){
    var array = JSON.parse(line)

    sendTweets(array)    
  })
})

var sendTweets = function(tweets) {

  var counter = 0

  var sendOne = function() {
    k.send({
      c: counter,
      t: tweets[counter]
    })

    counter++
  }


  var i = setInterval(sendOne, 5000)
}