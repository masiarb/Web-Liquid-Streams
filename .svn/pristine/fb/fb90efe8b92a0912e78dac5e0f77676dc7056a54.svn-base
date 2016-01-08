var k = require('./../k_globals/koala.js');




k.createNode(function(value){

	temp_hum_package = JSON.parse(value.data)
	temp_hum_package["from"] = value.from
	temp_hum_package = JSON.stringify(temp_hum_package)
	k.send(temp_hum_package, "send_LB")
	console.log(temp_hum_package)

}).start();


console.log("filter started")