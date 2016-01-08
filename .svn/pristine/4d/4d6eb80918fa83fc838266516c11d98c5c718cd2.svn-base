var counterCanvas = 0
var canvas = $("#canvas");
var ctx = canvas.get()[0].getContext('2d');
var hd = { width: 640, heigth: 480}
var md = { width: 320, heigth: 240}
var ld = { width: 160, heigth: 120}
var chosen = 'jpg';
var intervalTimer = 100


video = document.getElementById('sourcevid');
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia; 
window.URL = window.URL || window.webkitURL;
ctx.drawImage(video, 0, 0, chosen.width, chosen.heigth);
function gotStream(stream) {
    if (window.URL) {
        video.src = window.URL.createObjectURL(stream);
    } else {
        video.src = stream; // Opera.
    }
    
    timer = setInterval(
        function () {
            // if(chosen == 'png') {
            //    producer_handler(canvas.get()[0].toDataURL('image/png'), 'producerStream');
            // } else {
                producer_handler(canvas.get()[0].toDataURL('image/jpeg'), 'producerStream');
            // }
            ctx.drawImage(video, 0, 0, 1280, 960);
            ctx.fillStyle = "red";
            ctx.font = "bold 20px Arial";
            ctx.fillText(counterCanvas + "", 5, 230);
            counterCanvas++
        }, intervalTimer);

    video.onerror = function(e) {
        stream.stop();
    };

    stream.onended = noStream;
}

function noStream(e) {
    var msg = 'No camera available.';
    if (e.code == 1) {
        msg = 'User denied access to use camera.';
    }
        document.getElementById('errorMessage').textContent = msg;
}


navigator.webkitGetUserMedia({video: true}, gotStream, noStream); 

var change_res = function(selectObj) {
    console.log('here')
   var selectIndex=selectObj.selectedIndex;
   var selectValue=selectObj.options[selectIndex].text;
   var canvas = document.getElementById("canvas");


    // console.log(selectValue)
   if(selectValue == "png"){
    chosen = 'png';
   }
   
   else if(selectValue == "jpeg"){
    chosen = 'jpeg';
   }
   
   // else if(selectValue == "LD"){
   //  chosen = ld;
   // }
 }

