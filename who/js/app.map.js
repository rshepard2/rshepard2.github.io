var app = (function(parent, d3) {


    var el = parent.el;


    parent.map = {

        init: function(world) {

            var width = d3.select("#map").style("width").slice(0, -2),
                height = d3.select("#map").style("height").slice(0, -2);

            var svg = d3.select("#map svg")
                .attr("width", width)
                .attr("height", height);

            // var projection = d3.geoInterrupt(d3.geoSinusoidalRaw,
            //   [[ // northern hemisphere
            //          [[-180,   0], [-100,  90], [ -40,   0]],
            //          [[ -40,   0], [  30,  90], [ 180,   0]]
            //        ], [ // southern hemisphere
            //          [[-180,   0], [-160, -90], [-100,   0]],
            //          [[-100,   0], [ -60, -90], [ -20,   0]],
            //          [[ -20,   0], [  20, -90], [  80,   0]],
            //          [[  80,   0], [ 140, -90], [ 180,   0]]
            //        ]])
            // .rotate([0, 0])
            // .scale(Math.PI * 2)
            // .translate([width / 2, height / 2])
            // .precision(0.1);

            var projection = d3.geoCylindricalStereographic()
                .scale(Math.PI * 2)
                .translate([0, 0]);

            var graticule = d3.geoGraticule();

            var path = d3.geoPath()
                .projection(projection);

            var zoom = d3.zoom()
                .scaleExtent([20, 200])
                .on("zoom", zoomed);


            var center = projection([-30, 20]);


            var defs = svg.append("defs");

            defs.append("path")
                .datum({
                    type: "Sphere"
                })
                .attr("id", "sphere")
                .attr("d", path);

            defs.append("clipPath")
                .attr("id", "clip")
                .append("use")
                .attr("xlink:href", "#sphere");

            svg.append("use")
                .attr("class", "stroke")
                .attr("xlink:href", "#sphere");

            svg.append("use")
                .attr("class", "fill")
                .attr("xlink:href", "#sphere");

            var grat = svg.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                //			.attr("clip-path", "url(#clip)")
                .attr("d", path);

            var countries = svg.selectAll("path")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter()
                .append("path")
                .attr("class", "country")
                //			  .attr("clip-path", "url(#clip)")
                .attr("d", path)
                .on('mouseover', function(d) {
                    app.map.highLightCountry(d.properties.iso);
                    app.chart.updateChart(d.properties.iso);
                    app.ui.updateSelected(d.properties.iso);
                })
                .on('mouseout', function(d) {
                    app.map.deHighLightCountry();
                });

            app.map.highLightCountry('AFG');

            // Apply a zoom transform equivalent to projection.{scale,translate,center}.
            svg
                .call(zoom)
                .call(zoom.transform, d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(19.5)
                    .translate(-center[0] - 3, -center[1] - 1));

            function zoomed() {

                var transform = d3.event.transform;

                countries.attr("transform", transform)
                    .style("stroke-width", 1 / transform.k);

                grat.attr("transform", transform)
                    .style("stroke-width", 1 / transform.k);

                //                d3.select('defs path').attr("transform", transform);
            }

        },
        highLightCountry: function(iso) {

            d3.selectAll('.country')
                .attr('fill', function(d) {
                    if (d.properties.iso == iso) {
                        return '#999';
                    } else {
                        return '#777';
                    }
                });
        },
        deHighLightCountry: function() {
            d3.selectAll('.country').attr('fill', '#777');
        }


    }

    return parent;

})(app || {}, d3)
