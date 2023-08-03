import splitGrid from "https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm";

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
});
