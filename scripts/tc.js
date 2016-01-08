var k = require('./../k_globals/koala.js');

//necessary to create Node?
k.createNode(function(msg, uid) {
	//var t = msg.tw;
	//k.getState(tg);
	//k.storage.getState;
	 var interval = setInterval(function(){
		//k.storage.getMergedSortList("twitlist{foo}","twitlist{bar}","twitlist{ar}"); 
	},5000);
	 console.log("got to consumer from "+JSON.stringify(msg));
	k.done();
});


console.log("Consumer started");
