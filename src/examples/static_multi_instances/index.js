import { Manager } from "https://app.staging.mapx.org/sdk/mxsdk.modern.js";

function makeApp(mcId, viewId) {
  const mc = document.getElementById(mcId);

  if (!mc) {
    console.warn(`Missing id ${mcId}`);
  }

  const m = new Manager({
    container: mc,
    verbose: true,
    url: "https://app.staging.mapx.org:443",
    static: true,
    verbose: true,
    params: {
      theme: "color_light",
      closePanels: true,
      globe: true,
    },
  });

  window[mcId] = m;

  m.on("ready", async () => {
    mc.classList.add("loaded");
    await m.ask("set_immersive_mode", { toggle: true });
    await m.ask("view_add", { idView: viewId });
    const view = await m.ask("get_view_meta", { idView: viewId });
    const info = document.createElement("div");
    info.className = "info";
    info.title = viewId;
    info.innerText = `${view?.meta?.title?.en}`;
    mc.appendChild(info);
  });
}

makeApp("mapx1", "MX-06I8P-A2V1A-9PD7I"); // change in water stress
makeApp("mapx2", "MX-0BAMT-MXYIM-NHMM0"); // acled heatmap
makeApp("mapx3", "MX-305PX-2NDC3-NOO27"); // ecoregion
makeApp("mapx4", "MX-78LRN-0LLTC-085CP"); // eez
