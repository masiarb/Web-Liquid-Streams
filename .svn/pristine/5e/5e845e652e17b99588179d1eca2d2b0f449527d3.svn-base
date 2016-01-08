
var id_added = 0;
var echo_id = 1;
var request = require('request');
var url = "http://agora.mobile.usilu.net";
//var url = "http://neha.inf.unisi.ch";
var add_interval = setInterval(function(){

	//POST
	request.post({
  		headers: {'content-type' : 'text/plain'},
  		url:     url+':9086/topologies/1/operators',
  		body: '{ "operator": {"script": "echo.js","workers": 1}}',
		}, function(error, response, body_operator){
		
			id_added = JSON.parse(body_operator).oid;
			
			request.get({
				url:     'http://neha.inf.unisi.ch:9086/topologies'
			}, function(error, response, body_topology){
				var bindings = JSON.parse(body_topology).topologies[0].bindings;
				var old_echo_bindings = [];
				var new_echo_bindings = [];
				
				//find the last bindings
				for(var i = 0; i < bindings.length; i++){
					if(bindings[i].from === echo_id){
						old_echo_bindings.push({
							"from" : bindings[i].from,
							"to" : id_added
						});
						
						new_echo_bindings.push({
							"from" : bindings[i].from,
							"to" : id_added
						});
					}
					
					if(bindings[i].to === echo_id){
						old_echo_bindings.push({
							"from" : bindings[i].from,
							"to" : bindings[i].to
						});
					}
				}
				
				new_echo_bindings.push({
					"from" : id_added,
					"to" : 2
				});
				
				//console.log(old_echo_bindings);
				//console.log(new_echo_bindings);
				
				//PATCH on the old operator
  				request.patch({
					headers: {'content-type' : 'text/plain'},
  					url: url+':9086/topologies/1/operators/' + echo_id + '/bindings',
					body: JSON.stringify({"bindings" : old_echo_bindings}),
  				}, function(error, response, body_patch){
					
					//console.log(body_patch);
					
					echo_id = id_added;
					//PATCH on the new operator
					request.patch({
                                	headers: {'content-type' : 'text/plain'},
                                	url: url+':9086/topologies/1/operators/' + echo_id + '/bindings',
                                	body: JSON.stringify({"bindings" : new_echo_bindings}),
                        	}, function(error, response, body_patch_second){
                               	 	//console.log(JSON.parse(body_patch).topologies[0].bindings);
                                	console.log(body_patch_second);
                                	echo_id = id_added;
                     });
  				});
  			
			});
		});
}, 10000);

