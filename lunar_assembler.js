        // TODO - there is a function to do this, right?
        function leafletBoundsToGeoJSONFeatureCollectionPolygon(bounds) {
            return {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                      [
                        [
                          bounds.getWest(),
                          bounds.getSouth(),
                        ],
                        [
                          bounds.getEast(),
                          bounds.getSouth(),
                        ],
                        [
                          bounds.getEast(),
                          bounds.getNorth(),
                        ],
                        [
                          bounds.getWest(),
                          bounds.getNorth(),
                        ],
                        [
                          bounds.getWest(),
                          bounds.getSouth(),
                        ]
                      ]
                    ]
                  }
                }
              ]
            }
          }
  
          // downloading OSM data
          async function downloadOpenStreetMapData(bounds){
              // https://leafletjs.com/reference-1.6.0.html#latlngbounds-getcenter
              query = "";
              // note: extra filters will break data in case of some bad/poor/substandard tagging or where someone want this kind of data
              // extra filters are useful to reduce data overload during debugging, often bug is reproducible in their presence
              var extra_filters = "[type!=route][type!=parking_fee][type!=waterway][type!=boundary][boundary!=administrative][boundary!=religious_administration]"
              query += "[out:json][timeout:25];nwr" + extra_filters + "(";
              query += bounds.getSouth();
              query += ","
              query += bounds.getWest();
              query += ","
              query += bounds.getNorth();
              query += ","
              query += bounds.getEast();
              query += ");";
              query += "out body;>;out skel qt;";
              console.log("overpass query: " + query);
  
              const response = await fetch("https://overpass-api.de/api/interpreter", {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                  },
                  body: new URLSearchParams({'data': query})
              })
              if (response.ok) {
                const responseData = response.json();
                const osmJSON = responseData;
                return osmJSON;
              } else {
                alert("Overpass Turbo refused to provide data, you likely exceed usage limit of that free service.")
              }
          } 
          function toGeoJSON(osmJSON) {
              let geoJSON = osmtogeojson(osmJSON);
              return geoJSON;
          }
  
  
      // TODO: what kind of geojson is accepted here? will it crash when I pass a point here?
      function rewind(geojson_that_is_7946_compliant_with_right_hand_winding_order) {
        // ARGHHHHHH ARGHHHHHH ARGHHHH
        // https://gis.stackexchange.com/questions/392452/why-d3-js-works-only-with-geojson-violating-right-hand-rule
        // I opened https://github.com/d3/d3-shape/issues/178
        const d3_geojson = { ...geojson_that_is_7946_compliant_with_right_hand_winding_order };
        d3_geojson.features = d3_geojson.features.map(f =>
          turf.rewind(f, { reverse: true })
        );
        //alert(JSON.stringify(d3_geojson))
        return d3_geojson;
      }
  
  
  
  function renderUsingD3(geoJSONRepresentingBoundaries, data_geojson, width, height, selector, mapStyle) {
      // rewinding is sometimes needed, sometimes not
      // rewinding is sometimes broken in my code (at least in oce case it was borked by my bug in futher processing!), sometimes not
      // see https://gis.stackexchange.com/questions/392452/why-d3-js-works-only-with-geojson-violating-right-hand-rule
      // not sure what is going on here
      console.log("data_geojson: " + JSON.stringify(data_geojson))
      var d3_data_geojson = rewind(data_geojson);
      var d3_geoJSONRepresentingBoundaries = rewind(geoJSONRepresentingBoundaries);
      console.log("d3_geojson: " + JSON.stringify(d3_data_geojson))
  
      var projection = d3.geoMercator().fitSize([width, height], d3_geoJSONRepresentingBoundaries)
  
  
      var geoGenerator = d3.geoPath()
      .projection(projection);
  
      document.getElementById('generated_map').innerHTML=""
  
      var buildings = JSON.parse(JSON.stringify(d3_data_geojson));
      var landuse = JSON.parse(JSON.stringify(d3_data_geojson));
      var landcover = JSON.parse(JSON.stringify(d3_data_geojson));
      var other = JSON.parse(JSON.stringify(d3_data_geojson));
      var linear_roads = JSON.parse(JSON.stringify(d3_data_geojson));
      var area_highway = JSON.parse(JSON.stringify(d3_data_geojson));
      buildings.features = [];
      landuse.features = [];
      landcover.features = [];
      other.features = [];
      linear_roads.features = [];
      area_highway.features = [];
      d3_data_geojson.features.forEach(function(feature) {
        if(feature.properties["highway"] != null) {
          linear_roads.features.push(feature);
        } if(feature.properties["area:highway"] != null) {
          area_highway.features.push(feature);
        } if(feature.properties["building"] != null || feature.properties["man_made"] == "bridge" || feature.properties["area:highway"] != null) {
          buildings.features.push(feature);
        } else if(feature.properties["natural"] != null || feature.properties["landuse"] == "forest") {
          landcover.features.push(feature);
        } else if(feature.properties["leisure"] != null || feature.properties["landuse"] != null) {
          landuse.features.push(feature);
        } else {
          other.features.push(feature);
        }
      });
      console.log("AFTER ITERATION")
      //console.log(buildings_d3_data_geojson)
  
      d3_data_geojson.features = landuse.features.concat(landcover.features).concat(buildings.features).concat(other.features).concat(linear_roads.features).concat(area_highway.features);
      console.log(d3_data_geojson.features)
      update3Map(geoGenerator, d3_data_geojson, selector, mapStyle);
      download("generated.svg", document.getElementById('generated_svg_within').innerHTML)
    }
    
    function update3Map(geoGenerator, used_data, selector) {
      var u = d3.select(selector) // should use selector
        .selectAll('path')
        .data(used_data.features);
    
      u.enter()
        .append('path')
        .attr('d', geoGenerator)
        .attr("stroke", mapStyle.strokeColoring)
          .attr("stroke-width", mapStyle.strokeWidth)
          .attr("fill", mapStyle.fillColoring)
          .attr("name", mapStyle.name)
    }
    
    
      function download(filename, text) {
        var element = document.createElement('a');      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      }