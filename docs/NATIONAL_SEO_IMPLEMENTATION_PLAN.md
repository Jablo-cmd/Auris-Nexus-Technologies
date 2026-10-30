# National SEO Implementation Plan

**Prepared:** 30 October 2026
**Site:** https://aurisnexus.co.za (repository `Jablo-cmd/Auris-Nexus-Technologies`)
**Builds on:** `docs/SEO_AI_VISIBILITY_AUDIT.md`
**Audience:** developers implementing the changes, and the owner approving them

Every recommendation below was checked against the live site and this repository on the date above. Where the brief for this plan and the evidence disagreed, the evidence wins and the difference is called out in section 0. Nothing here guarantees rankings; it removes obstacles and builds the signals search engines and AI assistants use.

---

## 0. Corrections to the brief (read first)

| Brief said | Evidence | Consequence for this plan |
|---|---|---|
| Domain `aurisnexustechnologies.co.za` | `CNAME`, canonicals, schema, sitemap and Search Console verification all use **`aurisnexus.co.za`**. | All work targets `aurisnexus.co.za`. If `aurisnexustechnologies.co.za` is registered, 301 it to `aurisnexus.co.za` at the registrar/DNS level; never serve the site on both. |
| Server-level 301 redirects | The site is served **directly by GitHub Pages** (`server: GitHub.com`, no CDN in front). GitHub Pages ignores `.htaccess` and cannot issue 301s. | A URL migration needs a hosting change first (section 1, option B). |
| Hyper-local keyword focus | Partly true: the home page title targets "Johannesburg". But pillar pages, industry pages and FAQs already target "South Africa", and Cape Town, Durban and Pretoria pages already exist (for web design). | Section 2 builds on what exists instead of starting again. |
| Sebetsa = workforce, **patrol tracking** and operations | The case study describes people, sites, shifts, attendance, tasks, incidents, compliance, assets, inventory, procurement and contracts. "Patrol" appears nowhere on the site. | Do not add "patrol tracking" to schema or copy until the owner confirms the feature exists. |
| Stack: React, React Native, C#, Rust, TypeScript, Supabase, PostgreSQL | All three case studies document **React, TypeScript, Vite, Supabase/PostgreSQL** (Tailwind on Sebetsa and CIT). **React Native, C# and Rust appear nowhere.** | Schema and copy list only the documented stack. Add the others only per project, once confirmed. |
| CIT LMS is a proprietary product | The case study says it was built "for a single organisation" with roles mirroring its reporting structure. | Treat CIT as a **client project**, not a product, unless the owner confirms Auris Nexus owns and offers it to other organisations. |
| SoftwareApplication schema makes Google index pages "as software products" | Schema describes entities; it does not change how a page is indexed. Google's Software App **rich result** also needs `offers.price` **and** `aggregateRating` or `review`, none of which exist honestly today. | Section 3 adds the schema for entity understanding and AI answers, and does **not** fabricate prices or ratings to chase a rich result. |

Correction to the earlier audit: `docs/SEO_AI_VISIBILITY_AUDIT.md` said no case study lists its technology stack. That was wrong; each has a "Technical approach" section. The audit has been corrected.

---

## 1. Server and URL architecture

### 1.1 Current behaviour (measured 30 Oct 2026)

| Request | Response |
|---|---|
| `/technology-consulting.html` | 200 (canonical URL) |
| `/technology-consulting` | 200, same file (GitHub Pages resolves extensionless paths); canonical tag points to `.html`, so signals consolidate |
| `/technology-consulting/` | **404** |
| `/insights` | 301 → `/insights/` (directory) |
| `/cloud-solutions.html` (retired) | 200 page with meta refresh + `noindex` + canonical to `/services.html` |
| `http://…` and `www.` | 301 → `https://aurisnexus.co.za/` |

### 1.2 Recommendation: do not migrate now

File extensions are not a ranking factor. Google's URL guidance asks for simple, readable and consistent URLs, which the site already has. A migration temporarily resets signals while Google recrawls every URL, and the only benefit would be cosmetic. The bigger national wins are in sections 2–4.

**Option A (recommended): keep the `.html` URLs and harden them.**

1. Keep every internal link, canonical, `og:url`, sitemap entry and schema `@id` on the `.html` form (already true; `tools/qa_audit.py` enforces it).
2. Optional: stop the trailing-slash 404 by generating a redirect stub for each top-level page at `<slug>/index.html`. On GitHub Pages this is a meta refresh, not a 301; add it only if Search Console reports trailing-slash URLs as 404s with links pointing at them.

### 1.3 Option B: clean trailing-slash URLs (only with a hosting change)

Do this only if the owner wants trailing-slash URLs enough to change hosting. It needs a host that issues real 301s, such as **Cloudflare Pages** or **Netlify**. Both serve static files and read a `_redirects` file; Cloudflare Pages also reads a `_headers` file, which would finally apply the security headers that `.htaccess` currently fails to set.

**Runbook**

**Step 1: decide the URL pattern.** Use `/<slug>/` for every page and keep `/insights/`:

```
/technology-consulting.html                  -> /technology-consulting/
/insights/build-buy-or-configure-business-software.html
                                             -> /insights/build-buy-or-configure-business-software/
/case-studies/funda360-school-management-platform.html
                                             -> /case-studies/funda360-school-management-platform/
/index.html                                  -> /
```

**Step 2: restructure the files** (one scripted commit). Move each `foo.html` to `foo/index.html`. Relative asset paths break when a page moves one directory deeper, so first convert every `src`/`href` to a root-relative path (`/css/…`, `/images/…`). Most links already are; insights pages use `../`.

**Step 3: update the generators.** All URL logic lives in a few places:
- `tools/build_schema.py` → `page_url()`: return `BASE + rel[:-len("index.html")]` for every `…/index.html`. This is already done for `insights/index.html`; extend it to all pages.
- `tools/build_sitemap.py`: uses `page_url()`, so it updates automatically.
- `tools/rebuild_chrome.js` → `SOLUTIONS`, `NAV`, footer links and the `ACTIVE` map: replace `.html` hrefs.
- `tools/qa_audit.py`: update its canonical-format check.
- `insights/rss.xml`, `llms.txt`, `site.webmanifest`.

**Step 4: generate the `_redirects` file** from the current sitemap, so every old URL makes exactly one hop:

```python
# tools/build_redirects.py: run once before cutover, commit _redirects
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
urls = re.findall(r"<loc>https://aurisnexus\.co\.za(/[^<]*)</loc>", (ROOT / "sitemap.xml").read_text())
lines = []
for path in urls:
    if path.endswith(".html"):
        new = path[: -len(".html")] + "/"
        lines.append(f"{path} {new} 301")
        lines.append(f"{path[:-len('.html')]} {new} 301")   # extensionless form, live today
# Retired URLs: point straight at the final destination (no chains).
retired = {
    "/cloud-hosting-migration.html": "/services/",
    "/cloud-solutions.html": "/services/",
    "/cyber-security.html": "/services/",
    "/networking-infrastructure.html": "/services/",
    "/networking-infrastructure-setup.html": "/services/",
    "/data-architecture.html": "/data-analytics-business-intelligence/",
    "/data-solutions.html": "/data-analytics-business-intelligence/",
    "/insights/case-study-service-delivery.html": "/portfolio/",
}
lines += [f"{old} {new} 301" for old, new in retired.items()]
(ROOT / "_redirects").write_text("\n".join(lines) + "\n")
print(len(lines), "redirects")
```

Delete the retired meta-refresh stub files once their 301s exist.

**Step 5: security headers** (`_headers` on Cloudflare Pages). These replace the inert `.htaccess` rules:

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-Frame-Options: SAMEORIGIN
```

Leave out `preload` until the owner has decided to submit the domain to the HSTS preload list, because it is hard to undo.

**Step 6: test on the preview deployment before touching DNS.** Hosts apply their own `.html` and trailing-slash handling on top of `_redirects` (Cloudflare Pages strips `.html` automatically, for example). Confirm actual behaviour rather than assuming it:

```bash
# tools/check_redirects.sh <preview-host>
HOST=$1
grep -o '^[^ ]*' _redirects | while read -r old; do
  read -r code loc < <(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://$HOST$old")
  final=$(curl -s -o /dev/null -w '%{http_code}' "$loc")
  [ "$code" = 301 ] && [ "$final" = 200 ] || echo "FAIL $old -> $code $loc ($final)"
done
echo done
```

Every line must be a single 301 to a 200. Also check that the new URLs return 200, that canonicals are self-referencing, and that `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/.well-known/security.txt`, the Google verification file and the IndexNow key file still return 200.

**Step 7: cutover.**
1. Lower the DNS TTL a day before.
2. Point DNS at the new host and remove `CNAME` from the repo, or disable GitHub Pages.
3. Re-verify Search Console (the HTML-file method keeps working if the file is still served) and submit the new `sitemap.xml`.
4. URL Inspection: request indexing for the home page and the five pillar pages.

**Step 8: monitor.** Watch Search Console → Pages and Performance (compare by page) weekly for 8 weeks. Keep the redirects **permanently**; Google's minimum is 180 days.

**Rollback:** if rankings for the top Johannesburg queries fall and don't recover within 4 weeks, the 301s still protect the old URLs. Don't flip back and forth.

---

## 2. National hub-and-spoke content strategy

### 2.1 Guardrails

"Programmatic" city pages, meaning one template stamped out per city and service, are what Google's spam policies call **doorway abuse** and **scaled content abuse**. The risk falls on the whole domain, not just those pages. The rules for this site:

1. A city page exists only if it says something true and specific to that city: how projects there are delivered (remote, on-site visits, travel), relevant sectors, and named local work when there is any.
2. **No addresses, phone numbers or `LocalBusiness` markup outside Sandton.** City pages describe a service *offered in* a city, not an office there.
3. At most **one page per city**, covering the core services, rather than a service-by-city matrix.
4. Each city page must be **less than 50% similar** to its siblings (an automated check, below).
5. Ship one city page, measure it for 6–8 weeks, then decide on the next.

### 2.2 Architecture

```
HUB (national)                           SPOKES
/custom-software-development.html  ──┬── /software-development-johannesburg.html   (exists)
                                     ├── /software-development-cape-town.html      (new, phase 1)
                                     ├── /software-development-pretoria.html       (new, phase 2)
                                     └── /software-development-durban.html         (new, phase 3)
/business-automation.html  ──────────┬── /education.html  /logistics.html  /healthcare.html  /corporate.html  (exist)
/technology-consulting.html          └── /legal.html  /engineering.html  (new, only if 2.5 holds)
/insights/<guides>  ─────────────────── link up to hubs and across to case studies
/case-studies/<project>  ───────────── link up to hub + industry page
```

- Each **city page** covers custom software, automation, AI integration and consulting for that city. Target terms: "custom software development Cape Town", "software development company Pretoria", "business automation Durban".
- The existing `web-design-<city>.html` pages stay. Each city page links to its web-design sibling and back.
- **Industry spokes** usually convert better than city spokes, because buyers search by problem ("school management system", "leave management system").

### 2.3 City page template (unique content required)

| Section | Content | Unique per city? |
|---|---|---|
| H1 | `Custom Software Development in {City}` | Name only |
| Intro (80–120 words) | How Auris Nexus works with {City} organisations from Sandton: remote delivery, workshops, on-site visits (owner to confirm the real arrangement). | **Yes** |
| "Sectors we see in {City}" | 2–3 sectors with the business problems you actually solve for them. No market statistics unless sourced. | **Yes** |
| Services | Short cards linking to the 5 pillar pages | Shared |
| Relevant work | Case studies; name a {City} client only with permission | **Yes** where possible |
| How engagements run remotely | Discovery calls, shared roadmap, phased releases, support | Partly shared |
| FAQ (4–5) | At least 2 city-specific questions, e.g. "Do you travel to {City} for workshops?" | **Yes** |
| CTA | Free Digital Opportunity Assessment (section 4) | Shared |

**Schema** (via `tools/build_schema.py` → `INDUSTRY_SERVICES`-style map): a `Service` with `provider` → `#organization` and `areaServed` set to the city:

```json
{
  "@type": "Service",
  "@id": "https://aurisnexus.co.za/software-development-cape-town.html#service",
  "name": "Custom software development in Cape Town",
  "serviceType": "Custom software development",
  "provider": { "@id": "https://aurisnexus.co.za/#organization" },
  "areaServed": {
    "@type": "City",
    "name": "Cape Town",
    "containedInPlace": { "@type": "AdministrativeArea", "name": "Western Cape" }
  },
  "url": "https://aurisnexus.co.za/software-development-cape-town.html"
}
```

**Similarity check.** Add this inside `main()` in `tools/qa_audit.py`, where `err()` is defined, so CI fails on near-duplicates:

```python
import difflib, itertools
CITY_PAGES = sorted(ROOT.glob("software-development-*.html")) + sorted(ROOT.glob("web-design-*.html"))
def words(p):
    m = re.search(r"<main.*?</main>", p.read_text(encoding="utf-8"), re.S)
    return re.sub(r"<[^>]+>", " ", m.group(0)).split() if m else []
for a, b in itertools.combinations(CITY_PAGES, 2):
    if a.name.split("-")[0] != b.name.split("-")[0]:
        continue  # compare siblings only
    r = difflib.SequenceMatcher(None, words(a), words(b), autojunk=False).ratio()
    if r >= 0.5:
        err("near-duplicate", f"{a.name} vs {b.name}: {r:.0%} similar")
```

(The existing web-design city pages measure 18–43%, so they pass.)

### 2.4 Rollout

| Phase | Page | Gate before starting |
|---|---|---|
| 1 | `software-development-cape-town.html` | Owner confirms the delivery model, plus any Cape Town work or contacts that can be mentioned |
| 2 | `software-development-pretoria.html` | Phase 1 indexed; impressions growing in Search Console after 6–8 weeks |
| 3 | `software-development-durban.html` | Same |
| — | Home page title | Change now (below) |

**Home page title.** It currently reads `Software Development Company Johannesburg | Auris Nexus`. Make the home page national and leave Johannesburg to its dedicated page:

```html
<title>Custom Software Development & Technology Consulting South Africa | Auris Nexus</title>
```

Keep "Sandton, Johannesburg" in the description and on-page copy so local relevance stays. Track "software development company Johannesburg" in Search Console for 4 weeks after the change.

### 2.5 Vertical pages for law firms and engineering groups

There are no legal or engineering case studies yet, so these pages must not imply experience in those sectors. Publish them only if the owner can describe real problems you solve for them. Framed honestly, as the same platform patterns applied to a new sector:
- **Law firms:** matter intake, document workflows, deadline tracking and POPIA-compliant client portals. Patterns: CIT (approval workflows, audit log) and Funda360 (role-scoped records).
- **Engineering groups:** site and workforce deployment, attendance, incidents, compliance, assets and inventory. Pattern: Sebetsa's documented modules.

Each page cites the pattern case study as "the same approach in another sector", never as a legal or engineering client.

### 2.6 Keyword targets

| Cluster | Primary page | Example queries |
|---|---|---|
| Custom software (national) | `/custom-software-development.html` | custom software development South Africa; bespoke software company |
| Custom software (city) | city spokes | custom software development Cape Town / Pretoria / Durban |
| Automation | `/business-automation.html` | business process automation South Africa; workflow automation |
| School software | `/education.html` + Funda360 | school management system South Africa |
| HR / leave | `/corporate.html` + CIT | leave management system South Africa |
| Workforce / operations | Sebetsa + `/corporate.html` | workforce management software South Africa |

Search volumes aren't included: no keyword-volume source was used for this plan. Validate them in Search Console (impressions) or a keyword tool before committing writing time.

---

## 3. Flagship product schema and E-E-A-T

### 3.1 What the schema can and can't do

- `SoftwareApplication` / `WebApplication` markup tells search engines and AI assistants that Funda360 and Sebetsa are named software products made by Auris Nexus. That helps entity understanding and gives assistants clean facts to cite.
- Google's **Software App rich result** requires `offers.price` plus `aggregateRating` or `review`. There are no public prices or third-party reviews, so the pages will **not** get that rich result, and inventing either would break Google's guidelines. Add them later only from real data: published pricing, and reviews collected on the page or on a review platform.
- `JSON-LD` on these pages is generated by `tools/build_schema.py`; a hand-edit is overwritten on the next run. Implement through the generator (3.3).

### 3.2 Templates

> **Update 30 Oct 2026 (owner answers):** Funda360 and LOGIOS OS are Auris Nexus products; Sebetsa and the CIT Leave Management System are client projects, delivered and in use by those clients. **The Funda360 entity is implemented** in `tools/build_schema.py` (`SOFTWARE`). **Don't use the Sebetsa template below:** it is a client's system, not an Auris product. Add LOGIOS OS once it is commissioned.

**Funda360** (deployed and in use; SaaS):

```json
{
  "@type": "WebApplication",
  "@id": "https://aurisnexus.co.za/case-studies/funda360-school-management-platform.html#software",
  "name": "Funda360",
  "alternateName": "Funda360 School Management Platform",
  "description": "A multi-tenant school management platform that brings school administration, learner records, admissions, staff management and executive dashboards into one role-aware system that each school runs independently.",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "School management system",
  "operatingSystem": "Web browser",
  "browserRequirements": "Requires a modern web browser with JavaScript enabled.",
  "url": "https://aurisnexus.co.za/case-studies/funda360-school-management-platform.html",
  "image": "https://aurisnexus.co.za/images/portfolio/funda360-dashboard.webp",
  "screenshot": "https://aurisnexus.co.za/images/portfolio/funda360-dashboard.webp",
  "featureList": [
    "Multi-tenant architecture: each school is an isolated tenant",
    "Role-based access control for administrator, finance, teacher and guardian roles",
    "Learner registry, admissions and alumni management",
    "Staff and employee management",
    "Executive dashboards for enrolment and fee collection",
    "Two-factor authentication for sensitive roles",
    "Live system-status monitoring"
  ],
  "audience": { "@type": "Audience", "audienceType": "Schools and school groups" },
  "creator": { "@id": "https://aurisnexus.co.za/#organization" },
  "publisher": { "@id": "https://aurisnexus.co.za/#organization" },
  "inLanguage": "en-ZA",
  "isPartOf": { "@id": "https://aurisnexus.co.za/case-studies/funda360-school-management-platform.html#webpage" }
}
```

**Sebetsa** (superseded: Sebetsa is a client project, so don't publish this as an Auris product):

```json
{
  "@type": "WebApplication",
  "@id": "https://aurisnexus.co.za/case-studies/sebetsa-workforce-operations-platform.html#software",
  "name": "Sebetsa",
  "alternateName": "Sebetsa Workforce & Operations Platform",
  "description": "A role-aware, multi-tenant platform giving service organisations one operational workspace for people, sites, scheduling, attendance, incidents, compliance, assets, inventory and procurement.",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Workforce and operations management",
  "operatingSystem": "Web browser",
  "browserRequirements": "Requires a modern web browser with JavaScript enabled.",
  "url": "https://aurisnexus.co.za/case-studies/sebetsa-workforce-operations-platform.html",
  "image": "https://aurisnexus.co.za/images/portfolio/sebetsa-dashboard.webp",
  "screenshot": [
    "https://aurisnexus.co.za/images/portfolio/sebetsa-dashboard.webp",
    "https://aurisnexus.co.za/images/portfolio/sebetsa-site-operations.svg",
    "https://aurisnexus.co.za/images/portfolio/sebetsa-inventory.svg"
  ],
  "featureList": [
    "Multi-tenant organisation and operational structure",
    "Role-based access across workforce and operational modules",
    "Site operations, workforce deployment and staffing visibility",
    "Attendance, scheduling, availability, leave and task workflows",
    "Incidents, compliance, assets, inventory and procurement",
    "Client, contract and SLA management",
    "Workforce development, training, skills and performance workflows",
    "Management reporting"
  ],
  "audience": { "@type": "Audience", "audienceType": "Service organisations with distributed sites and workforces" },
  "creator": { "@id": "https://aurisnexus.co.za/#organization" },
  "publisher": { "@id": "https://aurisnexus.co.za/#organization" },
  "inLanguage": "en-ZA",
  "isPartOf": { "@id": "https://aurisnexus.co.za/case-studies/sebetsa-workforce-operations-platform.html#webpage" }
}
```

**CIT Leave Management System.** Keep it as a case study (client project). If the owner confirms Auris Nexus owns it and offers it to other organisations, add a third entry in the same shape with `"applicationSubCategory": "Leave and HR management"` and the features listed on its page.

**Rules for these entries:**
- Every `featureList` item must also appear on the visible page. Add "patrol tracking" or any new feature to the page first, then to the schema.
- Use `WebApplication` (a Schema.org subtype of `SoftwareApplication`) because both are browser apps. If a React Native app ships, add a separate `MobileApplication` entity with `operatingSystem` set to "Android" / "iOS".
- Only add `offers` once a public price exists: `{"@type": "Offer", "price": "…", "priceCurrency": "ZAR"}`.
- Only add `aggregateRating` / `review` from genuine, verifiable reviews.

### 3.3 Generator change (`tools/build_schema.py`)

```python
# Near the other constants.
SOFTWARE = {
    "case-studies/funda360-school-management-platform.html": { ...Funda360 template above, minus @id/url/isPartOf... },
    "case-studies/sebetsa-workforce-operations-platform.html": { ...Sebetsa template above, minus @id/url/isPartOf... },
}

# In build_graph(), after the Service/Article blocks and before `return`:
app = SOFTWARE.get(rel)
if app:
    node = {"@type": "WebApplication", "@id": url + "#software", **app,
            "url": url,
            "creator": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID},
            "isPartOf": {"@id": url + "#webpage"}, "inLanguage": "en-ZA"}
    graph.append(node)
    webpage["about"] = {"@id": url + "#software"}
    webpage["mainEntity"] = {"@id": url + "#software"}
```

This was tested on a copy of the repository: both case studies gain a valid `WebApplication` node, the WebPage `about` points at it, and `tools/qa_audit.py` still reports 0 errors. The link back to the company comes from `creator` and `publisher`. Don't add `owns` on the organisation: Schema.org expects a `Product` there, and a software application is a `CreativeWork`.

Run `python tools/build_schema.py`, then `--check`, then validate the two URLs in the Schema Markup Validator and Google's Rich Results Test. Expect "valid, no rich result" for the software type, which is correct.

### 3.4 E-E-A-T actions for the case studies

1. **Engagement type** on each case study (**done 30 Oct 2026**, owner-confirmed): Funda360 and LOGIOS OS = Auris Nexus product; Sebetsa, CIT and Pro Energy Solutions = client project. Sebetsa's status changed from "Built & Tested" to "Delivered & In Use". Trade Command = client project (confirmed 30 Oct 2026). Auris AI exists; case study pending owner material.
2. **Dates:** add "Delivered {month year}" or "Last updated {date}", and `dateModified` on the WebPage node.
3. **Named roles:** "What Auris Nexus did" exists on Funda360 and CIT; add it to Sebetsa.
4. **Proof assets:** a 60–90 second screen-recorded walkthrough per product (hosted on YouTube or Vimeo for a `VideoObject`), using demo tenants only and no client data.
5. **Testimonial context:** the Jo Jackson quote (a website project) currently appears on every case study. Move it to web-related pages, and collect platform-specific quotes, with permission, for Funda360 and CIT.
6. **Founder expertise:** expand `insights/authors/loyiso-ngcala.html` with verifiable background (qualifications, prior roles) and keep the LinkedIn `sameAs`.
7. **Third-party corroboration:** product listings on software directories once real reviews exist, and the Google Business Profile (see `docs/GROWTH_AUTHORITY_AND_ANALYTICS_PLAYBOOK.md`).

---

## 4. Corporate client funnel optimisation

### 4.1 Problems found

| # | Finding | Effect |
|---|---|---|
| F1 | **No analytics events.** `js/main.js` submits the contact form to Formspree but sends no GA4 event; WhatsApp, phone and email clicks aren't tracked either. | You can't tell which pages or channels produce enquiries, so SEO work can't be judged on leads. |
| F2 | The contact form's **service list omits two pillars** (Custom Software Development, Digital Transformation) and still leads with Web Development and Web Design. | Mis-categorised leads; reinforces web-agency positioning. |
| F3 | **Budget bands start at "Under R15,000"**, while business systems start from R30,000. | Attracts unqualified leads and creates a price-expectation mismatch. |
| F4 | **More than 25 different CTA labels** ("Start a Project", "Start the conversation", "Book a free consultation", "Ask a question" and so on). | Diluted offer; no single next step. |
| F5 | The "free consultation" is generic: no stated output, duration or audience. | Weak pull for cold, non-branded traffic. |
| F6 | No sector field on the form. | Can't route or report legal, engineering or school leads. |

### 4.2 Productise the free Digital Opportunity Assessment

Create `/digital-opportunity-assessment.html` as the single conversion target for cold traffic.

**Offer** (owner confirms the specifics before publishing):

> **Free Digital Opportunity Assessment**
> A 45-minute working session on one process that is costing you time. You get a short written summary of where automation or a system would help, what it would roughly cost, and what we'd do first. No obligation, and no sales deck.

**Page structure**
1. H1: "Find out where software would save your team time." Subhead with the offer above.
2. **What you receive**: three bullets (process map, opportunities ranked by effort and impact, indicative rand budget range).
3. **Who it's for**: three cards for **Schools** (admissions, learner records, fees, linking to Funda360), **Engineering and field-service groups** (site deployment, attendance, compliance, assets, linking to the Sebetsa patterns) and **Professional firms, including law firms** (intake, approvals, document workflows, POPIA, linking to CIT patterns). Describe problems, not past clients in those sectors.
4. **How it works**: book, a 45-minute session (video call or Sandton office), written summary.
5. **Short form** (5 fields): name, work email, organisation, sector, "Which process is causing the most friction?". Phone is optional.
6. **Trust strip next to the form**: CIPC 2026/606690/07 · B-BBEE Level 1 EME · POPIA-aligned handling of your information · based in Sandton, working nationally.
7. **FAQ**: is it really free; what happens after; do you work outside Gauteng; will you tell us if we don't need software.

Use the existing form handler: give the form `id="contact-form"` and the same Formspree endpoint, plus a hidden field `<input type="hidden" name="enquiry_type" value="assessment">`.

### 4.3 CTA system

Standardise on three labels everywhere (hero, cards, footer and announcement bar), applied through `tools/rebuild_chrome.js` for the chrome and a find-and-replace for page bodies:

| Role | Label | Target |
|---|---|---|
| Primary (cold traffic) | **Get a free assessment** | `/digital-opportunity-assessment.html` |
| Primary (warm: case studies, pricing) | **Request a demo** / **Get a scoped quote** | `/contact.html?project=<slug>` (already wired) |
| Secondary | **Chat on WhatsApp** | `https://wa.me/27631226552` |

### 4.4 Contact form changes (`contact.html`)

```html
<select name="service" id="service">
  <option value="">Select the closest fit</option>
  <option>Technology Consulting</option>
  <option>Custom Software Development</option>
  <option>Business Automation</option>
  <option>AI Integration</option>
  <option>Digital Transformation</option>
  <option>Mobile App Development</option>
  <option>Data &amp; Business Intelligence</option>
  <option>Website or web application</option>
  <option>Not sure yet</option>
</select>

<select name="sector" id="sector">
  <option value="">Select your sector</option>
  <option>Education / schools</option>
  <option>Legal / professional services</option>
  <option>Engineering / construction / field services</option>
  <option>Logistics / transport</option>
  <option>Healthcare</option>
  <option>Other</option>
</select>

<select name="budget" id="budget">
  <option>Prefer not to say</option>
  <option>Under R30,000</option>
  <option>R30,000 – R75,000</option>
  <option>R75,000 – R150,000</option>
  <option>R150,000+</option>
</select>

<select name="source" id="source">
  <option value="">How did you find us?</option>
  <option>Google search</option>
  <option>AI assistant (ChatGPT, Gemini, Copilot, Perplexity)</option>
  <option>LinkedIn</option>
  <option>Referral</option>
  <option>Other</option>
</select>
```

The `source` field feeds the monthly AI visibility log (`docs/AI_VISIBILITY_MONITORING.md`).

### 4.5 Lead tracking (`js/main.js`)

Inside the existing success branch of the contact-form handler:

```js
if (res && res.ok === true) {
  if (window.gtag) {
    gtag('event', 'generate_lead', {
      form_type: (form.querySelector('[name=enquiry_type]') || {}).value || 'contact',
      service: (form.querySelector('[name=service]') || {}).value || '',
      sector: (form.querySelector('[name=sector]') || {}).value || '',
      page_location: location.href
    });
  }
  /* existing success message + form.reset() */
}
```

And one delegated listener for contact clicks, added once near the end of the IIFE:

```js
doc.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a || !window.gtag) return;
  var h = a.getAttribute('href');
  var type = /^https:\/\/wa\.me\//.test(h) ? 'whatsapp' : /^tel:/.test(h) ? 'phone' : /^mailto:/.test(h) ? 'email' : null;
  if (type) gtag('event', 'contact_click', { method: type, page_location: location.href });
});
```

In GA4, mark `generate_lead` and `contact_click` as key events. **First resolve the possible double-counting** between GTM and the direct gtag snippet (`docs/SEO_AI_VISIBILITY_AUDIT.md`, item T2). If GA4 fires from GTM only, push these to `dataLayer` instead: `dataLayer.push({event: 'generate_lead', …})`.

### 4.6 Copy changes on the main pages

| Page | Now | Change to |
|---|---|---|
| Home `<title>` | Software Development Company Johannesburg \| Auris Nexus | Custom Software Development & Technology Consulting South Africa \| Auris Nexus |
| Home hero subhead | (existing) | "We help schools, professional firms and operations-heavy businesses across South Africa replace spreadsheets and manual admin with software built around how they work. Based in Sandton; working nationally." |
| Home hero CTAs | Start a Project / Explore solutions | **Get a free assessment** / See our work |
| Case studies, after "What it enables" | Request Demo | Add one line of evidence: "Live in production" (Funda360) or "Built and tested" (Sebetsa), then **Request a demo** |
| Pillar pages, side card | "Start with a free consultation" | "Get a free Digital Opportunity Assessment": the same card, linked to the new page |
| Industry pages | (existing) | Add a "Typical first project" block with one concrete scope and the starting price from `pricing.html` |

### 4.7 Measuring success (90 days)

| Metric | Source | Baseline needed |
|---|---|---|
| Non-branded impressions and clicks (queries without "auris") | Search Console | Export the last 3 months now |
| Impressions for each city spoke | Search Console, page filter | From launch |
| `generate_lead` by landing page and channel | GA4 | Starts once 4.5 ships |
| Assessment bookings → proposals → signed work | CRM / spreadsheet | Owner |
| AI assistant mentions | `docs/AI_VISIBILITY_MONITORING.md` | First monthly run |

---

## 5. Order of work

| # | Task | Section | Effort | Needs owner? |
|---|---|---|---|---|
| 1 | Lead tracking events (**done 30 Oct 2026**, see the analytics playbook section E) + resolve GTM/GA4 double counting (**open**: needs GTM access, playbook A and A2) | 4.5 | ½ day | GTM access |
| 2 | Contact form fields (services, sector, budget, source) (**done 30 Oct 2026**) | 4.4 | ½ day | Budget bands (approved: under R30k / R30–75k / R75–150k / R150k+) |
| 3 | Digital Opportunity Assessment page + CTA standardisation (**done 30 Oct 2026**: 45-minute video call, written summary within 3 working days; header button reads "Free assessment" to fit) | 4.2, 4.3 | 2 days | Offer wording (confirmed) |
| 4 | Home page title and hero copy | 4.6 | 1 hour | Approve copy |
| 5 | Product schema for Funda360 and Sebetsa via `build_schema.py` | 3.2–3.3 | ½ day | Confirm product status; "patrol" feature |
| 6 | Case-study E-E-A-T items | 3.4 | 1–2 days | Engagement types, dates, quotes |
| 7 | Cape Town city spoke + similarity check in QA | 2.3 | 1 day + content | Delivery model, local facts |
| 8 | Decide on URL migration (default: no) | 1 | — | Hosting decision |
| 9 | Pretoria and Durban spokes; legal and engineering verticals | 2.4–2.5 | per page | Gated on results |

Every change goes through the existing pipeline: run `python tools/build_schema.py`, `python tools/reading_times.py` and `python tools/build_sitemap.py`, then `python tools/qa_audit.py` and `node tools/check_links.js`, and open a PR so the SEO QA workflow runs before merge.

---

### References

- Google Search Central: [Software app (SoftwareApplication) structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- Google Search Central: [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (doorway abuse, scaled content abuse) and [March 2024 core update and spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)
- Google Search Central: [Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes); Search Console Help: [Change of Address tool](https://support.google.com/webmasters/answer/9370220) (keep redirects at least 180 days)
- GitHub Docs: [Redirects on GitHub Pages](https://docs.github.com/enterprise/2.4/user/articles/redirects-on-github-pages); [jekyll-redirect-from](https://github.com/jekyll/jekyll-redirect-from) (meta refresh, not 301)
