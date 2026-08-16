from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image
import re, html

root = Path('.')

def humanize_alt(src):
    text = Path(src.split('?', 1)[0]).stem
    text = text.replace('-', ' ').replace('_', ' ').replace('.', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        return ''
    return ' '.join(w.capitalize() for w in text.split())


def resolve_img_path(img_src, html_path):
    src = img_src.split('?', 1)[0].split('#', 1)[0]
    if not src or src.startswith('http://') or src.startswith('https://'):
        return None
    if src.startswith('/'):
        return root / src.lstrip('/')
    return (html_path.parent / src).resolve()


def get_image_dimensions(img_src, html_path):
    img_file = resolve_img_path(img_src, html_path)
    if not img_file or not img_file.exists():
        return None
    try:
        with Image.open(img_file) as im:
            return im.width, im.height
    except Exception:
        return None


def find_preload_target(soup):
    # Prefer hero image in the first visible hero section.
    for selector in ['.hero-visual img', '.page-hero-media img', '.article-hero-img img', '.hero img']:
        el = soup.select_one(selector)
        if el and el.get('src'):
            return el['src']
    # fallback to first local image
    img = soup.find('img', src=re.compile(r'^(/|\.\.)?images/'))
    return img['src'] if img else None


def add_webp_picture(img, html_path):
    src = img.get('src', '')
    if not src or img.parent.name == 'picture':
        return False
    if src.startswith('http://') or src.startswith('https://'):
        return False
    src_path = resolve_img_path(src, html_path)
    if not src_path:
        return False
    webp_path = src_path.with_suffix('.webp')
    if not webp_path.exists():
        return False
    relpath = src.replace(src_path.suffix, '.webp')
    picture = soup.new_tag('picture')
    source = soup.new_tag('source')
    source.attrs['type'] = 'image/webp'
    source.attrs['srcset'] = relpath
    picture.append(source)
    img.replace_with(picture)
    picture.append(img)
    return True


html_files = [p for p in root.rglob('*.html') if 'node_modules' not in p.parts]
print('Processing', len(html_files), 'HTML files')
updated = 0
for path in html_files:
    text = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(text, 'html.parser')
    changed = False
    header = soup.find('header', class_='site-header')
    if header and header.get('role') != 'banner':
        header['role'] = 'banner'
        changed = True
    main = soup.find('main', id='main')
    if main and main.get('role') != 'main':
        main['role'] = 'main'
        changed = True
    for script in soup.find_all('script', src=True):
        src = script['src']
        if src.endswith('js/main.js') and not script.has_attr('defer'):
            script['defer'] = None
            changed = True
    for iframe in soup.find_all('iframe'):
        if not iframe.has_attr('loading'):
            iframe['loading'] = 'lazy'
            changed = True
        if not iframe.has_attr('title'):
            iframe['title'] = 'Embedded content'
            changed = True
    for img in soup.find_all('img'):
        if not img.has_attr('alt'):
            if any(cls in img.get('class', []) for cls in ['brand-logo', 'logo', 'icon', 'hero-logo', 'nav-logo']):
                img['alt'] = ''
            else:
                img['alt'] = humanize_alt(img.get('src', ''))
            changed = True
        if not img.has_attr('width') or not img.has_attr('height'):
            dims = get_image_dimensions(img.get('src', ''), path)
            if dims:
                img['width'] = str(dims[0])
                img['height'] = str(dims[1])
                changed = True
        src = img.get('src', '')
        css_classes = img.get('class', [])
        is_hero = '/images/hero/' in src or any('hero' in c for c in css_classes)
        if is_hero:
            if img.has_attr('loading'):
                del img['loading']
                changed = True
            if img.get('fetchpriority') != 'high':
                img['fetchpriority'] = 'high'
                changed = True
            if img.get('decoding') != 'async':
                img['decoding'] = 'async'
                changed = True
    if path.name in ('index.html', 'index_test.html', 'insights/index.html'):
        preload_src = find_preload_target(soup)
        if preload_src:
            existing = soup.find('link', rel='preload', href=preload_src)
            if not existing:
                link_tag = soup.new_tag('link', rel='preload', as_='image', href=preload_src)
                if soup.head:
                    soup.head.append(link_tag)
                    changed = True
    # Add JSON-LD WebPage and Breadcrumb if not already present
    ld_script = soup.find('script', type='application/ld+json')
    if ld_script and ld_script.string and '"@type": "WebPage"' not in ld_script.string:
        ld_text = ld_script.string
        if '"@graph": [' in ld_text:
            insert_at = ld_text.rfind(']')
            if insert_at != -1:
                page_name = 'Home' if path.name in ('index.html', 'index_test.html') else Path(path.name).stem.replace('-', ' ').title()
                page_url = 'https://www.aurisnexus.co.za/' if path.name in ('index.html', 'index_test.html') else f'https://www.aurisnexus.co.za/{path.name}'
                desc_match = re.search(r'<meta name="description" content="([^"]*)"', text)
                description = desc_match.group(1) if desc_match else ''
                description = description.replace('"', '\\"')
                web_page_snippet = (',\n    {\n      "@type": "WebPage",\n      "url": "' + page_url + '",\n      "name": "' + page_name + '",\n      "description": "' + description + '",\n      "breadcrumb": {\n        "@type": "BreadcrumbList",\n        "itemListElement": [\n          {\n            "@type": "ListItem",\n            "position": 1,\n            "name": "Home",\n            "item": "https://www.aurisnexus.co.za/"\n          },\n          {\n            "@type": "ListItem",\n            "position": 2,\n            "name": "' + page_name + '",\n            "item": "' + page_url + '"\n          }\n        ]\n      }\n    }')
                ld_script.string = ld_text[:insert_at] + web_page_snippet + ld_text[insert_at:]
                changed = True
    if changed:
        path.write_text(str(soup), encoding='utf-8')
        updated += 1
        print('Updated', path)

print('HTML files updated:', updated)
