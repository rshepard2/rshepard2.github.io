var app = (function(parent, d3) {


    var el = parent.el;

    var chartWidth = Number(d3.select('#chart').style('width').slice(0, -2)),
        chartHeight = Number(d3.select('#chart').style('height').slice(0, -2));

    var svg = d3.select("#chart svg")
        .attr('width', chartWidth)
        .attr('height', chartHeight);

    var margin = {
            top: 10,
            right: 20,
            bottom: 20,
            left: 50
        },
        width = chartWidth - margin.left - margin.right,
        height = chartHeight - margin.top - margin.bottom;

    var parseTime = d3.timeParse("%Y");

    // object to store graph properites
    function chartParams(container) {
        this.container = container;
        this.iso = null;
        this.made = false;
        this.x = null,
            this.y = null,
            this.z = null,
            this.line = null
    };

    var chart = new chartParams('#chart');

    parent.chart = {

        init: function(data) {

            chart.data = data;

            if (chart.made) {
                app.chart.updateChart();
            } else {
                app.chart.drawChart('AFG');
            }
        },
        parseData: function(countriesData, currentIso) {

            var countryData = [];

            for (var vaccine in countriesData[currentIso]) {

                var valuesArray = [];

                for (var timestamp in countriesData[currentIso][vaccine]) {

                    if (Number(countriesData[currentIso][vaccine][timestamp])) {

                        valuesArray.push({
                            year: parseTime(timestamp),
                            percentage: Number(countriesData[currentIso][vaccine][timestamp])
                        });
                    }
                }

                if (valuesArray.length > 0) {
                    countryData.push({
                        id: vaccine,
                        values: valuesArray
                    });
                }
            }
            el.countryData = countryData;
            return countryData;
        },
        drawChart: function(iso) {

            chart.iso = iso;

            var countryData = app.chart.parseData(chart.data, chart.iso);

            chart.x = d3.scaleTime().range([0, width])
                .domain([parseTime(1980), parseTime(2015)]),
                chart.y = d3.scaleLinear().range([height, 0])
                .domain([
                    d3.min(countryData, function(c) {
                        return d3.min(c.values, function(d) {
                            return d.percentage;
                        })
                    }),
                    d3.max(countryData, function(c) {
                        return d3.max(c.values, function(d) {
                            return d.percentage;
                        })
                    })
                ]),
                chart.z = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(countryData.map(function(c) {
                    return c.id;
                }));

            chart.line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) {
                    return chart.x(d.year);
                })
                .y(function(d) {
                    return chart.y(d.percentage);
                });

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr('id', 'lines-group');

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(chart.x));

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(chart.y))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("dy", "0.70em")
                .attr("x", -50)
                .attr("fill", "#666")
                .text("% Population Vaccinated");

            var vaccineLines = g.selectAll('path')
                .data(countryData)
                .enter()
                .append("path")
                .attr("class", "vaccine-line")
                .attr("d", function(d) {
                    return chart.line(d.values);
                })
                .style("stroke", function(d) {
                    return chart.z(d.id);
                })
                .attr("id", function(d) {
                    return d.id;
                });



            //            vaccines.append("text")
            //                .datum(function (d) {
            //                    return {
            //                        id: d.id,
            //                        value: d.values[d.values.length - 1]
            //                    };
            //                })
            //                .attr("transform", function (d) {
            //                    return "translate(" + chart.x(d.value.year) + "," + chart.y(d.value.percentage) + ")";
            //                })
            //                .attr("x", 3)
            //                .attr("dy", "0.35em")
            //                .style("font", "10px sans-serif")
            //                .text(function (d) {
            //                    return d.id;
            //                });

            app.chartLegend.init(countryData);

        },
        updateChart: function(iso) {

            chart.currentIso = iso;

            var countryData = app.chart.parseData(chart.data, chart.currentIso);

            var vaccines = d3.selectAll(".vaccine-line")
                .data(countryData)
                //.enter()
                .transition()
                .attr("d", function(d) {
                    return chart.line(d.values);
                })
                .attr('stroke-opacity', '1')
                //.exit().remove();

            //            app.chartLegend.updateLegend(iso);
        },
        compareRegion: function(vaccine) {

            // upon user selection, visualize single vaccine across regional countries

        },
        highlightVaccine: function(vaccine) {

            // d3.selectAll(".vaccine-line")
            //     .attr('stroke-opacity', function(d,i){
            //         console.log(vaccine, d,i)
            //         if(d.id != vaccine) return '.2';
            //         else return '1';
            //     });

            d3.selectAll(".vaccine-line").attr('stroke-opacity', '.2');
            d3.select('#' + vaccine).attr('stroke-opacity', '1');


        },
        deHighlightVaccines: function() {

            d3.selectAll(".vaccine-line")
                .attr('stroke-opacity', '1');
        }

    }



    return parent;

})(app || {}, d3)
