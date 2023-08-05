import * as d3 from "https://esm.run/d3";

const DEFAULT_OPTIONS = {
  ticks: {
    sizeMinor: 10,
    sizeMajor: 20,
    nStepMinor: 50,
    nStepMajor: 10, // nStepMinor divider
    enableLat: true,
    enableLng: true,
    color: "#000",
    fill: "#fff",
    fontSize: 10,
    labelOffset: 4,
  },
};

export class LatLonTicks {
  constructor(map, userOptions = {}) {
    const llt = this;
    llt.map = map;
    llt.options = { ...DEFAULT_OPTIONS, ...userOptions };

    llt.init();
  }

  init() {
    const llt = this;

    llt.svg = d3
      .select(llt.map.getContainer())
      .append("svg")
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .style("width", "100%")
      .style("height", "100%")
      .style("pointer-events", "none");

    llt.map.on("move", () => llt.update());
    llt.update();
  }

  clear() {
    const llt = this;
    llt.svg.selectAll("*").remove(); // Clear previous tick marks
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
    let minVal, maxVal;
    const w = llt.width;
    const h = llt.height;
    const isLat = type === "lat";

    if (type === "lat") {
      minVal = llt.map.unproject([0, 0]).lat;
      maxVal = llt.map.unproject([0, h]).lat;
    } else {
      minVal = llt.map.unproject([0, 0]).lng;
      maxVal = llt.map.unproject([w, 0]).lng;
    }

    // Create series
    const series = llt.createSeries(
      minVal,
      maxVal,
      llt.options.ticks.nStepMinor,
      llt.options.ticks.nStepMajor
    );

    // For each value in the series
    for (const [seriesType, seriesVals] of Object.entries(series)) {
      const isMajor = seriesType === "major";
      const lo = llt.options.ticks.labelOffset;
      const sizeMn = llt.options.ticks.sizeMinor;
      const sizeMj = llt.options.ticks.sizeMajor;
      const c1 = llt.options.ticks.color;
      const c2 = llt.options.ticks.fill;
      const sizeFont = llt.options.ticks.fontSize;

      const size = isMajor ? sizeMj : sizeMn;

      for (const val of seriesVals) {
        const d = isLat
          ? llt.map.project([0, val]).y
          : llt.map.project([val, 0]).x;
        
        // Skip if out of bounds
        if (isLat ? d > h : d > w) {
          continue;
        }

        if (isLat) {
          llt.svg
            .append("rect")
            .attr("x", 0)
            .attr("y", d)
            .attr("width", size)
            .attr("height", 1)
            .attr("class", "outline")
            .style("stroke", c1)
            .style("fill", c2);
        } else {
          llt.svg
            .append("rect")
            .attr("x", d)
            .attr("y", h - size)
            .attr("width", 1) // Set the width to 1 to make it look like a line
            .attr("height", size)
            .attr("class", "outline")
            .style("stroke", c1)
            .style("fill", c2);
        }

        // Add label for major ticks
        if (isMajor) {
          const textY = isLat ? d + sizeFont / 2 : h - sizeMj - lo;
          const textX = isLat ? size + lo : d;
          const rotation = isLat ? 0 : -45;

          llt.svg
            .append("text")
            .attr("x", textX) // Offset from the end of the tick
            .attr("y", textY) // Position at the same level as the tick
            .attr("class", "outline")
            .attr("transform", `rotate(${rotation}, ${textX}, ${textY})`) // apply rotation
            .style("fill", c2)
            .style("stroke", c1)
            .style("font-size", `${sizeFont}px`) // Adjust as needed
            .text(llt.convertDMS(val));
        }
      }
    }
  }

  /**
   * Helpers
   */
  convertDMS(degree) {
    const absDegree = Math.abs(degree);
    const degrees = Math.floor(absDegree);
    const minFloat = (absDegree - degrees) * 60;
    const minutes = Math.floor(minFloat);
    const secFloat = (minFloat - minutes) * 60;
    const seconds = secFloat.toFixed(1);
    return `${degrees}° ${minutes}' ${seconds}"`;
  }

  createSeries(start, end, nStepMinor, nStepMajor) {
    if (nStepMinor % nStepMajor !== 0) {
      throw new Error("nStepMajor must be a divider of nStepMinor");
    }

    const step = (end - start) / nStepMinor; // Calculate step size for minor parts
    const minorSeries = [];
    const majorSeries = [];
    const majorStep = nStepMinor / nStepMajor;

    // Create minor series
    for (let i = 0; i <= nStepMinor; i++) {
      const val = start + i * step;
      minorSeries.push(val);

      // Add to major series
      if (i % majorStep === 0) {
        majorSeries.push(val);
      }
    }

    // Return both series
    return {
      minor: minorSeries,
      major: majorSeries,
    };
  }

  // Similar function for building Longitude ticks

  buildLongitudeTicks() {
    // Similar approach for longitudes, but using x and swapping lat with lon
    // ...
  }
}
