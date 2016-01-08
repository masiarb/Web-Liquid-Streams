{
    "topology": {
        "id": "test",
        "operators": [
            {
                "id": "producer",
                "script": "ppp_p.js",
                "automatic": false,
                "browser": {
					"path" : "/producer",
					"only" : true		
				}
            },
            {
                "id": "filter",
                "script": "ppp_f.js",
                "browser": {
                    "path" : "/filter",
                    "only" : true       
                }
            },
            {
                "id": "consumer",
                "script": "ppp_c.js",
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
