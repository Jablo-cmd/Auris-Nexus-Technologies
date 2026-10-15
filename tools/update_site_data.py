"""Normalise contact details in published pages.

Rewrites bare email hrefs to mailto: links and replaces any legacy spelling of
the business address with the canonical one:
    140 Linden Street, Sandown, Sandton, Gauteng 2196, South Africa
Structured data is owned by tools/build_schema.py; run that afterwards.

Usage: python tools/update_site_data.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
ADDRESS = '140 Linden Street, Sandown, Sandton, Gauteng 2196, South Africa'
# Legacy variants ("Rd"/"R-o-a-d", the old Bryanston suburb, the 2031 PO Box code).
LEGACY_STREET = r'140\s+Linden\s+R(?:oa)?d\.?'
patterns = [
    (re.compile(r'href="info@aurisnexus\.co\.za"'), 'href="mailto:info@aurisnexus.co.za"'),
    (re.compile(r"href='info@aurisnexus\.co\.za'"), "href='mailto:info@aurisnexus.co.za'"),
    (re.compile(r'sales@aurisnexus\.co\.za'), 'info@aurisnexus.co.za'),
    (re.compile(LEGACY_STREET + r'(?:,\s*(?:Bryanston|Sandown))?(?:,\s*Sandton)?(?:,\s*Gauteng)?(?:,?\s*(?:2196|2031))?(?:,\s*South Africa)?', re.I), ADDRESS),
    (re.compile(r'140(?:%20|\+)Linden(?:%20|\+)R(?:oa)?d[^"&\s]*', re.I), '140%20Linden%20Street%2C%20Sandown%2C%20Sandton%202196'),
]
SKIP = {'.git', 'node_modules', 'docs', 'tools', 'design-source'}

changed_files = []
for p in ROOT.rglob('*'):
    if p.suffix not in {'.html', '.txt', '.xml'} or SKIP & set(p.relative_to(ROOT).parts):
        continue
    text = p.read_text(encoding='utf-8')
    new = text
    for pattern, repl in patterns:
        new = pattern.sub(repl, new)
    if new != text:
        p.write_text(new, encoding='utf-8')
        changed_files.append(p.relative_to(ROOT).as_posix())
print(len(changed_files), 'files changed')
for p in changed_files:
    print(p)
