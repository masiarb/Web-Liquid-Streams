var fs = require('fs');
var k = require('./../k_globals/koala.js')

var name = "a3"

var first = undefined
var counter = 0
var counter2 = 0

var operator_workers = {} 

var d = new Date()
var filename = "benchNava/" + d.getHours() + "_" + d.getMinutes() + ".txt"

var t

k.createNode(function(msg, uid, options) {
//	console.log(msg)
//	 console.log(options)

	if(first == undefined) {
		first = process.hrtime()
	}

	if(counter % 500 == 0) {
		var last = process.hrtime();
		var interval = (last[0] * 1e9 + last[1]) - (first[0] * 1e9 + first[1])
		if(interval != 0) {
			t = (counter / interval) * 1000000000
			k.log(t)
		}

		first = last
		counter = 0
	}
	
	counter++
	counter2++

	if(true) {
		checks = options.__checkpoints

		var resume = []
		var step = newStep()

		for(var i in checks) {
			if(checks[i].event == 'finished executing') {
				step.peer = checks[i].peer
				step.worker = checks[i].worker
				step.exectime = checks[i].exectime
			} else if(checks[i].event == 'leaving peer') {
				step.peer = checks[i].peer
				step.operator = checks[i].operator
				step.battery_out = checks[i].battery
				step.cpu_out = checks[i].cpu
				step.ping_out = checks[i].ping
				step.m_size_out = checks[i].m_size
				if(checks[i].worker_number != undefined) {
					step.worker_number_out = checks[i].worker_number
					operator_workers[checks[i].operator] = checks[i].worker_number
				}
				step.queue_out = checks[i].queue
				
				resume.push(step)
				step = newStep()
			} else if(checks[i].event == 'message received') {
				step.peer = checks[i].peer
				step.operator = checks[i].operator
				step.battery_in = checks[i].battery
				step.cpu_in = checks[i].cpu
				step.ping_in = checks[i].ping
				step.m_size_in = checks[i].m_size
				step.worker_number_in = checks[i].worker_number

				if(i == checks.length - 1) {
					resume.push(step)
				}
			} else if(checks[i].event == 'starting execution') {
				step.peer = checks[i].peer
				step.worker = checks[i].worker
			} else if(checks[i].event == 'local push') {
				step.peer = checks[i].peer
				step.operator = checks[i].operator
				step.battery_out = checks[i].battery
				step.cpu_out = checks[i].cpu
				step.ping_out = checks[i].ping
				step.m_size_out = checks[i].m_size
				step.worker_number_out = checks[i].worker_number
				step.queue_out = checks[i].queue

				resume.push(step)
				step = newStep()
			}
		}

		var delay = resume[2].ping_in - resume[0].ping_out

		var counterworker = 0
		for(var op in operator_workers) {
			counterworker += operator_workers[op]
		}

		var s = ""
		s+=t+","
		s+=counter2+","
		s+=counterworker+","

		// console.log(resume.length)

		for(var i in resume){
			s += ">, "
			s += resume[i].peer + ","
			s += resume[i].worker + ","
			s += resume[i].operator + ","
			s += resume[i].battery_in + ","
			s += resume[i].battery_out + ","
			s += resume[i].exectime + ","
			s += resume[i].cpu_in + ","
			s += resume[i].cpu_out + ","
			s += resume[i].ping_in + ","
			s += resume[i].ping_out + ","
			s += resume[i].m_size_in + ","
			s += resume[i].m_size_out + ","
			s += resume[i].worker_number_out + ","
			s += resume[i].worker_number_in + ","
			s += resume[i].queue_out + ","
		}

		s +="<,"
		s += delay +",	"
		s +="\n"

		fs.appendFileSync(filename, s, encoding='utf8', function(err) {
		 	if(err) {
		     	console.log(err);
		 	}
		});
	}

	k.done()
});  

function newStep() {
	return {
		worker: undefined,
		operator: undefined,
		battery_in: undefined,
		battery_out: undefined,
		exectime: undefined,
		cpu_in: undefined,
		cpu_out: undefined,
		ping_in: undefined,
		m_size_in: undefined,
		m_size_out: undefined,
		worker_number_out: undefined,
		worker_number_in: undefined,
		queue_out: undefined
	}
}

 k.log("a3 started");
