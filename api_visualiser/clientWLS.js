var workersNum = 0;
// var host = "http://neha.inf.unisi.ch:9086"//"http://agora.mobile.usilu.net:9086";
var line_charts = [];
var updated = false;

var peers = [];


function showOperatorForm() {

    $("#left").hide();
    $("#title h2").text("Add Operator");
    $("#add_operator_bt").hide();
    $("#operator_form").show();
    new Dragdealer('demo-simple-slider', {
      animationCallback: function(x) {
        $('#demo-simple-slider .value').text(Math.round(x*10));
        $('#value-hidden').val(Math.round(x*10));
      }
    });
}



var deleteWorker = function (wid, oid) {


    $.ajax({

      type: "DELETE",
      url: host+"/topologies/1/operators/"+oid+"/workers/"+wid,
      success: function (data) {

        var operators = data.topologies[0].operators;
        var bindings = data.topologies[0].bindings;

        for (var i = 0; i < peers.length; i++) {
            removeOldNodes(operators);
        };

        if(operators) {
          wid = 0;
          for (var i = 0; i < operators.length; i++) {
            var name = "O"+operators[i].oid;
            if(!existOperator(operators[i])) {
                graph.addNode(name, operators[i].peer, operators[i].remote. operators[i].script, '', '');
            }
          };
          updateResultsText(operators, data.topologies[0].tid);
        }

        for (var i = 0; i < operators.length; i++) {
          var workers = operators[i].workers;
          if(!operators[i].remote) {
                for (var k = 0; k < workers.length; k++) {
                    wid++;
                    var name = "W"+workers[k].wid;
                    graph.addNode(name, operators[i].peer, operators[i].remote, "", workers[k].cpu_usage, workers[k].messages, workers[k].uptime);
                    graph.addLink("O"+operators[i].oid, "W"+workers[k].wid);
                }
          }
          updateResultsText(operators, data.topologies[0].tid);
        }



        if(bindings) {

          for(var i = 0; i < bindings.length; i++) {
             if(!existLink("O"+bindings[i].from, "O"+bindings[i].to)) {
                graph.addLink("O"+bindings[i].from, "O"+bindings[i].to);
             }
          }
        }


      }
    });
  }


var updateTopology = function(operators, bindings) {

    console.log("UPDATE TOPOLOGY");
    console.log(operators);


    removeOldNodes(operators);

    if(operators) {
      console.log("UPDATE OPERATORS");
      updateOperators(operators);
    }
    console.log("UPDATE WORKERS");
    updateWorkers(operators);


    if(bindings) {
        updateBindings(bindings);
    }
}

 var deleteOperator = function(oid) {

      $.ajax({
        type: "DELETE",
        url: host+"/topologies/1/operators/"+oid,
        success: function(data) {

            var operators = data.topologies[0].operators;
            var bindings = data.topologies[0].bindings;

            updateTopology(operators, bindings);

        }

      });


  }


 function existLink(from, to) {

    var links = graph.getLinks();
    for(var j = 0; j < links.length; j++) {
        if(from == links[j].source.id && to == links[j].target.id && links[j].source.id[0] == "O" && links[j].target.id[0] == "O") {
          return true;
        }
    }

    return false;

 }

  function existOperator(operator) {

    var nodes = graph.getNodes();
    for(var j = 0; j < nodes.length; j++) {
        if(nodes[j].id[0] == "O" && nodes[j].id.substring(1, nodes[j].id.length) == operator.oid) {
            return true;
        }
    }
    return false;

 }


 function existWorker(worker) {

    var nodes = graph.getNodes();
    for(var j = 0; j < nodes.length; j++) {
        if(nodes[j].id[0] == "W" && nodes[j].id.substring(1, nodes[j].id.length) == worker.wid) {
            return true;
        }
    }
    return false;
 }



 function contains(array, id, type) {;
    for (var i = array.length - 1; i >= 0; i--) {
      if(type == "W") {
          if(array[i].wid == id) {
            return true;
        }
      } else if(type == "O") {
          if(array[i].oid == id) {
            return true;
          }
      }
    };
    return false;
 }





  function updateResultsText (operators, tid) {

      console.log("UPDATED = "+updated);
      if(!updated) {
        updated = true;
       $("#left").html("");
       $("#title_top").html("<div id='header'><div id='title'><h2>Operators</h2></div><div id='add_operator'>"+
                              "<a href='#' onclick='showOperatorForm()'  id='add_operator_bt' class='button tiny 3'>Add operator</a>"+
                            "</div></div>");

       for (var i = 0; i < operators.length; i++) {
           console.log("adding DIV");
          var name = "O"+operators[i].oid;
          var operatorDiv = "";
          if(operators[i].remote) {
                 operatorDiv = $("<div class='operator' id='operator"+operators[i].oid+"'>"+
                                  "<h5>O"+operators[i].oid+"</b></h5>"+
                                    "<div class='operator_line'><span class='name'>id</span>: "+operators[i].oid+"</div>"+
                                    "<div class='operator_line'><span class='name'>script</span>: "+operators[i].script+"</div>"+
                                    "<div class='operator_line'><span class='name'>remote</span>: "+operators[i].remote+"</div>"+
                               "</div>");
          } else {
               operatorDiv = $("<div class='operator' id='operator_"+operators[i].oid+"'>"+
                                  "<h5><b>O"+operators[i].oid+"</b></h5>"+
                                    "<div class='operator_line'><span class='name'>id</span>: "+operators[i].oid+"</div>"+
                                    "<div class='operator_line'><span class='name'>peer</span>: "+operators[i].peer+"</div>"+
                                    "<div class='operator_line'><span class='name'>script</span>: "+operators[i].script+"</div>"+
                                    "<div class='operator_line'><span class='name'>remote</span>: "+operators[i].remote+"</div>"+
                               "</div>");
          }



          if(operators[i].workers.length > 0) {

            var workerDiv = "<div class='workers_list'><span class='name'>workers</span>: "+operators[i].workers.length+" [";
            for (var w = 0; w < operators[i].workers.length; w++) {
              if(w < operators[i].workers.length - 1) {
                workerDiv += "<b>W"+operators[i].workers[w].wid+"</b>, ";
              } else {
                workerDiv += "<b>W"+operators[i].workers[w].wid+"</b>]";
              }
            }
            workerDiv += "</div>";

            if(!operators[i].remote) {
                workerDiv += "<div class='worker_button' >"+
                    "<a id='add_worker_operator_"+operators[i].oid+"' onclick='addWorker("+operators[i].oid+", \""+operators[i].script+"\")' class='button tiny 3'>Add worker</a>"+
                    "<a id='delete_operator_"+operators[i].oid+"' onclick='deleteOperator("+operators[i].oid+")' class='delete_operator button tiny 3'>Delete operator</a>"+
                    "</div>";
            } else {
                workerDiv += "<div class='worker_button' >"+
                    "<a id='add_worker_operator_"+operators[i].oid+"' onclick='addRemoteWorker("+operators[i].oid+", \""+operators[i].script+"\")' class='button tiny 3'>Add worker</a>"+
//                    "<a id='delete_operator_"+operators[i].oid+"' onclick='deleteOperator("+operators[i].oid+")' class='delete_operator button tiny 3'>Delete operator</a>"+
                    "</div>";
            }

            operatorDiv.append(workerDiv);
          } else {
            var workerDiv = "<div><span class='name'>No workers</span><a id='delete_operator_"+operators[i].oid+"' onclick='deleteOperator("+operators[i].oid+")' class='delete_operator button tiny 3'>Delete operator</a>"+
                            "</div>";
            operatorDiv.append(workerDiv);
          }

           console.log("APPENDING DIV");
           $("#left").append(operatorDiv);
        }


        };

  }


var containsWorker = function(operators, wid) {

    for (var i = 0; i < operators.length ; i++) {
      var workers = operators[i].workers;
      for (var j = 0; j < workers.length; j++) {
        if(workers[j].wid == wid) {
            return true;
        }
      };
    };

    return false;

}



var removeOldNodes = function(operators) {
  var nodes = graph.getNodes();
  for (var i = nodes.length - 1; i >= 0; i--) {
      var curNode = nodes[i];
      if(curNode.id[0] == "O") {
          //check whether to remove operator
          if(!contains(operators, curNode.id.substring(1,curNode.id.length) , "O")) {
              console.log("CONTAINS NODE - "+"O"+curNode.id.substring(1,curNode.id.length));
              graph.removeNode("O"+curNode.id.substring(1,curNode.id.length));
              //remove all workers: TODO
          }
      }
  };


  for (var i = nodes.length - 1; i >= 0; i--) {
      var curNode = nodes[i];
      if(curNode.id[0] == "W") {
          //check whether to remove worker
          if(!containsWorker(operators, curNode.id.substring(1,curNode.id.length), "W")) {
              graph.removeNode("W"+curNode.id.substring(1,curNode.id.length));
          }
      }
  }
}

var getWorkerId = function() {

    var max = -1;
    var nodes = graph.getNodes();
    for (var i = nodes.length - 1; i >= 0; i--) {
      if(nodes[i].id[0] == 'W') {
          if(max < nodes[i].id.substring(1, nodes[i].id.length)) {
              max = parseInt(nodes[i].id.substring(1, nodes[i].id.length));
          }
      }
    };
    return max+1;
}


var getOperatorId = function() {

    var oid = 0;
    var nodes = graph.getNodes();
    for (var i = nodes.length - 1; i >= 0; i--) {
      if(nodes[i].id[0] == 'O') {
        oid++;
      }
    };
    return oid;
}



var addWorker = function (oid, script) {

    var wid = getWorkerId();
    var workerData = '{"worker": {"wid": '+wid+', "script": "'+script+'" }}';
    $.ajax({
        type: "POST",
        url: host+"/topologies/1/operators/"+oid+"/workers",
        dataType: "text",
        contentType: "text/plain",
        data: workerData,
        success: function(data) {
            var json_data = JSON.parse(data);
            // var operators = json_data.topologies[0].operators;
            // var bindings = json_data.topologies[0].bindings;

            var operator = filter(graph.getNodes(), function(element) {
                return element.id == "O"+oid;
            });

            graph.addNode("W"+wid, operator.peer, operator.remote, "", "", "", "")
            graph.addLink("O"+oid, "W"+wid);
            // updateWorkers(operators);
            // updateResultsText(operators, json_data.topologies[0].tid);

        }
    });
}

var addRemoteWorker = function (oid, script) {

    var wid = getWorkerId();
    console.log("ADD REMOTE WORKER woth id "+wid);

    var workerData = '{"worker": {"wid": '+wid+'}}';
    $.ajax({
        type: "POST",
        url: host+"/topologies/1/operators/"+oid+"/browsers",
        dataType: "text",
        contentType: "text/plain",
        data: workerData,
        success: function(data) {
            var json_data = JSON.parse(data);
            // var operators = json_data.topologies[0].operators;
            // var bindings = json_data.topologies[0].bindings;

            var operator = filter(graph.getNodes(), function(element) {
                return element.id == "O"+oid;
            });

            graph.addNode("W"+wid, operator.peer, operator.remote, "", "", "", "")
            graph.addLink("O"+oid, "W"+wid);
            // updateWorkers(operators);
            $('#operator_'+oid).find(".workers_list").append("<b>W"+wid+"</b>");
        }
    });
}

function filter(collection, predicate)
{
    var result;
    var length = collection.length;

    for(var j = 0; j < length; j++)
    {
        if(predicate(collection[j]))
        {
             result = collection[j];
        }
    }
    return result;
}


  function updateWorkers(operators) {
     for (var i = 0; i < operators.length; i++) {
          var workers = operators[i].workers;

          // if(!operators[i].remote) {
                for (var k = 0; k < workers.length; k++) {
                    if(!existWorker(workers[k])) {
                        var name = "W"+workers[k].wid;
                        graph.addNode(name, operators[i].peer, operators[i].remote, "", workers[k].cpu_usage, workers[k].messages, workers[k].uptime);
                        graph.addLink("O"+operators[i].oid, "W"+workers[k].wid);
                    }
                }
          // }
      }

  }

  function updateBindings(bindings) {
     for(var i = 0; i < bindings.length; i++) {
           console.log("checking link "+"O"+bindings[i].from+" -> "+"O"+bindings[i].to);
           if(!existLink("O"+bindings[i].from, "O"+bindings[i].to)) {
              graph.addLink("O"+bindings[i].from, "O"+bindings[i].to);
           }
      }
  }


  function updateOperators(operators) {

      console.log("UPDATE OPERATORS");
      console.log(operators);
     for (var i = 0; i < operators.length; i++) {
          var name = "O"+operators[i].oid;
          if(!existOperator(operators[i])) {
              console.log("ADDING NODE = "+name);
              graph.addNode(name, operators[i].peer, operators[i].remote, operators[i].script, "", "", "");
          }
      };
  }

not_created = false;

function TodoCtrl($scope, $http) {

  angular.module('myApp', ['ngPrettyJson', 'nouislider']);

  $scope.url = host;
  $scope.methodType = "GET";
  $scope.workers = "1";

  //INITIALIZE BY GETTING FIRST TOPOLOGY







  setInterval(function() {


      $http({method: "GET", url: host+"/peers"}).

      success(function(data, status, headers, config) {

              var peers = data.peers;
              console.log("PEERS");
              console.log(peers);
              for (var i =  0; i < peers.length; i++) {
                    if(!peers[i].remote) {
                        getPeerOperators(peers[i].host, peers[i].port-5);
                    }
              }
      });
  }, 10000);



  function getPeerOperators(host, port) {

  $http({method: "GET", url: "http://"+host+":"+port+"/topologies"}).
    success(function(data, status, headers, config) {

        var operators = data.topologies[0].operators;
        var bindings = data.topologies[0].bindings;


        var peers = {};
        for (var i = 0; i < operators.length; i++) {
          var curOperator = operators[i];
          if(!peers.hasOwnProperty(operators[i].peer)) {
            peers[operators[i].peer] = {};
            peers[operators[i].peer].operators = [];
          }
          peers[operators[i].peer].operators.push(curOperator);
          peers[operators[i].peer].nodes = 1+(curOperator.workers.length);
        };

        updateTopology(operators, bindings);
        updateResultsText(operators, data.topologies[0].tid);
        // updateBarCharts(peers, data.topologies[0]);

    }).
    error(function(data, status, headers, config) {
        $scope.results = data;
    });
 }



function existNode(id, peer) {

  var nodes = graph.getNodes();
  for (var i = 0; i < nodes.length; i++) {
    if(nodes[i].id == id && nodes[i].peer == peer) {
      return true;
    }
  };

  return false;
}



  $scope.todos = [
    {text:'learn angular', done:true},
    {text:'build an angular app', done:false}
  ];




  function updateBarCharts(peers, topology) {
    // $("#bar_charts").html("");

    for(var key in peers) {
      var curOperators = peers[key].operators;
      var data = [];
      for (var i = 0; i < curOperators.length; i++) {
        console.log("USAGE = "+curOperators[i].cpu_usage);
        data.push({"operator": "O"+curOperators[i].oid, "cpu_usage": curOperators[i].cpu_usage, "workers": curOperators[i].workers.length });
      };

      if(!bar_charts.hasOwnProperty(key)) {
         console.log("create BAR CHART");

         createBarCharts(key, data, curOperators);
      } else {
         console.log("UPDATE BAR CHART");
         updateBarChartData(key, data);
      }

    }
  }



  function updateMessagesCharts(peers, topology) {

    for(var key in peers) {
      var curOperators = peers[key].operators;
      var data = [];

      if(!line_charts.hasOwnProperty(key)) {
         createLineCharts(key, data, curOperators);
      }

    }
  }



  function updateBarChartData(peer, data) {

        var svg = bar_charts[peer].svg;
        var x = bar_charts[peer].x;
        var y = bar_charts[peer].y;
        svg.call(tip);

        var width = 300;
        var height = 300;

        x.domain(data.map(function(d) { return d.operator; }));
        y.domain([0, 100]);


        svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.operator); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.cpu_usage); })
          .attr("height", function(d) { return (height-80) - y(d.cpu_usage); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
    }







  function drawBarChart(peer, data) {

      var width = 300;
      var height = 300;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width/2], .1);

      var y = d3.scale.linear()
        .range([height-80, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "##.#%");

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<div><span style='color:white'>CPU usage:</span> <span style='color:red'>" + d.cpu_usage + "%</span></div>"+
                 "<div><span style='color:white'>Processes:</span> <span style='color:red'> 3 </span></div>";
        })


      var svg = d3.select("#"+peer.split(".")[0]).append("svg")
        .attr("width", width)
        .attr("height", height-20)
        .append("g")
        .attr("transform", "translate(" + 60 + "," + 30 + ")");

      bar_charts[peer] = {
        svg: svg,
        x: x,
        y: y
      };




      svg.call(tip);

      x.domain(data.map(function(d) { return d.operator; }));
      y.domain([0, 100]);


      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height-80) + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          // .attr("y", function(d) { return y(d.cpu_usage); })
          .attr("dy", ".91em")
          .style("text-anchor", "end")
          .text("CPU usage %");

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.operator); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.cpu_usage); })
          .attr("height", function(d) { return (height-80) - y(d.cpu_usage); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
  }



  function drawRealTimeChart(peer, data, operators) {

      console.log("DRAW REAL TIME CHART = "+peer);
      console.log(operators);


      var context = cubism.context()
        .step(2000)
        .size(300);

      var chart_svg = d3.select("#"+peer+"axis").call(function(div) {

          div
          .selectAll(".axis-real")
          .data(["top", "bottom"])
          .enter().append("div")
            .attr("class", function(d) { return d + " axis-real"; })
            .each(
              function(d) {
                console.log("ADD CHART");
                d3.select(this).call(context.axis().ticks(2).orient(d));
              }
          );

         div.append("div")
          .attr("class", "rule")
          .call(context.rule());



          var index = 0;

          // div.append("div")
          // .attr("class", "axis")
          // .call(context.axis().ticks(2).orient(d));

           div.selectAll(".horizon")
            .data(d3.range(0, operators.length).map(random))
            .enter().insert("div", ".bottom")
            .attr("class", "horizon")
            .call(context.horizon()
            .format(d3.format("##.#%"))
            .height(70)
            .mode("mirror")
            .colors(["#bdd7e7","#bae4b3"])
            .title(function(d) {
              var title = "W"+operators[index].oid+"     " ;
              index++;
              return title;
            })
            .extent([0, 10]));



     });


    // On mousemove, reposition the chart values to match the rule.
    context.on("focus", function(i) {
      d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
    });

    // Replace this widt context.graphite and graphite.metric!
    function random(x) {

      var value = 0,
          values = [],
          i = 0,
          last;
      return context.metric(function(start, stop, step, callback) {
        start = +start, stop = +stop;
        if (isNaN(last)) last = start;
        var over = false;
        while (last < stop && !over) {
          if(last < stop) {
            last += step;
          }

          $http({method: "GET", url: host+"/topologies/1/operators/"+operators[x].oid})
            .success(function(data, status, headers, config) {
                values.push(data.operator.cpu_usage/10*Math.cos(i += x * .05));
                // console.log(operators[x].oid+" : "+data.operator.cpu_usage/10+" %")
                if(last >= stop) {
                  over = true;
                }
            }
          );
          // value = Math.max(-10, Math.min(10, value + .8 * Math.random() - .4 + .2 * Math.cos(i += x * .02)));
          // values.push(value);
        }
        callback(null, values = values.slice((start - stop) / step));


      }, x);
    }
  }




  function drawRealTimeLineChart(peer, data, workers, oid) {



      var context = cubism.context()
        .step(1000)
        .size(400);

      var chart_svg = d3.select("#"+peer+"axis_line").call(function(div) {

          div
          .selectAll(".axis-real")
          .data(["top", "bottom"])
          .enter().append("div")
            .attr("class", function(d) { return d + " axis-real"; })
            .each(
              function(d) {
                console.log("ADD CHART");
                d3.select(this).call(context.axis().ticks(2).orient(d));
              }
          );

         div.append("div")
          .attr("class", "rule")
          .call(context.rule());



          var index = 0;

          // div.append("div")
          // .attr("class", "axis")
          // .call(context.axis().ticks(2).orient(d));

           div.selectAll(".horizon")
            .data(d3.range(0, workers.length).map(random))
            .enter().insert("div", ".bottom")
            .attr("class", "horizon")
            .call(context.horizon()
            .format(d3.format("##.#%"))
            .height(70)
            .mode("mirror")
            .colors(["#bdd7e7","#bae4b3"])
            .title(function(d) {
              var title = "W"+workers[index].wid+"     " ;
              index++;
              return title;
            })
            .extent([0, 10]));



     });


    // On mousemove, reposition the chart values to match the rule.
    context.on("focus", function(i) {
      d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
    });

    // Replace this widt context.graphite and graphite.metric!
    function random(x) {

      var value = 0,
          values = [],
          i = 0,
          last;
      return context.metric(function(start, stop, step, callback) {
        start = +start, stop = +stop;
        if (isNaN(last)) last = start;
        var over = false;
        while (last < stop && !over) {
          if(last < stop) {
            last += step;
          }

          $http({method: "GET", url: host+"/topologies/1/operators/"+oid+"/workers/"+workers[x].wid})
            .success(function(data, status, headers, config) {
                values.push(data.worker.messages.outgoing/10);
                // console.log(operators[x].oid+" : "+data.operator.cpu_usage/10+" %")
                if(last >= stop) {
                  over = true;
                }
            }
          );
          // value = Math.max(-10, Math.min(10, value + .8 * Math.random() - .4 + .2 * Math.cos(i += x * .02)));
          // values.push(value);
        }
        callback(null, values = values.slice((start - stop) / step));


      }, x);
    }
  }







  function createLineCharts(peer, data, operators) {

    for(var j = 0; j < operators.length; j++) {

        if(j == 2) {
          $("#messages").append("<div style='width:700px;height:350px;'>"+
                                    "<div id='"+peer.split(".")[0]+"axis_line' class='axis' style='float:left;width:400px;height:300px;'>"+
                                    "</div>"+
                                  "</div>");
          line_charts[peer] = {
              "ciao": "ciao"
          };

        console.log("DRAWING LINE REAL FOR OPERATOR = "+operators[j].oid)
        drawRealTimeLineChart(peer.split(".")[0], data, operators[j].workers, operators[j].oid);
       }
     }
  }

  function createBarCharts(peer, data, operators) {

      $("#bar_charts").append("<div style='width:700px;height:350px;'>"+
                                "<div id='"+peer.split(".")[0]+"' style='float:left;margin-top:20px;width:300px;height:300px;'>"+
                                    "<span style='color:#666;padding-left: 45px;padding-bottom:10px;font-size:16px;'>"+peer+"</span>"+
                                "</div>"+
                                "<div id='"+peer.split(".")[0]+"axis' class='axis' style='float:left;width:400px;height:300px;'>"+
                                "</div>"+
                              "</div>");


      drawBarChart(peer, data);
      drawRealTimeChart(peer.split(".")[0], data, operators);
  }

  function getResource(url) {
      return url.split("/")[url.split("/").length-1];
  }


  $scope.addOperator = function() {
      console.log("ADDING OPERATOR");
      var oid = 0;
      var nodes = graph.getNodes();
      for (var i = nodes.length - 1; i >= 0; i--) {
        if(nodes[i].id[0] == 'O') {
          oid++;
        }
      };

      var wid = 0;
      var nodes = graph.getNodes();
      for (var i = nodes.length - 1; i >= 0; i--) {
        if(nodes[i].id[0] == 'W') {
          wid++;
        }
      };

      var workers = $("#value-hidden").val();
      var data = '{"operator": {"oid": '+oid+', "script": "'+$scope.script+'", "peer": "'+$scope.peer+'", "browser": false, ';
      data += '"workers": [';
      for(var i = 0; i < workers; i++) {
        if(i == workers - 1) {
            data += '{"wid": '+wid+', "href": "/topologies/1/operators/'+oid+'/workers", "operator": "/topologies/1/operators/'+oid+'"}';
        } else {
            data += '{"wid": '+wid+', "href": "/topologies/1/operators/'+oid+'/workers", "operator": "/topologies/1/operators/'+oid+'"}, ';
        }
        wid++;
      }
      data += ']}}';

      console.log("peer = "+$scope.peer);

      $.ajax({
        type: "POST",
        url: host+"/topologies/1/operators",
        dataType: "text",
        contentType: "text/plain",
        data: data,
        success: function(data) {
          var json_data = JSON.parse(data);
          var operators = json_data.operators;
          var bindings = json_data.bindings;

          // updateTopology(operators, bindings);
          // updateResultsText(operators, 1);
          console.log(json_data);
          updateOperators(operators);
          updateWorkers(operators);

          $("#operator_form").hide();
          $("#left").show();
        }
      });

  }


  $scope.addTodo = function() {


      $.ajax({
        type: $scope.methodType,
        url: $scope.url,
        dataType: "text",
        contentType: "text/plain",
        data: $scope.data,
        success: function(data) {
           var json_data = JSON.parse(data);
            wid = 0;
            var operators = json_data.topologies[0].operators;
            var bindings = json_data.topologies[0].bindings;

            for (var i = 0; i < operators.length; i++) {
              var name = "O"+operators[i].oid;
              if(!operators[i].remote) {
                 graph.addNode(name, operators[i].peer, operators[i].remote, operators[i].script, "", "", "");
                 var workers = operators[i].workers;
                 for (var k = 0; k < workers.length; k++) {
                    wid++;
                    var name = "W"+workers[k].wid;
                    graph.addNode(name, operators[i].peer, operators[i].remote, "", workers[k].cpu_usage, workers[k].messages, workers[k].uptime);
                    graph.addLink("O"+operators[i].oid, "W"+workers[k].wid);
                 }
               } else {
                  graph.addNode(name, "browser", operators[i].remote, operators[i].script, "", "", "");
               }

            };

            if(bindings) {
              for(var i = 0; i < bindings.length; i++) {
                  graph.addLink("O"+bindings[i].from, "O"+bindings[i].to);
              }
            }

            updateResultsText(operators, json_data.topologies[0].tid);

      },error: function(data) {

          console.log(data);
      }
    });

    $scope.todoText = '';
  };










  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };

  $scope.archive = function() {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });
  };
}
