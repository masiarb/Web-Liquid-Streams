/**
 * Koala Bootloader
 */

var personalID
var connections = {}
var workers = new Array();
var MESSAGE_PER_LATENCY = 10

var addedHtml = {}
var addedScript = {}

var firebase = 'koalapipeline'

var workersPerPath = {}

var bindedWorker = {}

var pathToUid = {}
var cidToRoom = {}
var cidInfos = {}

var chart_points = 10
var drawChartsDelta = 3000
var charts = {}

var isDataChannelSupported = undefined
var isMobile = undefined
var battery = undefined
var isBattery = false
var isGeolocation = undefined
var navigatorInfos = {}
var mapCanvas = document.getElementById('map_canvas');
var map = undefined

/*
	Test function to manage the stream. Is directly called
	from the webpage (thus is case study-specific). It's
	task is to dispatch the stream to all the workers in 
	the webpage. The worker(s), in the case study, will then
	send the stream to the proxy.
*/


var producer_handler = function(stream){
	for(var w in workers){
		workers[w].postMessage({
			type : 'producer',
			data : stream,
		});
	}
}


$(document).ready(function(){

	// To manage the local node configuration
	P = {}
	P.processes = []
	var clusters = new Array();

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

    isDataChannelSupported = window.IsDataChannelSupported = !((moz && !navigator.mozGetUserMedia) || (!moz && !navigator.webkitGetUserMedia));
    jQuery('<div>', {
        id: '__datachannelSupport',
        class: 'row'
    }).appendTo('#__important_infos'); 

      jQuery('<h5>', {
        text: 'Datachannel Supported: ' + isDataChannelSupported
      }).appendTo('#__datachannelSupport'); 

    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
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

    if(navigator.battery || navigator.webkitBattery || navigator.mozBattery) {
      isBattery = true
      battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery
    }

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

    if(navigator.geolocation) {
      isGeolocation = true
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
  }

	/*
		Function to run single workers
	*/
	var run_worker = function(uid, cid, script, producer, random_token, room_name){
    if(room_name == null) {
      room_name = cid
    }

		var worker = new Worker('js/koala_remote.js');

		worker.states = {};
		workers[uid] = worker;

		worker.onerror = function(event){
			throw new Error(JSON.stringify(event));
		};
		
		var new_process = {
      type: 'script',
      uid: uid,
      src: script,
      pid: personalID
    }
					
	    worker.onmessage = function(event) {
			// this is called if the message arrives from a setState. 
	  		if(event.data["IsNotify"] && event.data.IsNotify){
	  			notifyMe(event.data.Object);
	  		}
	  		else if(event.data.type == "send") {
          var m = JSON.stringify({
            type: 'incoming_message',
            from: uid,
            msg: event.data.message
          })


          // ROUND ROBIN
          if(connections[cid][uid]['out'].output_table) {
            var usr = connections[cid][uid]['out'].output_table.peers[connections[cid][uid]['out'].output_table.position]
            connections[cid][uid]['out'].output_table.position++
            if(connections[cid][uid]['out'].output_table.position == connections[cid][uid]['out'].output_table.peers.length) {
              connections[cid][uid]['out'].output_table.position = 0
            }

            connections[cid][uid]['out'].channels[usr].send(m)
          } else {
            connections[cid][uid]['out'].send(m)
          }

          if(connections[cid][uid]['out'].messages == 0) {
            connections[cid][uid]['out'].messages = MESSAGE_PER_LATENCY
            connections[cid][uid]['out'].send({
              type: 'pingReq',
              date: (Date.now()).toString()
            })
          } else {
            connections[cid][uid]['out'].messages--
          }
        } else if(event.data.type == "domGet") {
          var m = event.data
          if($){
            worker.postMessage({
              type: "domGet",
              identifier: m.identifier,
              command: m.command,
              data: $(m.identifier)[m.command]()
            })
          }
        } else if(event.data.type == "domSet") {
          var m = event.data
          if($){
            $(m.identifier)[m.command](m.value, m.extra)
          }
        } else if(event.data.type == "addHtml") {
          var html = event.data.html
          var id = event.data.identifier
          
          if(!addedHtml[id]) {
            $('#__frame_' + cid).append('<div class="row">' + html + '</div>')
            addedHtml[id] = true
          }
        } else if(event.data.type == "addScript") {
          var html = event.data.html
          var scriptSrc = event.data.script

          if(!addedScript[id]) {
            var head= document.getElementsByTagName('head')[0];
            var script= document.createElement('script');
            script.type = 'text/javascript';
            script.src = scriptSrc;

            head.appendChild(script);

            addedScript[id] = true
          }
        } else if(event.data.type == 'throughout') {
            var now = (new Date).getTime()
            $('#__worker_table_' + cid + '_' + uid+ '_throughput').text(event.data.throughput.in + "/" + event.data.throughput.out)
            
            if(event.data.throughput.timeout) {
              var x = Math.round((now - event.data.throughput.timeout)/1000)
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
        } else if(event.data.type == 'throughin') {
          var now = (new Date).getTime()
          $('#__worker_table_' + cid + '_' + uid+ '_throughput').text(event.data.throughput.in + "/" + event.data.throughput.out)
          
          if(event.data.throughput.timein) {
            var x = Math.round((now - event.data.throughput.timein)/1000)
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
        } else {
          console.log("Worker said: " + event.data);		
        }			
		};
					
		new_process.script_src = 'scripts/'+new_process.src;
		
		P.processes.push(new_process.uid);
		
		clusters[cid].workers.push({
			uid: uid,
			process : worker,

			//no port + host (?)
		});
		
		worker.postMessage(new_process);

    var room = 'room_' + random_token + '_' + room_name

    cidToRoom[cid] = room_name

    console.log(cid + " - " + uid + ' - out: Joined room ' + room)
    connections[cid][uid] = {}
    connections[cid][uid]['out'] = new DataChannel(room, {
      onopen: function(userid) { 
        var from = (userid.split('_'))[1]
        if(from != cidToRoom[cid]) {
          if(!connections[cid][uid]['out'].output_table) {
            connections[cid][uid]['out'].output_table = {
              position: 0,
              peers: []
            }
          }

          console.log(cid + ' - ' + uid + ' detected connection of ' + userid)

          connections[cid][uid]['out'].output_table.peers.push(userid)
        
          connections[cid][uid]['out'].messages = 0
          workers[uid].postMessage({
            type: 'bind'
          })
          workers[uid].postMessage({
            type: 'statout'
          })
        }
      },
      onclose: function(event) {
        console.log('Closed')
        workers[uid].postMessage({
          type: 'unbind'
        })
      },
      onmessage: function(message, userid, latency) {
        if(message.type == 'pingRes') {
          workers[uid].postMessage({
            type: "out_latency",
            data: (Date.now()).toString() - message.date
          })
        } else if (message.type == 'pingReq') {
          connections[cid][uid]['out'].channels[userid].send({
            id: personalID,
            type: 'pingRes',
            date: message.date
          })
        }
      },
      transmitRoomOnce: true,
      firebase: firebase,
      userid: (Math.round(Math.random() * 60535) + 5000000) + "_" + cidToRoom[cid],
      // openSignalingChannel: function (config) {
      //   channel = config.channel || this.channel || 'default-channel';
      //   var socket = new window.Firebase('https://koalapipeline.firebaseIO.com/' + channel);
      //   socket.channel = channel;
      //   socket.on('child_added', function (data) {
      //       var value = data.val();
      //       if (value == 'joking') config.onopen && config.onopen();
      //       else config.onmessage(value);
      //   });
      //   socket.send = function (data) {
      //       this.push(data);
      //   };
      //   socket.push('joking');
      //   this.socket = socket;
      //   return socket;
      // }

      // openSignalingChannel: function(config) {
      //    var URL = 'http://agora.mobile.usilu.net:9998/';
      //    var channel = config.channel || this.channel || 'default-channel';
      //    var sender = Math.round(Math.random() * 60535) + 5000;

      //    io.connect(URL, {
      //       'force new connection': true
      //     }).emit('new-channel', {
      //       channel: channel,
      //       sender : sender
      //    });

      //    var socket = io.connect(URL + channel, {
      //       'force new connection': true}
      //    );
      //    socket.channel = channel;

      //    socket.on('connect', function () {
      //       if (config.callback) config.callback(socket);
      //    });

      //    socket.send = function (message) {
      //         socket.emit('message', {
      //             sender: sender,
      //             data  : message
      //         });
      //     };

      //    socket.on('message', config.onmessage);

      //    return socket
      // }
    })
	}

	now.ready(function(){

		/*
			Call the server: notify we are here ready to do stuff
		*/
		now.register_new_remote_node(function(new_node_id, new_alias) {
   		
   			P.uid = new_node_id
   			P.alias = new_alias 

        personalID = new_node_id

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
                workersPerPath[p] = 0

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
                        now.remote_request(personalID, "/" + name, $('#__input_' + name).val()) 

                        workersPerPath[name] = workersPerPath[name] + $('#__input_' + name).val()
                        $('#__table_row_' + name + '_workers').text(workersPerPath[name])
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
   		now.run_cluster =  function(cid, script, workers_number, uids, automatic, alias, cb, random_token, room_name){
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

        connections[cid] = {}

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
                  id: '__frame' + cid + '_' + 'workers',
                  class: 'row'
              }).appendTo('#__frame_' + cid); 

              jQuery('<div>', {
                  id: '__frame_' + cid + '_charts',
                  class: 'row'
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
                    text: 'In'
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
                    text: 'T. out'
                  }).appendTo('#__worker_table_' + cid + '_header');

                  jQuery('<th>', {
                    text: 'Out'
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
              id: '__worker_table_' + cid + '_' + uids[i]+ '_tout'
            }).appendTo('#__worker_table_' + cid +'_row_' + uids[i]);

            jQuery('<td>', {
              id: '__worker_table_' + cid + '_' + uids[i]+ '_out'
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
  			
        var i = 0
        var end = workers_number;
        var delayed_creation = function() {
            run_worker(uids[i], cid, script, !automatic, random_token, room_name)
            i++;
            if( i < workers_number ){
                setTimeout( delayed_creation, 1000 );
            } 
            if (i == workers_number) {
              cb()
            };
        }

        delayed_creation()
   		}
   		
   		/*
   			Called by the ROOT to bind a cluster on this browser to another cluster
   		*/
   		now.bind_cluster_remote = function(cid1, cid2, uid2, to, this_node, cb, random_token, room_name){
        var bind_worker = function(uid) {
          if(room_name == null) {
            room_name = cid1
          }

          console.log('STO BINDANDO')
          console.log('da ' + cid1 + ' a ' + cid2)

          var room = 'room_' + random_token + '_' + room_name
          console.log(cid2 + " - " + uid + ' - in: Joined room ' + room)
          if(!connections[cid2]) {
            connections[cid2] = {}
          }
          if(!connections[cid2][uid]) {
            connections[cid2][uid] = {}
          }
          connections[cid2][uid]['in'] = new DataChannel(room, {
            onopen: function(userid) { 
              connections[cid2][uid]['in'].messages = 0
            },
            onclose: function(event) {

            },
            onmessage: function(message, userid, latency) {
              if(!message.type) {
                message = JSON.parse(message)
              }

              if(message.type == 'incoming_message') {
                  workers[uid].postMessage({
                    type: 'incoming_message',
                    message: message.msg
                  })

                if(connections[cid2][uid]['in'].messages == 0) {
                  connections[cid2][uid]['in'].messages = MESSAGE_PER_LATENCY
                  connections[cid2][uid]['in'].send({
                    type: 'pingReq',
                    date: (Date.now()).toString()
                  })
                } else {
                  connections[cid2][uid]['in'].messages--
                }
              } else if(message.type == 'pingRes') {
                workers[uid].postMessage({
                  id: message.id,
                  type: "in_latency",
                  data: (Date.now()).toString() - message.date
                })
              } else if (message.type == 'pingReq') {
                connections[cid2][uid]['in'].channels[userid].send({
                  id: personalID,
                  type: 'pingRes',
                  date: message.date
                })
              }
            },
            transmitRoomOnce: true,
            firebase: firebase,
            userid: (Math.round(Math.random() * 60535) + 5000000) + "_" + cidToRoom[cid2],
            // openSignalingChannel: function(config) {
            //    var URL = 'http://agora.mobile.usilu.net:9998/';
            //    var channel = config.channel || this.channel || 'default-channel';
            //    var sender = Math.round(Math.random() * 60535) + 5000;

            //    io.connect(URL, {
            //       'force new connection': true
            //     }).emit('new-channel', {
            //       channel: channel,
            //       sender : sender
            //    });

            //    var socket = io.connect(URL + channel, {
            //       'force new connection': true}
            //    );
            //    socket.channel = channel;

            //    socket.on('connect', function () {
            //       if (config.callback) config.callback(socket);
            //    });

            //    socket.send = function (message) {
            //         socket.emit('message', {
            //             sender: sender,
            //             data  : message
            //         });
            //     };

            //    socket.on('message', config.onmessage);

            //    return socket
            // }
          })

          console.log('HO CREATO')
          console.log(connections)
          
          // connections[cid1][uid]['out'].on('channelMessage', function (peer, label, data) {
          //   console.log("WebRTC recieved")
          //   var message = {
          //     type: 'myMessage',
          //     data: data

          //   }

          //   worker.postMessage(message)
          // });
        }

        for(var i = 0; i < clusters[cid2].workers.length; i++){
          var uid = clusters[cid2].workers[i].uid

          if(!bindedWorker[uid]) {
            bind_worker(uid)
          }
        }
   		}

      now.bind_cluster_server = function(cid1, cid2, to, this_node){
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

      now.bind_cluster_server_out = function(cid1, cid2, from, to, protocol, cb){
        var from_uids = [];
        for(var i = 0; i < clusters[cid2].workers.length; i++){
          from_uids.push(clusters[cid2].workers[i].uid);
        }

        cb(from_uids, clusters[cid2].workers,function(proxy) {
          proxy = {
            host: 'neha.inf.unisi.ch',
            port: 9090
          }

          var bind_worker = function(uid) {
            connections[cid2][uid]['out'] = new WebSocket('ws://'+proxy.host+':'+proxy.port)
            
            connections[cid2][uid]['out'].onmessage = function(msg){
              
              //console.log(msg.data)
              workers[uid].postMessage({
                type: 'incoming_message',
                message: msg.data
              })  
            }
            
            connections[cid2][uid]['out'].onopen = function() {
              connections[cid2][uid]['out'].send(JSON.stringify({cmd: 'setup', from: uid}));
              workers[uid].postMessage({
                type: 'bind',
              }) 
              bindedWorker[uid] = true
              workers[uid].postMessage({
                type: 'statout'
              }) 
            }
            
            connections[cid2][uid]['out'].onclose = function() {
              workers[uid].postMessage({
                type: 'unbind',
              })  
              console.log("CLOSED CONNECTION");
            }
            
            connections[cid2][uid]['out'].onerror = function(evt) {
              console.log("WEBSOCKET CONNECTION ERROR: " + evt.data);
            }
          }
          for(var i = 0; i < clusters[cid2].workers.length; i++){
            bind_worker(clusters[cid2].workers[i].uid)
          }
        })
      }

      now.bind_cluster_server_in = function(cid1, cid2, from, to, protocol, cb){
        var from_uids = [];
        for(var i = 0; i < clusters[cid2].workers.length; i++){
          from_uids.push(clusters[cid2].workers[i].uid);
        }

        cb(from_uids, clusters[cid2].workers,function(proxy) {
          proxy = {
            host: 'neha.inf.unisi.ch',
            port: 9090
          }

          var bind_worker = function(uid) {
            connections[cid2][uid]['in'] = new WebSocket('ws://'+proxy.host+':'+proxy.port)
            
            connections[cid2][uid]['in'].onmessage = function(msg){
              workers[uid].postMessage({
                type: 'incoming_message',
                message: JSON.stringify(JSON.parse(msg.data).data)
              })  
            }
            
            connections[cid2][uid]['in'].onopen = function() {
              connections[cid2][uid]['in'].send(JSON.stringify({cmd: 'setup', from: uid}));
            }
            
            connections[cid2][uid]['in'].onclose = function() {
              console.log("CLOSED CONNECTION");
            }
            
            connections[cid2][uid]['in'].onerror = function(evt) {
              console.log("WEBSOCKET CONNECTION ERROR: " + evt.data);
            }
          }
          for(var i = 0; i < clusters[cid2].workers.length; i++){
            bind_worker(clusters[cid2].workers[i].uid)
          }
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

        now.add_worker = function(cid, uid, number, cb) {

        }

        now.delete_worker = function(cid, uid, cb) {

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
   		now.bind_process_node = function(msg, cb){
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

var getChartValuesExcel = function(pid, cid, position) {
  var s = ''
  for(var i = 0; i < charts[pid][cid][position].data.labels.length; i ++) {
    s += charts[pid][cid][position].data.labels[i] + ' ' + charts[pid][cid][position].data.datasets[0].data[i] + '\n'
  }
  console.log(s)
}
