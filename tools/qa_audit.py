#!/usr/bin/env python3
"""Static SEO and production QA audit for the Auris Nexus site.

Prints a report of errors and warnings and exits 1 when any error is found.

Errors
  broken local references, duplicate asset includes, missing alt text, empty hrefs,
  missing <title>/description/canonical, canonical not self on indexable pages,
  duplicate titles/descriptions, h1 count != 1, sitemap != indexable pages,
  robots.txt without Sitemap, invalid JSON-LD, not exactly one #organization node,
  Organization nodes that differ between pages, GitHub in sameAs, anonymous
  Auris Organization/Person nodes, dangling @id references, more than one
  BreadcrumbList, FAQ schema text not visible on the page, Service schema that
  does not match the page, forbidden strings, main navigation without Technology
  Consulting, and more than 45% copy shared between two indexable pages.
Warnings
  long titles, description length, thin pages and heading-level skips.

Usage: python tools/qa_audit.py
"""
import html
import json
import os
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_schema import ORG_ID, page_url, text_of, visible_faq  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", "node_modules", "tools", "docs", "design-source"}
# Google Search Console ownership-verification stub (plain text, not a page).
NON_PAGE_FILES = {"googlec37fb6e84eb9cbc6.html"}
ERROR_PAGES = {"403.html", "404.html", "500.html"}
BASE = "https://aurisnexus.co.za/"

# Strings that must never be published. Patterns are written so this file does
# not itself contain the literal text.
FORBIDDEN = [
    (re.compile(r"Linden(?:\s+|\+|%20)R(?:oa)?d\b", re.I), "obsolete street name (use 140 Linden Street)"),
    (re.compile(r"Bryan" r"ston", re.I), "old suburb (the office is in Sandown, Sandton)"),
    (re.compile(r"sales" r"@aurisnexus\.co\.za", re.I), "retired sales mailbox (use info@aurisnexus.co.za)"),
    (re.compile(r"#local" r"business", re.I), "separate LocalBusiness entity (use #organization)"),
    (re.compile(r"28\.0218" r"26|-?26\.1096" r"77"), "old unverified geo coordinates"),
]
# Generator scripts must not reintroduce the obsolete address, entity or geo either.
GENERATOR_FORBIDDEN = [FORBIDDEN[0], FORBIDDEN[3], FORBIDDEN[4]]

ORG_TYPES = {"Organization", "ProfessionalService", "LocalBusiness", "Corporation"}
SHARED_COPY_LIMIT = 0.45
SHINGLE = 8


def published_files(suffixes):
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in filenames:
            if Path(f).suffix in suffixes:
                yield Path(dirpath) / f


def local_refs(text):
    refs = []
    for m in re.finditer(r'(?:src|href)="([^"]+)"', text):
        v = html.unescape(m.group(1))
        if v.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "#", "data:", "//")):
            continue
        refs.append(v.split("#")[0].split("?")[0])
    for m in re.finditer(r'srcset="([^"]+)"', text):
        for part in m.group(1).split(","):
            u = part.strip().split(" ")[0]
            if u and not u.startswith(("http://", "https://", "data:")):
                refs.append(u.split("#")[0].split("?")[0])
    return [r for r in refs if r]


def resolve(base_file, ref):
    ref = urllib.parse.unquote(ref)
    target = ROOT / ref.lstrip("/") if ref.startswith("/") else (base_file.parent / ref).resolve()
    if ref.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target


def meta_content(text, name):
    m = re.search(r'<meta\b(?=[^>]*\b(?:name|property)="%s")[^>]*\bcontent="([^"]*)"' % re.escape(name), text, re.I)
    return html.unescape(m.group(1)).strip() if m else None


def canonical_of(text):
    m = re.search(r'<link\b(?=[^>]*rel="canonical")[^>]*href="([^"]+)"', text, re.I)
    return m.group(1) if m else None


def title_of(text):
    m = re.search(r"<title>([^<]+)</title>", text)
    return html.unescape(re.sub(r"\s+", " ", m.group(1))).strip() if m else None


def is_redirect(text):
    return bool(re.search(r'<meta[^>]+http-equiv="refresh"', text, re.I))


def is_noindex(text):
    robots = meta_content(text, "robots")
    return bool(robots and "noindex" in robots.lower())


def main_text(text):
    m = re.search(r"<main\b[^>]*>(.*?)</main>", text, re.S)
    return text_of(m.group(1) if m else text)


def norm(s):
    s = html.unescape(s).replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def walk(node, fn):
    if isinstance(node, dict):
        fn(node)
        for v in node.values():
            walk(v, fn)
    elif isinstance(node, list):
        for v in node:
            walk(v, fn)


def node_types(node):
    t = node.get("@type", [])
    return set(t if isinstance(t, list) else [t])


def main():
    errors = {}
    warnings = {}

    def err(key, msg):
        errors.setdefault(key, []).append(msg)

    def warn(key, msg):
        warnings.setdefault(key, []).append(msg)

    files = sorted(f for f in published_files({".html"}) if f.name not in NON_PAGE_FILES)
    titles, descriptions = {}, {}
    indexable = {}
    org_nodes = {}
    shingles = {}

    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        text = f.read_text(encoding="utf-8", errors="replace")
        redirect = is_redirect(text)
        content_page = not redirect and not is_noindex(text) and rel not in ERROR_PAGES

        # --- references and markup hygiene ---
        for ref in local_refs(text):
            if not resolve(f, ref).exists():
                err("broken_refs", f"{rel} -> {ref}")
        for kind, pattern in (("stylesheet", r'<link[^>]+rel="stylesheet"[^>]+href="([^"?]+)'),
                              ("script", r'<script[^>]+src="([^"?]+)')):
            found = re.findall(pattern, text)
            for item in set(found):
                if found.count(item) > 1:
                    err("duplicate_includes", f"{rel} -> {kind} {item} x{found.count(item)}")
        for img in re.findall(r"<img\b[^>]*>", text):
            if "alt=" not in img:
                err("missing_alt", f"{rel} -> {img[:90]}")
        for m in re.finditer(r'<a\b[^>]*href="([^"]*)"', text):
            if m.group(1).strip() in ("#", "", "javascript:void(0)", "javascript:;"):
                err("empty_href", f'{rel} -> href="{m.group(1)}"')

        # --- head essentials ---
        title = title_of(text)
        desc = meta_content(text, "description")
        canon = canonical_of(text)
        if not title:
            err("missing_title", rel)
        if not desc:
            err("missing_description", rel)
        if not canon:
            err("missing_canonical", rel)
        if len(re.findall(r'<link\b[^>]*rel="canonical"', text)) > 1:
            err("duplicate_canonical", rel)
        h1 = len(re.findall(r"<h1[\s>]", text))
        if h1 != 1:
            err("h1_count", f"{rel} -> {h1} h1 tags")

        # --- forbidden strings ---
        for pattern, why in FORBIDDEN:
            if pattern.search(text):
                err("forbidden_strings", f"{rel} -> {why}")

        # --- JSON-LD ---
        graph_nodes = []
        for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
            try:
                data = json.loads(block)
            except json.JSONDecodeError as e:
                err("invalid_jsonld", f"{rel} -> {e}")
                continue
            items = data.get("@graph", [data]) if isinstance(data, dict) else data
            graph_nodes.extend(n for n in items if isinstance(n, dict))
            all_nodes = []
            walk(data, all_nodes.append)
            defined = {n["@id"] for n in all_nodes if "@id" in n and len(n) > 1}
            for n in all_nodes:
                if set(n) == {"@id"} and n["@id"] not in defined:
                    err("dangling_id_refs", f"{rel} -> {n['@id']}")
                types = node_types(n)
                name = str(n.get("name", ""))
                if "@id" not in n and ((types & ORG_TYPES and "Auris" in name) or ("Person" in types and "Loyiso" in name)):
                    err("anonymous_entities", f"{rel} -> {sorted(types)} {name!r} has no @id")
                for same in n.get("sameAs", []) if isinstance(n.get("sameAs"), list) else [n.get("sameAs", "")]:
                    if "github.com" in str(same):
                        err("github_in_sameas", f"{rel} -> {same}")

        if content_page:
            if canon != page_url(rel):
                err("canonical_not_self", f"{rel} -> {canon}")
            else:
                indexable[page_url(rel)] = rel
            if title:
                titles.setdefault(title.casefold(), []).append(rel)
                if len(title) > 65:
                    warn("long_titles", f"{rel} -> {len(title)} chars")
            if desc:
                descriptions.setdefault(desc.casefold(), []).append(rel)
                if not 70 <= len(desc) <= 165:
                    warn("description_length", f"{rel} -> {len(desc)} chars")

            orgs = [n for n in graph_nodes if n.get("@id") == ORG_ID]
            if len(orgs) != 1:
                err("organization_count", f"{rel} -> {len(orgs)} #organization nodes")
            else:
                org_nodes[rel] = json.dumps(orgs[0], sort_keys=True)
            crumbs = []
            walk(graph_nodes, lambda n: crumbs.append(n) if "BreadcrumbList" in node_types(n) and len(n) > 1 else None)
            if len(crumbs) > 1:
                err("multiple_breadcrumbs", f"{rel} -> {len(crumbs)} BreadcrumbList nodes")

            visible = norm(text_of(re.sub(r"<head>.*?</head>", " ", text, flags=re.S)))
            faq_nodes = [n for n in graph_nodes if "FAQPage" in node_types(n)]
            visible_pairs = set(visible_faq(text))
            for node in faq_nodes:
                for q in node.get("mainEntity", []):
                    pair = (q.get("name", ""), q.get("acceptedAnswer", {}).get("text", ""))
                    if pair not in visible_pairs:
                        err("faq_not_visible", f"{rel} -> {pair[0][:70]!r}")

            h1_m = re.search(r"<h1\b[^>]*>(.*?)</h1>", text, re.S)
            page_labels = norm(" ".join([title or "", text_of(h1_m.group(1)) if h1_m else ""]
                                        + re.findall(r'class="(?:cs-)?crumbs[^"]*"[^>]*>(.*?)</(?:div|nav)>', text, re.S)))
            for node in graph_nodes:
                if "Service" in node_types(node):
                    name = norm(node.get("name", ""))
                    if not name or name not in page_labels:
                        err("service_mismatch", f"{rel} -> Service {node.get('name')!r} not in title/h1/breadcrumb")
                    if node.get("url") and node["url"] != page_url(rel):
                        err("service_mismatch", f"{rel} -> Service url {node['url']}")

            # main navigation, drawer and footer must lead with Technology Consulting
            if 'class="site-header"' in text:
                for region, pattern in (("mega menu", r'<div class="mega-grid">(.*?)</div>\s*</div>'),
                                        ("mobile drawer", r'<div class="drawer-svc-grid">(.*?)</div>'),
                                        ("footer", r"<h4>Solutions</h4>\s*<ul>(.*?)</ul>")):
                    m = re.search(pattern, text, re.S)
                    first = re.search(r'href="([^"]+)"', m.group(1)) if m else None
                    if not first or first.group(1) != "/technology-consulting.html":
                        err("nav_missing_consulting", f"{rel} -> {region} does not start with /technology-consulting.html")

            words = main_text(text).lower().split()
            if len(words) < 250:
                warn("thin_pages", f"{rel} -> {len(words)} words in <main>")
            shingles[rel] = {" ".join(words[i:i + SHINGLE]) for i in range(max(0, len(words) - SHINGLE + 1))}

            levels = [int(x) for x in re.findall(r"<h([1-6])[\s>]", text)]
            for a, b in zip(levels, levels[1:]):
                if b > a + 1:
                    warn("heading_skips", f"{rel} -> h{a} followed by h{b}")
                    break

    for value, pages in titles.items():
        if len(pages) > 1:
            err("duplicate_titles", f"{value!r} -> {', '.join(pages)}")
    for value, pages in descriptions.items():
        if len(pages) > 1:
            err("duplicate_descriptions", f"{value[:90]!r} -> {', '.join(pages)}")

    if len(set(org_nodes.values())) > 1:
        groups = {}
        for rel, blob in org_nodes.items():
            groups.setdefault(blob, []).append(rel)
        for pages in sorted(groups.values(), key=len)[:-1]:
            err("inconsistent_organization", f"differs from the majority: {', '.join(pages)}")

    rels = sorted(shingles)
    for i, a in enumerate(rels):
        for b in rels[i + 1:]:
            sa, sb = shingles[a], shingles[b]
            if not sa or not sb:
                continue
            shared = len(sa & sb) / min(len(sa), len(sb))
            if shared > SHARED_COPY_LIMIT:
                err("shared_copy", f"{a} <-> {b} share {shared:.0%} of copy")

    # --- sitemap must list exactly the indexable pages ---
    sitemap = ROOT / "sitemap.xml"
    try:
        locs = [(n.text or "").strip() for n in ET.parse(sitemap).findall(".//{*}loc")]
    except (ET.ParseError, OSError) as e:
        err("sitemap", f"sitemap.xml -> {e}")
        locs = []
    for url in sorted(set(locs) - set(indexable)):
        err("sitemap", f"listed but not an indexable page: {url}")
    for url in sorted(set(indexable) - set(locs)):
        err("sitemap", f"indexable page missing from sitemap: {url}")
    for url in set(locs):
        if locs.count(url) > 1:
            err("sitemap", f"duplicate URL: {url}")

    robots = ROOT / "robots.txt"
    if not robots.exists() or not re.search(r"^Sitemap:\s*https://aurisnexus\.co\.za/sitemap\.xml\s*$",
                                            robots.read_text(encoding="utf-8"), re.M):
        err("robots", "robots.txt has no Sitemap line for https://aurisnexus.co.za/sitemap.xml")

    # --- other published text files and generator scripts ---
    for f in published_files({".xml", ".txt", ".js", ".css", ".webmanifest"}):
        rel = f.relative_to(ROOT).as_posix()
        text = f.read_text(encoding="utf-8", errors="replace")
        for pattern, why in FORBIDDEN:
            if pattern.search(text):
                err("forbidden_strings", f"{rel} -> {why}")
    for f in sorted((ROOT / "tools").glob("*")):
        if f.name == Path(__file__).name or f.suffix not in {".js", ".py"}:
            continue
        text = f.read_text(encoding="utf-8", errors="replace")
        for pattern, why in GENERATOR_FORBIDDEN:
            if pattern.search(text):
                err("forbidden_strings", f"tools/{f.name} -> {why}")

    manifest = ROOT / "site.webmanifest"
    if manifest.exists():
        try:
            data = json.loads(manifest.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError as e:
            err("manifest", f"site.webmanifest -> {e}")
        else:
            for icon in data.get("icons", []):
                if not resolve(manifest, icon.get("src", "")).exists():
                    err("manifest", f"icon not found: {icon.get('src')}")

    for label, bucket in (("ERROR", errors), ("WARNING", warnings)):
        for key in sorted(bucket):
            print(f"\n[{label}] {key}: {len(bucket[key])}")
            for item in bucket[key]:
                print(f"  - {item}")
    n_err = sum(map(len, errors.values()))
    n_warn = sum(map(len, warnings.values()))
    print(f"\n{'=' * 50}\nPages scanned: {len(files)} ({len(indexable)} indexable)")
    print(f"Errors: {n_err}   Warnings: {n_warn}")
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
