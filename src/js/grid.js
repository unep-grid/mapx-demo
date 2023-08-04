import splitGrid from "https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm";

const elGrids = document.querySelectorAll(".grid");

for (const el of elGrids) {
  if (el.classList.contains("grid-1x2")) {
    
    splitGrid({
      columnGutters: [
        {
          track: 1,
          element: el.querySelector(".gutter-col-1"),
        },
      ],
    });
  }
  if (el.classList.contains("grid-2x2")) {
    splitGrid({
      columnGutters: [
        {
          track: 1,
          element: el.querySelector(".gutter-col-1"),
        },
      ],
      rowGutters: [
        {
          track: 1,
          element: el.querySelector(".gutter-row-1"),
        },
      ],
    });
  }
}
