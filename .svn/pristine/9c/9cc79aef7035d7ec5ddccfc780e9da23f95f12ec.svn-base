var k = require('./../k_globals/koala.js');
var fs = require('fs');
//necessary to create Node?
k.createNode(function(msg, uid) {
	var towrite = msg.tw+',\n';
	fs.appendFile('benchTweet.txt', towrite, function (err) {
	    if (err) console.log("error writing file");
	  });
	k.done();
});

