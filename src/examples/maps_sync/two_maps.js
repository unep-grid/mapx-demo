import { MapSync } from "./mapsync.js";
import { color_dark as style } from "./mapbox_style.js";
import { setUrlParams } from "./helpers.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.0/dist/tweakpane.min.js";

const endpoint = "https://datacore.unepgrid.ch/geoserver/hotspots/wms";

// Initialize Tweakpane and bind configuration parameters
const pane = new Pane();

/**
 *  1: red
 *  2: green
 *  3: blue
 *  4: nir
 *  5: swir1
 *  6: swir2
 *  7: surface_temperature
 *  8: coastal_aerosol (Landsat 8 et 9 uniquement)
 *  ORIG;
 *    B1: 6,
 *    B2: 4,
 *    B3: 1,
 */

const choices = {
  options: {
    "1 red": "1",
    "2 green": "2",
    "3 blue": "3",
    "4 nir": "4",
    "5 swir1": "5",
    "6 swir2": "6",
    "7 surf_temp": "7",
  },
};

const bandsOrig = {
  B1: "6",
  B2: "4",
  B3: "1",
};
const rasterPaintOrig = {
  "raster-contrast": 0,
  "raster-hue-rotate": 0,
  "raster-brightness-max": 1,
  "raster-brightness-min": 0,
  "raster-opacity": 1,
};
const bands = { ...bandsOrig };
const rasterPaint = { ...rasterPaintOrig };

const panelBands = pane.addFolder({
  title: "Bands mapping",
});

const panelRaster = pane.addFolder({
  title: "Raster",
  expanded: false,
});

panelBands.addBinding(bands, "B1", choices);
panelBands.addBinding(bands, "B2", choices);
panelBands.addBinding(bands, "B3", choices);
panelRaster.addBinding(rasterPaint, "raster-hue-rotate", { min: 0, max: 360 });
panelRaster.addBinding(rasterPaint, "raster-contrast", { min: -1, max: 1 });
panelRaster.addBinding(rasterPaint, "raster-brightness-min", {
  min: 0,
  max: 1,
});
panelRaster.addBinding(rasterPaint, "raster-brightness-max", {
  min: 0,
  max: 1,
});
panelRaster.addBinding(rasterPaint, "raster-opacity", { min: 0, max: 1 });

panelBands.on("change", () => updateBands(bands));
panelRaster.on("change", () => updateRasterPaint(rasterPaint));

const btn = pane.addButton({
  title: "Reset",
  label: "reset",
});

btn.on("click", () => {
  for (const key in bands) {
    bands[key] = bandsOrig[key];
  }
  for (const key in rasterPaint) {
    rasterPaint[key] = rasterPaintOrig[key];
  }
  pane.refresh();
});

const synchronizerConfig = {
  disableUnify: false,
  disableTerain: true,
  disableLatLongTicks: false,
  token:
    "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
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
  style: style,
  ids: ["a", "b"],
  items: generateItems(bandsOrig),
};

window.ms = new MapSync(synchronizerConfig);

function updateRasterPaint(config) {
  for (const [key, value] of Object.entries(config)) {
    for (const [idMap, map] of Object.entries(ms.maps)) {
      for (const item of ms.items) {
        if (item.map === idMap && item.source.type === "raster") {
          map.setPaintProperty(item.layer.id, key, value);
        }
      }
    }
  }
}

function updateBands(bands) {
  ms.updateItems(generateItems(bands));
}

function generateItems(bands) {
  const params = {
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetMap",
    FORMAT: "image/png",
    TRANSPARENT: "true",
    STYLES: "",
    LAYERS: "",
    SRS: "EPSG:3857",
    WIDTH: "512",
    HEIGHT: "512",
    BBOX: "{bbox-epsg-3857}",
    ENV: bands,
  };

  return [
    {
      map: "a",
      layer: {
        id: "hotspot_1986",
        type: "raster",
        source: "hotspot_1986_src",
      },
      source: {
        id: "hotspot_1986_src",
        type: "raster",
        tiles: [
          setUrlParams(endpoint, params, {
            LAYERS: "hotspots:site_0336_19860908_visual_nearest",
          }),
        ],
      },
    },
    {
      map: "b",
      layer: {
        id: "hotspot_2001",
        type: "raster",
        source: "hotspot_2001_src",
      },
      source: {
        id: "hotspot_2001_src",
        type: "raster",
        tiles: [
          setUrlParams(endpoint, params, {
            LAYERS: "hotspots:site_0336_20010128_enhanced",
          }),
        ],
      },
    },
  ];
}
