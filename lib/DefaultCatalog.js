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

/*
About Catalog.js: The purpose of this file is to configure basic values
that are used throughout the web client.

Items configured in this file are:
+ Map properties like extent and projection.
+ URLs of data sources.
+ Map layers.
+ Text strings for communication with the user, in multiple languages.

For specific purposes (example applications), other items can be configured
too, using the GeoViewer.Catalog namespace.
*/
 
Ext.BLANK_IMAGE_URL = 'resources/images/s.gif';

OpenLayers.Util.onImageLoadErrorColor = "transparent";
OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
Ext.namespace("GeoViewer.Map");
GeoViewer.Map.options = {
    PROJECTION: 'EPSG:28992',
    UNITS: 'm',
    RESOLUTIONS: [860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
    MAX_EXTENT: new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 683200.96),
    TILE_ORIGIN: new OpenLayers.LonLat(-65200.96, 242799.04),
    CENTER: new OpenLayers.LonLat(155000, 463000),
    XY_PRECISION: 3,
    ZOOM: 2
};
Ext.namespace("GeoViewer.Catalog");
GeoViewer.Catalog.urls = {
    KNMI_WMS_RADAR:  'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
    TILECACHE:  'http://gis.kademo.nl/cgi-bin/tilecache.cgi?'
};

/*
 * ==================================
 *            BaseLayers
 * ==================================
 */
GeoViewer.Catalog.BaseLayers = {
    osm: new OpenLayers.Layer.WMS(
        "OpenStreetMap",
        GeoViewer.Catalog.urls.TILECACHE,
        {
            layers: "osm",
            format: "image/png",
            transparent: false,
            bgcolor: "0x99b3cc"
        },

        {
            singleTile: false,
            visibility: false,
            attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
        }
        ),
    nlr_dkln2006: new OpenLayers.Layer.WMS(
        "NLR - dkln2006",
        "http://gdsc.nlr.nl/wms/dkln2006?service=WMS&version=1.1.1",
        {
            layers: "dkln2006-1m",
            format: "image/png",
            transparent: false,
            bgcolor: "0x99b3cc"
        },

        {
            singleTile: false,
            visibility: false,
            attribution: "&copy; <a href='http://www.dkln.com/'>2006 Eurosense DKLN</a>"
        }
        )
};

/*
 * ==================================
 *            OVERLAYS
 * ==================================
 */
GeoViewer.Catalog.Overlays = {
    knmi_radar_color: new OpenLayers.Layer.WMS("KNMI - Radar",
        GeoViewer.Catalog.urls.KNMI_WMS_RADAR,
        {
            'layers': 'RADNL_OPER_R___25PCPRR_L3_COLOR',
            'format': 'image/png',
            transparent: true
        },

        {
            singleTile: true,
            visibility: false
        }
        ),
    mdk_adr: new OpenLayers.Layer.WMS("Maasdonk - adressen",
        "http://pggemmdk:8080/geoserver/wms?",
        {
            'layers': 'adressen',
            'format': 'image/png',
            transparent: true
        },

        {
            singleTile: true,
            visibility: false,
            featureInfoFormat: 'application/vnd.ogc.gml'

        }
        ),
    mdk_perc: new OpenLayers.Layer.WMS("Maasdonk - kadaster",
        "http://pggemmdk:8080/geoserver/wms?",
        {
            'layers': 'kadastraal',
            'format': 'image/png',
            transparent: true
        },

        {
            singleTile: true,
            visibility: false,
            featureInfoFormat: 'application/vnd.ogc.gml'

        }
        ),
    mdk_gbk: new OpenLayers.Layer.WMS("Maasdonk - GBKN",
        "http://pggemmdk:8080/geoserver/wms?",
        {
            'layers': 'gbkn',
            'format': 'image/png',
            transparent: true
        },

        {
            singleTile: true,
            visibility: false,
            featureInfoFormat: 'application/vnd.ogc.gml'

        }
        ),
    mdk_verkeer: new OpenLayers.Layer.WMS("Maasdonk - verkeer",
        "http://pggemmdk:8080/geoserver/wms?",
        {
            'layers': 'weg_verkeerbelasting',
            'format': 'image/png',
            transparent: true
        },

        {
            singleTile: true,
            visibility: false,
            alpha:true,
            opacity: 0.7,
            featureInfoFormat: 'application/vnd.ogc.gml'
        }
        )


};

/*
 * ==================================
 *            Contexts/Shortcuts
 * ==================================
 */
GeoViewer.contexts =
    [

    {
        id: 'sk1',
        name: 'Nuland',
        desc: 'Nuland',
        layers: ['OpenStreetMap'],
        x: 158247,
        y: 415385,
        zoom: 8
    },
    {
        id: 'sk2',
        name: 'Geffen',
        desc: 'Geffen',
        layers: ['OpenStreetMap'],
        x: 160145,
        y: 417048,
        zoom: 8
    },
    {
        id: 'sk3',
        name: 'Maren, Maren-Kessel',
        desc: 'Maren, Maren-Kessel',
        layers: ['OpenStreetMap'],
        x: 155026,
        y: 422924,
        zoom: 8
    },
    ];

Ext.namespace("ogg");

ogg.maxFeatures = 10;

// layer to start with:
ogg.startLayer = 'nederland';

ogg.services = Array();

ogg.services.push({
  description : "lokale geoserver",
  url: "http://www.dogodigi.com/geoserver/ows?request=GetCapabilities&service=WMS&version=1.1.1",
  expanded : true,
  layerProperties : {
		singleTile : false
	}
});

ogg.services.push({
  description : "Nieuwe kaart",
  url: "http://webservice.nieuwekaart.nl/cgi-bin/nkn?REQUEST=GetCapabilities&SERVICE=WMS"
});