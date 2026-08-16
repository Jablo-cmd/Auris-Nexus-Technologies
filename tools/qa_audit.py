#!/usr/bin/env python3
"""Static QA audit for the Auris Nexus site. Read-only; prints a report.

Checks: broken local asset references, duplicate stylesheet/script/favicon
includes, conflicting <img loading> attributes, missing alt text, empty/
placeholder hrefs, dangling contact-submit.php references, missing/duplicate
<title>/meta-description/canonical, multiple <h1>, malformed JSON-LD, and
oversized images.

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
        "multi_h1", "no_h1", "bad_jsonld", "oversized_images",
    ]}

    files = sorted(html_files())
    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        text = f.read_text(encoding="utf-8", errors="replace")

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

    total = 0
    for key, items in issues.items():
        print(f"\n[{key}] {len(items)}")
        for i in items:
            print(f"  - {i}")
        total += len(items)

    print(f"\n{'='*50}\nTOTAL ISSUES: {total}\nPages scanned: {len(files)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
