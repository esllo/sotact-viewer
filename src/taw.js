const TAW = (() => {
  const data = { baseUrl: '', cntr: document.body };

  const baseUrl = (url) => (data.baseUrl = url || data.baseUrl);
  const container = (c) => (data.cntr = byQuery(c) || data.cntr);
  const cuts = () => data.cuts;
  const redraw = () => data.cuts.map(e => e.redraw());
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ratio = (() => {
    var win = window,
      doc = document,
      docElem = doc.documentElement,
      body = doc.getElementsByTagName('body')[0],
      x = win.innerWidth || docElem.clientWidth || body.clientWidth,
      y = win.innerHeight || docElem.clientHeight || body.clientHeight;
    let rat = (x / y);
    if (rat > 1.5) {
      return 0.3;
    } else if (rat > 1) {
      return 0.35;
    } else if (rat > 0.6) {
      return 0.4;
    } else {
      return 0.45;
    }
  })();

  function loadCuts(list) {
    data.cuts = [];
    const total = list.length;
    var count = 0, dist = 0;
    const width = parseInt(computedStyle(data.cntr).width);
    list.map((e, i) => {
      const c = createElem('div');
      if (e.endsWith('.json')) {
        const ii = i - dist;
        c.id = 'taw-cut-' + ii;
        c.className = 'taw-cut';
        data.cntr.appendChild(c);
        fetch(data.baseUrl + e)
          .then((r) => r.json())
          .then((j) => {
            const parsed = parser.parse(c, j, width);
            parsed.waitForLoad(() => {
              // pin
              const cut = Cut(parsed);
              cut.container = c;
              data.cuts[ii] = cut;
              count++;
            });
            setTimeout(parsed.stage.draw.bind(parsed.stage), 500);
          });
      } else {
        dist++;
        data.cntr.appendChild(c);
        if (e.endsWith('.png')) {
          c.className = 'taw-img';
          const im = createElem('img');
          im.src = data.baseUrl + e;
          c.appendChild(im);
        }
        if (e.startsWith('placeholder/')) {
          c.className = 'taw-box';
          e = e.substr(12).split('x');
          if (e.length == 2) {
            c.style.width = parseInt(e[0]) + 'px';
            c.style.height = parseInt(e[1]) + 'px';
          }
        }
      }
    });
    async function waitForLoad(cb) {
      while (total != count + dist) await sleep(50);
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
      let valid = false;
      const isValid = () => valid = (lay.children[0].children.map(e => e.zIndex() == e.id() ? '' : ' ').join('').length == 0)

      function setProgress(p) {
        if (!valid && !isValid())
          lay.children[0].children.map(e => e.zIndex(parseInt(e.id().substr(1))))
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
          if (fl.index != fl.max - 1) {
            for (const key of Object.keys(fl.data[fl.index])) {
              let value = fl.data[fl.index][key];
              if (!(key == "globalCompositeOperation" || key == "visible")) {
                let diffs = fl.data[fl.index + 1][key] - fl.data[fl.index][key];
                let dists = fl.time[fl.index + 1] - fl.time[fl.index];
                let prgrs = p - fl.time[fl.index];
                value += diffs * (prgrs / dists);
              }
              fl.obj[key](value);
            }
          } else {
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
        redraw: redraw,
        stage: stg
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
    conts.forEach((e, i) => {
      let offset = e.offsetHeight * ratio + (e.offsetWidth / e.offsetHeight > 1.2 ? 0.2 : 0);
      if (e.offsetTop < t && e.offsetTop + e.offsetHeight > f) {
        const id = parseInt(e.id.substr(e.id.lastIndexOf('-') + 1));
        let p = 0;
        if (e.offsetTop > t - offset) {
          p = 0;
        } else if (e.offsetTop + e.offsetHeight < f + offset) {
          p = 100;
        } else {
          p = (t - e.offsetTop - offset) / (h + e.offsetHeight - offset * 2) * 100;
        }
        data.cuts[id].setProgress(p);
        console.log(p);
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
