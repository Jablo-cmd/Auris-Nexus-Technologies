/* Auris Nexus Business Solutions — interactions (vanilla, no dependencies) */
(function () {
  'use strict';

  var doc = document;

  /* ---- Analytics events (GA4 via the page's gtag, if loaded) ----
     Sent only through gtag, never as dataLayer events for GTM, so a GA4
     tag in the GTM container cannot record them a second time.
     Never pass personal information (name, email, phone, message). */
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function fieldValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && el.value ? el.value : '';
  }

  // WhatsApp, phone and email links anywhere on the page.
  doc.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var method = /^https:\/\/wa\.me\//.test(href) ? 'whatsapp'
      : /^tel:/i.test(href) ? 'phone'
      : /^mailto:/i.test(href) ? 'email' : '';
    if (!method) return;
    var area = a.closest('.site-header, .drawer, .tabbar, .site-footer, main');
    var position = !area ? 'other'
      : area.classList.contains('site-header') ? 'header'
      : area.classList.contains('drawer') ? 'menu'
      : area.classList.contains('tabbar') ? 'tab_bar'
      : area.classList.contains('site-footer') ? 'footer' : 'content';
    track('contact_click', { method: method, link_position: position });
  });


  /* ---- Site-wide premium web promotion ticker ---- */
  (function mountPromotionTicker() {
    if (doc.getElementById('auris-promo-ticker')) return;

    var style = doc.createElement('style');
    style.id = 'auris-promo-ticker-styles';
    style.textContent = [
      '.auris-promo-ticker{--promo-navy:#001A48;--promo-cyan:#098FB4;--promo-teal:#00B3BF;position:relative;z-index:80;display:flex;align-items:center;gap:clamp(12px,2vw,28px);width:100%;min-height:46px;padding:8px 0;overflow:hidden;background:linear-gradient(105deg,#001338 0%,var(--promo-navy) 34%,#064B80 72%,var(--promo-cyan) 100%);color:#fff;border-top:3px solid var(--promo-teal);border-bottom:2px solid rgba(0,179,191,.95);box-shadow:0 8px 24px rgba(0,26,72,.2);isolation:isolate}',
      '.auris-promo-ticker:before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(105deg,transparent 15%,rgba(255,255,255,.08) 48%,transparent 72%);background-size:220% 100%;animation:auris-promo-sheen 8s ease-in-out infinite}',
      '.auris-promo-ticker__label{flex:0 0 auto;display:inline-flex;align-items:center;gap:9px;padding:10px 14px;border:1px solid rgba(112,243,238,.65);border-radius:7px;background:linear-gradient(135deg,#00B3BF,#75F3ED);box-shadow:0 0 22px rgba(0,179,191,.22);font-size:.72rem;font-weight:900;letter-spacing:.075em;text-transform:uppercase;color:#001A48;white-space:nowrap}',
      '.auris-promo-ticker__dot{width:8px;height:8px;flex:0 0 8px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(0,26,72,.12),0 0 14px rgba(255,255,255,.8);animation:auris-promo-pulse 1.8s ease-in-out infinite}',
      '.auris-promo-ticker__viewport{flex:1 1 auto;min-width:0;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)}',
      '.auris-promo-ticker__track{display:flex;width:max-content;align-items:center;will-change:transform;animation:auris-promo-right 34s linear infinite}',
      '.auris-promo-ticker__group{display:flex;flex:0 0 auto;align-items:center;gap:clamp(24px,4vw,54px);padding-right:clamp(24px,4vw,54px);white-space:nowrap}',
      '.auris-promo-ticker__message{display:inline-flex;align-items:center;gap:10px;font-size:.94rem;font-weight:700;letter-spacing:.005em;color:#fff;white-space:nowrap;text-shadow:0 1px 10px rgba(0,0,0,.15)}',
      '.auris-promo-ticker__message strong{font-weight:900;color:#8BFFF8;letter-spacing:.035em}',
      '.auris-promo-ticker__spark{color:#70f3ee;font-size:1rem}',
      '.auris-promo-ticker__cta{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:9px 18px;border:2px solid #fff;border-radius:7px;background:#fff;color:var(--promo-navy);font-size:.82rem;font-weight:900;white-space:nowrap;box-shadow:0 5px 20px rgba(0,0,0,.2);transition:background .2s ease,transform .2s ease,box-shadow .2s ease}',
      '.auris-promo-ticker__cta:hover{background:#8af5f0;border-color:#8af5f0;transform:translateY(-2px);box-shadow:0 8px 26px rgba(0,179,191,.45)}',
      '.auris-promo-ticker__cta:focus-visible{outline:3px solid #fff;outline-offset:3px}',
      '.auris-promo-ticker__cta svg{width:16px;height:16px;flex:0 0 16px}',
      '.auris-promo-ticker:focus-within .auris-promo-ticker__track,.auris-promo-ticker:hover .auris-promo-ticker__track{animation-play-state:paused}',
      '@keyframes auris-promo-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}',
      '@keyframes auris-promo-pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 4px rgba(0,26,72,.12),0 0 14px rgba(255,255,255,.8)}50%{transform:scale(1.18);box-shadow:0 0 0 7px rgba(0,26,72,.08),0 0 20px rgba(255,255,255,1)}}',
      '@keyframes auris-promo-sheen{0%,100%{background-position:100% 0}50%{background-position:0 0}}',
      '@media(max-width:760px){.auris-promo-ticker{min-height:42px;padding:7px 0}.auris-promo-ticker__label{font-size:.62rem;letter-spacing:.035em;padding:9px 10px;gap:6px}.auris-promo-ticker__message{font-size:.82rem}.auris-promo-ticker__cta{font-size:.72rem;min-height:38px;padding:7px 10px;gap:5px}.auris-promo-ticker__cta svg{width:14px;height:14px;flex-basis:14px}}',
      '@media(max-width:420px){.auris-promo-ticker{min-height:40px;padding:6px 0}.auris-promo-ticker__label{font-size:.57rem;letter-spacing:0;padding:8px 7px;gap:5px}.auris-promo-ticker__label-text{display:inline}.auris-promo-ticker__cta{padding:7px 8px;font-size:.68rem;gap:4px}.auris-promo-ticker__cta span{white-space:nowrap}.auris-promo-ticker__group{gap:20px}.auris-promo-ticker__message{font-size:.76rem}}',
      '@media(prefers-reduced-motion:reduce){.auris-promo-ticker:before{animation:none}.auris-promo-ticker__track{animation:none;transform:none}.auris-promo-ticker__group[aria-hidden="true"]{display:none}.auris-promo-ticker__viewport{mask-image:none}}'
    ].join('');
    doc.head.appendChild(style);

    var ticker = doc.createElement('aside');
    ticker.id = 'auris-promo-ticker';
    ticker.className = 'auris-promo-ticker';
    ticker.setAttribute('aria-label', 'Auris Nexus free technology consultation');
    var messages = '<span class="auris-promo-ticker__message"><span class="auris-promo-ticker__spark" aria-hidden="true">✦</span><strong>FREE TECHNOLOGY CONSULTATION</strong></span>' +
      '<span class="auris-promo-ticker__message">Custom software, automation and AI built around how your business works</span>' +
      '<span class="auris-promo-ticker__message"><span class="auris-promo-ticker__spark" aria-hidden="true">✦</span>Technology consulting · Software development · Business automation · AI integration</span>' +
      '<span class="auris-promo-ticker__message">Not sure where to start? Let’s talk.</span>';
    ticker.innerHTML =
      '<div class="auris-promo-ticker__viewport" aria-label="Free technology consultation. Custom software, automation and AI built around how your business works: technology consulting, software development, business automation and AI integration.">' +
        '<div class="auris-promo-ticker__track"><div class="auris-promo-ticker__group">' + messages + '</div><div class="auris-promo-ticker__group" aria-hidden="true">' + messages + '</div></div>' +
      '</div>';

    var header = doc.getElementById('siteHeader') || doc.querySelector('header.site-header');
    var skipLink = doc.querySelector('a.skip-link');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(ticker, header);
    } else if (skipLink && skipLink.parentNode) {
      skipLink.parentNode.insertBefore(ticker, skipLink.nextSibling);
    } else if (doc.body.firstChild) {
      doc.body.insertBefore(ticker, doc.body.firstChild);
    } else {
      doc.body.appendChild(ticker);
    }
  })();

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
            track('generate_lead', {
              form_type: fieldValue(form, 'enquiry_type') || 'contact',
              service: fieldValue(form, 'service'),
              project: fieldValue(form, 'project')
            });
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
