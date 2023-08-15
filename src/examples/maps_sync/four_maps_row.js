import { MapSync } from "./mapsync.js";
import { color_dark as style } from "./mapbox_style.js";
import { setUrlParams } from "./helpers.js";

const endpoint = "https://datacore.unepgrid.ch/geoserver/wms";

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

const tileLayer = setUrlParams(endpoint, params);

const synchronizerConfig = {
  disableUnify: true,
  disableTerain: true,
  disableSplit: true,
  disableLatLongTicks: true,
  token:
    "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
  bounds: [
    [28.16751431289586, -3.154320634666732],
    [28.19647184950884, -3.07267137447478],
  ],
  pitch: 0,
  bearing: 0,
  projection: "globe",
  style: style,
  ids : ["a","b","c","d"],
  items: [
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
