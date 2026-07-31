/* Auris Nexus Business Solutions — interactions (vanilla, no dependencies) */
(function () {
  'use strict';

  var doc = document;

  /* ---- Sticky header shadow ---- */
  var header = doc.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  var toggle = doc.getElementById('navToggle');
  var drawer = doc.getElementById('navDrawer');
  var scrim  = doc.getElementById('drawerScrim');
  var close  = doc.getElementById('drawerClose');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    scrim && scrim.classList.add('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    scrim && scrim.classList.remove('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = '';
  }
  toggle && toggle.addEventListener('click', openDrawer);
  close  && close.addEventListener('click', closeDrawer);
  scrim  && scrim.addEventListener('click', closeDrawer);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  // Close drawer when a link inside it is tapped
  drawer && drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });

  /* ---- Reveal on scroll ---- */
  var reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }, 2600);
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- FAQ accordion ---- */
  doc.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close siblings in same group
      var group = item.parentElement;
      group && group.querySelectorAll('.faq-item.open').forEach(function (o) {
        if (o !== item) { o.classList.remove('open'); var oa = o.querySelector('.faq-a'); if (oa) oa.style.maxHeight = null; }
      });
      if (isOpen) { item.classList.remove('open'); a.style.maxHeight = null; }
      else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---- Reading progress (articles) ---- */
  var progress = doc.querySelector('.reading-progress');
  if (progress) {
    var update = function () {
      var top = window.scrollY || doc.documentElement.scrollTop;
      var total = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (total > 0 ? Math.min(100, (top / total) * 100) : 0) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---- Count-up metrics ---- */
  var counters = doc.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries, ob) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        ob.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now(), dur = 1300;
        (function step(now) {
          var p = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
        })(start);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- AJAX contact form ---- */
  var form = doc.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var status = doc.getElementById('form-status');
      var btnText = btn ? btn.innerHTML : '';
      if (status) { status.className = 'form-status col-2'; status.textContent = ''; }
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.status === 'OK') {
            if (status) { status.classList.add('is-ok'); status.textContent = res.message; }
            form.reset();
          } else {
            if (status) { status.classList.add('is-err'); status.textContent = (res && res.message) || 'Something went wrong. Please try again.'; }
          }
        })
        .catch(function () {
          if (status) { status.classList.add('is-err'); status.textContent = 'Could not reach the server. Please try again or email us directly.'; }
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = btnText; }
        });
    });
  }
})();
