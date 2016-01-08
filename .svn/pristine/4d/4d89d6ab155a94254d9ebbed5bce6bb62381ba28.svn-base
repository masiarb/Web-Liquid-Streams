var hosts = [];
  hosts["agora.mobile.usilu.net"] = "blue";
  hosts["neha.inf.unisi.ch"] = "red";


console.log("INIT HERE");

var width  = 800,
    height = 558,
    colors = d3.scale.category20(),
    fill = d3.scale.category10();
/* Initialize tooltip */
console.log("INIT TIPPP");
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) { 

              if(d.id[0] == "W") {
                 return '<div style="height:70px;">'+
                          '<div style="font-size:11pt;height:20px">Worker '+d.id+'</div>'+
                          '<div style="margin-top:5px;font-size:9pt;height:15px;">CPU usage: '+d.usage+'%</div>'+
                          '<div style="font-size:9pt;height:15px;">uptime: '+d.uptime+'</div>'+
                          '<div style="font-size:9pt;height:15px;">messages: '+d.messages+'</div>'+
                        '</div>';
              } else {

                 if(d.peer == "browser") {
                      return '<div style="height:40px;>'+
                          '<div style="font-size:11pt;height:20px;">Browser '+d.id+'</div>'+
                          '<div style="font-size:9pt;height:15px;">script: '+d.script+'</div>'+
                        '</div>';

                 } else {
                      return '<div style="height:40px;>'+
                          '<div style="font-size:11pt;height:20px;">Operator '+d.id+'</div>'+
                          '<div style="font-size:9pt;height:15px;">script: '+d.script+'</div>'+
                        '</div>';
                 }
               
              }
             
              })
            .offset([-12, 0])



// init svg
var outer = d3.select("#topology")
.append("svg:svg")
 .attr("viewBox", "0 0 " + width + " " + height )
    .attr("preserveAspectRatio", "xMinYMin")
  .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    // .attr("pointer-events", "all");

var vis = outer
  // .append('svg:g')
  //   .call(d3.behavior.zoom().on("zoom", rescale))
  //   .on("dblclick.zoom", null)
  .call(tip)

vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

 // var svg = d3.select("#topology").append("svg:svg")
 //            .attr("width", width)
 //            .attr("height", height)
 //             .attr("pointer-events", "all")
 //             .append('svg:g')
 //          .call(d3.behavior.zoom().on("zoom", rescale))
 //          .on("dblclick.zoom", null)
 //          .call(tip)
          
function rescale() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

 // set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
var nodes = [],
  lastNodeId = -1,
  links = [];

var foci = [{x: 100, y: 200}, {x: 420, y: 200}, {x:150, y:460}];




// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(function(d) { 
        
        if(d.source.peer != d.target.peer) {
          //link between peers
          return 250;
        } else {
            return (d.target.id[0] == "W") ? 5 : 200
            return (d.target.id[0] == "W") ? 5 : 200
        }
    })
    .charge(-500)
    .on('tick', tick)
    .friction(0.5);



var groupPath = function(d) {

  
    if(d.key != "browser") {
         return "M" + 
      d3.geom.hull(d.values.map(function(i) {  return [i.x, i.y]; }))
        .join("L")
    + "Z";
    }
   
};

var groupFill = function(d, i) {  return fill(i & 3); };

// define arrow markers for graph links
vis.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');




// vis.append("rect")      // text label for the x axis
//         .attr("x", 150)
//         .attr("y",  75 )
//         .attr("width", 130)
//         .attr("height", 160)
//         .attr("fill", "red")
//         .attr("id", "rectLabel");    



vis.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = vis.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

var drag = force.drag()
    .on("dragstart", dragstart);

// handles to link and node element groups
var path = vis.append('svg:g').selectAll('path'),
    circle = vis.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}


vis.style("opacity", 1e-6)
  .transition()
    .duration(1000)
    .style("opacity", 1);
// update force layout (called automatically each iteration)

var groups = d3.nest().key(function(d) { return d.peer; }).entries(nodes);


function tick(e) {

     


  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 26 : 22,
        targetPadding = d.right ? 26 : 22,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  // Push different nodes in different directions for clustering.
  var k = .3 * e.alpha;
  nodes.forEach(function(o, i) {
   
    if(o.peer == "agora.mobile.usilu.net") {
       o.y += (foci[0].y - o.y) * k;
       o.x += (foci[0].x - o.x) * k;
    } else if(o.peer == "neha.inf.unisi.ch"){
        o.y += (foci[1].y - o.y) * k;
        o.x += (foci[1].x - o.x) * k;
    } else if(o.peer == "browser"){
        o.y += (foci[2].y - o.y) * k;
        o.x += (foci[2].x - o.x) * k;
    }
   
  });



  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  })
   .attr("cx", function(d) {
            return d.x;
        }).attr("cy", function(d) {
            return d.y;
        });


  if(mousedown_node == null) {
     
      vis.selectAll("path.merda")
          .data(groups)
          .attr("d", groupPath)
          .enter().insert("path", "g")
          .attr("class", "merda")
          .style("fill", groupFill)
          .style("stroke", groupFill)
          .style("stroke-width", 160)
          .style("stroke-linejoin", "round")
          .style("opacity", .2)
          .attr("d", groupPath);
  }
}

function hasKey(groups, key) {
  for(var i = 0; i < groups.length; i++) {
    if(groups[i]["key"] == key) {
      return true;
    }
  }
  return false;
}


// update graph (called when needed)
function restart() {

   groups = d3.nest().key(function(d) { return d.peer; }).entries(nodes);
   console.log("GROUPS");
   console.log(vis.select("#text-agora")[0]);
  if(hasKey(groups, "agora.mobile.usilu.net") && vis.select("#text-agora")[0][0] == null) {
       vis.append("text") 
        .attr("id", "text-agora")
        .attr("x", 100)
        .attr("y",  120 )
        .style("font-size", "16")
        .style("stroke", "#666")
        .style("fill", "#666")
        .text("agora.mobile.usilu.net");
  }
  
  
   if(hasKey(groups, "neha.inf.unisi.ch") && vis.select("#text-neha")[0][0] == null)  {

      vis.append("text") 
        .attr("id", "text-neha")
        .attr("x", 370)
        .attr("y",  120 )
        .style("font-size", "16")
        .style("stroke", "#666")
        .style("fill", "#666")
        .text("neha.inf.unisi.ch");
   }  

   
  


  // path (link) group
 
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new li`nks
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
    });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });
  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');

   g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', function(d) { return (d.id[0] == "W") ? 12 : 35})
    .style('fill', function(d) { 
      if(d.id == "ghost") {
            console.log("COLOR GHOST");
            return d3.rgb(31, 118, 190).brighter();
      } else {
            return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
      }
    })
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      tip.show(d);
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
  
    })
    .on('mouseout', function(d) {
      tip.hide(d);
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
      
    })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      if (d3.event.shiftKey) {
      
        // reposition drag line
        drag_line
          .style('marker-end', 'url(#end-arrow)')
          .classed('hidden', false)
          .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
      }
      restart();
    })
    .on('mouseup', function(d) {
      if(!mousedown_node) return;

      // needed by FF
      if (d3.event.shiftKey) {
        drag_line
        .classed('hidden', true)
        .style('marker-end', '');
      
        // drag_line
       

        // check for drag-to-self
        mouseup_node = d;
        if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

        // unenlarge target node
        d3.select(this).attr('transform', '');

        // add link to graph (update if exists)
        // NB: links are strictly source < target; arrows separately specified by booleans
        var source, target, direction;
           source = mousedown_node;
           target = mouseup_node;
        if(mousedown_node.id < mouseup_node.id) {

          direction = 'right';
        } else {

          direction = 'left';
        }

        var link;
        link = links.filter(function(l) {
          return (l.source === source && l.target === target);
        })[0];

        if(link) {
          link[direction] = true;
        } else {
          link = {source: source, target: target, left: false, right: false};
          link[direction] = true;
          links.push(link);
            console.log("SOURCE");
            console.log(source);
          patchBindings(source.id.substring(1, source.id.length));
        }

        // select new link
        selected_link = link;
        selected_node = null;
      }
      restart();
    })
    .call(drag);

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .style('font-size', function(d) { return (d.id[0] == "W") ? "10px" : "14px" })
      .text(function(d) { return d.id; });

  // remove old nodes
  circle.exit().remove();



  // set the graph in motion
  force.start();
}


var deleteWorker = function(wid, oid) {


     $.ajax({
          type: "DELETE", 
          dataType: "text",
          url: host+"/topologies/1/operators/"+oid+"/workers/"+wid,
          success: function (data) {
              console.log(data);
          }
      });

}

var deleteOperator = function(oid) {

       $.ajax({
          type: "DELETE", 
          url: host+"/topologies/1/operators/"+oid,
          success: function (data) {
              console.log(data);
              // graph.removeNode("O"+oid);
          }
      });
}

 var patchBindings = function(from) {

    console.log("FROM -> "+from);
    var links = graph.getLinks();
    var to_bind = 0;
    for (var i = 0; i < links.length; i++) {
        if(links[i].source.id[0] == "O" && links[i].target.id[0] == "O" && (links[i].source.id[1] == from || links[i].target.id[1] == from)) {
            to_bind++;
        }
    }

   
    var bindingsData = '{ "bindings": [';
    var tb = 0;
    for (var i = 0; i < links.length; i++) {
      console.log(links[i].source.id + " => " + links[i].target.id);
      if(links[i].source.id[0] == "O" && links[i].target.id[0] == "O" && (links[i].source.id[1] == from || links[i].target.id[1] == from)) {
          tb++;
          if(tb == to_bind) {
            bindingsData += '{"from": '+links[i].source.id[1]+', "to": '+links[i].target.id[1]+'}';
          } else {
            bindingsData += '{"from": '+links[i].source.id[1]+', "to": '+links[i].target.id[1]+'}, ';
          }
      }
    };
    bindingsData += ']}';




      $.ajax({
          type: "PATCH", 
          dataType: "text",
          contentType: "text/plain",
          data: bindingsData,
          url: host+"/topologies/1/operators/"+from+"/bindings",
          success: function (data) {
            console.log(data);
          }   
      });
 }

function mousedown() {
  // prevent I-bar on drag
  //d3.event.preventDefault();
  // if (!mousedown_node && !mousedown_link) {
  //   // allow panning if nothing is selected
  //   vis.call(d3.behavior.zoom().on("zoom"), rescale);
  //   return;
  // }

  console.log("MOUSE DOWN");
  // because :active only works in WebKit?
  vis.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

  // insert new node at point
  // var point = d3.mouse(this),
  //     node = {id: ++lastNodeId, reflexive: false};
  // node.x = point[0];
  // node.y = point[1];
  // nodes.push(node);

  restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  if(d3.event.shiftKey) {
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
  }
  restart();
}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  vis.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}


function getOperatorOf(wid) {
    var oid = 0;
    var links = graph.getLinks();
    for (var i = 0; i < links.length; i++) {
      console.log("checking "+links[i].source.id+" -> "+links[i].target.id);
      if(links[i].source.id == wid) {
          oid = links[i].target.id;
      } else if(links[i].target.id == wid) {
          oid = links[i].source.id;
      }
    };

    return oid.substring(1, oid.length);
}



function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    vis.classed('ctrl', true);
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_node) {
        //TODO: DELETE OPERATOR
       


        if(selected_node.id[0] == "W") {
            console.log("DELETE WORKER = "+selected_node.id);
            var oid = getOperatorOf(selected_node.id);
            console.log("OPERATOR  = "+oid);
            deleteWorker(selected_node.id.substring(1, selected_node.id.length), oid);
        } else if(selected_node.id[0] == "O") {
            console.log("DELETE operator = "+selected_node.id.substring(1, selected_node.id.length));
            deleteOperator(selected_node.id.substring(1, selected_node.id.length));
        }

        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      } else if(selected_link) {
        //TODO: DELETE BINDING

        links.splice(links.indexOf(selected_link), 1);
        console.log("DELETE BINDING "+selected_link.source.id +" -> "+selected_link.target.id);
        patchBindings(selected_link.source.id.substring(1, selected_link.source.id.length));
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
    case 66: //B
      if(selected_link) {
        // set link direction to both left and right
        selected_link.left = true;
        selected_link.right = true;
      }
      restart();
      break;
    case 76: //L
      if(selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 82: //R
      if(selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if(selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
      break;
  }
}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    vis.classed('ctrl', false);
  }
}

// app starts here
vis.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();

function dragstart(d) {
    console.log("drag start");
    if(!d3.event.shiftKey) {
      d3.select(this).classed("fixed", d.fixed = true);
    }
}

var Topology = function() {

        var nodes = force.nodes(),
            links = force.links();



        this.getNodes = function() {

            return nodes;
        }

        this.getLinks = function() {

            return links;
        }


        this.addNode = function (id, peer, remote, script, usage, messages, uptime) {
            if(peer == undefined) {
              peer = "browser";
              console.log("ADDING NODE PEER = "+peer);
            }
            nodes.push({ "id": id, "peer": peer, "remote": remote, script: script, usage: usage, messages: messages, uptime: uptime });
            restart();
        }

        this.removeNode = function (id) {
            var i = 0;
            var n = findNode(id);
            while (i < links.length) {
                if ((links[i]['source'] == n) || (links[i]['target'] == n)) links.splice(i, 1);
                else i++;
            }
            nodes.splice(findNodeIndex(id), 1);
            restart();
        }

        this.addLink = function (source, target) {
            console.log("ADD LINK => "+source+" -> "+target);
            link = {source: findNode(source), target: findNode(target), left: false, right: true};
            links.push(link);           
            restart();
        }

        var findNode = function (id) {
            for (var i in nodes) {    
              if (nodes[i]["id"] === id) { return nodes[i]; }};
        }

        var findNodeIndex = function (id) {
            for (var i in nodes) { if (nodes[i]["id"] === id) return i };
        }


}

var graph = new Topology();



