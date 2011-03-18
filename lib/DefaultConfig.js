/*
 * Copyright (C) 2010  Het Kadaster
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.namespace("GeoViewer.Map");

/*
 * Settings for the Netherlands. These should be moved, the current situation where the viewer
 * Needs to be configured by manipulating two files: Catalog and Config is unwanted.
 * TODO: convert into one
 */

GeoViewer.lang = GeoViewer.Catalog.lang.nl;
GeoViewer.Map.options = GeoViewer.Catalog.optionsRD;

GeoViewer.layout = {
    center : {
        options : {
            layout: 'border',
            width: '100%',
            collapsible: true,
            split	: true,
            border: false
        },
        panels: [
        {
            type: 'gv-map',
            options: {
                region: 'center',
                collapsible : false,
                border: false
            }
        },
        {
            type: 'gv-feature-info',
            options: {
                region : "south",
                border : true,
                collapsible : true,
                collapsed : true,
                height : 205,
                split : true,
                maxFeatures	: 10
            }
        }
        ]
    },
    west : {
        options : {
            layout: 'accordion',
            width: 240,
            collapsible: true,
            split	: true,
            border: false
        },
        panels: [
        {
            type: 'gv-search'
        },
        {
            type: 'gv-layer-browser'
        },

        {
            type: 'gv-context-browser'
        },
        {
            type: 'gv-layer-legend'
        }
        ]
    }
};



/** Collect layers from catalog. */

GeoViewer.Map.layers = [];

/*
 * ==================================
 *            BaseLayers
 * ==================================
 */
for (var BaseLayerKey in GeoViewer.Catalog.BaseLayers) {
    if (GeoViewer.Catalog.BaseLayers.hasOwnProperty(BaseLayerKey)) {
        GeoViewer.Catalog.BaseLayers[BaseLayerKey].setIsBaseLayer(true);
        GeoViewer.Map.layers.push(GeoViewer.Catalog.BaseLayers[BaseLayerKey]);
    }
}

/*
 * ==================================
 *            OVERLAYS
 * ==================================
 */
for (var OverlayKey in GeoViewer.Catalog.Overlays) {
    if (GeoViewer.Catalog.Overlays.hasOwnProperty(OverlayKey)) {
        GeoViewer.Catalog.Overlays[OverlayKey].setIsBaseLayer(false);
        GeoViewer.Map.layers.push(GeoViewer.Catalog.Overlays[OverlayKey]);
    }
}

// See ToolbarBuilder.js : each string item points to a definition
// in GeoViewer.ToolbarBuilder.defs. Extra options and even an item create function 
// can be passed here as well.
GeoViewer.Map.toolbar = [
{
    type: "featureinfo"
},
{
    type: "-"
} ,
{
    type: "pan"
},
{
    type: "zoomin"
},
{
    type: "zoomout"
},
{
    type: "zoomvisible"
},
{
    type: "-"
} ,
{
    type: "zoomprevious"
},
{
    type: "zoomnext"
},
{
    type: "-"
},
{
    type: "measurelength"
},
{
    type: "measurearea"
}
];
