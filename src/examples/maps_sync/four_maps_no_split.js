import { MapSync } from "./mapsync.js";
import { color_dark as style } from "./mapbox_style.js";
import { generateItems } from "./four_maps_items.js";
const synchronizerConfig = {
  disableUnify: true,
  disableTerrain: true,
  disableSplit: true,
  disableLatLongTicks: true,
  ids: ["a", "b", "c", "d"],
  items: generateItems(),
  mapConfig: {
    token:
      "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
    center: {
      lng: 28.17943490684317,
      lat: -3.1312019115938767,
    },
    zoom: 12,
    pitch: 0,
    bearing: 90,
    projection: "globe",
    style: style,
  },
};

window.ms = new MapSync(synchronizerConfig);
