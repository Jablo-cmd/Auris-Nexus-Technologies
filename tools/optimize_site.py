import pathlib, re, json
root = pathlib.Path('.')
html_files = list(root.rglob('*.html'))
css_path = root / 'css' / 'styles.css'
js_path = root / 'js' / 'main.js'

print('HTML files:', len(html_files))
print('CSS file:', css_path)
print('JS file:', js_path)

# CSS minify helper
css = css_path.read_text(encoding='utf-8')
original_css_len = len(css)
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*([{};:>,])\s*', r'\1', css)
css = css.strip() + '\n\n@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important;}}'
css_path.write_text(css, encoding='utf-8')
print('CSS shrunk from', original_css_len, 'to', len(css))

# JS minify helper
js = js_path.read_text(encoding='utf-8')
original_js_len = len(js)
js = re.sub(r'/\*.*?\*/', '', js, flags=re.S)
js = re.sub(r'//[^\n\r]*', '', js)
js = re.sub(r'\s+', ' ', js)
js = re.sub(r'\s*([{}();,:+=<>\[\]|&!-])\s*', r'\1', js)
js = js.strip() + '\n'
js_path.write_text(js, encoding='utf-8')
print('JS shrunk from', original_js_len, 'to', len(js))

for path in html_files:
    text = path.read_text(encoding='utf-8')
    changed = False
    # Add role attributes
    text_new = re.sub(r'(<header[^>]*class="site-header"[^>]*)(>)', lambda m: m.group(1) + (' role="banner"' if ' role="banner"' not in m.group(1) else '') + m.group(2), text)
    if text_new != text:
        text = text_new; changed = True
    text_new = re.sub(r'(<main[^>]*id="main"[^>]*)(>)', lambda m: m.group(1) + (' role="main"' if ' role="main"' not in m.group(1) else '') + m.group(2), text)
    if text_new != text:
        text = text_new; changed = True
    # Defer main.js scripts
    text_new = re.sub(r'<script\s+([^>]*src="(?:\.\./)?js/main\.js[^>]*?)>(\s*)</script>', lambda m: '<script ' + (m.group(1).replace(' defer', '') + ' defer') + '></script>', text)
    if text_new != text:
        text = text_new; changed = True
    # Remove lazy loading from hero images in first sections
    text_new = re.sub(r'(<img[^>]*src="(?:\.\./)?images/hero/[^>]*?\.jpg"[^>]*?)loading="lazy"([^>]*>)', r'\1\2', text)
    if text_new != text:
        text = text_new; changed = True
    # Preload homepage hero image in index.html
    if path.name == 'index.html':
        if 'rel="preload" as="image" href="/images/hero/hero-digital-transformation.jpg"' not in text:
            insert_point = text.find('<link rel="canonical"')
            if insert_point != -1:
                insert_point = text.find('>', insert_point) + 1
                text = text[:insert_point] + '\n<link rel="preload" as="image" href="/images/hero/hero-digital-transformation.jpg">' + text[insert_point:]
                changed = True
    # Ensure contact iframe lazy loads and has title (already should)
    # Add WebPage and Breadcrumb schema if structured data exists
    if '"@type": "Organization"' in text and '"@type": "WebPage"' not in text:
        graph_start = text.find('"@graph": [')
        if graph_start != -1:
            insert_point = text.find(']', graph_start)
            if insert_point != -1:
                snippet = ',\n    {\n      "@type": "WebPage",\n      "url": "' + ('https://www.aurisnexus.co.za/' if path.name == 'index.html' else 'https://www.aurisnexus.co.za/' + path.name) + '",\n      "name": "' + (path.stem.replace('-', ' ').title()) + '",\n      "description": "' + re.sub(r'"', '\\"', (re.search(r'<meta name="description" content="([^"]*)"', text) or re.search(r'<meta property="og:description" content="([^"]*)"', text) or ['',''])[1]) + '",\n      "breadcrumb": {\n        "@type": "BreadcrumbList",\n        "itemListElement": [\n          {\n            "@type": "ListItem",\n            "position": 1,\n            "name": "Home",\n            "item": "https://www.aurisnexus.co.za/"\n          },\n          {\n            "@type": "ListItem",\n            "position": 2,\n            "name": "' + (path.stem.replace('-', ' ').title() if path.name != 'index.html' else 'Home') + '",\n            "item": "https://www.aurisnexus.co.za/' + ('' if path.name == 'index.html' else path.name) + '"\n          }\n        ]\n      }\n    }'
                text = text[:insert_point] + snippet + text[insert_point:]
                changed = True
    if changed:
        path.write_text(text, encoding='utf-8')
        print('Updated', path)
print('Done')
