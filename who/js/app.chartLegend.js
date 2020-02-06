var app = (function(parent, d3) {


    var el = parent.el;


    parent.chartLegend = {

        init: function(data) {
            
            var width = d3.select("#chart-legend").style("width").slice(0, -2),
                height = d3.select("#chart-legend").style("height").slice(0, -2);

            var svg = d3.select("#chart-legend svg")
                .attr("width", width)
                .attr("height", height)

            var vaccines = data.map(function(vaccine) {
                return vaccine.id;
            });

            var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(vaccines);

            svg.append('g')
                .attr('transform', 'translate(0, 40)')
                .selectAll('g')
                .data(vaccines)
                .enter()
                .append('g')
                .attr('class', function(d, i) {
                    return 'legend-item ';
                })
                .on('mouseover', function(d) {
                    app.chart.highlightVaccine(d);
                })
                .append("line")
                .attr("x1", 280)
                .attr("y1", function(d, i) {
                    return 40 * i;
                })
                .attr("x2", 340)
                .attr("y2", function(d, i) {
                    return 40 * i;
                })
                .attr("stroke-width", 3)
                .attr("stroke", function(d) {
                    return colorScale(d);
                })

            d3.selectAll('.legend-item')
                .append('text')
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return 40 * i;
                })
                .style("font", "13px Open Sans")
                .text(function(d) {
                    return el.vaccineCodes[d] + ' (' + d + ')';
                })
                .call(app.chartLegend.wrapText, 270)
                .attr('alignment-baseline', 'middle');


            d3.select('#chart-legend').on('mouseout', function(d) {
                // need to stop propagation here
                app.chart.deHighlightVaccines();
            });

        },
        wrapText: function(text, width) {
            // adapted from bostock's example: https://bl.ocks.org/mbostock/7555321

            text.each(function() {
                try {
                    var text = d3.select(this),
                        words = d3.select(this).html().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        x = text.attr("x"),
                        y = text.attr("y"),
                        dy = 0, //parseFloat(text.attr("dy")),
                        tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                        }
                    }


                } catch (e) {

                    console.log(e)
                }
            });
        }




    }


    return parent;

})(app || {}, d3)
