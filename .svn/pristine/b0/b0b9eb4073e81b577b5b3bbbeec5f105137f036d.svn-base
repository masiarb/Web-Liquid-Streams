var controller = {
  // normalQueueSize: 10,
  // samplingMessages: 100,
  runInterval: undefined,
  intervalMilliseconds: 1000,
  samplingThreshold: 0.1,
  limitThreshold: 1.9,

  slowModeTriggering: 20,
  slowModeDeactivation: 10
}

var helpRequest = {}

var code = {
  NONE: 0,
  LEAVING: 1,
  BATTERY: 2,
  CPU: 3,
}

controller.run = function() {
  //for every operator in the peer
  for(var op in operators) {
    //If there is more than 1 message in the message queue
    if(operators[op].__message_pool.length > 2) {
      // console.log('Controller: adding branch')
      var workerCounter = 0
      for(var w in workers) {
        if(workers[w] != undefined) {
          workerCounter++
        } 
      }

      if(controller.concurrency <= workerCounter) {
       console.log('Controller: limit was reached in previous cycles')
       controller.onCPU(op)
        
      } else {
        // console.log('Controller: adding a worker')
        now.add_workers(1, function(uids) {
          now.add_worker(op, uids, uids.length, undefined)
        })
      }
    } else {
      // console.log('Controller: deleting branch')
      // Maybe we should delete some workers
      for(var uid in operators[op].__workersID) {
         if(operators[op].__workers.length != 1 && (!operators[op].__workersLastUsed[uid] || operators[op].__workersLastUsed[uid] == 0)) {
           console.log('Deleting ' + uid)
           now.delete_worker(op, uid, undefined)
         }
       }
    }

    operators[op].__workersLastUsed = {}
    operators[op].__throughput = {
      startingSampleDate: (new Date()).getTime(),
      in: 0,
      out: 0,
      throughputIn: 0,
      throughputOut: 0
    }
  }
}



//   // If it is a producer or there are no messages in queue there is no need to control
//   if(operators[cid].__throughput.in != 0 || operators[cid].__message_pool.length != 0) {

//     //Cycle ended or not
//     if (operators[cid].__throughput.out == controller.samplingMessages * operators[cid].__workerCounter) {
//       // if(operators[cid].__lastCycleThroughput) {
// //        console.log('Finished Cycle:')
//           console.log(operators[cid].__throughput.throughputOut)

//         if(Math.abs(operators[cid].__throughput.throughputIn - operators[cid].__throughput.throughputOut) > operators[cid].__throughput.throughputIn * controller.samplingThreshold) {
//           var workerCounter = 0
//           for(var w in workers) {
//             if(workers[w] != undefined) {
//               workerCounter++
//             } 
//           }

//           if(controller.defaultLimitWorker == workerCounter) {
//            console.log('Limit was reached in previous cycles')
//            //TODO call migration
            
//           } else {
//             // Add 1 single worker to the operator
//             now.add_workers(1, function(uids) {
//               now.add_worker(cid, uids, uids.length, undefined)
//             })
// //               // Double workers

// // //            console.log('Detected need to double:')

// //             // Doubling would surpass the limit?
// //             if(operators[cid].__workerCounter + 1 <= operators[cid].__limitCounter) {
// // //              var workersToAdd = operators[cid].__workerCounter

// // //              now.add_workers(workersToAdd, function(uids) {
// // //                now.add_worker(cid, uids, uids.length, undefined)
// // //              })

// //               // Did we reach the maximum numbers of workers or not?
// // //              if(operators[cid].__lastSampledThroughputOut) {
// // //                if(operators[cid].__throughput.throughputOut < operators[cid].__lastSampledThroughputOut * limitThreshold) {
// //                   // var expected = operators[cid].__lastSampledThroughputOut * 2
// //                   // var difference = Math.abs(expected - operators[cid].__throughput.throughputOut)

// //                   // if(difference > expected * samplingThreshold) {
// //                   //   operators[cid].__limitReached = true
// //                   //   operators[cid].__limitCounter = operators[cid].__workerCounter
// //                   // }

// // //                  console.log('Reached the maximum the computer can handle')
// // //                  console.log(operators[cid].__lastSampledThroughputOut)
// // //                  console.log(operators[cid].__throughput.throughputOut)
// // //                }
// // //              }

// //               operators[cid].__lastSampledThroughputOut = operators[cid].__throughput.throughputOut
              
// //             } else {
// // //              console.log("Doubling would sorpass the limit computed in previous cycle")
// //             }
//           }
//         } else {
//           // Maybe we should decrease the number of workers
// //          console.log('Check to delete workers')

//           var limit = controller.samplingMessages
// //          console.log("Worker last used ")
// //          console.log(operators[cid].__workersLastUsed)

//          for(uid in operators[cid].__workersID) {
//            if(!operators[cid].__workersLastUsed[uid] || operators[cid].__workersLastUsed[uid] < controller.samplingMessages / 2) {
//              console.log('Deleting ' + uid)
//              now.delete_worker(cid, uid, undefined)
//            }
//          }
//         }

//         operators[cid].__workersLastUsed = {}

//         operators[cid].__throughput = {
//           startingSampleDate: (new Date()).getTime(),
//           in: 0,
//           out: 0,
//           throughputIn: 0,
//           throughputOut: 0
//         }
//     } else {
//       // We didn't reach the end of the cycle
//     }
//   }
// }

/* 
 * Moving reason table:
 *
 * 1: browser closing
 */

/*
 * Triggered when battery is low
 */
controller.onBattery = function() {
  for(var i in operators) {
    if(moveTo != undefined) {
      now.require_central_controller(i, null, null, code.BATTERY, function(){})
    }
  }
}

/*
 * Triggered when browser exit
 */
controller.onLeave = function() {
  console.log('Leaving')

  for(var i in operators) {
    var options = {
      pid: personalID,
      cid: i,
      workers: {length: operators[i].__workerCounter},
      alias: "",
      script: cidInfos[i]['script'],
      producer: cidInfos[i]['automatic']
    }

    now.require_central_controller(i, null, options, code.LEAVING, function(){})

    for(var c in operators[i]['in']) {
      operators[i]['in'][c].close()
    }

    for(var c in operators[i]['out']) {
      operators[i]['out'][c].close()
    }
  }
}

/*
 * Triggered when operator is overloaded
 */
controller.onCPU = function(cid) {
  var options = {
    script: cidInfos[cid]['script'],
    topology: operators[cid].__topology
  }

  if(!helpRequest[cid]) {
    now.require_central_controller(cid, null, options, code.CPU, function(){})
    helpRequest[cid] = true
  }
}

controller.getBattery = function() {
  return controller.battery.charging ? -1 : controller.battery.level
}

/*
 * Polls to get info about overloading
 */
controller.getCPU = function() {
  var counter = 0
  for(var w in workers) {
    if(workers[w] != undefined) {
      counter++
    } 
  }

  return counter / controller.concurrency
}

/*
 * Polls operators colleciton in order to get the number of operators
 */
controller.getOperators = function() {
  var ops = 0
  for(var op in operators) {
    // if(operators[op] != undefined) {
      ops++
    // } 
  }
 
  return ops
}

controller.getTopologies = function(cid) {
  return operators[cid].__topology
}

controller.getPings = function(cid) {
  return controller.pings[cid]
}

controller.getNetwork = function() {
  return 'remote'
}

/*
 * Polls operator in order to get info about the messages (size in/ size out)
 */
controller.getMessages = function() {

}

controller.getCores = function () {
  return controller.concurrency
}

/*
 * Check the location of an operator
 */
controller.checkLocation = function() {

}

controller.initialize = function() {
  window.onbeforeunload = controller.onLeave

  if(navigator.hardwareConcurrency) {
    controller.concurrency = navigator.hardwareConcurrency 
  } else {
    controller.concurrency = 1
  }

  controller.battery = {
    THRESHOLD: 0.2
  }
  // navigator.getBattery().then(function(battery) {
  //   controller.battery.charging = battery.charging ? true : false
  //   controller.battery.level = battery.level
  //   controller.battery.chargingTime = battery.chargingTime
  //   controller.battery.dischargingTime = battery.dischargingTime

  //   battery.addEventListener('chargingchange', function() {
  //     controller.battery.charging = battery.charging ? true : false
  //   });

  //   battery.addEventListener('levelchange', function() {
  //     controller.battery.level = battery.level

  //     if(battery.level < controller.battery.THRESHOLD) {
  //       controller.onBattery()
  //     }
  //   });

  //   battery.addEventListener('chargingtimechange', function() {
  //     controller.battery.chargingTime = battery.chargingTime
  //   });

  //   battery.addEventListener('dischargingtimechange', function() {
  //     controller.battery.dischargingTime = battery.dischargingTime
  //   });

  // });

  controller.battery.charging = true
  controller.battery.level = 1
  controller.battery.chargingTime = 0
  controller.battery.dischargingTime = 0

  controller.pings = {} 

  controller.runInterval = setInterval(function() {controller.run()}, controller.intervalMilliseconds)
}

controller.notifyStats = function(pid){
  return {
    peer: personalID,
    cores: controller.getCores(),
    operators: controller.getOperators(),
    battery: controller.getBattery(),
    cpu: controller.getCPU(),
    // pings: controller.getPings(cid),
    // topologies: controller.getTopologies(cid),
    network: controller.getNetwork(),
  }
}

controller.getMoveTarget = function(cid) {
  var topo = operators[cid].__topology

  var moveTo = undefined

  for(var p in topo.in) {
    moveTo = p
  }

  if(moveTo == undefined) {
    for(var q in topo.out) {
      moveTo = q
    }
  }

  return moveTo
}

controller.initialize()

var run_fake_controller = function(p_ids, o_id) {
  now.startfakecontroller(p_ids, o_id)
}

var onCPUButton = function() {
  for(var a in operators) {
    controller.onCPU(a)
  }
}

var onCPUButtonOverride = function() {
  for(var a in operators) {
    helpRequest[a] = false
    controller.onCPU(a)
    return
  }
}