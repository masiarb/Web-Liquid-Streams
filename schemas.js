var scriptSchema = {
				"type":"object",
				"$schema": "http://json-schema.org/draft-03/schema",
				"id": "http://jsonschema.net",
				"required": ["script"],
				"properties":{
					"script": {
						"type":"object",
						"properties":{
							"name": {"type":"string"}
						},
						"required": ["name"]
					}
				}
			}



var workerSchema = {
				"type":"object",
				"$schema": "http://json-schema.org/draft-03/schema",
				"id": "http://jsonschema.net",
				"required": ["worker"],
				"properties":{
					"worker": {
						"type":"object",
						"id": "http://jsonschema.net/script",
						"properties":{
							 "wid": { "type" : "number" },
                             "href": {"type": "string"}, 
                             "operator": {"type": "string"}, 
                             "uptime": {"type": "string"}, 
                             "messages": {"type": "string"}, 
                             "script": {"type": "string"}, 
                             "req-res-station": {"type": "number"} 
						},
						"required": ["wid", "script"]
					}
				}
			}			

var topologySchema = {
					"type":"object",
					"$schema": "http://json-schema.org/draft-03/schema",
					"id": "http://jsonschema.net",
					"required": ["topology"],
					"properties": {
						"topology" :  
	                    	{	"type" : "object", 
	                    		"properties" : {
	                    			"tid": {"type":"number"},
	                    			"operators": {
	                    							"type": "array",
	                    						  	"items": {
	                    						  		"type": "object",
	                    						  		"properties": {
	                    						  			"oid": { "type" : "number" },
	                                  						"peer": { "type" : "string" },
	                                  						"topology" : {"type" : "string"},
	                                  						"script" : {"type" : "string"},
	                                  						"workers" : 
	                                  						{
	                                  								"type" : "array",
	                                  							 	"items" : {
	                          									 		 "type" : "object",
	                          									 	 	 "properties" : {
	                          									 	 	 		  "wid": { "type" : "number", "required": true },
												                                  "href": {"type": "string"}, 
												                                  "operator": {"type": "string"}, 
												                                  "uptime": {"type": "string"}, 
												                                  "messages": {"type": "string"}, 
												                                  "req-res-station": {"type": "number"}
	                          									 	 		},
	                          									 	 		"required": ["wid", "href", "operator"]
	                          									 	}
	                          								}
	                    						  		},
	                    						  		"required": ["oid", "script", "script", "workers"]
	                    						  	}
	                    						},
	                    			"bindings" : {
	                    				"type" : "array",
	                    				"items" : {
	                    					"type": "object",
	                    					"properties": {
	                    						"from" : {"type": "number"},
	                    						"to" : {"type": "number"}
	                    					},
	                    					"required": ["from", "to"]
	                    				}
	                    			}
	                    		},
	                    		"required": ["tid", "operators", "bindings"]
					}
				}
			}

var operatorSchema = {
				"type":"object",
				"$schema": "http://json-schema.org/draft-03/schema",
				"id": "http://jsonschema.net",
				"required": ["operator"],
				"properties":{
					"operator": {
						"type":"object",
						"properties": {
							"script" : {"type" : "string"},
							"workers" : { "type" : "number" }
						},
						"required": ["script", "workers"]
					}
				}
			}	


var bindingsSchema = {
				"type":"object",
				"$schema": "http://json-schema.org/draft-03/schema",
				"id": "http://jsonschema.net",
				"required": ["bindings"],
				"properties":{
					"bindings": {
						"type":"array",
						"items": {
							"type": "object",
							"properties":{
									"from": {"type": "number"},
									"to": {"type": "number"}
                           	},
                           	"required": ["from", "to"]

						},
						"uniqueItems": true,
						"minitems": 1
					}
				}
			}	


var peerSchema = {
				"type":"object",
				"$schema": "http://json-schema.org/draft-03/schema",
				"id": "http://jsonschema.net",
				"required": ["peer"],
				"properties":{
					"peer": {
						"type":"object",
						"properties":{
							"host": {"type": "string"},
							"port": {"type": "number"}
                        },
                        "required": ["host", "port"]
					}
				}
}



exports.scriptSchema = scriptSchema;
exports.workerSchema = workerSchema;
exports.operatorSchema = operatorSchema;
exports.topologySchema = topologySchema;
exports.bindingsSchema = bindingsSchema;
exports.peerSchema = peerSchema;



