/* ============================================================
   Auris Nexus — global chrome rebuild
   Rewrites <header> + mobile drawer + tab bar + <footer> on every
   HTML page from a single canonical source so navigation, the
   Solutions mega-menu and the footer stay consistent site-wide.
   Run: node tools/rebuild_chrome.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ---- Icons (inline, currentColor) ---- */
const IC = {
  systems: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="8" rx="2"></rect><rect x="3" y="13" width="8" height="8" rx="2"></rect><rect x="13" y="13" width="8" height="8" rx="2"></rect></svg>',
  automation: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M17 2l4 4-4 4"></path><path d="M3 11V9a4 4 0 014-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a4 4 0 01-4 4H3"></path></svg>',
  ai: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"></path><path d="M5 19l.8 2.2L8 22l-2.2.8L5 25M19 4l.6 1.6L21 6l-1.4.4"></path></svg>',
  platforms: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M3 9h18M8 21h8M12 17v4"></path></svg>',
  data: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"></path></svg>',
  webdev: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16"></path></svg>',
  design: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"></path></svg>',
  mobile: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"></rect><path d="M11 18h2"></path></svg>',
  grid: '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
  wa: '<svg aria-hidden="true" fill="currentColor" viewbox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.7-.84-2-.94-.26-.1-.45-.14-.64.15s-.74.94-.9 1.13-.33.22-.62.08a8.2 8.2 0 01-2.4-1.48 9 9 0 01-1.67-2.07c-.17-.3 0-.46.13-.6.13-.13.29-.34.44-.5a2 2 0 00.29-.5.55.55 0 000-.52c-.08-.15-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49h-.55a1.05 1.05 0 00-.76.36 3.2 3.2 0 00-1 2.38 5.56 5.56 0 001.17 2.95 12.7 12.7 0 004.86 4.3c.68.29 1.2.46 1.62.59a3.9 3.9 0 001.79.11c.55-.08 1.7-.69 1.94-1.36s.24-1.24.17-1.36-.26-.2-.55-.34zM12 2a10 10 0 00-8.6 15.06L2 22l5.06-1.33A10 10 0 1012 2z"></path></svg>',
};

/* ---- Solutions taxonomy (drives mega-menu, drawer, footer) ---- */
const SOLUTIONS = [
  { href: '/web-development.html', title: 'Web Development', blurb: 'Business websites, web applications, client portals and internal business platforms.', ic: IC.webdev },
  { href: '/web-design.html', title: 'Web Design', blurb: 'Responsive, conversion-focused design — user experience, mobile-first and brand-aligned.', ic: IC.design },
  { href: '/crm-business-management-systems.html', title: 'Business Systems', blurb: 'Custom business software for a real process — CRM, HR, school management, operations.', ic: IC.systems },
  { href: '/business-automation.html', title: 'Business Automation', blurb: 'Remove repetitive manual work from approvals, admin and hand-offs.', ic: IC.automation },
  { href: '/mobile-app-development.html', title: 'Mobile App Development', blurb: 'Native and cross-platform apps that connect customers and field teams.', ic: IC.mobile },
  { href: '/ai-integration.html', title: 'AI Solutions', blurb: 'Practical AI inside real workflows — assistants, document intelligence, decision support.', ic: IC.ai },
  { href: '/data-analytics-business-intelligence.html', title: 'Data & Business Intelligence', blurb: 'Dashboards and reporting that turn operational data into decisions.', ic: IC.data },
];

const NAV = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'solutions', href: '/services.html', label: 'Solutions', mega: true },
  { key: 'industries', href: '/industries.html', label: 'Industries' },
  { key: 'work', href: '/portfolio.html', label: 'Work' },
  { key: 'about', href: '/about.html', label: 'About' },
  { key: 'insights', href: '/insights/', label: 'Insights' },
  { key: 'contact', href: '/contact.html', label: 'Contact' },
];

const WA = 'https://wa.me/27631226552';
const TAGLINE = 'Business technology, software and automation built around how your organisation actually works.';

/* ---- Builders ---- */
function megaMenu() {
  const items = SOLUTIONS.map(s => `
<a class="mega-item" href="${s.href}">
<span class="mega-ic">${s.ic}</span>
<span class="mega-tx">
<strong>${s.title}</strong>
<span>${s.blurb}</span>
</span>
</a>`).join('');
  return `
<div class="mega">
<div class="mega-grid">${items}
<a class="mega-item mega-item--all" href="/services.html">
<span class="mega-ic">${IC.grid}</span>
<span class="mega-tx">
<strong>View all solutions</strong>
<span>How we turn a business problem into the right system.</span>
</span>
</a>
</div>
</div>`;
}

function navLinks(active) {
  return NAV.map(n => {
    const cls = 'nav-link' + (n.key === active ? ' is-active' : '');
    if (n.mega) {
      return `<div class="has-mega">
<a class="${cls}" href="${n.href}">
Solutions
<svg aria-hidden="true" class="caret" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
</a>${megaMenu()}
</div>`;
    }
    return `<a class="${cls}" href="${n.href}">${n.label}</a>`;
  }).join('\n');
}

function drawerLinks(active) {
  return NAV.map(n => {
    const cls = 'drawer-link' + (n.key === active ? ' is-active' : '');
    return `<a class="${cls}" href="${n.href}">${n.label}</a>`;
  }).join('\n');
}

function drawerSolutions() {
  return SOLUTIONS.map(s =>
    `<a class="drawer-svc" href="${s.href}"><span class="mega-ic">${s.ic}</span>${s.title}</a>`
  ).join('\n');
}

function header(active) {
  return `<header class="site-header" id="siteHeader" role="banner">
<div class="shell nav">
<a aria-label="Auris Nexus Technologies – home" class="brand" href="/">
<img alt="Auris Nexus Technologies logo" class="brand-logo" height="40" src="/images/Auri%20logo.webp" width="40"/>
<span class="brand-name">Auris Nexus Technologies</span>
</a>
<nav aria-label="Primary" class="nav-links">
${navLinks(active)}
</nav>
<div class="nav-actions">
<a aria-label="Chat on WhatsApp" class="nav-wa" href="${WA}" rel="noopener" target="_blank">
${IC.wa}
</a>
<a class="btn btn-primary btn-sm nav-cta" href="/contact.html">Start a Project</a>
<button type="button" aria-controls="navDrawer" aria-expanded="false" aria-label="Open menu" class="nav-toggle" id="navToggle">
<span></span><span></span><span></span>
</button>
</div>
</div>
</header>
<!-- Mobile drawer -->
<div class="drawer-scrim" id="drawerScrim"></div>
<aside aria-hidden="true" class="drawer" id="navDrawer">
<div class="drawer-head">
<a class="brand" href="/">
<img alt="Auris Nexus Technologies logo" class="brand-logo" height="38" src="/images/Auri%20logo.webp" width="38"/>
<span class="brand-name">Auris Nexus Technologies</span>
</a>
<button type="button" aria-label="Close menu" class="drawer-close" id="drawerClose">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" viewbox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg>
</button>
</div>
<nav aria-label="Mobile" class="drawer-nav">
${drawerLinks(active)}
</nav>
<div class="drawer-services">
<p class="drawer-label">Solutions</p>
<div class="drawer-svc-grid">
${drawerSolutions()}
</div>
</div>
<div class="drawer-foot">
<a class="btn btn-primary btn-block" href="/contact.html">Start a Project</a>
<div class="drawer-contact">
<a href="tel:+27631226552">Call 063 122 6552</a>
<a href="mailto:info@aurisnexus.co.za">info@aurisnexus.co.za</a>
</div>
</div>
</aside>
<!-- Mobile bottom tab bar (app-like) -->
<nav aria-label="Quick navigation" class="tabbar">
<a class="tab${active === 'home' ? ' is-active' : ''}" href="/">
<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"></path></svg>
<span>Home</span>
</a>
<a class="tab${active === 'solutions' ? ' is-active' : ''}" href="/services.html">
<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><rect height="7" rx="1.5" width="7" x="3" y="3"></rect><rect height="7" rx="1.5" width="7" x="14" y="3"></rect><rect height="7" rx="1.5" width="7" x="3" y="14"></rect><rect height="7" rx="1.5" width="7" x="14" y="14"></rect></svg>
<span>Solutions</span>
</a>
<a aria-label="Start a project" class="tab tab-cta" href="/contact.html">
<span class="tab-cta-ring"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg></span>
</a>
<a class="tab${active === 'work' ? ' is-active' : ''}" href="/portfolio.html">
<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24"><path d="M3 7h18v12H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
<span>Work</span>
</a>
<a class="tab" href="${WA}" rel="noopener" target="_blank">
${IC.wa}
<span>WhatsApp</span>
</a>
</nav>
`;
}

function footer() {
  const solLinks = SOLUTIONS.map(s => `<li><a href="${s.href}">${s.title}</a></li>`).join('\n');
  return `<footer class="site-footer">
<div class="shell">
<div class="footer-cta reveal">
<div>
<span class="eyebrow">Let's talk</span>
<h2>Tell us what you're trying to improve, automate or build.</h2>
<p>We'll help work out what the right digital solution looks like — and what it would take to build it.</p>
</div>
<div class="footer-cta-actions">
<a class="btn btn-primary" href="/contact.html">Start a Project</a>
<a class="btn btn-ghost" href="${WA}" rel="noopener" target="_blank">Chat on WhatsApp</a>
</div>
</div>
<div class="footer-grid">
<div class="footer-brand">
<a class="brand" href="/">
<img alt="Auris Nexus Technologies logo" class="brand-logo" height="42" src="/images/Auri%20logo.webp" width="42"/>
<span class="brand-name">Auris Nexus Technologies</span>
</a>
<p>${TAGLINE}</p>
<a class="footer-wa" href="${WA}" rel="noopener" target="_blank">
${IC.wa}
063 122 6552</a>
</div>
<div class="footer-col">
<h4>Company</h4>
<ul>
<li><a href="/about.html">About</a></li>
<li><a href="/portfolio.html">Work</a></li>
<li><a href="/industries.html">Industries</a></li>
<li><a href="/pricing.html">Pricing</a></li>
<li><a href="/insights/">Insights</a></li>
<li><a href="/faq.html">FAQ</a></li>
<li><a href="/privacy.html">Privacy</a></li>
<li><a href="/terms.html">Terms</a></li>
</ul>
</div>
<div class="footer-col">
<h4>Solutions</h4>
<ul>
${solLinks}
<li><a class="footer-more" href="/services.html">All solutions →</a></li>
</ul>
</div>
<div class="footer-col">
<h4>Get in touch</h4>
<ul class="footer-contact">
<li><a href="tel:+27631226552">063 122 6552</a></li>
<li><a href="mailto:info@aurisnexus.co.za">info@aurisnexus.co.za</a></li>
<li><span>140 Linden Road, Sandown</span></li>
<li><span>Mon–Fri, 8am–5pm</span></li>
</ul>
</div>
</div>
<div class="footer-bottom">
<span>© 2026 Auris Nexus Technologies. All rights reserved.</span>
</div>
</div>
</footer>`;
}

/* ---- Per-file active-nav map ---- */
const ACTIVE = {
  'index.html': 'home',
  'services.html': 'solutions',
  'crm-business-management-systems.html': 'solutions',
  'business-automation.html': 'solutions',
  'ai-integration.html': 'solutions',
  'web-development.html': 'solutions',
  'data-analytics-business-intelligence.html': 'solutions',
  'web-design.html': 'solutions',
  'mobile-app-development.html': 'solutions',
  'industries.html': 'industries',
  'portfolio.html': 'work',
  'about.html': 'about',
  'contact.html': 'contact',
  'pricing.html': '',
  'faq.html': '',
  'privacy.html': '',
  'terms.html': '',
  '403.html': '', '404.html': '', '500.html': '',
};

function processFile(file) {
  const base = path.basename(file);
  const dir = path.dirname(path.relative(ROOT, file));
  const inInsights = dir === 'insights';
  const active = inInsights ? 'insights' : (ACTIVE[base] ?? null);
  if (active === null) return { file: base, skipped: true };

  let html = fs.readFileSync(file, 'utf8');
  const orig = html;

  // Replace header..(just before <main)
  const headerRe = /<header class="site-header"[\s\S]*?(?=<main[ >])/;
  if (headerRe.test(html)) {
    html = html.replace(headerRe, header(active) + '\n');
  } else {
    return { file: base, error: 'no header block' };
  }

  // Replace footer
  const footerRe = /<footer class="site-footer">[\s\S]*?<\/footer>/;
  if (footerRe.test(html)) {
    html = html.replace(footerRe, footer());
  } else {
    return { file: base, error: 'no footer block' };
  }

  // Update JSON-LD service array site-wide
  html = html.replace(
    /"service":\s*\[[\s\S]*?\]/,
    '"service": [\n        "Web Development",\n        "Web Design",\n        "Business Systems",\n        "Business Automation",\n        "Mobile App Development",\n        "AI Solutions",\n        "Data & Business Intelligence"\n      ]'
  );
  // Update stale org tagline in JSON-LD / OG where it appears
  html = html.replace(/AI, software &amp; secure digital solutions engineered for growth\./g,
    'Business technology, software and automation built around how your organisation works.');
  // Keep the LocalBusiness description aligned with the current service naming
  html = html.replace(
    /Business technology, software and automation partner in Johannesburg, South Africa — custom business systems, automation, AI solutions, digital platforms and business intelligence\./g,
    'Business technology partner in Johannesburg, South Africa — web development, web design, custom business software, mobile apps, automation, AI and business intelligence.'
  );

  if (html !== orig) fs.writeFileSync(file, html, 'utf8');
  return { file: base, changed: html !== orig, active };
}

const targets = [];
for (const f of fs.readdirSync(ROOT)) {
  if (f.endsWith('.html')) targets.push(path.join(ROOT, f));
}
const insightsDir = path.join(ROOT, 'insights');
for (const f of fs.readdirSync(insightsDir)) {
  if (f.endsWith('.html')) targets.push(path.join(insightsDir, f));
}

const results = targets.map(processFile);
for (const r of results) {
  if (r.skipped) console.log('  skip   ', r.file);
  else if (r.error) console.log('  ERROR  ', r.file, '-', r.error);
  else console.log(r.changed ? '  update ' : '  nochg  ', r.file, `(${r.active})`);
}
console.log('\nDone:', results.filter(r => r.changed).length, 'files updated.');
