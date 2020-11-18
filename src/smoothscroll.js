window.addEventListener('wheel', (e) => {
  SS.offFlag();
});
window.addEventListener('touchmove', e => {
  SS.offFlag();
})

const SS = (() => {
  const e = document.scrollingElement;
  let dst = e.scrollTop;
  let src = 0;
  let ld = 0, lpd = 0;
  let run = false;
  let time = 0;
  const maxHeight = () => e.scrollHeight - e.clientHeight;
  const cbSetDelta = (d) => ld = d;
  const cbScrollStep = (d) => {
    // process 
    lpd = d;
    let td = d - ld;
    let dd = dst - src;
    let md = dd * ease(td / time);
    e.scrollTop = src + md;
    if (Math.abs(e.scrollTop - dst) > 1) {
      requestAnimationFrame(cbScrollStep);
    } else {
      run = false;
    }
  }
  const requestStep = () => {
    run = true;
    requestAnimationFrame(cbSetDelta);
    requestAnimationFrame(cbScrollStep);
  }
  const scrollToTop = () => scrollBy(-maxHeight());

  let o = document.scrollingElement;
  let h = window.innerHeight;
  let t = document.body.offsetHeight - h;
  let i = o.scrollTop;
  let offFlag = true;
  function func() {
    i += 4;
    o.scrollTop = i;
    console.log(o.scrollTop + '/' + t);
    if (o.scrollTop < document.body.offsetHeight - h && !offFlag) requestAnimationFrame(func);
  }
  function scroll() {
    if (!offFlag) return;
    offFlag = false;
    i = o.scrollTop;
    requestAnimationFrame(func);
  }
  const ease = (x) => {
    // return 1 - Math.pow(1 - x, 2);
    return Math.sin((x * Math.PI) / 2);
  }
  const scrollBy = (amt) => {
    src = e.scrollTop;
    dst += amt;
    if (dst < 0)
      dst = 0;
    else if (dst > maxHeight())
      dst = maxHeight();
    ld = lpd;
    time = Math.abs(dst - src) / 100 * 250;
    console.log(src + "/" + dst + "/" + time);
    if (!run)
      requestStep();
  };
  return { scrollBy: scrollBy, scrollToTop: scrollToTop, scrollToBottom: scroll, offFlag: () => offFlag = true };
})();