# Africa-wide and International SEO and AI Search Visibility Report

**Date:** 30 October 2026
**Site:** https://aurisnexus.co.za
**Repository:** `Jablo-cmd/Auris-Nexus-Technologies`
**Builds on:**
- `docs/SEO_AI_VISIBILITY_AUDIT.md` (baseline audit)
- `docs/NATIONAL_SEO_IMPLEMENTATION_PLAN.md` (steps 1–3 done)
- `docs/GROWTH_AUTHORITY_AND_ANALYTICS_PLAYBOOK.md`
- `docs/AI_VISIBILITY_MONITORING.md`

Every section is marked **Done** (shipped and verified), **Recommended** (not done; needs a decision or evidence) or **Outstanding** (blocked on access or information). No rankings, traffic or AI citations are claimed: none exist yet.

---

## 1. Initial technical SEO audit (Done)

| Area | State on 30 Oct 2026 |
|---|---|
| Stack | Static HTML on GitHub Pages; generators for chrome (`tools/rebuild_chrome.js`), JSON-LD (`build_schema.py`), sitemap (`build_sitemap.py`) and reading times; CI runs `qa_audit.py` |
| Crawlability | `robots.txt` names search, AI-search and AI-training crawlers explicitly; all allowed; sitemap declared |
| Indexability | 57 indexable, self-canonical pages; retired URLs are `noindex` meta-refresh stubs (GitHub Pages cannot send 301s) |
| Metadata | Unique titles and descriptions; QA reports 0 errors, 0 warnings |
| Structured data | One `@graph` per page: Organization (ProfessionalService), WebSite, WebPage/FAQPage, BreadcrumbList, Service, Article |
| HTTPS / host | `http://` and `www.` 301 to `https://aurisnexus.co.za/` |
| Mobile | New pages checked at 390px and 1366px: no horizontal overflow |
| Analytics | GA4 lead events live (`generate_lead`, `contact_click`); possible GTM/GA4 double counting still unresolved |
| **Search visibility** | **The search index holds no ranking keywords or ranking pages for `aurisnexus.co.za` in South Africa** (OpenRush `inspect_domain`, 30 Oct 2026). The domain is new; authority, not on-page SEO, is now the main constraint. |

## 2. Existing geographic SEO coverage (Done)

| Geography | Pages before this work |
|---|---|
| South Africa (national) | Five pillar pages, industry pages, pricing in rand, POPIA content, `en-ZA` locale |
| Johannesburg / Sandton | `software-development-johannesburg.html`, `web-design-johannesburg.html`; HQ address in schema |
| Pretoria, Cape Town, Durban | `web-design-pretoria.html`, `web-design-cape-town.html`, `web-design-durban.html` (web design only) |
| Other SA cities | None |
| Rest of Africa / international | None. The About FAQ says "works with clients across South Africa and **the region**". That is an unverified claim; see section 18. |

## 3. Recommended geographic market priorities (Recommended)

Scored on measured demand (section 4), the ability to deliver credibly from Sandton, and evidence available today.

| Priority | Market | Evidence | Recommendation |
|---|---|---|---|
| 1 | South Africa (national) | ~420/month for "software development company (in) south africa"; ~480 for "software development company"; ~590 for "it consulting" | Main focus. Strengthen pillar pages, earn citations from SA directories and press. |
| 1a | Cape Town | ~90/month "software development company cape town" | Best city opportunity after national terms. One unique city page (section 5), gated on the owner confirming how Cape Town clients are served. |
| 1b | Durban | ~70/month (two variants) | Second city page after Cape Town shows impressions. |
| 1c | Johannesburg | ~30/month (plus HQ relevance) | Page exists; improve rather than add. |
| 1d | Pretoria / Centurion, Gqeberha, Bloemfontein, East London, Polokwane, Mbombela | Not measured; likely very low | No pages. Cover via national pages and "Where we work". |
| 2 | Nigeria | ~140/month "software development company in nigeria"; Abuja ~50; Lagos ~40 | Highest measured demand outside SA, but a crowded local market (section 15) and no local evidence. Content-brief only. |
| 2 | Kenya | ~50/month generic; ~20 "best … in kenya" | Low demand. Content-brief only. |
| 2 | Southern Africa (Zimbabwe, Botswana, Namibia, Zambia, Mozambique, Lesotho, Eswatini) | Not measured (research credits ran out) | Highest practical fit (same time zone, rand-adjacent economies) but unmeasured. Measure before building anything. |
| 3 | Ghana, Uganda, Tanzania, Rwanda, Ethiopia, Senegal, Côte d'Ivoire, Cameroon | Not measured | No pages. Senegal, Côte d'Ivoire and Cameroon are largely French-speaking; English pages won't serve them. |
| 4 | UK, EU, US, Middle East | Not measured; global terms are dominated by large firms and directories | No market pages. Remote availability is stated on "Where we work". |

## 4. Keyword research framework (Done: data and framework; Outstanding: remaining markets)

**Source:** OpenRush `research_keywords`, Google search-index data, observed 30 Oct 2026. Volumes are monthly estimates and directional only. The research stopped when the OpenRush account ran out of credits; Ghana, Zimbabwe, Botswana and the other Southern African markets weren't measured.

### South Africa: measured commercial terms

| Keyword | Volume | Competition | Intent | Landing page |
|---|---|---|---|---|
| software development company | 480 | Medium | Commercial | `/custom-software-development.html` |
| software development company in south africa | 210 | Low | Commercial | `/custom-software-development.html` |
| software development company south africa | 210 | Medium | Commercial | `/custom-software-development.html` |
| software development company cape town | 90 | Medium | Commercial | Proposed Cape Town page (section 5) |
| software development company near me | 90 | Medium | Commercial (local) | Google Business Profile + Johannesburg page |
| software development company in durban / durban | 40 + 30 | High / Medium | Commercial | Proposed Durban page |
| software development company johannesburg | 30 | Medium | Commercial | `/software-development-johannesburg.html` |
| custom software development company | 20 | Low | Commercial | `/custom-software-development.html` |
| it consulting | 590 | Low | Commercial | `/technology-consulting.html` |
| it consulting company / companies | 70 + 70 | High / Medium | Commercial | `/technology-consulting.html` |
| it consulting firm | 40 | Medium | Commercial | `/technology-consulting.html` |
| digital consulting | 70 | Low | Commercial | `/digital-transformation.html` |
| technology consulting services | 10 | Low | Commercial | `/technology-consulting.html` |
| business software | 70 | High | Commercial | `/crm-business-management-systems.html` |
| ai integration (all variants) | ≤10 each | Low | Mixed | `/ai-integration.html` (low demand: write for buyers, not volume) |

**Informational terms with volume** (Insights candidates, low commercial value): "software architecture" (2,900), "software development" (1,300), "business information systems" (1,600), "erp system examples" (320), "software requirements specification" (4,400, student-heavy).

### Nigeria and Kenya: measured

| Market | Keyword | Volume |
|---|---|---|
| Nigeria | software development company in nigeria | 140 |
| Nigeria | software development company | 110 |
| Nigeria | software development company in abuja | 50 |
| Nigeria | software development company in lagos | 40 |
| Kenya | software development company | 50 |
| Kenya | best software development company in kenya | 20 |

### Framework for each new market (Recommended)

1. **Seed terms** per pillar: "software development company", "custom software", "it consulting", "business automation", "digital transformation", "ai integration", plus "[industry] software" (school management system, leave management system, workforce management).
2. **Modifiers:** country, capital or commercial city, "near me", "best", "cost/price".
3. **Record:** volume, competition, intent, CPC (a proxy for commercial value), the current top 10, and whether directories dominate.
4. **Score:** demand × fit (can we deliver?) × evidence (do we have something true and specific to say?). Build a page only when all three are non-zero.
5. **Re-measure** quarterly; record results in a sheet alongside Search Console impressions.

## 5. Proposed URL architecture (Recommended)

The brief proposed `/services/<pillar>/` and `/locations/<country>/`. **Decision: don't migrate existing URLs, and don't create `/locations/` country pages now.**

- Moving the pillar pages to `/services/…/` on GitHub Pages can only redirect via meta refresh, not 301s, so it would risk the little equity the site has for a cosmetic gain. The full migration runbook is in `NATIONAL_SEO_IMPLEMENTATION_PLAN.md` §1.
- Keep the existing flat `.html` pattern for new geographic pages, consistent with the current city pages:

```
/where-we-work.html                          ← hub (created)
/software-development-johannesburg.html      ← exists
/software-development-cape-town.html         ← next, gated (plan §2.3)
/software-development-durban.html            ← after Cape Town shows impressions
/software-development-nigeria.html           ← only if section 7 evidence exists
/software-development-kenya.html             ← only if section 7 evidence exists
```

`/projects/` = existing `/portfolio.html` + `/case-studies/`; `/insights/`, `/about.html` and `/contact.html` stay as they are.

## 6. Pages improved (Done)

| Page | Change |
|---|---|
| Site chrome (all 57 pages) | Footer "Company" column links to "Where we work" |
| `llms.txt` | New "Locations and coverage" section: HQ, only office, national coverage, remote availability, working hours |

Earlier today (already live): five pillar pages, assessment page, CTAs, contact form, lead tracking, three articles. See the other docs.

## 7. Pages created (Done)

**`/where-we-work.html`**, title "Where We Work: South Africa, Africa & Remote". Following the brief, it keeps these categories distinct:
- **Headquarters and only office:** Sandton address; "no offices, staff or registered entities outside South Africa".
- **Geographic service coverage:** South Africa nationally (in person in Johannesburg/Pretoria, remote elsewhere).
- **International remote availability:** Africa and overseas, remotely.
- **Working-hours overlap table:** factual time-zone differences for Southern, East, West and Central Africa, the UK, EU, Gulf and US.
- **How a remote engagement runs:** six steps.
- **Cross-border data protection:** POPIA plus examples of the EU/UK GDPR, Kenya DPA 2019 and Nigeria NDPA 2023, with a "not legal advice" note.
- **FAQ (5):** offices, remote work, outside Gauteng, currency, data protection.
- **Schema and sitemap:** WebPage/FAQPage + BreadcrumbList. In the sitemap at priority 0.8.

## 8. Pages deliberately not created, and why (Done)

| Not created | Reason |
|---|---|
| `/locations/south-africa/` | Would duplicate the home page and the five pillar pages, which already target South Africa |
| `/locations/southern-africa/` and per-country pages (Zimbabwe, Botswana, Namibia, Zambia, Mozambique) | Demand unmeasured; no clients, partners or local facts to make them more than a country-name swap. "Where we work" covers availability honestly. |
| `/locations/kenya/`, `/locations/nigeria/`, `/locations/ghana/` | Low (Kenya) or moderate (Nigeria) demand against crowded local markets; no evidence. Briefs are in section 14. |
| City pages for Centurion, Gqeberha, Bloemfontein, East London, Polokwane, Mbombela | No measurable demand found; thin-page and doorway risk |
| Cape Town / Durban software pages | Justified by data but gated on the owner confirming the delivery model (plan §2.3) |
| `/services/<pillar>/` URLs | GitHub Pages can't 301; see section 5 |
| hreflang | One English site for one audience; no language or regional variants exist (section 10) |
| Auris AI case study | No material in the repository (section 13) |

## 9. Technical SEO changes (Done)

- New page uses existing template, styles and scripts; no new dependencies.
- Footer link generated through `tools/rebuild_chrome.js` (57 pages regenerated, no other content changes).
- Sitemap: 57 URLs, all canonical and indexable (`build_sitemap.py --check` passes).
- QA: `qa_audit.py` 0 errors, 0 warnings (one description shortened to pass); `check_links.js` all OK.

## 10. International SEO (Done: evaluation)

- **hreflang:** not implemented, correctly. The site has one English version for one audience; hreflang only applies when equivalent pages exist for different languages or regions.
- **Language/locale:** `lang="en-ZA"`, `og:locale en_ZA` and South African spelling are correct for the primary market. English pages also serve English-speaking African markets and the UK.
- **Currency:** rand pricing stated as rand. The new FAQ says other currencies are confirmed in the written quote (**owner to confirm**, section 18).
- **No ccTLDs or subdomains:** none created, and none recommended until there is a local entity and content.
- **Francophone markets** (Senegal, Côte d'Ivoire, Cameroon): English pages won't rank there. Not worth pursuing without French-language capability.

## 11. Structured data changes (Done)

- `/where-we-work.html`: WebPage → FAQPage (from the visible FAQ), BreadcrumbList (Home › About › Where we work), linked to `#organization` and `#website`.
- **No change to `areaServed` (still `ZA`).** Adding other countries would assert service delivery there without evidence. Revisit when there are clients outside South Africa.
- No `LocalBusiness` entities outside Sandton. No reviews, ratings or awards.

## 12. AI search optimisation and robots/sitemap validation (Done)

- Crawler rules (from earlier today) are unchanged and still valid: OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot and Bingbot are allowed. Training crawlers are allowed pending the owner's decision.
- `llms.txt` and `/where-we-work.html` now give AI systems one explicit, consistent statement of location facts. That reduces the risk of assistants inventing offices or describing Auris as Johannesburg-only.
- Sitemap: valid XML, 57 canonical URLs, no `noindex` or redirect URLs.

## 13. Project portfolio (Done: audit; Outstanding: owner input)

| Project | Status shown on site | Engagement type | Stack documented |
|---|---|---|---|
| Funda360 | Deployed & In Use | **Auris Nexus product** (owner-confirmed; label added) | React, TypeScript, Vite, Supabase, PostgreSQL |
| Sebetsa | **Delivered & In Use** (corrected from "Built & Tested") | **Client project** (owner-confirmed; label added) | React, TypeScript, Vite, Tailwind, Supabase, PostgreSQL |
| CIT Leave Management System | Delivered & In Use | **Client project** (owner-confirmed; label added) | React, TypeScript, Tailwind, Supabase, PostgreSQL |
| LOGIOS OS | In active development (to be commissioned) | **Auris Nexus product** (owner-confirmed; label added) | Documented on page |
| Trade Command | Built & Tested | Not stated ("private console") | React, TypeScript, Vite, Supabase, PostgreSQL, PWA |
| Pro Energy Solutions | Completed | Client website | — |
| **Auris AI** | **No material in repository** | — | — |

No case study states a measured business outcome, and none should until outcomes are verified. Schema templates for Funda360 and Sebetsa are ready (plan §3).

## 14. Content recommendations (Recommended)

**Insights status:** 5 of 10 brief topics published or covered; drafts ready for "Practical AI integration" and "AI assistants"; "Digital transformation challenges facing African SMEs" needs owner examples (`docs/content-drafts/README.md`).

**Content briefs for future geographic pages.** Write each page only once its "evidence required" box is ticked.

| Brief | Target terms | Unique content required | Evidence required |
|---|---|---|---|
| Cape Town software page | software development company cape town (90) | How Cape Town clients are served, relevant sectors, any Cape Town work | Owner confirms delivery model; named client with permission (optional) |
| Durban software page | software development company durban (70) | Same | Same |
| Nigeria page | software development company in nigeria (140) | Remote delivery from SA; NDPA 2023 data considerations; payment integration options; time-zone overlap | At least one Nigerian enquiry or client; owner can contract and invoice Nigerian clients |
| Kenya page | software development company kenya (50) | Remote delivery; Kenya DPA 2019; mobile-money integration considerations | Same |
| Southern Africa page | (measure first) | Same-time-zone delivery; regional data-protection laws (verify each) | Measured demand + at least one regional enquiry |

## 15. Competitor research findings (Done: limited)

The SERP tool needed credits, so this uses web search and is directional.

- **Directories dominate** South African and Nigerian results for software-company searches: Clutch, GoodFirms, DesignRush. A legitimate, review-backed listing on one or two of them is a realistic way to appear on page one, where Auris can't yet rank on its own domain.
- **Established SA firms** (for example SovTech, Netgen, Codehesion, Blue Bean Software, Custom Coding) state physical offices in Johannesburg and/or Cape Town, years of operation and team size, and some use paid advertorials on BusinessTech and Daily Investor. Auris can't match tenure; its differentiators are documented product case studies (multi-tenant platforms with stated stacks and statuses), B-BBEE Level 1, published prices and a free assessment offer.
- **Automation consultancies** in Johannesburg (Ovations, Rayburn, New Phase Solutions, BotsZA in Sandton) position on BPM platforms or chatbots. Auris's angle is custom systems built around a process, with automation inside them.
- **Offshore vendors** publish mass city/service location pages (for example appsierra `/locations/<country>/<city>/<service>`). That's the pattern to avoid.
- **Nigeria** has a large local supply of software firms on Clutch, LinkedIn and local listings, with low directory-reported rates. Competing there needs a clear differentiator, not a location page.

Sources:
- [Clutch: SA developers](https://clutch.co/za/developers?page=3)
- [GoodFirms listing example](https://www.goodfirms.co/company/zonketech)
- [Bizcommunity: SovTech](https://bizcommunity.ug/Company/SovTechSouthAfrica)
- [BusinessTech advertorial](https://businesstech.co.za/news/?p=681857)
- [Appsierra location pages](https://appsierra.com/locations/south-africa/cape-town/custom-software-development)
- [DesignRush: New Phase Solutions](https://www.designrush.com/agency/profile/new-phase-solutions)
- [Clutch: Nigeria developers](https://clutch.co/ng/developers?page=3)
- [DesignRush: Nigeria](https://www.designrush.com/agency/software-development/ng)

## 16. Test and build results (Done)

| Check | Result |
|---|---|
| `node --check tools/rebuild_chrome.js` | Pass |
| `python tools/build_schema.py --check` | Structured data up to date |
| `python tools/build_sitemap.py --check` | Up to date (57 URLs) |
| `python tools/reading_times.py --check` | Consistent |
| `python tools/qa_audit.py` | 68 pages scanned (57 indexable); 0 errors, 0 warnings |
| `node tools/check_links.js` | All internal links and tags OK |
| Browser (Playwright) `/where-we-work.html` | 1366px and 390px: no page overflow; 9-row table; FAQ opens; footer link present; "About" nav active; no page errors |
| Build | No build step (GitHub Pages serves files directly) |

## 17. Outstanding access requirements (Outstanding)

- **OpenRush credits:** top up to finish keyword research for Ghana, Zimbabwe, Botswana, Namibia, Zambia and Mozambique, and to pull live SERPs for competitor analysis (about 60 credits).
- **Google Search Console:** country and query performance; submit the sitemap; inspect new URLs.
- **Bing Webmaster Tools:** add the site; IndexNow (blocked from this environment's network).
- **Google Tag Manager:** confirm whether container `GTM-DJ5BQVHL` contains a GA4 tag (double-counting decision).
- **GA4:** mark `generate_lead` and `contact_click` as key events; add custom dimensions.

## 18. Outstanding business information (Outstanding)

1. **Ownership**: resolved 30 Oct 2026. 100% black-owned; now stated on About, the assessment page, Where we work and `llms.txt`.
2. **About FAQ "and the region" claim**: resolved 30 Oct 2026. The owner confirmed clients are in South Africa; the FAQ now says "works with clients across South Africa" and links to Where we work.
3. **International invoicing**: resolved 30 Oct 2026. Quotes in rand, US dollars or the client's currency at the equivalent of rand pricing; stated on Where we work and `llms.txt`.
4. **In-person meetings**: resolved 30 Oct 2026. At the Sandton office or any venue agreed with the client; stated on Where we work and `llms.txt`.
5. **Engagement type**: resolved for Funda360, LOGIOS OS, Sebetsa, CIT and Pro Energy. Still open: Trade Command's engagement type, and whether "Auris AI" exists.
6. **Cape Town / Durban delivery model**, before those pages are written.

## 19. Risks and unresolved issues

| Risk | Mitigation |
|---|---|
| The domain has no measurable rankings yet; on-page work alone won't create visibility | Directory listings with genuine reviews, Google Business Profile, PR and partner links (playbook §2) |
| Thin or programmatic location pages would trigger doorway / scaled-content policies | Evidence gate and the similarity check in plan §2.3 |
| Claims about the region or international clients without evidence | Section 18 items 2–4 |
| Possible GA4 double counting distorts measurement | Owner GTM check |
| Low demand for "AI integration" terms | Write AI content for buyers and AI answer engines, not for search volume |
| GitHub Pages cannot 301 or set security headers | Hosting decision (plan §1.3), not urgent |

## 20. Recommended next 10 actions

1. **Claim a Google Business Profile** for the Sandton office (one listing, exact NAP). It's the only realistic route to "near me" and Johannesburg local results.
2. **Get listed on Clutch or GoodFirms** with 2–3 verified client reviews. Directories own page one for the target terms.
3. **Answer section 18**, especially the "region" claim and international invoicing, so every published statement is verified.
4. **Search Console:** submit the sitemap, request indexing of the 5 pillar pages, the assessment page and "Where we work", and export a baseline of impressions by country.
5. **Resolve GTM/GA4** so lead data is trustworthy before judging any channel.
6. **Build the Cape Town software page** once its delivery model is confirmed (the highest measured city demand).
7. **Add engagement types and schema to the case studies** (plan §3); confirm or drop "Auris AI".
8. **Top up OpenRush** to measure the Southern African markets and pull competitor SERPs, then re-score section 3.
9. **Publish the two AI drafts** after confirming the capabilities they describe. Low search volume, but they feed AI answers.
10. **Run the monthly AI visibility check** (`docs/AI_VISIBILITY_MONITORING.md`) and add Nigeria and Kenya queries, to see whether assistants ever name Auris outside South Africa before investing in those markets.
