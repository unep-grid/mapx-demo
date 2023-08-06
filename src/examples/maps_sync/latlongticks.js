/**
 * Style in style_llt.css
 */
const DEFAULT_OPTIONS = {
  ticks: {
    sizeMinor: 10,
    sizeMajor: 20,
    nStepMinor: 100,
    nStepMajor: 10, // nStepMinor divider
    enableLat: true,
    enableLng: true,
    fontSize: 12,
    offsetLabel: 4,
    offsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
};

/***
 * mapbox gl plugin to display lat/long ticks in left and bottom border of the map
 */
export class LatLonTicks {
  constructor(map, userOptions = {}) {
    const llt = this;
    llt.map = map;
    llt.options = { ...DEFAULT_OPTIONS, ...userOptions };

    llt.init();
  }

  init() {
    const llt = this;
    const container = llt.map.getContainer();
    llt.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    llt.svg.classList.add("llt-container");
    container.appendChild(llt.svg);
    llt.map.once("load", () => {
      llt.map.on("move", () => llt.update());
      llt.map.on("mousemove", llt.mouseDebug.bind(llt));
      llt.update();
    });
  }

  mouseDebug(e) {
    const llt = this;
    const x = e.point.x;
    const y = e.point.y;
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    console.log({ lat: llt.convertDMS(lat), lng: llt.convertDMS(lng), x, y });
  }

  clear() {
    const llt = this;
    while (llt.svg.firstChild) {
      llt.svg.removeChild(llt.svg.firstChild);
    }
  }

  get size() {
    const llt = this;
    return llt.map.getContainer().getBoundingClientRect();
  }

  get width() {
    const llt = this;
    return llt.size.width;
  }
  get height() {
    const llt = this;
    return llt.size.height;
  }

  update() {
    const llt = this;
    llt.clear();
    const addLat = llt.options.ticks.enableLat;
    const addLng = llt.options.ticks.enableLng;
    if (addLat) llt.buildTicks("lat");
    if (addLng) llt.buildTicks("lng");
  }
  buildTicks(type) {
    const llt = this;
    // Create series
    const series = llt.createSeries(type);

    // For each value in the series
    for (let i = 0, iL = series.length; i < iL; i++) {
      const isFirst = i === 0;
      const item = series[i];
      const label = item.label;
      const tick = item.tick;

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.classList.add("llt-outline");
      rect.setAttribute("x", tick.x);
      rect.setAttribute("y", tick.y);
      rect.setAttribute("width", tick.width);
      rect.setAttribute("height", tick.height);

      llt.svg.appendChild(rect);

      // Add label for major ticks
      if (label && !isFirst) {
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.classList.add("llt-outline");
        text.setAttribute("x", label.x);
        text.setAttribute("y", label.y);
        text.setAttribute(
          "transform",
          `rotate(${label.rotation}, ${label.x}, ${label.y})`
        );
        text.style.fontSize = `${label.size}px`;
        text.textContent = label.text;

        llt.svg.appendChild(text);
      }
    }
  }

  buildTicks_d3(type) {
    const llt = this;

    // Create series
    const series = llt.createSeries(type);

    // For each value in the series
    for (let i = 0, iL = series.length; i < iL; i++) {
      const isFirst = i === 0;
      const item = series[i];
      const label = item.label;
      const tick = item.tick;

      llt.svg
        .append("rect")
        .attr("x", tick.x)
        .attr("y", tick.y)
        .attr("width", tick.width)
        .attr("height", tick.height)
        .attr("class", "outline");

      // Add label for major ticks
      if (label && !isFirst) {
        llt.svg
          .append("text")
          .attr("x", label.x)
          .attr("y", label.y)
          .attr("class", "outline")
          .attr(
            "transform",
            `rotate(${label.rotation}, ${label.x}, ${label.y})`
          )
          .style("font-size", `${label.size}px`)
          .text(label.text);
      }
    }
  }

  createSeries(type) {
    const llt = this;
    const series = [];
    const nStepMinor = llt.options.ticks.nStepMinor;
    const nStepMajor = llt.options.ticks.nStepMajor;
    const sizeMn = llt.options.ticks.sizeMinor;
    const sizeMj = llt.options.ticks.sizeMajor;
    const sizeFont = llt.options.ticks.fontSize;
    const lo = llt.options.ticks.offsetLabel;
    const w = llt.width;
    const h = llt.height;
    const isLat = type === "lat";

    if (nStepMinor % nStepMajor !== 0) {
      throw new Error("nStepMajor must be a divider of nStepMinor");
    }

    const start = 0;
    const end = isLat ? h : w;

    const step = (end - start) / nStepMinor; // Calculate step size for minor parts
    const majorStep = nStepMinor / nStepMajor;

    // Create series
    for (let i = 0; i <= nStepMinor; i++) {
      const pos = start + i * step;
      const isMajor = i % majorStep === 0;
      const size = isMajor ? sizeMj : sizeMn;
      const tick = {
        y: isLat ? pos : h - size,
        x: isLat ? 0 : pos,
        height: isLat ? 1 : size,
        width: isLat ? size : 1,
      };
      const item = {
        tick,
      };
      if (isMajor) {
        const coord = llt.map.unproject([tick.x, tick.y]);
        item.label = {
          y: isLat ? tick.y + sizeFont / 2 : h - sizeMj - lo,
          x: isLat ? size + lo : tick.x,
          text: llt.convertDMS(isLat ? coord.lat : coord.lng),
          rotation: isLat ? 0 : -45,
          size: sizeFont,
        };
      }

      series.push(item);
    }

    return series;
  }
  convertDMS(degree) {
    const absDegree = Math.abs(degree);
    const degrees = Math.floor(absDegree);
    const minFloat = (absDegree - degrees) * 60;
    const minutes = Math.floor(minFloat);
    const secFloat = (minFloat - minutes) * 60;
    const seconds = secFloat.toFixed(1);
    return `${degrees}° ${minutes}' ${seconds}"`;
  }
}
