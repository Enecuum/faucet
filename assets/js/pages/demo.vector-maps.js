!function(a) {
  "use strict";
  var n=function() {}
  ;
  n.prototype.init=function() {
      a("#world-map-markers").vectorMap( {
          map:"world_mill_en", normalizeFunction:"polynomial", hoverOpacity:.7, hoverColor:!1, regionStyle: {
              initial: {
                  fill: "#e3eaef"
              }
          }
          , markerStyle: {
              initial: {
                  r: 9, fill: "#727cf5", "fill-opacity": .9, stroke: "#fff", "stroke-width": 7, "stroke-opacity": .4
              }
              , hover: {
                  stroke: "#fff", "fill-opacity": 1, "stroke-width": 1.5
              }
          }
          , backgroundColor:"transparent", markers:[  {
              latLng: [49.3, 11], name: "Nuremberg"
          }
          ]
      }
      )
  }
  ,
  a.VectorMap=new n,
  a.VectorMap.Constructor=n
}

(window.jQuery),
function(a) {
  "use strict";
  window.jQuery.VectorMap.init()
}

();