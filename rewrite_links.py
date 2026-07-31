from pathlib import Path
import re

root = Path('.')
page_map = {}
# Build a map of available html pages by relative URL path
for p in root.rglob('*.html'):
    rel = p.relative_to(root).as_posix()
    if rel == 'index.html':
        page_map['/'] = '/'
    elif rel == 'insights/index.html':
        page_map['/insights'] = '/insights/index.html'
        page_map['/insights/'] = '/insights/index.html'
    elif rel.startswith('insights/'):
        slug = rel[len('insights/'):-len('.html')]
        page_map[f'/insights/{slug}'] = f'/insights/{slug}.html'
        page_map[f'/insights/{slug}/'] = f'/insights/{slug}.html'
    else:
        slug = rel[:-len('.html')]
        page_map[f'/{slug}'] = f'/{slug}.html'
        page_map[f'/{slug}/'] = f'/{slug}.html'

# Also add root-relative without leading slash for top-level pages.
page_map.update({k[1:]: v for k, v in page_map.items() if k.startswith('/') and k != '/'})
page_map['insights'] = '/insights/index.html'
page_map['insights/'] = '/insights/index.html'

# Replace patterns in all html files
for path in root.rglob('*.html'):
    text = path.read_text(encoding='utf8')
    orig = text

    # normalize double slash in relative hrefs
    text = text.replace('href="..//"', 'href="../"')
    text = text.replace('href="..//', 'href="../')

    # Replace all known page path references in href values.
    for key, value in sorted(page_map.items(), key=lambda item: -len(item[0])):
        text = text.replace(f'href="{key}"', f'href="{value}"')
        text = text.replace(f'href="{key}/"', f'href="{value}"')
        text = text.replace(f'href="../{key}"', f'href="{value}"')
        text = text.replace(f'href="{key}"', f'href="{value}"')
    # also replace href="about" etc to absolute .html if exact match
    for key, value in page_map.items():
        if not key.startswith('/'):
            text = text.replace(f'href="{key}"', f'href="{value}"')
            text = text.replace(f'href="{key}/"', f'href="{value}"')
            text = text.replace(f'href="../{key}"', f'href="{value}"')

    # Update insights article direct links in footers and related lists, if not already .html
    text = re.sub(r'href="(/insights/([a-z0-9\-]+))"', r'href="\1.html"', text)
    text = re.sub(r'href="(../insights/([a-z0-9\-]+))"', r'href="\1.html"', text)

    # Update canonical / og urls for insights articles if missing .html
    # and breadcrumb structured data item values.
    def canonical_replace(match):
        url = match.group(1)
        if url.startswith('https://www.aurisnexus.co.za/insights/') and not url.endswith('.html'):
            return f'<link rel="canonical" href="{url}.html">'
        return match.group(0)
    text = re.sub(r'<link rel="canonical" href="([^"]+)">', canonical_replace, text)
    text = re.sub(r'<meta property="og:url" content="([^"]+)">', canonical_replace, text)

    # Update JSON-LD fields for item/breadcrumb and mainEntityOfPage
    text = re.sub(r'"item": "(https://www\.aurisnexus\.co\.za/insights/[^"]+?)"', lambda m: f'"item": "{m.group(1)}.html"' if not m.group(1).endswith('.html') else m.group(0), text)
    text = re.sub(r'"mainEntityOfPage": "(https://www\.aurisnexus\.co\.za/insights/[^"]+?)"', lambda m: f'"mainEntityOfPage": "{m.group(1)}.html"' if not m.group(1).endswith('.html') else m.group(0), text)

    # Replace any direct href references to /insights/index.html if needed
    text = text.replace('href="/insights"', 'href="/insights/index.html"').replace('href="/insights/"', 'href="/insights/index.html"')

    if text != orig:
        path.write_text(text, encoding='utf8')
        print(f'Updated {path.relative_to(root)}')
