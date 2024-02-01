import { Manager } from "https://app.staging.mapx.org/sdk/mxsdk.modern.js";

const mapx = new Manager({
  container: document.getElementById("mapx"),
  verbose: true,
  url: "https://app.staging.mapx.org:443",
  params: {
    theme: "color_light",
    project: "MX-YBJ-YYF-08R-UUR-QW6",
  },
});

const elList = document.getElementById("events");

mapx.on("view_added", (data) => {
  addEntry("view_added", data);
});
mapx.on("view_removed", (data) => {
  addEntry("view_removed", data);
});
mapx.on("mapx_disconnected", () => {
  addEntry("mapx_disconnected", null);
});
mapx.on("project_change", (data) => {
  addEntry("project_change", data);
});

function addEntry(label, data) {
  const elItem = document.createElement("li");
  const content = `
     <span>${label}</span>
     <pre>${JSON.stringify(data, 0, 2)}</pre>
  `;
  elItem.innerHTML = content;
  elList.appendChild(elItem);
  scroll(elItem);
  console.log(label, data);
}


function scroll(item){
  const container = item.parentElement;
  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const scrollPosition = itemRect.top - containerRect.top + container.scrollTop;
  container.scrollTop = scrollPosition;
}
