import pathlib, shutil
root = pathlib.Path('images')
if not root.exists():
    print('images directory not found')
    raise SystemExit(1)
for path in sorted(root.rglob('*')):
    if path.is_file():
        print(path.as_posix(), path.stat().st_size)
print('---')
for cmd in ['cwebp', 'magick', 'convert', 'ffmpeg']:
    print(cmd, shutil.which(cmd))
