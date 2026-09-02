/* Replace the minimal LocalBusiness JSON-LD node on every page with an
   enriched one (geo, opening hours, price range, area served, @id).
   Pages without a LocalBusiness node get a standalone script block.
   Run: node tools/add_localbusiness.js */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const NODE = {
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': 'https://aurisnexus.co.za/#localbusiness',
  name: 'Auris Nexus Technologies',
  description: 'Business technology, software and automation partner in Johannesburg, South Africa — custom business systems, automation, AI solutions, digital platforms and business intelligence.',
  url: 'https://aurisnexus.co.za/',
  logo: 'https://aurisnexus.co.za/images/Auri%20logo.webp',
  image: 'https://aurisnexus.co.za/images/Web%20Development%20Hero.webp',
  telephone: '+27631226552',
  email: 'info@aurisnexus.co.za',
  priceRange: 'R12 500+',
  currenciesAccepted: 'ZAR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '140 Linden Road',
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
  hasMap: 'https://maps.google.com/?q=140+Linden+Road,+Sandown,+2196',
  areaServed: { '@type': 'Country', name: 'South Africa' },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '17:00',
  }],
};

// pretty JSON, indented to sit inside a @graph array (6 spaces base)
const inGraph = JSON.stringify(NODE, null, 2).replace(/\n/g, '\n      ');
const standalone = '<script type="application/ld+json">\n' + JSON.stringify({ '@context': 'https://schema.org', ...NODE }, null, 2) + '\n</script>\n';

const RE = /\{\s*"@type":\s*"LocalBusiness"[\s\S]*?"addressCountry":\s*"ZA"\s*\}\s*\}/;

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', 'tools', 'docs', 'design-source'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(ROOT);

for (const f of files) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;
  if (RE.test(h)) {
    h = h.replace(RE, inGraph);
  } else if (/<script type="application\/ld\+json">/.test(h) && /aurisnexus\.co\.za/.test(h) && !h.includes('#localbusiness')) {
    // add a standalone block right before </head>
    h = h.replace('</head>', standalone + '</head>');
  }
  if (h !== orig) { fs.writeFileSync(f, h); console.log('update ', path.relative(ROOT, f)); }
  else console.log('nochg  ', path.relative(ROOT, f));
}
