// Task worker in Node.js
// Connects PULL socket to tcp://localhost:5557
// Collects workloads from ventilator via that socket
// Connects PUSH socket to tcp://localhost:5558
// Sends results to sink via that socket

var zmq        = require('zmq')
  , receiver   = zmq.socket('pull')
  , sender     = zmq.socket('push')
  , controller = zmq.socket('sub');

var xx = 0


setInterval(function() {console.log(xx)  }, 1000)

receiver.on('message', function(buf) {

	JSON.parse(buf)

	xx++

/*
  var msec = parseInt(buf.toString(), 10);

  // simple progress indicator for the viewer
  process.stdout.write(buf.toString() + ".");
*/


  // do the work
  // not a great node sample for zeromq,
  // node receives messages while timers run.
 // setTimeout(function() {
    sender.send("");
 // }, 1000);
});

controller.on('message', function() {
  // received KILL signal
  receiver.close();
  sender.close();
  controller.close();
  process.exit();
});

receiver.connect('tcp://localhost:5557');
sender.connect('tcp://localhost:5558');
controller.subscribe('');
controller.connect('tcp://localhost:5559');
