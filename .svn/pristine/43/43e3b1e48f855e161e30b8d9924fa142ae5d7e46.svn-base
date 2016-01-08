var debug = require('debug')
var log = {
  root: debug('wls:root'),
  root_info: debug('wls:root:connected'),
  command: debug('wls:command'),
  remote: debug('wls:remote')
}


/**
 * == Koala Cluster == ROOT process ==
 *
 * MIT licence 
 *
 */

/*
  PORT Issue: 
  Now ports can be sent as command line argument. Default is the plain old 9088.
  Proxy now has the policy of port_ZMQ: PORT+1, port_HTTP: PORT+2
  Same goes for koala_node.js.
  The dnode instance in koala_node.js uses the policy of PORT+3.
  Same goes for workers port (koala.js) where a free port is created with PORT+4
  To instanciate more than one koala_node.js in the same server we just need to input
  a different port as command line arnegument. 
  
*/

//var webrtc = require('wrtc');
var express = require('express')
var dnode = require('dnode')
var os = require('os');
var net = require('net');
var http = require('http');
var tcp_server_manager = require('./k_globals/k_root/tcp_server_manager.js')
var g = require('./k_globals/globals.js')
var fs = require('fs')
var cp = require('child_process');
var util = require('util');
var CommandsManager = require('./k_globals/k_root/k_root_commands.js')
var ConsoleManager = require('./k_globals/k_root/k_root_console.js')
var RESTAPI = require('./api/api_root.js')
var RoutingTable = require('./k_globals/k_root/k_routing_table.js')
var Controller = require('./controller/controller.js');
var nowjs = require('now');
var url = require('url');
var portscanner = require('portscanner');
var request = require('request');
var PORT = 9088;
var MAIN_ROOT = "";
//var k = require('./k_globals/koala.js');
//var storage = require("./k_globals/cluster_storage")
var stateful = require("./k_globals/cluster_storage")

var nowjsTable = {}

/*
  Error handling at startup
*/
process.on('error', function(error) {
  log.root('Error: ' + error) 
})


/*
  Command line argument for RPC port
*/
if(process.argv[2]){
  PORT = parseInt(process.argv[2]);
}


/*
  Command line argument for main root
*/
if(process.argv[3]){
  MAIN_ROOT = process.argv[3].split(":")[0];
  ROOT_PORT = process.argv[3].split(":")[1];
}




/*
  Koala Cluster Configuration
*/
var K = {
  WS: { port: PORT -4},
  REMOTE: { port: PORT-3 },
  API : { port: PORT -2 },
  HTTP : { port: PORT-1 },
  RPC : { port: PORT },
  PROXY : { host: "127.0.0.1", port_ZMQ: PORT+1, port_HTTP: PORT+2 } //DONT USE LOCALHOST
}


/*
  Global objects
*/
var N = {}
var P = {}
var G = {}
var clusters = []
var topologies = {
  topologies: []
}
var RT = new RoutingTable()
// var l = console
// var proxy = cp.fork('./koala_proxy.js', [ K.PROXY.port ]);
var runtime_register = [];
// proxy.on('message', function() {

  // TODO : messages from proxy

// })
// proxy.send({ cmd:'setup', K: K }) //send proxy setup
var commands_manager = new CommandsManager(N, G, P, RT, /*proxy*/ {}, K, clusters, topologies, runtime_register)
var console_manager = new ConsoleManager( commands_manager )
var rest_api;
var controller = new Controller( commands_manager )
commands_manager.addController(controller);
/*
  Utils
*//*
l.setLevel(6)

l._log = l.log
l.log = function( a, b ) {
  if( ! b)  this._log('[Koala::Root] '+a+'    ')
  else    this._log(a, '[Koala::Root] '+b+'    ')
  process.stdout.write('> ')      
}*/

/*
  Global variables and constants
*/
G.node_uid = 0  
G.process_uid = 0
G.current_free_port = PORT+100;
G.cluster_id = 0;


/*
  Nodes registry. Tracks all the nodes (cluster nodes and browsers) in the system
*/
N.nodes = []


/*
  Processes registry. Tracks all the processes running in the system (and points to the node they 
  are running in)
*/
P.processes = []




/*
  HTTP server for:
    - registering remote nodes (ie browsers),
    - serving static content
    - RESTful API 
*/
var http_server = http.createServer(function (req, res) {
      
    // if the request is a RESTful API command, just execute it and return
    // if( rest_api.execute_command(req, res) )
    //  return;
    
    var parsedurl = url.parse(req.url, true, true)
    if(parsedurl.pathname == '/API/vars' && req.method == "PUT"){
      //save everything in the runtime_register
      var obj = {
        name : parsedurl.query.name,
        value : parsedurl.query.value,
        pid : parsedurl.query.pid,
      }
      
      var hasBeenPut = false;
      for(var i = 0; i < runtime_register.length; i++){
        if(runtime_register[i].pid == obj.pid){
          runtime_register[i] = obj;
          hasBeenPut = true;
        }
      }
      if(!hasBeenPut)
        runtime_register.push(obj);
    }
    
    // Serve static content (including koala_bootloader)
    var filePath = '.' + req.url;
    if (filePath == './')
        filePath = './index.htm';
     
    fs.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                }
            });
        }
        else {
            res.writeHead(404);
            res.end();
        }
    })
    
}).listen( K.HTTP.port ) 
log.root('HTTP server listening on port '+K.HTTP.port )

/*
  RPC server for accepting new cluster nodes
*/
var rpc_server = dnode({
  /*
    To accept new connections from cluster nodes
  */
    register_new_node : function (msg, cb) {
      var new_node_id = G.node_uid++
      var new_node_alias = 'N'+new_node_id
      //log.root("register_new_node");
      log.root("host: " + msg.host + " port: " + msg.port + " #processors: " + msg.processors.length + " cpu usage: " + msg.cpu_usage);
      
      // connect back to the koala_node, so in the future we will be able to send commands
    var d = dnode.connect({ host: msg.host, port: msg.port });

    d.on('remote', function( koala_node ) {
        
        var new_node = {
          uid : new_node_id,
          host : msg.host,
          port : msg.port,
          hostname : msg.hostname,
          alias : new_node_alias,
          remote : false,
          channel : {
            koala_node : koala_node
          },
          processors : msg.processors,
        }
        
        
        // Register the new node
        N.nodes[new_node_id] = new_node
        
        //TOrDO: Remove entry with alias
        N.nodes[new_node_alias] = new_node
        
        new_node.channel.koala_node.set_node(new_node);
      
        log.root_info('New node connected: (id:'+new_node_id+', alias:'+new_node_alias+', host:'+new_node.host+')')
        
        commands_manager.add_graceful_kill_callback(new_node.uid);
        
        commands_manager.add_uid_callback(new_node.uid);
        
        commands_manager.add_migrate_callback(new_node.uid);
        
        commands_manager.add_add_operator_callback(new_node.uid);
        
        commands_manager.add_unbind_callback(new_node.uid);
        
        commands_manager.add_bind_callback(new_node.uid);
    

        //add REST api module
        if(!rest_api) {
            rest_api = new RESTAPI( commands_manager , PORT-2, new_node)
        }

        // tell the node its new ID
        cb( new_node_id, new_node_alias)
            
        });
    }
    
}).listen( K.RPC.port )
log.root('RPC server listening on port '+K.RPC.port )


if(MAIN_ROOT != "") {
  // log.root("New peer post to root http://"+MAIN_ROOT+":"+ROOT_PORT);
  // log.root("host = "+os.hostname()+", port = "+PORT);

  var hostname = "";
  if(os.hostname() == "neha") {
    hostname = "neha.inf.unisi.ch";
  } else if(os.hostname() == "agora") {
    hostname = "agora.mobile.usilu.net";
  }


  var options = {
    host: MAIN_ROOT,
    port: ROOT_PORT,
    path: '/peers',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    }
  };

  

  var post_data = '{"peer": {"host": "'+hostname+'", "port": '+PORT+'}}';


  var req = http.request(options, function(resp){
    var data = '';
    resp.on('data', function(chunk){
      data += chunk;
    });

    resp.on('end', function() {
       var peers = JSON.parse(data).peers;
       // log.root("PEERS FROM ROOT "+MAIN_ROOT);
       // log.root(peers);

       //update my peers

        for(var j = 0; j < peers.length; j++) {
            var curPeer = filter(commands_manager.N.nodes, function(element) {
              return element.host == peers[j].host;
            }); 
            if(!curPeer && peers[j].host != getHostname()) {
             
              commands_manager.N.nodes.push({"uid": commands_manager.G.node_uid++, "host": peers[j]["host"], "port": peers[j]["port"], "remote": false});
            }
        }

        

       //POST TO EACH PEER THAT I AM  A NEW PEER
       for (var i = 0; i < peers.length; i++) {
            if(peers[i].host != MAIN_ROOT && peers[i].host != hostname) {

                  var options = {

                    host: peers[i].host,
                    port: peers[i].port,
                    path: "/peers",
                    method:"POST"
                  }

                  var req = http.request(options, function(resp){
                      var data = '';
                      resp.on('data', function(chunk){
                        data += chunk;
                      });

                      resp.on('end', function() {
                          var peers = JSON.parse(data).peers;

                      });
                  });
                  req.write(post_data);
                  req.end();
          }
      }
    });

    var d = dnode.connect({ host: hostname, port: PORT });

  });


  req.on("error", function(e){
      log.root(e);
  });


  req.write(post_data);
  req.end();
}

/*
  Start Console
*/
process.stdin.resume();
process.stdin.setEncoding('utf8');


/*
  May be moved into k_root_commands.js if needed
*/
process.stdin.on('data', function (chunk) {
  var ck = chunk.replace('\n', '')
  var cmd = ck.split(' ')
  /*
    If it's a call to exec, it's better to have it here, because from here
    it's easier to call console_manager.process_console_command();
  */
  
  if(cmd[0] === "exec" && cmd[1]){
    if(cmd[1].indexOf(".k") === cmd[1].length - 2){
      fs.readFile(cmd[1], 'utf8', function(err, data) {
        if (err) throw err;
        
        var commands = data.split('\n');
        
        for(var i = 0; i < commands.length; i++){
          console_manager.process_console_command(commands[i].split(" "), function(outmsg){
            log.root(outmsg);
            process.stdout.write('> ');
          });
        }
        
      });
    }
    
    else if(cmd[1].indexOf(".js") !== -1){
      fs.readFile(cmd[1], 'utf8', function(err, data) {
        if (err) throw err;
        
        //parse json
        var topology = JSON.parse(data);
        var nodes_run = 0;

        var bindings = topology.topology.bindings
        var operators = topology.topology.operators

        var tempBindings = []
        for(var i = 0; i < bindings.length; i++) {
          var tempFrom
          var tempTo

          for(var j = 0; j < operators.length; j++) {
            if(bindings[i].from == operators[j].id) {
              if(operators[j].browser) {
                tempFrom = operators[j].browser.path
              } else {
                tempFrom = operators[j].id
              }
            }

            if(bindings[i].to == operators[j].id) {
              if(operators[j].browser) {
                tempTo = operators[j].browser.path
              } else {
                tempTo = operators[j].id
              }
            }
          }

          tempBindings.push({
            from: tempFrom,
            to: tempTo,
            type: bindings[i].type
          })
        }

        commands_manager.set_remote_bindings(tempBindings);
        
        //count how many non-browser
       /* var non_browser_only = 0;
        for(var x = 0; x < topology.topology.operators.length; x++)
        	if(topology.topology.operators[x].browser && !topology.topology.operators[x].browser.only)
        		non_browser_only++;*/
        
        for(var i = 0; i < topology.topology.operators.length; i++){
          //create operators
          var node = commands_manager.find_host(commands_manager, topology.topology.operators[i].sensors, function(node_index, index){
          
            //operator.browser may not be defined, have to be defined in order to make it work in the next function call
            if(!topology.topology.operators[index].browser){
            	topology.topology.operators[index].browser = {};
            }
            
            var operator = topology.topology.operators[index];
            var uids = [];
            
            //if workers not defined, default to one
            if(!operator.workers || typeof(operator.workers) != 'number')
                operator.workers = 1;
               
            //if automatic not defined, default to true
            if(!operator.automatic)
                operator.automatic = true;
            
            for(var w = 0; w < operator.workers; w++){
                uids.push(commands_manager.generate_worker_uid());
            }

            if(node_index == undefined) {
              node_index = 0;
            }

            var node = commands_manager.N.nodes[node_index];
            var new_cid = commands_manager.generate_operator_cid();

            //log.root("SPAWNING, AUTOMATIC = " + operator.automatic);
            //log.root(uids);
            //function(node, new_cid, script, uids, automatic, to_spawn, alias, self, cb)
            
            //if it doesn't have to run on browsers only, then spread it on a server
            if(!operator.browser.only){
            
              commands_manager.run_operator(node, new_cid, operator.script,
              uids, operator.automatic, 
              operator.workers, 
              operator.id, 
              commands_manager, function(outmsg){

                log.root(outmsg);

                // console.log(outmsg)
                nodes_run++;
                //if every operator is ran
                if(nodes_run === topology.topology.operators.length /*|| non_browser_only === nodes_run*/){

                  //create bindings -> first have to create ids/aliases and have them returned on the previous method call
                  for(var j = 0; j < topology.topology.bindings.length; j++){
                    commands_manager.bind_operators(
                      topology.topology.bindings[j].from, 
                      topology.topology.bindings[j].to,
                      true, 
                      topology.topology.bindings[j].type,
                      commands_manager,
                      function(outmsg){
                        // console.log(outmsg)
                        log.root(outmsg);
                        commands_manager.start_controller("", function(outmsg){
                          log.root(outmsg);
                          // console.log(outmsg);
                        });
                      }
                    );
                  }
                }
              });

              commands_manager.new_path(operator.id, operator.id, operator.script/*, connectionsIn, connectionsOut, forceIn, forceOut*/)
            } else {
              //create a HTTP server on the host found and give a path and a script to 
              //be ran when the path is accessed by a web browser
              var id = topology.topology.operators[index].id
              var path = topology.topology.operators[index].browser.path
              var script = topology.topology.operators[index].script
              //TODO automatic
              var automatic = topology.topology.operators[index].automatic



              // var connectionsIn = topology.topology.operators[index].browser.in
              // var connectionsOut = topology.topology.operators[index].browser.out
              // var forceIn = topology.topology.operators[index].browser.forceIn
              // var forceOut = topology.topology.operators[index].browser.forceOut

              app.get(path, function(req, res){
                res.sendfile('public/remote_worker.html');
              });

              //nodes_run++; somewhere

              commands_manager.new_path(id, path, script, automatic/*, connectionsIn, connectionsOut, forceIn, forceOut*/)
              commands_manager.find_browser(function(browser_node_index){
                if(browser_node_index != -1) {
                  var browser_node = commands_manager.N.nodes[browser_node_index];

                  commands_manager.run_operator(browser_node, new_cid, operator.script, uids, operator.automatic, operator.workers, operator.id, commands_manager, function(outmsg){

                    nodes_run++;
                    //if every operator is ran
                    if(nodes_run === topology.topology.operators.length /*|| non_browser_only === nodes_run*/){

                      //create bindings -> first have to create ids/aliases and have them returned on the previous method call
                      for(var j = 0; j < topology.topology.bindings.length; j++){
                        commands_manager.bind_operators(
                          topology.topology.bindings[j].from, 
                          topology.topology.bindings[j].to,
                          true, 
                          topology.topology.bindings[j].type,
                          commands_manager,
                          function(outmsg){
                            // console.log(outmsg)
                            log.root(outmsg);
                            commands_manager.start_controller("", function(outmsg){
                              log.root(outmsg);
                              // console.log(outmsg);
                            });
                          }
                        );
                      }
                    }
                  })
                }
              })
            }
          }, i);
        }
      });
    }
  }
  /*
    If it's not an exec go normally with the check on process_console_command
  */
  
  console_manager.process_console_command(cmd, function(outmsg) {
    log.command('done: ' + outmsg)
    // process.stdout.write('> ');   
  })
})



log.root('Service up and running');

log.root("spawning node using port = "+K.RPC.port);

setTimeout( function() {
    var spawn = require('child_process').spawn
    var n = spawn('node', ['./koala_node.js', K.RPC.port], {stdio: 'inherit'});
    /*
            Handle prints + errors in the koala_node.js process.
    // */        
    // n.stdout.on('data', function(a) { console.log(a.toString()) })                
    // n.stderr.on('data', function(a) { console.log("stderr error: " + a.toString()) })                
},1000);


var filter = function(collection, predicate) {

    var result;
    var length = collection.length;

    for(var j = 0; j < length; j++)
    {
        if(predicate(collection[j]))
        {
             result = collection[j];
        }
    }
    return result;

}



var getHostname = function() {

  var hostname = os.hostname()

    // if(os.hostname() == "neha") {
    //   hostname = "neha.inf.unisi.ch";
    // } else if(os.hostname() == "agora") {
    //   hostname = "agora.mobile.usilu.net";
    // }

    return hostname;
}

// process.on('SIGINT', function() {
//   log.root('Shutting down '+getHostname());

//   var notified = false;
//   var peers = commands_manager.N.nodes;
//   for(var key in peers) {
//     if(peers[key] != undefined && peers[key].host && peers[key].host != getHostname()) {
//       notified = true;
//       // log.root("sending delete to = "+peers[i].host);
//         var port = 0;
//         if(peers[key].host == "agora.mobile.usilu.net") {
//           port = peers[key].port-5;
//         } else {
//           port = peers[key].port-2;
//         }
//         var options = {
//           host: peers[key].host,
//           port: port,
//           path: '/peers/'+getHostname(),
//           method: 'DELETE'
//         };

//         log.root(options);

//         var req = http.request(options, function(resp){
//           var data = '';
//           resp.on('data', function(chunk){
//             log.root(chunk);
//             data += chunk;
//           });

//           resp.on('end', function() {
//             log.root(data);
//             log.root("UPDATED EVERY ROOT");
//             process.exit(0);
//           });
//         });
//         req.on('error', function(e) { log.root(e)});
//         req.write('{}');
//         req.end();
//     }
//   }

//   if(!notified) {
//     process.exit(0);
//   }

  
// });


// ##############################
// ##############################

// START OF REMOTE NODE STUFF

// ##############################
// ##############################

/*
	Creates a HTTP server and a fixed path for the remote worker.
	The Controller will then decide what to publish (which operator)
	on the remote Peer (TODO).
*/
var app = express();

app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"));
// app.use(express.static(__dirname + "/scripts")); // TODO
app.use(express.static(__dirname + "/api_visualiser"))

// fixed path
app.get('/remote', function(req, res){
    res.sendfile('public/remote_worker.html')
});

app.get('/ui' , function(req, res) {
  res.render(__dirname + '/api_visualiser/clientWLS.ejs', {host:os.hostname(), port: K.API.port})
})

var remote_server = http.createServer(app).listen(K.REMOTE.port);
log.root('REMOTE server listening on port: ' + K.REMOTE.port);

/*
  RPC server for accepting new remote nodes (browser)
*/
var everyone = nowjs.initialize(remote_server);

var random_token = Math.round(Math.random() * 60000) + 1000000
commands_manager.set_random_token(random_token)

/*
  To accept new connections from remote browsers
*/
everyone.now.register_new_remote_node = function(cb){
    var new_node_id = G.node_uid++
    var new_node_alias = 'B'+new_node_id
    var connection = this.now

    var new_node = {
      uid : new_node_id,
      alias : new_node_alias,
      remote : true,  // TODO rename: channel -> rpc_channel
      channel : {
        koala_remote : connection
      }
    }
      
    // Register the new node
    N.nodes[new_node_id] = new_node
    // N.nodes[new_node_alias] = new_node
      
    log.root_info('New remote node connected: (id:'+new_node_id+', alias:'+new_node_alias+')')
    
    // tell the node its new ID

    var cid = this.user.clientId
    nowjsTable[cid] = new_node_id
    cb(new_node_id, new_node_alias, random_token)
};

everyone.now.notify_path = function(path, pid, cb){
    //if a path is a path in the exec file then we will execute the operator on the worker
    if(commands_manager.has_path(path)) {
      var script = commands_manager.get_script_from_path(path)

      commands_manager.run_new_cluster(['runc', script, '' + pid, '1'], function(msg) {
      
        log.root('New node on known path connected: automatically run 1 worker on operator ' + pid)

        //var tempPid = msg.split(' ')[msg.split(' ').length - 1]
        var tempPid = msg;
        commands_manager.new_remote_bindings(tempPid, path, commands_manager)
      })
    } else {
      commands_manager.add_pid_to_path('/remote', pid)
    }

    cb(commands_manager.get_paths())
};

everyone.now.remote_request = function(pid, path, number) {
    var script = commands_manager.get_script_from_path(path)
    commands_manager.run_new_cluster(['runc', script, '' + pid, '' + number], function(msg) {
      log.root('Remote node ' + pid + ' requests to run ' + path + ' with ' + number + ' workers')

      var tempPid = msg.split(' ')[msg.split(' ').length - 1]
      commands_manager.new_remote_bindings(tempPid, path, commands_manager)
    })
}

everyone.now.add_workers = function(number, cb) {
  var uids = commands_manager.new_remote_workers(number)
  cb(uids)
}

var codeTable = {
  NONE: 0,
  LEAVING: 1,
  BATTERY: 2,
  CPU: 3
}
everyone.now.require_central_controller = function(operator, peer_to, options, code, cb) {
  switch(code) {
    case codeTable.NONE:
      log.remote("Operator " + operator + " inquires controller becasue: NO REASON")
      break;
    case codeTable.LEAVING:
      log.remote("Operator " + operator + " inquires controller becasue: LEAVING")
      controller.remove_from_rank(options.pid)
      var peer_to = controller.get_first_best_rank();
      console_manager.proxy_migrate_command(["migrate", ""+operator, ""+peer_to], options, function(){})
      break;
    case codeTable.BATTERY:
      log.remote("Operator " + operator + " inquires controller becasue: LOW BATTERY")
      var peer_to = controller.get_first_best_rank()
      console_manager.process_console_command(["migrate", ""+operator, ""+peer_to], function(){});
      break;
    case codeTable.CPU:
      log.remote("Operator " + operator + " inquires controller becasue: OVERLOADED CPU")
      commands_manager.run_new_cluster(["runc", ""+options.script, ""+(-1), ""+1], function(cid){
        var topology = options.topology

        var bind_in = function() {
          for(var i in topology.in) {
            log.root('Bindc ' + topology.in[i] + " " + cid)
            commands_manager.bind_clusters(["bindc", ""+topology.in[i], ""+cid], function(){

            })
          }
        }

        var tobind = 0
        var finishedBind = 0

        log.remote(topology)
        
        for(var j in topology.out) {
          tobind++
          log.root('Bindc ' + cid + " " + topology.out[j])
          commands_manager.bind_clusters(["bindc", ""+cid, ""+topology.out[j]], function(){
            finishedBind++
            if(tobind == finishedBind) {
              bind_in()
            }
          })
        }

        if(tobind == 0) {
              bind_in()
            }
      });
      break;
    default:
      //TODO
      break;
  }
  
  cb() 
}
//
//everyone.now.get_merged_sort_list = function(workerId, requiredState, cb) {	
//	var argsState = [];
//	
//	for(var a in requiredState) {
//		argsState.push(requiredState[a]);
//	}
//	
//	var callback = function(state) {
//		console.log("@@@@@@@");
//		console.log(state);
//	}
//	
//	argsState.push(callback)
//
//	stateful.getMergedSortList.apply(null, argsState);
//}
//
//everyone.now.incr_by_sort_list = function(workerId, setName, incr, key) { 
//	stateful.incrBySortList(setName, incr, key);
//	console.log("incremented sort list::"+setName);
//};

everyone.now.statefulOp = function(name, args, cb) {
	switch(name){
		case "get":
			var result = function(res){
				cb(res);
			}
			
			args.push(result);
			stateful.get.apply(null,args);
			break;
		case "set":
			var result = function(res){
				cb(res);
			}
			
			args.push(result);
			stateful.set.apply(null,args);
			break;
		case "incr":
			var result = function(res){
				cb(res);
			}
			
			args.push(result);
			stateful.incr.apply(null,args);
			break;
		case "decr":
			var result = function(res){
				cb(res);
			}
			
			args.push(result);
			stateful.decr.apply(null,args);
			break;
		case "getMergedSortList": 

			
			var finished = function(state) {
				cb(state);
			}
			
			args.push(finished);
			
			stateful.getMergedSortList.apply(null, args);
			break;
		case "incrBySortList":
			var result = function(res){
				cb(res);
			}
			
			args.push(result);
			
			stateful.incrBySortList.apply(null, args);
			break;
		default:
			break;
	}
}

nowjs.on('connect', function(e) {
    var cid = this.user.clientId;

    nowjsTable[cid] = undefined
});
 
nowjs.on('disconnect', function(e) {
    var cid = this.user.clientId;
    
    if(nowjsTable[cid] != undefined) {
      log.remote('Process ' + nowjsTable[cid] + ' left')
      commands_manager.nowjs_leave(nowjsTable[cid])
      nowjsTable[cid] = undefined
    }

    // delete nowjsTable[cid]
});

//fake controller example
var peer_ids = undefined
var operator_id = undefined

var callbackMigration = function(){
  var p = peer_ids[Math.floor(Math.random()*peer_ids.length)]
  log.root('migrating: ' + operator_id + " in " + p)
  console_manager.process_console_command(["migrate", ""+operator_id, ""+p], function(){});
  operator_id++;
}

everyone.now.startfakecontroller = function(p_ids, o_id) {
  peer_ids = p_ids
  operator_id = o_id

  setInterval.apply(this, [callbackMigration.bind(this), 10000])

  log.root('Started fake controller')
}

// everyone.now.notifyStats = function(stats, cb) {
  
  
//   controller.notifyStats(stats, function(decision) {


//     // TODO if not already left?
//     cb(decision)
//   })
// }

// setInterval.apply(this, [callbackMigrate.bind(this), 10000])
// log.root(this)

// setInterval(callbackMigration.bind(process), 30000)

// var stunServer = 'stun:stun.l.google.com:19302';

// var MAX_REQUEST_LENGHT = 1024;
// var pc = null;
// var offer = null;
// var answer = null;
// var remoteReceived = false;

// var dataChannelSettings = {
//   'reliable': {
//         ordered: false,
//         maxRetransmits: 0
//       },
// };

// var pendingDataChannels = {};
// var dataChannels = {}
// var pendingCandidates = [];

// var wss = new ws.Server({'port': K.WS.port});

// log.root('WS server listening on port: ' + K.WS.port)
// wss.on('connection', function(ws)
// { 
//   function doComplete() {
//   }

//   function doHandleError(error) {
//     throw error;
//   }

//   function doCreateAnswer() {
//     remoteReceived = true;
//     pendingCandidates.forEach(function(candidate)
//     {
//       pc.addIceCandidate(new webrtc.RTCIceCandidate(candidate.sdp));
//     });
//     pc.createAnswer(
//       doSetLocalDesc,
//       doHandleError
//     );
//   };

//   function doSetLocalDesc(desc)
//   {
//     answer = desc;
//     pc.setLocalDescription(
//       desc,
//       doSendAnswer,
//       doHandleError
//     );
//   };

//   function doSendAnswer()
//   {
//     ws.send(JSON.stringify(answer));
//     log.root('awaiting data channels');
//   }

//   function doHandleDataChannels()
//   {
//     var labels = Object.keys(dataChannelSettings);
//     pc.ondatachannel = function(evt) {
//       var channel = evt.channel;

//       log.root('ondatachannel', channel.label, channel.readyState);
//       var label = channel.label;
//       pendingDataChannels[label] = channel;
//       channel.binaryType = 'arraybuffer';
//       channel.onopen = function() {
//         log.root('onopen');
//         dataChannels[label] = channel;
//         delete pendingDataChannels[label];
//         if(Object.keys(dataChannels).length === labels.length) {
//           doComplete();
//         }
//       };
//       channel.onmessage = function(evt) {
//         var data = evt.data;
//         log.root('onmessage:', evt.data);
//       };
//       channel.onclose = function() {
//         log.root('onclose');
//       };
//       channel.onerror = doHandleError;
//     };
//     doSetRemoteDesc();
//   };

//   function doSetRemoteDesc()
//   {
//     pc.setRemoteDescription(
//       offer,
//       doCreateAnswer,
//       doHandleError
//     );
//   }

//   ws.on('message', function(data)
//   {
//     data = JSON.parse(data);
//     if('offer' == data.type)
//     {
//       offer = new webrtc.RTCSessionDescription(data);
//       answer = null;
//       remoteReceived = false;

//       pc = new webrtc.RTCPeerConnection(
//         {
//           iceServers: [{url:stunServer}]
//         },
//         {
//           'optional': [{DtlsSrtpKeyAgreement: false}]
//         }
//       );
//       pc.onsignalingstatechange = function(state)
//       {
//         log.root('signaling state change: ' + state);
//       }
//       pc.oniceconnectionstatechange = function(state)
//       {
//         log.root('ice connection state change: ' + state);
//       }
//       pc.onicegatheringstatechange = function(state)
//       {
//         log.root('ice gathering state change: ' + state);
//       }
//       pc.onicecandidate = function(candidate)
//       {
//         // log.root('onicecandidate')
//         ws.send(JSON.stringify(
//           {'type': 'ice',
//            'sdp': {'candidate': candidate.candidate, 'sdpMid': candidate.sdpMid, 'sdpMLineIndex': candidate.sdpMLineIndex}
//           })
//         );
//       }
//       doHandleDataChannels();
//     } else if('ice' == data.type)
//     {
//       if(remoteReceived)
//       {
//         pc.addIceCandidate(new webrtc.RTCIceCandidate(data.sdp.candidate));
//       } else
//       {
//         pendingCandidates.push(data);
//       }
//     }
//   });
// });

// ####