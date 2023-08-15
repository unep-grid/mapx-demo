import { MapSync } from "./mapsync.js";
import { color_dark as style } from "./mapbox_style.js";
import { generateItems } from "./four_maps_items.js";

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
  ids: ["a", "b", "c", "d"],
  items: generateItems(),
};

window.ms = new MapSync(synchronizerConfig);
