var Grapher = function() {}

Grapher.prototype.graph = function(selector, w, h, data) {
  var svg = d3.select(selector).append("svg")
    .attr("width", w)
    .attr("height", h);

  var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([w, h]);

  var color = function(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }

  var links = [];
  var nodes = [];
  var validFields = ['scripts', 'styles', 'images'];

  $.each(data, function(parentIndex, parentNode) {
    if (parentNode.redirect) {
      nodes.push({path: parentNode.path, color: 'red', size: 5000});
      nodes.push({path: parentNode.redirect, color: 'yellow', size: 2000});
      links.push({source: nodes.length - 2, target: nodes.length - 1});
    } else {
      nodes.push({path: parentNode.path, size: 5000, color: 'green'});
      var sourceIndex = nodes.length - 1;
      $.each(parentNode.scripts, function(i, v) {
        nodes.push({path: v, size: 2000, color: 'blue'});
        links.push({source: sourceIndex, target: nodes.length - 1});
      });
      $.each(parentNode.styles, function(i, v) {
        nodes.push({path: v, size: 2000, color: 'orange'});
        links.push({source: sourceIndex, target: nodes.length - 1});
      });
      $.each(parentNode.images, function(i, v) {
        nodes.push({path: v, size: 2000, color: 'grey'});
        links.push({source: sourceIndex, target: nodes.length - 1});
      });
    }
  });

  force
    .nodes(nodes)
    .links(links)
    .start();

  var link = svg.selectAll(".link")
    .data(links)
  .enter().append("line")
    .attr("class", "link");

  var node = svg.selectAll(".node")
    .data(nodes)
  .enter().append("g")
    .attr("class", "node")
    .call(force.drag);


  node.append("svg:circle")
    .attr("class", "node")
    .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; })
    .style("fill", function(d) { return d.color; });

  node.append("svg:text")
    .attr("class", "nodetext")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.path });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}

