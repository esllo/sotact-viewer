const TAW = (() => {
  const data = { baseUrl: '', cntr: document.body };

  const baseUrl = (url) => (data.baseUrl = url || data.baseUrl);
  const container = (c) => (data.cntr = byQuery(c) || data.cntr);

  function loadCuts(list) {
    data.cuts = [];
    list.map((e, i) => {
      fetch(data.baseUrl + e)
        .then((r) => r.json())
        .then((j) => {
          const c = createElem('div');
          c.id = 'taw-cut-' + i;
          data.cntr.appendChild(c);
          const parsed = parser.parse(c, j);
          console.log(parsed);
          data.cuts[i] = Cut(parsed);
          setTimeout(parsed.stage.draw.bind(parsed.stage), 500);
        });
    });
  }

  const Cut = (d) =>
    ((d) => {
      const stg = d.stage;
      const lay = stg.getLayers()[0];
      const flow = d.flow;

      function setProgress(p) {
        return flow.map((fl) => {
          let from = p < fl.time[fl.index] ? 0 : fl.index;
          let to = p < fl.time[fl.index] ? fl.index : fl.max - 1;
          if (to > fl.max - 1) to = fl.max - 1;
          for (fl.index = from; fl.index < to; ) {
            if (fl.time[fl.index + 1] > p) break;
            fl.index++;
          }
          let f = {};
          if (fl.index != fl.max - 1)
            for (const key of Object.keys(fl.data[fl.index])) {
              let value = fl.data[fl.index][key];
              let diffs = fl.data[fl.index + 1][key] - fl.data[fl.index][key];
              let dists = fl.time[fl.index + 1] - fl.time[fl.index];
              let prgrs = p - fl.time[fl.index];
              value += diffs * (prgrs / dists);
              fl.obj[key](value);
            }
          else {
            for (const key of Object.keys(fl.data[fl.index])) {
              f[key] = fl.data[fl.index][key];
              fl.obj[key](fl.data[fl.index][key]);
            }
          }
          lay.batchDraw();
          return f;
        });
      }
    })(d);

  function scrollListener(e) {
    // window.scrollY;
  }

  window.addEventListener('scroll', scrollListener);

  return { loadCuts: loadCuts };
})();
