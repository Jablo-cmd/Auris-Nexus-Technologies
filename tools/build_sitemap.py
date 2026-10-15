#!/usr/bin/env python3
"""Generate sitemap.xml from the indexable, self-canonical pages.

A page is listed when it is not a redirect, not noindex, and its canonical URL
is its own URL (same rules as tools/build_schema.py). <lastmod> is the date of
the last git commit that touched the file, or today's date when the file has
uncommitted changes. <priority> is kept from the existing sitemap when present.

Usage:
  python tools/build_sitemap.py          write sitemap.xml
  python tools/build_sitemap.py --check  exit 1 if sitemap.xml is out of date

CI needs full history for real dates (actions/checkout with fetch-depth: 0).
"""
import datetime
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_schema import ROOT, indexable_pages, page_url  # noqa: E402

SITEMAP = ROOT / "sitemap.xml"
DEFAULT_PRIORITY = "0.6"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def lastmod(rel):
    if git("status", "--porcelain", "--", rel):
        return datetime.date.today().isoformat()
    return git("log", "-1", "--format=%cs", "--", rel) or datetime.date.today().isoformat()


def existing_priorities():
    if not SITEMAP.exists():
        return {}
    text = SITEMAP.read_text(encoding="utf-8")
    return dict(re.findall(r"<loc>([^<]+)</loc>(?:<lastmod>[^<]*</lastmod>)?<priority>([^<]+)</priority>", text))


def order_key(rel):
    # Home first, then top-level pages, then insights and case studies; alphabetical within.
    depth = rel.count("/")
    return (rel != "index.html", depth, rel)


def build():
    priorities = existing_priorities()
    rows = []
    for _path, rel, _page in sorted(indexable_pages(), key=lambda x: order_key(x[1])):
        url = page_url(rel)
        prio = priorities.get(url, "1.0" if rel == "index.html" else DEFAULT_PRIORITY)
        rows.append(f"  <url><loc>{url}</loc><lastmod>{lastmod(rel)}</lastmod><priority>{prio}</priority></url>")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(rows)
        + "\n</urlset>\n"
    )


def main():
    new = build()
    current = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""
    if "--check" in sys.argv:
        if new != current:
            print("sitemap.xml is out of date; run python tools/build_sitemap.py")
            import difflib
            for line in difflib.unified_diff(current.splitlines(), new.splitlines(), "sitemap.xml", "expected", lineterm="", n=0):
                print(line)
            return 1
        print("sitemap.xml is up to date.")
        return 0
    SITEMAP.write_text(new, encoding="utf-8")
    print(f"sitemap.xml written ({new.count('<url>')} URLs).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
