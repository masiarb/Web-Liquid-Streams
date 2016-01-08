var mc = require('mc');
var debug = require('debug')
var log = debug('wls:davide')

var redis = require("redis"),
    rds_cli = redis.createClient(6379, 'agora.mobile.usilu.net');

rds_cli.on("error", function (err) {
    console.log("error event - " + rds_cli.host + ":" + rds_cli.port + " - " + err);
});

/**
* Add an element to a list associated with a particular key and a score that
* will be used to sort the list. If the list name does not exist it will create
* a list and create the given key with the associated score.
*
* @method addToSortList
* @param {List} ['zsetName', score, key]
*/
exports.addToSortList = function(args) {
  rds_cli.zadd(args, function(err, response) {
    if(err) throw err;
    //console.log('added ' + response + ' items.');
  })
}

exports.incrBySortList = function(setName, incr, key) {
  rds_cli.zincrby(setName, incr, key, function(err, response){
    if(err) throw err;
    //console.log('incremented ' + response);
  })
}

exports.getRangeSortList = function(setName, start, end, withScore){
  if(!withScore) {
    rds_cli.zrevrange(setName, start, end, function(err, response) {
      if(err) throw err;
      console.log(response);
    })
  }else{
    rds_cli.zrevrange(setName, start, end, 'WITHSCORES', function(err, response) {
      if(err) throw err;
      console.log(response);
    })
  }
}
