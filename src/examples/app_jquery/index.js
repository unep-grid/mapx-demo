import { Manager } from "https://app.mapx.org/sdk/mxsdk.modern.js";
import "https://code.jquery.com/jquery-3.7.0.slim.js";
const $ = jQuery;

const mapx = new Manager({
  container: document.getElementById("mapx"),
  verbose: true,
  url: "https://app.mapx.org:443",
  params: {
    closePanels: true,
    theme: "color_light",
    project: "MX-YBJ-YYF-08R-UUR-QW6",
  },
});

mapx.on("ready", async () => {

  /**
   * Display current project name
   */
  const project = await mapx.ask("get_project");

  $("#project").text(project);

  /**
   * Build toggle buttons for each views found
   */
  const $ul = $("#views");
  const views = await mapx.ask("get_views");

  for (const view of views) {
    const $a = $('<a href="#">')
      .text(view.data.title.en)
      .click(view, (e) => {
        e.preventDefault();
        const $elBtn = $(e.currentTarget);
        $elBtn.toggleClass("active");
        const op = $elBtn.hasClass("active") ? "view_add" : "view_remove";
        mapx.ask(op, {
          idView: view.id,
        });
      });
    $ul.append($("<li>").append($a));
  }

});
