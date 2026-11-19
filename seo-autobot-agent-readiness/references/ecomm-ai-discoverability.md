---
name: ecomm-ai-discoverability
description: "Use when asked for AEO/GEO/SEO/AIO/Safari/MCP on an e-commerce store: dedupe against existing work first, run the live scorecard, and write one fix card per site against the shared standard."
metadata:
  version: "2.0.0"
  category: "agent-discoverability"
  collection: "extended"
  source_name: "ecomm-ai-discoverability"
  source_path: "agent-discoverability/ecomm-ai-discoverability/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

# E-comm AI discoverability: one entry point (the owner 2026-10-11)
> "any time i ask for AEO GEO SEO AIO Safari 27 or MCP optimization for any e-comm site ... Much will and SHOULD overlap with completed or in progress work. so de-duplicate against that first."
> Then: "use the attached to create the skill" -> the brief is `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot/references/standard.md` (VERBATIM). It is THE bar.

## When to Use
the owner asks for AEO, GEO, SEO, AIO, Safari 27, MCP/WebMCP or "agent" optimization on any e-commerce site (every store you run, and any future store), or any discoverability audit/fix/release on one. Also load it when writing any web card that touches head tags, JSON-LD, robots, sitemaps, llms files, feeds or a11y.

## The standard (read `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot/references/standard.md` every run)
Goal: the most machine-readable site on the web for search engines, answer engines, generative engines and Safari 27 safaridriver MCP agents, with ZERO visible design change (invisible/additive a11y fixes only). Seven sections:
0 Discover then plan (`AI-OPTIMIZATION-PLAN.md`, `AI-OPTIMIZATION-QUESTIONS.md`; never invent facts/prices/reviews/ratings/credentials/lab results)
1 Crawlability + technical SEO (SSR, title<=60, desc<=155, canonical, lang, OG/Twitter incl. og:site_name/type/locale + 1200x630 image, robots allowing the 18 named bots, split sitemaps with real lastmod + images, real 404, 301s, CWV green, security headers, RSS for content)
2 Structured data: ONE `@graph` per page from a shared component; Product/Offer/ItemList/Article/FAQPage/BreadcrumbList only for visible, real content; BUILD-TIME CHECK fails if JSON-LD price/name differs from the rendered page
3 Answer-engine content: quotable 1-2 sentence opener, question-shaped H2/H3 with 40-60 word answers, real tables/dl, glossary, E-E-A-T, internal links within 3 clicks; no stuffing/hidden text/doorways
4 Agent layer: /llms.txt (llmstxt.org), /llms-full.txt from the same source, `.md` twins per content page + `<link rel=alternate type=text/markdown>`, /products.json catalog from page data, honest .well-known, optional WebMCP (`navigator.modelContext`) feature-detected only for REAL actions
5 Safari 27 / a11y tree: landmarks, one h1, heading order, real a/button with names, labelled forms with autocomplete, alt text, real dialogs for gates, stable ids/data-testid on search/add-to-cart/price/nav, prices as DOM text, no JS-only content, axe zero serious/critical
6 Verification gates (below)  7 Deliverables: small commits on a branch, `AI-OPTIMIZATION-REPORT.md`, `AI-OPTIMIZATION-MAINTENANCE.md`

Companion skills (load both): `agent-discoverability-max` (non-negotiables: no cloaking, agents see what humans see, holds win) and `safari-27-mcp-optimization-autobot` (safaridriver --mcp smoke, sterile-session truth).

## Overrides for our stores (these WIN over the brief)
| Brief says | Our rule | Why |
|---|---|---|
| "likely Astro on :4321" | Detect the stack per site; e.g. a Next.js Medusa-starter monorepo may hold `apps/storefront` (B2C, base `main`) and `apps/<b2b-app>` (B2B, release branch). Detect, never assume. | brief is generic |
| "do not push to main or deploy" | Builder (cc, <your coding agent>) opens ONE PR and never merges/deploys. your orchestrator merges after AR APPROVE and ships to prod (the owner 10-07: main goes live ASAP). | chain of command |
| robots "explicitly allows" every bot | A trade-only site may keep `Disallow: /` + agent-path Allows (owner hold). A research-access gate stays when the owner ruled it. Robots may list the AI bots by name but never open gated paths. | site holds |
| Product + Offer everywhere | Trade-only site: NO price/Offer signed-out, no new signed-out pages. Research catalog: research-use-only words. B2C: no <restricted-category> claims. | holds |
| "never touch payments, auth" | same; also no Cloud env/DNS changes by the builder: write the exact var+value in the handoff, your orchestrator ships it | blast radius |
| QUESTIONS.md for the owner | your orchestrator answers anything decidable; only real business facts go to the owner, ONE question with context/rec/rationale/confidence | wall-clock |
| deliverable files at repo root | put them in `docs/ai-optimization/<site>/` (PLAN, QUESTIONS, REPORT, MAINTENANCE, gaps.md) | repo hygiene |

## Procedure (everything up to dispatch happens in ONE turn)
1. **Dedupe inventory.** `python3 ../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot/scripts/dedupe_inventory.py <ws>/dedupe-inventory.json`: every task-tracker issue, task card (21 d) and PR (both repos) on AEO/SEO/JSON-LD/llms/sitemap/robots/Safari/MCP/a11y/speed. Read non-Done rows. Prior read-only audits live under `docs/research/` on main; point builders at them, never re-audit.
2. **Measure live.** `python3 ../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot/scripts/site_audit.py https://<host> --out <ws>/audit` per site (signed-out GETs, 2 req/s). Covers brief sections 1/2/4/5 statically: robots per bot (18), sitemap union + same-lastmod count + image entries, sitemap-URLs-Disallowed, llms files, .well-known, feeds + md twins (flags SOFT-200 catch-alls), real 404, /version, security headers, per page: title/desc/canonical/h1 FLAGS, og:site_name/type/locale/url, twitter, JSON-LD types, landmarks, img-without-alt, clickable divs, heading skips, WebMCP, GPTBot parity. Lighthouse, axe and JSON-LD-vs-visible matching need a build, so they are BUILDER gates.
3. **Gap list = standard section by section, minus live-good, minus done/in-flight work, minus holds.** Each row: brief section #, live evidence (URL + observed value), fix. A gap an open card owns gets a comment there. An open issue the scorecard shows fixed closes as OBE with evidence.
4. **Dispatch one fix card per site** (cc, ENGINE <your coding agent>, ONE PR). Spec `<ws>/spec-<site>.md` holds the gap table, report paths, overrides + holds verbatim, `Doctrine: ../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot/references/standard.md` and DONE-MEANS = section-6 gates below. Copy the spec to `<your-ops-dir>/tasks/workspaces/<task_id>/SPEC-aidisc-<site>.md` right after creating the card (else card-custody flags SPEC MISSING). If a fix card for the site is already open, the new card is a STACKED follow-up: `parents=[<open card>]`, branch from that PR head, so the two never fight over the SEO component. Plus ONE read-only Safari 27 smoke card on all prod hosts (body says 'never request_review'). Follow your task tracker's card-writing conventions before writing cards.
5. **Ship.** AR (<your reviewer model>, checks no-cloaking + JSON-LD == visible + zero visual change) -> your orchestrator merges -> release -> re-run `site_audit.py` on PRODUCTION and quote the closed rows. the owner inspects on production, never a local preview (<store> previews are sign-in gated).
6. **Promise ledger** row per site; the check curls the live host (`<your-ops-dir>/scripts/checks/aidisc-<site>-live.sh` pattern), never PR or card state. Prove each new check FAILS before the fix ships: `bash <check>; rc=$?; echo rc=$rc`. Never `echo "$(basename $f) rc=$?"`: the command substitution resets `$?` to 0 and fakes "already live" (10-11).

## Deploy stamp on Medusa Cloud (10-11, <store> #<pr>)
- Cloud builds have no `.git`, so a `/version` that falls back to `git rev-parse HEAD` ships `commit_sha: unknown` (`build_sha_malformed`) even though tests and AR pass locally. Every `/version` card must derive the SHA the way <store> does (`source: cwd-path`, apps/<b2b-app>/next.config.js + deploy-stamp.ts) and must test `next build && next start` in a dir WITHOUT .git. Live check after release: `curl /version` reason must be "".

## Section-6 verification gates (builder DONE-MEANS, paste numbers)
1. `npm run build` (or `next build`) exit 0; serve the prod build locally.
2. Crawl every route: all 200, 0 broken internal links, every sitemap URL 200, 0 sitemap URLs Disallowed (except the deliberate <store> design, where the sitemap must list only Allowed paths).
3. JSON-LD parses, one `@graph`/page, and a build-time test fails on price/name drift vs the rendered page.
4. Lighthouse mobile on key pages: SEO 100, A11y >= 95, Best Practices >= 95, Performance >= 90 (report the misses with cause if a target is not reachable without a visual change).
5. axe-core: 0 serious/critical.
6. curl (no JS): robots, llms, llms-full, sitemaps, feeds, `.md` twins return the right content-type; key pages show main content, prices (where allowed) and headings in raw HTML.
7. Before/after screenshots of key pages: no visible change beyond a11y.
8. `site_audit.py http://127.0.0.1:<port>` re-run shows the card's gap rows closed. Deliverables in `docs/ai-optimization/<site>/`.

## Sites (live production hosts; re-check before every run)
| Site | Prod host to measure | Repo / app | Holds that win |
|---|---|---|---|
| <site-a> (B2C store) | <site-a>.example | <org>/<repo> apps/storefront | site holds, e.g. no <restricted-category> claims; canonical stays on the serving host until any DNS cutover |
| <site-b> (trade-only wholesale) | <site-b>.example | <org>/<repo> apps/<b2b-app>, release branch | trade-only: no prices signed-out; robots partial-allow is DELIBERATE; no new signed-out pages without the owner |
| <site-c> (research catalog behind a gate) | <site-c>.example | <org>/<repo> | research-use-only words; catalog behind the research-access gate by design |
| <site-d> (Astro on Cloudflare Workers) | <site-d>.example | <org>/<repo>-site | no owner holds yet: follow the standard's hard rules (no invented facts, primary-source citations) |

## Pitfalls
- **Robots partial-allow is not "blocked".** <store>'s `Disallow: /` + `Allow:` agent paths is the trade-only design; the scorecard prints PARTIAL. Never "fix" it into a full allow, whatever the brief says.
- **Catch-all SOFT-200s fake the agent layer (found 10-11).** On <store> AND <store>, `/products.json`, `/rss.xml`, `/feed.xml`, `/about.md`, `/wp-login.php` return 200 text/html. A status-only check says "feed exists". Always check content-type; the scorecard marks SOFT-200. The fix is a real 404 for unknown dotted paths, not a fake feed.
- **Canonical host drift after a domain cutover (10-11):** <store>.example serves, but `/us/faq` and `/us/brands` canonicals pointed at <store>.example. Check canonical host == serving host on every page type.
- **Gate-wide redirects are soft-404s (10-11):** on <store> every unknown path (and `/version`) 307s to the research-access page (200). Exempt unknown paths (real 404) and `/version` from the gate.
- **Build-time lastmod is not a real lastmod.** <store> sitemap.xml had every URL stamped with one build timestamp; the scorecard's `same-lastmod-max` catches it. Omit lastmod when no real date exists.
- **WebMCP is optional and honest-only.** Expose `navigator.modelContext` tools only for actions the site really has (search, add-to-cart where allowed), behind `if ('modelContext' in navigator)`. <store> signed-out has no cart: do not expose one. Same for `.well-known/mcp.json`/`agent.json`: never claim capabilities that don't exist.
- **Markdown twins: one alternate link site-wide is not twins.** <store> links every page to `/agents.md`; the brief wants a per-page `.md` (`/us/about.md`) generated from the same source at build time.
- **Audit reports that never became fixes are the usual overlap.** On one audit day, a dozen read-only audits sat In Review with no fix card. Turn their findings into the site fix card; never commission another audit.
- **S27 task-tracker issues from 10-09 go stale fast.** <ticket> was already live by 10-11. Re-measure before re-queueing any.
- **How a Safari 27 agent really reads a page (10-11 smoke, <task-id>):** `get_page_content` returns only the viewport slice, cuts every text node at ~95 chars, and compresses long hrefs (drops the query string, adds a counter: `/us/account?view=register` -> `/us/account2`, 60-char product slugs -> `/us/products2`), so an agent that follows what it reads hits a 404. Site-side fixes: the direct answer in the first 90 chars of each node, short CTA paths (a 308 alias like `/us/apply`), accessible names on every card/link. Never rename live product slugs for this (catalog mutation, breaks indexed URLs).
- **Route smoke findings through the site's decision log first.** The 10-11 smoke called <store>' pre-ticked gate checkboxes a compliance defect; they are the owner's <decision-id> ruling (`<catalog>-overhaul/DECISIONS.md`). Grep the DECISIONS/ruling files before turning any finding into a fix row.
- **Next.js: an `openGraph` object in a layout REPLACES the child's (10-11 <store> #<pr>).** Adding og:url/site_name/type/locale in the (main) layout dropped og:image on every page. Merge OG fields in one per-page helper, and make the test assert og:image AND the new fields together. og:image from the root-layout file convention uses `NEXT_PUBLIC_BASE_URL`: after a domain move, that Cloud env var must be on the public host (a release step for your orchestrator; builders never change env).
- **Never judge sitemap coverage from /sitemap.xml alone** (index children; see agent-discoverability-max).


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `agent-discoverability-max`: Read `../seo-autobot-agent-readiness/references/agent-discoverability-max.md` (skill `seo-autobot-agent-readiness`).
- `safari-27-mcp-optimization-autobot`: Read `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md` (skill `seo-autobot-agent-readiness`).
