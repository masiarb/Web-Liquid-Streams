var k = require('./../k_globals/koala.js')
	
	var oldAvg = 0; 
	var newAvg = 0;
	var winSize = 10;
k.createNode(function(msg, uid, options){
	var entry = Math.floor((Math.random() * 100) + 1);

    k.stateful.get("average", function(res){ oldAvg = Number(res)});

    //push the entry from head of the list
  	k.stateful.lpush("window", entry);
  	
  	//compute the new average (traveling average)

  	newAvg = oldAvg + ((entry - oldAvg)/winSize);
  	console.log("oldAvg::"+oldAvg+"::newAvg::"+newAvg);
  	//store the new average
  	k.stateful.set("average", newAvg);
  	
  	//trim the list to be 10 elements (drop element in tail)
  	k.stateful.ltrim("window", 0, winSize-1);
  	
  	//k.stateful.lrange("window", 0, (winSize-1), function(res){console.log(res)});
  	
	k.send({
		counter: msg.counter
	}, options);
})