/**
 * This JS file represents the controller build by @Andrea Gallidabino on the browser side of 
 * Web Liquid Streams in the public/js/koala_bootloader.js file around line 1790. This file 
 * is used to compare the two control structure approaches for the eurosys2015 paper.
 */
 
 //sampling threshold fixed for a predetermined subset of experiments
 var samplingThreshold = 1.9;
 var samplingMessages = 10;
 
/*
	the controller needs to know:
	the cid of the Operator it is operating on
	if the operator is automatic or manual
	if there are messages in queue
	[ok] samplingMessages -> how many messages per worker
	[ok] a sampling threshold fixed outside -> threshold that is fixed but should be variable with the workers work
	RPC connection to add workers (pass by koala_node.js)
	
*/

/*
	We need a data structure that contains the following data:
	connections[cid] = {
		__throughput : {
			startingSampleDate : ... -> date of beginning in ms
			in : ... -> effective tp in
			out : ... -> effective tp out
			throughputIn : ... -> computed tp in (tp in / (data fine - data inizio))
			throughputOut : ... -> computed tp out (tp out / (data fine - data nizio))
		}
		limitCounter : ... -> numero di worker nell'operatore quando hai raggiunto il limite
		limitReached : ... -> boolean che mi dice se ho raggiunto il limite
		__workerCounter : ... -> numero di workers nell operator cid
		__lastSampledThroughputOut : ... -> last value of tp out
		__workersLastUsed : [
		   uid : number_of_usages -> conta quanti messaggi sono stati processati dal worker con id uid
		]
		__message_pool : ... (this is the queue, we don't have a queue...)
	}
*/

//the controller should be called each time an Operator has collected 40 * #w messages by, in this case, the Operator itself
 
 //TODO: calls to rpc
exports.runController = function(connections, cid, add_worker, cb) {
	console.log("runController's andrea called, connections[cid].__throughput.in = " + connections[cid].__throughput.in);
  // If it is a producer or there are no messages in queue there is no need to control
  if(connections[cid].__throughput.in != 0) {
	console.log("connections[cid].__throughput.in != 0 true and next if evaluates to " + (connections[cid].__throughput.out >= samplingMessages * connections[cid].__workerCounter));
    //Cycle ended or not
    if (connections[cid].__throughput.out >= samplingMessages * connections[cid].__workerCounter) {
      // if(connections[cid].__lastCycleThroughput) { -> finished cycle
        console.log("connections[cid].__throughput.out >= samplingMessages * connections[cid].__workerCounter true");
        console.log(connections[cid]);
        console.log((connections[cid].__throughput.throughputIn - connections[cid].__throughput.throughputOut)  + " > " +  (connections[cid].__throughput.throughputIn * samplingThreshold));
        
        
        if(Math.abs(connections[cid].__throughput.throughputIn - connections[cid].__throughput.throughputOut) > connections[cid].__throughput.throughputIn * samplingThreshold) {
         console.log("connections[cid].__throughput.throughputIn - connections[cid].__throughput.throughputOut) > connections[cid].__throughput.throughputIn * samplingThreshold true");
         
          if(connections[cid].__limitReached && connections[cid].__workerCounter == connections[cid].__limitCounter) {
          	console.log("limit reached in andrea_controller");
            // limit was reached in previous cycle
            // Should we request to send less messages?
            // TODO
          } else {
            // Double workers
			// Doubling would surpass the limit?
			console.log("we have to double the workers");
            if(connections[cid].__workerCounter * 2 <= connections[cid].__limitCounter) {
              var workersToAdd = connections[cid].__workerCounter
				console.log("we can double the workers, we double them");
              add_worker(cid, workersToAdd);

              // Did we reach the maximum numbers of workers or not?
              if(connections[cid].__lastSampledThroughputOut) {
                if(connections[cid].__throughput.throughputOut < connections[cid].__lastSampledThroughputOut * limitThreshold) {
                  //Reached the maximum the computer can handle
                  // var expected = connections[cid].__lastSampledThroughputOut * 2
                  // var difference = Math.abs(expected - connections[cid].__throughput.throughputOut)

                   if(difference > expected * samplingThreshold) {
                     connections[cid].__limitReached = true
                     connections[cid].__limitCounter = connections[cid].__workerCounter
                   }

                  
                }
              }

              connections[cid].__lastSampledThroughputOut = connections[cid].__throughput.throughputOut
              
            } else {
              console.log("Doubling would sorpass the limit computed in previous cycle")
            }
          }
        } else {
          // Maybe we should decrease the number of workers
          console.log('Check to delete workers')

          var limit = samplingMessages
          console.log(connections[cid].__workersLastUsed)

          for(uid in connections[cid].__workersID) {
            if(!connections[cid].__workersLastUsed || connections[cid].__workersLastUsed[uid] < samplingMessages / 2) {
              //delete worker
              now.delete_worker(cid, uid, undefined)
            }
          }
        }
	
		//may be deleted, done outside
        connections[cid].__workersLastUsed = {}

        connections[cid].__throughput = {
          startingSampleDate: (new Date()).getTime(),
          in: 0,
          out: 0,
          throughputIn: 0,
          throughputOut: 0
        }
        
        
    } else {
      // We didn't reach the end of the cycle
    }
  }
  
  //does the same thing up here, but to be sure it's not using a reference
  cb();
}