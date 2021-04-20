# Lunar assembler

SVG maps from OpenStreetMap data in browser.

Fully functional example is at [mapsaregreat.com/osm_to_svg_in_browser/](https://mapsaregreat.com/osm_to_svg_in_browser/)

Lunar assembler is a JS library allowing easy setup of static websites allowing this (thank to amazing Overpass API).

Code used to run mentioned example can be found in example folder.

## In action

![examples/lunar_assembler_in_action.gif](examples/lunar_assembler_in_action.gif)

## Potential uses

SVG files may be much more accessible for futher processing than alternatives formats of OSM data.

SVG files may be directly usable for some purposes, for example in laser cutters.

## Mentions of use are welcome

In case that you used this code or it inspired you to do something - feel free to create an issue with photo/description of what was produced! Or send an email to [matkoniecz@tutanota.com](mailto:matkoniecz@tutanota.com). It would be nice to have confirmation that publishing it was useful for somebody.

## Improving documentation

Please create a new issue if you want to use it but current instructions are insufficient, wrong or can be in some way improved!

I know that documentation may be far better, but I am not sure what kind of additional documentation would be most useful.

## Alternatives

As usual [OSM Wiki documentation](https://wiki.openstreetmap.org/wiki/SVG#Ways_to_create_an_SVG_map_from_OpenStreetMap) is useful.

## Published

[dev version served from this repo](https://matkoniecz.github.io/lunar_assembler/examples/dev.html)


[dev version of a laser map style is also served from this repo](https://matkoniecz.github.io/lunar_assembler/examples/dev-laser.html)

[current release and (for now only known use of it)](https://mapsaregreat.com/osm_to_svg_in_browser/)

## Skipped and rejected features

Note that it is basically impossible to make SVGs that would qualify as high-quality cartography here. As reason why this project exists does not require it (generation of laser cutter designs) it was not considered during design and implementation. But feel free to open issues and create pull requests to add missing functionality!

### Example map style

Exact duplicates of more popular standard tags will not be supported (for example `landcover=water` or `landcover=trees`).

`landuse=reservoir`, `landuse=depot` will not be supported due to being a bad tagging schemes.

Note that making own website with own map style should be relatively easy and anyone interested is able to make their own map style.

Please open an issue if you wanted to do this but you are stuck.

## Sponsors

<a href="https://osmfoundation.org/"><img src="images_for_description/logo_osmf.png" height="100"/></a><br/>

The [OpenStreetMap foundation](https://wiki.osmfoundation.org/wiki/Main_Page) was funding the development of this project in their first round of the [microgrant program](https://wiki.osmfoundation.org/wiki/Microgrants) in 2020. It was done as part of making [tactile maps based on OpenStreetMap data, for blind or visually impaired children](https://wiki.openstreetmap.org/wiki/Microgrants/Microgrants_2020/Proposal/Tactile_maps_for_blind_or_visually_impaired_children) (part of making used tools accessible to other and OpenStreetMap promotion).

If anyone else is also interested in supporting this project via funding - [let me know](mailto:osm-messages@etutanota.com) (opening a new issue is also OK) and it is likely that some way of doing that can be found :)
