var k = require('./../k_globals/koala.js')
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'qbU7JHd4Mc2XlIwxxWLWaoyPc',
    consumer_secret: 'KR2qasaCQmAak4zoaEr7OaCzyuihpcr2gCtPOvfYPT4uzeYBhA',
    access_token_key: '215976459-mFAFsaBY1cGWAi3ikJ0nQZooKjoClx3zlxbxjcgS',
    access_token_secret: '4IPgZo6F7UbNS3iueF01oVbikANLhLLQZUOjGodX3eclu'
});

client.stream('statuses/filter', {track: 'twitter',language: 'en'},  function(stream){
  stream.on('data', function(tweet) {
    // console.log(tweet.text);
    var m = {
    	tw: tweet.text;
    }
    k.send(m);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});