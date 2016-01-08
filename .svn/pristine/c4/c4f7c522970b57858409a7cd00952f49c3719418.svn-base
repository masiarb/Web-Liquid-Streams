var express = require('express');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 1);

server.listen(9997);

var pingRing = {}

var clients = []
var statistics = {}
var followers = []
var lines = []

var update = function() {
    for(var i = 0; i < followers.length; i++) {
        followers[i].emit('update', statistics)
    }
}
var updateInterval = setInterval(function() {update()}, 5000)

var pingTable;
var EXPECTED_SIZE = 3
var pingRooms = function() {
    // var clientPool = []
    // for(var i = 0; i < clients.length; i++) {
    //     clientPool[i] = clients[i]
    // }

    // var size = clientPool.length
    // var rooms = {}
    // var roomCounter = 0
    // var roomSize = 0
    // while(size > 0 || size > ROOM_SIZE) {
    //     if(roomSize == 0) {
    //         rooms[roomCounter] = []
    //     }

    //     var random = Math.floor(Math.random() * size)
    //     var c = clientPool.splice(random,1)
    //     rooms[roomCounter].push(c)
    //     roomSize++

    //     if(roomSize == 3) {
    //         roomSize = 0
    //         roomCounter++
    //     }

    //     size = clientPool.length
    // }

    // console.log(rooms)

    // for(var index in rooms) {
    //     for(var j = 0; j < rooms[index].length; j++) {
    //         console.log(rooms[index])
    //         rooms[index][j].emit('impose_polling', {room: rooms[index]})
    //     }
    // }

    // console.log('new polling')

    // var expectedRooms = clients.length / EXPECTED_SIZE

    // for(var i in clients) {
    //     clients[i].emit('impose_polling', {room: Math.floor(Math.random()*expectedRooms)})
    // }
}
// var pollingInterval = setInterval(function() {pingRooms()}, 30000)

var pingRingUpdate = function() {
    for(var i = 0; i < followers.length; i++) {
        followers[i].emit('updatePingRing', pingRing)
    }
}
var pingRingUpdateTimeout = setInterval(function(){pingRingUpdate()}, 10000)

io.sockets.on('connection', function (socket) {
    socket.on('identification', function (data) {
        if(data.id) {
            socket.set('id', data.id, function() {
                if(data.id != 'stats') {
                    console.log('New client: ' + data.id)
                    
                    if(data.id != '__koala')
                       clients.push(socket)

                    socket.emit('identified', {})
                    socket.emit('impose_polling', {room: 'polling'})

                    statistics[data.id] = {
                        ping: 0,
                        navigator: {},
                        isMobile: false,
                        location: false,
                        battery: false
                    }

                    for(var i = 0; i < followers.length; i++) {
                        followers[i].emit('update', statistics)
                    }
                } else {
                    console.log('New follower')
                    followers.push(socket)
                    socket.emit('identified', {})
                    socket.emit('update', statistics)
                    socket.emit('lines', lines)
                }
            })
        }
    })

    socket.on('disconnect', function () {
        socket.get('id', function (err, id) {
            if(!err) {
                if(id != 'stats') {
                    var i = clients.indexOf(socket)
                    clients.splice(i,1)
                    delete statistics[id]

                    if(id != '__koala')
                        if(pingRing[id])
                            delete pingRing[id]
                } else {
                    var i = followers.indexOf(socket)
                    followers.splice(i,1)
                }
            }
        });
    });

    socket.on('navigator', function(data) {
        socket.get('id', function (err, id) {
            if(!err) {
                statistics[id].navigator = data.navigator
            }
        });
    })

    socket.on('mobile', function(data) {
        socket.get('id', function (err, id) {
            if(!err) {
                statistics[id].mobile = data.mobile
            }
        });
    })

    socket.on('location', function(data) {
        socket.get('id', function (err, id) {
            if(!err) {
                statistics[id].location = data.location
                if(data.location) {
                    statistics[id].coordinates = data.coordinates
                }
            }
        });
    })

    socket.on('battery', function(data) {
        socket.get('id', function (err, id) {
            if(!err) {
                statistics[id].battery = data.battery
                if(data.battery) {
                    statistics[id].batteryStatus = data.batteryStatus
                }
            }
        });
    })

    socket.on('bind', function(data) {
        lines.push(data)
        for(var i = 0; i < followers.length; i++) {
            followers[i].emit('lines', lines)
        }
    })

    socket.on('ping', function (data) {
        socket.emit('pong', data)
    });

    socket.on('pingValue', function (data) {
        socket.get('id', function (err, id) {
            if(!err) {
                statistics[id].ping = data.ping
            }
        });
    });

    socket.on('pingRing', function (data) {
        var id1 = data.id
        var id2 = data.with
        var latency = data.latency

        if(!pingRing[id1])
            pingRing[id1] = {}

        pingRing[id1][id2] = latency
    });
});