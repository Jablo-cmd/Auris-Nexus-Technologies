#!/usr/bin/env python3
"""Keep "N min read" labels honest and consistent.

Each article's reading time is its body word count divided by 200 words per
minute, rounded up. The label is written in the article header and in every
Insights card on the site that links to the article.

Usage:
  python tools/reading_times.py          rewrite labels
  python tools/reading_times.py --check  exit 1 if any label is wrong
"""
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_schema import ROOT, SKIP_DIRS, text_of  # noqa: E402

WPM = 200
NOT_ARTICLES = {"index.html", "editorial-policy.html"}
BODY_PATTERNS = [
    # Standard article layout.
    re.compile(r'<div class="article-body[^"]*">(.*?)</div>\s*<div class="cta-band', re.S),
    # Case-study style article (insights/pro-energy-solutions.html).
    re.compile(r'<section class="section">\s*<div class="shell measure">(.*?)</div>\s*</section>', re.S),
]
CARD_RE = re.compile(r'<article class="card ins-card[^"]*">.*?</article>', re.S)


def article_minutes():
    minutes = {}
    for path in sorted((ROOT / "insights").glob("*.html")):
        if path.name in NOT_ARTICLES:
            continue
        page = path.read_text(encoding="utf-8")
        if 'http-equiv="refresh"' in page:
            continue
        body = next((m.group(1) for p in BODY_PATTERNS for m in [p.search(page)] if m), None)
        if body is None:
            raise SystemExit(f"no article body found in insights/{path.name}")
        minutes[path.name[:-5]] = max(1, math.ceil(len(text_of(body).split()) / WPM))
    return minutes


def fix_page(page, rel, minutes):
    own = Path(rel).stem if rel.startswith("insights/") else None
    if own in minutes:
        page = re.sub(r'(<div class="ins-meta reveal mt-s">.*?)\d+ min read',
                      lambda m: f"{m.group(1)}{minutes[own]} min read", page, count=1, flags=re.S)

    def card(m):
        block = m.group(0)
        href = re.search(r'href="(?:https://aurisnexus\.co\.za)?/insights/([a-z0-9-]+)\.html"', block)
        if href and href.group(1) in minutes:
            block = re.sub(r"\d+ min read", f"{minutes[href.group(1)]} min read", block)
        return block

    return CARD_RE.sub(card, page)


def main():
    check = "--check" in sys.argv
    minutes = article_minutes()
    stale = []
    for path in sorted(ROOT.rglob("*.html")):
        if SKIP_DIRS & set(path.relative_to(ROOT).parts[:-1]):
            continue
        rel = path.relative_to(ROOT).as_posix()
        page = path.read_text(encoding="utf-8")
        new = fix_page(page, rel, minutes)
        if new != page:
            stale.append(rel)
            if not check:
                path.write_text(new, encoding="utf-8")
    if check:
        if stale:
            print("Reading-time labels out of date (run python tools/reading_times.py):")
            for rel in stale:
                print("  -", rel)
            return 1
        print("Reading-time labels are consistent.")
        return 0
    for slug, m in sorted(minutes.items()):
        print(f"  {m:2} min  {slug}")
    print(f"{len(stale)} pages updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
