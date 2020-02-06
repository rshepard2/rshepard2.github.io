var app = (function(parent, d3) {


    var el = parent.el;

    parent.processData = {

        init: function() {

                d3.queue()
                    .defer(d3.json, 'data/countries.json')
                    .defer(d3.json, 'data/vaccineCodes.json')
                    .defer(d3.csv, 'data/country_vaccination/BCG.csv')
                    .defer(d3.csv, 'data/country_vaccination/DTP1.csv')
                    .defer(d3.csv, 'data/country_vaccination/DTP3.csv')
                    .defer(d3.csv, 'data/country_vaccination/HEPB_BD.csv')
                    .defer(d3.csv, 'data/country_vaccination/Hib3.csv')
                    .defer(d3.csv, 'data/country_vaccination/MCV1.csv')
                    .defer(d3.csv, 'data/country_vaccination/PAB.csv')
                    .defer(d3.csv, 'data/country_vaccination/Pol3.csv')
                    .defer(d3.csv, 'data/country_vaccination/RotaC.csv')
                    .defer(d3.csv, 'data/country_vaccination/YFV.csv')
                    .awaitAll(function(e, d) {

                        var countriesGeom = d.shift(),
                            vaccineCodes = d.shift(),
                            geoms = countriesGeom.objects.countries.geometries;

                        el.data = d;

                        var countriesData = {};

                        d.map(function(vaccineDatum) {

                            vaccineDatum.map(function(countryVaccineDatum) {

                                // build object to hold all vaccination data
                                // for each country
                                if (countriesData[countryVaccineDatum.ISO_code]) {
                                    countriesData[countryVaccineDatum.ISO_code][countryVaccineDatum.Vaccine] = countryVaccineDatum;
                                } else {
                                    countriesData[countryVaccineDatum.ISO_code] = {};
                                    countriesData[countryVaccineDatum.ISO_code]['cName'] = countryVaccineDatum.Cname;
                                    countriesData[countryVaccineDatum.ISO_code][countryVaccineDatum.Vaccine] = countryVaccineDatum;
                                    console.log(countryVaccineDatum.Vaccine)
                                }

                                // add vaccination data to country geom properties
                                geoms.map(function(country) {
                                    if (country.properties.iso === countryVaccineDatum.ISO_code) {
                                        country.properties[countryVaccineDatum.Vaccine] = countryVaccineDatum;
                                    }
                                });
                            });
                        });

                        el.countriesData = countriesData;
                        el.countriesGeom = countriesGeom;
                        el.vaccineCodes = vaccineCodes;

                        app.chart.init(el.countriesData);
                        // app.map.init(el.countriesGeom);
                        app.ui.init(el.countriesData);



                        //  TEST to see if iso codes in data aren't found in geometry data
                        var dataIsos = [];

                        for (var iso in countriesData) {
                            dataIsos.push(iso);
                        }

                        var geometryIsos = [];

                        geoms.map(function(o) {
                            geometryIsos.push(o.properties.iso)
                        });

                        var missingGeoms = [];

                        dataIsos.map(function(iso) {

                            if (geometryIsos.indexOf(iso) == -1) {
                                missingGeoms.push(iso)
                            }
                        });

                        console.log('data does not have a country for: ', missingGeoms)


                    });

            } // end init()

    }

    return parent;

})(app || {}, d3)
