

  
 var setpoint;
 var feedback;
 var pre_err_0 = 0;
 var pre_err_1 = 0;
 var err;
 var integral = new Array(20);
 var derivative;
 var k_p;
 var k_i;
 var k_d;
 
 /*
 	Number of clusters, ideally. Here set to 20 fixed.
 	@TODO: change the number, make it dynamic depending on the 
 	number of clusters. Each time a cluster is added, add the 
 	specific entry into the array with value = 0.
 */
 for(var i=0; i<20;i++) integral[i]=0;
 
 var reset = function(){
 	 for(var i=0; i<20;i++) integral[i]=0;
 }

/*
	Retuns the integral for the given id
*/
var get_i = function(who){
	return integral[who];
}
 
/*
	Computes PID
*/
var pid =  function(setpoint, feedback, dt, who){
	err = setpoint - feedback;
	integral[who] = integral[who] + err*dt
	derivative = (err - pre_err_1)/dt;
	pre_err_1 = err;
	var output = k_p*err + k_i*integral[who] + k_d*derivative
	return output
	
}

/*
	Computes PI
*/
var pi = function(setpoint, feedback, dt, who){
	err = setpoint - feedback;
		
	integral[who] = integral[who] + err*dt
	var output = k_p*err + k_i*integral[who]
	return output
}


/*
	Proportional term
	Takes the error and Kp and computes an output value
	that is proportional ti the current error value.
*/
var p = function(setpoint, feedback, dt){
	err = setpoint - feedback;
	var output = k_p*err 
	return output
}

/*
	Sets the K values for P, I, D.
*/
var set_k = function(p, i,d){
	k_p = p;
	k_i = i;
	k_d = d;

}


/*
	Constructor
*/
var PID = function(k) {
	set_k(k.p, k.i, k.d)
}


PID.prototype = {
	set_k:set_k,
	pid: pid,
	pi : pi,
	p: p,
	get_i:get_i,
	
	reset : reset,
	
}

module.exports = PID