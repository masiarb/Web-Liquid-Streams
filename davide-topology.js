{
	"topology" : {
		"id" : "davide-test-01",
		"operators" : [
			{
				"id" : "tp",
				"script" : "tp2.js"
			},
			{
				"id" : "tf",
				"script" : "tf2.js"
			},
			{
				"id" : "tc",
				"script" : "tc2.js"
			}
		],
		"bindings" : [
			{
				"from" : "tf",
				"to" : "tc",
				"type" : "content_based"

			},
			{
				"from" : "tp",
				"to" : "tf",
				"type" : "content_based"
			}
		]
	}
}