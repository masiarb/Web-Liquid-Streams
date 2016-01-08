/**
 * Koala Bootloader
 */


var workers = new Array();


/*
	Test function to manage the stream. Is directly called
	from the webpage (thus is case study-specific). It's
	task is to dispatch the stream to all the workers in 
	the webpage. The worker(s), in the case study, will then
	send the stream to the proxy.
*/


var stream_handler = function(stream){
	for(var w in workers){
		workers[w].postMessage({
			cmd : 'prod',
			data : stream,
		});
	}
}


$(document).ready(function(){

	// To manage the local node configuration
	P = {}
	P.processes = []
	var clusters = new Array();
	
	/*
		Function to run single workers
	*/
	var run_worker = function(uid, cid, script, producer){
		var worker = new Worker('koala_remote.js');
		
		worker.states = {};
		workers[uid] = worker;
		worker.onerror = function(event){
			throw new Error(JSON.stringify(event));
		};
		
		var new_process = {uid: uid}
					
	    worker.onmessage = function(event) {
			// this is called if the message arrives from a setState.  					
	  		if(event.data["IsNotify"] && event.data.IsNotify){
	  			notifyMe(event.data.Object);
	  		}
	  		else
	  			console.log("Worker said: " + event.data);					
		};
					
		new_process.script_src = 'scripts/'+new_process.src;
		
		P.processes.push(new_process.uid);
		
		clusters[cid].workers.push({
			uid: uid,
			process : worker,
			//no port + host (?)
		});
		
		worker.postMessage(new_process);
	}

	now.ready(function(){

		/*
			Call the server: notify we are here ready to do stuff
		*/
		now.register_new_remote_node(function( new_node_id, new_alias ) {
   		
   			P.uid = new_node_id
   			P.alias = new_alias 
   		
   			console.log('Got new ID : '+new_node_id)
   		})
   		
   		/*
   			Called by the ROOT to run a new cluster (which will spawn 1+ workers)
   		*/
   		now.run_cluster =  function(cid, script, workers_number, uids, automatic, cb){
   			//if this is the first element of the cluster then create an entry for the cluster
			if(!clusters[cid]){
				clusters[cid] = {
					cid : cid,
					script: script,
					workers: [],
					producer: !automatic,
				}
			}
			
			for(var i = 0; i < workers_number; i++)
				run_worker(uids[i], cid, script, !automatic)
			
			cb();
   		}
   		
   		/*
   			Called by the ROOT to bind a cluster on this browser to another cluster
   		*/
   		now.bind_cluster = function(cid1, cid2, to, this_node){
   			var from_uids = [];
   			for(var i = 0; i < clusters[cid1].workers.length; i++){
   				from_uids.push(clusters[cid1].workers[i].uid);
   			}
   			to.channel.koala_node.incoming_connection(from_uids, cid2, this_node, function(proxy){
   				//proxy.host proxy.port
   				for(var i = 0; i < clusters[cid1].workers.length; i++){
   					//send a connection message that the koala_remote.js (worker) can interpret
   					clusters[cid1].workers[i].process.postMessage(proxy);
   				}
   			})
   		}
   		
   		/*
   			Called by the server to run a new process
   		*/
   		now.run_process = function( new_process, cb ) {
				//run command, start web worker(s) with js code
				
            	var worker = new Worker('koala_remote.js');
            	worker.states = {};
            	workers[new_process.uid] = worker;
            	worker.onerror = function(event){
    				throw new Error(JSON.stringify(event));
				};
				
            	worker.onmessage = function(event) {
				    // this is called if the message arrives from a setState.  					
  					if(event.data["IsNotify"] && event.data.IsNotify){
  						
  							notifyMe(event.data.Object);
  						
  						//worker.states[event.data.States] = event.data.Values; 
  					//	for (x = 0; x < event.data.States.length; x++){
  						//			worker.states[event.data.States[x]] = event.data.Values[x]
  							//	}
  						
  					//	console.log(worker.states[event.data.state]) 						
  					//	if(event.data["Callback"]){
  						//	console.log("got in cb call too");
  					//		eval(event.data.Callback) //DEPRECATED
  							
  						
  				//			watch(worker.states,event.data.States, cb )}
  						}
  						else
  						  console.log("Worker said: " + event.data);	
  						
				};
				
				new_process.script_src = 'scripts/'+new_process.src;
				
				P.processes.push(new_process.uid);
				
				worker.postMessage(new_process);
				//worker.ciao = 10
				//console.log(worker.ciao)
			//	
				//console.log(worker)
				
				cb(new_process, true);
            },
            
        /*
        	Called to kill one webworker
        */
        now.kill_process_remote = function(pid_to_kill, node_id, cb){
       		//kill the ww
       		workers[pid_to_kill].terminate();
       		
       		//remove it from the list of ww & P.processes
       		for(var i = 0; i < P.processes.length; i++){
       			if(P.processes[i] == pid_to_kill){
       				delete P.processes[i];
       			}
       		}
       		
       		delete workers[pid_to_kill];
       		cb(node_id);
        }
        
        /*
        	Called to kill the entire node
        */
        now.kill_remote = function(){
        	close();
        }
        
        /*
        	Called to get the list of list of workers
        */
        now.get_workers = function(cid, cb){
        	cb(clusters[cid].workers);
        }
        /*
   			Called by the server to bind a process on this browser to the proxy
   		*/
   		now.bind_process_node = function( msg, cb){
   			workers[msg.uid].postMessage(msg);
   			cb(true);
   		};
        
        //old code, may be deleted in the near future
        /*else if(json["data"] && json["from"] && json["to"]){
            //it's a message for one of our workers
            workers[json["to"]].webkitPostMessage(json.buffer, [json.buffer]);
   		}*/
   		
	})
});
