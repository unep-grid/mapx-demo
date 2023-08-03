import splitGrid from 'https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm'

splitGrid({
  columnGutters: [{
    track: 1,
    element: document.querySelector('.gutter-col-1'),
  }],
  rowGutters: [{
    track: 1,
    element: document.querySelector('.gutter-row-1'),
  }],
  onDrag: console.log
})



/*import splitJs from 'https://cdn.jsdelivr.net/npm/split.js@1.6.5/+esm'*/

/**
 * Two columns
 */
/*const c1 = document.getElementById("column1");*/
/*const c2 = document.getElementById("column2");*/

/*if (!!c1 && !!c2) {*/
  /*splitJs([c1, c2], {*/
    /*sizes: [25, 75],*/
    /*minSize: [100, 100],*/
  /*});*/
/*}*/
