$(function() {
  $('form').submit(function(e) {
    e.preventDefault();
    $('svg').remove();

    $.post('/data.json', {url: $('input').val()}, function(json) {
      var grapher = new Grapher;
      grapher.graph("#graph", $(window).height(), $(window).height(), json);
    });
  });
});
