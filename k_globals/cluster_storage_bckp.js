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

//exports.set = function(key, value, cb) {
//	client.set(key,value)(function(error,res){ 
//		if(error) throw error;  
//		if(typeof cb == "function") { 
//			cb(res); 
//		} 
//	});
//}

exports.set = function(key, value, cb) {
	if(isJSON(value)){
		var cumulativeRes = [];
		var f = flatten(value);
		for(entry in f){
	        client.hset(key,entry,f[entry], function(error,res){
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

exports.incr = function(key, cb) {
	client.incr(key)(function(err, response){
		if(err) throw err;
	    if(typeof cb == "function") {
	    	cb(response);
	    }
	})
}

exports.decr = function(key, cb) {
	client.decr(key)(function(err, response){
		if(err) throw err;
	    if(typeof cb == "function") {
	    	cb(response);
	    }
	})
}

exports.addToSortList = function(args, cb) {
  /*client.zadd(args)(function(err, response) {
  	  console.log(err, response);
	  if(err) throw err;
	  if(typeof cb == "function") {
	    cb(response);
	  }
  });*/
  client.zadd(args, function(err, res) {
  	console.log(err, res);
  	if (err) throw err
  	return res
  });
}


exports.incrBySortList = function(setName, incr, key, cb) {
  client.zincrby(setName, incr, key)(function(err, response){
    if(err) throw err;
    if(typeof cb == "function") {
    	cb(response);
    }
  })
}

exports.getRangeSortList = function(setName, start, end, withScore, cb){
  var sortedlist = [];
  
  if(!withScore) {
    client.zrevrange(setName, start, end)(cb);
  }else{
    client.zrevrange([setName, start, end, 'WITHSCORES'], function(err, res){
    	console.log(err, res);
    	if(err) throw err;
    	cb(res);
    });
  }
}


exports.lpush = function(key, value, cb){
	  client.lpush(key, value)(function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}

exports.lrange = function(key, start, stop, cb){
	  client.lrange(key, start, stop)(function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}

exports.llen = function(key, cb){
	  client.llen(key)(function(err, response) {
		  if(err) throw err;
		  if(typeof cb == "function") {
		    cb(response);
		  }
	  });
}
exports.ltrim = function(key, start, stop, cb){
	  client.ltrim(key, start, stop)(function(err, response) {
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
        			 args = args.concat(client.zrevrange(arguments[i],0,9,"WITHSCORES")
                             (function(error,res){ return Thunk(res); }));
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

function merge(a, b) {
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

function recursiveMerge(c,answer){
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

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = Number(a[key]); var y = Number(b[key]);
        return -1*((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function isJSON(value) {
	var stringConstructor = "test".constructor;
	var arrayConstructor = [].constructor;
	var objectConstructor = {}.constructor;
	if (value.constructor === objectConstructor) {
        return true;
    }else{
    	return false;
    }
}
