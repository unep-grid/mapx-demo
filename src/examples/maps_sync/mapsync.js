import splitGrid from "https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm";
import mapboxGl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";
import { GeoTickGen } from "https://cdn.jsdelivr.net/npm/@fxi/geotickgen@0.0.9/+esm";

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

const DEFAULT_INIT = {
  /*
   * Not updatable
   */
  ids: [],
  disableUnify: false,
  disableTerrain: false,
  disableSplit: false,
  disableLatLongTicks: false,
  mapConfig: {
    token: null,
    style: "https://demotiles.maplibre.org/style.json",
    bounds: [
      [28.099638, -3.2539833],
      [28.2304367, -3.1108712],
    ],
    pitch: 65,
    bearing: -143,
    zoom: 15.08,
    projection: "mercator",
  },
  /*
   * Internal ref
   */
  maps: {},
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
 * const mapSync = new MapSync(
 *   {
 *   map: {
 *    token: 'YOUR_MAPBOX_TOKEN',
 *   },
 *   ids: ['map1', 'map2'],
 *   items :[{map:'map1',layer:{},source:{}}]
 *   }
 * );
 *
 * @author unepgrid.ch
 */
export class MapSync {
  constructor(config = {}) {
    const ms = this;
    ms._updating = false;
    autoProps(ms, DEFAULT_INIT, config);
    mapboxgl.accessToken = ms.mapConfig.token;
    ms.init().catch(console.error);
  }

  async init() {
    const ms = this;
    await ms.initializeMaps();
    ms.renderItems();
    if (!ms.disableSplit) {
      ms.initializeSplit();
    }
    if (!ms.disableLatLongTicks) {
      ms.addLatLongTicks();
    }
    if (!ms.disableTerrain) {
      ms.addTerrain();
    }
  }

  async initializeMaps() {
    const ms = this;
    ms.elBase = document.getElementById("base");
    if (!ms.ids || !ms.ids.length === 0) {
      throw new Error("missing maps ui id");
    }
    const config = ms.mapConfig;
    const promInit = [];
    for (const id of ms.ids) {
      const others = [...ms.ids];
      others.splice(others.indexOf(id), 1);
      ms.maps[id] = new mapboxgl.Map({
        container: id,
        ...config,
      });
      // check why it's not taken from the Map options

      //ms.maps[id].setBearing(ms.bearing);
      //ms.maps[id].setPitch(ms.pitch);
      //ms.maps[id].setZoom(ms.b);
      ms.maps[id].on("move", ms.updateMaps(id, others));
      promInit.push(ms.maps[id].once("load"));
    }
    await Promise.all(promInit);
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
    }
  }

  renderItems() {
    const ms = this;
    for (const item of ms.items) {
      ms._add_item(item, ms.maps[item.map]);
    }
  }

  updateItems(items) {
    const ms = this;
    ms.clear();
    ms.items.push(...items);
    ms.renderItems();
  }

  _add_item(item, map) {
    const idLayer = item.layer.id;
    const idSource = item.source.id;
    const layer = map.getLayer(idLayer);
    if (layer) {
      return;
    }
    map.addSource(idSource, item.source);
    map.addLayer(item.layer);
  }

  _remove_item(item, map) {
    const idLayer = item.layer.id;
    const layer = map.getLayer(idLayer);
    if (!layer) {
      return;
    }
    map.removeLayer(idLayer);
    const idSource = item.source.id;
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
        ms._remove_item(item, ms.maps[id]);
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

/**
 * Helpers
 */

/*
 * Automatically add setter/getter
 */
function autoProps(target, ...config) {
  const props = Object.assign({}, ...config);

  for (const [key, value] of Object.entries(props)) {
    // in case a storage already exits, setter is probably there too
    if (target[`_${key}`]) {
      target[key] = value;
      return;
    }
    // store + defineProperty
    target[`_${key}`] = value;
    Object.defineProperty(target, key, {
      get: () => {
        return target[`_${key}`];
      },
      set: (newValue) => {
        if (!newValue) {
          return;
        }
        target[`_${key}`] = newValue;
      },
    });
  }
}
