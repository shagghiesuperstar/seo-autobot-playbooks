---
name: ai-bot-log-analysis
description: "Use when server or CDN logs are available and the question is whether AI crawlers and assistants can reach the pages that matter."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "AI bot log analysis"
  source_path: "search-ops/ai-bot-log-analysis/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: AI bot log analysis
description: >-
  Use when server or CDN logs are available and the question is whether AI crawlers and assistants can reach the pages that matter: report which bot classes fetch which pages, what they receive, which URLs they request that do not exist, and what to fix.
```

Inputs: at least 30 days of server or CDN logs with timestamp, path, status, bytes, user-agent, and client network; the money pages and question-map pages; the redirect map; and the access policy from AI inclusion and crawler policy. The helper `scripts/ai_bot_log_summary.py` produces the tables from combined-format and JSON-lines logs.

Rule: logs are the only record of what machines actually did. A crawl simulation says what could happen; the log says what did.

## Step 1: Classify, and say how sure you are

Group requests into search engines, AI training crawlers, AI search and index crawlers, user-triggered assistant fetchers, signed browsing agents, and unknown automation. Classify by user-agent first, then mark each group verified (edge verified-bot field, published network range, or valid signature) or unverified. Report unverified traffic separately; spoofed agents are common and inflate every count.

## Step 2: Answer five questions

1. Reach. For each money page and question-map page: last fetch date and count per bot class. A page no search or assistant bot has fetched in the window cannot be cited from a fresh retrieval. List those first.
2. Response. Status mix per class. Look for 403 and 429 on allowed classes, challenge pages returned with a 200 and a small byte count, and redirects longer than one hop.
3. Rendering. Compare bytes served to the bot with the size of the fully rendered page. Published tests to date found most AI crawlers fetch the initial HTML and do not execute JavaScript, while Google does render. Content that exists only after client rendering should be assumed invisible to assistants until a no-JavaScript fetch proves otherwise.
4. Missing URLs. Paths requested by assistant fetchers that return 404. Assistants cite and request URLs that were never published or that moved. Each one with repeat hits is a buyer who was sent to a dead page.
5. Waste. Share of AI bot fetches spent on parameters, facets, internal search, and feeds rather than on pages that answer a buyer question.

## Step 3: Fix in this order

1. Allowed bots receiving errors or challenges on money pages: an edge rule, back to the access policy.
2. Money pages with content only in client-rendered output: prerender or server-render the answer paragraph, price, and headings.
3. Requested-but-missing URLs: where a clear equivalent exists, add a one-hop 301 to it and add the row to the redirect map; where none exists and the request recurs, log it as a missing-page candidate for the ideas board. Never redirect everything to the homepage.
4. Unfetched money pages: check internal links, sitemap inclusion with a true `lastmod`, and robots rules before touching copy.
5. Waste: canonical and robots rules for the parameter space, never a block on the page itself.

## Step 4: Tie fetches to outcomes, carefully

User-triggered fetches are the closest thing to an impression count outside the platform reports: a person asked, the assistant fetched. Trend them by page next to assistant-referral sessions from analytics. Do not call it a conversion rate; many fetched pages are never clicked, and many referred visits arrive with no referrer.

## Step 5: Rerun after any change

Same window length, same classification, a week after the change ships. Report the delta in reach and error share, and add the run to the annotations file.

## Output

The report saved dated, with the tables, the top five fixes, the verification level of every count, and what the logs could not show (sampling, missing fields, CDN cache hits that never reached origin).

Never treat a user-agent as proof. Never estimate bot traffic without logs. Never block, allow, or redirect from this skill; it reports and hands the diff to the owning skill.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- AI inclusion and crawler policy (`ai-inclusion-and-crawler-policy`): Read `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md` (skill `seo-autobot-crawlers-and-policy`).
