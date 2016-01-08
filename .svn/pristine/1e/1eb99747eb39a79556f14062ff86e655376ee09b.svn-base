var frisby = require('frisby');

var port = '2999';
var URL = 'http://agora.mobile.usilu.net:'+port;

frisby.globalSetup({ // globalSetup is for ALL requests
  request: {
  	
  }
});


// #############################################
// #############################################

// TESTS EXECUTED AFTER RUNNING exec test_get.js

// #############################################
// #############################################

var topology_post = {
		"topology" : {
            "tid": 1,
            "operators": [
                {
                    "oid": 3,
                    "peer": "agora.mobile.usilu.net",
                    "topology": "second",
                    "script": "mattia_p.js",
                    "workers": [
                        {
                            "wid": 3,
                            "href": "/topologies/1/operators/3/workers/3",
                            "operator": "/topologies/1/operators/3"
                        }
                    ],
                    "automatic": true
                },
                {
                    "oid": 4,
                    "peer": "agora.mobile.usilu.net",
                    "topology": "second",
                    "script": "mattia_f.js",
                    "workers": [
                        {
                            "wid": 4,
                            "href": "/topologies/1/operators/4/workers/4",
                            "operator": "/topologies/1/operators/4"
                        }
                    ],
                    "automatic": true
                },
                {
                    "oid": 5,
                    "peer": "agora.mobile.usilu.net",
                    "topology": "second",
                    "script": "mattia_c.js",
                    "workers": [
                        {
                            "wid": 5,
                            "href": "/topologies/1/operators/5/workers/5",
                            "operator": "/topologies/1/operators/5"
                        }
                    ],
                    "automatic": true
                }
            ],
            "bindings": [
                {
                    "from": 4,
                    "to": 5
                },
                {
                    "from": 3,
                    "to": 4
                }
            ]
        }
}



var operator_post = { "operator": 
						{
				            "oid": 2,
				            "peer": "agora.mobile.usilu.net",
				            "topology": "main",
				            "script": "mattia_c.js",
				            "workers": [
				                {
				                    "wid": 2,
				                    "href": "/topologies/0/operators/2/workers/2",
				                    "operator": "/topologies/0/operators/2"
				                }
				            ],
				            "automatic": true
			        	}
		      	 }



var worker_post = {
			"worker": 
		            {
		              "wid": 6,
		              "href": "/topologies/0/operators/0/workers/6",
		              "operator": "/topologies/0/operators/0"
		            }
			}



// ##############################
// ##############################

// 			TOPOLOGIES

// ##############################
// ##############################


frisby.create('GET Topologies')
	.get(URL + '/topologies')
  	.expectStatus(200)
  	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes('topologies.*', {
			tid: Number,
			operators: Array,
			bindings: Array
	 }).expectJSONTypes("topologies.0.operators.*", {
	 		oid: Number,
	 		peer: String, 
	 		topology: String,
	 		workers: Array
	 }).expectJSONTypes("topologies.0.operators.0.workers.*", {
	 		wid: Number,
	 		href: String, 
	 		operator: String
	 }).expectJSON({
	    "topologies": [
	        {
	            "tid": 0,
	            "operators": [
	                {
	                    "oid": 0,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_p.js",
	                    "workers": [
	                        {
	                            "wid": 0,
	                            "href": "/topologies/0/operators/0/workers/0",
	                            "operator": "/topologies/0/operators/0"
	                        }
	                    ]
	                },
	                {
	                    "oid": 1,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_f.js",
	                    "workers": [
	                        {
	                            "wid": 1,
	                            "href": "/topologies/0/operators/1/workers/1",
	                            "operator": "/topologies/0/operators/1"
	                        }
	                    ]
	                },
	                {
	                    "oid": 2,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_c.js",
	                    "workers": [
	                        {
	                            "wid": 2,
	                            "href": "/topologies/0/operators/2/workers/2",
	                            "operator": "/topologies/0/operators/2"
	                        }
	                    ]
	                }
	            ],
	            "bindings": [
	                {
	                    "from": 1,
	                    "to": 2
	                },
	                {
	                    "from": 0,
	                    "to": 1
	                }
	            ]
        }]
    });





frisby.create('GET Topology')
		.get(URL+'/topologies/0')
		.expectStatus(200)
	  	.expectHeaderContains('content-type', 'application/json')
		.expectJSONTypes('topology', {
				tid: Number,
				operators: Array,
				bindings: Array
		 }).expectJSONTypes("topology.operators.*", {
		 		oid: Number,
		 		peer: String, 
		 		topology: String,
		 		workers: Array
		 }).expectJSONTypes("topology.operators.0.workers.*", {
		 		wid: Number,
		 		href: String, 
		 		operator: String
		 }).expectJSON({
		 	"topology" : {
	            "tid": 0,
	            "operators": [
	                {
	                    "oid": 0,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_p.js",
	                    "workers": [
	                        {
	                            "wid": 0,
	                            "href": "/topologies/0/operators/0/workers/0",
	                            "operator": "/topologies/0/operators/0"
	                        }
	                    ]
	                },
	                {
	                    "oid": 1,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_f.js",
	                    "workers": [
	                        {
	                            "wid": 1,
	                            "href": "/topologies/0/operators/1/workers/1",
	                            "operator": "/topologies/0/operators/1"
	                        }
	                    ]
	                },
	                {
	                    "oid": 2,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_c.js",
	                    "workers": [
	                        {
	                            "wid": 2,
	                            "href": "/topologies/0/operators/2/workers/2",
	                            "operator": "/topologies/0/operators/2"
	                        }
	                    ]
	                }
	            ],
	            "bindings": [
	                {
	                    "from": 1,
	                    "to": 2
	                },
	                {
	                    "from": 0,
	                    "to": 1
	                }
	            ]
        	}
		 }).toss();


frisby.create('GET Topology: ERROR 1')
		.get(URL+'/topologies/10')
		.expectStatus(404)
		.expectHeaderContains('content-type', 'application/json')
		.expectJSONTypes({
				code: String,
				message: String
		}).
		expectJSON({
			code: "ResourceNotFound",
			message: "No topology with tid = 10"
		}).toss();


frisby.create('GET Topology: ERROR 2')
		.get(URL+'/topologies/test')
		.expectStatus(409)
		.expectHeaderContains('content-type', 'application/json')
		.expectJSONTypes({
				code: String,
				message: String
		}).
		expectJSON({
			code: "InvalidArgument",
			message: "tid must be a number"
		}).toss();




// ##############################
// ##############################

// 			OPERATORS

// ##############################
// ##############################


frisby.create('GET Operators')
	.get(URL + '/topologies/0/operators')
	.expectStatus(200)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes('operators.*', {
			oid: Number,
			peer: String,
			topology: String,
			script: String,
			workers: Array
	 }).expectJSONTypes("operators.0.workers.*", {
	 		wid: Number,
	 		href: String, 
	 		operator: String
	 }).expectJSON({
	 	"operators": [
	                {
	                    "oid": 0,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_p.js",
	                    "workers": [
	                        {
	                            "wid": 0,
	                            "href": "/topologies/0/operators/0/workers/0",
	                            "operator": "/topologies/0/operators/0"
	                        }
	                    ]
	                },
	                {
	                    "oid": 1,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_f.js",
	                    "workers": [
	                        {
	                            "wid": 1,
	                            "href": "/topologies/0/operators/1/workers/1",
	                            "operator": "/topologies/0/operators/1"
	                        }
	                    ]
	                },
	                {
	                    "oid": 2,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_c.js",
	                    "workers": [
	                        {
	                            "wid": 2,
	                            "href": "/topologies/0/operators/2/workers/2",
	                            "operator": "/topologies/0/operators/2"
	                        }
	                    ]
	                }
	            ]
	 }).toss();



frisby.create('GET Operator')
	.get(URL + '/topologies/0/operators/0')
	.expectStatus(200)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes("operator", {
	 		oid: Number,
	 		peer: String, 
	 		topology: String,
	 		script: String,
	 		workers: Array
	 })
	.expectJSONTypes("operator.workers.*", {
		wid: Number,
	 	href: String, 
	 	operator: String
	})
	.expectJSON({
	 	"operator": 
	                {
	                    "oid": 0,
	                    "peer": "agora.mobile.usilu.net",
	                    "topology": "main",
	                    "script": "p_p.js",
	                    "browser": false,
	                    "workers": [
	                        {
	                            "wid": 0,
	                            "href": "/topologies/0/operators/0/workers/0",
	                            "operator": "/topologies/0/operators/0"
	                        }
	                    ]
	                }
	 }).toss();



frisby.create('GET Operator: ERROR 1')
	.get(URL + '/topologies/0/operators/10')
	.expectStatus(404)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
			code: String,
			message: String
	}).
	expectJSON({
			code: "ResourceNotFound",
			message: "No operator with oid = 10"
	}).toss();


frisby.create('GET Operator: ERROR 2')
	.get(URL + '/topologies/10/operators/10')
	.expectStatus(404)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
				code: String,
				message: String
	}).
	expectJSON({
			code: "ResourceNotFound",
			message: "No topology with tid = 10"
	}).toss();



frisby.create('GET Operator: ERROR 3')
	.get(URL + '/topologies/0/operators/test')
	.expectStatus(409)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
				code: String,
				message: String
	}).
	expectJSON({
			code: "InvalidArgument",
			message: "tid and oid must be numbers"
	}).toss();


frisby.create('GET Operator: ERROR 4')
	.get(URL + '/topologies/test/operators/test')
	.expectStatus(409)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
				code: String,
				message: String
	}).
	expectJSON({
			code: "InvalidArgument",
			message: "tid and oid must be numbers"
	}).toss();


// ##############################
// ##############################

// 			WORKERS

// ##############################
// ##############################

frisby.create('GET Workers')
	.get(URL + '/topologies/0/operators/0/workers')
	.expectStatus(200)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes("workers.*", {
	 		wid: Number,
	 		href: String, 
	 		operator: String
	 })
	.expectJSON({
		"workers": [
	                {
	                    "wid": 0,
	                    "href": "/topologies/0/operators/0/workers/0",
	                    "operator": "/topologies/0/operators/0"
	                }
	               ]

	}).toss();




frisby.create('GET Worker')
	.get(URL + '/topologies/0/operators/0/workers/0')
	.expectStatus(200)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes("worker", {
	 		wid: Number,
	 		href: String, 
	 		operator: String
	 })
	.expectJSON({
		"worker": 
	            {
	              "wid": 0,
	              "href": "/topologies/0/operators/0/workers/0",
	              "operator": "/topologies/0/operators/0"
	            }
	}).toss();


frisby.create('GET Worker: ERROR 1')
	.get(URL + '/topologies/0/operators/0/workers/10')
	.expectStatus(404)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
	 		code: String,
	 		message: String
	 })
	.expectJSON({
		code: "ResourceNotFound",
		message: "No worker with wid = 10"
	         
	}).toss();


frisby.create('GET Worker: ERROR 2')
	.get(URL + '/topologies/0/operators/10/workers/10')
	.expectStatus(404)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
	 		code: String,
	 		message: String
	 })
	.expectJSON({
		"code": "ResourceNotFound",
		"message": "No operator with oid = 10"
	         
	}).toss();


frisby.create('GET Worker: ERROR 3')
	.get(URL + '/topologies/10/operators/10/workers/10')
	.expectStatus(404)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
	 		code: String,
	 		message: String
	 })
	.expectJSON({
		"code": "ResourceNotFound",
		"message": "No topology with tid = 10"
	         
	}).toss();




frisby.create('GET Worker: ERROR 4')
	.get(URL + '/topologies/0/operators/0/workers/test')
	.expectStatus(409)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
	 		code: String,
	 		message: String
	 })
	.expectJSON({
		"code": "InvalidArgument",
		"message" : "tid, oid and wid must be numbers"    
	}).toss();


frisby.create('GET Worker: ERROR 5')
	.get(URL + '/topologies/0/operators/test/workers/test')
	.expectStatus(409)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
	 		code: String,
	 		message: String
	 })
	.expectJSON({
		"code": "InvalidArgument",
		"message" : "tid, oid and wid must be numbers"    
	}).toss();

frisby.create('GET Worker: ERROR 6')
	.get(URL + '/topologies/test/operators/test/workers/test')
	.expectStatus(409)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSONTypes({
	 		code: String,
	 		message: String
	 })
	.expectJSON({
		"code": "InvalidArgument",
		"message" : "tid, oid and wid must be numbers"    
	}).toss();



