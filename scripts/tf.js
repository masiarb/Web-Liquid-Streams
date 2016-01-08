var k = require('./../k_globals/koala.js')

k.createNode(function(msg, uid) {
 	var str = msg.tw;
 	var ct = msg.ct;
	console.log("completed with filter UID::"+uid+" msg "+ JSON.stringify(msg));

 	//var str = "#Ciao #sono #un #bellissimo #tweet #e #per #questo #verrò# memorizzato #in #redis"
 	if(typeof str !== "undefined"){
	   	//str = str.replace(/(https?:\/\/[^\s]+)/g, ''); //remove URL in the tweet
	   	//console.log(str)
	   	//str = str.replace(/@+\w*/g, ""); //remove mentions
	   	//console.log(str)
	   	//str = str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,''); //remove special characters
	   	//console.log(str)
	   	//str = str.trim()

	   	//str = str.replace(/\s{2,}/g, ' '); //remove double spaces
	   	//console.log(str)
	   	//str = str.replace(/RT+\s/g, ''); //remove string RT from tweet
	   	//console.log(str)
	   	//str = str.replace(/\r?\n|\r/g, '') //remove new line and caret
	   	//console.log(str);
	   	//append tweet to file
	   	//str = str+'\n';
	   	//fs.appendFile('./scripts/tweets.txt', str, function (err) {
	   	//	if (err) throw err;
	   	//	console.log("TWEET::"+ct);
		//});
		//str = str.split(" ");
		
	 	var m = {
	    	tw: str
	    }
	 	console.log("message from filter::"+m.str);
    //console.log(str);
		if(str !== null){
			for (index = 0; index < str.length; index++) {
	    			//k.storage.increment(JSON.stringify(str[index]),1)
        			var c = str[index].charAt(1);
				if (c.match("^[A-Ia-i].*$")) {
					k.storage.incrBySortList('twitlist{bar}', 1, str[index]);		
				}
				if (c.match("^[J-Rj-r].*$")) {
					k.storage.incrBySortList('twitlist{ar}', 1, str[index]);
				}
				if (c.match("^[S-Zs-z].*$")) { 
					k.storage.incrBySortList('twitlist{foo}', 1, str[index]);
				}
				//k.storage.incrBySortList('twitlist', 1, str[index]);
	    			//console.log("::into filter" + str[index]);
			}
		}

		k.send(m);
	}
 })
