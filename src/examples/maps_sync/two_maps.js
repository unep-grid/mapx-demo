import { MapSync } from "./mapsync.js";
import { color_light as style } from "./mapbox_style.js";

const tileLayer =
  "https://datacore.unepgrid.ch/geoserver/hotspots/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&ENV=B1%3A6%3BB2%3A4%3BB3%3A1&LAYERS={layer}&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}";

const synchronizerConfig = {
  disableUnify: false,
  disableTerain: true,
  token:
    "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
  bounds: [
    [28.169073012244894, -3.1729957354298506],
    [28.20091559589443, -3.1124026640005695],
  ],
  bounds: [
    {
      lng: 22.094409977724553,
      lat: 2.416142091299889,
    },
    {
      lng: 22.701853426010103,
      lat: 3.315918878785965,
    },
  ],
  pitch: 0,
  bearing: -90,
  projection: "globe",
  ids: ["a", "b"],
  style: style,
  layers: [
    {
      map: "a",
      layer: "hotspots:site_0336_19860908_visual_nearest",
      tilesUrl: tileLayer,
    },
    {
      map: "b",
      layer: "hotspots:site_0336_20010128_enhanced",
      tilesUrl: tileLayer,
    },
  ],
};

window.ms = new MapSync(synchronizerConfig);
