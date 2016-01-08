var k = require('./../k_globals/koala.js')
var http = require('http')

var places = ["Iran", "Houston", "Malaysia"]

k.createNode(function(msg, uid, options) {
	var text = msg.t.text
	var words = text.split(" ")

	for(var i = 0; i < words.length; i++) {
		if(places.indexOf(words[i]) != -1) {
			sendRequest(words[i], msg)
			break;
		}
	}
})

var sendRequest = function(name, msg){
	k.log('Filter new message')

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
				color: getRandomColor(),
				location: JSON.parse(str) 
			}) 
		});
	})

	// console.log(name)
}

var getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

k.log('ICWE filter started')