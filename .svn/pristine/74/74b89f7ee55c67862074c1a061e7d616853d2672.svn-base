/**
 * Koala Bootloader
 */

 /*
 * Flag: if true activates the following:
 * Geolocation map
 * Geolocation interval
 * Draw graphs
 * Store data for graphs
 */
var drawUI = false

// PID value
var personalID

/*
 * List of all operators inside the browser
 * {uid: {}}
 */
var operators = {}

/*
 * Array of workers:
 * [{uid}, {uid}]
 */
var workers = new Array();

//Not used in the latest release
var MESSAGE_PER_LATENCY = 10

//  mapping the html blocks and the scripts added by the webworkers into the mainpage
var addedHtml = {}
var addedScript = {}

/*
 * Firebase server used to initialiase the webRTC conenction
 * right now the server is unique and hardcoded
 *
 * if more than one firebase server is needed it must be passed through a bindc command
 */
// var firebase = 'koalapipeline'

/*
 * When a client connect to a path (i.e. /producer), the corresponding automatically ran 
 * operator is mapped in thisobject
 * 
 * {'path': uid} 
 * when 'path' is null the operator is manual
 */
var pathCluster = {}

/*
 * List of all bound workers
 */
var boundWorkers = {}

// var serverCounter = {
//   in: 0,
//   out: 0
// }


// var pathToUid = {}
/*
 * Map from cid (operator id) to incoming room name
 *
 * {cid: 'room'}
 */
var cidToRoom = {}
/*
 * Map of important informations about the operator
 *
 * {cid: 
 *    {
 *      automatic: bool,
 *      random_token: number,
 *      script: string,
 *      out_room_name
 *    }
 * }
 */
var cidInfos = {}

// Variables related to chart drawing
var chart_points = 10
var drawChartsDelta = 3000
var charts = {}

// Variable used to debug
var queueSamples = []

// Data retrieved from browser
var isDataChannelSupported = undefined
var isMobile = undefined
var battery = undefined
var isBattery = false
var isGeolocation = false
var navigatorInfos = {}
var mapCanvas = document.getElementById('map_canvas');
var map = undefined

var remoteWorkerJS = 'js/koala_remote.js'
var scriptFolder = 'scripts/'

var producer_table = {}

var peerName = undefined
var peerConnection = undefined
var peerAPIKey = '54u43rjpu0s8m2t9'
// var peerAPIKey = 'test'
var peerHost = 'neha.inf.unisi.ch'
var peerPort = 45001
var peerRoute = 'peerjs'
var isPeerConnected = false

var socket_connections = {}
var socket_status = {}
var socket_operators = {}

var globalRandomToken = undefined

var presentationMode = false;

/*
 * Opening new socket
 *
 * For every node/host there is a single websocket connection
 */
var open_new_socket_connection = function(host, port, cid1, cid2, from, to, protocol, isIncoming, cb) {  
  if(socket_operators[host] == undefined) {
    socket_operators[host] = {
      in: [],
      out: []
    }
  }

  var browserCid = undefined
  if(isIncoming) {
    browserCid = cid2
    socket_operators[host].in.push(browserCid)
  } else {
    browserCid = cid2
    socket_operators[host].out.push(browserCid)
  }  



  if(socket_connections[host] == undefined) {
    socket_status[host] = 'closed'

    var conn = new WebSocket('ws://'+host+':'+port)

    conn.onmessage = function(msg){
      var message = JSON.parse(msg.data);
      
	   /*
			Check if this is a message from the stream or a message from the setup.
			The following means that *this* worker will receive (or not receive anymore) messages
			from the workers that sent the _WLS_SETUP message. 
		*/
		if(message._WLS_SETUP == "bind"){
			console.log("bind ricevuto: " + JSON.stringify(message));
			var w = message.sender_operator;
			
			//check to avoid doing double the thing when more than one worker for the same operator connect
			if(!operators[message.receiver].inConnections[w]){
				operators[message.receiver].inConnections[w] = true;
				operators[message.receiver].cbOrdering.push(w);
			}
			return;
		}
		
		else if(message._WLS_SETUP == "unbind"){
			var w = JSON.parse(data).sender_operator;
			operators[message.receiver].inConnections[w] = undefined;
			operators[message.receiver].cbOrdering.splice(ordering.indexOf(w), 1);
			return;
		}

      if(message.type == 'incoming_message') {
        var toCid = message.to
        var options = message.options
        var fromCid = message.from_operator;

        if(options == undefined || typeof options !== 'object') {
          options = {
            __checkpoints: []
          }
        } else if(options.__checkpoints == undefined) {
          options.__checkpoints = []
        }

        var timestamp = new Date().getTime()
        var ping = timestamp

        var counter = 0
        for(var w in workers) {
          if(workers[w] != undefined) {
            counter++
          } 
        }

        options.__checkpoints.push({
          peer: personalID,
          operator: toCid,
          event: 'message received',
          timestamp: timestamp,
          battery: controller.battery.level,
          cpu: counter / controller.concurrency,
          ping: ping,
          worker_number: operators[toCid] != undefined ? operators[toCid].__workerCounter: 0,
          queue: operators[toCid] != undefined ? operators[toCid].__message_pool.length: 0
        })

        options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(message.data) + sizeof(options)
	
		operators[toCid].__pushMessage('incoming_message', JSON.stringify(message.data), options, fromCid);  

      }
    }
    
    conn.onopen = function() {
      conn.send(JSON.stringify({type: 'setup', cid: browserCid, alias: operators[browserCid].alias}));


      socket_status[host] = 'opened'
      console.log('Socket connection opened with server')

      if(!isIncoming) {
        conn.to = cid1

        if(!operators[browserCid].__isBinded) {
          for(var w in operators[browserCid].__workersID) {
            operators[browserCid].__workersID[w].postMessage({
              type: "bind"
            })
          }

          operators[browserCid].__isBinded = true
        }

        operators[browserCid]['out'].push(conn)
      } else {
        conn.from = cid1

        operators[browserCid]['in'].push(conn)
      }
    }
    
    conn.onclose = function() {

      socket_status[host] = 'closed'
    }
    
    conn.onerror = function(error) {

      socket_status[host] = 'error'
    }

    conn.channelType = 'socket'
    socket_connections[host] = conn
  } else {
    // console.log('Already connected to host: ' + host)

    var conn = socket_connections[host]

    if(conn.readyState == 0) {
      setTimeout(function(){open_new_socket_connection(host, port, cid1, cid2, from, to, protocol, isIncoming, cb)}, 500)
    } else {
      conn.send(JSON.stringify({type: 'setup', cid: browserCid}))

      if(!isIncoming) {
        conn.to = cid1

        if(!operators[browserCid].__isBinded) {
          for(var w in operators[browserCid].__workersID) {
            operators[browserCid].__workersID[w].postMessage({
              type: "bind"
            })
          }

          operators[browserCid].__isBinded = true
        }

        operators[browserCid]['out'].push(conn)
      } else {
        conn.from = cid1
        operators[browserCid]['in'].push(conn)
      }
    }
  }

  cb()
}

/*
 * Allows the webpage to be a producer itself by sending produced messages directly to an operator. 
 *
 * This function must be called only after an operator calls registerProducer('identifier') from within a webworker.
 * 
 * producer_handler(data, indentifier)
 * data:        any object produced by the page
 * identifier:  same string used in registerProducer('identifier')
 *              if 'identifier' doesn't exist, this function has no effect
 */
var producer_handler = function(data, identifier){
  if(producer_table[identifier] != undefined) {
    // console.log('found path')
    var cid = producer_table[identifier]

    var options = {
      __checkpoints: []
    } 

    var counter = 0
    for(var w in workers) {
      if(workers[w] != undefined) {
        counter++
      } 
    }

    options.__checkpoints.push({
      peer: personalID,
      event: 'data produced',
      timestamp: new Date().getTime(),
      battery: controller.battery.level,
      cpu: counter / controller.concurrency,
      // worker_number: operators[cid2].__workerCounter
    })

    options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(data) + sizeof(options)


    operators[cid].__pushMessage('producer', data, options, cid)
    // if(operators[cid].__worker_pool.length == 0 || operators[cid].__message_pool.length != 0) {
    //   // operators[cid].__message_pool.push({
    //   //   type: 'producer',
    //   //   message: data
    //   // })
    //   var worker
    //   for(var key in operators[cid].__workersID) {
    //     worker = operators[cid].__workersID[key]
    //   }
    //   worker.postMessage({
    //     type: 'producer',
    //     message: data
    //   })
    // } else {
    //   var worker = operators[cid].__worker_pool.pop()
    //   // operators[cid].__workersLastUsed[worker.uid] = new Date()
    //   worker.postMessage({
    //     type: 'producer',
    //     message: data
    //   })
    // }
    // operators[cid].__throughput.in++
    // updateGraphics(cid)
    // for(var w in workers){
    //   workers[w].postMessage({
    //     type : 'producer',
    //     data : data,
    //   });
    // }
  } else {
    console.log("Producer_handler: identifier doesn't exist")
  }

}

/*
 * Opens a channel from the webpage to an operator. This function shouldn't be called directly
 * from outside an operator, but should be called withint it with the fnction registerProducer('identifier')
 *
 * register_producer(pid, identifier)
 * pid:         operator id
 * identifier:  identifier of the channel
 */
var register_producer = function(pid, identifier) {
  producer_table[identifier] = pid
  console.log('Registered producer channel: ' + pid + ' - ' + identifier)
}

/*
 * functions used to push messages in a message queue
 *
 * this function is never directly called, but instead you use operators[cid].__pushMessage
 * where there is a curried binded version of this function
 */
var push_message = function(cid, type, data, options, fromCid) {
  var m = undefined
  
  if(operators[cid].isJoin){
  	//store the message in local buffer
	operators[cid].inMessagesReceived[fromCid] = data;
	
	var msgArray = new Array();
	
	//check if all the messages of the join have been received
	var all_received = true;
	
	for(var mm in operators[cid].inConnections){
		if(!operators[cid].inMessagesReceived[mm] && operators[cid].inConnections[mm] == true)
			all_received = false;
		else
			msgArray.push(operators[cid].inMessagesReceived[mm]);
	}
	
	//if all received
	if(all_received){
		var finalMsg = new Array();
		for(var i = 0; i < operators[cid].cbOrdering.length; i++){
			finalMsg.push(msgArray[operators[cid].cbOrdering[i]]);
		}
		//join_cb(finalMsg, uid, options);
		m = {
			type: type,
			message: finalMsg,
			options: options
		}
		
		//empty the inMessagesReceived array
		for(var f in operators[cid].inMessagesReceived){
			delete operators[cid].inMessagesReceived[f];
		}
	}
  } else {
  	m = {
    	type: type,
    	message: data,
    	options: options
  	}
  }
	

  // var dt = JSON.parse(data)
  // if(dt.counter != undefined) {
  //   if(dt.counter % 5000 == 0) {
  //     console.log('Battery on message: ' + dt.counter)
  //     location.reload() 
  //     // controller.onBattery()
  //   }
  // }
 
  if(m == undefined) {
  	return
  }

  if(operators[cid].__worker_pool.length == 0 || operators[cid].__message_pool.length != 0) {
    operators[cid].__message_pool.push(m)

    if(!operators[cid].__isSlowMode && operators[cid].__message_pool.length >= controller.slowModeTriggering) {
      operators[cid].__triggerSlowMode()
    }
//                  console.log(operators[cid2].__message_pool.length)
  } else {
    var w = operators[cid].__worker_pool.pop()
    // operators[cid2].__workersLastUsed[worker.uid] = new Date()

    w.postMessage(m)
  }

  operators[cid].__throughput.in++

  queueSamples.push(operators[cid].__message_pool.length)
  updateGraphics(cid)

  // if(operators[cid].__message_pool.length != 0) {

  // } else {
  //   var worker = operators[cid].__worker_pool.pop()
  //   // operators[cid].__workersLastUsed[worker.uid] = new Date()

  //   worker.postMessage({
  //     type: 'producer',
  //     message: data
  //   })
  // }
}

var trigger_slow_mode = function(cid) {
  if(operators[cid].in.length == 0)
    return

  for(var i in operators[cid].in) {
    operators[cid].in[i].send(JSON.stringify({
      type: 'start_slow_mode',
      from: cid
    }))
  }

  operators[cid].__isSlowMode = true
}

var deactivate_slow_mode = function(cid) {
  if(operators[cid].in.length == 0)
    return

  for(var i in operators[cid].in) {
    operators[cid].in[i].send(JSON.stringify({
      type: 'stop_slow_mode',
      from: cid
    }))
  }

  operators[cid].__isSlowMode = false
}

var local_push_message = function(cid, message) {
  var data = JSON.parse(message);
  var fromCid = message.from;
  var options = data.options

  if(options == undefined || typeof options !== 'object') {
    options = {
      __checkpoints: []
    }
  }  else if(options.__checkpoints == undefined) {
      options.__checkpoints = []
  }

  var counter = 0
  for(var w in workers) {
    if(workers[w] != undefined) {
      counter++
    } 
  }

  options.__checkpoints.push({
    peer: personalID,
    operator: cid,
    event: 'local push',
    timestamp: new Date().getTime(),
    battery: controller.battery.level,
    cpu: counter / controller.concurrency,
    worker_number: operators[cid].__workerCounter,
    queue: operators[cid].__message_pool.length
  })


  options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(data.msg) + sizeof(options)

  if(data.type == 'incoming_message') {
    push_message(cid, data.type, data.msg, options, fromCid);
  } else {
    console.log('New local push message')
  }
}


$(document).ready(function(){

  // To manage the local node configuration
  P = {}
  P.processes = []
  var clusters = new Array();


  /*
   * Gets the informations of the browser and draws the UI
   */
  var get_stats = function() {
    navigatorInfos = {
      appCodeName: navigator.appCodeName,
      appName: navigator.appName,
      appVerion: navigator.appVersion,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      onLine: navigator.onLine,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      systemLanguage: navigator.systemLanguage
    }

    isDataChannelSupported = window.IsDataChannelSupported = !((navigator.moz && !navigator.mozGetUserMedia) || (!navigator.moz && !navigator.webkitGetUserMedia));
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    if(navigator.battery || navigator.webkitBattery || navigator.mozBattery) {
      isBattery = true
      battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery
    }

    if(navigator.geolocation) {
      isGeolocation = true
    }

    if(drawUI) {
      jQuery('<div>', {
          id: '__datachannelSupport',
          class: 'row'
      }).appendTo('#__important_infos'); 

        jQuery('<h5>', {
          text: 'Datachannel Supported: ' + isDataChannelSupported
        }).appendTo('#__datachannelSupport'); 

      jQuery('<div>', {
          id: '__mobile',
          class: 'row'
      }).appendTo('#__important_infos'); 
      
        jQuery('<h5>', {
          text: 'Mobile: ' + isMobile
        }).appendTo('#__mobile'); 

        jQuery('<h5>', {
          text: 'UserAgent: ' + navigator.userAgent
        }).appendTo('#__mobile'); 

      jQuery('<div>', {
          id: '__battery',
          class: 'row'
      }).appendTo('#__important_infos'); 

        jQuery('<h5>', {
          text: 'Battery informations accessible: ' + isBattery
        }).appendTo('#__battery');

        var t = isBattery?battery.charging:'no data'
        jQuery('<h5>', {
          id: '__battery_charging',
          text: 'Battery charging: ' + t
        }).appendTo('#__battery');

        t = isBattery?battery.level:'no data'
        jQuery('<h5>', {
          id: '__battery_level',
          text: 'Battery level: ' + t
        }).appendTo('#__battery');

      if(isBattery) {
        setInterval(function(){
          $('#__battery_charging').text('Battery charging: ' + battery.charging)
          $('#__battery_level').text('Battery level: ' + battery.level)
        }, 10000)
      }

      jQuery('<div>', {
          id: '__map_head',
          class: 'row'
      }).appendTo('#__important_infos');

        jQuery('<h5>', {
          text: 'Geolocation supported: ' + isGeolocation
        }).appendTo('#__map_head');

        t = isGeolocation?'':'undefined'
        jQuery('<h5>', {
          id: '__position_lat',
          text: 'Latitude: ' + t
        }).appendTo('#__map_head');

        jQuery('<h5>', {
          id: '__position_long',
          text: 'Longitude: ' + t
        }).appendTo('#__map_head');

      if(isGeolocation) {
        navigator.geolocation.getCurrentPosition(function(pos){
          $('#__position_lat').text('Latitude: ' + pos.coords.latitude)
          $('#__position_long').text('Longitude: ' + pos.coords.longitude)

          var mapOptions = {
            center: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }

          map = new google.maps.Map(mapCanvas, mapOptions);

          var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
          var marker = new google.maps.Marker({
              position: latLong,
              map: map,
          });
        });
      }

      jQuery('<table>', {
        id: '__navigator_table',
        class: 'table table-striped',
      }).appendTo('#__infos');

        jQuery('<tr>', {
          id: '__navigator_table_header',
        }).appendTo('#__navigator_table');

          jQuery('<th>', {
            text: 'Key'
          }).appendTo('#__navigator_table_header');

          jQuery('<th>', {
            text: 'Value'
          }).appendTo('#__navigator_table_header');

      for(var i in navigatorInfos) {
        jQuery('<tr>', {
          id: '__navigator_table_' + i
        }).appendTo('#__navigator_table');
          
          jQuery('<td>', {
            text: i
          }).appendTo('#__navigator_table_' + i); 

          jQuery('<td>', {
            text: navigatorInfos[i]
          }).appendTo('#__navigator_table_' + i);
      }
    } else {
      jQuery('#__UI_important_infos').css('display', 'none')
      jQuery('#__UI_extended_infos').css('display', 'none')
    }
  }

  var send_in = function(cid, message) {
    //TODO decide how this should be done: brodcast?
  }

  var send_out = function(cid, message) {
  	message.from = cid;
    //TODO brodcast check
    if(true) {
      if(operators[cid]['out'].length == 0) {
        if(operators[cid]['slowOut'].length <= operators[cid].__roundRobinPosition) {
          operators[cid].__roundRobinPosition = 0
        }

        var sendTo = operators[cid]['slowOut'][operators[cid].__roundRobinPosition]

        if(sendTo != undefined) {
          sendTo.send(message)
        }

        operators[cid].__roundRobinPosition++
      } else {
        if(operators[cid]['out'].length <= operators[cid].__roundRobinPosition) {
          operators[cid].__roundRobinPosition = 0
        }

        var sendTo = operators[cid]['out'][operators[cid].__roundRobinPosition]

        if(sendTo != undefined) {
          sendTo.send(message)
        }

        operators[cid].__roundRobinPosition++
      }
    } else {
      for(var op in operators[cid]['out']) {
        operators[cid]['out'][op].send(message)
      }
    }
  }

  /*
   * functions used to delete a worker from both the UI and from the operator
   *
   * this function is never directly called, but instead you use operators[cid].__deleteWorker
   * where there is a curried binded version of this function
   */
  var delete_worker = function(cid, uid, cb) {
    $('#__worker_table_' + cid +'_row_' + uid).remove()
    $('#__frame_' + cid + "_" + uid + '_charts_title').remove()
    $('#__frame_' + cid + "_" + uid + '_charts').remove()

    var w = workers[uid]

    // console.log("Deleting Worker: " + w)

    operators[cid].__workerCounter--

    //console.log(w)
    console.log(uid)
    var index = operators[cid].__workers.indexOf(uid)
    console.log(operators[cid].__workers)
    for(var k = 0; k < operators[cid].__workers.length; k++){
        console.log(uid + " equal to " + operators[cid].__workers[k]);
	if(operators[cid].__workers[k] == uid){
            operators[cid].__workers[k] = undefined;
	}
    }
    operators[cid].__workers[index] = undefined

    index = operators[cid].__worker_pool.indexOf(w)
    operators[cid].__worker_pool.splice(index, 1)

    w.terminate()

    console.log('@@@ ' + uid)


    delete workers[uid]
    delete operators[cid].__workersID[uid]

    updateGraphics(cid)
    if(typeof cb === 'function')
    	cb()
  }

  /*
   * functions used to adds a worker to both the UI and to the operator
   *
   * this function is never directly called, but instead you use operators[cid].__addWorker
   * where there is a curried binded version of this function
   */
  var add_worker = function(cid, uids, workers_number, cb) {
    // console.log('Hai chiamato la funzione add_worker')

    for(var i = 0; i < workers_number; i++) {
      jQuery('<tr>', {
        id: '__worker_table_' + cid +'_row_' + uids[i]
      }).appendTo('#__worker_table_' + cid);

        jQuery('<td>', {
          id: '__worker_table_' + cid + '_' + uids[i]+ '_in'
        }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

        jQuery('<td>', {
          id: '__worker_table_' + cid + '_' + uids[i]+ '_tin'
        }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

        jQuery('<td>', {
          text: uids[i]
        }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

        jQuery('<td>', {
          id: '__worker_table_' + cid + '_' + uids[i]+ '_throughput'
        }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

        jQuery('<td>', {
          id: '__worker_table_' + cid + '_' + uids[i]+ '_tout',
          style: "visibility: hidden"
        }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

        jQuery('<td>', {
          id: '__worker_table_' + cid + '_' + uids[i]+ '_out',
          style: "visibility: hidden"
        }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

        jQuery('<div>', {
          id: '__frame_' + cid + "_" + uids[i] + '_charts_title'
        }).appendTo('#__frame_' + cid + '_charts');

          jQuery('<h4>', {
            text: 'Worker ' + uids[i]
          }).appendTo('#__frame_' + cid + "_" + uids[i] + '_charts_title');

        jQuery('<div>', {
          id: '__frame_' + cid + "_" + uids[i] + '_charts'
        }).appendTo('#__frame_' + cid + '_charts');

          jQuery('<div>', {
            id: '__frame_' + cid +  "_" + uids[i] + '_charts_in',
            class: 'col-md-6'
          }).appendTo('#__frame_' + cid + "_" + uids[i] + '_charts'); 

            jQuery('<canvas>', {
              id: '__frame_' + cid +  "_" + uids[i] + '_charts_in_canvas',
              Height: '150',
              Width: '200'
            }).appendTo('#__frame_' + cid +  "_" + uids[i] + '_charts_in'); 

          jQuery('<div>', {
            id: '__frame_' + cid +  "_" + uids[i] + '_charts_out',
            class: 'col-md-6'
          }).appendTo('#__frame_' + cid +  "_" + uids[i] + '_charts');

            jQuery('<canvas>', {
              id: '__frame_' + cid +  "_" + uids[i] + '_charts_out_canvas',
              Height: '150',
              Width: '200'
            }).appendTo('#__frame_' + cid +  "_" + uids[i] + '_charts_out'); 

        var closure_drawchart = function(cid, uid, position) {
          if(!charts[cid])
            charts[cid] = {}

          if(!charts[cid][uid])
            charts[cid][uid] = {}
	  
	        console.log('__frame_' + cid +  "_" + uid + '_charts_' + position + '_canvas')
          if(!charts[cid][uid][position])
            charts[cid][uid][position] = {
              interval: undefined,
              data: {
                labels: [0],
                datasets: [{
                  data: [0]
                }],
              },
              svg: new Chart((document.getElementById('__frame_' + cid +  "_" + uid + '_charts_' + position + '_canvas')).getContext('2d'))
            }
	  
	  
          charts[cid][uid][position].interval = setInterval(function(){
            var raw_data = charts[cid][uid][position].data

            var chart_data = charts[cid][uid][position].data
            if(raw_data.labels.length > chart_points) {
              var l = raw_data.labels.length - chart_points

              chart_data = {
                labels: raw_data.labels.slice(l),
                datasets: [
                  {
                    data: raw_data.datasets[0].data.slice(l)
                  }
                ]
              }
            }

            var min = Math.min.apply(null, chart_data.datasets[0].data) 
            var max = Math.max.apply(null, chart_data.datasets[0].data) 

            var chart_option = {
              bezierCurve : false,
              pointDot : true,
              pointDotRadius : 2,
              pointDotStrokeWidth : 0,
              datasetStroke : true,
              datasetStrokeWidth : 2,
              datasetFill : false,
              animation : false,
              skipLabels: true

            }

            if (max == min) {
                chart_option.scaleOverride = true,
                chart_option.scaleSteps = 3,
                chart_option.scaleStepWidth = 0.5,
                chart_option.scaleStartValue = max - 1
            }

            charts[cid][uid][position].svg.Line(chart_data, chart_option);
          }, drawChartsDelta)
        }

      	var temp_uid = uids[i]
      	// console.log(uids[i])
        if(drawUI) {
          closure_drawchart(cid, temp_uid, 'in')
          closure_drawchart(cid, temp_uid, 'out')
        }
      // run_worker(uids[i], cid, script, !automatic, random_token, room_name)
    }


    //Adding many workers sequentially is bad on heavy load. Asynchrounous creation is better for performance
    var i = 0
    var delayed_creation = function() {
      operators[cid].__workers.push(uids[i])
      run_worker(uids[i], cid, clusters[cid].script, !clusters[cid].automatic, cidInfos[cid].random_token, cidInfos[cid].out_room_name)
      i++;
      if(i < workers_number){
          setTimeout( delayed_creation, 2);
      } 
      if (i == workers_number) {
        if(cb) {
          cb(clusters[cid].workers)
        }
      };
    }

    delayed_creation()
  }

  /*
    Function to run single workers
  */
  var run_worker = function(uid, cid, script, producer, random_token, room_name){
    var worker = new Worker(remoteWorkerJS);
    worker.uid = uid

    // operators[cid].__worker_pool.push(worker)
    operators[cid].__workersID[uid] = worker
    operators[cid].__maxWorkers++ //TODO is this still correct? Makes no sense to me right now
    operators[cid].__workerCounter++
    operators[cid].__throughput = {
      startingSampleDate: new Date().getTime(),
      in: 0,
      out: 0
    }

    // worker.states = {};
    workers[uid] = worker;
    var new_process = {
      type: 'script',
      uid: uid,
      src: script,
      pid: personalID
    }

    // Workers handlers
    worker.onerror = function(event){
      console.log(event)
      throw new Error('Webworker error');
    };
    
    // Incoming message from a worker
    worker.onmessage = function(event) {
      // a message without data (in normal situation it should never be possible)
      if(!event.data) {
        console.log(event)
      } 
      // notification from the worker. Not used anymore
      // else if(event.data["IsNotify"]){
      //   notifyMe(event.data.Object);
      // }
      // A worker-processed message that needs to be forwarded downstream 
      else if(event.data.type == "send") {
        var options = event.data.options

        if(options == undefined || typeof options !== 'object') {
          options = {
            __checkpoints: []
          }
        }  else if(options.__checkpoints == undefined) {
            options.__checkpoints = []
        }

        var counter = 0
        for(var w in workers) {
          if(workers[w] != undefined) {
            counter++
          } 
        }

        if(operators[cid] != undefined){
          options.__checkpoints.push({
            peer: personalID,
            operator: cid,
            event: 'leaving peer',
            timestamp: new Date().getTime(),
            battery: controller.battery.level,
            cpu: counter / controller.concurrency,
            worker_number: operators[cid].__workerCounter,
            queue: operators[cid].__message_pool.length
          })

          var m = {
            type: 'incoming_message',
            from: cid,
            msg: event.data.message,
            options: options
          }

          if(event.data.alias) {
            m.alias = event.data.alias
          }

          m.options.__checkpoints[m.options.__checkpoints.length-1].m_size = sizeof(m)

          operators[cid].__sendOut(JSON.stringify(m))
        }

        // operators[cid]['out'].send(m)

        // ROUND ROBIN

        // if(operators[cid][uid]['out'].output_table) {
        //   var usr = operators[cid][uid]['out'].output_table.peers[operators[cid][uid]['out'].output_table.position]
        //   operators[cid][uid]['out'].output_table.position++
        //   if(operators[cid][uid]['out'].output_table.position == operators[cid][uid]['out'].output_table.peers.length) {
        //     operators[cid][uid]['out'].output_table.position = 0
        //   }

        //   operators[cid][uid]['out'].channels[usr].send(m)
        // } else {
        //   operators[cid][uid]['out'].send(m)
        // }

        // if(operators[cid][uid]['out'].messages == 0) {
        //   operators[cid][uid]['out'].messages = MESSAGE_PER_LATENCY
        //   operators[cid][uid]['out'].send({
        //     type: 'pingReq',
        //     date: (Date.now()).toString()
        //   })
        // } else {
        //   operators[cid][uid]['out'].messages--
        // }

//         console.log('sending')
        //ROUND ROBIN
        // if(operators[cid]['out'].channels) {

        // ROUND ROBIN or BROADCAST
    //     if(cidInfos[cid].script != 'wcf.js' &&  operators[cid]['out'].output_table) {
    //       //ROUND ROBIN 
    //       // if(operators[cid]['out'].output_table) {

    //         // var channelsArray = $.map(operators[cid]['out'].channels, function(value, index) {
    //         //   return [value];
    //         // });
    //         // var channels = operators[cid]['out'].channels
    //         // var outputTable = operators[cid]['out'].output_table
    //         // var position = operators[cid]['out'].__roundRobinPosition

    //         // var sendTo
    //         // if(operators[cid]['out'].__roundRobinPosition >= 0) {
    //         //  // console.log(outputTable[position])
    //         //   if(outputTable[position] == undefined || outputTable[position] == '__server') {
    //         //     operators[cid].__sendOut(m)
    //         //   } else {
    //         //     sendTo = channels[outputTable[position]]
    //         //     // console.log('Sent to:' + outputTable[position])
    //         //     sendTo.send(m)
    //         //   }
    //         // } else {
    //         //   operators[cid]['out'].__roundRobinPosition = 0
    //         // }

    //         // if(operators[cid]['out'].__roundRobinPosition) {
    //         //   sendTo = channels[outputTable[position]]
    //         // } else {
    //         //   sendTo = channels[outputTable[0]]
    //         //   operators[cid]['out'].__roundRobinPosition = 0
    //         // } 

    //         // if(sendTo) {
    //         //   console.log('Sent to:' + outputTable[position])
    //         //   sendTo.send(m)
    //         // }
            
    //         operators[cid]['out'].__roundRobinPosition++
    //         if(operators[cid]['out'].__roundRobinPosition == outputTable.length) {
    //           operators[cid]['out'].__roundRobinPosition = 0
    //         }
    //       // }
    //     } else {
    //       //BROADCAST
    //       if(operators[cid]['out'].output_table) {
    //         for(z = 0; z < operators[cid]['out'].output_table.length; z++) {
    //           var user = operators[cid]['out'].output_table[z]
    // //          console.log('Sent to: ' + user)

    //           operators[cid]['out'].channels[user].send(m)
    //         }
    //       }
    //     }
      } 
      /*
       * Workers request a value of the Dom. Operator forwards the value to the wokrer 
       */
      else if(event.data.type == "domGet") {
        var m = event.data
        if($){
          worker.postMessage({
            type: "domGet",
            identifier: m.identifier,
            command: m.command,
            data: $(m.identifier)[m.command]()
          })
        }
      } 
      /*
       * Workers request to set a value in the Dom. Operators sets the said value
       */
      else if(event.data.type == "domSet") {
        var m = event.data
        if($){
          $(m.identifier)[m.command](m.value, m.extra)
        }
      } 
      /*
       * The worker registers a producer channel through the operator
       */
      else if(event.data.type == "registerProducer") {
        var identifier = event.data.identifier
        register_producer(cid, identifier)
      } 
      /*
       * Workers customize the html through the operator
       */
      else if(event.data.type == "addHtml") {
        var html = event.data.html
        var id = event.data.identifier
        
        if(!addedHtml[id]) {
          $('#__frame_' + cid).prepend('<div class="row">' + html + '</div>')
          addedHtml[id] = true
        }
      } 
      /*
       * Workers add javascript to the webpage through the operator
       */
      else if(event.data.type == "addScript") {
        var id = event.data.identifier
        var scriptSrc = event.data.script

        //avoids to add the same script twice
        if(!addedScript[id]) {
          var head= document.getElementsByTagName('head')[0];
          var script= document.createElement('script');
          script.type = 'text/javascript';
          script.src = scriptSrc;

          head.appendChild(script);
          addedScript[id] = true
        }
      } 
      /*
       * Workers call a function on the DOM
       */
      else if(event.data.type == "callFunction") {
        var name = event.data.name
        var args = event.data.args
        var token = event.data.token

        var r = undefined

        if(typeof(window[name]) == 'function') {
          r = window[name].apply(this, args)
        }

        if(token != undefined) {
          worker.postMessage({
            type: "returnFunction",
            content: r,
            token: token
          })
        }
      }
      /*
       * throughput message: contains outgoing informations
       * Mostly used for drawing charts purposes
       */
      else if(event.data.type == 'throughout') {
          var currentTime = (new Date).getTime()

          for(var i = 0; i < clusters[cid].workers.length; i++) {
            if(i == clusters[cid].workers.uid) {
              clusters[cid].workers.messages.outgoing = event.data.throughput.out
            }
          }


          $('#__worker_table_' + cid + '_' + uid+ '_throughput').text(event.data.throughput.in + "/" + event.data.throughput.out)
          
          if(event.data.throughput.timeout) {
            var x = Math.round((currentTime - event.data.throughput.timeout)/1000)
            var y = (event.data.throughput.out/x)

            $('#__worker_table_' + cid + '_' + uid+ '_tout').text(y.toFixed(2) + " m/s")

            if(isFinite(x) && isFinite(y)) {
              charts[cid][uid]['out'].data.labels.push(x)
              charts[cid][uid]['out'].data.datasets[0].data.push(y.toFixed(2))
            }
          } else {
            var x = 0
            var y = 0

            $('#__worker_table_' + cid + '_' + uid+ '_tout').text("0 m/s")

            charts[cid][uid]['out'].data.labels.push(x)
            charts[cid][uid]['out'].data.datasets[0].data.push(y)
          }
      } 
      /*
       * throughput message: contains incoming informations
       * Mostly used for drawing charts purposes
       */
      else if(event.data.type == 'throughin') {
        var currentTime = (new Date).getTime()

        for(var i = 0; i < clusters[cid].workers.length; i++) {
          if(i == clusters[cid].workers.uid) {
            clusters[cid].workers.messages.incoming = event.data.throughput.in
          }
        }

        $('#__worker_table_' + cid + '_' + uid+ '_throughput').text(event.data.throughput.in + "/" + event.data.throughput.out)
        
        if(event.data.throughput.timein) {
          var x = Math.round((currentTime - event.data.throughput.timein)/1000)
          var y = (event.data.throughput.in/x)

          $('#__worker_table_' + cid + '_' + uid+ '_tin').text(y.toFixed(2) + " m/s")

          if(isFinite(x) && isFinite(y)) {
            charts[cid][uid]['in'].data.labels.push(x)
            charts[cid][uid]['in'].data.datasets[0].data.push(y.toFixed(2))
          }
        } else {
          var x = 0
          var y = 0

          $('#__worker_table_' + cid + '_' + uid+ '_tin').text("0 m/s")
          
          charts[cid][uid]['in'].data.labels.push(x)
          charts[cid][uid]['in'].data.datasets[0].data.push(y)
        }
      } 
      /*
       */
      else if(event.data.type == 'writeThoughput') {
        $('#__worker_table_' + cid + '_' + uid+ '_throughput').text(event.data.throughput.in + "/" + event.data.throughput.out)
      }
      /*
       * Sets the controller variables of the operator
       */
      else if(event.data.type == 'controllerVariables') {
        operators[cid].__controllerVariable = event.data.variables
      } 
      /*
       * Worker finished processing a message and asks for more work
       */
      else if(event.data.type == 'free') {
        //console.log('free request')

        // if there are no messages in the queue, then do nothing, worker is free
        if(operators[cid] != undefined) {
          if(operators[cid].__message_pool.length == 0) {
            //TODO this is an old implementation that should be correct for future demos
            var isProducer = false
            for(var i = 0; i < operators[cid].__worker_pool.length; i++) {
              if(operators[cid].__worker_pool[i].uid == uid) {
                isProducer = true
              }
            }

            if(!isProducer) {
              operators[cid].__worker_pool.push(workers[uid])
            }
          } 
          // if there are some messages in the queue, then takes the first message of the queue and forward it to the worker
          else {
            var message = operators[cid].__message_pool.shift()
            operators[cid].__workersID[uid].postMessage(message)

            if(operators[cid].__isSlowMode && operators[cid].__message_pool.length <= controller.slowModeDeactivation) {
              operators[cid].__deactivateSlowMode()
            }
          }

          operators[cid].__throughput.out++

          if(!operators[cid].__workersLastUsed[uid]) {
            operators[cid].__workersLastUsed[uid] = 1
          } else {
            operators[cid].__workersLastUsed[uid]++
          }

          updateGraphics(cid)
        } 
        
        // controller.run(cid)
//      } else if(event.data.type == "getMergedSortList") {
//    	  var workerId = uid
//    	  var content = event.data.content
//    	  now.get_merged_sort_list(uid, content, function(workerId, state) {
//    		  console.log("Received state")
//    		  console.log(state)
//    		  
//    		  worker.postMessage({
//    			  type: "got_mergedList",
//    			  content: state
//    		  })
//    	  })
//      } else if(event.data.type == "incrBySortList") {
//    	  var workerId = uid
//    	  //var content = event.data.content;
//    	  var setName = event.data.setName;
//    	  var incr = event.data.incr;
//    	  var key = event.data.key
//    	  now.incr_by_sort_list(uid, setName, incr, key);
//    	  
      } else if(event.data.type == "statefulCall") {
    	  var name 	= event.data.name;
    	  var args 	= event.data.args;
    	  var token = event.data.token;
    	  
    	  now.statefulOp(name, args, function(result){
    		  worker.postMessage({
    				  type: 'returnFunction',
    				  content: result,
    				  token: token
    	  		});
    	  });
    	  
      } 
      /*
       * The worker registers a join event
       */
      else if(event.data.type == "registerJoin") {
      	operators[cid].isJoin = true;
      }
    	  

      // TODO: nava qui ricevi i messaggi dai worker 
      // any other message: errors and console logs
      else {
        console.log("Worker said: " + event.data);    
      }     
    };
          
    new_process.script_src = scriptFolder + new_process.src;
    P.processes.push(new_process.uid);
    
    clusters[cid].workers.push({
      uid: uid,
      process : worker,
      messages: {
        incoming: 0,
        outgoing: 0
      }
      //no port + host (?)
    });
    
    worker.postMessage(new_process);
    worker.postMessage({
      type: 'forcefree'
    })

    worker.postMessage({
      type: 'drawUI',
      data: drawUI
    })
  }

  now.ready(function(){
    if(globalRandomToken != undefined) {
      console.log('Something went bad, reaload the page')
      return
    }

    now.register_new_remote_node(function(new_node_id, new_alias, random_token) {
        globalRandomToken = random_token
  
        connectPeer(new_node_id, random_token)

        P.uid = new_node_id
        P.alias = new_alias 

        personalID = new_node_id

        // operators = {}

        get_stats()
        // startStatics(new_node_id)
        // console.log('Statistics started')

        console.log('Got new ID : ' + new_node_id)

        jQuery('<h2>', {
          text: 'PID: ' + new_node_id
        }).appendTo('#__header');

        now.notify_path(window.location.pathname, personalID, function(paths) {
            jQuery('<table>', {
              id: '__table_paths',
              class: 'table table-striped',
            }).appendTo('#__paths');  

              jQuery('<tr>', {
                id: '__table_paths_row_header',
              }).appendTo('#__table_paths'); 

                jQuery('<th>', {
                  text: '#'
                }).appendTo('#__table_paths_row_header');

                jQuery('<th>', {
                  text: 'Path'
                }).appendTo('#__table_paths_row_header');

                jQuery('<th>', {
                  text: 'Add'
                }).appendTo('#__table_paths_row_header');

                jQuery('<th>', {
                  text: ''
                }).appendTo('#__table_paths_row_header');

              jQuery('<tr>', {
                id: '__table_paths_row_remote',
              }).appendTo('#__table_paths'); 

                jQuery('<th>', {
                  text: ''
                }).appendTo('#__table_paths_row_remote');

                jQuery('<th>', {
                  text: '/remote'
                }).appendTo('#__table_paths_row_remote');

                jQuery('<th>', {
                  text: ''
                }).appendTo('#__table_paths_row_remote');

                jQuery('<th>', {
                  text: ''
                }).appendTo('#__table_paths_row_remote');

            for(var i = 0; i < paths.length; i++) {
              if(paths[i] != '/remote') {
                var p = paths[i].slice(1)
                // workersPerPath[p] = 0

                jQuery('<tr>', {
                  id: '__table_row_' + p,
                }).appendTo('#__table_paths'); 

                  jQuery('<td>', {
                    id: '__table_row_' + p + '_workers',
                    text: '0'
                  }).appendTo('#__table_row_' + p);

                  jQuery('<td>', {
                    text: paths[i]
                  }).appendTo('#__table_row_' + p); 

                  jQuery('<td>', {
                    id: '__table_row_' + p + '_input'
                  }).appendTo('#__table_row_' + p); 

                    jQuery('<input>', {
                      id: '__input_' + p, 
                      type: 'number'
                    }).appendTo('#__table_row_' + p + '_input'); 

                  jQuery('<td>', {
                    id: '__table_row_' + p + '_button'
                  }).appendTo('#__table_row_' + p); 

                    jQuery('<button>', {
                      id: '__button_' + p,
                      type: 'button',
                      text: 'add'
                    }).appendTo('#__table_row_' + p + '_button'); 

                var addClickListener = function(name) {
                  $('#__button_' + name).click(function(){
                    if($('#__input_' + name).val() > 0) {
                      // if(!pathToUid[name]) {
                        if(pathCluster[name]) {
                          now.add_workers($('#__input_' + name).val(), function(uids) {
                            var cid = pathCluster[name]
                            operators[cid].__addWorker(uids, uids.length, undefined)
                          })
                        } else {
                          pathCluster[name] = {
                            cluster: true,
                            id: undefined
                          }
                          now.remote_request(personalID, "/" + name, $('#__input_' + name).val()) 
                        }

                        // workersPerPath[name] = workersPerPath[name] + $('#__input_' + name).val()
                        // $('#__table_row_' + name + '_workers').text(workersPerPath[name])
                      // } else {
                      //   var uid = pathToUid[name]

                        // now.get_new_uid(cid, "/" + name, $('#__input_' + name).val()) 

                        // workersPerPath[name] = workersPerPath[name] + $('#__input_' + name).val()
                        // $('#__table_row_' + name + '_workers').text(workersPerPath[name])
                      // }
                    }
                  })
                }

                addClickListener(p)
              }
            }
        })
      })
      
      /*
        Called by the ROOT to run a new cluster (which will spawn 1+ workers)
      */
      now.run_cluster =  function(cid, script, workers_number, uids, automatic, alias, cb, random_token, room_name, path){
          //if this is the first element of the cluster then create an entry for the cluster
        if(!clusters[cid]){
          clusters[cid] = {
            cid : cid,
            script: script,
            workers: [],
            producer: !automatic,
          }
        }

        cidInfos[cid] = {
          script: script,
          automatic: automatic,
          random_token: random_token,
          out_room_name: room_name
        }

        // pathCluster
        pathCluster[room_name] = cid

        operators[cid] = {}
        operators[cid].__worker_pool = []
        operators[cid].__workersID = {}
        operators[cid].__workersLastUsed = {}
        operators[cid].__message_pool = []
        operators[cid].__maxWorkers = 0
        operators[cid].__workerCounter = 0
        operators[cid].__alias = alias
        operators[cid].__throughput = {
          startingSampleDate: (new Date()).getTime(),
          in: 0,
          out: 0,
          throughputIn: 0,
          throughputOut: 0
        }
        operators[cid].__topology = {
          in: [],
          out: []
        }
        operators[cid]['in'] = []
        operators[cid]['out'] = []
        operators[cid]['slowOut'] = []
        operators[cid].__pushMessage = push_message.bind(null, cid)
        operators[cid].__addWorker = add_worker.bind(null, cid)
        operators[cid].__deleteWorker = delete_worker.bind(null, cid)
        operators[cid].__sendIn = send_in.bind(null, cid)
        operators[cid].__sendOut = send_out.bind(null, cid)
        operators[cid].__triggerSlowMode = trigger_slow_mode.bind(null, cid)
        operators[cid].__deactivateSlowMode = deactivate_slow_mode.bind(null, cid)

        operators[cid].__roundRobinPosition = 0
        operators[cid].__isSlowMode = false
        
        //variables to handle join
		operators[cid].inConnections = new Array();
		operators[cid].inMessagesReceived = new Array();
		operators[cid].cbOrdering = new Array();

        if($('#__frame_' + cid).length == 0) {
            jQuery('<div>', {
                  id: '__frame_' + cid,
            }).appendTo('#__koala_container');

              jQuery('<div>', {
                  id: '__frame_' + cid + '_title',
                  class: 'row',
              }).appendTo('#__frame_' + cid); 

                jQuery('<h2>', {
                  text: 'UID: ' + cid
                }).appendTo('#__frame_' + cid + '_title'); 

              jQuery('<div>', {
                  id: '__frame_' + cid + '_graphics',
                  style: (presentationMode?"display:none;":"")
              }).appendTo('#__frame_' + cid); 

                jQuery('<div>', {
                  id: '__frame_' + cid + '_graphics_messages',
                }).appendTo('#__frame_' + cid + '_graphics'); 

                jQuery('<div>', {
                  id: '__frame_' + cid + '_graphics_workers',
                }).appendTo('#__frame_' + cid + '_graphics'); 

              jQuery('<div>', {
                  id: '__frame' + cid + '_' + 'workers',
                  class: 'row',
                  style: (presentationMode?"display:none;":"")
              }).appendTo('#__frame_' + cid); 

              jQuery('<div>', {
                  id: '__frame_' + cid + '_charts',
                  class: 'row',
                  style: (presentationMode?"display:none;":"display:none")
              }).appendTo('#__frame_' + cid); 

              jQuery('<table>', {
                  id: '__worker_table_' + cid,
                  class: 'table table-striped'
              }).appendTo('#__frame' + cid + '_' + 'workers'); 

                jQuery('<tr>', {
                  id: '__worker_table_' + cid + '_header',
                  class: 'table-striped'
                }).appendTo('#__worker_table_' + cid);

                  jQuery('<th>', {
                    text: ''
                  }).appendTo('#__worker_table_' + cid + '_header');

                  jQuery('<th>', {
                    text: 'T. in'
                  }).appendTo('#__worker_table_' + cid + '_header');

                  jQuery('<th>', {
                    text: 'Worker ID'
                  }).appendTo('#__worker_table_' + cid + '_header');

                  jQuery('<th>', {
                    text: 'Messages in/out'
                  }).appendTo('#__worker_table_' + cid + '_header');

                  jQuery('<th>', {
                    text: 'T. out',
                    style: "visibility: hidden"
                  }).appendTo('#__worker_table_' + cid + '_header');

                  jQuery('<th>', {
                    text: '',
                    style: "visibility: hidden"
                  }).appendTo('#__worker_table_' + cid + '_header');
        }

        for(var i = 0; i < workers_number; i++) {
          jQuery('<tr>', {
            id: '__worker_table_' + cid +'_row_' + uids[i]
          }).appendTo('#__worker_table_' + cid);

            jQuery('<td>', {
              id: '__worker_table_' + cid + '_' + uids[i]+ '_in'
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<td>', {
              id: '__worker_table_' + cid + '_' + uids[i]+ '_tin'
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<td>', {
              text: uids[i]
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<td>', {
              id: '__worker_table_' + cid + '_' + uids[i]+ '_throughput'
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<td>', {
              id: '__worker_table_' + cid + '_' + uids[i]+ '_tout',
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<td>', {
              id: '__worker_table_' + cid + '_' + uids[i]+ '_out',
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<div>', {
              id: '__frame_' + cid + "_" + uids[i] + '_charts_title'
            }).appendTo('#__frame_' + cid + '_charts');

              jQuery('<h4>', {
                text: 'Worker ' + uids[i]
              }).appendTo('#__frame_' + cid + "_" + uids[i] + '_charts_title');

            jQuery('<div>', {
              id: '__frame_' + cid + "_" + uids[i] + '_charts'
            }).appendTo('#__frame_' + cid + '_charts');

              jQuery('<div>', {
                id: '__frame_' + cid +  "_" + uids[i] + '_charts_in',
                class: 'col-md-6'
              }).appendTo('#__frame_' + cid + "_" + uids[i] + '_charts'); 

                jQuery('<canvas>', {
                  id: '__frame_' + cid +  "_" + uids[i] + '_charts_in_canvas',
                  Height: '150',
                  Width: '200'
                }).appendTo('#__frame_' + cid +  "_" + uids[i] + '_charts_in'); 

              jQuery('<div>', {
                id: '__frame_' + cid +  "_" + uids[i] + '_charts_out',
                class: 'col-md-6'
              }).appendTo('#__frame_' + cid +  "_" + uids[i] + '_charts');

                jQuery('<canvas>', {
                  id: '__frame_' + cid +  "_" + uids[i] + '_charts_out_canvas',
                  Height: '150',
                  Width: '200'
                }).appendTo('#__frame_' + cid +  "_" + uids[i] + '_charts_out'); 

            var closure_drawchart = function(cid, uid, position) {
              if(!charts[cid])
                charts[cid] = {}

              if(!charts[cid][uid])
                charts[cid][uid] = {}

              if(!charts[cid][uid][position])
                charts[cid][uid][position] = {
                  interval: undefined,
                  data: {
                    labels: [0],
                    datasets: [{
                      data: [0]
                    }],
                  },
                  svg: new Chart((document.getElementById('__frame_' + cid +  "_" + uid + '_charts_' + position + '_canvas')).getContext('2d'))
                }

              charts[cid][uid][position].interval = setInterval(function(){
                var raw_data = charts[cid][uid][position].data

                var chart_data = charts[cid][uid][position].data
                if(raw_data.labels.length > chart_points) {
                  var l = raw_data.labels.length - chart_points

                  chart_data = {
                    labels: raw_data.labels.slice(l),
                    datasets: [
                      {
                        data: raw_data.datasets[0].data.slice(l)
                      }
                    ]
                  }
                }

                var min = Math.min.apply(null, chart_data.datasets[0].data) 
                var max = Math.max.apply(null, chart_data.datasets[0].data) 

                var chart_option = {
                  bezierCurve : false,
                  pointDot : true,
                  pointDotRadius : 2,
                  pointDotStrokeWidth : 0,
                  datasetStroke : true,
                  datasetStrokeWidth : 2,
                  datasetFill : false,
                  animation : false,
                  skipLabels: true

                }

                if (max == min) {
                    chart_option.scaleOverride = true,
                    chart_option.scaleSteps = 3,
                    chart_option.scaleStepWidth = 0.5,
                    chart_option.scaleStartValue = max - 1
                }

                charts[cid][uid][position].svg.Line(chart_data, chart_option);
              }, drawChartsDelta)
            }

            closure_drawchart(cid, uids[i], 'in')
            closure_drawchart(cid, uids[i], 'out')
          // run_worker(uids[i], cid, script, !automatic, random_token, room_name)
        }

        // if(room_name == null) {
        //   room_name = cid
        // }

        // var room = 'room_' + random_token + '_' + room_name

        // cidToRoom[cid] = room_name

        // console.log(cid + '_out: Joined room ' + room)
        // operators[cid]['out'] = new DataChannel(room, {
        //   onopen: function(userid) { 
        //     console.log('new user: ' + userid)
        //     var from = (userid.split('_'))[1]
        //     console.log(from)
        //     console.log(cidToRoom[cid])
        //     if(from != cidToRoom[cid]) {
        //       console.log('Opposite end')
        //       if(!operators[cid]['out'].output_table) {
        //         operators[cid]['out'].output_table = []
        //       }
        //       operators[cid]['out'].output_table.push(userid)
        //     }

        //     //   console.log(cid + ' - ' + uid + ' detected connection of ' + userid)

        //     //   operators[cid][uid]['out'].output_table.peers.push(userid)
            
        //     //   operators[cid][uid]['out'].messages = 0
        //     //   workers[uid].postMessage({
        //     //     type: 'bind'l
        //     //   })
        //     //   workers[uid].postMessage({
        //     //     type: 'statout'
        //     //   })
        //     // }

        //     for(var i = 0; i < operators[cid].__workers.length; i++) {
        //       workers[operators[cid].__workers[i]].postMessage({
        //         type: 'bind'
        //       })
        //       workers[operators[cid].__workers[i]].postMessage({
        //         type: 'statout'
        //       })
        //     }
        //   },
        //   onclose: function(event, userid) {
        //     var pos = operators[cid]['out'].output_table.indexOf(userid)
        //     operators[cid]['out'].output_table.splice(pos, 1)

        //     if(pos >= operators[cid]['out'].__roundRobinPosition) {
        //       operators[cid]['out'].__roundRobinPosition--
        //     }
            

        //     //TODO
        //     // for(var i = 0; i < operators[cid].__workers.length; i++) {
        //     //   workers[operators[cid].__workers[i]].postMessage({
        //     //     type: 'unbind'
        //     //   })
        //     // }
        //   },
        //   onmessage: function(message, userid, latency) {
        //     // if(message.type == 'pingRes') {
        //     //   workers[uid].postMessage({
        //     //     type: "out_latency",
        //     //     data: (Date.now()).toString() - message.date
        //     //   })
        //     // } else if (message.type == 'pingReq') {
        //     //   operators[cid][uid]['out'].channels[userid].send({
        //     //     id: personalID,
        //     //     type: 'pingRes',
        //     //     date: message.date
        //     //   })
        //     // }
        //   },
        //   transmitRoomOnce: true,
        //   firebase: firebase,
        //   userid: (Math.round(Math.random() * 60535) + 5000000) + "_" + cidToRoom[cid],
        //   // openSignalingChannel: function (config) {
        //   //   channel = config.channel || this.channel || 'default-channel';
        //   //   var socket = new window.Firebase('https://koalapipeline.firebaseIO.com/' + channel);
        //   //   socket.channel = channel;
        //   //   socket.on('child_added', function (data) {
        //   //       var value = data.val();
        //   //       if (value == 'joking') config.onopen && config.onopen();
        //   //       else config.onmessage(value);
        //   //   });
        //   //   socket.send = function (data) {
        //   //       this.push(data);
        //   //   };
        //   //   socket.push('joking');
        //   //   this.socket = socket;
        //   //   return socket;
        //   // }

        //   // openSignalingChannel: function(config) {
        //   //    var URL = 'http://agora.mobile.usilu.net:9998/';
        //   //    var channel = config.channel || this.channel || 'default-channel';
        //   //    var sender = Math.round(Math.random() * 60535) + 5000;

        //   //    io.connect(URL, {
        //   //       'force new connection': true
        //   //     }).emit('new-channel', {
        //   //       channel: channel,
        //   //       sender : sender
        //   //    });

        //   //    var socket = io.connect(URL + channel, {
        //   //       'force new connection': true}
        //   //    );
        //   //    socket.channel = channel;

        //   //    socket.on('connect', function () {
        //   //       if (config.callback) config.callback(socket);
        //   //    });

        //   //    socket.send = function (message) {
        //   //         socket.emit('message', {
        //   //             sender: sender,
        //   //             data  : message
        //   //         });
        //   //     };

        //   //    socket.on('message', config.onmessage);

        //   //    return socket
        //   // }
        // })

        operators[cid].__workers = []
        
        var i = 0
        var end = workers_number;
        var delayed_creation = function() {
            operators[cid].__workers.push(uids[i])
            run_worker(uids[i], cid, script, !automatic, random_token, room_name)
            i++;
            if( i < workers_number ){
                setTimeout( delayed_creation, 1);
            } 
            if (i == workers_number) {
              cb()
            };
        }

        delayed_creation()
      }

      now.add_bind_table = function(cid, from, to, cb) {
        if(from != undefined) {
          operators[cid].__topology.in.push(from.operator)
        }

        if(to != undefined) {
          operators[cid].__topology.out.push(to.operator)
        }

        cb()
      }

      now.delete_bind_table = function(cid, from, to, cb) {
        if(from != undefined) {
          for(var i in operators[cid].__topology.in) {
            if(operators[cid].__topology.in[i] == from.id) {
              operators[cid].__topology.in.splice(i,1)
            }
          }
        }

        if(to != undefined) {
          for(var i in operators[cid].__topology.out) {
            if(operators[cid].__topology.out[i] == to.id) {
              operators[cid].__topology.out.splice(i,1)
            }
          }
        }

        cb()
      }
      
      /*
        Called by the ROOT to bind a cluster on this browser to another cluster
      */
      now.bind_cluster_remote = function(cid1, cid2, uid2, to, this_node, cb, random_token, room_name){
        console.log('new binding from ' + cid1 + " to " + cid2)

        var bind_worker = function(uid) {
          //TODO really not useful anymore?
        }

        //TODO Check
        if(uid2.uid != to.uid) {
          // if(room_name == null) {
          //   room_name = cid1
          // }

          // var room = 'room_' + random_token + '_' + room_name
          // console.log(cid2 + '_in: Joined room ' + room)
          // if(!operators[cid2]) {
          //   operators[cid2] = {}
          // }

          var p_name = "peer_" + random_token + "_" + to.uid
          var conn = {}
          conn = peerConnection.connect(p_name)

          conn.on('open', function() {
            conn.send(JSON.stringify({
              type: 'configuration',
              from: cid1,
              to: cid2
            }));

            for(var w in operators[cid1].__workersID) {
              operators[cid1].__workersID[w].postMessage({
                type: "bind"
              })
            }

            operators[cid1].__isBinded = true;
            
            //send setup message for join
            conn.send(JSON.stringify({	
            	"type" 					: "_WLS_SETUP",
				"_WLS_SETUP"			: "bind",
				"sender_operator" 		: cid1,
				"sender_operator_alias" : operators[cid1].alias,
				"sender_worker" 		: undefined,
				"receiver"				: cid2
			}));
          })

          conn.on('close', function() {
            console.log('close')

            for(var op in operators[cid1]['out']) {
              if(operators[cid1]['out'][op].to == cid2) {
                operators[cid1]['out'].splice(op, 1)
              }
            }

             for(var op in operators[cid1]['slowOut']) {
              if(operators[cid1]['slowOut'][op].to == cid2) {
                operators[cid1]['slowOut'].splice(op, 1)
              }
            }

            if(operators[cid1]['out'].length+ operators[cid1]['slowOut'].length == 0 ) {
              console.log('Unbind')
              for(var w in operators[cid1].__workersID) {
                operators[cid1].__workersID[w].postMessage({
                  type: "unbind"
                })
              }

              operators[cid1].__isBinded = false
            }
          })

          conn.on('data', function(data) {
            var message = JSON.parse(data)

            if(message.type == 'start_slow_mode') {
              for(var i in operators[cid1].out) {
                if(operators[cid1].out[i].to == message.from) {
                  operators[cid1].out[i].__slowMode = true

                  var tempConn = operators[cid1].out[i]
                  operators[cid1].out.splice(i,1)

                  operators[cid1].slowOut.push(tempConn)
                }
              }
            } else if(message.type = 'stop_slow_mode') {
              for(var i in operators[cid1].slowOut) {
                if(operators[cid1].slowOut[i].to == message.from) {
                  operators[cid1].slowOut[i].__slowMode = false

                  var tempConn = operators[cid1].slowOut[i]
                  operators[cid1].slowOut.splice(i,1)

                  operators[cid1].out.push(tempConn)
                }
              }
            }
          })

          conn.to = cid2
          conn.channelType = 'webrtc'

          operators[cid1]['out'].push(conn)

//           operators[cid2]['in'] = new DataChannel(room, {
//             onopen: function(userid) { 
//               operators[cid2]['in'].messages = 0
//             },
//             onclose: function(event, userid) {
//               //TODO
//             },
//             onmessage: function(message, userid, latency) {
//               if(!message.type) {
//                 message = JSON.parse(message)
//               }

//               if(message.type == 'incoming_message') {
//                 // console.log(message)
//                 operators[cid2].__pushMessage('incoming_message', message.msg)

// //                 if(operators[cid2].__worker_pool.length == 0 || operators[cid2].__message_pool.length != 0) {
// //                   operators[cid2].__message_pool.push(message)
// // //                  console.log(operators[cid2].__message_pool.length)
// //                 } else {
// //                   var worker = operators[cid2].__worker_pool.pop()
// //                   // operators[cid2].__workersLastUsed[worker.uid] = new Date()

// //                   worker.postMessage({
// //                     type: 'incoming_message',
// //                     message: message.msg
// //                   })
// //                 }

// //                 operators[cid2].__throughput.in++
		
// // 		            queueSamples.push(operators[cid2].__message_pool.length)
// //                 updateGraphics(cid2)



//                 // if(operators[cid2].__workers.length > 0) {
//                 //   var wUid = operators[cid2].__workers[operators[cid2]['in'].__roundRobinPosition]

//                 //   workers[wUid].postMessage({
//                 //     type: 'incoming_message',
//                 //     message: message.msg
//                 //   })

//                 //   operators[cid2]['in'].__roundRobinPosition++
//                 //   if(operators[cid2]['in'].__roundRobinPosition == operators[cid2].__workers.length) {
//                 //     operators[cid2]['in'].__roundRobinPosition = 0
//                 //   }
//                 // }


//                 //   workers[uid].postMessage({
//                 //     type: 'incoming_message',
//                 //     message: message.msg
//                 //   })

//                 // if(operators[cid2][uid]['in'].messages == 0) {
//                 //   operators[cid2][uid]['in'].messages = MESSAGE_PER_LATENCY
//                 //   operators[cid2][uid]['in'].send({
//                 //     type: 'pingReq',
//                 //     date: (Date.now()).toString()
//                 //   })
//                 // } else {
//                 //   operators[cid2]['in'].messages--
//                 // }
//               // }  else if(message.type == 'pingRes') {
//               //   workers[uid].postMessage({
//               //     id: message.id,
//               //     type: "in_latency",
//               //     data: (Date.now()).toString() - message.date
//               //   })
//               // } else if (message.type == 'pingReq') {
//               //   operators[cid2][uid]['in'].channels[userid].send({
//               //     id: personalID,
//               //     type: 'pingRes',
//               //     date: message.date
//               //   }) 
//               } 
//             },
//             transmitRoomOnce: true,
//             firebase: firebase,
//             userid: (Math.round(Math.random() * 60535) + 5000000) + "_" + cidToRoom[cid2],
//             // openSignalingChannel: function(config) {
//             //    var URL = 'http://agora.mobile.usilu.net:9998/';
//             //    var channel = config.channel || this.channel || 'default-channel';
//             //    var sender = Math.round(Math.random() * 60535) + 5000;

//             //    io.connect(URL, {
//             //       'force new connection': true
//             //     }).emit('new-channel', {
//             //       channel: channel,
//             //       sender : sender
//             //    });

//             //    var socket = io.connect(URL + channel, {
//             //       'force new connection': true}
//             //    );
//             //    socket.channel = channel;

//             //    socket.on('connect', function () {
//             //       if (config.callback) config.callback(socket);
//             //    });

//             //    socket.send = function (message) {
//             //         socket.emit('message', {
//             //             sender: sender,
//             //             data  : message
//             //         });
//             //     };

//             //    socket.on('message', config.onmessage);

//             //    return socket
//             // }
//           })

          // operators[cid1]['in'].__roundRobinPosition = 0
        

          // for(var i = 0; i < clusters[cid1].workers.length; i++){
          //   var uid = clusters[cid1].workers[i].uid

          //   for(var w = 0; w < clusters[cid1].workers.length; w++){
          //     bind_worker(clusters[cid1].workers[w].uid)
          //   }
          // }

          cb(cid1)
        } else {
          console.log('local connection')

          var conn = {
            send: local_push_message.bind(null, cid2),
            to: cid2,
            channelType: 'local'
          }

          console.log(cid1)
          operators[cid1]['out'].push(conn)
          console.log(operators[cid1]['out'])

          for(var w in workers) {
            workers[w].postMessage({
              type: "bind"
            })
          }

          operators[cid1].__isBinded = true

          cb(cid1)
        }
      }

      // now.bind_cluster_server = function(cid1, cid2, to, this_node){
      //   var from_uids = [];
      //   for(var i = 0; i < clusters[cid1].workers.length; i++){
      //     from_uids.push(clusters[cid1].workers[i].uid);
      //   }
      //   to.channel.koala_node.incoming_connection(from_uids, cid2, this_node, function(proxy){
      //     //proxy.host proxy.port
      //     for(var i = 0; i < clusters[cid1].workers.length; i++){
      //       //send a connection message that the koala_remote.js (worker) can interpret
      //       clusters[cid1].workers[i].process.postMessage(proxy);
      //     }
      //   })
      // }

      now.bind_cluster_server_out = function(cid1, cid2, from, to, protocol, cb){
        var from_uids = [];
        for(var i = 0; i < clusters[cid2].workers.length; i++){
          from_uids.push(clusters[cid2].workers[i].uid);
        }

        cb(from_uids, clusters[cid2].workers,function(proxy, cb2) {
          open_new_socket_connection(proxy.host, proxy.port, cid1, cid2, from, to, protocol, false, cb2)

          // // var bind_worker = function(uid) {
          // //   //TODO really useful anymore?
          // // }

          // // more than one server connection
          // var conn = new WebSocket('ws://'+proxy.host+':'+proxy.port)
          // conn.onmessage = function(msg){
          //   // //console.log(msg.data)
          //   // workers[uid].postMessage({
          //   //   type: 'incoming_message',
          //   //   message: msg.data
          //   // })  
          // }
          
          // conn.onopen = function() {
          //   // for(var i = 0; i < clusters[cid2].workers.length; i++){
          //     conn.send(JSON.stringify({cmd: 'setup', out: cid2}));
          //   // }

          //   for(var i = 0; i < operators[cid2].__workers.length; i++) {
          //     workers[operators[cid2].__workers[i]].postMessage({
          //       type: 'bind'
          //     })
          //     workers[operators[cid2].__workers[i]].postMessage({
          //       type: 'statout'
          //     })
          //   }


          //   console.log('Socket connection opened with server')
          //   // if(!operators[cid2]['out'].output_table) {
          //   //     operators[cid2]['out'].output_table = []
          //   // }
            
          //   // operators[cid2]['out'].output_table.push('__server' /* + '_' + serverCounter.out*/)
          //   //serverCounter.out++

          //   // console.log('output_table')
          //   // console.log(operators[cid2]['out'].output_table)

          //   // boundWorkers[uid] = true
          //   // workers[uid].postMessage({
          //   //   type: 'statout'
          //   // }) 
          // }
          
          // conn.onclose = function() {
          //   // for(var i = 0; i < operators[cid2].__workers.length; i++) {
          //   //   workers[operators[cid2].__workers[i]].postMessage({
          //   //     type: 'unbind'
          //   //   })
          //   // } 
          //   // console.log('Closing')
          //   // var pos = operators[cid2]['out'].output_table.indexOf('__server')
          //   // operators[cid2]['out'].output_table.splice(pos, 1)

          //   // if(pos >= operators[cid2]['out'].__roundRobinPosition) {
          //   //   operators[cid2]['out'].__roundRobinPosition--
          //   // }

          //   // console.log("CLOSED CONNECTION");
          //   if(operators[cid2] != undefined) {
          //      for(var op in operators[cid2]['out']) {
          //       if(operators[cid2]['out'][op].to == cid1) {
          //         operators[cid2]['out'].splice(op, 1)
          //       }
          //     }

          //     if(operators[cid2]['out'].length == 0) {
          //       console.log('Unbind')
          //       for(var w in operators[cid2].__workersID) {
          //         operators[cid2].__workersID[w].postMessage({
          //           type: "unbind"
          //         })
          //       }

          //       operators[cid2].__isBinded = false
          //     }
          //   } 

          //   console.log('Closed socket outgoing connection')
          // }
          
          // conn.onerror = function(evt) {
          //   console.log("WEBSOCKET CONNECTION ERROR: " + evt.data);
          // }

          // conn.to = cid1
          // operators[cid2]['out'].push(conn)

          // for(var i = 0; i < clusters[cid2].workers.length; i++){
          //   bind_worker(clusters[cid2].workers[i].uid)
          // }

          cb2(cid2)
        })
      }

      now.bind_cluster_server_in = function(cid1, cid2, from, to, protocol, cb){
        // operators[cid2].serverIn = true
        var from_uids = [];
        for(var i = 0; i < clusters[cid2].workers.length; i++){
          from_uids.push(clusters[cid2].workers[i].uid);
        }

        cb(from_uids, clusters[cid2].workers,function(proxy, cb2) {
          open_new_socket_connection(proxy.host, proxy.port, cid1, cid2, from, to, protocol, true, cb2)

          // var bind_worker = function(uid) {
          // //   //TODO really not useful anymore?
          // }


          // var conn = new WebSocket('ws://'+proxy.host+':'+proxy.port)
            
          // conn.onmessage = function(msg){
          //   // if(operators[cid2].__workers.length > 0) {
          //     // var wUid = operators[cid2].__workers[operators[cid2]['in'].__roundRobinPosition]

          //     var message = JSON.parse(msg.data)
          //     var options = message.options

          //     if(options == undefined || typeof options !== 'object') {
          //       options = {
          //         __checkpoints: []
          //       }
          //     } else if(options.__checkpoints == undefined) {
          //       options.__checkpoints = []
          //     }

          //     var timestamp = new Date().getTime()
          //     var last_checkpoint = options.__checkpoints[options.__checkpoints.length-1]
          //     var ping = timestamp - last_checkpoint.timestamp

          //     var counter = 0
          //     for(var w in workers) {
          //       if(workers[w] != undefined) {
          //         counter++
          //       } 
          //     }

          //     options.__checkpoints.push({
          //       operator: cid2,
          //       event: 'message received',
          //       timestamp: timestamp,
          //       battery: controller.battery.level,
          //       cpu: counter / controller.concurrency,
          //       ping: ping,
          //       worker_number: operators[cid2].__workerCounter,
          //       queue: operators[cid2].__message_pool.length
          //     })

          //     options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(message.data) + sizeof(options)

          //     operators[cid2].__pushMessage('incoming_message', JSON.stringify(message.data), options)

          //     // workers[wUid].postMessage({
          //     //   type: 'incoming_message',
          //     //   message: JSON.stringify(JSON.parse(msg.data).data)
          //     // })

          //     // operators[cid2]['in'].__roundRobinPosition++
          //     // if(operators[cid2]['in'].__roundRobinPosition == operators[cid2].__workers.length) {
          //     //   operators[cid2]['in'].__roundRobinPosition = 0
          //     // }
          //   // }

          //   // workers[uid].postMessage({
          //   //   type: 'incoming_message',
          //   //   message: JSON.stringify(JSON.parse(msg.data).data)
          //   // })  
          // }
          
          // conn.onopen = function() {
          //   console.log('Opened channel: sending setup')
          //   // for(var i = 0; i < clusters[cid2].workers.length; i++){
          //     conn.send(JSON.stringify({cmd: 'setup', in: cid2}));
          //   // }
            
          // }
          
          // conn.onclose = function() {
          //   if(operators[cid2] != undefined) {
          //     for(var op in operators[cid2]['in']) {
          //       if(operators[cid2]['in'][op].from == cid1) {
          //         operators[cid2]['in'].splice(op, 1)
          //       }
          //     }
          //   }

          //   console.log('Closed socket incoming connection')
          // }
          
          // conn.onerror = function(evt) {
          //   console.log("WEBSOCKET CONNECTION ERROR: " + evt.data);
          // }

          // for(var i = 0; i < clusters[cid2].workers.length; i++){
          //   bind_worker(clusters[cid2].workers[i].uid)
          // }

          // console.log('Done setting in')
          // // operators[cid2]['in'].__roundRobinPosition = 0

          // conn.from = cid1
          // operators[cid2]['in'].push(conn)

          cb2(cid2)
        })

        // from.channel.koala_node.incoming_connection(from_uids, cid2, to, function(proxy){
        //   //proxy.host proxy.port
        //   for(var i = 0; i < clusters[cid2].workers.length; i++){
        //     //send a connection message that the koala_remote.js (worker) can interpret
        //     clusters[cid2].workers[i].process.postMessage(proxy);
        //   }
        // })
       // for(var i = 0; i < clusters[cid2].workers.length; i++){
       //    var uid = clusters[cid2].workers[i].uid

       //    directConnection(cid2, cid1, uid, 'in',
       //      //onopen
       //      function(userid) { 
       //        // workers[uid].postMessage({
       //        //   type: 'bind'
       //        // })
       //      },
       //      //onmessage
       //      function(message) {
       //        workers[uid].postMessage({
       //          type: 'incoming_message',
       //          message: message
       //        })
       //      },
       //      //onclose
       //      function(event) {

       //      })
       //  }
      }
      
      /*
        Called by the server to run a new process
      */
      now.run_process = function( new_process, cb ) {
        //run command, start web worker(s) with js code
        
              var worker = new Worker('js/koala_remote.js');
              // worker.states = {};
              workers[new_process.uid] = worker;

              worker.onerror = function(event){
                throw new Error(JSON.stringify(event));
              };
        
              worker.onmessage = function(event) {
                // this is called if the message arrives from a setState.           
                // if(event.data["IsNotify"] && event.data.IsNotify){
                  
                    // notifyMe(event.data.Object);
                  
                  //worker.states[event.data.States] = event.data.Values; 
                //  for (x = 0; x < event.data.States.length; x++){
                  //      worker.states[event.data.States[x]] = event.data.Values[x]
                    //  }
                  
                //  console.log(worker.states[event.data.state])            
                //  if(event.data["Callback"]){
                  //  console.log("got in cb call too");
                //    eval(event.data.Callback) //DEPRECATED
                    
                  
              //      watch(worker.states,event.data.States, cb )}
                  // }
                  // else
              console.log("Worker said: " + event.data);
        };
        
        new_process.script_src = 'scripts/'+new_process.src;
        
        P.processes.push(new_process.uid);

        worker.postMessage(new_process);
        
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

        now.add_worker = function(cid, uids, workers_number, cb) {
          operators[cid].__addWorker(uids, workers_number, cb)
        }

        now.delete_worker = function(cid, uid, cb) {
          operators[cid].__deleteWorker(uid, cb)
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
          cb(clusters[cid].workers, cid);
        }

        now.remove_cluster = function(cid, cb) {
          // console.log('@@@@ remove cluster')
          console.log(operators[cid].__workers)
          for(var i in operators[cid].__workers) {
            console.log(operators[cid].__workers[i])
            operators[cid].__deleteWorker(operators[cid].__workers[i], function(){
              console.log('Deleted worker')
            })
          }

          $('#__frame_' + cid).remove()

          delete operators[cid]
          delete cidInfos[cid]
          delete cidToRoom[cid]

          updateGraphics(cid)
          cb()
        }

        now.get_clusters = function(cb, index) {
          var c = []

          for(var i in operators) {
            c.push({
              cid: i,
              workers: {length: operators[i].__workerCounter},
              alias: operators[i].alias,
              script: cidInfos[i]['script'],
              producer: cidInfos[i]['automatic']
            })
          }

          cb(c, index)
        }

        /*
        Called by the server to bind a process on this browser to the proxy
      */
      now.bind_process_node = function(msg, cb){
        workers[msg.uid].postMessage(msg);
        cb(true);
      };

      // now.unbind_migrate = function(cid, cb){
      //   console.log('unbind migrate with ' + cid)
        
      //   for(var i = 0; i < operators[cid].__workers.length; i++) {
      //     workers[operators[cid].__workers[i]].postMessage({
      //       type: 'unbind'
      //     })
      //   } 

      //   operators[cid].__isBinded = false

      //   for(var opin in operators[cid]['in']) {
      //     if(operators[cid]['in'][opin].to ==)

      //     if(operators[cid]['in'][opin].leave) {
      //       operators[cid]['in'][opin].leave()
      //     } else if(operators[cid]['in'][opin].close) {
      //       operators[cid]['in'][opin].close()
      //     }
      //   }

      //   for(var opout in operators[cid]['out']) {
      //     if(operators[cid]['out'][opout].leave) {
      //       operators[cid]['out'][opout].leave()
      //     } else if(operators[cid]['out'][opout].close) {
      //       operators[cid]['out'][opout].close()
      //     }
      //   }

      //   operators[cid]['in'] = []
      //   operators[cid]['out'] = []

      //   cb(cid)
      // }

      // now.unbind_remote = function(cid, cb){
      //   console.log('unbind ' + cid)

      //   if(operators[cid] && operators[cid].__workers) {
      //     for(var i = 0; i < operators[cid].__workers.length; i++) {
      //       workers[operators[cid].__workers[i]].postMessage({
      //         type: 'unbind'
      //       })
      //     } 
          
      //     if(operators[cid]['in'].leave) {
      //       operators[cid]['in'].leave()
      //     } else {
      //       operators[cid]['in'].close()
      //     }

      //     operators[cid].__isBinded = false

      //     operators[cid]['in'] = undefined
      //   }

      //   cb(cid)
      // }

      now.unbind_remote_out = function(cid1, cid2, cb){
        // console.log('unbind remote out with ' + cid2)

        for(var c in operators[cid1]['out']) {
          if(operators[cid1]['out'][c].to == cid2) {
	        operators[cid1]['out'][c].send(JSON.stringify({
				"_WLS_SETUP"			: "unbind",
				"sender_operator" 		: cid1,
				"sender_operator_alias" : operators[cid1].alias,
				"sender_worker" 		: undefined
			}));
          	
            // console.log('Closing ' + operators[cid1]['out'][c].channelType)
            if(operators[cid1]['out'][c].channelType == 'socket' || operators[cid1]['out'][c].channelType == 'local') {
              operators[cid1]['out'].splice(c, 1)
            } else {
              operators[cid1]['out'][c].close()
            }
          }
        }

        for(var c in operators[cid1]['slowOut']) {
          if(operators[cid1]['slowOut'][c].to == cid2) {
          	operators[cid1]['out'][c].send(JSON.stringify({
          		"type"					: "",
				"_WLS_SETUP"			: "unbind",
				"sender_operator" 		: cid1,
				"sender_operator_alias" : operators[cid1].alias,
				"sender_worker" 		: undefined
			}));
            // console.log('Closing ' + operators[cid1]['slowOut'][c].channelType)
            if(operators[cid1]['slowOut'][c].channelType == 'socket' || operators[cid1]['out'][c].channelType == 'local') {
              operators[cid1]['slowOut'].splice(c, 1)
            } else {
              operators[cid1]['slowOut'][c].close()
            }
          }
        }

        if(operators[cid1]['out'].length + operators[cid1]['slowOut'].length == 0) {
          // console.log('Unbind')
          for(var w in operators[cid1].__workersID) {
            operators[cid1].__workersID[w].postMessage({
              type: "unbind"
            })
          }

          operators[cid1].__isBinded = false;
        }

        cb(cid1)
      }

      now.unbind_remote_in = function(cid1, cid2, cb){
        // console.log('unbind remote in with ' + cid1)

        for(var c in operators[cid2]['in']) {
          if(operators[cid2]['in'][c].from == cid1) {
            // console.log('Closing ' + operators[cid2]['in'][c].channelType)
            if(operators[cid2]['in'][c].channelType != 'socket') {
                operators[cid2]['in'][c].close()
            } else {
              operators[cid2]['in'].splice(c, 1)
            }
          }
        }
        
        //join unbind
        operators[cid2].inConnections[cid1] = undefined;
		operators[cid2].cbOrdering.splice(operators[cid2].cbOrdering.indexOf(cid1), 1);

        cb(cid2)
      }

      now.notifyStats = function(pid, cb) {
        var stats = controller.notifyStats()
        cb(stats, pid)
      }
      
      //TODO: AGGIUNGI QUI LE COSE NAVA
      

      // now.unbind_remote_in = function(cid, cb){
      //   if(operators[cid] && operators[cid].__workers) {
      //     for(var i = 0; i < operators[cid].__workers.length; i++) {
      //       workers[operators[cid].__workers[i]].postMessage({
      //         type: 'unbind'
      //       })
      //     } 

      //     // console.log('here')
      //     // console.log(cid)
      //     // console.log(operators[cid]['in'])
      //     for(var c in operators[cid]['in']) {
      //       try {
      //         if(operators[cid]['in'][c].leave) {
      //           operators[cid]['in'][c].leave()
      //         } else {
      //           operators[cid]['in'][c].close()
      //         }
      //         // console.log('here')
      //       } catch(err) {

      //       }
      //     }

      //     operators[cid].__isBinded = false

      //     operators[cid]['in'] = []
      //   }

      //   cb(cid)
      // }

        
        //old code, may be deleted in the near future
        /*else if(json["data"] && json["from"] && json["to"]){
            //it's a message for one of our workers
            workers[json["to"]].webkitPostMessage(json.buffer, [json.buffer]);
      }*/
      
  })
});

var updateGraphics = function(cid) {
  if(operators[cid]) {
    var timespan = (new Date().getTime() - operators[cid].__throughput.startingSampleDate)/1000
    operators[cid].__throughput.throughputIn = operators[cid].__throughput.in / timespan
    operators[cid].__throughput.throughputOut = operators[cid].__throughput.out / timespan

    $('#__frame_' + cid + '_graphics_messages').html(Math.ceil(operators[cid].__throughput.throughputIn) + ' messages/s -> [' + operators[cid].__message_pool.length + '] -> ' + Math.ceil(operators[cid].__throughput.throughputOut) + ' messages/s')
    var ids = '[ '
    for(var key in operators[cid].__worker_pool) {
      ids += operators[cid].__worker_pool[key].uid + ' - '
    }
    ids += ' ]'
    $('#__frame_' + cid + '_graphics_workers').html(ids)
  }
}

var getChartValuesExcel = function(pid, cid, position) {
  var s = ''
  for(var i = 0; i < charts[pid][cid][position].data.labels.length; i ++) {
    s += charts[pid][cid][position].data.labels[i] + ' ' + charts[pid][cid][position].data.datasets[0].data[i] + '\n'
  }
  console.log(s)
}

var getQueueSamples = function() {
	var sampledQueue = ""

	for(var i = 0; i < queueSamples.length; i++) {
  		sampledQueue += queueSamples[i] + ", "
	}

	console.log(sampledQueue)
}

var connectPeer = function(id, r_token) {
  if(!isPeerConnected) {
    console.log('Connecting ')
    peerName = "peer_" + r_token + '_' + id 
    // peerConnection = new Peer(peerName, {
    //   key: peerAPIKey,
    //   debug: 3
    // })


    peerConnection = new Peer(peerName, {
      host: peerHost, 
      port: peerPort, 
      path: peerRoute,
      // debug: 3
    });

    peerConnection.on('open', function(){
      console.log('Peer connected to signaling server: ' + peerName)
      isPeerConnected = true
    })

    peerConnection.on('close', function(){
      console.log('Peer closed from signaling server')
      // isPeerConnected = false
      // connect(id, r_token)
      // peerConnection.reconnect()
    })

    peerConnection.on('disconnected', function(){
      console.log('Peer disconnected from signaling server')
      // isPeerConnected = false
      // connect(id, r_token)
      peerConnection.reconnect()
    })

    peerConnection.on('error', function(err){
      console.log('Peer error')
      console.log(err)

      // if(err.type == 'network') {
        // peerConnection.reconnect()
      // } else {
        // peerConnection.destroy()
        // peerConnection = undefined
        // isPeerConnected = false
        // connectPeer(id, r_token)
      // }

      // peerConnection.reconnect()
      // isPeerConnected = false
    })

    peerConnection.on('connection', function(conn) {
      console.log('New connection from peer: ' + conn.peer)

      var from = undefined
      var cid = undefined

      conn.on('data', function(data) {
        data = JSON.parse(data)
        var type = data.type;
        
        if(type == "_WLS_SETUP"){
        	/*
				Check if this is a message from the stream or a message from the setup.
				The following means that *this* worker will receive (or not receive anymore) messages
				from the workers that sent the _WLS_SETUP message. 
			*/
			if(data._WLS_SETUP == "bind"){
				var w = data.sender_operator;
				console.log("dentro bind");
				//check to avoid doing double the thing when more than one worker for the same operator connect
				if(!operators[data.receiver].inConnections[w]){
					operators[data.receiver].inConnections[w] = true;
					operators[data.receiver].cbOrdering.push(w);
					console.log(w, operators[data.receiver].inConnections);
				}
				return;
			}
			
			else if(data._WLS_SETUP == "unbind"){
				var w = data.sender_operator;
				operators[data.receiver].inConnections[w] = undefined;
				operators[data.receiver].cbOrdering.splice(ordering.indexOf(w), 1);
				return;
			}
        }

        if(type == 'incoming_message') {
          var fromCid = data.from;
          
          var options = data.options
          
          if(options == undefined || typeof options !== 'object') {
            options = {
              __checkpoints: []
            }
          } else if(options.__checkpoints == undefined) {
            options.__checkpoints = []
          }

          var timestamp = new Date().getTime()
          var ping = timestamp

          var counter = 0
          for(var w in workers) {
            if(workers[w] != undefined) {
              counter++
            } 
          }

          options.__checkpoints.push({
            peer: personalID,
            operator: cid,
            event: 'message received',
            timestamp: timestamp,
            battery: controller.battery.level,
            cpu: counter / controller.concurrency,
            ping: ping,
            worker_number: operators[cid].__workerCounter,
            queue: operators[cid].__message_pool.length
          })

          options.__checkpoints[options.__checkpoints.length-1].m_size = sizeof(data.msg) + sizeof(options)

          operators[cid].__pushMessage('incoming_message', data.msg, options, fromCid)
        } else if(type == 'configuration') {
          from = data.from
          cid = data.to

          conn.from = from

          console.log('New configuration: ' + from + " to " + cid)

          operators[cid]['in'].push(conn);
        } else {
          console.log(data)
        }
      })
      
      conn.on('close', function() {
        for(var p in operators[cid].__topology.in) {
          if(operators[cid].__topology.in[p] == from) {
            operators[cid].__topology.in.splice(p,1)
          }
        }
      })
    })
  }
}



var foo = function(id) {
	now.get_state(id, function(id, state) {
		console.log(id, state)
	})
}
