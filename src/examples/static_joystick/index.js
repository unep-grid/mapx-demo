import { Manager } from "https://app.staging.mapx.org/sdk/mxsdk.modern.js";
import nipplejs from "https://cdn.jsdelivr.net/npm/nipplejs@0.10.1/+esm";

const conf = {
  ctrlAIsUsed: false,
  ctrlBIsUsed: false,
  center: { lng: 67.96553657077601, lat: 33.60321971447401 },
  offset: [0, 0],
  pitch: 55,
  bearing: -111.19,
  zoom: 11.91,
  delta: { x: 0, y: 0, z: 0, p: 0, b: 0 },
};

const mapx = new Manager({
  container: document.getElementById("mapx"),
  verbose: true,
  url: "https://app.staging.mapx.org:443",
  static: true,
  verbose: true,
  params: {
    theme: "color_light",
    closePanels: true,
    globe: true,
    lat: conf.center.lat,
    lng: conf.center.lng,
    zoom: conf.zoom,
    views: ["MX-Z741Z-HA4JJ-OGV29"],
  },
});

const elCtrlA = document.getElementById("ctrlDirection");

const ctrlA = nipplejs.create({
  zone: elCtrlA,
  mode: "static",
  position: { top: "50%", left: "50%" },
});

mapx.on("ready", main);

async function main() {
  await mapx.ask("set_mode_3d", { action: "show" });
  await mapx.ask("set_mode_aerial", { action: "show" });

  /**
   * initial rendering
   */
  await mapx.ask("map", {
    method: "jumpTo",
    parameters: [
      {
        bearing: conf.bearing,
        zoom: conf.zoom,
        center: conf.center,
        pitch: conf.pitch,
      },
      { duration: 0 },
    ],
  });
  /**
   * Directional input
   */
  ctrlA.on("move", (_, d) => {
    conf.delta.b = d.vector.x;
    conf.delta.y = d.vector.y * 10;
  });

  ctrlA.on("start", () => {
    conf.ctrlAIsUsed = true;
    render();
  });
  ctrlA.on("end", () => {
    conf.ctrlAIsUsed = false;
    conf.delta.b = 0;
    conf.delta.y = 0;
  });
}

async function render(force) {
  const skip = conf.rendering || (!conf.ctrlAIsUsed && !conf.ctrlBIsUsed);
  if (skip && !force) {
    return;
  }
  conf.rendering = true;
  conf.bearing += conf.delta.b;
  conf.offset[1] = -conf.delta.y;

  await mapx.ask("map", {
    method: "jumpTo",
    parameters: [
      {
        bearing: conf.bearing,
      },
      { duration: 0 },
    ],
  });
  await mapx.ask("map", {
    method: "panBy",
    parameters: [conf.offset, { duration: 0 }],
  });
  await nextFrame();
  conf.rendering = false;
  await render();
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}
