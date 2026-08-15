from pathlib import Path
import re

root = Path('.')
exts = {'.html', '.css', '.js', '.json', '.md', '.txt'}
replacements = {
    'ΓÇô': '–',
    'ΓÇö': '–',
    'ΓÇÖ': '’',
    'ΓÇª': '•',
    'ΓÇ’': '’',
    'ΓÇ”': '“',
    'ΓÇ¥': '”',
    'ΓÇ£': '“',
    '┬╖': '•',
    '┬®': '®',
    '┬©': '©',
    '┬': '',
    'Ã©': 'é',
    'Ã±': 'ñ',
    'Ã¼': 'ü',
    'Ã¶': 'ö',
    'Ã¤': 'ä',
    'Ã«': 'ë',
    'Ã¨': 'è',
    'Ãª': 'ê',
    'Ã¢': 'â',
    'Ã´': 'ô',
    'Ã€': 'À',
    'Ã‚': 'Â',
    'Ãƒ': 'Ã',
    'Ã…': 'Å',
    'Ã˜': 'Ø',
    'Ã‡': 'Ç',
    'Â“': '“',
    'Â”': '”',
    'Â’': '’',
    'Â–': '–',
    'Â…': '…',
    'Â ': ' ',
}

meta_charset_re = re.compile(
    r'<meta\s+charset=["\']?[^"\'>]+["\']?\s*/?>', re.I
)
http_equiv_re = re.compile(
    r'<meta\s+http-equiv=["\']?Content-Type["\']?[^>]*charset=["\']?[^"\'>]+["\']?[^>]*>', re.I
)
head_tag_re = re.compile(r'<head[^>]*>', re.I)

fixed_files = []
all_files = []

for path in sorted(root.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in exts:
        continue
    all_files.append(path)
    raw = path.read_bytes()
    text = None
    had_bom = False
    for codec in ['utf-8-sig', 'utf-8']:
        try:
            text = raw.decode(codec)
            had_bom = codec == 'utf-8-sig' and raw.startswith(b'\xef\xbb\xbf')
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        try:
            text = raw.decode('cp1252')
        except UnicodeDecodeError:
            text = raw.decode('latin-1', errors='replace')

    original = text
    for src, dst in replacements.items():
        if src in text:
            text = text.replace(src, dst)
    # Normalize HTML charset meta tags to exact form
    if path.suffix.lower() == '.html':
        if http_equiv_re.search(text):
            text = http_equiv_re.sub('<meta charset="UTF-8">', text)
        text = meta_charset_re.sub('<meta charset="UTF-8">', text)
        if '<head' in text and '<meta charset="UTF-8">' not in text:
            m = head_tag_re.search(text)
            if m:
                insert_at = m.end()
                text = text[:insert_at] + '\n    <meta charset="UTF-8">' + text[insert_at:]
            else:
                text = '<meta charset="UTF-8">\n' + text

    if text != original or had_bom:
        path.write_text(text, encoding='utf-8')
        fixed_files.append(path)

print(f'Processed {len(all_files)} files. Fixed {len(fixed_files)} files.')
for f in fixed_files:
    print(f'- {f}')
