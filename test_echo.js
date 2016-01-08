{
    "topology": {
        "id": "test",
        "operators": [
            {
                "id": "producer",
                "script": "counter.js"
	    },
            {
                "id": "filter",
                "script": "echo.js"
            },
            {
                "id": "consumer",
                "script": "counter_consumer.js"
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
