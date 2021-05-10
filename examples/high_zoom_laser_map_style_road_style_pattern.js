/*
    lunar_assembler - tool for generating SVG files from OpenStreetMap data. Available as a website.
    Copyright (C) 2021 Mateusz Konieczny

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, under version 3 of the
    License only.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
function highZoomLaserMapStyle() {
  var mapStyle = {
    motorizedRoadValuesArray() {
      return [
        "motorway",
        "motorway_link",
        "trunk",
        "trunk_link",
        "primary",
        "primary_link",
        "secondary",
        "secondary_link",
        "tertiary",
        "tertiary_link",
        "unclassified",
        "residential",
        "service",
        "track",
        "road",
      ];
    },

    railwayLinearValuesArray() {
      return [
        "rail",
        "disused",
        "tram",
        "subway",
        "narrow_gauge",
        "light_rail",
        "preserved",
        "construction",
        "miniature",
        "monorail",
      ];
    },

    paintOrder(feature) {
      // higher values: more on top

      var valueRangeForOneLayer = 10000;
      var layer = 0;
      if (feature.properties["layer"] != null) {
        /* 
        ignore layer tag on buildings and similar 
        to discourage tagging for renderer
        note that undeground buildings are later skipped
        */
        if (
          feature.properties["building"] == null &&
          (feature.properties["natural"] == null ||
            feature.properties["natural"] == "water") &&
          feature.properties["landuse"] == null &&
          feature.properties["leisure"] == null
        ) {
          layer = feature.properties["layer"];
        }
      }

      if (
        mapStyle
          .railwayLinearValuesArray()
          .includes(feature.properties["railway"])
      ) {
        var priority = 0.99;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["area:highway"] != null) {
        var priority = 0.98;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (
        feature.properties["building"] != null &&
        feature.properties["location"] != "underground"
      ) {
        var priority = 0.95;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["barrier"] != null) {
        var priority = 0.9;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["highway"] != null) {
        var priority = 0.85;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["barrier"] != null) {
        var priority = 0.7;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["man_made"] === "bridge") {
        var priority = 0.65;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["waterway"] != null) {
        /* render waterway lines under bridge areas */
        var priority = 0.6;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (
        feature.properties["natural"] === "water" ||
        feature.properties["waterway"] === "riverbank"
      ) {
        // render natural=wood below natural=water
        var priority = 0.1;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["natural"] === "bare_rock") {
        // render natural=wood below natural=bare_rock
        // render water rather than underwater rocks
        var priority = 0.05;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["leisure"] != null) {
        // render leisure=park below natural=water or natural=wood
        // but above landuse=residential
        var priority = 0.03;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["landuse"] != null) {
        //better higher and trigger layering problems quickly that have something failing ONLY in parks
        var priority = 0.02;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      return valueRangeForOneLayer * layer;
    },

    fillColoring(feature) {
        console.log(feature);
        if (["Point"].includes(feature.geometry.type)) {
            //no rendering of points, for start size seems to randomly differ
            // and leaves ugly circles - see building=* nodes
            return "none";
        }    
        if(feature.properties["lunar_assembler_step_segment"] == "0") {
            return "#400080";
        }
        if(feature.properties["lunar_assembler_step_segment"] == "1") {
            return "magenta";
        }
        if(feature.properties["lunar_assembler_step_segment"] == "2") {
            return "#ff0000";
        }
        if(feature.properties["lunar_assembler_step_segment"] == "3") {
            return "orange";
        }
      if (feature.properties["building"] != null) {
        return "#603006";
      }
      if (
        mapStyle
          .motorizedRoadValuesArray()
          .includes(feature.properties["area:highway"])
        || feature.properties["area:highway"] === "bicycle_crossing"
      ) {
        if(feature.properties["lunar_assembler_cloned_for_pattern_fill"] == "yes") {
          return "black"
        }
        return "gray";
      }
      if (
        ["footway", "pedestrian", "path"].includes(
          feature.properties["area:highway"]
        ) ||
        (feature.properties["highway"] == "pedestrian" &&
        (feature.properties["area"] === "yes" || feature.properties["type"] === "multipolygon")
        )
        ) {
        return "green";
      }
      if (feature.properties["area:highway"] === "crossing") {
        return "yellow";
      }
      if (feature.properties["natural"] === "water" || feature.properties["waterway"] === "riverbank") {
        if(feature.properties["lunar_assembler_cloned_for_pattern_fill"] == "yes") {
          return "blue"
        }
        return "afeeee";
      }
      return "none";
    },

    strokeColoring(feature) {
        if (["Point"].includes(feature.geometry.type)) {
            //no rendering of points, for start size seems to randomly differ
            // and leaves ugly circles - see building=* nodes
            return "none";
        }    
        return "none";
  },

    strokeWidth(feature) {
      if (
        mapStyle
          .railwayLinearValuesArray()
          .includes(feature.properties["railway"])
      ) {
        return 2;
      }

      return 1;
    },

    mergeIntoGroup(feature) {
      // note that points and lines are not being merged!
      // only areas (including multipolygins) can be merged for now
      // please open an issue if you need it, it increaes chance of implementation a bit
      // or open pull request with an implementation
      if (
        mapStyle
          .motorizedRoadValuesArray()
          .includes(feature.properties["area:highway"])
          || feature.properties["area:highway"] === "bicycle_crossing"
          || feature.properties["area:highway"] === "cycleway"
      ) {
        return "area:highway_carriageway_layer";
      }
      if (
        ["footway", "pedestrian", "path"].includes(
          feature.properties["area:highway"]
        ) ||
        (feature.properties["highway"] == "pedestrian" &&
        (feature.properties["area"] === "yes" || feature.properties["type"] === "multipolygon")
        )
      ) {
        return "area:highway_footway";
      }
      // hack for https://www.openstreetmap.org/way/660168838
      if (["way/660168838", "way/655408390", "way/655029668"].includes(feature.id)) {
        return "area:highway_footway";
      }

      if (feature.properties["area:highway"] == "cycleway") {
        return "area:highway_cycleway";
      }
      if (feature.properties["building"] != null) {
        return "buildings";
      }
      if (feature.properties["natural"] === "water" || feature.properties["waterway"] === "riverbank") {
        return "water";
      }
      return null;
    },

    name(feature) {
      return feature.properties.name;
    },

    transformGeometryAsInitialStep(data_geojson) {
        data_geojson = mapStyle.programaticallyGenerateSymbolicStepParts(data_geojson);
        return data_geojson;
    },

    // called after areas were merged, before sorting of areas
    // gets full data and can freely edit it
    transformGeometryAtFinalStep(data_geojson) {
        data_geojson = mapStyle.applyPatternsToCarriagewaysAndWater(data_geojson);
        return data_geojson;
    },

    ////////////////////////////////////////////
    // steps processing
    dataToListOfPositionOfStepsNodes(geojson) {
        // TODO: document is the first on list lower or higher
        pointsInSteps = [];
        var i = geojson.features.length;
        while (i--) {
          var feature = geojson.features[i];
          const link = "https://www.openstreetmap.org/" + feature.id;
          if (feature.properties["highway"] == "steps") {
            if (feature.properties["area"] == "yes" ||  feature.properties["type"] === "multipolygon") {
              alert("steps mapped as an area should use area:highway=steps tagging, " + link + " needs fixing");
            } else if (feature.geometry.type != "LineString") {
              alert("Unexpected geometry for steps, expected a LineString, got " + feature.geometry.type + " " + link + " needs fixing");
            } else {
              var k = feature.geometry.coordinates.length;
              if (feature.properties["incline"] == "down") {
                // reverse order (assumes incline=up to be default)
                index = 0;
                while (index < k) {
                  pointsInSteps.push(feature.geometry.coordinates[index]);
                  index += 1;
                }
              } else {
                while (k--) {
                  pointsInSteps.push(feature.geometry.coordinates[k]);
                }
              }
            }
          }
        }
        return pointsInSteps;
      },

      indexOfMatchingPointInArray(point, array) {
        var indexOfMatchingPointInSteps = -1;
        var stepIndex = array.length;
        while (stepIndex--) {
          if (point[0] === array[stepIndex][0] && point[1] === array[stepIndex][1]) {
            indexOfMatchingPointInSteps = stepIndex;
            return stepIndex;
          }
        }
        return -1;
      },

      expectStepsPolygonCountToBeSixNodes(nodeCountOnPolygon, link) {
        const expected = 6 + 1; // +1 as a border node is repeated
        if (nodeCountOnPolygon != expected) {
          if (nodeCountOnPolygon > expected) {
            alert("untested for large (" + nodeCountOnPolygon + " nodes) area:highway=steps geometries with more than 6 nodes. See " + link + "\nIf OSM data is correct and output is broken, please report to https://github.com/matkoniecz/lunar_assembler/issues");
          } else {
            alert("unexpectedly low node count ( " + nodeCountOnPolygon + "), is highway=steps attached to area:highway=steps? See " + link);
          }
        }
      },

      indexesOfPointsWhichAreConnectedToStepsWay(feature, pointsInSteps) {
        const link = "https://www.openstreetmap.org/" + feature.id;
        if (feature.geometry.type != "Polygon") {
          alert("unsupported for " + feature.geometry.type + "! Skipping, see " + link+ "\nIf OSM data is correct and output is broken, please report to https://github.com/matkoniecz/lunar_assembler/issues");
          return null;
        }
        var nodeCountOnPolygon = feature.geometry.coordinates[0].length;
        mapStyle.expectStepsPolygonCountToBeSixNodes(nodeCountOnPolygon, link);
        var nodeIndex = nodeCountOnPolygon;
        var theFirstIntersection = undefined;
        var theSecondIntersection = undefined;
        while (nodeIndex-- > 1) {
          // > 1 is necessary as the last one is repetition of the first one
          const point = feature.geometry.coordinates[0][nodeIndex];

          indexOfMatchingPointInSteps = mapStyle.indexOfMatchingPointInArray(point, pointsInSteps);
          if (indexOfMatchingPointInSteps != -1) {
            //alert(point + " found at index " + indexOfMatchingPointInSteps + "of steps array");
            if (theFirstIntersection == undefined) {
              theFirstIntersection = { indexInObject: nodeIndex, indexInStepsArray: indexOfMatchingPointInSteps };
            } else if (theSecondIntersection == undefined) {
              theSecondIntersection = { indexInObject: nodeIndex, indexInStepsArray: indexOfMatchingPointInSteps };
            } else {
              alert("more than 2 intersections of area:highway=steps with highway=steps, at " + link + "\nOSM data needs fixing.");
            }
          }
        }
        if (theFirstIntersection == undefined || theSecondIntersection == undefined) {
          alert("expected 2 intersections of area:highway=steps with highway=steps, got less at " + link + "\nIt can happen when steps area is within range but steps way is outside, special step pattern will not be generated for this steps.");
          return null;
        }
        if (theFirstIntersection["indexInStepsArray"] > theSecondIntersection["indexInStepsArray"]) {
          // ensure that steps are going up/down - TODO!!!!
          var swap = theFirstIntersection;
          theFirstIntersection = theSecondIntersection;
          theSecondIntersection = swap;
        }
        return [theFirstIntersection, theSecondIntersection];
      },

      buildAreasSplittingStepAreaIntoSymbolicStepsFromProvidedSkeletonLines(firstLineStart, firstLineEnd, secondLineStart, secondLineEnd, pointBetweenStarts, pointBetweenEnds) {
        // gets lines data - one for each side of steps
        // firstLineStart, firstLineEnd
        // secondLineStart, secondLineEnd
        // gets data about extra geometry parts at upper and lower steps boundary
        // pointBetweenStarts, pointBetweenEnds
        //
        // returns array of features with extra shapes giving symbolic depiction of steps
        returned = [];
        // add _part_X tags
        const partCount = 4;
        var partIndex = partCount;
        while (partIndex--) {
          //TODO: what if steps attachment changes geometry?
          //the first and the last line should include also middle nodes...
          ratioOfStartForTop = (partIndex + 1) / partCount;
          ratioOfStartForBottom = partIndex / partCount;
          var cornerOnTopOfTheFirstLine = mapStyle.pointBetweenTwoPoints(firstLineStart, firstLineEnd, ratioOfStartForTop);
          var cornerOnBottomOfTheFirstLine = mapStyle.pointBetweenTwoPoints(firstLineStart, firstLineEnd, ratioOfStartForBottom);

          var cornerOnTopOfTheSecondLine = mapStyle.pointBetweenTwoPoints(secondLineStart, secondLineEnd, ratioOfStartForTop);
          var cornerOnBottomOfTheSecondLine = mapStyle.pointBetweenTwoPoints(secondLineStart, secondLineEnd, ratioOfStartForBottom);

          const coords = [cornerOnTopOfTheFirstLine, cornerOnTopOfTheSecondLine, cornerOnBottomOfTheSecondLine, cornerOnBottomOfTheFirstLine, cornerOnTopOfTheFirstLine];
          const geometry = { type: "Polygon", coordinates: [coords] };
          const generatedFeature = { type: "Feature", properties: { "lunar_assembler_step_segment": "" + partIndex }, "geometry": geometry };
          //alert(JSON.stringify(generatedFeature));
          returned.push(generatedFeature);

          //winding :( TODO, lets ignore it for now
        }
        return returned;
      },

      buildAreasSplittingStepAreaIntoSymbolicSteps(feature, pointsInSteps) {
        // gets feature (area:highway=steps) and list of points in highway=steps
        // returns array of features with extra shapes giving symbolic depiction of steps

        // we can detect connecting nodes. Lets assume simplest case:
        // two nodes where highway=steps are connected, without substantially changing geometry
        // and area:highway has four more nodes for depicting steps geometry
        // so, for given feature we can detect skeleton with two ways forming sides of steps
        // this can be split into parts and form the expected steps
        //
        // it wil fail for more complicated steps!
        // unit testing would be useful...
        // write just standalone code for now? not with some testing framework?

        const link = "https://www.openstreetmap.org/" + feature.id;
        var matches = mapStyle.indexesOfPointsWhichAreConnectedToStepsWay(feature, pointsInSteps);
        if(matches === null) {
            alert("unable to build steps pattern for " + link + " - please create an issue at https://github.com/matkoniecz/lunar_assembler/issues if that is unexpected and unwanted")
            return null
        }
        var nodeCountOnPolygon = feature.geometry.coordinates[0].length;
        mapStyle.expectStepsPolygonCountToBeSixNodes(nodeCountOnPolygon, link);

        //alert((matches[0].indexInObject-1) + " " + (matches[1].indexInObject+1))
        //alert((matches[0].indexInObject+1) + " " + (matches[1].indexInObject-1))

        var pointBetweenStarts = feature.geometry.coordinates[0][matches[0].indexInObject];
        var pointBetweenEnds = feature.geometry.coordinates[0][matches[0].indexInObject];

        var firstLineStartIndex = (matches[0].indexInObject - 1) % nodeCountOnPolygon;
        var firstLineStart = feature.geometry.coordinates[0][firstLineStartIndex];
        var firstLineEndIndex = (matches[1].indexInObject + 1) % nodeCountOnPolygon;
        var firstLineEnd = feature.geometry.coordinates[0][firstLineEndIndex];
        //alert(JSON.stringify({type: 'LineString', coordinates: [firstLineStart, firstLineEnd]}));

        var secondLineStartIndex = (matches[0].indexInObject + 1) % nodeCountOnPolygon;
        var secondLineStart = feature.geometry.coordinates[0][secondLineStartIndex];
        var secondLineEndIndex = (matches[1].indexInObject - 1) % nodeCountOnPolygon;
        var secondLineEnd = feature.geometry.coordinates[0][secondLineEndIndex];
        //alert(JSON.stringify({type: 'LineString', coordinates: [secondLineStart, secondLineEnd]}));

        return mapStyle.buildAreasSplittingStepAreaIntoSymbolicStepsFromProvidedSkeletonLines(firstLineStart, firstLineEnd, secondLineStart, secondLineEnd, pointBetweenStarts, pointBetweenEnds);
      },

      pointBetweenTwoPoints(start, end, ratioOfStart) {
        return [start[0] * ratioOfStart + end[0] * (1 - ratioOfStart), start[1] * ratioOfStart + end[1] * (1 - ratioOfStart)];
      },

      programaticallyGenerateSymbolicStepParts(data_geojson){
        //alert(JSON.stringify(data_geojson))
        var pointsInSteps = mapStyle.dataToListOfPositionOfStepsNodes(data_geojson);
        var i = data_geojson.features.length;
        var generatedFeatures = []
        while (i--) {
          var feature = data_geojson.features[i];
          const link = "https://www.openstreetmap.org/" + feature.id;
          if (feature.properties["area:highway"] != "steps") {
            continue;
          }
          const rings = feature.geometry.coordinates.length;
          if (rings != 1) {
            alert("untested for polygons with holes. And it seems that it should be represented as two highway=steps and two area:highway anyway. See " + link + "\nIf OSM data is correct and output is broken, please report to https://github.com/matkoniecz/lunar_assembler/issues");
          }
          var newFeaturesForAdding = mapStyle.buildAreasSplittingStepAreaIntoSymbolicSteps(feature, pointsInSteps);
          if(newFeaturesForAdding != null) {
            k = newFeaturesForAdding.length;
            while (k--) {
              generatedFeatures.push(newFeaturesForAdding[k]);
            }  
          }
        }
        i = generatedFeatures.length;
        while (i--) {
            data_geojson.features.push(generatedFeatures[i]);
        }
        return data_geojson;
    },

    isMultipolygonAsExpected(feature) {
        if (
          feature.geometry.type == "Point" ||
          feature.geometry.type === "MultiPoint"
        ) {
          alert("UNEXPECTED " + feature.geometry.type + " in " + JSON.stringify(feature) + "\nIf OSM data is correct and output is broken, please report to https://github.com/matkoniecz/lunar_assembler/issues")
          return false;
        } else if (
          feature.geometry.type == "LineString" ||
          feature.geometry.type == "MultiLineString"
        ) {
          alert("UNEXPECTED " + feature.geometry.type + " in " + JSON.stringify(feature) + "\nIf OSM data is correct and output is broken, please report to https://github.com/matkoniecz/lunar_assembler/issues")
          return false;
      } else if (
          feature.geometry.type == "Polygon"
        ) {
          alert("UNEXPECTED " + feature.geometry.type + " in " + JSON.stringify(feature) + "\nIf OSM data is correct and output is broken, please report to https://github.com/matkoniecz/lunar_assembler/issues")
          return false;
        } else if (
          feature.geometry.type == "MultiPolygon") {
            return true;
  
          }
          alert("UNEXPECTED GEOMETRY " + feature.geometry.type)
          return false;
      },
  
      applyPatternsToCarriagewaysAndWater(data_geojson) {
        // applied pattern is set of square holes, regularly spaced in a grid
        // it is intended to be used in a laser cutter that will burn are outside such exempt holes, producing a clear pattern
        // repeating pattern on grid of size 1m seems to work well, with hole 40cm sized and burned are 60cm wide
        // in created pattern it was 1mm for hole and 1.5 mm for space between giles

        // Returns BBox bbox extent in [minX, minY, maxX, maxY] order
        bbox = turf.bbox(data_geojson)
        var minLongitude = bbox[0]
        var minLatitude = bbox[1]
        var maxLongitude = bbox[2]
        var maxLatitude = bbox[3]
        var from = turf.point([bbox[0], bbox[1]]); // turf.point(longitude, latitude, properties)
        var to = turf.point([bbox[2], bbox[3]]);
        var options = {units: 'kilometers'};
        var distanceInMeters = turf.distance(from, to, options) * 1000;


        var from_horizontal = turf.point([minLongitude, minLatitude]); // turf.point(longitude, latitude, properties)
        var to_horizontal = turf.point([maxLongitude, minLatitude]);
        var options = {units: 'kilometers'};
        var distanceHorizontalInMeters = 1000 * turf.distance(from_horizontal, to_horizontal, options);
        var distanceHorizontalInDegrees = bbox[2] - bbox[0]
        var metersInDegree = distanceHorizontalInMeters / distanceHorizontalInDegrees;
        //var degreesInMeter = 1 / metersInDegree

        const roadHoleSizeInMeters = 0.4
        const roadSpaceBetweenInMeters = 0.6

        const waterSpaceBetweenRowsInMeters = 0.6
        const waterRowSizeInMeters = 0.6


        // generate pattern for road surface by intersecting it with a prepared pattern
        var i = data_geojson.features.length;
        while (i--) {
          var feature = data_geojson.features[i];
          if(feature.properties['lunar_assembler_merge_group'] == "water") {
            if (mapStyle.isMultipolygonAsExpected(feature)) {
                var collected = []
                // gathering horizontal stripes
                var minLatitudeForStripe = minLatitude;
                while(minLatitudeForStripe < maxLatitude) {
                    var maxLatitudeForStripe =  minLatitudeForStripe + waterRowSizeInMeters / metersInDegree
                    var stripeRing = [
                        [minLongitude, minLatitudeForStripe],
                        [maxLongitude, minLatitudeForStripe],
                        [maxLongitude, maxLatitudeForStripe],
                        [minLongitude, maxLatitudeForStripe],
                        [minLongitude, minLatitudeForStripe],
                    ]
                    var stripe = [stripeRing]
                    console.warn(stripe)
                    var intersectedStripe = polygonClipping.intersection(feature.geometry.coordinates, stripe);
                    if(intersectedStripe != []) {
                      collected.push(intersectedStripe)
                    }
                    minLatitudeForStripe += (waterRowSizeInMeters + waterSpaceBetweenRowsInMeters) / metersInDegree
                }
                var generated = polygonClipping.union(...collected);

                cloned = JSON.parse(JSON.stringify(feature));
                cloned.geometry.coordinates = generated
                cloned.properties["lunar_assembler_cloned_for_pattern_fill"] = "yes"
                data_geojson.features.push(cloned) // added at the ned, and iterating from end to 0 so will not trigger infinite loop
             }
          }
          if(feature.properties['lunar_assembler_merge_group'] == "area:highway_carriageway_layer") {
            if (mapStyle.isMultipolygonAsExpected(feature)) {
                var collected = []
                // gathering horizontal stripes
                var minLatitudeForStripe = minLatitude;
                while(minLatitudeForStripe < maxLatitude) {
                    var maxLatitudeForStripe =  minLatitudeForStripe + waterRowSizeInMeters / metersInDegree
                    var stripeRing = [
                        [minLongitude, minLatitudeForStripe],
                        [maxLongitude, minLatitudeForStripe],
                        [maxLongitude, maxLatitudeForStripe],
                        [minLongitude, maxLatitudeForStripe],
                        [minLongitude, minLatitudeForStripe],
                    ]
                    var stripe = [stripeRing]
                    var intersectedStripe = polygonClipping.intersection(feature.geometry.coordinates, stripe);
                    if(intersectedStripe.length > 0) {
                      collected.push(intersectedStripe)
                    }
                    minLatitudeForStripe += (waterRowSizeInMeters + waterSpaceBetweenRowsInMeters) / metersInDegree
                }
                // spkit in pairs due to https://github.com/mfogel/polygon-clipping/issues/118
                var generatedHorizontal = polygonClipping.union(...collected);
                collected = []

                // gathering vertical stripes
                var minLongitudeForStripe = minLongitude;
                while(minLongitudeForStripe < maxLongitude) {
                    var maxLongitudeForStripe =  minLongitudeForStripe + waterRowSizeInMeters / metersInDegree
                    var stripeRing = [
                        [minLongitudeForStripe, minLatitude],
                        [maxLongitudeForStripe, minLatitude],
                        [maxLongitudeForStripe, maxLatitude],
                        [minLongitudeForStripe, maxLatitude],
                        [minLongitudeForStripe, minLatitude],
                    ]
                    var stripe = [stripeRing]
                    var intersectedStripe = polygonClipping.intersection(feature.geometry.coordinates, stripe);
                    if(intersectedStripe.length > 0) {
                      collected.push(intersectedStripe)
                    }
                    minLongitudeForStripe += (waterRowSizeInMeters + waterSpaceBetweenRowsInMeters) / metersInDegree
                }
                var generatedVertical = polygonClipping.union(...collected);
                var generated = polygonClipping.union(generatedHorizontal, generatedVertical);
                console.warn("road pattern follows")
                console.warn(generated)
                console.warn("road pattern above")

                cloned = JSON.parse(JSON.stringify(feature));
                cloned.geometry.coordinates = generated
                cloned.properties["lunar_assembler_cloned_for_pattern_fill"] = "yes"
                data_geojson.features.push(cloned) // added at the ned, and iterating from end to 0 so will not trigger infinite loop
             }
          }
        }
        return data_geojson;
    },
  }
  return mapStyle;
}
