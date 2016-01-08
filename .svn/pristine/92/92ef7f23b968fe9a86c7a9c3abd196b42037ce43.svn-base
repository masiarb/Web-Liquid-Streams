var k = require('./../k_globals/koala.js')
//var fs = require('fs');
var number = 0;
var myCb = "function cb(){var canvas = document.getElementById('canvas');  var ctx = canvas.getContext('2d'); var image = new Image(); image.src = worker.states[event.data.state]; image.onload = function() {ctx.drawImage(image, 0, 0, 320, 240); document.getElementById('test').innerHTML = 10}}"

var pkg = {"ID": 0, "States" : ["imgData"], "values":[0], "cb": myCb , "isSetState":"True"};
k.setState(pkg)

k.createNode(function(stream, uid) {

	imgData = JSON.parse(JSON.parse(stream).data).data;
	//streamValue = JSON.parse(stream).data

	//console.log(JSON.parse(stream));
	//var res = JSON.parse(msg.data);
	//console.log("received msg with id " + res.id + " and im uid " + uid);
	/*fs.appendFileSync("received.txt", res.id + "\n", encoding='utf8', function(err) {
    	if(err) {
        	console.log(err);
    	}
	});*/
	var newPkg = {"States" : "imgData", "Values":[imgData] ,"isSetState":"True"};

	
	//stream_receiver(JSON.parse(JSON.parse(stream).data.data).data);
	k.setState(newPkg);
	k.send("", "send_LB", true);	

});




console.log("consumer started");