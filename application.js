"use strict";

import Core from "./tools/core.js";
import Templated from "./components/templated.js";
import Map from "./ol/map.js";
import Style from "./tools/style.js"
import Scales from "./tools/scales.js";

/**
 * The Application module 
 * @module application
 * @extends Templated
 * @description For building the application
 */
export default class Application extends Templated {
  constructor(node, config) {
    super(node);

    this.config = config;

    this.numLayers = 0;

    this.LoadMap();

    this.LoadLayers();

    this.AddLayerSwitcher();
  }

  /**
   * @description Instantiate the map, set the view and add onClick events 
   */
  LoadMap() {
    this.map = new Map(this.Elem("map"), [
      Map.BasemapOSM(),
      Map.BasemapSatellite(true),
    ]);

    this.DeviceViewOfMap();

    this.map.On("click", this.onMap_Click.bind(this));
  }

  /**
   * @description Change the zoom level on the map
   * based on device (mobile or desktop)
   */
  DeviceViewOfMap() {
    let view = this.config.view;
    let mobileView = 4;
    let desktopView = 5;
    var isMobile = window.orientation > -1;
    isMobile ? this.map.SetView(view, mobileView) : this.map.SetView(view, desktopView);
  }

  /**
   * @description Load layers onto the map and style them
   * based on the configuration in application.json. If 
   * you're going to configure two layers to be visible at the
   * same time then don't forget that polygon layers should go 
   * underneath point layers.
   */
  LoadLayers() {
    // For when it takes too long to load layers
    this.Elem("wait").hidden = false;

    let layerName;

    for (layerName in this.config.layers) {

      let addedLayer = this.map.AddGeoJSONLayer(
        this.config.layers[layerName].id, 
        this.config.layers[layerName].shapeType,
        this.config.layers[layerName].url,
        this.config.layers[layerName].title
      );
      addedLayer.getSource().once("change", this.StyleLayers.bind(this));
    }
  }

  /**
   * 
   */
  StyleLayers() {
    let title = Object.keys(this.config.layers)[this.numLayers]
    let layerConfig = this.config.layers[title]
    let layer = this.map.layers[layerConfig.id];
    
    if (layerConfig.style.styleType == "default") {
      layer.setStyle(Style.GetStyle(layerConfig.shapeType, layerConfig.style));
    } else {
      // Scales.PointMarkerColorScale(layer.getSource().getFeatures());
      layer.setStyle(Style.GetStyle(layerConfig.shapeType, layerConfig.style));


      // layerConfig.style.scaleFn = Scales.ProportionScaleFn(layer.getSource().getFeatures());

      // layer.getSource().getFeatures().forEach(element => {
      //   layerConfig.style.scaleVal = layerConfig.style.scaleFn(element.getProperties().id);
      //   element.setStyle(Style.GetStyle(layerConfig.shapeType, layerConfig.style));
      // });


    }
    // Non default styles will need a legend
    layer.on('change:visible', this.GetLegend.bind(this));

    // NOTE: A legend won't be created if all layers stay true
    layer.set("visible", layerConfig.visible);

    // if (layer.getSource().getState()) {
    //   this.Elem("wait").hidden = true;
    // }

    this.numLayers += 1;
  }

  /**
   * @description Add a LayerSwitcher (control) to the map
   */
  AddLayerSwitcher() {
    const ls = new LayerSwitcher({
      reverse: true,
      groupSelectStyle: "group",
    });

    this.map.AddControl(ls);
  }

  // Handle legend based on which layer is visible?
  // Add by the visible layers and by identifiers
  // TODO: Hide legend by default?
  GetLegend() {
    this.Elem("wait").hidden = true;
    // Because we should start the legend from scratch each time
    this.map.RemoveControl(this.legend);

    this.legend = new ol.control.Legend({
      legend: new ol.legend.Legend({ 
        title: 'Legend',
        margin: 5
      }),
      collapsed: false,
    });
    this.map.AddControl(this.legend);

    Object.keys(this.map.layers).forEach( (id) => {
      // For each visible layer, see if a legend should be created
      let visible = this.map.layers[id].getVisible();
      let title = this.map.layers[id].getProperties().title;
      let style = this.config.layers[title].style;
      let tooManyThemes =
        (style.theme.choropleth != "") &&
        (style.theme.proportional != "") &&
        (style.theme.identified != "");

      // Default styled layers don't need a legend
      if (visible == false || style.styleType == "default") {
        return;
      } 
      // If the user has three themes then abort
      else if ( tooManyThemes ) {
        alert("One of your layers has more than 2 themes!\nPlease fix this in application.json.");
        return;
      }
      // Otherwise try to add each theme to the legend
      else {
        this.AddLegend(title, style)
      }
    })
  }

  AddLegend(title, style) {
    //"title + theme + legend"
    if(style.theme.choropleth != "") {
      this.AddChoroplethLegend(title, style);
    }

    if(style.theme.proportional != "") {
      this.AddProportionalLegend(title, style);
    }

    if(style.theme.identified != "") {
      this.AddIdentifiedLegend(title, style);
    }
  }

  AddChoroplethLegend(title, style) {
     var legend2 = new ol.legend.Legend({ 
      title: title + " Identified Legend",
      margin: 5
    });
    this.map.AddControl(new ol.control.Legend({
      legend: legend2,
      target: this.legend.element
    }));
    
    var formOne = { colorOne:3, colorTwo:4, colorThree: 5, colorFour: 10 };
    for (var i in formOne) {
      legend2.addItem({
        title: "colorrrrrrrrr",
        typeGeom: "Point",
        style: Style.CircleStyle([0, 255, 0, 0.5])
      });
    }
  }

  AddProportionalLegend(title, style) {
    var legend1 = new ol.legend.Legend({ 
      title: title + " Proportional Legend ",
      margin: 5
    });
    this.map.AddControl(new ol.control.Legend({
      legend: legend1,
      target: this.legend.element
    }));
    // TODO: Use domains for the title?
    var form = { sizeOne: 3, SizeTwo: 4, sizeThree: 5, sizeFour: 10 };
    for (var i in form) {
      legend1.addItem({
        title: "size",
        typeGeom: "Point",
        style: new ol.style.Style({
          image: new ol.style.Icon({ src: "../assets/icon.png", scale: 0.05 }),
        }),
      });
    }
  }

  AddIdentifiedLegend(title, style) {
     // Add a new one
     var legend2 = new ol.legend.Legend({ 
      title: title + " Identified Legend ",
      margin: 5
    });
    this.map.AddControl(new ol.control.Legend({
      legend: legend2,
      target: this.legend.element
    }));
    
    var formOne = { colorOne:3, colorTwo:4, colorThree: 5, colorFour: 10 };
    for (var i in formOne) {
      legend2.addItem({
        title: "colorrrrrrrrr",
        typeGeom: "Point",
        style: Style.CircleStyle([0, 255, 0, 0.5])
      });
    }
  }

  onMap_Click(ev) {
    this.ResetSelected();

    this.selected = ev.features.length > 0 ? ev.features[0] : null;

    if (this.selected) {
      this.HighlightSelected();

      let unformattedFields = this.config.layers[this.selected.layer].popup.unformatted;

      let formattedFields = this.config.layers[this.selected.layer].popup.formatted;

      let props = this.selected.feature.getProperties();

      let content = "<ul>";

      content += `<li style="font-weight: bold">${this.selected.layer}</li>`;

      for (let index = 0; index < formattedFields.length; index++) {
        let field = formattedFields[index];
        let key = unformattedFields[index];
        content += `<li>${field}: ${props[key]}</li>`;
      }

      content += "</ul>";

      this.map.ShowPopup(ev.coordinates, content);
    } else {
      this.map.ShowPopup(null);
    }
  }

  ResetSelected() {
    if (!this.selected) return;

    let style = this.ResetFeatureStyle(this.selected.feature)

    this.selected.feature.setStyle(style);
  }

  HighlightSelected() {
    if (!this.selected) return;

    let style = this.SetFeatureHighlightStyle(this.selected.feature)

    this.selected.feature.setStyle(style);
  }

  SetFeatureHighlightStyle() {
    let type = this.GetSelectedType();

    let json = this.config.layers[this.selected.layer].style;

    return Style.GetHighlightStyle(type, json);
  }

  ResetFeatureStyle(){
    let type = this.GetSelectedType();

    let json = this.config.layers[this.selected.layer].style

    return Style.GetStyle(type, json);
  }

  GetSelectedType() {
    return this.config.layers[this.selected.layer].shapeType
  }

  /**
   * Create a div for this widget
   * @returns {string} HTML with custom div
   */
  Template() {
    return (
      "<main handle='main'>" +
        "<div handle='map' class='map'>" +
          "<div id='wait' handle='wait' class='wait' hidden><img src='./assets/loading.gif'></div>" + 
        "</div>" +
      "</main>"
    );
  }
}
