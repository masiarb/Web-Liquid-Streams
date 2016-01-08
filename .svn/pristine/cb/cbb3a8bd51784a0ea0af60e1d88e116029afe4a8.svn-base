 /**
 * koala console manager
 */

var util = require('util');

var link = function( from, to ) {
	
	var from_id = from.pid
	var to_id = to.pid	

	if( ! this.__table[from_id] )
		this.__table[from_id] = { connections: [], node: {} }
		
	if( ! this.__table[to_id] )
		this.__table[to_id] = { connections: [], node: {} }		
	
	this.__table[from_id].connections.push(to_id)
	this.__table[from_id].node = from.node
	this.__table[to_id].node = to.node
}

/*
	Unlinks two processes
	@param: {Number} from The pid from which the connection starts
	@param: {Number} to The pid to which the connection arrives
*/
var unlink = function(from, to, proxy, cb){
	console.log(this.__table);
	console.log("checking from = " + from);
	this.__table[from].connections = this.__table[from].connections.remove(this.__table[from].connections.indexOf(to));
	//delete this.__table[from].connections[to]
	if(this.__table[from].connections == 0)
		this.__table[from].connections = [];
		
	//remove method returns an element of the table if it's the last
	//one remaining, the following if statement avoids that by
	//recreating the missing array
	if( Object.prototype.toString.call( this.__table[from].connections ) !== '[object Array]' ) {
    	var arr = [];
    	arr.push(this.__table[from].connections)
    	this.__table[from].connections = arr;
	}
	
	cb(proxy, this.__table)
}

/*
	Gets the node that contains the process_id given
	as input variable of the function
	@param: {Number} process_id Id of the process of which we
					   want to know the node
*/
var getNode = function(process_id) {
	return this.__table[process_id].node;
}

/*
	Returns the ids of the processess to which
	the input process_id is connected to
	@param: {Number} from_id The id of the process of which we
							 want to know the connections
*/
var getTo = function(from_id){
	if(!this.__table[from_id])
		return [];
	return this.__table[from_id].connections;
}

/*
	Returns the list of processes that send stuff to
	the input process id to_id
	@param: {Number} to_id The id of the to_process
*/
var getFrom = function(to_id){
	var res = [];
	for(var p in this.__table){
		if(this.__table[p].connections.contains(to_id)){
			res.push(p);
		}
	}
	return res;
}

/*
	Removes the entry of the given process id
	@param: {Number} pid_to_remove the process id to remove
*/
var removeEntry = function(pid_to_remove){
	
	//remove all the connections from the routing table
	for(var entry in this.__table){
		if(this.__table[entry].connections.contains(pid_to_remove)){
			this.__table[entry].connections = this.__table[entry].connections.remove(this.__table[entry].connections.indexOf(pid_to_remove));
		}
		
		if(this.__table[entry].connections == 0)
			this.__table[entry].connections = [];
		
		//remove method returns an element of the table if it's the last
		//one remaining, the following if statement avoids that by
		//recreating the missing array
		if( Object.prototype.toString.call( this.__table[entry].connections ) !== '[object Array]' ) {
    		var arr = [];
    		arr.push(this.__table[entry].connections)
    		this.__table[entry].connections = arr;
		}
	}
	
	//check if the process was a consumer or a produces aswell
	if(this.__table[pid_to_remove])
		delete this.__table[pid_to_remove];
}


var RoutingTable = function( table ) {
	
	if(table)
		this.__table = table
	else
		this.__table = {}
}

RoutingTable.prototype = {
	link : link,
	unlink: unlink,
	getNode : getNode,
	getTo : getTo,
	getFrom : getFrom,
	removeEntry : removeEntry,
}

module.exports = RoutingTable

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

 