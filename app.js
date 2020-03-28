//Width and height
var aspect = 1.5;
var width = $("#map").width();
var height = width/ aspect;

var margin = {
  top: 20,
  left: 35,
  bottom: 20,
  right: 50
}

//set up the color scale
var colors = ['rgb(213,62,79)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(255,255,191)','rgb(230,245,152)','rgb(171,221,164)','rgb(102,194,165)','rgb(50,136,189)']
var colLow = "#2892C7"
var colHigh = "#E81014"
var colorScale = d3.scale.quantize().domain([1800,2016]).range(colors)
//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//graph pane at bottom
var graphHeight = height*.10;
var graphWidth = width - margin.left - margin.right
var graph = d3.select('#graph').append('svg')
  .attr('width', width)
  .attr('height',graphHeight)

graph = graph.append('g')
  .attr('transform','translate('+margin.left+','+margin.top+')')
//mouseover booleans
var buildingMouseOver = true;
var barMouseOver = true;

//draw legened
//*************************
var legendTable = d3.select("#legend")

//generate legend svg
function drawLegend(table){
  d3.selectAll(".legend")
    .style('background-color', function(d){
      //grab the text
      text = d3.select(this).text()
      if (text == 'No Data'){
        color = 'rgb(224,224,224)'
      } else {
        color = colorScale(text)
      }
      return color
    })
    .style('opacity', 0.85)

};
//actually draw legend table
drawLegend(legendTable)


//add BaseMap
var map = L.map('map', {center: [41.651128, -96.653017],
  zoom: 12,
  reuseTiles: true})
  .addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));

//Attach empty SVG to the basemap
var svg = d3.select(map.getPanes().overlayPane).append("svg");

//hide phantom svg on zoom
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

function makeMap(){
  //group variable to zoom behavior works correctly
  d3.json('https://rshepard2.github.io/Lab9/data/LNK_BLD_YR_TOPOJSON.topojson', function(error, buildings){
  var collection = topojson.feature(buildings, buildings.objects.collection);
  var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)

  //get min and max build year for the structures
  var minYear = d3.min(collection.features,function(d){
      return d.properties.RESYRBLT
    })
  if (minYear < 1750) {
    minYear = 1800;
  }
  var maxYear = d3.max(collection.features,function(d){
      return d.properties.RESYRBLT
    })
  var buildCount = collection.features.length;

  //set up graph axes
  //*****************************************
  //setup x scale and  axis
  var xScale = d3.scale.linear()
    .domain([minYear,maxYear])
    .range([0,(graphWidth-margin.left-margin.right)])
    .nice()


  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickFormat(d3.format(""))

   //set up yAxis
   var maxBuildCount = d3.max(collection.features, function(d){
    return d.properties.COUNT_Year
   });
   var yearPos = 1500;

   var yScale = d3.scale.linear()
    //.domain([0,d3.max(collection.features, function(d){
    //  return d.properties.COUNT_Year
    //})])
    .domain([0,1500])
    .range([(graphHeight-margin.top-margin.bottom),0])
    //.nice()


    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(4)

    graph.append('g')
      .attr('class','axis')
      .attr('transform','translate('+ margin.left +',' + (graphHeight-(margin.bottom + margin.top)) +')')
      .call(xAxis)
        //.style('fill','white')
        //.style('stroke','white')

    graph.append('g')
      .attr('class','axis')
      .attr('transform','translate('+margin.left+',0)')
      .call(yAxis)

    //append y-axis text
    graph.append('text')
      //.attr('text-anchor','middle')
      .attr('transform','translate('+(-margin.left/2)+','+(graphHeight - margin.bottom-margin.top )+')rotate(-90)')
      .style('fill','white')
      .text('Building Count')

  //define bar data
  var barData = collection.features

  //create the bar chart
  //*****************************
  var bars = graph.selectAll('rect')
    .data(barData)
    .enter()
    .append('rect')
    .attr('id',function(d){
      return 'yr'+d.properties.RESYRBLT
    })
    .attr('fill',function(d){
      return colorScale(d.properties.RESYRBLT)
    })
    .attr('x',function(d){
      return xScale(d.properties.RESYRBLT) + margin.left
    })
    .attr('height',function(d){
      return graphHeight-margin.top-margin.bottom - yScale(d.properties.COUNT_Year)
    })
    .attr('width',5)
    .attr('y',function(d){
      return yScale(d.properties.COUNT_Year)
    })
    .style('opacity',0.75)

  //add a year progress bar to the graph that will showup on animation.
    graph.append('rect')
      .attr('x',xScale(1800))
      .attr('height',graphHeight-margin.top-margin.bottom - yScale(1500))
      .attr('width',(1.5))
      .attr('fill','white')
      .attr('id','yearLine')
      .style('opacity',0)

    graph.append('text')
      .attr('id','yearLineCount')
      .text('')
        .style('fill','white')
        .style('opacity',0)
    graph.append('text')
      .attr('id','yearLineYear')
      .attr('text-anchor','middle')
      .text('')
        .style('fill','white')
        .style('opacity',0)

    //bar chart interactivity
    //***************************
    bars.on('mouseover',function(d){
      if (barMouseOver == true){
        var yr = d.properties.RESYRBLT
        var buildCount = d.properties.COUNT_Year
        var buildID = '#RESYRBLT' + yr;

        d3.select(buildID).style('opacity',1)
        d3.select(this).style('opacity',1);
        d3.select('#buildyear').text('Year: '+ yr + ', Count: ' +d.properties.COUNT_Year)
        d3.select('#yearLineCount').style('opacity',1)
          .attr('x',xScale(yr) + margin.left+ 2.5)
          .attr('y',yScale(buildCount) + 5)
          .text(buildCount)

        d3.select('#yearLineYear').style('opacity',1)
          .attr('x',xScale(yr) + margin.left)
          .attr('y',yScale(yearPos))
          .text(yr)

        d3.select('#yearLine').style('opacity',0.50)
          .attr('x',xScale(yr)+margin.left + 2.5)
      };

    })
    bars.on('mouseout',function(d){
      if (barMouseOver == true){
        var yr = d.properties.RESYRBLT;
        var buildID = '#RESYRBLT' + yr;
        d3.select(buildID).style('opacity',0.60)
        d3.select(this).style('opacity',0.75);
        d3.select('#buildyear').text('Year: ')
        d3.select('#yearLineCount').transition().style('opacity',0)
        d3.select('#yearLineYear').transition().style('opacity',0)
        d3.select('#yearLine').transition().style('opacity',0)
    };
    })

  //Create a path for each map feature in the data
  var buildings = g.selectAll("path")
    //.data(buildings.features)
    .data(collection.features)
    //.data(topojson.feature(buildings,buildings.objects.Temp_ICBuildings).features)
    .enter()
    .append("path")
    .attr("d",path)
    .attr('class','buildings')
    .attr('id',function(d){
      return 'RESYRBLT' + d.properties.RESYRBLT
    })
    .attr('fill', function(d){
      if (d.properties.RESYRBLT <= 0){
        color = 'rgb(224,224,224)'
      } else {
        color = colorScale(d.properties.RESYRBLT)
      }
      return color
    })
    .style('opacity', 0.60)

    //building mouserover interactivity
    //**********************************
    buildings.on('mouseover',function(d){
      //grab the year
      if (buildingMouseOver == true) {
        var yr = d.properties.RESYRBLT;
        var barID = '#yr'+yr;
        if (yr  < 1800){

        } else {
          //add build year

          d3.select(barID).style('opacity',1)
          d3.select(this).style('opacity',1)
          d3.select('#yearLine').style('opacity',0.50)
            .attr('x',xScale(yr)+margin.left + 2.5)
          d3.select('#yearLineCount').style('opacity',1)
            .attr('x',xScale(yr)+margin.left+2.5)
            .attr('y',yScale(d.properties.COUNT_Year)+2.5)
            .text(d.properties.COUNT_Year)
          d3.select('#yearLineYear').style('opacity',1)
            .attr('x',xScale(yr)+margin.left+2.5)
            .attr('y',yScale(yearPos))
            .text(yr)
        };
      };
      //transition current mouseover
    })
    .on('mouseout',function(d){
      if (buildingMouseOver == true){
        //transition text back

        var barID = '#yr'+d.properties.RESYRBLT;
        d3.select(barID).style('opacity',0.75)
        d3.select(this).style('opacity',0.60)

        //transition back to normal opacity
        d3.select(this).transition().style('opacity',0.60)
        d3.select('#yearLine').style('opacity',0)
        d3.select('#yearLineYear').style('opacity',0)
        d3.select('#yearLineCount').style('opacity',0)
    };
    });


    //animate all the stuff!
    //***********************
    $('#animate').on('click', function(){
      d3.select('#animate').classed('disabled', true)
      buildings.style('opacity', .10)
      //transition bars to drop down to 0
      bars.transition()
        .attr('y',yScale(0))
        .attr('height',0)
      var tempBuidlings = d3.selectAll('.buildings').data();
      var legendOpac = d3.selectAll('.legend').style('opacity',0.25);
      buildingMouseOver = false;
      barMouseOver = false;

      //animate function
      function animate(data,index){

        var year = data[index].properties.RESYRBLT
        var selector = '#YearBuilt'+ year;
        var barSelector = '#yr' + year;
        var legSelector = '#legyr' + year;
        var buildCount = data[index].properties.COUNT_Year
        d3.select('#yearLineCount').style('opacity',1)
        d3.select('#yearLineYear').style('opacity',1)

        if (year <= 1840) {
          //hit the first to legend categories
          d3.select('#legend').select('#legyr').style('opacity',0.85);
          d3.select('#legend').select('#legyr1800').style('opacity',0.85)
        };

        if (year <= 2016){
          var timer = setTimeout(function(){
            //update legend category
            d3.select(legSelector).style('opacity',0.85)
            d3.select(selector).style('opacity',0.85);
            //update bars
            d3.select(barSelector).transition().duration(450)
                .attr('height',function(d){
                  return graphHeight-margin.top-margin.bottom - yScale(d.properties.COUNT_Year)
                })
                .attr('y',function(d){
                  return yScale(d.properties.COUNT_Year)
                })
            d3.select('#yearLine').style('opacity',.75)
              .transition()
                .attr('x',xScale(year) + margin.left + 2.5)
            d3.select('#yearLineCount').transition()
              .attr('x',xScale(year)+margin.left+ 5)
              .attr('y',yScale(buildCount) - 2)
              .text(buildCount)
            d3.select('#yearLineYear').transition()
              .attr('x',xScale(year)+margin.left)
              .attr('y',yScale(yearPos))
              .text(year)

            animate(data, ++index);
          },500)
        };
        if (year == 2016) {
          d3.select(selector).style('opacity',0.85);
          d3.select('#yearLine').transition().duration(1500).style('opacity',0)
          d3.select('#yearLineCount').transition().duration(1500).style('opacity',0)
          d3.select('#yearLineYear').transition().duration(1500).style('opacity',0)
          d3.select('#animate').classed('disabled', false)
          buildingMouseOver = true;
          barMouseOver = true;
          clearTimeout(timer);
        };


      }
      animate(tempBuidlings,0)

      }) //end of animate call back

    //when user zooms, view needs to be reset
    map.on('viewreset', reset);
    //this will put stuff on the map
    reset();

    // Reposition the SVG to cover the features.
    function reset() {

        var bounds = path.bounds(collection);


        var topLeft = bounds[0],
        bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        buildings.attr("d",path);

    } // end reset

    function projectPoint(x,y){
      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
      this.stream.point(point.x,point.y);
    }
  })//end d3 json callback

};//end makeMap function


$(document).ready(function(){
  makeMap();
});
