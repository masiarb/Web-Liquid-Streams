var k = require('./../k_globals/koala.js')

var name = "a2"

k.createNode(function(msg, uid, options) {
//	console.log(msg)

	// msg.filter = new Date().getTime()

	// for(var i = 0; i < 100000000; i++) {

	// }
	var text = msg.c

	var words = separate(text)
	//var count = countWord(words)
//	k.stateful.incrBySortList('globalCount', 1, 'msg');
//	k.stateful("incrBySortList", "globalCount",1,'msg');
//	k.stateful("incrBySortList", ['globalCount', 1, 'msg'])
	//k.stateful.set("footest","bar",function(res){console.log(res)});
	//k.stateful.get("footest",function(res){console.log(res)});
	//k.stateful.incr("incrtest", function(res){console.log(res)});
	//k.stateful.decr("incrtest", function(res){console.log(res)});
//	words.forEach(function(entry) {
//		k.stateful("incrBySortList", ['twitlist', 1, entry]);
//	});
	k.stateful.getMergedSortList(["twitlist{0}","twitlist{1}","twitlist{2}"], function(res){console.log(res)}); 
	k.send({
		counter: msg.counter
//		table: count
	}, options);
});  

function separate(s){
	s = s.replace(/(^\s*)|(\s*$)/gi,"");
	s = s.replace(/[ ]{2,}/gi," ");
	s = s.replace(/\n /,"\n");
	return s.split(' ')
}

function countWord(w) {
	var table = {}

	for(var i in w) {
		if(table[w[i]] == undefined)
			table[w[i]] = 1
		else
			table[w[i]]++
	}

	return table
}

 console.log("a2 started");
