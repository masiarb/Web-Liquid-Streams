var debug = require('debug')
var log = {
	rt: debug('wls:routing_table')
}

this.__table = {}

var link = function( from, to, aliases) {
	log.rt('New link: from ' + from.cid + ' to ' + to.cid)

	var from_id = from.cid
	var to_id = to.cid	

	if( ! this.__table[from_id] )
		this.__table[from_id] = { connections: [], node: {}, alias: aliases.from}
		
	if( ! this.__table[to_id] )
		this.__table[to_id] = { connections: [], node: {}, alias: aliases.to}		
	
	this.__table[from_id].connections.push(to_id)
	this.__table[from_id].node = from.node
	this.__table[to_id].node = to.node

	log.rt('Finished linking')
	log.rt(this.__table)
}

var unlink = function(from, to){
	log.rt('Unlink: from ' + from + ' to ' + to)

	if(!this.__table[from]){
		log.rt("Unlinking fail: operator " + from + " has no entry in the routing table");
		return;
	}
	
	for(var i = 0; i < this.__table[from].connections.length; i++){
		if(this.__table[from].connections[i] == to){
			this.__table[from].connections.splice(i,1);
		}
	}
		
	log.rt('Finished unlinking')
	log.rt(this.__table)
}

/*
	Gets the node that contains the operator_id given
	as input variable of the function
	@param: {Number} operator_id Id of the operator of which we
					   want to know the node
*/
var getNode = function(operator_id) {
	return this.__table[operator_id].node;
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

var getAlias = function(from_id, alias) {
	if(!this.__table[from_id])
		return [];

	var connections = []
	for(var i = 0; i < this.__table[from_id].connections.length; i++) {
		var to_id = this.__table[from_id].connections[i]
		
		if(this.__table[to_id].alias == alias) {
			connections.push(to_id)
		}
	}

	return connections
}

/*
	Returns the list of processes that send stuff to
	the input process id to_id
	@param: {Number} to_id The id of the to_process
*/
var getFrom = function(to_id){
	var res = [];
	for(var p in this.__table){
		for(var c in this._table[p].connections) {
			if(this._table[p].connections[c] == to_id) {
				res.push(p)
			}
		}
	}
	return res;
}

/*
	Removes the entry of the given process id
	@param: {Number} pid_to_remove the process id to remove
*/
var removeEntry = function(pid_to_remove){

	for(var p in this.__table) {
		for(var c in this._table[p].connections) {
			if(this._table[p].connections[c] == pid_to_remove) {
				this._table[p].connections.splice(c, 1)
			}
		}
	}

	if(this.__table[pid_to_remove]) {
		delete this.__table[pid_to_remove]
	}
}

/*
	Returns the whole table 
	For now the only purpose is the 'ls connections' command
*/
var get_table = function(){
	return this.__table;
}

var RoutingTable = function(table) {
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
	get_table : get_table,
	getAlias: getAlias
}

module.exports = RoutingTable