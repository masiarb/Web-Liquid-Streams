var timeout

var imagesRecognized = {}

$(document).ready(function(){
    timeout = setInterval(function(){
        
        var personalId = $('#inputId').attr('val')
        recognition(personalId)
    }, 20)
})

var recognition = function(personalId) {
    var canvas = document.getElementById("img2")
    var ctx = canvas.getContext("2d");
    var image = document.getElementById("img1")
    ctx.clearRect (0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // ctx.fillStyle = "blue";
    // ctx.font = "bold 16px Arial";
    // var temperature = $('#temperature').attr('html')
    // var humidity = $('#humidity').attr('html')
    // ctx.fillText(temperature + "", 5, 30);
    // ctx.fillText(humidity + "", 5, 60);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    for (var i = 0; i < pixels.length; i += 4) {
        pixels[i]   = 255 - pixels[i];   // red
        pixels[i+1] = 255 - pixels[i+1]; // green
        pixels[i+2] = 255 - pixels[i+2]; // blue
        // i+3 is alpha (the fourth element)
    }
  
    // overwrite original image
    ctx.putImageData(imageData, 0, 0);

    imagesRecognized[personalId] = JSON.stringify({data: canvas.toDataURL('image/jpeg')})
    $('#inputTest').val(JSON.stringify(imagesRecognized))

    // var c = $("#img1").faceDetection({
    //     complete: function(image, coords) {
    //         var canvas = document.getElementById("img2")
    //         var ctx = canvas.getContext("2d");
    //         var image = document.getElementById("img1")
    //         ctx.clearRect (0, 0, 600, 600);
    //         ctx.drawImage(image, 0, 0);

    //         for(var i = 0; i < coords.length; i++) {
    //            ctx.beginPath();
    //            ctx.rect(coords[i].x, coords[i].y, coords[i].width, coords[i].height);
    //            ctx.lineWidth = 3;
    //            ctx.strokeStyle = 'white';
    //            ctx.stroke();
    //         }


    //         ctx.fillStyle = "blue";
    //         ctx.font = "bold 16px Arial";
    //         var temperature = $('#temperature').attr('html')
    //         var humidity = $('#humidity').attr('html')
    //         ctx.fillText(temperature + "", 5, 30);
    //         ctx.fillText(humidity + "", 5, 60);

    //         imagesRecognized[personalId] = JSON.stringify({data: canvas.toDataURL('image/jpeg')})

    //         $('#inputTest').val(JSON.stringify(imagesRecognized))
    //     },
    //     error: function(img, code, message) {
    //         console.warn(img);
    //         console.warn(code);
    //         console.warn(message);
    //     }
    // });
}