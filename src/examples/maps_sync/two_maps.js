import { MapSync } from "./mapsync.js";
import { color_light as style } from "./mapbox_style.js";
import { updateURL } from "./helpers.js";

const endpoint = "https://datacore.unepgrid.ch/geoserver/hotspots/wms";

/**
 *  1: red
 *  2: green
 *  3: blue
 *  4: nir
 *  5: swir1
 *  6: swir2
 *  7: surface_temperature
 *  8: coastal_aerosol (Landsat 8 et 9 uniquement)
 *  const envOrig = {
 *    B1: 6,
 *    B2: 4,
 *    B3: 1,
 *  };
 */

const params = {
  SERVICE: "WMS",
  VERSION: "1.1.1",
  REQUEST: "GetMap",
  FORMAT: "image/png",
  TRANSPARENT: "true",
  STYLES: "",
  LAYERS: "{layer}",
  SRS: "EPSG:3857",
  WIDTH: "512",
  HEIGHT: "512",
  BBOX: "{bbox-epsg-3857}",
  ENV: {
    B1: 6,
    B2: 4,
    B3: 5,
  },
};

const tileLayer = updateURL(endpoint, params);

const synchronizerConfig = {
  disableUnify: false,
  disableTerain: true,
  disableLatLongTicks: false,
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
  bearing: 0,
  //projection: "globe",
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
