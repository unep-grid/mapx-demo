import splitGrid from "https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm";
import mapboxGl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";

const mapboxgl = mapboxGl;

export class MapSync {
  constructor(config) {
    const ms = this;
    ms.token = config.token;
    ms.bounds = config.bounds;
    ms.pitch = config.pitch;
    ms.bearing = config.bearing;
    ms.projection = config.projection;
    ms.ids = config.ids;
    ms.style = config.style;
    ms.layers = config.layers;
    ms.disableUnify = config.disableUnify;
    ms.disableTerain = config.disableTerain;
    ms.updating = false;

    mapboxgl.accessToken = ms.token;
    ms.maps = ms.initializeMaps();
    if (!ms.disableTerain) {
      ms.addTerrain();
    }
    ms.addLayers();
    ms.initializeSplit();
  }

  initializeMaps() {
    const ms = this;
    let maps = {};
    for (const id of ms.ids) {
      const others = [...ms.ids];
      others.splice(others.indexOf(id), 1);
      maps[id] = new mapboxgl.Map({
        container: id,
        style: ms.style,
        bounds: ms.bounds,
        pitch: ms.pitch,
        bearing: ms.bearing,
        projection: ms.projection,
      });
      // check why it's not taken from the Map options
      maps[id].setBearing(ms.bearing);
      maps[id].setPitch(ms.pitch);
      maps[id].on("move", ms.updateMaps(id, others));
    }
    return maps;
  }

  addTerrain() {
    const ms = this;
    for (const id in ms.maps) {
      ms.maps[id].on("style.load", () => {
        ms.maps[id].addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        ms.maps[id].setTerrain({
          source: "mapbox-dem",
          exaggeration: 1.5,
        });
      });
    }
  }

  addLayers() {
    const ms = this;
    ms.layers.forEach((l) => {
      if (ms.maps[l.map].loaded()) {
        ms.addLayerToMap(l, ms.maps[l.map]);
      } else {
        ms.maps[l.map].on("load", () => {
          ms.addLayerToMap(l, ms.maps[l.map]);
        });
      }
    });
  }

  addLayerToMap(layerConfig, map) {
    map.addSource(`${layerConfig.layer}-src`, {
      type: "raster",
      tiles: [layerConfig.tilesUrl.replace("{layer}", layerConfig.layer)],
      tileSize: 256,
    });
    map.addLayer({
      id: layerConfig.layer,
      type: "raster",
      source: `${layerConfig.layer}-src`,
    });
  }

  initializeSplit() {
    const ms = this;
    splitGrid({
      columnGutters: [
        {
          track: 1,
          element: document.querySelector(".gutter-col-1"),
        },
      ],
      rowGutters: [
        {
          track: 1,
          element: document.querySelector(".gutter-row-1"),
        },
      ],
      onDrag: ms.updateSplit.bind(ms),
    });
    ms.updateSplit();
  }

  updateSplit() {
    const ms = this;
    if (ms.disableUnify) {
      return;
    }
    const elMaps = document.querySelectorAll(".map");
    cancelAnimationFrame(ms._id_drame);
    ms._id_frame = requestAnimationFrame(() => {
      const base = document.getElementById("base").getBoundingClientRect();
      for (const elMap of elMaps) {
        const b = elMap.parentElement.getBoundingClientRect();
        const dy = b.top - base.top;
        const dx = b.left - base.left;
        elMap.dataset.dy = dy;
        elMap.dataset.dx = dx;
        elMap.style.transform = `translate(${-dx}px,${-dy}px)`;
      }
    });
  }

  updateMaps(id, ids) {
    const ms = this;
    return () => {
      if (ms.updating) {
        return;
      }
      ms.updating = true;
      const map = ms.maps[id];
      for (const type of ["Center", "Zoom", "Pitch", "Bearing"]) {
        const value = map[`get${type}`]();
        for (const id of ids) {
          ms.maps[id][`set${type}`](value);
        }
      }
      ms.updating = false;
    };
  }
}