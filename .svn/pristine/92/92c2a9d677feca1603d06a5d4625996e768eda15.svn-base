var k = require('./../k_globals/koala.js')
var http = require('http')

var Twitter = require('twitter');


var client = new Twitter({
    consumer_key: 'qbU7JHd4Mc2XlIwxxWLWaoyPc',
    consumer_secret: 'KR2qasaCQmAak4zoaEr7OaCzyuihpcr2gCtPOvfYPT4uzeYBhA',
    access_token_key: '215976459-mFAFsaBY1cGWAi3ikJ0nQZooKjoClx3zlxbxjcgS',
    access_token_secret: '4IPgZo6F7UbNS3iueF01oVbikANLhLLQZUOjGodX3eclu'
});

var places = ["Iran", "Houston", "Malaysia"]

k.createNode(function(msg, uid, options) {
	console.log(msg)

	var color = msg.color
	var id = msg.s.id_str

	console.log('New tweet request')

	client.get('statuses/retweets', {id:id, count: 20}, function(error, tweets, repsonse){
		if(!error) {
			for(var i = 0; i < tweets.length; i++) {
				var tweet = tweets[i]
				var location = tweet.user.location

				if(location != ""){
					sendRequest(location, {m: undefined, t:tweet, color:color})
				}
			}
		}
	})

	// k.send({
	// 	c: undefined,
	// 	t: undefined,
	// 	color: undefined,
	// 	location: undefined 
	// })
})

var sendRequest = function(name, msg){

	var options = {
		host: "api.geonames.org",
		path: '/searchJSON?username=agallidabino&maxRows=1&name=' + name,
	}

	var req = http.get(options, function(res) {
		var str = ''
		res.on('data', function (chunk) {
	 		str += chunk;
	 	});

		res.on('end', function () {
			 k.send({
				c: msg.c,
				t: msg.t,
				color: msg.color,
				location: JSON.parse(str),
				user: true
			}) 
		});
	})
}

k.log('ICWE filter2 started')