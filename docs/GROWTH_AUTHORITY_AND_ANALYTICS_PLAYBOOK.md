# Growth, Authority and Analytics Playbook

Covers: African market expansion (Phase 6), external digital authority (Phase 10) and analytics / Search Console setup (Phase 12).

**Ground rules:** Nothing in this document has been submitted, registered or created. Every external account, listing or submission needs owner approval. Never create duplicate profiles, fake reviews, artificial backlinks or addresses in countries where the company has no office.

---

## 1. African market expansion strategy

### Principle
South Africa first. Expand content to another market only when there is something genuine to say about it: a client, a project, a partnership, or real knowledge of local requirements. Never create pages that only swap a country name.

### Stage 0 (now): South Africa
- Pillar pages, industry pages and case studies are South-African focused. Keep it that way.
- The About page already says the company works with clients across South Africa and the region. Keep that wording general.

### Stage 1: SADC neighbours (Botswana, Namibia, Zimbabwe, Zambia, Mozambique)
Trigger: the first real enquiry or project in a market.
- Add a single "Working with clients outside South Africa" section (on About or Contact) covering remote delivery, time zones, contracting and currency (ZAR or USD), data-protection considerations. One honest page, not one per country.
- Set `areaServed` in the schema to the countries actually served, only once a project exists there.
- Where a project is delivered, write a case study naming the country (with client permission).

### Stage 2: country guides (only with genuine expertise)
Trigger: repeat work or a partner in the country.
- Country-specific Insights articles that give real information, for example:
  - Botswana / Namibia / Zambia / Zimbabwe: their data-protection laws compared with POPIA, as they apply to business systems.
  - Kenya: integrating business systems with M-Pesa payments.
  - Nigeria / Ghana: considerations for school or logistics platforms (connectivity, offline-first, mobile money).
- Each must be reviewed by someone with first-hand knowledge, and must cite primary sources (legislation, regulator sites).

### Stage 3: Kenya, Nigeria, Ghana
Trigger: an established partner or client base. Consider a local partnership before any local presence claims. Do not list an address in any of these countries until a real office exists.

### What not to do
- No "Software Development Company Nairobi"-style pages without real local presence or work.
- No fake addresses, virtual offices presented as offices, or local phone numbers that route to Sandton without saying so.

---

## 2. External digital authority

AI answer engines and search engines put a lot of weight on what *other* sites say about a company. The aim is consistent, verifiable facts in a few credible places, not volume.

### Canonical business facts (use exactly, everywhere)

```
Name:        Auris Nexus Technologies (Pty) Ltd   (trading as Auris Nexus Technologies)
Reg. no.:    2026/606690/07
Address:     140 Linden Street, Sandown, Sandton, 2196, South Africa
Phone:       063 122 6552   (+27 63 122 6552)
Email:       info@aurisnexus.co.za
Website:     https://aurisnexus.co.za
Category:    Technology consulting / Software company
Description: Auris Nexus Technologies is a technology consulting and digital solutions company specialising in custom software development, business automation, AI integration and digital transformation. We help organisations modernise operations, improve efficiency and implement practical technology solutions aligned with their business objectives.
Services:    Technology Consulting; Custom Software Development; Business Automation; AI Integration; Digital Transformation
Hours:       Monday–Friday, 08:00–17:00
```

### Priority platforms

| Priority | Platform | Action | Notes |
|---|---|---|---|
| 1 | Google Business Profile | Claim/create **one** profile. Primary category close to "Software company"; add "Business management consultant" or "Computer consultant" if appropriate. Add the five services, photos of real work, the website link. | Google may require video verification of the business location. If the Sandton address is not staffed for walk-in clients, use a service-area business (hide the address) according to Google's guidelines. |
| 1 | Bing Places | Import from Google Business Profile once it is verified. | One listing only. |
| 1 | LinkedIn company page | Use the canonical description, list the five services under "Services", add website, address, logo, and post case-study summaries. Link founder profile. | Already referenced as `sameAs` in schema. |
| 2 | Apple Business Connect | Claim a listing with the same facts. | Feeds Apple Maps and Siri. |
| 2 | South African directories with editorial standards | Candidates to evaluate: the local chamber of commerce (for example, Johannesburg Chamber of Commerce and Industry membership directory), Brabys, Cylex South Africa, Yellow Pages SA. | Check each directory is reputable and still active before listing. Avoid paid link farms. |
| 2 | Technology directories | Clutch, GoodFirms, DesignRush. | Listings are useful once real client reviews can be collected through the platform's own verification. Never write or pay for reviews. |
| 3 | Professional / industry bodies | Evaluate membership of relevant bodies, for example the Institute of Information Technology Professionals South Africa (IITPSA) or a local software or AI industry association. | Only list memberships the company actually holds. |
| 3 | Publications and partners | Contribute expert articles (for example on POPIA-compliant systems or practical AI adoption) to South African business or technology publications; joint case studies with technology partners. | Must be genuine partnerships, and disclosed. |
| 3 | Government supplier databases | Central Supplier Database (CSD) registration, if the company wants public-sector work. | Shows the B-BBEE level through official channels. |

### Review collection (legitimate)
- After each completed project, ask the client for a Google review, with a direct review link.
- Do not offer incentives, and do not filter who gets asked.
- Reply to every review professionally.
- Do **not** add review or AggregateRating schema to the site for the company's own reviews (Google does not show self-serving review rich results for LocalBusiness/Organization).

### Consistency audit (quarterly)
Search the company name and the phone number on Google and Bing. List every listing found and correct any that differ from the canonical facts.

---

## 3. Analytics and search console

### Current state (found in the repository)

| Tool | Status | Evidence |
|---|---|---|
| Google Tag Manager | Installed | `GTM-DJ5BQVHL` on 53 pages (head script + noscript iframe) |
| Google Analytics 4 | Installed (direct gtag) | `G-W1KZXGKB56` on 49 pages |
| Google Search Console | Verification file present | `/googlec37fb6e84eb9cbc6.html` |
| IndexNow key (likely) | File present | `/149f49deca8e49fcb563a886709e3884.txt` |
| Bing Webmaster Tools | Not found | No `msvalidate.01` tag or `BingSiteAuth.xml` |
| Microsoft Clarity | Not installed | Not found |

Nothing was changed. No tokens or IDs were invented.

### Step-by-step setup

**A. Check for GA4 double counting (do first)**
1. Open tagmanager.google.com → container `GTM-DJ5BQVHL` → Tags.
2. If any tag is a "Google Tag" or "GA4 Configuration" using `G-W1KZXGKB56`, page views are being sent twice (once from GTM, once from the direct gtag snippet).
3. Fix by keeping only one: the simplest is to keep GTM and remove the direct `gtag.js` block from the page templates. Ask for the change to be made in the repository; it touches every page.
4. In GA4 → Admin → Data streams, confirm `https://aurisnexus.co.za` is the stream URL.

**B. Google Search Console**
1. Sign in at search.google.com/search-console. Confirm the property `https://aurisnexus.co.za/` (or a Domain property) is verified. Keep the verification file in the repository.
2. Sitemaps → submit `https://aurisnexus.co.za/sitemap.xml`.
3. URL Inspection → request indexing for `/custom-software-development.html` and `/digital-transformation.html`.
4. Review: Pages (indexing), Core Web Vitals, Enhancements (FAQ, Breadcrumbs), Links.
5. Link Search Console to GA4 (GA4 Admin → Product links).

**C. Bing Webmaster Tools**
1. Sign in at bing.com/webmasters.
2. Choose "Import from Google Search Console". This verifies the site and imports the sitemap without adding any token to the site.
3. If importing is not possible, Bing provides an `msvalidate.01` meta tag or `BingSiteAuth.xml` file. Send that exact value to be added; do not guess it.
4. IndexNow: check whether `149f49deca8e49fcb563a886709e3884` is the key registered in Bing (Settings → IndexNow). If it is, new and changed URLs can be pushed after each deployment.

**D. Microsoft Clarity (optional)**
Only if heatmaps and session recordings are wanted. It must be covered in the privacy policy (POPIA) and, ideally, added through GTM rather than a new page snippet. Not installed.

**A2. Finding to settle in the same check (30 Oct 2026)**
`corporate.html`, `education.html`, `healthcare.html` and `logistics.html` load GTM but **not** the direct GA4 snippet; every other content page loads both. So:
- If GTM *does* contain the GA4 tag, the other pages double-count page views. Fix: remove the direct `gtag.js` block from those pages and rely on GTM.
- If GTM does *not* contain the GA4 tag, these four industry pages record no page views at all. Fix: add the same direct snippet the other pages use.
Either way, the fix is a one-line decision for every page; send the answer from step A and the change can be made across the site.

**E. Conversion tracking (implemented 30 Oct 2026)**
`js/main.js` now sends two GA4 events through the page's direct `gtag` (not through GTM, so they cannot be counted twice):

| Event | When | Parameters |
|---|---|---|
| `generate_lead` | The contact form is accepted by Formspree | `form_type` (e.g. "Demo request", or "contact"), `service`, `sector`, `heard_about` (the form's "How did you find us?" answer), `project` |
| `contact_click` | A WhatsApp, phone or email link is clicked | `method` (`whatsapp` / `phone` / `email`), `link_position` (`header`, `menu`, `tab_bar`, `content`, `footer`) |

No personal information (name, email, phone, message) is sent. Events fire only on pages that load the direct GA4 snippet (see A2).

To finish the setup in GA4 (owner, about 10 minutes):
1. Admin → Events: after the first events arrive (up to 24 hours), mark `generate_lead` and `contact_click` as **key events**.
2. Admin → Custom definitions → create event-scoped custom dimensions for `form_type`, `service`, `sector`, `heard_about`, `project`, `method` and `link_position`, so they can be used in reports.
3. Check it works: open the site with GA4 → Admin → DebugView open (or use the Tag Assistant browser extension), click the WhatsApp button and confirm `contact_click` appears.
4. Report: Explore → Free form, rows = Landing page, values = Key events; filter by Session source/medium to compare organic search with other channels.
