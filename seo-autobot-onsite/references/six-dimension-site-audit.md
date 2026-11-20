---
name: six-dimension-site-audit
description: "Use when the operator wants a scored, evidence-backed audit of one production site across SEO technical, content, speed, accessibility, CRO, and schema, with P0/P1/P2 findings, 0-100 dimension scores from measured checks only, and a monthly diff. Never invent metrics."
metadata:
  version: "1.0.0"
  category: "onsite"
  collection: "extended"
  source_name: "Six-dimension site audit"
  source_template: "Adapted 2026-11-20 from a public Site Audit template (six dimensions, P0/P1/P2, measured-only scores, monthly diff). Paths remapped to seo/<site-slug>/audits/ and existing read-only audit rules."
---

# Six-dimension site audit

A measure-only method. It writes nothing to the live site and opens no pull request. It produces one dated, scored report for a single production host across six dimensions — SEO technical, content, speed, accessibility, CRO, and schema — plus a diff against the last run when a baseline exists.

It is not a substitute for `seo-roast` (revenue-first teardown that may ship a PR), for `page-audit-and-refresh-plan` (one URL), for `live-discovery-scorecard` (host-of-record control plane), or for the AgentReady / Websmith 129-check audit (`websmith-audit-runner`). Those methods stay themselves. This one adds the scored six-dimension rubric, the mandatory evidence URL on every finding, and the monthly four-way diff. Reuse their measured evidence when it is current rather than re-testing the same URL.

## Rules
1. **Never invent a site, a metric, a Lighthouse or PageSpeed or lab number, traffic, a ranking, or a conversion rate.** A check you could not run is `unmeasured` (or `UNTESTED`) with the reason. Fail loud.
2. **Read-only, public pages only.** GET and HEAD only, at most 1 request per second per host, timeouts on every call, no load tests. No logins, purchases, form submits, or cart changes. Never change the live site, a CMS entry, robots, DNS, or feeds. Outside scans (including PageSpeed Insights and a URL fetch by the schema validator) need an explicit per-domain yes first; otherwise mark those checks unmeasured.
3. **Every finding has a severity (P0 / P1 / P2), a dimension, an evidence URL (and a screenshot or tool link where you have one), and a concrete fix.** A finding without an evidence URL is not a finding.
4. **Score each dimension, and an overall score, only from measured checks.** Show how each score was derived. Unmeasured checks are excluded from the denominator and listed. Do not average these scores with AgentReady, Websmith, ARI-100, or a PageSpeed "performance" grade (`normative-score-separation`).
5. **Priorities weight which P0s you lead with, not which dimensions you skip.** All six dimensions are in scope every run.
6. **Monthly diffs use four sections: fixed / still open / new / regressions.** Do not claim a fix without evidence in this run's crawl or tool output.
7. **One production host.** Never invent a URL. If `seo/<site-slug>/context.md` has no site URL, ask and stop; do not guess.

## Severity
- **P0.** Blocks indexing, crawling, conversion, or access (for example noindex on a money page, a broken primary CTA or checkout step a signed-out user cannot complete, a WCAG Level A failure on a core flow).
- **P1.** Material loss of ranking, speed, or conversion; fix this cycle.
- **P2.** Polish and best practice; batch later.

Owner-intended gates (login, trade wall, age gate, blocked region, bots they chose to block) are EXCEPTION, never P0, quoted with the reason. They are not "fixed."

## Scoring (0-100, measured checks only)
For each dimension, list the checks you actually ran.

- A measured check scores **1** (pass), **0.5** (warn), or **0** (fail).
- Dimension score = `round(100 * points / measured_count)`.
- Unmeasured checks are left out of the denominator and listed with why.
- If a dimension has fewer than three measured checks, write **unscored (fewer than 3 measured checks)** instead of a number, and list what you did run.
- Overall score = the average of the dimensions that have a number, and only those. Show the set. If fewer than two dimensions scored, do not publish an overall number.

Quote lab and field speed numbers as inputs to speed checks, labeled lab or field, with the tool and date. Do not treat a PageSpeed Performance grade as this method's speed score.

## Crawl scope
Default, unless `seo/<site-slug>/context.md` records a custom list or cap:

- The homepage.
- Unique pages linked from the primary navigation (and the footer, if it names main templates the nav does not).
- One example of each public template (for example home, category or collection, product, article or guide, a standard content page). Skip login, account, checkout-post, and other gated URLs unless they are publicly reachable without a credential.
- Cap about 30 pages (`page_cap`, default 30).

Build the list from real `href`s on the homepage and nav. Never invent product or template URLs. If the nav is injected only after JavaScript and a raw GET does not show it, say so, use the links you can see, and mark the missed templates unmeasured rather than guessing a sitemap is complete.

## State and artifacts
Write setup fields into the site's `seo/<site-slug>/context.md` (not a separate setup file, and not a folder outside that site's state): `site` (production URL), `crawl_scope`, `page_cap`, `audit_priorities`, `audit_data_sources`, and the timezone already saved from intake.

| Path | What |
|---|---|
| `seo/<site-slug>/audits/YYYY-MM-DD.md` | Full scored report for this run |
| `seo/<site-slug>/audits/YYYY-MM-DD-diff.md` | Four-way diff against the previous report and baseline; omitted on the first run |
| `seo/<site-slug>/audits/latest.md` | Copy of the latest full report |
| `seo/<site-slug>/audits/baseline/` | Small snapshots per sampled URL: title, status, canonical, SHA-256 of the raw HTML (store the hex and byte length, not a second full copy), plus a short extract (H1 and JSON-LD `@type`s). Keep these small. |
| `seo/<site-slug>/audits/evidence/YYYY-MM-DD/` | Screenshots and saved tool links or response excerpts for this run |
| `seo/<site-slug>/audits/IMPROVEMENTS.md` | Dated process notes from the weekly self-improve routine |
| `seo/<site-slug>/log.md` | One dated line for the run |
| `websmith/runs/<domain>/...` | Reuse a current Websmith or AgentReady run's evidence when it exists; do not merge its scores into this report |

Dates and timestamps are reported in the operator's saved timezone, with that zone named. If no timezone is saved, ask once before scheduling a routine, and label the report clock you used.

## Procedure
1. **Confirm the host and the answers you still need.** Read `seo/<site-slug>/context.md` and, if they exist, `seo/<site-slug>/audits/latest.md` and `seo/<site-slug>/discovery/` scorecards. If the production URL is missing, ask (interview q1). If this scored audit is in scope and q39–q41 are unknown, ask them one at a time. Do not re-ask a URL or timezone you already have. Offer matching connectors only after a yes; never collect an API key in chat (a PageSpeed Insights key, if they have one, is an environment variable the operator sets).
2. **Build the URL list** from the crawl-scope rule above. Record the final list and the cap in the report.
3. **Collect evidence, dimension by dimension,** at the audit-mode rate limit. Prefer evidence already measured on this host in the last 30 days (a `live-discovery-scorecard`, a `websmith-crawl-index-sweep`, Websmith A11Y or CWV rows, a page audit) over a fresh hit of the same URL. Name the source and date you reused.
4. **Score and write the report** using the template below. Lead the P0 list with the operator's stated priorities, then the rest.
5. **Diff** when a previous report or baseline exists. Update `baseline/` snapshots for the sampled URLs. Copy the full report to `latest.md`. Write one line in `log.md`.
6. **Hand off fixes, do not apply them.** Fatals that block crawl or indexation can be offered to `seo-roast` or `websmith-crawl-index-sweep`. Agent-readiness gaps stay on W9. Single-page content refreshes go to `page-audit-and-refresh-plan`. Image failures go to `image-seo-checklist`. Nothing is merged, published, or changed from this run.

## Checks by dimension
Run each check on the crawl sample (or on the money pages, where noted). Skip a check that does not apply, with the reason (for example no forms, no product template). Do not pad.

### SEO technical
Indexable money pages (no accidental noindex, noindex robots, or `X-Robots-Tag` on URLs that should rank). Self-canonical, or a documented reason otherwise. In the sitemap when it should be; sitemap responds as XML. Sensible status codes; no redirect chains or loops on sampled URLs. Soft-404 probe on at least one invented path per public template (a 200 for a missing path is a P0). HTTPS and a viewport meta on templates. Title, meta description, and one H1 present on sampled templates. Reuse `live-discovery-scorecard` and `websmith-crawl-index-sweep` when current.

### Content
Intent match on money pages and sampled articles (the page is the right shape for the query it appears to target). The main question answered early in plain language. Headings in order. Dated or sourced claims where numbers appear; flag outdated dates you can see, never invent a freshness score. Thin, duplicate, or boilerplate templates noted with the URLs. Run `image-seo-checklist` on every image of at least the homepage and one money page (filename, compression, alt, schema, originality, caption, real `<img src>`, lazy-load below the fold only). Measure file sizes or say they were not measured.

### Speed (Core Web Vitals)
Field or lab Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift for the homepage and at least one money page, against the published Core Web Vitals thresholds (p75 LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; source: https://web.dev/articles/vitals). Label each figure lab or field, mobile or desktop, and the tool (PageSpeed Insights, Lighthouse, or a reused Websmith CWV row) with its date. Images sized to the width they display, with width and height (or an equivalent aspect-ratio) so the layout does not shift. If the operator has not approved a PageSpeed Insights or remote Lighthouse run, and you have no current measured CWV evidence, the speed dimension is unmeasured, not guessed. A public PageSpeed Insights run (https://pagespeed.web.dev/ or the API) is an outside crawl of the site; get a yes first.

### Accessibility (WCAG 2.2)
Reuse Websmith A11Y checks (`websmith-checklist` WS-A11Y-01 to WS-A11Y-13) and the `websmith-browser-agent-check` WCAG 2.2 AA subset when a current run exists. Otherwise, on the crawl sample, check: page language, one main landmark and one H1, alt text on content images, named links and buttons, labeled form controls (read only, do not submit), keyboard reachability of the primary action when a real browser is available, focus not hidden by sticky bars, and target size on primary CTAs. Name the browser engine that actually ran. If no browser is available, mark keyboard and target-size checks UNTESTED. Use https://www.w3.org/WAI/WCAG22/quickref/ as the reference for the criteria you tested; do not claim a full WCAG conformance audit unless you actually ran one.

### CRO (conversion)
On each money page in the sample: the primary call to action is visible in the initial view of a raw GET or a named browser pass, the destination URL is a real `href` that returns a usable public page (HEAD or GET, no form post), and forms that start the conversion have labels. Walk a signed-out path only as far as GET allows (for a store, home → product → cart page if the cart is reachable without a POST). Stop before any purchase, account creation, or form submit. Flag a broken, looping, or missing primary CTA as P0. Flag conflicting offers or an obscured CTA as P1 or P2 with evidence. Never invent a conversion rate, a funnel percentage, or revenue impact.

### Schema / structured data
For sampled templates, extract JSON-LD (and relevant microdata if no JSON-LD exists) from your own GET. Record `@type`s, and whether they fit the page (for example Organization or WebSite on the home page, Product and Offer on a product, Article on an article). Required visible facts that the type implies (name, URL, price and currency and availability for an Offer, and so on) must match the visible page; a mismatch is a finding. Invalid JSON is a fail. The page's preferred preview image, if advertised, should be a representative image, not only the logo. Where it helps, Product, licensed, or key editorial images follow the ImageObject rule in `image-seo-checklist`. Validate the extracted markup; the reference tool is https://validator.schema.org/. Submitting a live URL to that validator is an outside fetch and needs a yes; otherwise validate the extracted JSON-LD and keep a local copy under `evidence/`.

## Report template
Save as `seo/<site-slug>/audits/YYYY-MM-DD.md` and copy to `seo/<site-slug>/audits/latest.md`.

```markdown
# Site Audit: {production URL} ({date, timezone labeled})

Crawl scope: {list or "default"}, cap {n}, pages actually fetched {n}.
Data sources used: {only those measured this run}. Priorities: {as stated, or "none stated"}.

## Scores
| Dimension | Score | Measured checks (pass / warn / fail) | Unmeasured |
|---|---|---|---|
| SEO technical |  |  |  |
| Content |  |  |  |
| Speed |  |  |  |
| Accessibility |  |  |  |
| CRO |  |  |  |
| Schema |  |  |  |
| Overall (scored dimensions only) |  | {which dimensions} |  |

How the scores were derived: {one short paragraph, or "unscored, see Unmeasured"}.

## P0
- [{dimension}] {finding}. Evidence: {URL}{, screenshot or tool link}. Fix: {concrete fix}.

## P1
- …

## P2
- …

## Unmeasured and why
- {check}: {reason}
```

## Diff template
Save as `seo/<site-slug>/audits/YYYY-MM-DD-diff.md` when a previous report or baseline exists. Chat the diff on a monthly routine even when nothing material changed.

```markdown
# Site Audit diff: {production URL} ({date} vs {previous date})

## Fixed
- {finding}, evidence this run that it is gone ({URL or snapshot}).

## Still open
- {finding}, still visible at {URL}.

## New
- {finding}, evidence {URL}.

## Regressions
- {previously passing check or snapshot} now fails, evidence {URL}.
```

A row in **Fixed** requires evidence from this run (the URL now passes the same check, or the baseline title or hash change plus the check result). Do not move an item to Fixed because someone said it was shipped.

## Interview questions this method needs
Asked one at a time only when this audit is in scope (see `interview.md` Part `scored-audit`, q39–q42). Map answers into `seo/<site-slug>/context.md`. Skip any already answered.

- **q39 crawl scope.** Default or a custom list and cap.
- **q40 priorities.** Rankings / organic traffic, conversions, page speed, accessibility compliance, rich results / schema. Weights the P0 lead; does not drop a dimension.
- **q41 data sources.** Search Console, PageSpeed Insights (API key as an environment variable, never pasted), Semrush, analytics, or public crawl only. Offer a connector only after a yes. Anything declined is unmeasured.
- **q42 routines.** Plain text, not a widget: monthly re-audit and weekly self-improve, both paused until a yes. Timezone must already be saved before any routine is enabled.

## Routines (proposals only; start paused)
- **RT18 monthly six-dimension re-audit.** Same host and crawl scope. Rewrite the report, the diff, `latest.md`, and baseline snapshots. Chat the diff even when there is no material change. Stay quiet only when no production URL is saved; never invent a site or lab numbers.
- **RT19 weekly audit self-improve.** Do one concrete improvement to how this audit is run or reported (a checklist note, an evidence convention, a scoring clarification, a crawl-scope reminder, or a gap hit on a real audit). Append a short dated entry to `seo/<site-slug>/audits/IMPROVEMENTS.md`. Do not run a full audit on this wake unless a URL is already saved and you are only tightening process docs. Stay silent after logging the note unless a human decision is required (for example still no site URL, or the monthly routine is broken). No filler "all good" ping.

## Reference links
- Core Web Vitals: https://web.dev/articles/vitals
- PageSpeed Insights (outside crawl; needs a yes): https://pagespeed.web.dev/
- WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
- Schema markup validator (URL fetch needs a yes): https://validator.schema.org/
- Image SEO (content dimension): `image-seo-checklist`, and Google's image SEO guide at https://developers.google.com/search/docs/appearance/google-images

## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `seo-roast`: Read `../seo-autobot-onsite/references/seo-roast.md` (skill `seo-autobot-onsite`).
- `page-audit-and-refresh-plan`: Read `../seo-autobot-onsite/references/page-audit-and-refresh-plan.md` (skill `seo-autobot-onsite`).
- `live-discovery-scorecard`: Read `../seo-autobot-onsite/references/live-discovery-scorecard.md` (skill `seo-autobot-onsite`).
- `websmith-crawl-index-sweep`: Read `../seo-autobot-onsite/references/websmith-crawl-index-sweep.md` (skill `seo-autobot-onsite`).
- `image-seo-checklist`: Read `../seo-autobot-content/references/image-seo-checklist.md` (skill `seo-autobot-content`).
- `websmith-audit-runner`: Read `../seo-autobot-agent-readiness/references/websmith-audit-runner.md` (skill `seo-autobot-agent-readiness`).
- `websmith-checklist`: Read `../seo-autobot-agent-readiness/references/websmith-checklist.md` (skill `seo-autobot-agent-readiness`).
- `websmith-browser-agent-check`: Read `../seo-autobot-agent-readiness/references/websmith-browser-agent-check.md` (skill `seo-autobot-agent-readiness`).
- `websmith-report-writer`: Read `../seo-autobot-agent-readiness/references/websmith-report-writer.md` (skill `seo-autobot-agent-readiness`).
