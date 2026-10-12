#!/usr/bin/env python3
"""Static QA audit for the Auris Nexus site. Read-only; prints a report.

Checks: broken local asset references, duplicate stylesheet/script/favicon
includes, conflicting <img loading> attributes, missing alt text, empty/
placeholder hrefs, dangling contact-submit.php references, missing/duplicate
<title>/meta-description/canonical, multiple <h1>, malformed JSON-LD,
oversized images, and a broken/missing site.webmanifest icon reference.

Usage: python tools/qa_audit.py
"""
import json
import os
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", "node_modules", "tools", "docs"}
# Not real pages: Google Search Console ownership-verification stub (plain text, not HTML).
NON_PAGE_FILES = {"googlec37fb6e84eb9cbc6.html"}

def html_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in filenames:
            if f.endswith(".html") and f not in NON_PAGE_FILES:
                yield Path(dirpath) / f

def local_asset_refs(text):
    """Yield raw (unresolved) local path strings referenced in the page."""
    refs = []
    for m in re.finditer(r'(?:src|href)="([^"]+)"', text):
        v = m.group(1)
        if v.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "#", "data:")):
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
    if ref.startswith("/"):
        return ROOT / ref.lstrip("/")
    return (base_file.parent / ref).resolve()

def main():
    issues = {k: [] for k in [
        "broken_refs", "dup_stylesheets", "dup_scripts", "dup_favicons",
        "conflicting_loading", "missing_alt", "empty_href", "contact_php_refs",
        "missing_title", "missing_meta_desc", "missing_canonical",
        "multi_h1", "no_h1", "bad_jsonld", "oversized_images", "bad_manifest", "wrong_business_address", "incomplete_business_address", "duplicate_canonical", "duplicate_titles", "duplicate_descriptions", "sitemap_errors", "sitemap_missing_pages",
    ]}

    files = sorted(html_files())
    title_pages = {}
    description_pages = {}
    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        text = f.read_text(encoding="utf-8", errors="replace")

        # Permanent regression guard: the registered business address is Linden Street.
        # Catch stale variants anywhere in page content, including JSON-LD and visible text.
        if re.search(r"Linden(?:\s+|\+|%20)Road", text, re.I):
            issues["wrong_business_address"].append(
                f"{rel} -> obsolete address spelling; expected 140 Linden Street"
            )

        canonical_tags = re.findall(r'<link\b[^>]*rel=["\']canonical["\'][^>]*>', text, re.I)
        if len(canonical_tags) > 1:
            issues["duplicate_canonical"].append(f"{rel} -> {len(canonical_tags)} canonical tags")

        if re.search(r"140 Linden Street,\s*Sandown\s*</span>", text, re.I) or re.search(
            r"<strong>Office</strong>\s*<span>140 Linden Street Sandown</span>", text, re.I
        ):
            issues["incomplete_business_address"].append(
                f"{rel} -> visible address is abbreviated; use the full approved business address"
            )

        # Detect pages competing through duplicate titles/descriptions, excluding redirect stubs.
        is_redirect = bool(re.search(r'<meta[^>]+http-equiv="refresh"', text, re.I))
        if not is_redirect:
            title_match = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
            desc_match = re.search(
                r'<meta\s+(?=[^>]*name="description")(?=[^>]*content="([^"]+)")[^>]*>',
                text, re.I
            )
            if title_match:
                title_value = re.sub(r"\s+", " ", title_match.group(1)).strip().casefold()
                title_pages.setdefault(title_value, []).append(rel)
            if desc_match:
                desc_value = re.sub(r"\s+", " ", desc_match.group(1)).strip().casefold()
                description_pages.setdefault(desc_value, []).append(rel)

        for ref in local_asset_refs(text):
            target = resolve(f, ref)
            if not target.exists():
                issues["broken_refs"].append(f"{rel} -> {ref}")

        css_hrefs = re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"', text)
        css_base = [c.split("?")[0] for c in css_hrefs]
        for c in set(css_base):
            if css_base.count(c) > 1:
                issues["dup_stylesheets"].append(f"{rel} -> {c} x{css_base.count(c)}")

        script_srcs = re.findall(r'<script[^>]+src="([^"]+)"', text)
        script_base = [s.split("?")[0] for s in script_srcs]
        for s in set(script_base):
            if script_base.count(s) > 1:
                issues["dup_scripts"].append(f"{rel} -> {s} x{script_base.count(s)}")

        fav = re.findall(r'<link[^>]+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>', text)
        rels = re.findall(r'rel="(icon|apple-touch-icon|shortcut icon)"', "".join(fav))
        for r in set(rels):
            if rels.count(r) > 1:
                issues["dup_favicons"].append(f"{rel} -> rel={r} x{rels.count(r)}")

        for img in re.findall(r'<img\b[^>]*>', text):
            loads = re.findall(r'loading="([^"]+)"', img)
            if len(loads) > 1:
                issues["conflicting_loading"].append(f"{rel} -> {img[:90]}...")
            if "alt=" not in img:
                issues["missing_alt"].append(f"{rel} -> {img[:90]}...")

        for m in re.finditer(r'<a\b[^>]*href="([^"]*)"', text):
            v = m.group(1).strip()
            if v in ("#", "", "javascript:void(0)", "javascript:;"):
                issues["empty_href"].append(f"{rel} -> href=\"{v}\"")

        if "contact-submit.php" in text:
            issues["contact_php_refs"].append(rel)

        if not re.search(r"<title>[^<]+</title>", text):
            issues["missing_title"].append(rel)
        if not re.search(r'<meta\s+(?=[^>]*name="description")(?=[^>]*content="[^"]+")', text):
            issues["missing_meta_desc"].append(rel)
        if not re.search(r'<link\s+(?=[^>]*rel="canonical")', text):
            issues["missing_canonical"].append(rel)

        h1_count = len(re.findall(r"<h1[\s>]", text))
        if h1_count > 1:
            issues["multi_h1"].append(f"{rel} -> {h1_count} h1 tags")
        elif h1_count == 0:
            issues["no_h1"].append(rel)

        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
            try:
                json.loads(m.group(1))
            except json.JSONDecodeError as e:
                issues["bad_jsonld"].append(f"{rel} -> {e}")

    for dirpath, dirnames, filenames in os.walk(ROOT / "images"):
        for fn in filenames:
            p = Path(dirpath) / fn
            if p.suffix.lower() in (".png", ".jpg", ".jpeg") and p.stat().st_size > 500_000:
                issues["oversized_images"].append(f"{p.relative_to(ROOT).as_posix()} -> {p.stat().st_size/1024:.0f} KB")

    manifest = ROOT / "site.webmanifest"
    if manifest.exists():
        raw = manifest.read_text(encoding="utf-8-sig")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            issues["bad_manifest"].append(f"site.webmanifest -> {e}")
        else:
            for icon in data.get("icons", []):
                src = icon.get("src", "")
                target = resolve(manifest, src)
                if not target.exists():
                    issues["bad_manifest"].append(f"site.webmanifest -> icon not found: {src}")


    for title_value, pages in title_pages.items():
        if len(pages) > 1:
            issues["duplicate_titles"].append(f"{title_value!r} -> {', '.join(pages)}")
    for desc_value, pages in description_pages.items():
        if len(pages) > 1:
            issues["duplicate_descriptions"].append(f"{desc_value[:100]!r} -> {', '.join(pages)}")

    # The generator is a source of truth too: it must never reintroduce the old address.
    generator = ROOT / "tools" / "add_localbusiness.js"
    if generator.exists():
        generator_text = generator.read_text(encoding="utf-8", errors="replace")
        if re.search(r"Linden(?:\s+|\+|%20)Road", generator_text, re.I):
            issues["wrong_business_address"].append(
                "tools/add_localbusiness.js -> generator would reintroduce the obsolete address"
            )

    # Check that every sitemap URL belongs to this site and maps to a published HTML file.
    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        try:
            import xml.etree.ElementTree as ET
            tree = ET.parse(sitemap)
            seen_urls = set()
            for node in tree.findall(".//{*}loc"):
                url = (node.text or "").strip()
                parsed = urllib.parse.urlparse(url)
                if parsed.scheme != "https" or parsed.netloc.lower() != "aurisnexus.co.za":
                    issues["sitemap_errors"].append(f"sitemap.xml -> unexpected URL: {url}")
                    continue
                if url in seen_urls:
                    issues["sitemap_errors"].append(f"sitemap.xml -> duplicate URL: {url}")
                seen_urls.add(url)
                pathname = urllib.parse.unquote(parsed.path).lstrip("/")
                if not pathname:
                    target = ROOT / "index.html"
                elif pathname.endswith("/"):
                    target = ROOT / pathname / "index.html"
                else:
                    target = ROOT / pathname
                if not target.is_file():
                    issues["sitemap_errors"].append(f"sitemap.xml -> URL has no file: {url}")

            # Every canonical, indexable content page should be discoverable from the sitemap.
            for f in files:
                rel = f.relative_to(ROOT).as_posix()
                if rel in {"403.html", "404.html", "500.html"}:
                    continue
                page_text = f.read_text(encoding="utf-8", errors="replace")
                if re.search(r'<meta[^>]+http-equiv="refresh"', page_text, re.I):
                    continue
                robots_match = re.search(
                    r'<meta\s+(?=[^>]*name="robots")(?=[^>]*content="([^"]+)")[^>]*>',
                    page_text, re.I
                )
                if robots_match and "noindex" in robots_match.group(1).lower():
                    continue
                canonical_match = re.search(
                    r'<link\b(?=[^>]*rel="canonical")(?=[^>]*href="([^"]+)")[^>]*>',
                    page_text, re.I
                )
                if canonical_match:
                    canonical_url = canonical_match.group(1)
                    if canonical_url.startswith("https://aurisnexus.co.za/") and canonical_url not in seen_urls:
                        issues["sitemap_missing_pages"].append(
                            f"{rel} -> indexable canonical missing from sitemap: {canonical_url}"
                        )
        except (ET.ParseError, OSError) as e:
            issues["sitemap_errors"].append(f"sitemap.xml -> {e}")

    total = 0
    for key, items in issues.items():
        print(f"\n[{key}] {len(items)}")
        for i in items:
            print(f"  - {i}")
        total += len(items)

    print(f"\n{'='*50}\nTOTAL ISSUES: {total}\nPages scanned: {len(files)}")
    critical = ("wrong_business_address", "incomplete_business_address", "duplicate_canonical", "duplicate_titles", "duplicate_descriptions", "bad_jsonld", "sitemap_errors", "sitemap_missing_pages")
    return 1 if any(issues[key] for key in critical) else 0

if __name__ == "__main__":
    sys.exit(main())
