from pathlib import Path
import re

root = Path('.')
exts = ['.html', '.css', '.js', '.json', '.md', '.txt']
html_meta_re = re.compile(r'<meta\s+charset=["\']?utf-8["\']?\s*/?>', re.I)
mojibake = re.compile(r'ΓÇ|Ã|Â|┬')
no_charset = []
bad_files = []
for path in sorted(root.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in exts:
        continue
    text = path.read_text(encoding='utf-8')
    if path.suffix.lower() == '.html' and not html_meta_re.search(text):
        no_charset.append(path)
    if mojibake.search(text):
        bad_files.append(path)
print(f'missing charset: {len(no_charset)}')
for p in no_charset:
    print(p)
print(f'mojibake hits: {len(bad_files)}')
for p in bad_files:
    print(p)
