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

  /* ---- Footer client trust signals ---- */
  var footerShell = doc.querySelector('.site-footer .shell');
  if (footerShell && !footerShell.querySelector('.footer-trust')) {
    var script = doc.querySelector('script[src*="js/main.js"]');
    var logoBase = script ? new URL('../images/Client%20logos/', script.src).href : '/images/Client%20logos/';
    var clients = [
      { file: 'Bisho%20Municipality.jpg', alt: 'Bisho Municipality logo', width: 521, height: 421 },
      { file: 'BP.png', alt: 'BP logo', width: 678, height: 452 },
      { file: 'Jo%20Jackson%20Dance%20Company.jfif', alt: 'Jo Jackson Dance Company logo', width: 447, height: 447 },
      { file: 'NBC.png', alt: 'NBC logo', width: 568, height: 352 }
    ];
    var trust = doc.createElement('section');
    trust.className = 'footer-trust';
    trust.setAttribute('aria-labelledby', 'footer-trust-title');

    var title = doc.createElement('p');
    title.className = 'footer-trust-title';
    title.id = 'footer-trust-title';
    title.textContent = 'Trusted by';
    trust.appendChild(title);

    var logos = doc.createElement('ul');
    logos.className = 'footer-client-logos';
    clients.forEach(function (client) {
      var item = doc.createElement('li');
      item.className = 'footer-client-logo';
      var image = doc.createElement('img');
      image.src = logoBase + client.file;
      image.alt = client.alt;
      image.width = client.width;
      image.height = client.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      item.appendChild(image);
      logos.appendChild(item);
    });
    trust.appendChild(logos);
    footerShell.insertBefore(trust, footerShell.querySelector('.footer-bottom'));
  }

  /* ---- Mobile drawer ---- */
  var toggle = doc.getElementById('navToggle');
  var drawer = doc.getElementById('navDrawer');
  var scrim  = doc.getElementById('drawerScrim');
  var close  = doc.getElementById('drawerClose');
  var lastDrawerFocus;
  var drawerFocusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openDrawer() {
    if (!drawer) return;
    lastDrawerFocus = doc.activeElement;
    drawer.classList.add('is-open');
    scrim && scrim.classList.add('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
    window.setTimeout(function () { if (close) close.focus(); }, 0);
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    scrim && scrim.classList.remove('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = '';
    if (lastDrawerFocus && typeof lastDrawerFocus.focus === 'function') lastDrawerFocus.focus();
    lastDrawerFocus = null;
  }
  toggle && toggle.addEventListener('click', openDrawer);
  close  && close.addEventListener('click', closeDrawer);
  scrim  && scrim.addEventListener('click', closeDrawer);
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab' || !drawer || !drawer.classList.contains('is-open')) return;
    var items = Array.prototype.slice.call(drawer.querySelectorAll(drawerFocusable));
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  });
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

  /* ---- Testimonials rotator ----
     Renders only when at least one real .testi-card is present.
     Add cards inside [data-testimonials] to activate; never populate with
     fabricated quotes. */
  (function () {
    var block = doc.querySelector('[data-testimonials]');
    if (!block) return;
    var section = block.closest('[data-testimonials-section]') || block;
    var cards = Array.prototype.slice.call(block.querySelectorAll('.testi-card'));
    if (cards.length === 0) { section.hidden = true; return; }
    section.hidden = false;

    var dotsWrap = block.querySelector('.testi-dots');
    var idx = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var dots = cards.map(function (_, i) {
      var d = doc.createElement('button');
      d.type = 'button';
      d.className = 'testi-dot';
      d.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      d.addEventListener('click', function () { go(i, true); });
      dotsWrap && dotsWrap.appendChild(d);
      return d;
    });

    function render() {
      cards.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }
    function go(i, manual) {
      idx = (i + cards.length) % cards.length;
      render();
      if (manual) restart();
    }
    function next() { go(idx + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      if (!reduce && cards.length > 1) timer = setInterval(next, 6500);
    }

    if (dots.length <= 1 && dotsWrap) dotsWrap.style.display = 'none';
    render();
    restart();
    block.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    block.addEventListener('mouseleave', restart);
  })();

  /* ---- AJAX contact form ---- */
  var form = doc.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type=submit]');
      var status = doc.getElementById('form-status');
      var btnText = btn ? btn.innerHTML : '';
      if (status) { status.className = 'form-status col-2'; status.textContent = ''; }
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) {
          return r.json().catch(function () {
            return { ok: false, message: 'We could not send your enquiry right now. Please try again or email us directly.' };
          });
        })
        .then(function (res) {
          if (res && res.ok === true) {
            if (status) { status.classList.add('is-ok'); status.textContent = 'Thank you. Your enquiry has been received. The Auris Nexus Technologies team will be in touch shortly.'; }
            form.reset();
          } else {
            if (status) { status.classList.add('is-err'); status.textContent = (res && res.message) || 'We could not send your enquiry right now. Please try again or email us directly.'; }
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
