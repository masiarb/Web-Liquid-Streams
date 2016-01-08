# The Web Liquid Streams Framework

## Overview

The Web Liquid Streams (WLS) framework allows developers and makers to build decentralized streaming topologies, which can run on a heterogeneus set of hardware. WLS is entirely written in JavaScript, thus any device which is able to run [Node.JS](https://nodejs.org/en/) or a Web browser is able to take part in a WLS topology. 

Topologies are composed by streaming operators, which are assigned a script to run. Inside each operator, one or more workers can be spawned to parallelize the work. A control infrastructure is able to take care of increasing or decreasing the parallelism of each operator. Moreover, it is also able to split the work of an operator on more hardware (hosts), in order to deal with particularly heavy workloads.

The control infrastructure is also able to deal with faults in the topology. If a host abruptly disconnects or crashes, the data stream will break. The controller is able to detect such faults and spawn the operators on other available hosts, restarting the data flow. For what concerns graceful disconnections, the controller is able to autonomously migrate the operators running on the host that issued the graceful disconnection on other available host.

The developers are also able to manually increase and decrease the number of workers in the operators, migrate operators, and also start new operators while the stream is flowing, effectively building the topology on the fly.

Script updates, as well as topology updates and modifications can be done on the fly, without stopping the data flow. This can be useful when dealing with critical applications that have to gather and store data without interruptions.

## Installation Instructions

- ### Install Node.JS v0.10.25

  - WLS makes use of a particular version of Node.JS, v.0.10.25. To install it, you can use [n](https://github.com/tj/n) or [nvm](https://github.com/creationix/nvm). Follow the instructions to switch to the correct version.

- ### Install ZMQ

  - Install the [ZeroMQ](http://zeromq.org/intro:get-the-software) library for your OS. 

- ### Install Node-Gyp and OverCPU

  - Install [Node-Gyp](https://github.com/nodejs/node-gyp) to compile the OverCPU extension provided with the WLS package. You can download
  
- ### Install Redis

  -  If you plan to make use of a storage system, it is strongly recommended to install [Redis](http://redis.io/topics/quickstart). This will let you store and retrieve data while your data stream topologies are running.
  
- ### Install Web Liquid Streams
  
  - Once Node.JS, ZMQ, Node-Gyp, and Redis are installed, you are ready to install WLS. Download the package from the git repository and simply run `npm install`. This will install all the packages that are needed to run the framework. Once all the packages are installed, navigate to the `/node_modules/overcpu` folder and type `node-gyp configure` and then `node-gyp build`. This will install the OverCPU extension.

## Usage

### Operator Script

Once everything is setup, you can run your first topology. First of all, you have to implement operators scripts. These are JavaScript files that define the behaviour of the streaming operator when, for example, a sensor is read or a message is received. Operator scripts are divided into producers (operators that create a stream of data by, for exmaple, reading a sensor), filters (operators executing operations on the data received and forwarding the result downstream), or consumers (operators that only receive data, used to visualize, store it, or execute an action on the environment). 

In this example we will make use of some of the WLS API to give the reader an idea of how to write operator scripts, you can take a look at the full documentation [here](http://missing.link.com).

#### Producer

The following block of code represents a producer. First, we import the WLS framework in the first line of the script. The function `gatherData` is called once and define an interval that, every 500 milliseconds, gathers data from a volume and light sensors. We omitted the definition of the `gatherSound` function, as it is outside the scope of the example. 

Once the data is gathered, it is stored in an object which is the sent downstream using the `k.send` function.

    var k = require('./../k_globals/koala.js');
    var gatherData = function() {
        var soundPin = tessel.port['GPIO'].analog[0];
        var lightPin = tessel.port['GPIO'].analog[2];

        interval = setInterval(function(){
       
            var volume = gatherSound(soundPin);
            var light = lightPin.read() * lightPin.resolution;

            var m = {
                volume: volume,
                light: light,
                time: time
            };

            k.send(m);
        }, 500);
    }
    
    gatherData();
    
#### Filter
	
The following script receives the data gathered by the producer, polishes the date into a human-readable format, stores the data in the database, and forwards the data downstream. The `k.createNode` function creates the infrastructure to receive messages from upstread, which are dealt in the callback of such function. Notice that we only send the data downstreams only when the database call returns (in the callback function).
	
    var k = require('./../k_globals/koala.js');
	k.createNode(function(raw_data){
	
	    var date = new Date(raw_data.time);
	    raw_data.time = date.getHours(date) + ":" + date.getMinutes(date);
	
	    k.stateful.lpush("exampleWLS", JSON.stringify(raw_data), function(result) {
		     k.send(raw_data);
	    });
    });

#### Consumer

The consumer script presented in the following example runs on a Web browser and works as an observer, showing the data gathered by the sensors. The script includes a JavaScript file that takes care of interacting with the `HTML` elements created in the operator, by updating the graph each time a new message arrives. The following image shows part of the `HTML` page of a consumer.

![image](http://masiar.ch/img/wls_consumer3.png =600x200)

While the following piece of code represents a consumer.

    k.createNode(function(data){ 
        data = JSON.parse(data);
		sensors[data._id] = true;
		var table = {};

    	for(e in sensors){
     	   if(sensors[data._id]){
     	       table[data._id] = "updateGraph" + data._id
     	   }
    	}


    	var ht = {
     	   1: ["updateGraphLine","updateGraphBar"],
     	   2: ["updateGraphLine1","updateGraphBar1"]
    	}

    	if(ht[data._id]){
        	k.callFunction(ht[data._id][0], [data.volume, data.light, data.temperature, data.time])
        	k.callFunction(ht[data._id][1], [data.volume, data.light, data.temperature, data.time])
    	}
	});

The scripts receives the data from upstream and, through the Web browser API (i.e., `k.callFunction`), updates the content of the graphs in real time. We omitted the rest of the script, where the whole `HTML` is built. This does not happen in `k.createNode` as it only need to happen once when the page is loaded.

### Running a Topology

Once the scripts are ready, everything is setup to run a topology. Either on a Web server, or on your local machine, you can start the WLS framework by typing `./start.sh` or `node koala_root.js`. This will start the root of WLS. The interface will return a log showing which ports have to be used by Web browsers (remote) or Web servers (RPC) to be part of the WLS framework.

Web browsers can connect to the framework by accessing to the address of the server, on the specified remote port, on the path `/remote`. On the root, a log displays the newly connected Web browser, that we call 'remote node'.

Web servers can connect to the framework by running the command `node koala_node.js {PORT}`, where the PORT should be the RPC port specified on the WLS root startup. On the root, a log displays the newly connected Web server, that we call 'server node'.

Whenever a new host connects, it is assigned an ID. IDs are used by the developer to address the machine they want an operator to run on. Let's say we have three scripts, `producer.js`, `filter.js`, and `consumer.js`, and we have three machine connected, a Web server, which is also the root, with ID 0, a Web browser with ID 1 and a Raspberry Pi with ID 2. We want to run the producer on the Pi, where some sensors are available. We want to run the filter on the server, where the RedisDB is available, and the consumer on the Web browser, to visualise the data gathered by the Pi. To run the said topology, the developer has to write the `run` command followed by the name of the script and the ID of the specified machine. If no machine is specified, the root will run it in the machine with more cores available.

`run producer.js 2`

`run filter.js 0`

`run consumer.js 1`

Once the operator are running, the developer has to bind them. Before binding, notice that each operator is assignment an operator ID (OID). OIDs are assigned starting from 0, this means that the producer will have OID 0, the filter OID 1, and the consumer OID 2. The binding of the operators has to be done by addressing their OID, and can be done by typing the `bind` command followed by the OID of the operator sending data and the OID of the operator receiving data. In our example it will become like so.

`bind 0 1`

`bind 1 2`

This will create a topology with the form `0 -> 1 -> 2`, where the numbers represent the OIDs, that is, `producer.js -> filter.js -> consumer.js`. Binding the operators effectively starts the data stream. WLS is able to sustain alterations of the topology at runtime. This means that while the topology is running, developers can add and remove operators and bindings to the topology. The only constraint is given by the operator implementation, that is, the semantic of the topology changes the moment operators are added or removed, thus the operators running should be programmed by keeping this in mind. Alternatively, the `update` command can provide an operator with an updated version of script without stopping the topology. The `update` command expects the OID of the operator to be updated and the name of the new script to be run (which can also be the same, if in the meantime the script has been updated).

`update 1 filter_update.js`

There are many more commands in WLS, they can be explored with the `help` command.
    
## JSON Topology description file

Building a topology by hand can be useful when playing for the first time with WLS or testing operator implementations. For bigger topologies, it may be difficult to re-run and re-wire everything every time a test run is performed. For this reason, we provided a simple way start an entire topology with one command, by feeding the WLS root with a JSON file that describes the topology. The structure of the file looks like the following.

    {
    	"topology": {
    	    "id": "exampleTopology",
    	    "operators": [
    	        {
    	            "id": "producer",
    	            "script": "producer.js"
            	},
            	{
             	   "id": "filter",
             	   "script": "filter.js",
		     	   "workers": 1,
        		   "automatic" : true
            	},
            	{
               		"id": "consumer",
               		"script": "consumer.js",
        			"browser": {
                    	"path" : "/visualization",
                    	"only" : true
                	}
            	}
        	],
        	"bindings": [
            	{
                	"from": "producer",
                	"to": "filter",
                	"type": "round_robin"
            	},
            	{
                	"from": "filter",
                	"to": "consumer",
                	"type": "round_robin"
            	}
        	]
    	}
	}

The topology needs an `id`, a list of `operators` and a list of `bindings`. 

The operators are described by objects that have required key-value pairs and optional ones. The following list illustrates the content of an operator description in a JSON topology description file.

- `id` : Required field that names the operator.
- `script` : Required field that tells the WLS runtime which script this operator has to run.
- `automatic` : Optional boolean value that tells the runtime if the operator has to be controlled by the control infrastructure or it doesn't need any control. We expect operators such as producers and consumers not to need a control infrastructure. Filters, which can implement more CPU-intensive operations, may instead need the control.
- `workers` : Optional numerical field setting an initial value for the number of workers at launch (that is, the parallelism of the operator).
- `browser` : Oprional field that, through an object, described if the operator can run on a browser, or has to run on a Web browser *only*. If the `browser` field is not specified, the operator will be run on Web servers and microcontrollers only. If the `browser` field is specified, it *must* contain the `path` field, which tells the WLS runtime which path can the user reach (once the topology started) in order to start running that operator on his machine (in the above example, once the topology is started, the user may spread the link to the consumer operator, `/visualization`). The `only` key is an optional boolean key which tells the WLS runtime if the operator *has* to run only on Web browsers. If not specified, it will be considered as `false`, thus the operator will be run on wither Web browsers and Web servers.

Once the topology has been described in JSON, it can be fed to the WLS runtime through the `exec` command, passing as argument the topology file (i.e., `exec my_topology.js`). Notice that if the topology requires a browser operator to run, at least one Web browser has to be connected to the root before launching the topology.

## Supported Microcontrollers

WLS is able to natively support any single-board computer able to run an operative system which can execute Node.JS version 0.10.28. Our only tests have been done on Raspberry Pi and Raspberry Pi 2, with successful results. 

Other microcontrollers tested include [Tessel](https://tessel.io/), which is able to natively interpret JavaScript, and [Arduino](https://www.arduino.cc/). For Tessel we built an infrastructure to support it as a fully-working operator, but it can also be used by just opening a WebSocket and connecting it to an operator which starts a WebSocket server. We did not test, nor implement anything specific for Arduino, but we empirically tested it in a very simple office automation project. Again, opening a WebSocket client on the Arduino script and a WebSocket server on an operator (either running on a Web browser or a Web server) is enough to start the data flow.

## Programming API

TODO

### Server Operator API

### Browser Operator API

### REDIS API

## Manual Topology Control at Runtime

Topology can be manually controlled at runtime. Developers can add, remove or update operators while the topology is running.

### Command Line

TODO

### RESTful API

TODO

### Operator API

You can add operators from inside an operator.
