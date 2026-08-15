from pathlib import Path
import re
patterns = [
    (re.compile(r'href="info@aurisnexus\.co\.za"'), 'href="mailto:info@aurisnexus.co.za"'),
    (re.compile(r'href=\'info@aurisnexus\.co\.za\''), "href='mailto:info@aurisnexus.co.za'"),
    (re.compile(r'140 Linden Road, Bryanston, Sandton, 2196'), '140 Linden Road Sandown'),
    (re.compile(r'140 Linden Road, Bryanston, Sandton'), '140 Linden Road Sandown'),
    (re.compile(r'140 Linden Road, Sandown, Sandton, 2196'), '140 Linden Road Sandown'),
    (re.compile(r'140 Linden Road, Sandown, Sandton'), '140 Linden Road Sandown'),
    (re.compile(r'140%20Linden%20Rd%2C%20Bryanston%2C%20Sandton'), '140%20Linden%20Road%2C%20Sandown'),
    (re.compile(r'"addressLocality": "Sandton"'), '"addressLocality": "Sandown"'),
]
paths = list(Path('.').rglob('*.html')) + list(Path('.').rglob('*.php')) + list(Path('.').rglob('*.txt'))
changed_files = []
for p in paths:
    text = p.read_text(encoding='utf-8')
    new = text
    for pattern, repl in patterns:
        new = pattern.sub(repl, new)
    if new != text:
        p.write_text(new, encoding='utf-8')
        changed_files.append(str(p))
print(len(changed_files), 'files changed')
for p in changed_files:
    print(p)
