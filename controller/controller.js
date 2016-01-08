var _PID = require('./PID.js')

var fs = require('fs');
var PM;

/*
	Flag that stores the process of adding workers. If the re_config() function is adding workers
	then this flag is set to true and the re_config(), when called subsequently, will not fall
	into the if statement where I need to add more workers. This is because the controller can't
	notice the fact that I'm adding workers, thus it may send, in every iteration, the need of
	adding more workers when in reality I'm already adding them.
	The worker_counter variable keeps track of the number of workers being added in the meantime.
	The total_workers_to_be_added variable keeps the total number of workers that needs to be added.
*/
var adding_workers = false;
var worker_counter = 0;
var total_workers_to_be_added = 0;
var buffer = new Array();
var buffer_counter = 0;
var processes_availability = new Array();

/*
	Returns the processes availability
*/
var get_availability = function(){
	return processes_availability;
}

/*
	function called by a timeout each second to print the number
	of workers inside the filter cluster
*/
var print_status = function(){
	if(!clusters || clusters.length == 0 || !clusters[1])
		return; 
		
	//fs.appendFileSync("results.txt",clusters[1].processes.length+"\n", 'utf8');
	
	/*if(clusters[3])
		fs.appendFileSync("consumer.txt", clusters[3].processes.length+"\n", 'utf8');
	else
		fs.appendFileSync("consumer.txt", clusters[2].processes.length+"\n", 'utf8');*/
}

var buffer_check = function(){
	
	//check if buffer has yet to be initialized
	if(buffer.length == 0)
		return; 
	/*
	//take data out of buffer
	var tmp = buffer.slice();
	
	//compute average
	for(var i = 0; i < buffer.length; i++){
		tmp[i] = Math.ceil(buffer[i] / buffer_counter) + clusters[i].processes.length;
	}
	
	fs.appendFile("results.txt",tmp[1]+"\n", function(err) {
    					if(err) {
        					console.log("error in append_file in results.txt file controller.js : " + err);
    					} else {
    					}
					});
	
	//reset data
	buffer_counter = 0;
	buffer = new Array(); */
	
	//console.log(buffer)
	//buffer contains all the req/ans rates for all the clusters in a window of time
	//for each cluster we should compute a mean of req rates and ans rates and then use it
	//to compute the to_add variable and pass it to the re_config function
	var req_ans_means = new Array();
	//for each cluster contains the mean 
	for(var i = 0; i < clusters.length; i++){
		var clu_req_sum = 0;
		var clu_ans_sum = 0;
		
		for(var j = 0; j < buffer.length; j++){
			//console.log("i = " + i + " j = " + j);
			
			clu_req_sum += buffer[j][i].req_rate;
			clu_ans_sum += buffer[j][i].ans_rate;
		}
		
		req_ans_means.push({
			req_mean : Math.ceil(clu_req_sum / buffer.length),
			ans_mean : Math.ceil(clu_ans_sum / buffer.length),
		});
	}
	
	var tmp = new Array();
	
	//nodes involved stores at each index the number of available processors on the node which shares the same index
	//in the same for loop computes the total number of workers running on the cluster
	var nodes_involved = [];
		
	for(var i = 0; i < clusters.length; i++){
		//if the entry doesn't exist, create it
		if(!nodes_involved[clusters[i].node.uid]){
			nodes_involved[clusters[i].node.uid] = {
				processors_total : clusters[i].node.processors.length,
				workers_running : clusters[i].processes.length,
				processors_available : clusters[i].node.processors.length - clusters[i].processes.length,
			};
		}
		//otherwise aggregate the data
		else {
			nodes_involved[clusters[i].node.uid].workers_running += clusters[i].processes.length;
			var ava = nodes_involved[clusters[i].node.uid].processors_available - clusters[i].processes.length;
			if(ava < 0)
				ava = 0;
			
			nodes_involved[clusters[i].node.uid].processors_available = ava;
		}
	}
	
	for(var i = 0; i < req_ans_means.length; i++){
		var delta = 0;
		var req_worker = 0;
		var to_add = 0;
		
		delta = req_ans_means[i].req_mean - req_ans_means[i].ans_mean;
		
		/*if(i == 1)
			console.log("delta = " + delta + " = " + req_ans_means[i].req_mean + " - " + req_ans_means[i].ans_mean);*/
		
		if(delta < 0)
			delta = 0
		
		req_worker = req_ans_means[i].ans_mean / clusters[i].processes.length;
		
		/*if(i == 1)
			console.log("req_worker = " + req_worker + " = " + req_ans_means[i].ans_mean + " / " + clusters[i].processes.length);*/
		
		to_add = delta/req_worker;
		
		/*if(i == 1)
			console.log("to add = " + to_add + " = " + delta + " / " + req_worker);*/
		
		if(req_worker == 0)
			to_add = 0;
		
		to_add = Math.ceil(to_add);
		
		var available = nodes_involved[clusters[i].node.uid].processors_available;
		
		if(to_add > available){
			to_add = available;
		}
		
		//console.log("to_add = " + to_add + " available = " + available);
		
		nodes_involved[clusters[i].node.uid].processors_available = nodes_involved[clusters[i].node.uid].processors_available - to_add;
		nodes_involved[clusters[i].node.uid].workers_running += to_add; 
		
		processes_availability = nodes_involved.slice();
		
		//console.log(processes_availability)
		
		/*
		if(to_add > 0 && delta !== 1){
			tmp.push(to_add + clusters[i].processes.length);
		}
		else if(delta < 0 && clusters[i].processes.length >= to_add + 1){*/
			tmp.push(to_add+ clusters[i].processes.length);
		/*}
		else{
			tmp.push(clusters[i].processes.length);
		}*/
		
		
	}
	
	buffer_counter = 0;
	buffer = new Array();
	
	//call re_config with data
	console.log("tmp = " + tmp);
	re_config(tmp)
	
}

var bcheck = setInterval(buffer_check, 10000);

var Controller = function( process_manager ) {
	//console.log(process_manager);
	PM = process_manager
}

/*
	Function that creates a view of the component which will be modified
	according to the need of the component after the samples. At the 
	beginning all the components have the same values inside.
*/
var comp = function(cid){

	var c = {
		child_num:1,
	 	worker_speed:1,
		working_num:1,
		req_rate:0,
		ans_rate:0,
		cid : cid
	}
	
	return c
	
}

/*
	Creating the components
*/
var comps = new Array()

var worker_to_add = [];

/*
	K values for the PID algorithm
*/
var k ={
	p:1,
	i:0.1,
	d:0.2
}
var PID = new _PID(k)
var comp_num = 0;
var old_data;
var clusters;

/*
	This function adds 1 to the variable comp_number. This means a new cluster has
	been added to the topology, thus the component number raises by 1. Adds a new
	component object to the array comps aswell.
*/
var add_comp = function(cid){
	//warning
	comps[cid] = new comp(cid);
	comp_num++;
}

/*
	Function that notices the controller that a worker has been killed. It passes as 
	argument the list of clusters so that it just has to save that and knows again everything.
	Has also to remove the worker from the control itself (if this is not done, the 
	controller will add it as soon as it notices one is missing).
*/
var kill_process = function(clu, cid){
	clusters = clu;
	//NOT ENOUGH -> check how they are added
	comps[cid].working_num--;
	//PID.reset();
}

/*
	Function to compute CPU usage
*/
var cpu_usage = function(cpus){
	//console.log(cpus);
	var TOTAL = 0;
	for(var i = 0; i < cpus.length; i++){
		TOTAL += cpus[i].times.user + cpus[i].times.nice + cpus[i].times.sys + cpus[i].times.idle + cpus[i].times.irq;
		//console.log(cpus[i].times.idle / TOTAL);
		//TOTAL = 0;
	}
	
	
}

/*
	Function that should send a message to all the parties involved and
	gather the number of messages sent in total (requests) for each 
	cluser and the number of messages processed in total (responses/answers)
	for each cluster. Data must be combined accordingly (eg. filter_msg_request, filter_msg_response)
	but pay attention that the _request part is on the sender (eg. producer), while the response 
	part is on the actual process that dispatches the response (eg a filter)
*/
var rate_req = function(cb, andrea_controller){
		
		var c = new Array();
		
		if(!clusters)
			return;
		
		//create a variable storing data about each cluster
		for(var i = 0; i < clusters.length; i++){
			if(clusters[i]){
				c[clusters[i].cid] = {
					cid : clusters[i].cid,
					ans_rate : -1,
					req_rate : -1,
				}
			}
		}
		
		//console.log("prima di chiamare rate_req");
		
		PM.collect_data(function(data){
			//cb(data);
			
			//order the data array
			var newdata = new Array();
			
			var bypass = new Array();
			
			if(old_data == undefined){
				//console.log("old data undefined!");
				old_data = data;
			}
			
			else {
				//to prevent something still unexplicable
				if(!clusters)
					return;
					
				for(var i = 0; i < clusters.length; i++){
					newdata[clusters[i].cid] = new Array();
					bypass[clusters[i].cid] = new Array();
					
					for(var j in data[clusters[i].cid]){
							
							
						//if the data does not exist, we will treat it as a 0, since it
						//appears to be too old (that is, it's an old worker) so we put
						//it like it has received/sent nothing (0).
						if(old_data[clusters[i].cid] == undefined){
							old_data[clusters[i].cid] = new Array()
						}
						if(old_data[clusters[i].cid][j] == undefined){
							old_data[clusters[i].cid][j] = {};
						}
						if(old_data[clusters[i].cid][j].data == undefined){
							old_data[clusters[i].cid][j].data = 0;
						}
						if(old_data[clusters[i].cid][j].rcvd == undefined){
							old_data[clusters[i].cid][j].rcvd = 0;
						}
						
						if(old_data && clusters && 
						typeof data[clusters[i].cid][j].data == 'number' &&
						typeof old_data[clusters[i].cid][j].data == 'number' &&
						typeof data[clusters[i].cid][j].rcvd == 'number' &&
						typeof old_data[clusters[i].cid][j].rcvd == 'number'){
							
							//console.log(data[clusters[i].cid][j].data + " - " + old_data[clusters[i].cid][j].data  )
							newdata[clusters[i].cid][j] = {};
							newdata[clusters[i].cid][j].data = data[clusters[i].cid][j].data;
							newdata[clusters[i].cid][j].rcvd = data[clusters[i].cid][j].rcvd;
							
							bypass[clusters[i].cid][j] = {};
							bypass[clusters[i].cid][j].data =  data[clusters[i].cid][j].data - old_data[clusters[i].cid][j].data;
							bypass[clusters[i].cid][j].avg =  data[clusters[i].cid][j].avg;
							bypass[clusters[i].cid][j].rcvd = data[clusters[i].cid][j].rcvd - old_data[clusters[i].cid][j].rcvd;
							
							//console.log(bypass[clusters[i].cid][j].rcvd)
							
							//if(data[clusters[i].cid][j].data < 0 )
								//data[clusters[i].cid][j].data = 0;
						}
					}
				}
				
				old_data = newdata.slice();
			}
			
			//ans_rate
			for(var i = 0; i < clusters.length; i++){
				//iterate through first dimension (cid)
				var SUM = 0;
				var flag = false;
				var average_exec_time = 0;
				var counter = 0;
				
				for(var j in bypass[clusters[i].cid]){
					//this check ensures that we don't have NaN as a result. it happens when traversing the
					//array and finds the augmented function "remove" and "contains" (which may be killed sooner or later)
					if(typeof bypass[clusters[i].cid][j].data == 'number'){
						if(bypass[clusters[i].cid][j].avg){
							average_exec_time += bypass[clusters[i].cid][j].avg;
							counter++;
						}
						SUM += bypass[clusters[i].cid][j].data
					}
					if(bypass[clusters[i].cid][j].isProducer)
						flag = true;
				}
				//console.log(average_exec_time);
				if(average_exec_time > 0){
					//t_in
					bypass[clusters[i].cid]["avg"] = average_exec_time / counter;
					//console.log("avg for cid = " + clusters[i].cid + " is : " + bypass[clusters[i].cid]["avg"])
					c[clusters[i].cid].t_in = average_exec_time / counter;
				}
				
				c[clusters[i].cid].ans_rate = SUM;
				c[clusters[i].cid].cid = clusters[i].cid;
				
				if(flag)
					c[clusters[i].cid].req_rate = SUM;
					
				
			}
			
			//req_rate
			for(var i = 0; i < clusters.length; i++){
				var SUM = 0;
				var AVG = 0;
				var counter = 0;
				
				//t_out
				for(var j = 0; j <clusters[i].to.length; j++){
					AVG += c[clusters[i].to[j]].t_in;
					counter++;
				}
				
				//req_rate
				for(var j = 0; j < clusters[i].from.length; j++){
					SUM += c[clusters[i].from[j]].ans_rate;
				}
				
				//NEW WAY TO COMPUTE REQ_RATE
				/*for(var j in bypass[clusters[i].cid]){
					if(typeof bypass[clusters[i].cid][j].data == 'number'){
						SUM += bypass[clusters[i].cid][j].rcvd;
					}
				}*/
				
				
				
				if(clusters[i].from.length != 0){
					c[clusters[i].cid].req_rate = SUM;
				}
				
				if(clusters[i].to.length != 0){
					c[clusters[i].cid].t_out = AVG / counter;
				}
			}
			
			//console.log(c);
			
			/*
				instead of calling cb here compute if req_rate == ans_rate in the previous node and if ans_rate is bigger
				then add workers.
			*/
			
			var tmp = new Array(); //old code kept for completeness, if new approach work erase this and everything related to it
			var newtmp = new Array();
			
			var delta = 0;
			var req_worker = 0;
			var to_add = 0;
			for(var i = 0; i < clusters.length; i++){
				
				clusters[i].ans_rate = c[clusters[i].cid].ans_rate;
				clusters[i].req_rate = c[clusters[i].cid].req_rate;
				
				newtmp.push({
					req_rate : c[clusters[i].cid].req_rate,
					ans_rate : c[clusters[i].cid].ans_rate,
				});
			
				/*
					if i want to keep all the deltas and then make a mean i also have to keep the ans_rates at least
					so for the sake of completeness let's keep all the data: req_rate, ans_rate and compute
					delta, req_worker and to_add directly in the callback that access to the buffer variable
				*/
				
				
				
			
				delta = c[clusters[i].cid].req_rate - c[clusters[i].cid].ans_rate;
				//console.log("delta = " + delta + " = "+ c[clusters[i].cid].req_rate + " - " + c[clusters[i].cid].ans_rate);
				if( delta < 0)
					delta = 0;
						
						
						/*
					fs.appendFile("deltas.txt",delta+"\n", function(err) {
    					if(err) {
        					console.log("error in append_file for deltas.txt" + err);
    					} else {
    					}
					});	*/
				
				
				req_worker = c[clusters[i].cid].ans_rate / clusters[i].processes.length;
				
				//console.log("req_worker = " + req_worker + " = " + c[clusters[i].cid].ans_rate + " / " + clusters[i].processes.length);
				
				/*if(req_worker < 1)
					req_worker = 1;*/
				to_add = delta / req_worker;
				
				//console.log("to add = " + to_add + " = " + delta + " / " + req_worker);
				
				if(req_worker == 0)
					to_add = 0;
				
				//console.log("to be added : " + to_add + "to cid " + clusters[i].cid + " with req_rate : " + c[clusters[i].cid].req_rate + " and ans_rate : " + c[clusters[i].cid].ans_rate + "saving on " + "reqans"+clusters[i].cid+".txt");
				
				/*if(to_add > 0 && delta !== 1){
					//need to add workers
					tmp.push(Math.ceil(clusters[i].processes.length + to_add));
				}
				else if (delta < 0 && clusters[i].processes.length >= to_add + 1){
					tmp.push(Math.ceil(clusters[i].processes.length - to_add));
				}
				else{
					tmp.push(Math.ceil(clusters[i].processes.length));
				}*/
				
				if(to_add > 0 && delta !== 1){
					tmp.push(Math.ceil(to_add));
				}
				else if(delta < 0 && clusters[i].processes.length >= to_add + 1){
					tmp.push(Math.ceil(to_add));
				}
				else{
					tmp.push(0);
				}
			}
			//console.log(tmp)
			
			//instead of calling re_config put the data into the variable called "buffer"
			//it's an array with the indexes which should correspond to the clusters (like tmp)
			//take the value at the same index, if undefined overwrite it, otherwise sum it
			//[pay attention maybe you should put only the to_add variable in the "buffer" variable (or sum it) and then in the function called
			// in the timeout sum it with the actual processes.length per cluster and call re_config]
			
			//UPDATE: we keep req_rate and ans_rate in the buffer and everything will be computed in the callback of the buffer
			
			/*for(var i = 0; i < tmp.length; i++){
				if(!buffer[i]){
					buffer[i] = tmp[i];
				}
				else{
					buffer[i] += tmp[i];
				}
			}*/
			
			
			if(!andrea_controller){
				//console.log("================================================================================CALLED With !andrea_controller = " + !andrea_controller);
				buffer[buffer_counter] = new Array();
				//console.log("new tmp = ");
				//console.log(newtmp)
				buffer[buffer_counter] = newtmp.slice();
				//console.log(buffer);
				buffer_counter++;
			}
			//re_config(tmp)
			
			
			//cb(c);
		});
}



/*
	This function calls the function in k_root_commands to modify the number of
	workers per cluster, depending on the outcome of the algorithm.
*/
var re_config = function(tmps){
	
	for(var i = 0; i < tmps.length; i++){
		//foreach cluster check the number of workers inside that cluster
		
		//console.log(tmps[i] +">"+ clusters[i].processes.length + " and adding_workers = " + adding_workers);
		
		//when uncommenting this if remember to uncomment the "else" statement before the next if
		//tmps[i] > 1 to try to avoid situations in which the clusters goes below 1
		/*if(tmps[i] < clusters[i].processes.length && clusters[i].automatic && tmps[i] > 1){
			console.log("some worker to be removed from cid " + i + " actual workers: " + clusters[i].processes.length);
			//remove some worker -> processes - tmp is the way to remove the correct number of workers.
			for(var j = 0; j < (clusters[i].processes.length - tmps[i]); j++){
				PM.kill_process_cluster(['killp', ""+i], function(msg){
					//console.log(msg)
				});
			}
		}*/
		
		//add some worker -> tmps[i]-processes is the total number of workers to be added
		//"addworker [src] [cid] [nid]"
		/*else*/ if(tmps[i] > clusters[i].processes.length && clusters[i].automatic && !adding_workers){
			/*
				I set a flag that remembers that I'm adding workers. In the callback of the addworker
				I increase a counter and I do a check. If the counter's value is equal to the number of workers
				that needed to be added when the re_config() function was first called, then I revert the
				flag, thus in the next iteration, if more workers are needed, it will fall again here.
			*/
			total_workers_to_be_added = tmps[i] - clusters[i].processes.length;
			adding_workers = true;
			//console.log((tmps[i] - clusters[i].processes.length) + " workers to be added to cid " + i + " actual workers: " + clusters[i].processes.length);
			for(var j = 0; j < total_workers_to_be_added; j++){
				//console.log(j);
				PM.add_worker(["addworker", clusters[i].script, clusters[i].cid, clusters[i].node.uid], function(msg){
					//console.log("worker added " + msg + " out of " + total_workers_to_be_added);
					worker_counter++;
					//console.log("worker counter is now " + worker_counter + " and total_workers_to_be_added is " + total_workers_to_be_added);
					if(worker_counter == total_workers_to_be_added){
						worker_counter = 0;
						adding_workers = false;
						total_workers_to_be_added = 0;
						//console.log("FINITO ========================================================================================================================================");
					}
				});
				/*if(j == tmps[i] - 1)
					add_pending_workers(worker_to_add.length - 1);*/
			}
			
		}
	}
	
}


var add_pending_workers = function(index){
	if(index >= 0){
		PM.add_worker(worker_to_add[index], function(msg){
			console.log("MESSAGGIO : " + msg);
			add_pending_workers(index - 1);
		});
	}
	else
		worker_to_add = new Array();
}


var total_worker = 0;

/*
	Updates the total number of workers that can be spawned across the topology. For the sake of simplicty for now
	it's just the number of processors available on the differen machines (nodes) connected to the topology.
*/
var compute_workers = function(num){
	total_worker = parseInt(num);
}


var start_collect = function(andrea_controller) {

setInterval(print_status, 1000);

setInterval(function(){

	/*
		If producer: nothing in t_in (undefined) since you don't receive nothing, you produce.
		If middle: you have both t_in and t_out as you receive something, do something, send something.
		If consumer: nothing in t_out (undefined) since you don't send nothing, you just receive to consume.
	*/
	
	rate_req(function(rates, andrea_controller){
	// every 3000ms, I request the input and output rate for each component of the system
	// assign resouce to different components by need rates 
	var needs = new Array(comp_num)
	var _need = 0.1;
	
	for(var i = 0; i < comp_num; i++){
	
		//OLD APPROACH: KEEP THESE HERE JUST IN CASE
		comps[i].req_rate = rates[i].req_rate;
		comps[i].ans_rate = rates[i].ans_rate;
		
			/*NEW APPROACH NOT WORKING
			
			if(rates[i].t_out && rates[i].t_in){
				comps[i].req_rate = rates[i].req_rate / rates[i].t_in * 1000
				comps[i].ans_rate = rates[i].ans_rate / rates[i].t_out * 1000
			}
		*/
		//if not producer && not consumer (only middle has t_in and t_out defined)
		/*if(rates[i].t_out && rates[i].t_in){
		
			console.log("req_rate new : " + rates[i].t_in / rates[i].req_rate)
			console.log("ans_rate new : " + rates[i].t_out / rates[i].ans_rate);
			
			//console.log("computing " + "(" + rates[i].t_in + "  * " + rates[i].req_rate + " / " + rates[i].t_out + " * " + rates[i].ans_rate + ") * " + clusters[rates[i].cid].processes.length);
			//then it's a middle element
			comps[i].req_rate = clusters[rates[i].cid].processes.length
			comps[i].ans_rate = ((rates[i].t_in * rates[i].req_rate) / (rates[i].t_out * rates[i].ans_rate)) * clusters[rates[i].cid].processes.length;
			if(isNaN(comps[i].ans_rate)){
				comps[i].ans_rate = 0;
			}
		}
		else {
			comps[i].req_rate = rates[i].req_rate;
			comps[i].ans_rate = rates[i].ans_rate;
		}*/
		
		//console.log(comps[i]);
		
		if(comps[i].ans_rate){	
			// update the worker_speed, using average moving techque 
			comps[i].worker_speed = 0.5 * (comps[i].ans_rate) / comps[i].working_num + 0.5 * comps[i].worker_speed;		
		}
					
		//needs is the ideal working_num  
		needs[i] = (comps[i].req_rate + PID.get_i(i)) / comps[i].worker_speed;
		_need += needs[i]
	}
				
	var tmps = new Array(comp_num)
	//var _tmp = 0;
	for(var i = 0; i < comp_num; i++){
		// but we might not have as much workers as the ideal working_num of all the component, 
		//so let they share it in proportion 
		
		//modify only if it's automatic
		if(!clusters[comps[i].cid].automatic)
			continue;
		
		comps[i].child_num = Math.round(total_worker * (needs[i] / _need));
		
		if(!comps[i].child_num)
			comps[i].child_num = 1
				
		// after the above computation, all total worker_num is divided to each component, i.e. comps[i].child_num
		//But how much does the component really needs? use PID.pi to get the value
		tmps[i] = tuning(i,comps[i].req_rate, comps[i].ans_rate, comps[i].working_num, comps[i].child_num, comps[i].worker_speed)
		//pi controller 
				
		//balance the cost of adding or removing process, and the benefit of gaining as much as necessary process
		//F = A(final_worker -original_worker)^2 +B(pi_worker- final_worker )^2,
		//here, I let A = 0.55 B=0.45 
		// Then to make F minimum => final_worker = 0.55*original_worker+0.45*pi_worker 
		//can also make it more stable. the final working num is between the original one and the value computed by PI controller
		//tmps[i] = Math.round(0.55 * tmps[i] + 0.45 * comps[i].working_num)
		if(tmps[i] > comps[i].child_num) 
			tmps[i] = comps[i].child_num
			
		//if the cluster is automatic, then you can update the working_num to match the value it will be
		//when updated (in re_config function). if it's manual there is no need to update the number of
		//workers for that cluster/component, so we don't even update it in the working_num variable  
		if(clusters[i].automatic)	 
			comps[i].working_num = tmps[i];
		
		//console.log('child_num ' + comps[i].child_num + ' ' + tmps[i])		
	}
				
	console.log('tmp >>>>>' + tmps.toString())	
	
	//re_config(tmps);
	});
},3000);
 }


var tuning = function(who,req_rate, ans_rate, working_num, child_num, worker_speed){
	var new_num
	var err = PID.pi(req_rate, ans_rate, 1, who)
	new_num = working_num + Math.round(err/worker_speed)

	if(new_num>child_num)
		working_num =child_num;
		
	else if(new_num)
		working_num = new_num
		
	else 
		working_num =1;
		
	return working_num;
}

/*
	This function updates the clusters variable in the class. The
	clusters variable is then used in the aggregation of data to
	compute the tuning.
*/
var update_clusters = function(c){
	if(!clusters)
		clusters = c
	for(var i = 0; i < clusters.length; i++){
		//check existance of cluster & set the number of workers working in the cluster
		if(clusters[i])
			comps[clusters[i].cid].working_num = clusters[i].processes.length;
	}
	clusters = c;
}

var migrationController = {
	ping: false,
	battery: true,
	cpu: true,
	operators: false,
	network: false,
	cores: true
}

var statistics = []
var ranking = []

// var notifyStats = function(stats, cb) {
// 	peersStats[statpeers] = stats

// 	cb('stored data')
// }

var runInterval = undefined
var runIntervalMilliseconds = 500

var decisionInterval = undefined
var decisionIntervalMilliseconds = 10000 

var date = new Date()
var filenameDecision = "traces/decision_" + date.getHours() + ":" + date.getMinutes() + ".txt"
var filenameRanking = "traces/ranking_" + date.getHours() + ":" + date.getMinutes() + ".txt"

runInterval = setInterval(function(){
	// console.log('Start migration controller')

	statistics = []
	var controlled = 0
	var toControl = 0

	for(var c in PM.N.nodes) {
		if(PM.N.nodes[c] != undefined) {
			toControl++

			var channel = undefined
			if(PM.N.nodes[c].remote) {
				channel = PM.N.nodes[c].channel.koala_remote	
			} else {
				channel = PM.N.nodes[c].channel.koala_node
			}

			var pid = PM.N.nodes[c].uid

			channel.notifyStats(pid, function(stats, pid){
				controlled++

				statistics.push(stats)

				if(controlled == toControl) {
					startMigrationController()
				}
			})
		}
	}

}, runIntervalMilliseconds)

decisionInterval = setInterval(function(){
	// console.log('Decision controller')

	var activeDecision = false
	var isRandom = true
	var rankLength = ranking.length

	if(activeDecision) {
		if(!isRandom && rankLength > 0) {
			// console.log('FlatWeight Decision')
			var counter = 0
			var hasPositive = false
			var positivePosition = undefined
			var hasNegative = false
			var negativePosition = undefined
			var hasFinished = false

			while(!hasFinished) {
				if(!hasPositive) {
					if(ranking[counter] >= 0) {
						hasPositive = true
						positePosition = counter
					}
				}

				if(!hasNegative) {
					if(ranking[rankLength - counter] < 0) {
						hasNegative = true
						negativePosition = rankLength - counter
					}
				}

				if((hasPositive && hasNegative) ||  rankLength - counter - counter <= 1)
					hasFinished = true
				else 
					counter++
			}

			if(hasPositive && hasNegative) {
				// console.log('Migrate ' + ranking[negativePosition].peer + ' and ' + ranking[positivePosition].peer)
			} else {
				// console.log('No decision')
			}
		} else if (rankLength > 0) {
			// console.log('Random Decision')
			var activeClusters = []
			for(var c in clusters) {
				if(clusters[c] != undefined) {
					if(clusters[c].script == "e2.js") {
						activeClusters.push(c)
					}
				}
			}

			if(activeClusters.length > 0) {
				var pos = Math.floor(Math.random()*(activeClusters.length - 1))
				var to = Math.floor(Math.random()*(ranking.length - 1))

				PM.migrate_cluster(["migrate", ""+activeClusters[pos], ""+ranking[to].peer ], function(){})

				var s = "Migrated " + activeClusters[pos] + " in " + ranking[to].peer + "\n"
				fs.appendFileSync(filenameDecision, s, encoding='utf8', function(err) {
				 	if(err) {
				     	console.log(err);
				 	}
			 	});
			}
		}
	}
}, decisionIntervalMilliseconds)

var linear_map_numbers = function (value, in_min, in_max, out_min, out_max) {
	return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

var startMigrationController = function() {
	var temp_rank = []

	// console.log(statistics)

	for(var o in statistics) {
		s = statistics[o]
		peer = s.peer

		if(peer != 0) {
			temp_rank[peer] = {
				rank: 0,
				peer: peer
			}

			if(migrationController.battery) {
				if(s.battery == -1)
					temp_rank[peer].rank += 75
				else
					temp_rank[peer].rank += linear_map_numbers(s.battery, 0, 1, -100, 50)
			} 

			if(migrationController.network) {
				if(s.network == 'server')
					// temp_rank[peer].rank += 50
				if(s.network == 'remote')
					temp_rank[peer].rank += 50 
			}

			if(migrationController.cpu) {
				temp_rank[peer].rank += linear_map_numbers(s.cpu, 0, 1, 100, -100)
			}

			if(migrationController.cores) {
				temp_rank[peer].rank += 2 * s.cores
			}

			if(migrationController.ping) {
				//TODO
			}

			if(migrationController.operators) {
				//TODO
			}
		}
	}

	var ordered_rank = temp_rank.sort(
		function(x,y){
			if(y.rank != x.rank)
				return y.rank - x.rank
			else
				return y.peer - x.peer
		})
	ranking = []



	for(var i in ordered_rank) {
		if(ordered_rank[i] != undefined) {
			ranking.push(ordered_rank[i])
		}
	}

	// console.log(ranking)

	// console.log(ranking)

	// var s = JSON.stringify(ranking) + "\n"

	// fs.appendFileSync(filenameRanking, s, encoding='utf8', function(err) {
	//  	if(err) {
	//      	console.log(err);
	//  	}
 // 	});

	// console.log(ranking)
}

var remove_from_rank = function(pid) {
	for(var r in ranking) {
		if(ranking[r].peer == pid) {
			ranking.splice(r, 1)
		}
	}
}

var get_rank = function() {
	return ranking
}

var get_first_best_rank = function() {
	var isRandom = false

	var pos = 0
	if(isRandom) {
		pos = Math.floor(Math.random() * (ranking.length - 1))
	}

	// console.log(pos)
	// console.log(ranking)
	// if(ranking.length > 0) {
	if(ranking[pos] != undefined) {
		return ranking[pos].peer
	} else {
		return undefined
	}
	// } else {
		// return 0
	// }
}

Controller.prototype = {
	tuning : tuning,
	re_config : re_config,
	rate_req : rate_req,
	add_comp : add_comp,
	start_collect : start_collect,
	update_clusters : update_clusters,
	compute_workers : compute_workers,
	kill_process : kill_process,
	get_availability : get_availability,
	get_rank: get_rank,
	get_first_best_rank: get_first_best_rank,
	remove_from_rank: remove_from_rank
}

module.exports = Controller;