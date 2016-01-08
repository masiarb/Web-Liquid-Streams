var k = require('./../k_globals/koala.js')

k.createNode(function(stream) {
	r = JSON.parse(stream)
	temp_hum_package = JSON.parse(r.data)
	k.notifyPage(temp_hum_package);
	console.log(temp_hum_package)
	k.send("", "send_LB", true);	

});




console.log("consumer started");