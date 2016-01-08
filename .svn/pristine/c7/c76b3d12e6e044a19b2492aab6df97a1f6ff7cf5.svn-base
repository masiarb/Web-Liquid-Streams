var k = require('./../k_globals/koala.js')

k.createNode(function(msg, uid) {
	var ti = msg.t;
  k.storage.addToSortList(['mylist', 10, "ciao"]);
  k.storage.addToSortList(['mylist', 10, "pio", 20, "zio"]);
  k.storage.incrBySortList('mylist', 30, "ciao");
  k.storage.getRangeSortList('mylist', 0 , -1);
  k.storage.getRangeSortList('mylist', 0 , -1, true);
 	k.send(msg);

})

console.log("Filter:FORWARD");
