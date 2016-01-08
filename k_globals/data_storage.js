
var mc = require('mc');
var mc_cli = new mc.Client("127.0.0.1:11211");

var debug = require('debug')
var log = debug('wls:davide');

mc_cli.connect(function() {
	log('@@@ Memcache connected to server')
})
/* 
	@author: Davide Nava
	@param key: key used for memcached storage
	@param value: value that is stored with the given key
	Test method for memcached store functionality. 
*/ 
var putState = function(key,value) {
	// mc_cli.connect(function() { // connect to memcached
		//log('Connected to the localhost memcached');
		mc_cli.set(key, value, {flags:0, exptime:0},function(err,status) { //try to update value
			if(!err) { //value stored
				//log("putState says::" + status);
			}else{
				addState(key, value);
			}
		});
	// });
}

var addState = function(key, val){
	// mc_cli.connect(function(){
		mc_cli.add(key, val, {flags:0, exptime:0},function(err,status){ // add new value
			if(!err) {
				//log("addState::"+status); // value stored
			}else {
				//log("addState::"+JSON.stringify(err)); // NOT STORED, NOT FOUND, EXISTS
			}
		});
	// })
}
/* 
	@author: Davide Nava
	@param key: the key used for data retrival
	Test method for memcached load data functionality. 
*/
exports.getState = function(key) {
	// mc_cli.connect( function(){
		mc_cli.get(key, function(err,response){
			if(!err){
				//log(response[key]+' with key::'+key);
			}
		});
	// });
}

exports.increment = function(key, increment) {
	// mc_cli.connect(function() {
		mc_cli.incr(key, increment, function(err, value) {
			if (!err) {
				//log("Increment :: key::"+key+" value::"+value);
			}else {
				if(err.type == 'NOT_FOUND'){
					addState(key,1);
					//log("Increment: Created entry for key " + key);
				}else{
					if(err.type == 'CLIENT_ERROR'){
						//log("Increment: value not numeric");
					}else {
						//log("Increment"+JSON.stringify(err)+"::StoringKEY::"+key);
					}
				}
			};
		});
	// });
}

exports.statistics = function(){
	mc_cli.stats( 'items', function(err, stats) {
	  		if (!err) {
	    		log("STATS:::"+JSON.stringify(stats));
	    		mc_cli.stats('cachedump', 1 , function(err, stats){
	    			if(!err){
	    				log("CACHEDUMP:::"+JSON.stringify(stats));
	    			}else{
	    				log("ERRROR-CACHEDUMP FAILED::"+err);
	    			}
	    		})
	    		// [ { slabs: [ , { number: <items>, age: <age>, ... etc. } ] } ]
	    		// Note that slabs is a one-based array.
	  		}else {
	  			console.log("ERRSTATS::"+err);
	  		}
		});
}
exports.putState = putState;
exports.addState = addState;