/*

Copyright (c) 2009, The OpenGeoGroep

info@opengeogroep.nl
http://www.opengeogroep.nl
 * 
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
 * Neither the name of the OpenGeoGroep nor the names of its contributors 
      may be used to endorse or promote products derived from this software 
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

 */

Ext.namespace("OpenGeoGroep.framework");

/**
 * api: constructor .. class:: WMSCapabilitiesBrowser(config)
 * 
 * A panel showing all layers for an expandable list of WMS services. The
 * browser can be attached to a GeoExt MapPanel and allows the user to toggle
 * individual layers
 */
OpenGeoGroep.framework.WMSCapabilitiesBrowser = Ext
    .extend(
        Ext.tree.TreePanel,
        {
            mapPanel : null,
            initComponent : function() {
                var options = {
                    services : new Array(),
                    autoScroll : true,
                    title : this.txtTitle,
                    rootVisible : false,
                    frame : false,
                    root : new Ext.tree.TreeNode( {
                        text : this.txtRootNode,
                        expanded : true
                    })
                };

                Ext.apply(this, options);

                OpenGeoGroep.framework.WMSCapabilitiesBrowser.superclass.initComponent
                .call(this);
            },
            addService : function(p_config) {
                var newNode;
                var browser = this;

                /*******************************************************
						 * Callback function when the user toggles the checkbox
						 * for a layer
						 */
                var nodeCheckChange = function(node, checked) {
                    /***
							 * If we are not a leaf we want all child nodes visible and toggled
							 */
                    if(!node.leaf) {
                        node.expand(false,
                            false,
                            function(node) {
                                node.eachChild(function(node) {
                                    node.getUI().toggleCheck();
                                });
                            });
								
                        return;
                    }
							
                    /***
							 * Otherwise continue in normal fashion
							 */
                    var store = node.parentNode.attributes.store;
                    var record = store
                    .getById(node.attributes.recordId);

                    // If there is a record, either add it or show it
                    if (record) {
                        var layer = GeoViewer.main.getMap().getLayer(record.id);

                        if (layer != null) {
                            GeoViewer.main.getMap().removeLayer(layer);
                        } else {
                            layer = record.get("layer");
                            layer.addOptions(p_config.layerProperties);
                            layer.id = record.id;
                            GeoViewer.main.getMap().addLayer(layer);
                        }
                    } else {
                        Ext.Msg.alert(this.txtWarning, this.txtNoMatch)
                    }
                }

                /*******************************************************
						 * Callback function when the store has finished loading
						 * without errors.
						 */
                var storeLoad = function(store, records, options) {
                    // Inform user when GetCapabilities returned no
                    // layers
                    if (records.length == 0) {
                        var layerNode = {
                            text : this.txtNoLayersAvailable,
                            disabled : true,
                            leaf : true
                        }

                        newNode.appendChild(layerNode);
                    }

                    var appendLayer = function(record, parent) {
                        // 27nov2009 bartvde, set queryable directly on the layer object
                        if (record.get('layer') !== null) {
                            record.get('layer').queryable = record.get('queryable');
                        }
                        var nodeConfig = {
                            text : record.get("title"),
                            leaf : !record.get("childLayers"),
                            children : [],
                            listeners : {
                                "checkchange" : nodeCheckChange,
                                "beforeexpand" : function(node) {
                                    // Avoid duplicate layers under this node
                                    if(node.childNodes.length > 0) {
                                        return;
                                    }
											
                                    var data = store
                                    .queryBy(function(record) {
                                        return record
                                        .get("parent") == node.attributes.recordId;
                                    });

                                    data.each(function(item, index,
                                        length) {
                                        appendLayer(item, node)
                                    });
                                }
                            }
                        }

                        // get startLayer name from services.js properties, make visible if this layer has this name
                        nodeConfig.checked = (record.get("title") === ogg.startLayer);

                        layerNode = parent.appendChild(nodeConfig);

                        layerNode.attributes.store = store;
                        layerNode.attributes.recordId = record.id;

                        if (layerNode.attributes.checked) {
                            layerNode.fireEvent("checkchange",
                                layerNode, true);
                        }
                    }

                    /***************************************************
							 * A kaartenbalie specific work-around.
							 * 
							 * Because all GetCapabilities traffic passes via
							 * kaartenbalie this adds an extra node we do not
							 * need in the browser. The code below tests if this
							 * node is present and adds it's child nodes
							 * directly, otherwise we just add the node.
							 */
                    var records = store.queryBy(function(record) {
                        return record.get("parent") == undefined;
                    });

                    if (records.getCount() == 1) {
                        records = store.queryBy(function(record) {
                            return record.get("parent") == records
                            .first().id;
                        });
                    }

                    records.each(function(item, index, length) {
                        appendLayer(item, newNode)
                    });
                }

                /*
                 * Callback function in case of an exception while
                 * loading the store.
                 *
                 * Depending on the scenario we inform the user about
                 * this via the GUI.
                 */
                var storeException = function(proxy, type, action,
                    options, response, arg) {
                    var nodeText;

                    if (response.status == 200) {
                        nodeText = OpenGeoGroep.framework.WMSCapabilitiesBrowser.prototype.txtInvalidResponse;
                    } else {
                        if (response.isTimeout) {
                            nodeText = OpenGeoGroep.framework.WMSCapabilitiesBrowser.prototype.txtServerUnreachable;
                        } else {
                            nodeText = OpenGeoGroep.framework.WMSCapabilitiesBrowser.prototype.txtResponseCorrupt;
                        }
                    }

                    var layerNode = {
                        text : nodeText,
                        disabled : true,
                        leaf : true
                    }

                    newNode.appendChild(layerNode);
                }

                var doExpand = (p_config.expanded != undefined) ? p_config.expanded
                : false;

                var configURL = (OpenLayers.ProxyHost.length > 0) ? OpenLayers.ProxyHost
                + escape(p_config.url)
                : p_config.url

                var nodeConfig = {
                    text : p_config.description,
                    leaf : false,
                    expanded : doExpand,
                    store : new GeoExt.data.WMSCapabilitiesStore( {
                        autoLoad : false,
                        url : configURL,
                        listeners : {
                            "load" : storeLoad,
                            "exception" : storeException
                        }
                    }),
                    children : [],
                    listeners : {
                        "beforeexpand" : function(node) {
                            // If the node does not have children, we
                            // load the store
                            if (node.childNodes.length == 0) {
                                this
                                .setIcon("./lib/extjs/resources/images/default/tree/loading.gif");
                                this.attributes.store.load();
                            }
                        }
                    }
                }

                newNode = this.root.appendChild(nodeConfig);
            }
        });
