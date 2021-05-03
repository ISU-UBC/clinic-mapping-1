export default class Style {
  static GetStyle(type, json) {
    if(json.styleType == "default") {
      if (type == "point") return this.DefaultPointStyle(json);

      if (type == "polygon") return this.DefaultPolygonStyle();
    } else {
      if (type == "point") return this.PointStyle(json);

      if (type == "polygon") return this.PolygonStyle(json);
    }
    
  }

  static DefaultPolygonStyle() {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(100,100,180,0.7)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(255,255,255,1)",
        width: 1,
      }),
    });
  }

  static DefaultPointStyle(json) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        src: json.icon,
        color: "rgba(255, 255, 225, 0.6)",
        opacity: 0.75,
        scale: 0.05,
      }),
    });
  }

  static PolygonStyle(json) {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: json.strokeColor,
        width: 1,
      }),
      fill: new ol.style.Fill({
        color: json.color,
      }),
    });
  }

  static PointStyle(json) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        src: json.icon,
        color: json.color,
        opacity: 0.75,
        scale: this.StyleFunction(json.scale, json.scaleFn, json.scaleVal),
      }),
    });
  }

  static StyleFunction(style, styleFn, scaleVal) {
    if (styleFn != null) {
      return styleFn(scaleVal);
    } else {
      return style;
    }
  }

  static GetHighlightStyle(type, json) {
    if (type == "point") return this.PointHighlightStyle(json);

    if (type == "polygon") return this.PolygonHighlightStyle();
  }

  static PolygonHighlightStyle() {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(0,200,200,0.6)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(0,255,255,1)",
        width: 1,
      }),
    });
  }

  static PointHighlightStyle(json) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        src: json.icon,
        color: "rgba(0, 255, 225, 0.6)",
        scale: 0.10,
      }),
    });
  }

  static CircleStyle(fill) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 15,
        radius2: 7,
        stroke: new ol.style.Stroke({ color: [0, 0, 0, 1], width: 1.5 }),
        fill: new ol.style.Fill({ color: fill || [0, 255, 255, 0.3] }),
      }),
    });
  }
}
