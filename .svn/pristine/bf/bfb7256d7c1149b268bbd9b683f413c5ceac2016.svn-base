{
    "topology": {
        "id": "test",
        "operators": [
            {
                "id": "producer",
                "script": "wcp.js",
                "automatic": false,
                "browser": {
					"path" : "/producer",
					"only" : true		
				}
            },
            {
                "id": "filter",
                "script": "wcf.js",
                "browser": {
                    "path" : "/filter",
                    "only" : true       
                }
            },
            {
                "id": "consumer",
                "script": "wcc.js",
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
