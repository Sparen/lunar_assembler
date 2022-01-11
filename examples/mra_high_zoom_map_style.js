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
function mraHighZoomMapStyle() {
  var mapStyle = {
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
          (feature.properties["natural"] == null || feature.properties["natural"] == "water") &&
          feature.properties["landuse"] == null &&
          feature.properties["leisure"] == null
        ) {
          layer = feature.properties["layer"];
        }
      }

      if (railwayLinearValuesArray().includes(feature.properties["railway"])) {
        var priority = 0.99;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["area:highway"] != null) {
        var priority = 0.98;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["aeroway"] == "runway" || feature.properties["aeroway"] == "taxiway") {
        var priority = 0.94;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      if (feature.properties["highway"] != null) {
        var priority = 0.85;
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
      if (feature.properties["natural"] === "water" || feature.properties["waterway"] === "riverbank") {
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
      if (feature.properties["landuse"] != null || feature.properties["aeroway"] == "aerodrome") {
        //better higher and trigger layering problems quickly that have something failing ONLY in parks
        var priority = 0.02;
        return valueRangeForOneLayer * priority + valueRangeForOneLayer * layer;
      }
      return valueRangeForOneLayer * layer;
    },

    unifiedStyling() {
      returned = [];

      returned.push({
        line_color: "#DDDDDD",
        line_width: 2,
        description: "linear representation of a motorized road",
        matches: [
          { key: "highway", value: "secondary_link" },
          { key: "highway", value: "secondary" },
          { key: "highway", value: "primary_link" },
          { key: "highway", value: "primary" },
          { key: "highway", value: "trunk_link" },
          { key: "highway", value: "trunk" },
          { key: "highway", value: "motorway_link" },
          { key: "highway", value: "motorway" },
        ],
      });
      returned.push({
        line_color: "#DDDDDD",
        line_width: 1,
        description: "linear representation of a motorized road",
        matches: [
          { key: "highway", value: "busway" },
          { key: "highway", value: "residential" },
          { key: "highway", value: "tertiary_link" },
          { key: "highway", value: "tertiary" },
        ],
      });

      returned.push(
        ...[
          {
            area_color: "#CCDDFF",
            description: "water",
            matches: [
              { key: "natural", value: "water" },
            ],
          },
          {
            line_color: "#CCDDFF",
            line_width: 6,
            description: "linear representation of a river",
            matches: [{ key: "waterway", value: "river" }],
          },
          {
            line_color: "#CCDDFF",
            line_width: 4,
            description: "linear representation of a canal, assumed to be large",
            matches: [{ key: "waterway", value: "canal" }],
          },
          {
            area_color: "#88FFCC",
            description: "tree-covered land",
            matches: [
              { key: "natural", value: "wood" },
              { key: "landuse", value: "forest" },
            ],
          },
          {
            area_color: "#efdfef",
            description: "part of general military-industrial land",
            matches: [
              { key: "landuse", value: "industrial" },
              { key: "landuse", value: "railway" },
              { key: "landuse", value: "quarry" },
              { key: "landuse", value: "construction" },
              { key: "landuse", value: "military" },
              { key: "aeroway", value: "aerodrome" },
            ],
          },
          {
            area_color: "#c8facc",
            description: "recreation land",
            matches: [
              { key: "leisure", value: "park" },
              { key: "leisure", value: "pitch" },
              { key: "leisure", value: "playground" },
              { key: "landuse", value: "village_green" },
            ],
          },
          {
            area_color: "#CCCCCC",
            description: "bridge outline",
            matches: [{ key: "man_made", value: "bridge" }],
          },
          {
            line_color: "#F0A0F0",
            line_width: 5,
            description: "runway",
            matches: [{ key: "aeroway", value: "runway" }],
          },
          {
            line_color: "#F0A0F0",
            line_width: 2,
            description: "taxiway",
            matches: [{ key: "aeroway", value: "taxiway" }],
          },
        ]
      );
      return returned;
    },

    fillColoring(feature) {
      //console.log(feature);
      if (["Point"].includes(feature.geometry.type)) {
        //no rendering of points, for start size seems to randomly differ
        // and leaves ugly circles - see building=* areas
        return "none";
      }

      // more complex rules can be used here in addition - or instead of unified styling
      return getMatchFromUnifiedStyling(feature, "area_color", mapStyle.unifiedStyling());
    },

    strokeColoring(feature) {
      if (["Point"].includes(feature.geometry.type)) {
        //no rendering of points, for start size seems to randomly differ
        // and leaves ugly circles - see building=* areas
        return "none";
      }

      // more complex rules can be used here in addition - or instead of unified styling

      return getMatchFromUnifiedStyling(feature, "line_color", mapStyle.unifiedStyling());
    },

    strokeWidth(feature) {
      // more complex rules can be used here in addition - or instead of unified styling

      return getMatchFromUnifiedStyling(feature, "line_width", mapStyle.unifiedStyling());
    },

    mergeIntoGroup(feature) {
      // note that points and lines are not being merged!
      // only areas (including multipolygins) can be merged for now
      // please open an issue if you need it, it increaes chance of implementation a bit
      // or open pull request with an implementation
      if (motorizedRoadValuesArray().includes(feature.properties["area:highway"])) {
        return "area:highway_carriageway_layer" + feature.properties["layer"];
      }
      return null;
    },

    name(feature) {
      return feature.properties.name;
    },
  };
  return mapStyle;
}
