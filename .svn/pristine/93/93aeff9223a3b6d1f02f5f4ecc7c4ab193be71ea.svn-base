/**
 * RING-HEAD
 * Producer and consumer of the stream. Computes
 * data about the stream, namely the delay to
 * set up an Operator and the delay of the message
 * after the Operator has been set.
 */


var k = require('./../k_globals/koala.js');
var fs = require('fs');
var count = 0;

//hardcoded just for the sake of the experiment, never do this again :').
var nextCID = 2;
var nextWorkerUID = 2;
 
//interval to send the first message
var interval = setInterval(function() {
	if(!k.isBinded())
		return;
	
	if(count <= 0){
		var d = new Date().getTime();
		k.send(JSON.stringify({'timestamp': d}));
		count++;
		clearInterval(interval);
	}
 }, 1000);
 
 //receive data -> compute some parameter, send data again
 k.createNode(function(msg, uid) {
 	
 	var ts_message_arrived = new Date().getTime();
 	
	console.log(msg);
	
	//take out timestamp, check current, write on file
	var timeTaken = ts_message_arrived - JSON.parse(msg.data).timestamp;
	var delay_taken;
	fs.appendFileSync("count.txt", timeTaken + "\n", encoding='utf8', function(err) {
     	if(err) {
         	console.log(err);
     	}
      });
 	if(count >= 5){
 	
 		/*if(count >= 8){
 			//all done, only print
 			var all_migrated_ts = new Date().getTime();
 			
 			k.send(JSON.stringify({'timestamp': all_migrated_ts}));
 		}*/
 		
 		//to be commented if else uncommented
 		var all_migrated_ts = new Date().getTime();
 		k.send(JSON.stringify({'timestamp': all_migrated_ts}));
 		/*else {
	 		console.log("before k.migrateOperator");
	 		//move one operator at the time
	 		var before_migrating_operator = new Date().getTime();
	 		
	 		k.migrateOperator(--nextCID, "agora.mobile.usilu.net", function(){
	 			var after_migrating_operator = new Date().getTime();
	 			delay_taken = after_migrating_operator - before_migrating_operator;
	 			
	 			//save time of arrival
	 			fs.appendFileSync("add_delay.txt", delay_taken + "\n", encoding='utf8', function(err) {
			     	if(err) {
			         	console.log(err);
			     	}
			    });
	 			
	 			//call send, take time
	 			var after_migrating_operator = new Date().getTime();
	 			count++;
	 			k.send(JSON.stringify({'timestamp': after_migrating_operator}));
	 		});
 		}*/
 	}
 	
 	
 	
 	
 	
 	else{
 		console.log("before k.addOperator");
	 	//add a new operator -> take new timestamp
	 	var before_adding_new_operator = new Date().getTime();
	 	//api of addOperator: cid, script, workers, uids, automatic, alias, cb
	 	k.addOperator(nextCID, "echo.js", 1, [nextWorkerUID], true, "", function(){
	 		
	 		//unbind previous to new -> take new timestamp (compare with previous)
	 		var after_adding_new_operator = new Date().getTime();
	 		
	 		console.log("before k.unbindOperator");
	 		//unbind from nextCID - 1 (previous one added) to 0 (this Operator, add always 1 before the end)
	 		k.unbindOperator(nextCID - 1, 0, function(){
	 			//bind new to this Operator -> take new timestamp (compare with previous)
	 			var after_unbinding_old_operator = new Date().getTime();
	 			
	 			console.log("before first k.bindOperator");
	 			k.bindOperator(nextCID - 1, nextCID, "round_robin", function(){
	 				//bind previous to new Operator -> take new timestamp (compare with previous)
	 				var after_first_bind = new Date().getTime();
	 				
	 				console.log("before second k.bindOperator");
	 				k.bindOperator(nextCID, 0, "round_robin", function(){
	 					//update nextCID, nextWorkerUID & send token with new timestamp
						var after_second_bind = new Date().getTime();
						nextCID++;
						nextWorkerUID++;
						count++;
						
						delay_taken = after_second_bind - before_adding_new_operator;
	 					fs.appendFileSync("add_delay.txt", delay_taken + "\n", encoding='utf8', function(err) {
					     	if(err) {
					         	console.log(err);
					     	}
					    });
						
						console.log("before k.send");
						k.send(JSON.stringify({'timestamp': after_second_bind}));
					});
				});
	 		});
	 	});
 	}
}, process.argv[3]); 
 