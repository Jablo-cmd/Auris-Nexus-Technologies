#!/usr/bin/env python3
"""Rebuild the JSON-LD structured data on every indexable page.

Each indexable page gets exactly one <script type="application/ld+json"> holding
one @graph with:
  - #organization  the single canonical ProfessionalService entity
  - #website       the WebSite
  - #person        Loyiso Ngcala (the @id lives on the author page)
  - <url>#webpage  the page itself (WebPage / AboutPage / ContactPage /
                   CollectionPage / ProfilePage / FAQPage)
  - <url>#breadcrumb  one BreadcrumbList, taken from the visible breadcrumb
  - page extras:   Service (<url>#service) and Article (<url>#article), carried
                   over from the page's previous markup with references re-pointed
FAQPage questions are read from the visible .faq-item markup, so the schema
always matches what visitors see. All cross-references use @id.

Usage:
  python tools/build_schema.py          rewrite pages in place
  python tools/build_schema.py --check  exit 1 if any page would change
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://aurisnexus.co.za/"
ORG_ID = BASE + "#organization"
SITE_ID = BASE + "#website"
AUTHOR_URL = BASE + "insights/authors/loyiso-ngcala.html"
PERSON_ID = AUTHOR_URL + "#person"

SKIP_DIRS = {".git", "node_modules", "tools", "docs", "design-source"}
NON_PAGES = {"googlec37fb6e84eb9cbc6.html", "403.html", "404.html", "500.html"}

# The five core service pillars, each with its own page and Service node.
PILLARS = [
    ("Technology Consulting", "technology-consulting.html"),
    ("Custom Software Development", "custom-software-development.html"),
    ("Business Automation", "business-automation.html"),
    ("AI Integration", "ai-integration.html"),
    ("Digital Transformation", "digital-transformation.html"),
]

ORGANIZATION = {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    "name": "Auris Nexus Technologies",
    "legalName": "Auris Nexus Technologies (Pty) Ltd",
    "alternateName": "Auris Nexus",
    "url": BASE,
    "logo": BASE + "images/Auri%20logo.webp",
    "image": BASE + "images/Web%20Development%20Hero.webp",
    "description": (
        "Technology consulting and digital solutions company helping South African "
        "businesses solve operational challenges through technology consulting, custom "
        "software, business automation, digital transformation, AI integration and "
        "business systems."
    ),
    "slogan": "Transforming Businesses Through Technology",
    "foundingDate": "2026-07",
    "identifier": {"@type": "PropertyValue", "propertyID": "CIPC", "value": "2026/606690/07"},
    "founder": {"@id": PERSON_ID},
    "email": "info@aurisnexus.co.za",
    "telephone": "+27631226552",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "140 Linden Street, Sandown",
        "addressLocality": "Sandton",
        "addressRegion": "Gauteng",
        "postalCode": "2196",
        "addressCountry": "ZA",
    },
    "hasMap": "https://www.google.com/maps/search/?api=1&query=140+Linden+Street%2C+Sandown%2C+Sandton+2196",
    "areaServed": "ZA",
    "knowsAbout": [
        "Technology consulting",
        "Custom software development",
        "Business process automation",
        "Digital transformation",
        "AI integration",
        "Business systems",
        "Data and business intelligence",
        "Web development",
        "Mobile app development",
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+27631226552",
        "email": "info@aurisnexus.co.za",
        "areaServed": "ZA",
        "availableLanguage": ["en"],
    },
    "sameAs": ["https://za.linkedin.com/company/auris-nexus-technologies"],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Core services",
        "itemListElement": [
            {"@type": "Offer", "itemOffered": {
                "@type": "Service", "@id": BASE + page + "#service", "name": name, "url": BASE + page}}
            for name, page in PILLARS
        ],
    },
    "priceRange": "R12 500+",
    "currenciesAccepted": "ZAR",
    "openingHoursSpecification": [{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00",
    }],
}

WEBSITE = {
    "@type": "WebSite",
    "@id": SITE_ID,
    "url": BASE,
    "name": "Auris Nexus Technologies",
    "description": "Technology consulting and digital solutions built around how your organisation works.",
    "publisher": {"@id": ORG_ID},
    "inLanguage": "en-ZA",
}

PERSON = {
    "@type": "Person",
    "@id": PERSON_ID,
    "name": "Loyiso Ngcala",
    "jobTitle": "Founder & Managing Director",
    "url": AUTHOR_URL,
    "sameAs": ["https://za.linkedin.com/in/ngcalasd7000"],
    "worksFor": {"@id": ORG_ID},
}

PAGE_TYPES = {
    "about.html": "AboutPage",
    "contact.html": "ContactPage",
    "portfolio.html": "CollectionPage",
    "insights/index.html": "CollectionPage",
    "insights/authors/loyiso-ngcala.html": "ProfilePage",
}

# Industry pages describe a service; its name must appear in the page's H1.
INDUSTRY_SERVICES = {
    "logistics.html": "Logistics software",
    "corporate.html": "Business management software",
    "healthcare.html": "Healthcare administration software",
}

# Short breadcrumb labels for pages without a visible breadcrumb trail.
CRUMB_LABELS = {
    "about.html": "About",
    "contact.html": "Contact",
    "faq.html": "FAQ",
    "pricing.html": "Pricing",
    "privacy.html": "Privacy Policy",
    "terms.html": "Terms of Service",
    "services.html": "Solutions",
    "industries.html": "Industries",
    "portfolio.html": "Work",
    "insights/index.html": "Insights",
    "insights/editorial-policy.html": "Editorial Policy",
    "insights/authors/loyiso-ngcala.html": "Loyiso Ngcala",
}

LD_RE = re.compile(r'[ \t]*<script type="application/ld\+json">.*?</script>\n?', re.S)


def text_of(fragment):
    """Visible text of an HTML fragment, whitespace-collapsed."""
    fragment = re.sub(r"<(script|style)\b.*?</\1>", " ", fragment, flags=re.S | re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def tidy(s):
    """Normalise spacing around punctuation produced by tag stripping."""
    return re.sub(r"\s+([,.;:!?)])", r"\1", s)


def meta(page, name):
    m = re.search(r'<meta\b(?=[^>]*\b(?:name|property)="%s")[^>]*\bcontent="([^"]*)"' % re.escape(name), page)
    return html.unescape(m.group(1)).strip() if m else None


def canonical(page):
    m = re.search(r'<link\b(?=[^>]*rel="canonical")[^>]*href="([^"]+)"', page)
    return m.group(1) if m else None


def page_url(rel):
    if rel == "index.html":
        return BASE
    if rel.endswith("/index.html"):
        return BASE + rel[: -len("index.html")]
    return BASE + rel


def is_indexable(rel, page):
    if Path(rel).name in NON_PAGES and "/" not in rel:
        return False
    if re.search(r'http-equiv="refresh"', page, re.I):
        return False
    robots = meta(page, "robots")
    if robots and "noindex" in robots.lower():
        return False
    return canonical(page) == page_url(rel)


def indexable_pages():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT).as_posix()
        if SKIP_DIRS & set(p.relative_to(ROOT).parts[:-1]):
            continue
        if rel in NON_PAGES:
            continue
        page = p.read_text(encoding="utf-8")
        if is_indexable(rel, page):
            yield p, rel, page


def visible_faq(page):
    items = []
    for block in re.findall(r'<div class="faq-item">(.*?)</div>\s*</div>', page, re.S):
        q = re.search(r'<button[^>]*class="faq-q"[^>]*>\s*<span>(.*?)</span>', block, re.S)
        a = re.search(r'<div class="faq-a">(.*)', block, re.S)
        if q and a:
            items.append((tidy(text_of(q.group(1))), tidy(text_of(a.group(1)))))
    return items


def visible_breadcrumb(page, url):
    m = re.search(r'<(div|nav)\b[^>]*class="(?:cs-)?crumbs[^"]*"[^>]*>(.*?)</\1>', page, re.S)
    if not m:
        return None
    inner = m.group(2)
    crumbs = []
    for href, label in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', inner, re.S):
        if href.startswith("/"):
            href = BASE + href.lstrip("/")
        if href.endswith("/index.html"):
            href = href[: -len("index.html")]
        crumbs.append((text_of(label), href))
    tail = text_of(re.split(r"</a>", inner)[-1]).strip(" /")
    if tail:
        crumbs.append((tail, url))
    return crumbs or None


def title_name(page):
    m = re.search(r"<title>(.*?)</title>", page, re.S)
    return text_of(m.group(1)).split(" | ")[0].strip() if m else ""


def old_nodes(page):
    nodes = []
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        for node in data.get("@graph", [data]) if isinstance(data, dict) else data:
            if isinstance(node, dict):
                nodes.append(node)
    return nodes


def types(node):
    t = node.get("@type", [])
    return set(t if isinstance(t, list) else [t])


def build_graph(rel, page):
    url = page_url(rel)
    olds = old_nodes(page)
    name = title_name(page)
    description = meta(page, "description")

    crumbs = visible_breadcrumb(page, url)
    if not crumbs:
        crumbs = [("Home", BASE)]
        if rel.startswith("insights/") and rel != "insights/index.html":
            crumbs.append(("Insights", BASE + "insights/"))
        elif rel.startswith("case-studies/"):
            crumbs.append(("Work", BASE + "portfolio.html"))
        if url != BASE:
            crumbs.append((CRUMB_LABELS.get(rel) or name, url))
    # Articles show their category as the last visible crumb; name the article itself.
    for node in olds:
        if types(node) & {"Article", "BlogPosting"} and node.get("headline"):
            crumbs[-1] = (node["headline"], url)

    breadcrumb = {
        "@type": "BreadcrumbList",
        "@id": url + "#breadcrumb",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": n, "item": u}
            for i, (n, u) in enumerate(crumbs, 1)
        ],
    }

    faq = visible_faq(page)
    webpage = {
        "@type": "FAQPage" if faq else PAGE_TYPES.get(rel, "WebPage"),
        "@id": url + "#webpage",
        "url": url,
        "name": name,
        "description": description,
        "isPartOf": {"@id": SITE_ID},
        "about": {"@id": ORG_ID},
        "breadcrumb": {"@id": url + "#breadcrumb"},
        "inLanguage": "en-ZA",
    }
    if rel == "insights/authors/loyiso-ngcala.html":
        webpage["mainEntity"] = {"@id": PERSON_ID}
        webpage["about"] = {"@id": PERSON_ID}
    if faq:
        webpage["mainEntity"] = [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faq
        ]

    graph = [ORGANIZATION, WEBSITE, PERSON, webpage, breadcrumb]

    services = [n for n in olds if "Service" in types(n)]
    if not services and rel in INDUSTRY_SERVICES:
        services = [{"name": INDUSTRY_SERVICES[rel]}]
    for node in services[:1]:
        label = crumbs[-1][0] if len(crumbs) > 1 else name
        service = {
            "@type": "Service",
            "@id": url + "#service",
            "name": node.get("name") or label,
            "serviceType": node.get("name") or label,
            "description": node.get("description") or description,
            "provider": {"@id": ORG_ID},
            "areaServed": {"@type": "Country", "name": "South Africa"},
            "url": url,
        }
        if node.get("audience"):
            service["audience"] = node["audience"]
        graph.append(service)
        webpage["mainEntity"] = webpage.get("mainEntity") or {"@id": url + "#service"}

    for node in olds:
        if types(node) & {"Article", "BlogPosting"}:
            article = {
                "@type": "Article",
                "@id": url + "#article",
                "headline": node.get("headline") or name,
                "description": node.get("description") or description,
                "image": node.get("image"),
                "datePublished": meta(page, "article:published_time") or node.get("datePublished"),
                "dateModified": node.get("dateModified") or node.get("datePublished"),
                "author": {"@id": PERSON_ID},
                "publisher": {"@id": ORG_ID},
                "mainEntityOfPage": {"@id": url + "#webpage"},
                "inLanguage": "en-ZA",
            }
            graph.append({k: v for k, v in article.items() if v})
            break

    return {"@context": "https://schema.org", "@graph": graph}


def render(graph):
    body = json.dumps(graph, ensure_ascii=False, indent=2).replace("</", "<\\/")
    return '<script type="application/ld+json">\n' + body + "\n</script>\n"


def rewrite(page, block):
    m = LD_RE.search(page)
    stripped = LD_RE.sub("", page)
    if m:
        pos = m.start()
        # position in stripped text = original start (nothing removed before first block)
        return stripped[:pos] + block + stripped[pos:]
    return stripped.replace("</head>", block + "</head>", 1)


def main():
    check = "--check" in sys.argv
    stale = []
    for path, rel, page in indexable_pages():
        new = rewrite(page, render(build_graph(rel, page)))
        if new != page:
            stale.append(rel)
            if not check:
                path.write_text(new, encoding="utf-8")
    if check:
        if stale:
            print("Structured data out of date (run python tools/build_schema.py):")
            for rel in stale:
                print("  -", rel)
            return 1
        print("Structured data up to date.")
        return 0
    print(f"{len(stale)} pages updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
