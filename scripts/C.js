/**
 * New node file
 */

var k = require('./../k_globals/koala.js')

//
// foo : 2
// bar : 3
//

_fuffa_ = false

k.storage = new Array();

k.createNode(function(msg) {
        //final time to collect data
        if(msg.k == "EOF"){
                var time = new Date().getTime();
                k.runtime_register( { name: 'end-time', value: time } )
        }

        if(!k.storage[msg.k])
                k.storage[msg.k] = 1;
        else
                k.storage[msg.k] += 1;

        /*k.state.get(msg.k, function(result) {
                var val = 0;
                if(result == null )
                        val = 0
                else
                        val = result.val
                val++
                k.state.set(msg.k, val);
        })*/

}).start()

setInterval(function(){console.log(k.storage)}, 1000);


//k.state.makeObservable('/table')
console.log('C -- Table started')


