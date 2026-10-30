# AI Visibility Monitoring Framework

A repeatable monthly process for checking whether, and how accurately, AI search and answer platforms present Auris Nexus Technologies.

**Principle:** a single good answer is not visibility. AI answers vary between sessions, accounts, locations and days. Only trends across several months and several runs count.

Log every result in `docs/ai-visibility-log-template.csv` (copy it to a dated sheet or spreadsheet each month).

---

## 1. Query set

Keep the set fixed so months can be compared. Add new queries at the end; do not change existing wording.

### Category queries (discovery)
| ID | Query |
|---|---|
| Q01 | Best custom software development companies in South Africa |
| Q02 | AI integration companies in Johannesburg |
| Q03 | Business automation consultants in South Africa |
| Q04 | Software development companies in Southern Africa |
| Q05 | Digital transformation consulting in Africa |
| Q06 | Custom business application developers in South Africa |
| Q07 | Technology consulting firms in Sandton |
| Q08 | Who can build a school management system in South Africa? |
| Q09 | Logistics operations software developers in South Africa |
| Q10 | B-BBEE Level 1 software development company Johannesburg |

### Brand queries (accuracy)
| ID | Query |
|---|---|
| B01 | What is Auris Nexus Technologies? |
| B02 | What services does Auris Nexus Technologies offer? |
| B03 | Where is Auris Nexus Technologies located and how do I contact them? |
| B04 | What projects has Auris Nexus Technologies built? |
| B05 | Auris Nexus vs [competitor named in a previous month] |

---

## 2. Platforms

| Platform | How to test |
|---|---|
| ChatGPT | Search enabled, logged out or a clean account, no memory. |
| Google Search (AI Overviews / AI Mode) | Incognito, location South Africa. Note whether an AI Overview appears at all. |
| Google Gemini | Clean session. |
| Microsoft Copilot | Clean session. |
| Perplexity | Default mode, logged out. |

Optional: Claude (with web search), Bing search results page.

---

## 3. Method (monthly, about 2 hours)

1. Same week each month (for example, the first Monday).
2. Use a clean browser profile or incognito, from South Africa. Record the location used.
3. For each query × platform, run **twice** in separate sessions. Record both runs.
4. Paste or screenshot the answer. Save screenshots to a shared folder named `YYYY-MM/`.
5. Fill one CSV row per run (columns below).
6. Fill in the monthly summary (section 5).

### What to record (CSV columns)

| Column | Values |
|---|---|
| `date` | YYYY-MM-DD |
| `platform` | chatgpt / google-aio / gemini / copilot / perplexity |
| `query_id` | Q01–Q10, B01–B05 |
| `run` | 1 or 2 |
| `mentioned` | yes / no |
| `position` | Position in a list (1, 2, …) or blank |
| `website_cited` | yes / no (aurisnexus.co.za linked or cited as a source) |
| `cited_urls` | Auris Nexus URLs cited, separated by spaces |
| `services_associated` | Services the answer attributes to Auris Nexus |
| `info_accurate` | yes / partly / no |
| `inaccuracies` | What was wrong (address, services, wrong company, etc.) |
| `competitors_mentioned` | Other companies named, separated by semicolons |
| `sources_cited` | Third-party domains cited (directories, LinkedIn, articles) |
| `notes` | Anything unusual |

---

## 4. Metrics

Calculated per platform and overall, monthly:

- **Mention rate (category):** share of Q-query runs that mention Auris Nexus.
- **Citation rate:** share of runs that cite aurisnexus.co.za.
- **Accuracy rate (brand):** share of B-query runs with `info_accurate = yes`.
- **Service association:** how often each of the five pillars is attributed to Auris Nexus.
- **Source mix:** which third-party domains the platforms cite for this category. These are candidate places to build a legitimate presence.
- **Competitor set:** companies most often named. Study their cited sources, not their tactics.

Treat any change smaller than about two runs per platform as noise.

---

## 5. Monthly summary template

```
Month:
Location used:
Runs completed:  /150  (15 queries × 5 platforms × 2 runs)

Category mention rate:    this month __%   last month __%
Citation rate:            this month __%   last month __%
Brand accuracy rate:      this month __%   last month __%

Inaccuracies found (and correction action):
-

Most-cited third-party sources:
-

Most-mentioned competitors:
-

Site or content changes made this month:
-

Actions for next month:
-
```

---

## 6. Responding to findings

| Finding | Response |
|---|---|
| Wrong address, phone or services | Find which source the platform cites. Correct it at that source (directory, profile). Check the on-site facts match `llms.txt` and the schema. |
| Not mentioned, competitors cited from directories | Consider a legitimate listing on those directories (owner approval required). |
| Mentioned but no citation | Strengthen the matching service page and Insights content for that query. |
| Positioned as a web-design agency | Review emphasis of web-design pages versus pillar pages. |
| Brand query confuses with another company | Make sure LinkedIn, Google Business Profile and directories all use the legal name and the same description. |

## 7. Supporting data sources

- Google Search Console: queries and pages, including the new pillar pages.
- Bing Webmaster Tools: search performance and AI-related reports where available.
- GA4: referral traffic from `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com` (create an exploration filtered on these sources).
- Contact form and WhatsApp enquiries: ask "How did you hear about us?" and record answers mentioning AI tools. Qualified enquiries are the real goal.
