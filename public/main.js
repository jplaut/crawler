var Grapher = function() {}

Grapher.prototype.graph = function(selector, w, h, data) {
  var svg = d3.select(selector).append("svg")
    .attr("width", w)
    .attr("height", h);

  var force = d3.layout.force()
    .gravity(.05)
    .distance(200)
    .charge(-100)
    .size([w, h]);

  var links = [];
  var nodes = [];
  var parentNodes = {};
  var childNodeSize = 1000;
  var parentNodeSize = 20000;
  var childNodeStroke = 1;
  var parentNodeStroke = 3;
  var fields = ['scripts', 'styles', 'images'];

  $.each(data, function(parentIndex, parentNode) {
    var sourceIndex = nodes.length ? nodes.length : 0;
    parentNodes[parentNode.path] = sourceIndex;

    if (parentNode.redirect) {
      nodes.push({path: parentNode.path, color: 'red', size: parentNodeSize});
      nodes.push({path: parentNode.redirect, color: 'yellow', size: childNodeSize});
      links.push({source: sourceIndex, target: nodes.length - 1, stroke: childNodeStroke});
    } else {
      nodes.push({path: parentNode.path, size: parentNodeSize, color: 'green'});
      $.each(parentNode.scripts, function(i, v) {
        nodes.push({path: v, size: childNodeSize, color: 'blue'});
        links.push({source: sourceIndex, target: nodes.length - 1, stroke: childNodeStroke});
      });
      $.each(parentNode.styles, function(i, v) {
        nodes.push({path: v, size: childNodeSize, color: 'orange'});
        links.push({source: sourceIndex, target: nodes.length - 1, stroke: childNodeStroke});
      });
      $.each(parentNode.images, function(i, v) {
        nodes.push({path: v, size: childNodeSize, color: 'grey'});
        links.push({source: sourceIndex, target: nodes.length - 1, stroke: childNodeStroke});
      });
    }
  });

  $.each(data, function(i, parentNode) {
    var parentIndex = parentNodes[parentNode.path];

    if (!parentNode.links) return true;
    $.each(parentNode.links, function(linkIndex, link) {
      var childIndex = parentNodes[link];
      if (parentIndex == childIndex) return true;

      if (Object.keys(parentNodes).indexOf(link) != -1) {
        links.push({source: childIndex, target: parentIndex, stroke: parentNodeStroke});
      }
    });
  });

  force
    .nodes(nodes)
    .links(links)
    .start();

  var link = svg.selectAll(".link")
    .data(links)
  .enter().append("line")
    .attr("class", "link")
    .style('stroke-width', function(d) { return d.stroke; });

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

