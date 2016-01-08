var STATISTICS_SERVER = 'http://agora.mobile.usilu.net:9997'
var statsServer

var batteryUpdate = 5000
var batteryTimeout

var pingTimeoutTime = 5000
var pingTimeout

var locationTimeoutTime = 10000
var locationTimeout

var ping = 0
var MAX_PINGS = 1
var currentPings = 0
var pingValues = []

var polling_timeout
var polling_channel
var pollingUpdate = 5000

var startStatics = function(id) {
	statsServer = io.connect(STATISTICS_SERVER, {
       	'force new connection': true
    })

    statsServer.on('connect', function () {
    	statsServer.emit('identification', {id: id});
 	});

 	statsServer.on('identified', function() {
 		statsServer.emit('navigator', {navigator: navigatorInfo()}) 
    	statsServer.emit('mobile', {mobile: isMobile.any()}) 
    	pinging()
    	getPosition()
    	getBattery()
 	})

 	statsServer.on('pong', function (data) {
 		var value = (Date.now()).toString() - data.date;
 		pingValues.push(value)
 		currentPings++

 		if(currentPings == MAX_PINGS) {
 			var mean = 0
 			
 			for(var i = 0; i < pingValues.length; i++) {
				mean = mean + (pingValues[i] / 2)
			}

			ping = mean / pingValues.length

			statsServer.emit('pingValue', {ping: ping})
			pingTimeout = setTimeout(function(){pinging()}, pingTimeoutTime);
 		}

 	})

 	statsServer.on('impose_polling', function (data) {
 		var room = data.room

 		polling_channel = new DataChannel(room, {
           	onopen: function(userid) { 

            },
            onclose: function(event) {

            },
            onmessage: function(message, userid, latency) {
            	if(message.type == 'pingReq') {
            		polling_channel.channels[userid].send({
            			id: id,
            			type: 'pingRes',
            			date: message.date
            		})
            	} else if (message.type == 'pingRes') {
            		statsServer.emit('pingRing', {
		        		id: id,
		        		with: message.id,
		        		latency: (Date.now()).toString() - message.date
            		})
            	}
            }
        })

 		polling_timeout = setInterval(function(){
 			polling_channel.send({
 				type: 'pingReq',
 				date: (Date.now()).toString()
 			})
 		}, pollingUpdate)
 	})
}

var getBattery = function() {
	if(window.battery) {
	    statsServer.emit('battery', {
	    	battery: true,
	    	batteryStatus: window.battery.level * 100
	    })

	    batteryTimeout = setTimeout(function() {getBattery()}, batteryUpdate)
	} else {
		statsServer.emit('battery', {
	    	battery: false
	    })
	}
}



var pinging = function() {
	pingValues = []
	currentPings = 0
	for(var i = 0; i < MAX_PINGS; i++) {
		statsServer.emit('ping', {date: (Date.now()).toString()})
	}
}

var navigatorInfo = function() {
	return {
		appCodeName: navigator.appCodeName,
		appName: navigator.appName,
		appVerion: navigator.appVersion,
		cookieEnabled: navigator.cookieEnabled,
		language: navigator.language,
		onLine: navigator.onLine,
		platform: navigator.platform,
		userAgent: navigator.userAgent,
		systemLanguage: navigator.systemLanguage
	}
}

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

var getPosition = function() {
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(sendPosition);
    } else {
    	statsServer.emit('location', {location: false})
    }
}

function sendPosition(position) {
	statsServer.emit('location', {
		location: true,
		coordinates: {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}
	})

	locationTimeout = setTimeout(function(){getPosition()}, locationTimeoutTime);
}