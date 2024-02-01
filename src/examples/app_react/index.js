import { Manager } from "https://app.staging.mapx.org/sdk/mxsdk.modern.js";
import reactSplitGrid from "https://cdn.jsdelivr.net/npm/react-split-grid@1.0.4/+esm";

/**
 * Modules loaded globally in index.html
 */
const { useEffect, useState, useRef, createElement: e, Fragment: frag } = React;

const App = () => {
  const [projectId, setProjectId] = useState("Loading...");
  const [views, setViews] = useState([]);
  const [mapx, setMapx] = useState(null);

  const mxContainer = useRef(null);

  useEffect(() => {
    const mapx = new Manager({
      container: mxContainer.current,
      verbose: true,
      url: "https://app.staging.mapx.org:443",
      params: {
        theme: "color_light",
        project: "MX-YBJ-YYF-08R-UUR-QW6",
        closePanels: true,
        language: "en",
      },
    });

    mapx.on("ready", async () => {
      try {
        const [projectId, views] = await Promise.all([
          mapx.ask("get_project"),
          mapx.ask("get_views"),
        ]);
        setProjectId(projectId);
        setViews(views);
        setMapx(mapx);
      } catch (error) {
        console.error(error);
      }
    });
  }, []);

  return e(reactSplitGrid, {
    render: ({ getGridProps, getGutterProps }) =>
      e("div", { key: "grid", className: "layout grid grid-1x2 grid-sidebar", ...getGridProps() }, [
        e(
          "div",
          { className: "config padding", key: "colviews" },
          e(MxViewsType, { mapx, projectId, views })
        ),
        e("div", {
          key: "gutter",
          className: "gutter-col gutter-col-1",
          ...getGutterProps("column", 1),
        }),
        e("div", {
          key: "mapx",
          className: "mapx",
          ref: mxContainer,
        }),
      ]),
  });
};

const MxView = ({ mapx, view }) => {
  const [active, setActive] = useState(false);

  const handleClick = async () => {
    try {
      const operation = active ? "view_remove" : "view_add";
      await mapx.ask(operation, { idView: view.id });
      setActive(!active);
    } catch (error) {
      console.error(error);
    }
  };

  return e(
    "li",
    { key: view.id, className: active ? "active view" : "view" },
    e("a", { href: "#", onClick: handleClick }, view?.data?.title?.en)
  );
};

const MxType = ({ mapx, views, type }) => {
  return e(
    frag,
    {
      key: "type",
    },
    [
      e(
        "h4",
        {
          key: "type-title",
        },
        type
      ),
      e(
        "ul",
        { key: "type-views-list", className: "views-list" },
        views.map((view) => {
          return e(MxView, { key: view.id, mapx, type, view });
        })
      ),
    ]
  );
};

const MxViewsType = ({ mapx, projectId, views }) => {
  const types = {};

  for (const view of views) {
    if (!types[view.type]) {
      types[view.type] = [view];
    } else {
      types[view.type].push(view);
    }
  }

  const typeElements = Object.entries(types).map(([type, views]) => {
    return e(MxType, { key: type, mapx, views, type });
  });

  return e(
    "div",
    { className: "views", id: "actions", key: "viewsaction" },
    e("h2", { key: "header" }, "Views"),
    e("span", { key: "description" }, `Views of the project ${projectId}`),
    e(
      "div",
      {
        className: "views-container",
      },

      ...typeElements
    )
  );
};

ReactDOM.render(e(App), document.getElementById("app"));
