const parser = (() => {
  let data = { url: '' };
  const baseUrl = (url) => (data.url = url || data.url);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function parse(e, j, w) {
    const map = j.map;
    const flow = j.flow;
    const size = j.size;
    const scale = w / size.width;
    size.height = w * size.height / size.width;
    size.width = w;
    const stage = new Konva.Stage({
      container: e,
      width: size.width,
      height: size.height,
      scale: { x: scale, y: scale },
      listening: false
    });
    const layer = new Konva.Layer();
    const group = new Konva.Group();
    const total = map.length;
    var loaded = 0;
    map.map((o, i) => {
      Konva.Image.fromURL(data.url + o.path, (n) => {
        n.setAttrs(o.attrs);
        n.id('i' + i);
        group.add(n);
        loaded++;
        return n;
      });
    });
    layer.add(group);
    stage.add(layer);
    const waitForLoad = async function (cb) {
      while (total != loaded) await sleep(50);
      for (const f of flow) {
        const i = parseInt(f.src.substr(f.src.lastIndexOf('-') + 1));
        f.obj = stage.find('#i' + i);
        f.max = Math.min(f.time.length, f.data.length);

      };
      cb({
        map: map,
        stage: stage,
        size: size,
        flow: flow,
      });
    };
    return {
      stage: stage,
      size: size,
      flow: flow,
      waitForLoad: waitForLoad
    };
  }
  return { parse: parse, baseUrl: baseUrl };
})();
