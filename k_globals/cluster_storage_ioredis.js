var debug = require('debug');
var log = debug('wls:davide');
var redis = require('ioredis');
var client = new Redis.Cluster([{
    port: 7001,
    host: '127.0.0.1'
},
{
    port: 7002,
    host: '127.0.0.1'
}]);

exports.get = function(key) {
    client.get(key);
}

exports.calcSlot = function(str){
	return redis.calcSlot(str);
}
exports.addToSortList = function(args) {
  client.zadd(args, function(err, response) {
    if(err) throw err;
    //console.log('added ' + response + ' items.');
  })
}

exports.incrBySortList = function(setName, incr, key) {
  client.zincrby(setName, incr, key)(function(err, response){
    if(err) throw err;
    //console.log('incremented ' + response);
  })
}

exports.getRangeSortList = function(setName, start, end, withScore){
  var sortedlist = [];

  if(!withScore) {
    client.zrevrange(setName, start, end);
  }else{
    return client.zrevrange(setName, start, end, 'WITHSCORES', function(error, res){ return res });
  }
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
//                                console.log(recursiveMerge(work,answer).slice(0,10));
                                
                                console.log(this)
                                
                                states['twitlist'] = recursiveMerge(work,answer).slice(0,10)
                                
                                if(typeof cb == "function") {
                                	cb()
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
