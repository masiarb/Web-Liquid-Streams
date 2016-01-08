var k = require('./../k_globals/koala.js')

k.createNode(function(stream) {
	k.send({
		s: stream.data.t,
		color: stream.data.color
	})

	k.done()
})

k.registerProducer('producer')