var k = require('./../k_globals/koala.js');
//var emojiStrip = require('emoji-strip');

k.createNode(function(msg, uid) {
 	var str = msg.ht;
 	var ch = msg.ch;
 	var pt = "";
 	str = msg.ht.substring(1);
 	var ob = {
 		    key1: {
 		        keyA: 'valueI'
 		    },
 		    key2: {
 		        keyB: 'valueII'
 		    },
 		    key3: { a: { b: { c: 2} } }
 		};
 	//str = emojiStrip(str);
// 	var result = crc16(Buffer(str.charAt(0)));
// 	var modu = mod((result),3);
 	
 	//k.storage.incrBySortList('twitlist{'+uid+'}', 1, str, function(r){console.log("res State from consumer::"+r) });	
 	k.storage.set("foo",ob, function(r){console.log("SET::"+r) })
 	k.storage.get('foo', function(r){console.log("GOT::"+JSON.stringify(r)) })
//    console.log("stored in twitlist{"+uid+"}::" + str);
//    
//    if(modu == 0){
//    	k.storage.incrBySortList('modulo{bar}', 1, "modZERO");	
//    	k.storage.incrBySortList('testht1',1,str.charAt(0).toLowerCase())
//    }
//    if(modu == 1){
//    	k.storage.incrBySortList('modulo{bar}', 1, "modUNO");	
//    	k.storage.incrBySortList('testht2',1,str.charAt(0).toLowerCase())
//    }
//    if(modu == 2){
//    	k.storage.incrBySortList('modulo{bar}', 1, "modDUE");	
//    	k.storage.incrBySortList('testht3',1,str.charAt(0).toLowerCase())
//    }
//	if (str.match("^[A-Ia-i].*$")) {
//		k.storage.incrBySortList('twitlist{bar}', 1, str);		
//		pt = 'twitlist{bar}';
//	}
//	if (str.match("^[J-Rj-r].*$")) {
//		k.storage.incrBySortList('twitlist{ar}', 1, str);
//		pt = 'twitlist{ar}';
//	}
//	if (str.match("^[S-Zs-z].*$")) { 
//		k.storage.incrBySortList('twitlist{foo}', 1, str);
//		pt = 'twitlist{foo}';
//	}
	var m = {
		ht: str,
		ch: ch,
		pt: pt
	}
	
	k.send(m);

 })
