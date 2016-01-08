{
    "topology": {
        "id": "test",
        "operators": [
            {
                "id": "producer",
                "script": "a1.js",
                "automatic": false,
                "browser": {
					"path" : "/producer",
					"only" : true		
				}
            },
            {
                "id": "filter",
                "script": "a2.js",
                "browser": {
                    "path" : "/filter",
                    "only" : true       
                }
            },
            {
                "id": "consumer",
                "script": "a3.js",
                "browser": {
                    "path" : "/consumer",
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
