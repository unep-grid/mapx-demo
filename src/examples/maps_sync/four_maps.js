import { MapSync } from "./mapsync.js";
import { color_dark as style } from "./mapbox_style.js";
import { generateItems } from "./four_maps_items.js";
const synchronizerConfig = {
  disableUnify: false,
  disableTerrain: true,
  disableSplit: false,
  ids: ["a", "b", "c", "d"],
  items: generateItems(),
  mapConfig: {
    token:
      "pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoiY2puZW5rZ3N6MGRzYzNwb3drOW12MWEzdyJ9.IZC03hW3hKtBcbMgD0_KPw",
    bounds: [
      [28.169073012244894, -3.1729957354298506],
      [28.20091559589443, -3.1124026640005695],
    ],
    style: style,
  },
};

window.ms = new MapSync(synchronizerConfig);
