import { MapSync } from "./mapsync.js";
import { color_dark as style } from "./mapbox_style.js";
import { generateItems } from "./four_maps_items.js";
const synchronizerConfig = {
  disableUnify: true,
  disableTerrain: false,
  disableSplit: true,
  disableLatLongTicks: true,
  ids: ["a", "b", "c", "d"],
  items: generateItems(),
  mapConfig: {
    token:
      "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
    center: {
      lng: 28.190820114633624,
      lat: -3.1254769707673375,
    },
    zoom: 13.87,
    pitch: 73.7867,
    bearing: 167.383,
    projection: "globe",
    style: style,
  },
};

window.ms = new MapSync(synchronizerConfig);
