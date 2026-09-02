'use strict';
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const M = {
  'ai-integration.html': {
    t: 'AI Solutions | Practical AI for Business Workflows | Auris Nexus Technologies',
    d: 'Auris Nexus builds practical AI into real business workflows — intelligent assistants, document intelligence, AI-assisted decisions — where it removes work or improves an outcome.',
    k: 'AI solutions South Africa, practical AI for business, document intelligence, intelligent assistants, AI workflow automation, AI integration South Africa',
    name: 'AI Solutions', st: 'AI Solutions',
    sd: 'We build practical AI into the workflows your team already uses — assistants, extraction, classification, drafting and decision support.',
  },
  'web-development.html': {
    t: 'Digital Platforms | Portals, Web Apps &amp; Digital Products | Auris Nexus Technologies',
    d: 'Auris Nexus designs and builds the digital platforms your customers and teams log into — client portals, web applications, corporate websites and digital products.',
    k: 'client portal development South Africa, web application development, custom software development Johannesburg, digital product development, corporate website development',
    name: 'Digital Platforms', st: 'Digital Platform Development',
    sd: 'We design and build customer and organisation-facing digital experiences — portals, web applications, websites and products — connected to the systems behind them.',
  },
  'crm-business-management-systems.html': {
    t: 'Business Systems | Custom CRM, HR &amp; Operations Platforms | Auris Nexus Technologies',
    d: 'Auris Nexus builds central business systems — CRM, HR and leave, school management, operations and workflow platforms — that replace the spreadsheets a core process runs on.',
    k: 'custom business systems South Africa, custom CRM development, HR management software, school management software, operations management system, workflow management system',
    name: 'Business Systems', st: 'Business Systems Development',
    sd: 'We build the central platform a core operational process runs on — records, workflows, approvals, permissions and reporting in one place.',
  },
  'data-analytics-business-intelligence.html': {
    t: 'Data &amp; Business Intelligence | Dashboards &amp; Reporting | Auris Nexus Technologies',
    d: 'Auris Nexus connects your systems and builds dashboards and reporting that turn operational data into visibility management can act on.',
    k: 'business intelligence South Africa, management dashboards, operational reporting, data integration, analytics dashboards South Africa, automated reporting',
    name: 'Data & Business Intelligence', st: 'Business Intelligence',
    sd: 'We connect data sources, define the numbers that matter and build reporting that updates itself — dashboards, management reporting and analytics.',
  },
};
for (const [file, m] of Object.entries(M)) {
  const fp = path.join(ROOT, file);
  let h = fs.readFileSync(fp, 'utf8'); const orig = h;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${m.t}</title>`);
  h = h.replace(/<meta content="[^"]*" name="description"\/>/, `<meta content="${m.d}" name="description"/>`);
  h = h.replace(/<meta content="[^"]*" name="keywords"\/>/, `<meta content="${m.k}" name="keywords"/>`);
  h = h.replace(/<meta content="[^"]*" property="og:title"\/>/, `<meta content="${m.t}" property="og:title"/>`);
  h = h.replace(/<meta content="[^"]*" property="og:description"\/>/, `<meta content="${m.d}" property="og:description"/>`);
  h = h.replace(/<meta content="[^"]*" name="twitter:title"\/>/, `<meta content="${m.t}" name="twitter:title"/>`);
  h = h.replace(/<meta content="[^"]*" name="twitter:description"\/>/, `<meta content="${m.d}" name="twitter:description"/>`);
  h = h.replace(/"serviceType": "[^"]*"/, `"serviceType": "${m.st}"`);
  h = h.replace(/("@type": "Service",[\s\S]{0,400}?"description": ")[^"]*(")/, `$1${m.sd}$2`);
  h = h.replace(/("@type": "WebPage",[\s\S]*?"name": ")[^"]*(")/, `$1${m.name.replace(/&/g, '&')}$2`);
  h = h.replace(/("position": 2, "name": ")Services(", "item": ")[^"]*(")/, `$1Solutions$2https://aurisnexus.co.za/services.html$3`);
  if (h !== orig) fs.writeFileSync(fp, h);
  console.log((h !== orig ? 'update ' : 'nochg  ') + file);
}
