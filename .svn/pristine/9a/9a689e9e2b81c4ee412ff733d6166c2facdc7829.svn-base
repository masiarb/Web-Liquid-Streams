var timeout

        $(document).ready(function(){
            timeout = setInterval(function(){update()}, 1000)
        })

        var update = function() {
            var s = $('#images').html()

            // if(s == '' || s == undefined) {
                var imgs = JSON.parse(s)


                var tags = ''
                $('#list').html('')
                for(var index in imgs) {
                    tags = tags + '<img id="theImg' + index + '" src="' + imgs[index] + '" />'
                }
                $('#list').prepend(tags)
            // }
        }