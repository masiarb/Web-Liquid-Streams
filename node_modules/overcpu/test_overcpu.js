//
// Tester for module 'overcpu.cpp' -> 'overcpu'
//
// Achille Peternier (C) 2013, achille.peternier@gmail.com
//
var mod_overcpu = require('./build/Release/overcpu');
var ocpu = new mod_overcpu.OverCpu();


// Useful function:
function sleep(milliSeconds)
{
	var startTime = new Date().getTime(); 
	while (new Date().getTime() < startTime + milliSeconds); 
}



// Show pid:
console.log("Process ID: " + ocpu.getPid());
ocpu.setUpdateInterval(1000);

// Just use 100% of CPU until ctrl+C:
for (;;)
{
	console.log("CPU: " + ocpu.getCpuUsage() + ", rel CPU: " + ocpu.getRelCpuUsage());
	sleep(1000);
}



