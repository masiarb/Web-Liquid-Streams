/**
 * This controller is Host-level. Each host will have its own controller which takes care of handling req/res for
 * each cluster in that host (koala_node). In principle the controller will work as the global controller works
 * now: it will be at the same level as koala_node (like the global controller was at the same level as the
 * koala_root). The only difference is the decentralization of information: now koala_node (host) should keep all
 * the information related to the workers (& clusters) hosted in it. 
 */

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
var os = require('os');

//new factor that has to be multiplied with the number of workers 
//to be added -> reduce the greedyness of the algorithm
var FACTOR = 1;

var clusters = new Array();
var bindings = new Array();

var singleton = false;

var processors_available = os.cpus().length;
// console.log("processors_available on setup : " + processors_available);
var total_processors = os.cpus().length;
var mod_overcpu = require('../overcpu/build/Release/overcpu');
var ocpu = new mod_overcpu.OverCpu();


/*
	Callback functions defined as empty variables. Filled later when 
	Controller instantiated by koala_node.js.
*/
var add_worker;
var collect_data;
var get_ans_rate;

/*
	Variable controlling last ans_rates for the clusters in THIS node.
*/
var last_ans_rates = [];

/*
	Utility function to check if a controller has been started yet.
*/
var started = function(){
	return singleton;
}

/*
	Returns the processes availability
*/
var get_availability = function(w_to_add){

	var tot_workers = 0;
	for(var i = 0; i < clusters.length; i++){
		//console.log(clusters[i].workers.length);
		tot_workers += clusters[i].workers.length;
	}
	
	//console.log("tot workers : " + tot_workers + " and w_to_add = " + w_to_add);
	
	var single_worker_usage = Math.floor(Math.floor(ocpu.getTotCpuUsage()) / tot_workers);
	
	//console.log("ocpu.getTotCpuUsage() : " + Math.floor(ocpu.getTotCpuUsage()));
	//console.log("single worker usage : " + single_worker_usage);
	//console.log((single_worker_usage * w_to_add));
	
	if(single_worker_usage == 0)
		single_worker_usage = 1;
	
	//if the usage is low and i can add all of them
	if((single_worker_usage * w_to_add) < 95 && Math.floor(ocpu.getTotCpuUsage()) < 70){
		//console.log("w_to_add = " + w_to_add);
		//return w_to_add;
		return Math.floor(w_to_add * FACTOR);
	}
	
	//if i can't add all of them add all possible
	//was 70 - Math.floor(), now 95. changed on 21.05.2014, because not many workers were added when needed
	else{
		var to_return = (95 - Math.floor(ocpu.getTotCpuUsage())) * single_worker_usage;
		
		//console.log("to return = " + to_return);
		
		if(to_return > 0)
			return to_return;
		else
			return 0;
	}
	
	/*
	if(Math.floor(ocpu.getTotCpuUsage()) < 95){
		return true;
	}
	else {
		return false;
	}
	console.log( + " < " + 95);
	console.log("get_avail: " + Math.floor(ocpu.getTotCpuUsage()) < 95 ? true : false)
	return  Math.floor(ocpu.getTotCpuUsage()) < 95 ? true : false;*/
}

/*
	Modifies the process availability
*/
var use_workers = function() {
	//console.log("in use_workers, processors_available : " + processors_available);
	processors_available = processors_available - 1;
	return true
}


/*
	function called by a timeout each second to print the number
	of workers inside the filter cluster
*/
var print_status = function(){
	
	if(!clusters || clusters.length == 0)
		return; 
		
	/*
		Checks the value of the field 'script' and if is p_f it prints the #workers
	*/
	for(var i = 0; i < clusters.length; i++){
		//console.log(clusters[i].script)
		if(clusters[i].script === "p_f.js"){
			//console.log("adding data to results.txt : " + clusters[i].workers.length);
			fs.appendFileSync("results.txt",clusters[i].workers.length+"\n", 'utf8');
		}
	}
			
}

var req_ans_means;

var buffer_check = function(){

	//check if buffer has yet to be initialized
	if(buffer.length == 0){
		//console.log("buffer.length = 0, return");
		return; 
	}
	
	
	//buffer contains all the req/ans rates for all the clusters in a window of time
	//for each cluster we should compute a mean of req rates and ans rates and then use it
	//to compute the to_add variable and pass it to the re_config function
	req_ans_means = new Array();
	
	//for each cluster contains the mean 
	for(var i = 0; i < clusters.length; i++){
		//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
		
		if(clusters[i]){
			
			var clu_req_sum = 0;
			var clu_ans_sum = 0;
			
			for(var j = 0; j < buffer.length; j++){
				//console.log("i = " + i + " j = " + j);
				//console.log("buffer["+j+"]["+i+"] = " + JSON.stringify(buffer[j][i]));
				clu_req_sum += buffer[j][i].req_rate;
				clu_ans_sum += buffer[j][i].ans_rate;
			}
			
			req_ans_means.push({
				req_mean : Math.ceil(clu_req_sum / buffer.length),
				ans_mean : Math.ceil(clu_ans_sum / buffer.length),
			});
			
			//console.log(req_ans_means);
		}
	}
	
	var tmp = new Array();
	
	//console.log("req_ans_means = " + JSON.stringify(req_ans_means));
	
	for(var i = 0; i < req_ans_means.length; i++){
		var delta = 0;
		var req_worker = 0;
		var to_add = 0;
		
		delta = req_ans_means[i].req_mean - req_ans_means[i].ans_mean;
		
		//console.log("delta = " + delta + " = " + req_ans_means[i].req_mean + " - " + req_ans_means[i].ans_mean + " and i = " + i);
		
		if(delta < 0)
			delta = 0
		
		req_worker = req_ans_means[i].ans_mean / clusters[i].workers.length;
		
		//console.log("req_worker = " + req_worker + " = " + req_ans_means[i].ans_mean + " / " + clusters[i].workers.length + " and i = " + i);
		
		to_add = delta/req_worker;
		
		to_add = Math.ceil(to_add);
		
		//console.log("to add = " + to_add + " = " + delta + " / " + req_worker + " and i = " + i);
		
		if(req_worker == 0)
			to_add = 0;
		
		if(to_add > 0)
			to_add = get_availability(to_add);
		
		if(!clusters[i].producer)
			tmp.push(to_add+ clusters[i].workers.length);
		else
			tmp.push(clusters[i].workers.length);
	}
	
	buffer_counter = 0;
	buffer = new Array();
	
	//call re_config with data
	//console.log("tmp = " + tmp);
	re_config(tmp)
	
}

//this was commented because it gave some error in mashup challenge, uncomment it when done,remember to uncomment re_config as well
//var bcheck = setInterval(buffer_check, 10000);

var Controller = function( cd, aw, gr ) {
	collect_data = cd
	add_worker = aw
	get_ans_rate = gr
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
var comp_num = 0;
var old_data;
var clusters;

/*
	This function adds 1 to the variable comp_number. This means a new cluster has
	been added to the topology, thus the component number raises by 1. Adds a new
	component object to the array comps aswell.
*/
var add_comp = function(cid){
	comps.push(new comp(cid));
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
	Function that should send a message to all the parties involved and
	gather the number of messages sent in total (requests) for each 
	cluser and the number of messages processed in total (responses/answers)
	for each cluster. Data must be combined accordingly (eg. filter_msg_request, filter_msg_response)
	but pay attention that the _request part is on the sender (eg. producer), while the response 
	part is on the actual process that dispatches the response (eg a filter)
*/

var c;

c = new Array();

var rate_req = function(cb){
		
		collect_data(data_analysis);
}

/*
	Callback function called after collect_data() has finished
	collecting the data. It has been put outside the collect_data
	call because it is easier to call it from the hearbeat (if ever used).
	It takes as input parameter data, which is an array of arrays
	with collects per cluster_id (cid) the response of their workers.
*/
var data_analysis = function(data){

			c = new Array();
					
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
			
			//collect CPU data
			//console.log("CPU: " + ocpu.getCpuUsage() + ", rel CPU: " + ocpu.getRelCpuUsage() + ", tot CPU: " + ocpu.getTotCpuUsage());
			
			//cb(data);
			//console.log("=================================collect_data")
			
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
					//check if there is a cluster or is an empty entry in the array (it happens when more machines connected)
					if(clusters[i]){
					
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
								
								//how many messages were received from the old measurement
								//console.log(data[clusters[i].cid][j].data + " - " + old_data[clusters[i].cid][j].data  )
								newdata[clusters[i].cid][j] = {};
								newdata[clusters[i].cid][j].data = data[clusters[i].cid][j].data;
								newdata[clusters[i].cid][j].rcvd = data[clusters[i].cid][j].rcvd;
								
								bypass[clusters[i].cid][j] = {};
								bypass[clusters[i].cid][j].data =  data[clusters[i].cid][j].data - old_data[clusters[i].cid][j].data;
								bypass[clusters[i].cid][j].avg =  data[clusters[i].cid][j].avg;
								bypass[clusters[i].cid][j].rcvd = data[clusters[i].cid][j].rcvd - old_data[clusters[i].cid][j].rcvd;
								
							}
						}
					}
				}
				
				old_data = newdata.slice();
				
			}
			
			//ans_rate
			for(var i = 0; i < clusters.length; i++){
				//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
				if(clusters[i]){
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
					
					last_ans_rates[clusters[i].cid] = SUM;
					
					if(flag)
						c[clusters[i].cid].req_rate = SUM;
						
				}
			}
			
			for(var i = 0; i < clusters.length; i++){
				//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
				if(clusters[i]){
					var SUM = 0;
					var AVG = 0;
					var counter = 0;
					
					//t_out
					//console.log(bindings[clusters[i].cid])
					if(bindings[clusters[i].cid]){
						
						//iterating on bindings[clusters[i].cid].to.length but asking c[j]
						//this is because j in this case also represents the cid of clusters (positioned at the right index)
						//so it is used as reference for the cid of the cluster in the array c
						for(var j = 0; j < bindings[clusters[i].cid].to.length; j++){
							//c[cluster id].t_in / t_out
							if(c[j]){
								if(c[j].t_in)
									AVG += c[j].t_in;
								counter++;
							}
						}
					
						//==============================req_rate
						
						//from is an array of arrays
						//-> .from[j] contains the workers inside the cluster j
						//-> .from[j][k] contains a single worker instance
						
						var callback_flag = false;
						var callback_calls = [];
						for(var j = 0; j < bindings[clusters[i].cid].from.length; j++){
							
							//check if the entry in c exists + if the binding exists (binding is based on
							//indexes (j in this case represents the cid from which there exists a binding)
							if(c[j] && bindings[clusters[i].cid].from[j]){
								SUM += c[j].ans_rate;
								
								//moving this code here because of the callback inside this for-loop
								if(j+1 == bindings[clusters[i].cid].from.length && (!callback_flag || callback_calls.length == 0)){
									//if last element of loop
									if(bindings[clusters[i].cid].from.length != 0){
										c[clusters[i].cid].req_rate = SUM;
									}
						
									if(bindings[clusters[i].cid].to.length != 0){
										c[clusters[i].cid].t_out = AVG / counter;
									}
									
									compute_rates()
								}
								
							}
							
							//in case c[j] doesn't exist but there is a binding from that cluster
							//it means it is on another node, so we have to ask data from it!
							if(!c[j] && bindings[clusters[i].cid].from[j]){
								//get ans_rate from cid j 
								callback_flag = true;
								callback_calls.push(true);
								
								get_ans_rate(j, clusters[i].cid, i, function(cid, i, ans_rate){	
									SUM += ans_rate;
									
									if(bindings[clusters[i].cid].from.length != 0){
										c[clusters[i].cid].req_rate = SUM;
									}
									
									callback_calls.pop()
									
									if(cid + 1 == bindings[clusters[i].cid].from.length || callback_calls.length == 0){
										//if last element of loop
										compute_rates()
									}
									
								});
							}
						}
					}
				}
			}
		}

var compute_rates = function(){
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
		//check to control if there is a cluster or is an empty entry in the array (it happens when more machines connected)
		if(clusters[i]){
		
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
					
			req_worker = c[clusters[i].cid].ans_rate / clusters[i].workers.length;
			
			//console.log("req_worker = " + req_worker + " = " + c[clusters[i].cid].ans_rate + " / " + clusters[i].processes.length);
			
			to_add = delta / req_worker;
			
			//console.log("to add = " + to_add + " = " + delta + " / " + req_worker);
			
			if(req_worker == 0)
				to_add = 0;
			
			//console.log("to be added : " + to_add + "to cid " + clusters[i].cid + " with req_rate : " + c[clusters[i].cid].req_rate + " and ans_rate : " + c[clusters[i].cid].ans_rate + "saving on " + "reqans"+clusters[i].cid+".txt");
			
			if(to_add > 0 && delta !== 1){
				tmp.push(Math.ceil(to_add));
			}
			else if(delta < 0 && clusters[i].workers.length >= to_add + 1){
				tmp.push(Math.ceil(to_add));
			}
			else{
				tmp.push(0);
			}
		}
	}
	//console.log(tmp)
	
	//instead of calling re_config put the data into the variable called "buffer"
	//it's an array with the indexes which should correspond to the clusters (like tmp)
	//take the value at the same index, if undefined overwrite it, otherwise sum it
	//[pay attention maybe you should put only the to_add variable in the "buffer" variable (or sum it) and then in the function called
	// in the timeout sum it with the actual processes.length per cluster and call re_config]
	
	buffer[buffer_counter] = new Array();
	buffer[buffer_counter] = newtmp.slice();
	buffer_counter++;
}

/*
	Returns the answer_rate of a given CID
*/
var get_ar = function(cid, i, cb){
	//console.log("IN GET_AR : c[cid].ans_rate = " + JSON.stringify(c[cid].ans_rate) + " c[cid] = " + JSON.stringify(c[cid]) + " with cid = " + cid)
	if(!last_ans_rates.length == 0)
		cb(cid, i, last_ans_rates[cid]);
}

/*
	This function calls the function in k_root_commands to modify the number of
	workers per cluster, depending on the outcome of the algorithm.
*/
var re_config = function(tmps){
	
	//TODO
	
	for(var i = 0; i < tmps.length; i++){
		//foreach cluster check the number of workers inside that cluster
		
		//add some worker -> tmps[i]-processes is the total number of workers to be added
		//"addworker [src] [cid] [nid]"
		/*else*/ if(tmps[i] > clusters[i].workers.length && !clusters[i].producer && !adding_workers){
		
			/*
				I set a flag that remembers that I'm adding workers. In the callback of the addworker
				I increase a counter and I do a check. If the counter's value is equal to the number of workers
				that needed to be added when the re_config() function was first called, then I revert the
				flag, thus in the next iteration, if more workers are needed, it will fall again here.
			*/
			
			total_workers_to_be_added = tmps[i] - clusters[i].workers.length;
			//console.log("total_workers_to_be_added in re_config = " + total_workers_to_be_added);
			adding_workers = true;
			//console.log((tmps[i] - clusters[i].processes.length) + " workers to be added to cid " + i + " actual workers: " + clusters[i].processes.length);
			for(var j = 0; j < total_workers_to_be_added; j++){
				
				//add_worker(["addworker", clusters[i].script, clusters[i].cid, clusters[i].node.uid], function(msg){
				add_worker(clusters[i].cid, function(msg){
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
		
	else {
		//console.log("some workers have to be removed....");
		//remove workers?
	}
	}
	
	
}


var add_pending_workers = function(index){
	if(index >= 0){
		add_worker(worker_to_add[index], function(msg){
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


var start_collect = function() {
	//console.log("in start_collect 0");
	//started variable used when migrating
	if(singleton){
		console.log("CONTROLLER ALREADY STARTED");
		return
	}
	
	
	singleton = true;
	
	//console.log("in start_collect")
	setInterval(print_status, 1000);
	
	setInterval(function(){
	
		/*
			If producer: nothing in t_in (undefined) since you don't receive nothing, you produce.
			If middle: you have both t_in and t_out as you receive something, do something, send something.
			If consumer: nothing in t_out (undefined) since you don't send nothing, you just receive to consume.
		*/
		
		rate_req(function(rates){
		// every 3000ms, I request the input and output rate for each component of the system
		// assign resouce to different components by need rates 
		var needs = new Array(comp_num)
		var _need = 0.1;
		
		for(var i = 0; i < comp_num; i++){
		
			comps[i].req_rate = rates[i].req_rate;
			comps[i].ans_rate = rates[i].ans_rate;
			
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
			if(clusters[comps[i].cid].producer)
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
			if(!clusters[i].producer)	 
				comps[i].working_num = tmps[i];
			
			//console.log('child_num ' + comps[i].child_num + ' ' + tmps[i])		
		}
					
		console.log('tmp >>>>>' + tmps.toString())	
		
		re_config(tmps);
		});
	},4000);
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
	if(!clusters && c){
		clusters = new Array();
		for(var i = 0; i < c.length; i++)
			if(c[i])
				clusters[i].push(c[i]);
		return;
	}
	
	if(!clusters)
		return
	
	for(var i = 0; i < clusters.length; i++){
		//set the number of workers working in the cluster
		if(clusters[i] && !comps[clusters[i].cid]){
			comps[clusters[i].cid] = new comp(clusters[i].cid);
			comp_num++;
			comps[clusters[i].cid].working_num = clusters[i].workers.length;
		}
		
		

		
	}
	
	clusters = new Array();
	for(var i = 0; i < c.length; i++){
		if(c[i]){
			clusters.push(c[i]);
		}
	}
}

/*
	This function updates the bindings inside the "to" value in clusters
*/
var update_bindings = function (bin){
	//for each cluster if a binding exist add it to the clusters variable
	
	bindings = bin.slice();
	/*for(var i = 0; i < clusters.length; i++){
		if(bindings[clusters[i].cid]){
			clusters[i].to = bindings[clusters[i].cid].to;
			clusters[i].from = bindings[clusters[i].cid].from;
		}
		else{
			clusters[i].to = [];
			clusters[i].from = [];
		}
	}*/
}

var req_ans_means_to = setInterval(function(){
	fs.appendFileSync("req_ans_means.txt", JSON.stringify(req_ans_means) +"\n", 'utf8');
}, 1000);

//function used to get the req_rate and ans_rate inside the clusters, but returns the whole clusters because there can be some utility of doing that in the future
var getClusters = function(){
	return req_ans_means;
}

Controller.prototype = {
	tuning : tuning,
	re_config : re_config,
	rate_req : rate_req,
	add_comp : add_comp,
	start_collect : start_collect,
	update_clusters : update_clusters,
	update_bindings : update_bindings,
	compute_workers : compute_workers,
	kill_process : kill_process,
	get_availability : get_availability,
	use_workers : use_workers,
	get_ar : get_ar,
	started : started,
	data_analysis : data_analysis,
	getClusters : getClusters
}

module.exports = Controller;
