import { MapSync } from "./mapsync.js";
import { color_light as style } from "./mapbox_style.js";

const tileLayer =
  "https://datacore.unepgrid.ch/geoserver/wms?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&styles=&request=getMap&ZINDEX=10&EXCEPTIONS=application%2Fvnd.ogc.se_blank&srs=EPSG%3A3857&layers={layer}&format=image%2Fpng&transparent=true&height=256&width=256";

const synchronizerConfig = {
  disableUnify: false,
  disableTerain: true,
  token:
    "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
  bounds: [
    [28.169073012244894, -3.1729957354298506],
    [28.20091559589443, -3.1124026640005695],
  ],
  pitch: 0,
  bearing: -90,
  projection: "globe",
  ids: ["a", "b", "c", "d"],
  //style: "mapbox://styles/helsinki/clilizzu2002h01qmekfxdsnu",
  style: style,
  layers: [
    {
      map: "a",
      layer: "rs_for_asgm:mosaic_2016_kamituga",
      tilesUrl: tileLayer,
    },
    {
      map: "b",
      layer: "rs_for_asgm:mosaic_2017_kamituga",
      tilesUrl: tileLayer,
    },
    {
      map: "c",
      layer: "rs_for_asgm:mosaic_2018_kamituga",
      tilesUrl: tileLayer,
    },
    {
      map: "d",
      layer: "rs_for_asgm:mosaic_2019_kamituga",
      tilesUrl: tileLayer,
    },
  ],
};

window.ms = new MapSync(synchronizerConfig);
