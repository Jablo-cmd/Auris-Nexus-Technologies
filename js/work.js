/* Auris Nexus — Work showroom: pointer-driven light and gentle parallax.
   Progressive enhancement only; does nothing for reduced-motion or touch. */
(function () {
  'use strict';
  var mq = window.matchMedia;
  if (!mq || mq('(prefers-reduced-motion: reduce)').matches || !mq('(hover: hover)').matches) return;

  function spot(el) {
    var raf = 0, x = 0, y = 0;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(function () {
        el.style.setProperty('--mx', x.toFixed(1) + '%');
        el.style.setProperty('--my', y.toFixed(1) + '%');
        raf = 0;
      });
    }, { passive: true });
  }
  document.querySelectorAll('.w-panel, .w-frame').forEach(spot);

  var stage = document.querySelector('.w-stage');
  if (stage) {
    var raf = 0, px = 0, py = 0;
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(function () {
        stage.style.setProperty('--px', px.toFixed(3));
        stage.style.setProperty('--py', py.toFixed(3));
        raf = 0;
      });
    }, { passive: true });
    stage.addEventListener('pointerleave', function () {
      stage.style.setProperty('--px', 0);
      stage.style.setProperty('--py', 0);
    });
  }
})();
