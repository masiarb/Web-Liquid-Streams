var k = require('./../k_globals/koala.js')
var Twitter = require('twitter');
var countHashtags = 0
var client = new Twitter({
    consumer_key: 'qbU7JHd4Mc2XlIwxxWLWaoyPc',
    consumer_secret: 'KR2qasaCQmAak4zoaEr7OaCzyuihpcr2gCtPOvfYPT4uzeYBhA',
    access_token_key: '215976459-mFAFsaBY1cGWAi3ikJ0nQZooKjoClx3zlxbxjcgS',
    access_token_secret: '4IPgZo6F7UbNS3iueF01oVbikANLhLLQZUOjGodX3eclu'
});

client.stream('statuses/filter', {track: 'twitter',language: 'en'},  function(stream){
  stream.on('data', function(tweet) {
    // console.log(tweet.text);
    if(!k.isBinded())
    	return
    	
    if(!tweet.text) return
    var twit = tweet.text.replace(/(https?:\/\/[^\s]+)/g, '')
    //twit = twit.text.match(/#\S+/g); old regex
    twit = twit.match(/(#[a-z0-9][a-z0-9\-_]*)/ig);
    
    if(!twit) return
    
    twit.forEach(function(hashtag) {
    	var m = {
    		ht: hashtag.toLowerCase(),
    		ch: countHashtags
    	}
    	k.send(m)
    });
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
