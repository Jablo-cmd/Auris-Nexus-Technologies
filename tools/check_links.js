/* Verify internal href/src targets resolve to a real file, and flag tag imbalance.
   Run: node tools/check_links.js */
'use strict';
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'design-source' || e.name === 'docs' || e.name === 'tools') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(ROOT);

let problems = 0;
const attrRe = /(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, 'utf8');

  // tag balance
  for (const tag of ['section', 'div', 'main', 'article', 'dl', 'ul', 'form']) {
    const o = (html.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
    const c = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (o !== c) { console.log(`  TAG  ${rel}: <${tag}> ${o} open / ${c} close`); problems++; }
  }

  let m;
  const seen = new Set();
  while ((m = attrRe.exec(html))) {
    let url = m[1].trim();
    if (!url || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('data:') || url.startsWith('//')) continue;
    if (seen.has(url)) continue; seen.add(url);
    let decoded;
    try { decoded = decodeURIComponent(url); } catch { decoded = url; }
    let target;
    if (decoded.startsWith('/')) target = path.join(ROOT, decoded);
    else target = path.resolve(path.dirname(file), decoded);
    // directory URL -> index.html
    let ok = fs.existsSync(target);
    if (ok && fs.statSync(target).isDirectory()) ok = fs.existsSync(path.join(target, 'index.html'));
    if (!ok && (url.endsWith('/') )) ok = fs.existsSync(path.join(target, 'index.html'));
    if (!ok) { console.log(`  LINK ${rel}: ${url}`); problems++; }
  }
}
console.log(problems ? `\n${problems} problem(s).` : '\nAll internal links & tags OK.');
