

var aspect = width / height,
    chart = d3.select('#chart'); // chart is svg element


d3.select(window)
  .on("resize", function() {
    var targetWidth = chart.node().getBoundingClientRect().width;
    chart.attr("width", targetWidth);
    chart.attr("height", targetWidth / aspect);
  });