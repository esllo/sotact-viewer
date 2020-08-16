const TAW = (() => {
  const data = { baseUrl: '', cntr: document.body };

  const baseUrl = (url) => (data.baseUrl = url || data.baseUrl);
  const container = (c) => (data.cntr = byQuery(c) || data.cntr);
  const cuts = () => data.cuts;
  const redraw = () => data.cuts.map(e => e.redraw());
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function loadCuts(list) {
    data.cuts = [];
    const total = list.length;
    var count = 0;
    const width = parseInt(computedStyle(data.cntr).width);
    list.map((e, i) => {
      const c = createElem('div');
      c.id = 'taw-cut-' + i;
      c.classList = 'taw-cut';
      data.cntr.appendChild(c);
      fetch(data.baseUrl + e)
        .then((r) => r.json())
        .then((j) => {
          const parsed = parser.parse(c, j, width);
          console.log(parsed);
          parsed.waitForLoad(() => {
            // pin
            const cut = Cut(parsed);
            cut.container = c;
            data.cuts[i] = cut;
            count++;
          });
          setTimeout(parsed.stage.draw.bind(parsed.stage), 500);
        });
    });
    async function waitForLoad(cb) {
      while (total != count) await sleep(50);
      cb();
      redraw();
      initScrollBounds();
    }

    return new Promise(waitForLoad);
  }

  const Cut = (d) => {
    return ((d) => {
      const stg = d.stage;
      const lay = stg.getLayers()[0];
      const flow = d.flow;
      const redraw = () => stg.draw();
      let progress = 0;

      function setProgress(p) {
        progress = p;
        return flow.map((fl) => {
          let from = p < fl.time[fl.index] ? 0 : fl.index;
          let to = p < fl.time[fl.index] ? fl.index : fl.max - 1;
          if (to > fl.max - 1) to = fl.max - 1;
          for (fl.index = from; fl.index < to;) {
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
          stg.batchDraw();
          return f;
        });
      }
      function getProgress() { return progress }

      return {
        setProgress: setProgress,
        getProgress: getProgress,
        f: flow,
        redraw: redraw
      };
    })(d);
  };

  let conts = [];
  let bounds = [];

  function initScrollBounds() {
    conts = document.querySelectorAll('.taw-cut');
    bounds = [];
    for (const cont of conts) bounds.push([cont.offsetTop, cont.offsetHeight]);
  }

  function scrollListener(cb) {
    let tick = false;
    return () => {
      if (tick) return;
      tick = true;
      return requestAnimationFrame(() => {
        tick = false;
        cb();
      })
    }
  }
  function progress() {
    const f = window.scrollY;
    const h = window.innerHeight;
    const t = f + h;
    conts.forEach(e => {
      if (e.offsetTop < t && e.offsetTop + e.offsetHeight > f) {
        const p = parseInt((t - e.offsetTop) / (h + e.offsetHeight) * 1000);
        const id = parseInt(e.id.substr(e.id.lastIndexOf('-') + 1));
        data.cuts[id].setProgress(p);
      }
    });
  }

  window.addEventListener('scroll', scrollListener(progress));

  return {
    loadCuts: loadCuts,
    cuts: cuts,
    container: container,
    baseUrl: baseUrl,
    redraw: redraw
  };
})();
