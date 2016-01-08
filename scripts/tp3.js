var k = require('./../k_globals/koala.js')
var Twitter = require('twitter');
var emojiStrip = require('emoji-strip');
var countHashtags = 0
var client = new Twitter({
    consumer_key: 'qbU7JHd4Mc2XlIwxxWLWaoyPc',
    consumer_secret: 'KR2qasaCQmAak4zoaEr7OaCzyuihpcr2gCtPOvfYPT4uzeYBhA',
    access_token_key: '215976459-mFAFsaBY1cGWAi3ikJ0nQZooKjoClx3zlxbxjcgS',
    access_token_secret: '4IPgZo6F7UbNS3iueF01oVbikANLhLLQZUOjGodX3eclu'
});

client.stream('statuses/filter', {track:'the', language: 'en'},  function(stream){
  stream.on('data', function(tweet) {
    // console.log(tweet.text);
    if(!k.isBinded())
    	return
    	
    if(!tweet.text) return
    var twit = tweet.text.replace(/(https?:\/\/[^\s]+)/g, '');
    //remove emoji
    twit = emojiStrip(twit);
    //remove new lines
    twit = twit.replace(/(\r\n|\n|\r)/gm,"");
    //remove mentions
    twit = twit.replace('/(\s+|^)@\S+/',"");
    //remove all special char
    twit = twit.replace(/[^\w\s]/gi, '');
    //remove numbers
    twit = twit.replace(/\d+/g,'');
    //trim white spaces
    twit = twit.trim();
    // to lowercase
    twit = twit.toLowerCase();
    
    if(!twit) return
    
    var m = {
    			tw: twit
    		}
    k.send(m);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
