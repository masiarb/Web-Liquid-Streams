var debug = require('debug');
var log = debug('wls:davide');
var flatten = require('flat');
var unflatten = require('flat').unflatten;
var redis = require('redis');
//var redis = require('thunk-redis');
var Thunk = require('thunks')();

var client = redis.createClient();
//var client = redis.createClient([{host: '195.176.181.55', port: 6379}]);

var states = {}
exports.calcSlot = function(str){
	return redis.calcSlot(str);
}

/*
	Getter and setters without stringifying.
*/
exports.plainSet = function(key, value, cb){
	client.set(key,value, function(error,res){ 
		if(error) throw error;  
		if(typeof cb == "function") { 
				cb(res); 
		} 
	});
}

exports.plainGet = function(key, cb){
	client.get(key, function(error,res){
    	if(typeof cb == "function") { 
    		cb(res); 
    	} 
    });
}

/*
	Sets a value at a given key. 
	If the key previously stored a value of another type (i.e., trying
	to save a string on top of an integer), redis will throw an error.
	
	@param {string} key   : The key onto where to save the value.
	@param {Object} value : The value to store (can be of any kind).
	@param {Function} cb  : The callback function to be called. 
*/
exports.set = function(key, value, cb) {
	if(isJSON(value)){
		var cumulativeRes = [];
		var f = flatten(value);
		for(entry in f){
	        client.hset(key, entry, f[entry], function(error,res){
	                if(error) throw error;
	                cb(res);
	        });
		}
	}else{
		client.set(key,value, function(error,res){ 
			if(error) throw error;  
			if(typeof cb == "function") { 
				cb(res); 
			} 
		});
	}
	
}

/*
	Gets the value stored at a given key.
	
	@param {string} key   : The key that holds the value we are interested into.
	@param {Function} cb  : The callback function to be called. 
*/
exports.get = function(key, cb) {
	client.type(key, function(error,res){
		//console.log(error,res);
        if(error) throw error;
        var keyType = res;
        if(keyType === "hash"){ //the retrieved key match to an hash
    		client.hgetall(key, function(error,res){
                if(error) throw error;
                var u = unflatten(res);
                cb(u);
    		});
    	}else{ //the retrived key match to a string
    		client.get(key, function(error,res){ 
    			//console.log(key, error, res);
    			if(typeof cb == "function") { 
    				cb(res); 
    			} 
    		});
    	}
	});
	
}

/*
	Increments the value stored at the key. If there is no value at the given key,
	incr will behave as if 0 was stored. If a value which is not an integer is stored
	at the key, an error will be thrown.
	
	@param {string} key   : The key that holds the value we want to increment.
	@param {Function} cb  : The callback function to be called. 
*/
exports.incr = function(key, cb) {
	client.incr(key, function(err, response){
		if(err) throw err;
	    if(typeof cb == "function") {
	    	cb(response);
	    }
	})
}

/*
	Decrements the value stored at the key. If there is no value at the given key,
	decr will behave as if 0 was stored. If a value which is not an integer is stored
	at the key, an error will be thrown.
	
	@param {string} key   : The key that holds the value we want to decrement.
	@param {Function} cb  : The callback function to be called. 
*/
exports.decr = function(key, cb) {
	client.decr(key, function(err, response){
		if(err) throw err;
	    if(typeof cb == "function") {
	    	cb(response);
	    }
	})
}

/*
	Adds the specified members with the specified scores in a sorted set stored at key.
	The args array should contain a score with a member, for example [1, "uno", 2, "due"]
	where the strings are the members and their preceeding number is their score. This is 
	stored in a sorted list at the given key which updates each time a new member with a new
	score is added.
	Remember to JSON.stringify() any object that you want to store in the sorted list, and to
	JSON.parse() when these objects are retrieved.
	
	@param {string} setName  : The key that holds the sorted list.
	@param {array} args      : The array of the form [score1, member1, score2, member2, ...] to be stored.
	@param {function} cb     : The callback function to be called.
*/
exports.addToSortList = function(setName, args, cb) {
  args.unshift(setName)
  client.zadd(args, function(err, res) {
  	if (err) throw err
  	if(typeof cb == "function") {
	    cb(res);
	}
  });
}

/*
	Returns the content of the sortlist stored with addToSortList function. If the scores
	are to be displayed, the results are printed in a member, score, member, score... fashion
	going from the highest score to the lowest score. If the scores are not to be displayed, 
	the results will be printed with members only, showing from the highest scored member to
	the lowest scored member.
	If you previously stored objects inside the sorted list, remember to JSON.parse() them
	before reading them.
	
	@param {string} setName : The name of the set to be returned.
	@param {integer} start  : The start of the range to display the results.
	@param {integer} end    : The end of the range to display the results (-1 goes until the end).
	@param {bool} withScore : Boolean variable to tell the function if the scores are to be returned in the result.
	@param {function} cb    : The callback function to be called.
*/
exports.getRangeSortList = function(setName, start, end, withScore, cb){
  var sortedlist = [];
  
  if(!withScore) {
    client.zrevrange(setName, start, end, function(err, res){
    	if(err) throw err;
    	cb(res);
    });
  }else{
    client.zrevrange([setName, start, end, 'WITHSCORES'], function(err, res){
    	if(err) throw err;
    	cb(res);
    });
  }
}

/*
	Increments by the given value the value associated with the given key in the given sorted list name.
	
	@param {string} setName : The name of the set where the value has to be incremented.
	@param {integer} incr   : The increment for the given key.
	@param {string} key     : The key whose value has to be incremented.
	@param {function} cb    : The callback function to be called.
*/
exports.incrBySortList = function(setName, incr, key, cb) {
  client.zincrby(setName, incr, key, function(err, response){
    if(err) throw err;
    if(typeof cb == "function") {
    	cb(response);
    }
  })
}


/*
	Pushes the value in the *fist* place of the list named key.
	If you are pushing an Object, and not a primitive, be sure to JSON.stringify()
	it before saving it, and to JSON.parse() it when reading it.
	
	@param {string} key   : The name of the list that has to receive the value.
	@param {Object} value : The value to be pushed in the first slot of the list.
	@param {function} cb  : The callback function to be called.
*/
exports.lpush = function(key, value, cb){
	  client.lpush(key, value, function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}

/*
	Reads the list named key, from position start to position stop.
	If you previously stored objects (and not primitives), be sure to JSON.parse()
	them before reading/printing/sending them.
	
	@param {string} key     : The name of the set to be returned.
	@param {integer} start  : The start of the range to display the results.
	@param {integer} stop   : The end of the range to display the results (-1 goes until the end).
	@param {function} cb    : The callback function to be called.
*/
exports.lrange = function(key, start, stop, cb){
	  client.lrange(key, start, stop, function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}

/*
	Returns the length of the list.
	
	@param {string} key  : The name of the list.
	@param {function} cb : The callback function to be called.
*/
exports.llen = function(key, cb){
	  client.llen(key, function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}

/*
	Trims the list stored at key and returns only the elements in the interval
	[start, stop]. Keep in mind that the list is zero-based.
	
	@param {string} key    : The name of the list.
	@param {integer} start : The start position of the interval to trim.
	@param {integer} stop  : The final position of the interval to trim.
	@param {function} cb   : The callback function to be called.
*/
exports.ltrim = function(key, start, stop, cb){
	  client.ltrim(key, start, stop, function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}


exports.getMergedSortList = function(cb){
		var cb 
        var args = [];
        for (var i= 1; i<arguments.length; i++){
        		if(typeof arguments[i] == 'function') {
        			cb = arguments[i]
        		} else {
        			 args = args.concat(client.zrevrange(arguments[i],0,9,"WITHSCORES", function(error,res){ return Thunk(res); }));
        		}
        }

        client.zrevrange(arguments[0],0,9,"WITHSCORES")
                        (function(error,res){
                                return Thunk.all([
                                         res,
                                         args
                                       ]);
                        })(function(error,res){
                                var work = [];
                                var answer = [];
                                work[0] = splitSortListInCouple(res[0]);
                                for (var i= 0; i<res[1].length; i++) work.push(splitSortListInCouple(res[1][i]));
                                
                                var state = recursiveMerge(work,answer).slice(0,10)
                                if(typeof cb == "function") {
                                	cb(state);
                                }
                        })
}

var merge = function(a, b) {
    var answer = [];
    while (a.length && b.length)
    {
        if (Number(a[0][1]) > Number(b[0][1])) answer.push(a.shift());
        else answer.push(b.shift());
    }
    if (a.length) answer = answer.concat(a);
    if (b.length) answer = answer.concat(b);

    return answer;
}

var recursiveMerge = function(c, answer){
    if(!c.length) return answer
    else return recursiveMerge(c,merge(c.shift(),answer))
}

var splitSortListInCouple = function() {
        var workarray = arguments[0];
        var temparray = [];
        var i,j,chunk = 2;

        for (j=0,k=workarray.length; j<k; j+=chunk) {
                var curChunk = workarray.slice(j,j+chunk);
                temparray.push(curChunk);
        }
        return temparray;
}


var mergeAndSortList = function() {
        var workarray = [];
        var temparray = [];
        var i,j,chunk = 2;

        for (var i=0; i<arguments[0].length; i++) workarray = workarray.concat(arguments[0][i]);

        for (j=0,k=workarray.length; j<k; j+=chunk) {
                var curChunk = workarray.slice(j,j+chunk);
                temparray.push(curChunk);
        }
        return sortByKey(temparray,1).slice(0,10);
}

/*
	
*/
var sortByKey = function(array, key) {
    return array.sort(function(a, b) {
        var x = Number(a[key]); var y = Number(b[key]);
        return -1*((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/*
	[INTERNAL FUNCTION]
	Returns a boolean indicating if the the passed value is a JSON or not.
	
	@param {object} value : Parameter to be checked.
*/
var isJSON = function(value) {
	var stringConstructor = "test".constructor;
	var arrayConstructor = [].constructor;
	var objectConstructor = {}.constructor;
	if (value.constructor === objectConstructor) {
        return true;
    }else{
    	return false;
    }
}
