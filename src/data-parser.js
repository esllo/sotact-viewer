const parser = (() => {
  let data = { url: '' };
  const baseUrl = (url) => (data.url = url || data.url);
  function parse(e, j) {
    const map = j.map;
    const flow = j.flow;
    const size = j.size;
    const stage = new Konva.Stage({
      container: e.id,
      width: size.width,
      height: size.height,
    });
    const layer = new Konva.Layer();
    const group = new Konva.Group();
    map.map((o, i) => {
      Konva.Image.fromURL(data.url + o.path, (n) => {
        n.setAttrs(o.attrs);
        group.add(n);
        return n;
      });
    });
    layer.add(group);
    for (const f of flow) f.obj = findItem(layer, f.src);
    stage.add(layer);
    return {
      stage: stage,
      size: size,
      flow: flow,
    };
  }
  return { parse: parse, baseUrl: baseUrl };
})();
