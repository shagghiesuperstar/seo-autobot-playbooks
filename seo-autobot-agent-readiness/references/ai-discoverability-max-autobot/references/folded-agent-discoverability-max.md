---
name: agent-discoverability-max
description: "Use for any website work: max AI-agent discoverability."
version: 1.0.0
metadata:
  agent:
    tags: [seo, aeo, geo, aio, llms-txt, json-ld, agents, discoverability]
    related_skills: [wholesale-agent-discoverable]
---

## When to Use
Entry point for a the owner AEO/GEO/SEO/AIO/Safari/MCP request on a store = skill `ecomm-ai-discoverability` (dedupe + live scorecard + per-site fix cards); this skill is its checklist.
Any card, spec, review or release that touches a website you run (every site, and any future site). Stamp the checklist into every web card body. It is a standing requirement, not an add-on.

# Maximum agent discoverability (the owner standing order, 2026-10-08)
> "<site> needs maximum agent-friendly design, content, discoverability and value proposition to AI agents, scrapers, AIO/AEO/GEO related optimizations at every level and nuance possible. As do all websites we work on, ever."

## Non-negotiables
1. **Agents see what humans see.** Every fact in JSON-LD, llms.txt, feeds or agent files is also visible on a human page. No cloaking, no agent-only claims (the owner 10-05: "robots do not get more than humans").
2. **No invented facts.** Every claim cites a repo file, store config, catalog record or live URL. Missing fact -> omit + list as a gap for the owner. Never ship [UNKNOWN] or placeholder text publicly.
3. **Legal/state content = store facts only** (what we ship, what is blocked, 21+), plus "not legal advice" and a dated "Last updated" line. No legal interpretation.
4. **Site-specific holds win.** A trade-only site: no prices signed-out and no new signed-out human pages unless the owner approves. A B2C site may ban whole product categories from its copy; respect that list.
5. **Brand grammar.** New pages reuse existing templates (your UI-consistency conventions). Discoverability never justifies a redesign.

## Checklist (every site, every release; the gap audit scores against this)
**Crawl access**
- robots.txt allows AI crawlers: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Bingbot. Sitemap line present.
- sitemap.xml complete (every public page + product), `lastmod` real.
- Pages render meaningful HTML server-side (SSR/SSG). No content only after client JS. No age-gate wall hiding HTML from crawlers (the gate overlays; the content stays in HTML).
- Fast: LCP/INP within Core Web Vitals; no 5xx/soft-404s (missing pages return a real 404).

**Agent files**
- /llms.txt hand-written: who we are, who it's for, prices policy, age policy, what we don't sell, where facts live (links). /llms-full.txt expanded. Both list every important page.
- Product feed (/feeds/products.json or equivalent) with the same price/availability as the page.
- /.well-known/security.txt. Consider /.well-known/ agent manifests only when a spec exists (no speculative MCP/agent-checkout).

**Structured data (JSON-LD, validated in tests)**
- Site: Organization (+ logo, contactPoint, address, sameAs), WebSite + SearchAction.
- Product pages: Product + Offer (price, currency, availability, url), brand, gtin/sku when real, aggregateRating only from real reviews.
- FAQPage only where the Q&A is visible. BreadcrumbList on every non-home page. Brand/ItemList on brand pages. Article + author/date on content pages.

**Answer-engine content (AEO/GEO/AIO)**
- FAQ page answering real buyer questions (shipping, returns, age check, lab reports/COA, payment, states).
- Brand pages, category pages with a one-paragraph plain-English intro, comparison/"how to choose" and glossary content (/learn).
- Each answer is a short direct first sentence followed by detail (quotable by answer engines). Entities named consistently (store name, brands, product names) everywhere.
- Lab reports (COA) public, per batch/flavor, linked from product pages and listed in llms.txt.
- Value proposition stated plainly for agents: why buy here (lab-tested, 21+ verified checkout, shipping speed, returns) with sources.

**Freshness and proof**
- "Last updated" on policy/state pages. llms.txt carries deployed commit + generated-at.
- Every release that adds a page also updates sitemap + llms files (release checklist item).

## How your orchestrator applies it
- Every web build card body stamps: "Doctrine: skill agent-discoverability-max (checklist + non-negotiables)."
- Reviews (AR-DS) check the non-negotiables explicitly: cloaking, invented facts, JSON-LD == visible content.
- A recurring gap audit (scout, read-only) scores each site against the checklist. Gaps become cards. First audit: card AGENT-MAX-AUDIT, spec <your-ops-dir>/tasks/workspaces/agent-depth-20261008/SPEC.md.

## Pitfalls
- Sitemap audits: never judge coverage from /sitemap.xml alone. Enumerate robots.txt `Sitemap:` lines AND every child of any sitemap index (/sitemap-index.xml etc., e.g. /product-sitemap.xml), then count URLs per type across the union, citing the full chain. Why: a "0 product URLs" finding on <store> was a false positive — every product lived in /product-sitemap.xml, referenced from the index and robots; the bad finding cost a build card (UD-3, 2026-10-08).
- FAQPage/Review markup for content not on the page = spam signal. Visible first, markup second.
- Duplicate JSON-LD blocks from two components (layout + page) confuse parsers. Test: exactly one Organization per page.
- A blanket `Disallow` in robots.txt for an AI bot silently removes the site from that engine. Check robots on every release.
- Open PRs may already own a surface (structured data, category SEO). Dedupe before writing a card; stamp the out-of-scope list.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `intro`: Read `../seo-autobot-content/references/intro.md` (skill `seo-autobot-content`).
- `agent-discoverability-max`: Read `../seo-autobot-agent-readiness/references/agent-discoverability-max.md` (skill `seo-autobot-agent-readiness`).
- `ecomm-ai-discoverability`: Read `../seo-autobot-agent-readiness/references/ecomm-ai-discoverability.md` (skill `seo-autobot-agent-readiness`).
- `wholesale-agent-discoverable`: Read `../seo-autobot-agent-readiness/references/wholesale-agent-discoverable.md` (skill `seo-autobot-agent-readiness`).
