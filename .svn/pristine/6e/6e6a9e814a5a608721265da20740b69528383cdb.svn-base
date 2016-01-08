var k = require('./../k_globals/koala.js')

var name = "a2"
importScripts("http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/tripledes.js")

k.createNode(function(msg, uid, options) {
//	console.log(msg)

	// msg.filter = new Date().getTime()

	// for(var i = 0; i < 100000000; i++) {

	// }
	var count = {}
	var c = undefined
	if(msg.c != undefined) {
		var text = msg.c

		// console.log(text)

		var words = separate(text)
		count = countWord(words)

		c = CryptoJS.TripleDES.encrypt(text, "Secret Passphrase");
		c = c.toString()
	} 

	k.send({
		counter: msg.counter,
		table: count,
		c: c
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

 // console.log("a2 started");
