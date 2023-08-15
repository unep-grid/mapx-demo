import { setUrlParams } from "./helpers.js";
const endpoint = "https://datacore.unepgrid.ch/geoserver/wms";

/**
 * Helpers
 */
export function generateItems(bands) {
  const params = {
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetMap",
    FORMAT: "image/png",
    TRANSPARENT: "true",
    STYLES: "",
    LAYERS: "",
    SRS: "EPSG:3857",
    WIDTH: "512",
    HEIGHT: "512",
    BBOX: "{bbox-epsg-3857}",
    ENV: bands || null,
  };

  const cc = [
    {
      map: "a",
      id: "2016_kamituga",
      layer: "rs_for_asgm:mosaic_2016_kamituga",
    },
    {
      map: "b",
      id: "2017_kamituga",
      layer: "rs_for_asgm:mosaic_2017_kamituga",
    },
    {
      map: "c",
      id: "2018_kamituga",
      layer: "rs_for_asgm:mosaic_2018_kamituga",
    },
    {
      map: "d",
      id: "2019_kamituga",
      layer: "rs_for_asgm:mosaic_2019_kamituga",
    },
  ];

  return cc.map((c) => {
    return {
      map: c.map,
      layer: {
        id: c.id,
        type: "raster",
        source: `${c.id}_src`,
      },
      source: {
        id: `${c.id}_src`,
        type: "raster",
        tiles: [
          setUrlParams(endpoint, params, {
            LAYERS: c.layer,
          }),
        ],
      },
    };
  });
}
