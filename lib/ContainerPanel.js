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

Ext.namespace("GeoViewer");

/**
 * Panel that creates and contains other Panels.
 */
GeoViewer.ContainerPanel = Ext.extend(
		Ext.Panel,
{
	createFeatureInfoPanel : function(options) {
		return new GeoViewer.FeatureInfoPanel(options);
	},

	createFeatureDataPanel : function(options) {
		return new Ext.TabPanel(options);
	},

	createHTMLPanel : function(options) {

		if (options.url) {
			options.autoLoad = {url: options.url}
		}

		options.listeners = {
			show: function() {
				this.loadMask = new Ext.LoadMask(this.body, {
					msg: GeoViewer.lang.txtLoading
				});
			}
		};

		return new Ext.Panel(options);
	},

	createLayerBrowserPanel : function(options) {
		var treeConfig;

		if (options && options.tree) {
			treeConfig = options.tree;
		} else {
			treeConfig = [
				{
					nodeType: "gx_baselayercontainer",
					expanded: true
				},
				{
					nodeType: "gx_overlaylayercontainer",
					loader: {
						baseAttrs: {
							uiProvider: "layerNodeUI"
						}
					}
				}
			]
		}

		// using OpenLayers.Format.JSON to create a nice formatted string of the
		// configuration for editing it in the UI
		treeConfig = new OpenLayers.Format.JSON().write(treeConfig, true);

		return new Ext.tree.TreePanel({
			id: "gv-layer-browser",
			border: true,
			title : GeoViewer.lang.txtLayers,
			// collapseMode: "mini",
			autoScroll: true,
			loader: new Ext.tree.TreeLoader({
				// applyLoader has to be set to false to not interfer with loaders
				// of nodes further down the tree hierarchy
				applyLoader: false,
				uiProviders: {
					"layerNodeUI": GeoExt.tree.LayerNodeUI
				}
			}),
			root: {
				nodeType: "async",
				// the children property of an Ext.tree.AsyncTreeNode is used to
				// provide an initial set of layer nodes. We use the treeConfig
				// from above, that we created with OpenLayers.Format.JSON.write.
				children: Ext.decode(treeConfig)
			},
			rootVisible: false,
			headerCls : 'gv-header-text',
			enableDD: true,
			lines: false
		});
	},

	createLayerLegendPanel : function() {
	
		return new GeoExt.LegendPanel({
			id: 'gv-layer-legend',
			labelCls: 'mylabel',
			title		: GeoViewer.lang.txtLegend,
			/* This allows optional suppression of WMS GetLegendGraphic that may be erroneous (500 err) for a Layer, fixes issue 3 */
			filter : function(record) {
				return !record.get("layer").noLegend;
			},
			bodyStyle: 'padding:5px',
			defaults   : {
				useScaleParameter : false
			}
		});
	},

	createSearchPanel : function(options) {
		//TODO: make this more flexible
                var paramString;
                var searchTitle;
                var autoCompleteUrl;
                var searchUrl;
                if (options && options.title) {
                    searchTitle = options.title;
		} else {
                    searchTitle = GeoViewer.lang.txtSearch;
                }
                if (options && options.autoCompleteURL) {
                    autoCompleteUrl = options.autoCompleteURL;
		} else {
                    autoCompleteUrl = 'http://research.geodan.nl/esdin/autocomplete/complete.php';
                }
                if (options && options.searchURL) {
                    searchUrl = options.searchURL;
		} else {
                    searchUrl = "http://pggemmdk:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=json&";
                }

		var ds = new Ext.data.Store({
			proxy: new Ext.data.ScriptTagProxy({
				url: autoCompleteUrl
			}),
			reader: new Ext.data.JsonReader({
				root: 'data'
			},[
				{name: 'id', type: 'string'},
				{name: 'name', type: 'string'},
				{name: 'quality', type: 'string'}
			])
		});

		return new Ext.form.FormPanel({
			title: searchTitle,
			id: 'searchform',
			frame:true,
			items: [
				new Ext.form.TextField({
					id: 'straat',
					fieldLabel: 'Straat',
					allowBlank: false,
					blankText: "Geef een (deel van een) straatnaam bijv. Doc% of Elst"
				}),
                                new Ext.form.TextField({
					id: 'huisnr',
					fieldLabel: 'Huisnummer',
					allowBlank: false,
					blankText: "Geef een huisnummer op!"
				}),
                                new Ext.form.TextField({
					id: 'toev',
					fieldLabel: 'Toevoeging',
					allowBlank: true
				})
			],
			buttons: [
				{text:"search",
				type:'submit',
				method:'POST',
				url:searchUrl,
				formBind: true,
				handler: function(){
                                    var searchValues =  Ext.getCmp('searchform').getForm().getValues();
                                    paramString = "INDAUTHENT='J' AND STRAATNAAM LIKE '" + searchValues.straat +
                                        "' AND HUISNUMMER =" + searchValues.huisnr;
                                    if (searchValues.toev !== ""){
                                        paramString += " AND (HUISLETTER = '" + searchValues.toev.toLowerCase() +
                                        "' or TOEVOEGING LIKE '" + searchValues.toev + "')";
                                    }
                                    Ext.Ajax.request({
					url:searchUrl,
					method: 'POST',
					params:{'cql_filter':paramString, 'typename': 'maasdonk:adressen'},
					success:function(response,request) {
						var jsonData = Ext.util.JSON.decode(response.responseText);
						var aform = Ext.getCmp('searchform').getForm();
						var searchResultHTML = "";
						Ext.iterate(jsonData.features,function(feature){
								var huisletter = feature.properties.HUISLETTER != null ? feature.properties.HUISLETTER : "";
								var toevoeging = feature.properties.TOEVOEGING != null ? feature.properties.TOEVOEGING : "";
								searchResultHTML += '<a onclick="GeoViewer.main.getMap().setCenter(new OpenLayers.LonLat(' + 
									feature.geometry.coordinates[0] + ',' + 
									feature.geometry.coordinates[1] + '),10);">';
								searchResultHTML += feature.properties.STRAATNAAM + ' ' + feature.properties.HUISNUMMER + ' ' + 
									huisletter + ' ' + toevoeging + ' (' + 
									feature.properties.POSTCODE + ') ' + feature.properties.WOONPLAA_1 + 
									'</a><br>';
							});
						var win;
						if(!Ext.getCmp('searchresultwin')){
							win = new Ext.Window({  
								title: 'Zoekresultaat',  
								id: 'searchresultwin',
								width: 300,  
								height:250,  
								minimizable: false, //show the minimize button  
								maximizable: false, //show the maximize button  
								//modal: true, //set the Window to modal  
								x: 100, //specify the left value of the window  
								y: 100 //specify the top value of the window  
							});
						} else {
						 win = Ext.getCmp('searchresultwin');
						}
						win.html = searchResultHTML;
						win.show(); 
						},
					failure: function(response,request){
						alert(response);
						}
					})
				}}
			]
			

	   });
	},

	createMapPanel : function(options) {
		return new GeoViewer.MapPanel(options);
	},

	createContextBrowserPanel : function() {
		var options = {};
		options.id = 'gv-context-browser';
		options.title = GeoViewer.lang.txtMapContexts;

		options.html = '<div class="gv-html-panel-body">';

		var contexts = GeoViewer.contexts;
		for (var i = 0; i < contexts.length; i++) {
			options.html += '<a href="#" title="' + contexts[i].desc + '" onclick="GeoViewer.main.setMapContext(\'' + contexts[i].id + '\'); return false;">' + contexts[i].name + '</a><br/>';
		}

		options.html += '</div>';

		return this.createHTMLPanel(options);
	},

	/**
	 * Factory method: create new Panel by type with options.
	 *
	 * @param type a Panel type gv-*
	 * @param options optional options to pass to Panel constructor
	 */
	createPanel : function(type, options) {
		switch (type) {
			case 'gv-context-browser':
				return this.createContextBrowserPanel();

			case 'gv-feature-info':
				return this.createFeatureInfoPanel(options);

			case 'gv-feature-data':
				return this.createFeatureDataPanel(options);

			case 'gv-html':
				// Standard HTML Panel
				return this.createHTMLPanel(options);

			case 'gv-layer-browser':
				return this.createLayerBrowserPanel(options);

			case 'gv-layer-legend':
				return this.createLayerLegendPanel();

			case 'gv-search':
				return this.createSearchPanel(options);

			case 'gv-map':
				return this.createMapPanel(options);

			case 'gv-user':
				// User-defined panel: anything goes
				return GeoViewer.User.createPanel(options);
		}
	},

	/**
	 * Constructor: create and layout Panels from config.
	 */
	initComponent : function() {
		Ext.apply(this, this.config.options);

		GeoViewer.ContainerPanel.superclass.initComponent.apply(this, arguments);

		var panels = this.config.panels;
		for (var i = 0; i < panels.length; i++) {
			this.add(this.createPanel(panels[i].type, panels[i].options));
		}
	}
});

