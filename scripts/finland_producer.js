//import WLS
var k = require('./../k_globals/koala.js');

//sensor utilities
var glob = require('glob'),
   http = require('http'),
   fs = require('fs'),
   rpiDev = glob.sync('/sys/devices/w1_bus_master1/28-*/w1_slave')[0];

//fs.readFile(rpiDev)

//TO REMOVE:
var i = 0;

//create an interval that gets data from the environment every second
var envInterval = setInterval(function(){
	console.log("producer: sending temperature data");
	//get data from the sensor and send it (TODO)
	if( i > 10 && i < 20){
		k.send(
			{
				//temperature : fs.readFile(rpiDev),
				temperature : Math.random()*100,
				time : new Date().getTime(),
			});
	}
	else{
		k.send(
			{
				//temperature : fs.readFile(rpiDev),
				temperature : Math.random()*100,
				time : new Date().getTime(),
			});
	}
		i++;
}, 1000);