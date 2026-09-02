/* Headless smoke test: load key pages, capture console errors, check core elements & nav.
   Run: node tools/smoke.js */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8801;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jfif': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    res.statusCode = 404; res.end('404'); return;
  }
  res.setHeader('Content-Type', MIME[path.extname(fp)] || 'application/octet-stream');
  fs.createReadStream(fp).pipe(res);
});

const PAGES = ["/","/services.html","/portfolio.html","/about.html","/industries.html","/contact.html","/pricing.html","/faq.html","/privacy.html","/terms.html","/web-development.html","/web-design.html","/crm-business-management-systems.html","/business-automation.html","/mobile-app-development.html","/ai-integration.html","/data-analytics-business-intelligence.html","/insights/","/insights/business-automation.html","/insights/software-that-scales.html","/insights/digital-transformation-roadmap.html","/insights/ai-business-outcomes.html","/insights/case-study-service-delivery.html","/insights/pro-energy-solutions.html","/insights/modern-web-development.html","/insights/cloud-migration-guide.html","/insights/cyber-resilience.html","/404.html"];
const VIEWPORTS = [[375, 812], [768, 1024], [1440, 900]];

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch();
  let fails = 0;

  for (const pagePath of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    const resp = await page.goto(`http://localhost:${PORT}${pagePath}`, { waitUntil: 'networkidle' }).catch(e => ({ _err: e }));

    const status = resp && resp.status ? resp.status() : 'ERR';
    const h1 = await page.locator('h1').first().textContent().catch(() => null);
    const navCount = await page.locator('header .nav-link').count().catch(() => 0);
    const hasFooter = await page.locator('footer.site-footer').count().catch(() => 0);

    // horizontal overflow check across viewports
    let overflow = [];
    for (const [w, hgt] of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: hgt });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      const cw = await page.evaluate(() => document.documentElement.clientWidth);
      if (sw - cw > 2) overflow.push(`${w}px(+${sw - cw})`);
    }

    // filter noise (offline third-party)
    const realErrors = errors.filter(e =>
      !/googletagmanager|google-analytics|gtag|net::ERR|Failed to load resource.*(analytics|gtm)|ERR_INTERNET/i.test(e));

    const ok = status === 200 && h1 && navCount >= 5 && hasFooter && overflow.length === 0 && realErrors.length === 0;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${pagePath}`);
    console.log(`      status=${status} nav=${navCount} footer=${hasFooter} h1="${(h1 || '').trim().slice(0, 60)}"`);
    if (overflow.length) console.log(`      OVERFLOW: ${overflow.join(', ')}`);
    if (realErrors.length) realErrors.forEach(e => console.log(`      CONSOLE: ${e}`));
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log(fails ? `\n${fails} page(s) failed.` : '\nAll pages passed smoke test.');
  process.exit(fails ? 1 : 0);
})();
