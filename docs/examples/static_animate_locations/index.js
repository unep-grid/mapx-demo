import { Manager } from "https://app.mapx.org/sdk/mxsdk.modern.js";
import tomSelect from "https://cdn.jsdelivr.net/npm/tom-select@2.2.2/+esm";

const elSelect = document.getElementById("selectLocation");

const mapx = new Manager({
  container: document.getElementById("mapx"),
  verbose: true,
  url: "https://app.mapx.org:443",
  static: true,
  verbose: true,
  params: {
    theme: "color_light",
    closePanels: true,
    globe : true
  },
});

mapx.on("ready", main);

elSelect.addEventListener("change", updateLocation);

async function main() {
  const locs = await mapx.ask("common_loc_get_table_codes");
  const elFrag = document.createDocumentFragment();
  for (const l of locs) {
    const elOpt = document.createElement("option");
    elOpt.value = l.code;
    elOpt.innerText = l.name;
    elFrag.appendChild(elOpt);
  }
  elSelect.replaceChildren(elFrag);
  new tomSelect(elSelect);
}

async function updateLocation() {
  const code = elSelect.value;
  if (!code || code === "default") {
    return;
  }
  try {
    await mapx.ask("common_loc_fit_bbox", {
      code,
    });
  } catch (e) {
    console.warn(e);
  }
}
