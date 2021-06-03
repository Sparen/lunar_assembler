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
          (feature.properties["natural"] == null || feature.properties["natural"] == "water") &&
          feature.properties["landuse"] == null &&
          feature.properties["leisure"] == null
        ) {
          layer = feature.properties["layer"];
        }
      }

      if (feature.properties["lunar_assembler_cloned_for_pattern_fill"] != undefined) {
        var priority = 0.48;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }

      if (feature.properties["lunar_assembler_step_segment"] != null) {
        var priority = 0.44;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }

      // further standard layering, even if most is not applicable
      // TODO: prune it? delete it? put water/buildings on top to
      // make mistakes more noticeable?
      if (mapStyle.railwayLinearValuesArray().includes(feature.properties["railway"])) {
        var priority = 0.40;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["area:highway"] != null) {
        var priority = 0.36;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["building"] != null && feature.properties["location"] != "underground") {
        var priority = 0.32;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["barrier"] != null) {
        var priority = 0.28;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["highway"] != null) {
        var priority = 0.24;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["barrier"] != null) {
        var priority = 0.20;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["man_made"] === "bridge") {
        var priority = 0.16;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["waterway"] != null) {
        /* render waterway lines under bridge areas */
        var priority = 0.12;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["natural"] === "water" || feature.properties["waterway"] === "riverbank") {
        // render natural=wood below natural=water
        var priority = 0.08;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["natural"] === "bare_rock") {
        // render natural=wood below natural=bare_rock
        // render water rather than underwater rocks
        var priority = 0.04;
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
      if (feature.properties["lunar_assembler_step_segment"] == "0") {
        return "#400080";
      }
      if (feature.properties["lunar_assembler_step_segment"] == "1") {
        return "magenta";
      }
      if (feature.properties["lunar_assembler_step_segment"] == "2") {
        return "#ff0000";
      }
      if (feature.properties["lunar_assembler_step_segment"] == "3") {
        return "#D33F6A";
      }
      if (feature.properties["area:highway"] == "steps") {
        // entire area of steps
        return "orange";
      }
      if (feature.properties["building"] != null) {
        return "#B45A00";
      }
      if (
        mapStyle.motorizedRoadValuesArray().includes(feature.properties["area:highway"]) ||
        feature.properties["area:highway"] === "bicycle_crossing" ||
        feature.properties["lunar_assembler_merge_group"] == "area:highway_carriageway_layer"
      ) {
        if (feature.properties["lunar_assembler_cloned_for_pattern_fill"] == "yes") {
          return "#808080";
        }
        return "#B4B4B4";
      }
      if (
        ["footway", "pedestrian", "path"].includes(feature.properties["area:highway"]) ||
        (feature.properties["highway"] == "pedestrian" && (feature.properties["area"] === "yes" || feature.properties["type"] === "multipolygon"))
      ) {
        return "green";
      }
      if (feature.properties["area:highway"] === "crossing") {
        return "yellow";
      }
      if (feature.properties["natural"] === "water" || feature.properties["waterway"] === "riverbank") {
        if (feature.properties["lunar_assembler_cloned_for_pattern_fill"] == "yes") {
          return "#00FFFF";
        }
        return "blue";
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
      if (mapStyle.railwayLinearValuesArray().includes(feature.properties["railway"])) {
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
        mapStyle.motorizedRoadValuesArray().includes(feature.properties["area:highway"]) ||
        feature.properties["area:highway"] === "bicycle_crossing" ||
        feature.properties["area:highway"] === "cycleway" ||
        feature.properties["amenity"] === "parking"
      ) {
        return "area:highway_carriageway_layer";
      }
      if (
        ["footway", "pedestrian", "path"].includes(feature.properties["area:highway"]) ||
        (feature.properties["highway"] == "pedestrian" && (feature.properties["area"] === "yes" || feature.properties["type"] === "multipolygon"))
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
      if (feature.properties["man_made"] == "bridge") {
        return "bridge_outline";
      }
      return null;
    },

    name(feature) {
      return feature.properties.name;
    },

    transformGeometryAsInitialStep(dataGeojson, readableBounds) {
      dataGeojson = programaticallyGenerateSymbolicStepParts(dataGeojson);
      return dataGeojson;
    },

    // called after areas were merged, before sorting of areas
    // gets full data and can freely edit it
    transformGeometryAtFinalStep(dataGeojson, readableBounds) {
      dataGeojson = mapStyle.eraseCrossingAreasFromRoads(dataGeojson);
      dataGeojson = mapStyle.eraseWaterWhereIntersectingBridge(dataGeojson);
      dataGeojson = mapStyle.applyPatternsToCarriagewaysAndWater(dataGeojson);
      return dataGeojson;
    },

    eraseCrossingAreasFromRoads(dataGeojson) {
      var roadArea = findMergeGroupObject(dataGeojson, "area:highway_carriageway_layer");
      if (roadArea === undefined) {
        console.warn("eraseCrossingAreasFromRoads - no road areas");
        return dataGeojson;
      }
      if (!isMultipolygonAsExpected(roadArea)) {
        console.error("following geometry was expected to be multipolygon but was not:");
        console.error(roadArea);
      }
      var i = dataGeojson.features.length;
      while (i--) {
        var feature = dataGeojson.features[i];
        if (feature.properties["area:highway"] === "crossing") {
          roadArea.geometry.coordinates = polygonClipping.difference(roadArea.geometry.coordinates, feature.geometry.coordinates);
        }
      }
      return dataGeojson;
    },

    eraseWaterWhereIntersectingBridge(dataGeojson) {
      var water = findMergeGroupObject(dataGeojson, "water");
      if (water === undefined) {
        // no reason to suspect issues
        // nothing to remove
        return dataGeojson;
      }
      if (!isMultipolygonAsExpected(water)) {
        console.error("following geometry was expected to be multipolygon but was not:");
        console.error(water);
      }

      var bridgeArea = findMergeGroupObject(dataGeojson, "bridge_outline");
      if (bridgeArea === undefined) {
        // no reason to suspect issues
      } else {
        if (!isMultipolygonAsExpected(bridgeArea)) {
          console.error("following geometry was expected to be multipolygon but was not:");
          console.error(bridgeArea);
        }
        water.geometry.coordinates = polygonClipping.difference(water.geometry.coordinates, bridgeArea.geometry.coordinates);
      }

      var footwayArea = findMergeGroupObject(dataGeojson, "area:highway_footway");
      if (footwayArea === undefined) {
        // no reason to suspect issues
      } else {
        if (!isMultipolygonAsExpected(footwayArea)) {
          console.error("following geometry was expected to be multipolygon but was not:");
          console.error(footwayArea);
        }
        water.geometry.coordinates = polygonClipping.difference(water.geometry.coordinates, footwayArea.geometry.coordinates);
      }

      return dataGeojson;
    },

    applyPatternsToCarriagewaysAndWater(dataGeojson) {
      // applied pattern is set of square holes, regularly spaced in a grid
      // it is intended to be used in a laser cutter that will burn are outside such exempt holes, producing a clear pattern
      // repeating pattern on grid of size 1m seems to work well, with hole 40cm sized and burned are 60cm wide
      // in created pattern it was 1mm for hole and 1.5 mm for space between giles

      // Returns BBox bbox extent in [minX, minY, maxX, maxY] order
      var kilometers = { units: "kilometers" };

      bbox = turf.bbox(dataGeojson);
      var minLongitude = bbox[0];
      var minLatitude = bbox[1];
      var maxLongitude = bbox[2];
      var maxLatitude = bbox[3];
      var from = turf.point([bbox[0], bbox[1]]); // turf.point(longitude, latitude, properties)
      var to = turf.point([bbox[2], bbox[3]]);
      var distanceInMeters = turf.distance(from, to, kilometers) * 1000;

      var from_horizontal = turf.point([minLongitude, minLatitude]); // turf.point(longitude, latitude, properties)
      var to_horizontal = turf.point([maxLongitude, minLatitude]);
      var distanceHorizontalInMeters = 1000 * turf.distance(from_horizontal, to_horizontal, kilometers);
      var distanceHorizontalInDegrees = maxLongitude - minLongitude;
      var metersInDegreeHorizontal = distanceHorizontalInMeters / distanceHorizontalInDegrees;

      var from_vertical = turf.point([minLongitude, minLatitude]); // turf.point(longitude, latitude, properties)
      var to_vertical = turf.point([minLongitude, maxLatitude]);
      var distanceVerticalInMeters = 1000 * turf.distance(from_vertical, to_vertical, kilometers);
      var distanceVerticalInDegrees = maxLatitude - minLatitude;
      var metersInDegreeVertical = distanceVerticalInMeters / distanceVerticalInDegrees;

      const roadHoleSizeInMeters = 0.3;
      const holeVerticalInMeters = roadHoleSizeInMeters;
      const holeHorizontalInMeters = roadHoleSizeInMeters;
      const roadSpaceBetweenInMeters = 0.45;
      const spaceVerticalInMeters = roadSpaceBetweenInMeters;
      const spaceHorizontalInMeters = roadSpaceBetweenInMeters;

      const waterSpaceBetweenRowsInMeters = 0.3;
      const waterRowSizeInMeters = 0.3;

      // generate pattern for road surface by intersecting it with a prepared pattern
      var i = dataGeojson.features.length;
      while (i--) {
        var feature = dataGeojson.features[i];
        if (feature.properties["lunar_assembler_merge_group"] == "water") {
          var generated = intersectGeometryWithHorizontalStripes(feature, waterRowSizeInMeters / metersInDegreeHorizontal, waterSpaceBetweenRowsInMeters / metersInDegreeHorizontal);
          generated.properties["lunar_assembler_cloned_for_pattern_fill"] = "yes";
          dataGeojson.features.push(generated); // added at the ned, and iterating from end to 0 so will not trigger infinite loop
        }
        console.warn(feature.properties["lunar_assembler_merge_group"]);
        if (feature.properties["lunar_assembler_merge_group"] == "area:highway_carriageway_layer") {
          var generated = intersectGeometryWithPlaneHavingRectangularHoles(
            feature,
            holeVerticalInMeters / metersInDegreeVertical,
            holeHorizontalInMeters / metersInDegreeHorizontal,
            spaceVerticalInMeters / metersInDegreeVertical,
            spaceHorizontalInMeters / metersInDegreeHorizontal
          );
          generated.properties["lunar_assembler_cloned_for_pattern_fill"] = "yes";
          dataGeojson.features.push(generated); // added at the ned, and iterating from end to 0 so will not trigger infinite loop
        }
      }
      return dataGeojson;
    },
  };
  return mapStyle;
}
