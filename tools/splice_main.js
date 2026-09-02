/* Replace the <main id="main" ...> ... </main> block of a page.
   Usage: node tools/splice_main.js <target.html> <new-main-fragment.html> */
'use strict';
const fs = require('fs');
const [target, fragment] = process.argv.slice(2);
if (!target || !fragment) { console.error('usage: splice_main.js <target.html> <fragment.html>'); process.exit(1); }
const lines = fs.readFileSync(target, 'utf8').split(/\r?\n/);
const s = lines.findIndex(l => /^<main id="main"/.test(l.trim()));
const e = lines.findIndex((l, i) => i > s && l.trim() === '</main>');
if (s < 0 || e < 0) { console.error('main markers not found in', target); process.exit(1); }
const frag = fs.readFileSync(fragment, 'utf8').replace(/\r?\n$/, '');
fs.writeFileSync(target, [...lines.slice(0, s), frag, ...lines.slice(e + 1)].join('\n'));
console.log('spliced', target, `(lines ${s + 1}-${e + 1})`);
