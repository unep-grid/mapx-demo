import splitGrid from "https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm";
import mapboxGl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";
import { GeoTickGen } from "https://cdn.jsdelivr.net/npm/@fxi/geotickgen@0.0.8/+esm";

const mapboxgl = mapboxGl;

const DEFAULT_GTG = {
  ticks: {
    sizeMinor: 10,
    sizeMajor: 20,
    nStepMinor: 30,
    nStepMajor: 5,
    enableLat: true,
    enableLng: true,
    fontSize: 12,
    offsetLabel: 5,
    offsets: {
      lat: {
        top: 100,
        right: 0,
        bottom: 100,
        left: 0,
      },
      lng: {
        top: 0,
        right: 100,
        bottom: 0,
        left: 100,
      },
    },
  },
};

const DEFAULT_CONFIG = {
  /*
   * Not updatable
   */
  token: null,
  projection: "mercator",
  style: "https://demotiles.maplibre.org/style.json",
  ids: [],
  disableUnify: false,
  disableTerrain: false,
  disableSplit: false,
  disableLatLongTicks: false,
  /**
   * Updatable
   */
  bounds: [-144.2, -55.7, 122.2, 79.5],
  pitch: null,
  bearing: null,
  items: [], 
};

/**
 * MapSync is a utility class for synchronizing multiple map views, allowing for unified
 * movements, terrain rendering, lat-long ticks rendering, and layer management.
 * 
 * The class uses mapbox-gl for map rendering, and relies on split-grid for managing split views.
 * 
 * Configuration options include:
 * - Map access token, projection, style, and initial view settings (bounds, pitch, bearing).
 * - A list of HTML element ids where the maps should be rendered.
 * - Disabling certain features like terrain rendering, split view, and lat-long ticks.
 * - Layer configuration, specifying which map gets which layer and from which tile source URL.
 * 
 * Notes:
 * - The map synchronization is based on movement events on the maps.
 * - If a map fails to load a layer, it won't throw an error but will skip the layer.
 * - Maps can be split using a draggable splitter. The split views can be unified or independent.
 * 
 * @class
 * @example
 * const mapSync = new MapSync({
 *   token: 'YOUR_MAPBOX_TOKEN',
 *   ids: ['map1', 'map2'],
 *   items: [
 *     {map: 'map1', layer: 'layerName', tilesUrl: 'https://example.com/tiles/{layer}/{bbox-epsg-3857}'}
 *   ]
 * });
 * 
 * @author unepgrid.ch 
 */
export class MapSync {
  constructor(config = {}) {
    const ms = this;
    config = Object.assign({}, DEFAULT_CONFIG, config);

    for (const [key, value] of Object.entries(config)) {
      ms[`_${key}`] = value;
      Object.defineProperty(ms, key, {
        get: () => {
          return ms[`_${key}`];
        },
        set: (newValue) => {
          if (!newValue) {
            return;
          }
          ms[`_${key}`] = newValue;
        },
      });
    }

    ms._updating = false;
    mapboxgl.accessToken = ms.token;
    ms.maps = ms.initializeMaps();

    if (!ms.disableTerrain) {
      ms.addTerrain();
    }
    if (!ms.disableLatLongTicks) {
      ms.addLatLongTicks();
    }
    ms.renderLayers();

    if (!ms.disableSplit) {
      ms.initializeSplit();
    }
  }

  initializeMaps() {
    const ms = this;
    let maps = {};
    ms.elBase = document.getElementById("base");
    if (!ms.ids || !ms.ids.length === 0) {
      throw new Error("missing maps ui id");
    }
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

  addLatLongTicks() {
    const ms = this;
    for (const id in ms.maps) {
      ms.maps[id]._gtg = new GeoTickGen(ms.maps[id], DEFAULT_GTG);
    }
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

  renderLayers() {
    const ms = this;
    for (const item of ms.items) {
      if (ms.maps[item.map].loaded()) {
        ms._addLayerToMap(item, ms.maps[item.map]);
      } else {
        ms.maps[item.map].on("load", () => {
          ms._addLayerToMap(item, ms.maps[item.map]);
        });
      }
    }
  }

  setLayers(items) {
    const ms = this;
    const newItems = [...items];
    ms.clear();
    ms.items = [...newItems];
    ms.renderLayers();
  }

  _addLayerToMap(item, map) {
    const idLayer = item.layer;
    const idSource = `${item.layer}-src`;
    const layer = map.getLayer(idLayer);

    if (layer) {
      return;
    }

    map.addSource(idSource, {
      type: "raster",
      tiles: [item.tilesUrl.replace("{layer}", item.layer)],
      tileSize: 512,
    });

    map.addLayer({
      id: item.layer,
      type: "raster",
      source: idSource,
    });
  }

  _removeLayerFromMap(item, map) {
    const idLayer = item.layer;
    const layer = map.getLayer(idLayer);
    if (!layer) {
      return;
    }
    map.removeLayer(idLayer);
    const idSource = `${item.layer}-src`;
    const source = map.getSource(idSource);
    if (!source) {
      return;
    }
    map.removeSource(idSource);
  }

  clear() {
    const ms = this;
    for (const id of ms.ids) {
      for (const item of ms.items) {
        ms._removeLayerFromMap(item, ms.maps[id]);
      }
    }
    ms.items.length = 0;
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

  get size() {
    return this.elBase.getBoundingClientRect();
  }

  updateSplit() {
    const ms = this;
    if (ms.disableUnify) {
      return;
    }
    cancelAnimationFrame(ms._id_drame);
    ms._id_frame = requestAnimationFrame(() => {
      const base = ms.size;
      const maps = Object.values(ms.maps);
      for (const map of maps) {
        const elMap = map.getContainer();
        const b = elMap.parentElement.getBoundingClientRect();
        const dy = b.top - base.top;
        const dx = b.left - base.left;
        const h = base.height;
        const w = base.width;
        const updateTransform =
          elMap.dataset.dy !== dy || elMap.dataset.dx !== dx;
        const updateSize = elMap.dataset.w !== w || elMap.dataset.h != h;
        if (updateTransform) {
          elMap.dataset.dy = dy;
          elMap.dataset.dx = dx;
          elMap.style.transform = `translate(${-dx}px,${-dy}px)`;
        }
        if (updateSize) {
          elMap.dataset.w = w;
          elMap.dataset.h = h;
          elMap.style.width = `${base.width}px`;
          elMap.style.height = `${base.height}px`;
          map.resize();
        }
      }
    });
  }

  updateMaps(id, ids) {
    const ms = this;
    return () => {
      if (ms._updating) {
        return;
      }
      ms._updating = true;
      const map = ms.maps[id];
      for (const type of ["Center", "Zoom", "Pitch", "Bearing"]) {
        const value = map[`get${type}`]();
        for (const id of ids) {
          ms.maps[id][`set${type}`](value);
        }
      }
      ms._updating = false;
    };
  }
}
