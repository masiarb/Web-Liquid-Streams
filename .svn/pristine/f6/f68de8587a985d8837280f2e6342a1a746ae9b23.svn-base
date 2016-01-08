//define the chart
var lineChartData = {
	labels : [],
	datasets : [
		{
			label: "Temperature Data Set",
			fillColor : "rgba(220,220,220,0.2)",
			strokeColor : "rgba(220,220,220,1)",
			pointColor : "rgba(220,220,220,1)",
			pointStrokeColor : "#fff",
			pointHighlightFill : "#fff",
			pointHighlightStroke : "rgba(220,220,220,1)",
			data : []
		}
	]

}
var updateInterval;
var myLine;
var myRealLine;
var ctx = document.getElementById("canvas").getContext("2d");
Chart.defaults.global.animation = false;
Chart.defaults.global.showTooltips = false;

myLine = new Chart(ctx);
myRealLine = myLine.Line(lineChartData, {
	responsive: true
});

var updateGraph = function(temperature, time) {
	console.log(temperature, time)
	
	myRealLine.destroy();
		 
  //push newly received data (time & data)
  lineChartData.datasets[0].data.push(temperature);
  lineChartData.labels.push(time);

  //if longer than 20, remove the first one
  if(lineChartData.datasets[0].data.length > 20){
    lineChartData.datasets[0].data.shift();
    lineChartData.labels.shift();
  }

  //draw it
  myLine.Line(lineChartData);
  
  //empty the content of the div
  document.getElementById('newdata').setAttribute('temperature', "");
  document.getElementById('newdata').setAttribute('time', "");
}
