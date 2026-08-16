from pathlib import Path
import re
root = Path('.')
exts = ['.html', '.css', '.js', '.json', '.md', '.txt']
pattern = re.compile(r'ΓÇ.|Ã.|Â.|┬.')
for path in sorted(root.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in exts:
        continue
    text = path.read_text(encoding='utf-8')
    matches = pattern.findall(text)
    if matches:
        unique = sorted(set(matches))
        print(path)
        print('  matches:', unique)
        for i, m in enumerate(unique[:20], 1):
            print(f'    {i}. {repr(m)}')
        print()