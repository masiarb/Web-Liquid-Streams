var mapOptions = {
 	 center: { lat: -34.397, lng: 150.644},
     zoom: 1
};

var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)

var addMarker = function(c,t,color,location, user) {
	// console.log(t)
	if(location.geonames.length > 0) {
		var loc = location.geonames[0]

		if(!user) {
			var pinLocation = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
		        new google.maps.Size(21, 34),
		        new google.maps.Point(0,0),
		        new google.maps.Point(10, 34));

			var marker = new google.maps.Marker({
		     	position: new google.maps.LatLng(loc.lat, loc.lng),
		     	map: map,
		    	title: t.text,
		    	animation: google.maps.Animation.DROP,
		    	icon: pinLocation
		  	});


		  	google.maps.event.addListener(marker, 'click', function() {
			  	producer_handler({t:t, color:color}, 'producer')
			});
		} else {
			var pinUser = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
			        null, null, null, new google.maps.Size(10, 17))

			var marker = new google.maps.Marker({
		     	position: new google.maps.LatLng(loc.lat, loc.lng),
		     	map: map,
		    	title: t.user.name,
		    	animation: google.maps.Animation.DROP,
		    	icon: pinUser
		  	});
		}
	}
}