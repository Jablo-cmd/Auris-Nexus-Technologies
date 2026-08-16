from pathlib import Path
from bs4 import BeautifulSoup
root = Path('.')
issues = []
for path in sorted(root.rglob('*.html')):
    html = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    imgs = soup.find_all('img')
    for img in imgs:
        if not img.get('alt'):
            issues.append((path, 'img missing alt', str(img)))
        if not img.get('width') or not img.get('height'):
            issues.append((path, 'img missing dimension', str(img)))
    headers = soup.find_all('header', class_='site-header')
    for header in headers:
        if header.get('role') != 'banner':
            issues.append((path, 'header missing role=banner', str(header)[:100]))
    mains = soup.find_all('main', id='main')
    for main in mains:
        if main.get('role') != 'main':
            issues.append((path, 'main missing role=main', str(main)[:100]))
    scripts = soup.find_all('script', src=True)
    for script in scripts:
        if 'js/main.js' in script['src'] and not script.has_attr('defer'):
            issues.append((path, 'main.js script missing defer', str(script)))
    if path.name == 'index.html':
        if 'rel="preload" as="image" href="/images/hero/hero-digital-transformation.jpg"' not in html:
            issues.append((path, 'index missing hero preload', ''))
    if soup.find('iframe'):
        for iframe in soup.find_all('iframe'):
            if not iframe.get('loading'):
                issues.append((path, 'iframe missing loading', str(iframe)))
            if not iframe.get('title'):
                issues.append((path, 'iframe missing title', str(iframe)))

for issue in issues:
    print(issue[0], '-', issue[1])
print('Total issues', len(issues))
