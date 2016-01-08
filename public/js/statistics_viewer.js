var map
var mapCanvas
var mapOptions = {
	center: new google.maps.LatLng(46.0210231, 8.9648071),
	zoom: 8,
	mapTypeId: google.maps.MapTypeId.ROADMAP
}

var STATISTICS_SERVER = 'http://agora.mobile.usilu.net:9997'
var statsServer

var markers = {}
var polylines = []
var lines = []

var startStatics = function() {
	statsServer = io.connect(STATISTICS_SERVER, {
       	'force new connection': true
    })

    statsServer.on('connect', function () {
    	statsServer.emit('identification', {id: 'stats'});
 	});

 	statsServer.on('identified', function() {
 		console.log('ready')
 	})

 	statsServer.on('update', function(data) {
 		updateStats(data)
 	})

 	statsServer.on('updatePingRing', function(data){
 		updatePingRing(data)
 	})

 	statsServer.on('lines', function(data) {
 		lines = data
 	})
}

$(document).ready(function() {
	mapCanvas = document.getElementById('map_canvas');
    map = new google.maps.Map(mapCanvas, mapOptions);

    startStatics()
});

var deleteMarkers = function() {
	for (var index in markers) {
  		markers[index].setMap(null);
	}	
	for (var i = 0; i < polylines.length; i++) {
  		polylines[i].setMap(null);
	}
	markers = {}
	polylines = []
}

var updatePingRing = function(data) {
	var s = ""
	
	for(var i in data) {
		s = s + ' <div class="row-fluid"><div class="col-md-12"><table class="table table-bordered">'
		
		s = s + '<tr>'
		s = s + '<th></th>'
		for(var j in data[i]) {
			if(data[j]) {
				s = s + "<th>"
				s = s + j
				s = s + "</th>"
			}
		}
		s = s + '</tr><tr>'
		s = s + '<td>' + i + '</td>'
		for(var j in data[i]) {
			if(data[j]) {
				s = s + "<td>"
				s = s + data[i][j] + " ms"
				s = s + "</td>"
			}
		}
		s = s + '</tr></table></div></div>'
	}

	$('#ping_list').html(s)
}

var updateStats = function(data) {
	deleteMarkers()

	$('#list').html('')
	for(var index in data) {
		if(index != '__koala') {
			var old = $('#list').html()
	    	var add = '<div class="row-fluid"><div style="border: 1px solid black" class="col-md-12">'
	    	add = add + '<div class="row-fluid" style="height:30px">' + index + '</div>'
	    	add = add + '<div class="row-fluid" style="height:30px">Ping: ' + data[index].ping + ' ms</div>'

	    	if(data[index].isMobile == null)
	    		add = add + '<div class="row-fluid" style="height:30px">Mobile: ' + data[index].isMobile + '</div>'
	    	else
	    		add = add + '<div class="row-fluid" style="height:30px">Desktop</div>'
	    		
	    	if(data[index].battery)
	    		add = add + '<div class="row-fluid" style="height:30px">Battery: ' + data[index].batteryStatus.level + '%</div>'
	    	else
	    		add = add + '<div class="row-fluid" style="height:30px">No battery info</div>'	
	    		
	    	add = add + '</div></div>';

	    	$('#list').html(old + add)

	    	if(data[index].location) {
	    		if(data[index].coordinates && data[index].coordinates.latitude && data[index].coordinates.longitude) {
	    			var latLong = new google.maps.LatLng(data[index].coordinates.latitude,data[index].coordinates.longitude)
					var marker = new google.maps.Marker({
			  			position: latLong,
			  			map: map,
			  			title: index
						});

					markers[index] = marker
	    		}
	    	}
		}
	}

	for(var i = 0; i < lines.length; i++) {
		var from = lines[i].from
		var to = lines[i].to

		if(data[from] && data[to] && data[from].location && data[to].location) {
			var a = [
				new google.maps.LatLng(data[from].coordinates.latitude, data[from].coordinates.longitude),
    			new google.maps.LatLng(data[to].coordinates.latitude, data[to].coordinates.longitude)
			]

			var path = new google.maps.Polyline({
			    path: a,
			    geodesic: true,
			    strokeColor: '#FF0000',
			    strokeOpacity: 1.0,
			    strokeWeight: 2,
			    map:map
			  });

			path.setMap(map);

			polylines.push(path)
		}
	} 
}