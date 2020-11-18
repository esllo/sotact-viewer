const Effect = (() => {

  let time = (new Date()).getTime();
  const ewrap = document.querySelector('.effect_wrap');
  const load = document.getElementById('load');
  const arrow = document.getElementById('arrow');
  document.scrollingElement.style.overflow='hidden';

  function _off() {
    let dist = 600;
    let tm = (new Date()).getTime() - time;
    setTimeout(off, tm < dist ? dist - tm : 10);
  }
  function off() {
    load.classList.add('off');
    setTimeout(() => {
      load.classList.add('dismount');
      arrow.style.display = 'block';
      setTimeout(() => {
        arrow.classList.add('on');
        setTimeout(() => {
          arrow.style.opacity = 0;
          setTimeout(() => {
            ewrap.classList.add('none');
            document.scrollingElement.style.overflow='auto';
          }, 200);
          setTimeout(() => {
            arrow.classList.remove('on')
            ewrap.style.display = 'none';
          }, 710)
        }, 1350);
      }, 10);
    }, 650);
  }
  return { off: _off };
})();