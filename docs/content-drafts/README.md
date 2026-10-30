# Insights article drafts (not published)

These drafts are **not live**. `docs/` is excluded from the published site by `_config.yml`.

| Draft | Ready for review? | Needs before publishing |
|---|---|---|
| `custom-software-cost-south-africa.md` | **Published 2026-10-30** | Live at `/insights/custom-software-development-cost-south-africa.html`. Keep its prices in step with `pricing.html`. |
| `when-to-invest-in-custom-software.md` | **Published 2026-10-30** | Live at `/insights/when-to-invest-in-custom-software.html`. |
| `practical-ai-integration-south-african-businesses.md` | Yes | Owner confirms the AI capabilities described are ones Auris Nexus delivers. |
| `ai-assistants-business-operations.md` | Yes | As above. |
| `digital-transformation-challenges-african-smes.md` | Partly | Owner's own experience or examples from African markets; check overlap with `/insights/digital-transformation-roadmap.html`. |

**Byline:** each draft proposes Loyiso Ngcala (Founder & Managing Director), the existing author on the site. Change it if someone else writes or reviews the final version. Follow `/insights/editorial-policy.html`.

**No statistics** are included. If a figure is added during editing, link its primary source.

**To publish:** copy an existing article (for example `insights/build-buy-or-configure-business-software.html`) as the template, replace the content, set the `article:published_time` meta and the Article JSON-LD seed, add a card on `insights/index.html` and an item in `insights/rss.xml`, then run:

```
python tools/build_schema.py
python tools/reading_times.py
python tools/build_sitemap.py
python tools/qa_audit.py
```
