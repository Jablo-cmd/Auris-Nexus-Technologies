/* Maintain one canonical LocalBusiness entity across Auris Nexus HTML pages.
   Run: node tools/add_localbusiness.js
   The registered street name is Linden Street; this file is also protected by qa_audit.py. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const NODE = {
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': 'https://aurisnexus.co.za/#localbusiness',
  name: 'Auris Nexus Technologies',
  description: 'Technology consulting and digital solutions partner helping organisations solve operational challenges through custom software, automation, digital transformation and AI integration.',
  url: 'https://aurisnexus.co.za/',
  logo: 'https://aurisnexus.co.za/images/Auri%20logo.webp',
  image: 'https://aurisnexus.co.za/images/Web%20Development%20Hero.webp',
  telephone: '+27631226552',
  email: 'info@aurisnexus.co.za',
  priceRange: 'R12 500+',
  currenciesAccepted: 'ZAR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '140 Linden Street',
    addressLocality: 'Sandown',
    addressRegion: 'Gauteng',
    postalCode: '2196',
    addressCountry: 'ZA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -26.109677,
    longitude: 28.021826,
  },
  hasMap: 'https://maps.google.com/?q=140+Linden+Street,+Sandown,+Sandton,+Gauteng+2196',
  sameAs: [
    'https://za.linkedin.com/company/auris-nexus-technologies',
    'https://github.com/Jablo-cmd/Auris-Nexus-Technologies',
  ],
  founder: {
    '@type': 'Person',
    '@id': 'https://aurisnexus.co.za/about.html#loyiso-ngcala',
    name: 'Loyiso Ngcala',
    url: 'https://za.linkedin.com/in/ngcalasd7000',
  },
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'CIPC',
    value: '2026/606690/07',
  },
  areaServed: [
    { '@type': 'City', name: 'Sandton' },
    { '@type': 'City', name: 'Johannesburg' },
    { '@type': 'Country', name: 'South Africa' },
  ],
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '17:00',
  }],
};

const STANDALONE = '<script type="application/ld+json">\n' +
  JSON.stringify({ '@context': 'https://schema.org', ...NODE }, null, 2) +
  '\n</script>\n';

function hasType(node, type) {
  if (!node || typeof node !== 'object') return false;
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  return types.includes(type);
}

function isLocalBusiness(node) {
  return !!node && typeof node === 'object' &&
    (node['@id'] === NODE['@id'] || hasType(node, 'LocalBusiness'));
}

function updateJsonLd(source) {
  const data = JSON.parse(source);
  if (Array.isArray(data['@graph'])) {
    let found = false;
    data['@graph'] = data['@graph'].map((node) => {
      if (isLocalBusiness(node)) {
        found = true;
        return NODE;
      }
      return node;
    });
    if (!found) data['@graph'].push(NODE);
    return JSON.stringify(data, null, 2);
  }
  if (isLocalBusiness(data)) {
    return JSON.stringify({ '@context': 'https://schema.org', ...NODE }, null, 2);
  }
  return null;
}

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'tools', 'docs', 'design-source', '.git'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) files.push(file);
  }
})(ROOT);

let changed = 0;
for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file).replace(/\\/g, '/');
  if (/^(403|404|500)\.html$/.test(relative) || /http-equiv="refresh"/i.test(html)) {
    console.log('skip    ' + relative + ' (error/redirect page)');
    continue;
  }
  if (/^google[0-9a-f]+\.html$/.test(relative)) {
    console.log('skip    ' + relative + ' (search console verification file)');
    continue;
  }

  const original = html;
  let foundBusinessNode = false;
  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (whole, body) => {
      const updated = updateJsonLd(body);
      if (updated === null) return whole;
      foundBusinessNode = true;
      return '<script type="application/ld+json">\n' + updated + '\n</script>';
    }
  );

  if (!foundBusinessNode) {
    if (!html.includes('</head>')) {
      throw new Error('Cannot add LocalBusiness schema; missing </head> in ' + relative);
    }
    html = html.replace('</head>', STANDALONE + '</head>');
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    changed += 1;
    console.log('updated ' + relative);
  } else {
    console.log('ok      ' + relative);
  }
}
console.log('LocalBusiness schema audit complete. Pages changed: ' + changed + ' / ' + files.length);
