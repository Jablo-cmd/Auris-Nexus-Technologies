from pathlib import Path
import re

root = Path('.')

replacements = {
    'href="/about"': 'href="/about.html"',
    'href="/services"': 'href="/services.html"',
    'href="/portfolio"': 'href="/portfolio.html"',
    'href="/industries"': 'href="/industries.html"',
    'href="/contact"': 'href="/contact.html"',
    'href="/pricing"': 'href="/pricing.html"',
    'href="/faq"': 'href="/faq.html"',
    'href="/privacy"': 'href="/privacy.html"',
    'href="/terms"': 'href="/terms.html"',
    'href="/ai-integration"': 'href="/ai-integration.html"',
    'href="/web-development"': 'href="/web-development.html"',
    'href="/web-design"': 'href="/web-design.html"',
    'href="/data-analytics-business-intelligence"': 'href="/data-analytics-business-intelligence.html"',
    'href="/mobile-app-development"': 'href="/mobile-app-development.html"',
    'href="/crm-business-management-systems"': 'href="/crm-business-management-systems.html"',
    'href="/insights"': 'href="/insights/index.html"',
    'href="/insights/"': 'href="/insights/index.html"',
}
rel_replacements = {
    'href="../about"': 'href="../about.html"',
    'href="../services"': 'href="../services.html"',
    'href="../portfolio"': 'href="../portfolio.html"',
    'href="../industries"': 'href="../industries.html"',
    'href="../contact"': 'href="../contact.html"',
    'href="../pricing"': 'href="../pricing.html"',
    'href="../faq"': 'href="../faq.html"',
    'href="../privacy"': 'href="../privacy.html"',
    'href="../terms"': 'href="../terms.html"',
    'href="../ai-integration"': 'href="../ai-integration.html"',
    'href="../web-development"': 'href="../web-development.html"',
    'href="../web-design"': 'href="../web-design.html"',
    'href="../data-analytics-business-intelligence"': 'href="../data-analytics-business-intelligence.html"',
    'href="../mobile-app-development"': 'href="../mobile-app-development.html"',
    'href="../crm-business-management-systems"': 'href="../crm-business-management-systems.html"',
    'href="../insights"': 'href="../insights/index.html"',
    'href="../insights/"': 'href="../insights/index.html"',
    'href="..//"': 'href="../"',
    'href="../"': 'href="../"',
}

# Build canonical mapping
page_urls = {}
for p in root.rglob('*.html'):
    rel = p.relative_to(root).as_posix()
    if rel == 'index.html':
        page_urls[rel] = 'https://www.aurisnexus.co.za/'
    else:
        page_urls[rel] = 'https://www.aurisnexus.co.za/' + rel

for p in root.rglob('*.html'):
    text = p.read_text(encoding='utf8')
    orig = text
    for old, new in rel_replacements.items():
        text = text.replace(old, new)
    for old, new in replacements.items():
        text = text.replace(old, new)
    rel = p.relative_to(root).as_posix()
    canonical = page_urls.get(rel)
    if canonical:
        text = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{canonical}">', text)
        text = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{canonical}">', text)
    if text != orig:
        p.write_text(text, encoding='utf8')
        print(f'Updated {rel}')
