{
    "topology": {
        "id": "test",
        "operators": [
            {
                "id": "producer",
                "script": "p_p.js"
            },
            {
                "id": "filter",
                "script": "p_f.js",
		          "automatic" : true
            },
            {
                "id": "consumer",
                "script": "p_c.js",
        		"workers": 1,
        		"automatic" : true
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
