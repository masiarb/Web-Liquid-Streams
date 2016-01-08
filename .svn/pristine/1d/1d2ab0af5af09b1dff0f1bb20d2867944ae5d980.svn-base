//var exec = require("child_process").execFile;
var DHTReader = require('./../native_modules/DHT_module/build/Release/DHTReader');
 var k = require('./../k_globals/koala.js')


setInterval(function() {


	while( (temp_hum_package = DHTReader.readDHT()) == 1){}
	
			temp_hum_package = JSON.stringify(temp_hum_package)
			k.send(temp_hum_package, 'send_LB');
			console.log(temp_hum_package)


	  }, 3000);