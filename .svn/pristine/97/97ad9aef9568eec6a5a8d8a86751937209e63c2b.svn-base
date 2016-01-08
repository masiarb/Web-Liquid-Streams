{
    "topology": {
        "id": "test",
        "operators": [
            {
                "id": "producer",
                "script": "icwe_producer.js",
                "automatic": false
            },
            {
                "id": "filter",
                "script": "icwe_f1.js"
            },
            {
                "id": "consumer",
                "script": "icwe_browser.js",
                "browser": {
                    "path" : "/consumer",
                    "only" : true      
                }
            },
            {
                "id": "browser_prod",
                "script": "icwe_browser_producer.js",
                "browser": {
                    "path" : "/icwe_browser_producer",
                    "only" : true      
                }
            },

            {
                "id": "expansion",
                "script": "icwe_f2.js"
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
            },
            {
                "from": "browser_prod",
                "to": "expansion",
                "type": "round_robin"
            },
            {
                "from": "expansion",
                "to": "consumer",
                "type": "round_robin"
            }
        ]
    }
}
