---
name: seo-autobot-onsite
description: "Use when a page or site is losing: lost-question diagnosis, page audits, titles, blog refresh, internal links, 30-day sprints, SEO roast, daily autopilot, domain migration, or a scored six-dimension site audit. Holds 12 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# On-site SEO: diagnosis, titles, refresh, internal links, sprints, teardowns, autopilot, migrations

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. This skill holds 12 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `lost-prompt-diagnosis` | Lost prompt diagnosis | `references/lost-prompt-diagnosis.md` | Use when a site does not show up in Google or an AI answer for a buyer question: diagnose why (missing page, weak page, crawl/index problem, or third-party sources winning) before anyone creates content. |
| `page-audit-and-refresh-plan` | Page audit and refresh plan | `references/page-audit-and-refresh-plan.md` | Use when a page is slipping, or a diagnosis says weak page or crawl/index problem: audit it and plan a refresh instead of publishing a new page. |
| `seo-title-optimization` | seo-title-optimization | `references/seo-title-optimization.md` | Use when the user mentions titles, title tags, SERP titles, metadata titles, SEO titles, CTR, truncation, or asks to improve titles across pages. |
| `blog-refresher` | blog-refresher | `references/blog-refresher.md` | Use when the user wants to update, refresh, or improve an existing blog post, recover lost rankings, or asks why a post fell behind competitors. |
| `internal-linking` | internal-linking | `references/internal-linking.md` | Use when the user asks about internal linking, orphan pages, a blog that gets traffic but no signups, link equity, topic clusters, or why money pages don't rank. Helper files: `references/internal-linking/`. |
| `blitz-seo` | blitz-seo | `references/blitz-seo.md` | Use when a high-value page is stuck on Page 2, the user mentions "blitz seo" or a 30-day SEO sprint, or SEO effort is spread too thin across dozens of URLs. |
| `seo-roast` | seo-roast | `references/seo-roast.md` | Use when the user says "roast my SEO", "why don't we rank", "audit my site", "SEO teardown", asks why traffic or signups are flat, or wants an SEO review that ends in fixes instead of a checklist. |
| `seo-autopilot` | seo-autopilot | `references/seo-autopilot.md` | Use when the user mentions "seo autopilot", wants autonomous daily SEO PRs, or asks an agent to own a site's ongoing search growth. |
| `domain-migration` | domain-migration | `references/domain-migration.md` | Use when the user is changing domains, rebranding, moving `blog.` to `/blog`, merging sites, renaming URL slugs in bulk, or asks how to migrate without losing SEO traffic. Helper files: `references/domain-migration/`. |
| `websmith-crawl-index-sweep` | websmith-crawl-index-sweep | `references/websmith-crawl-index-sweep.md` | Use when the owner asks for a crawl/index/SEO-basics sweep, "can Google see my pages", canonicals, sitemap, soft 404s, redirect chains, orphan pages, or uses the "one subagent per group… before and after… Search Console" prompt. Runs WS-CRAWL-01..12 read-only with 3 parallel checkers, drafts one fix pack, and shows a before/after curl table. |
| `live-discovery-scorecard` | live-discovery-scorecard | `references/live-discovery-scorecard.md` | Use when a storefront needs a dated, read-only scorecard of what search and answer engines actually get from the live host (titles, canonicals, JSON-LD, proof bindings, llms.txt, sitemap, robots, soft 404s, blank meta), kept as the single source of truth and re-dropped only when something changes. |
| `six-dimension-site-audit` | six-dimension-site-audit | `references/six-dimension-site-audit.md` | Use when the operator wants a scored, evidence-backed audit of one production site across SEO technical, content, speed, accessibility, CRO, and schema, with P0/P1/P2 findings, measured-only 0-100 dimension scores, and a monthly diff. Never invent metrics. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `blitz-seo` → `../seo-autobot-onsite/references/blitz-seo.md`.
- `blog-refresher` → `../seo-autobot-onsite/references/blog-refresher.md`.
- `domain-migration` → `../seo-autobot-onsite/references/domain-migration.md`.
- `internal-linking` → `../seo-autobot-onsite/references/internal-linking.md`.
- `live-discovery-scorecard` → `../seo-autobot-onsite/references/live-discovery-scorecard.md`.
- `lost-prompt-diagnosis` → `../seo-autobot-onsite/references/lost-prompt-diagnosis.md`.
- `page-audit-and-refresh-plan` → `../seo-autobot-onsite/references/page-audit-and-refresh-plan.md`.
- `seo-autopilot` → `../seo-autobot-onsite/references/seo-autopilot.md`.
- `seo-roast` → `../seo-autobot-onsite/references/seo-roast.md`.
- `seo-title-optimization` → `../seo-autobot-onsite/references/seo-title-optimization.md`.
- `websmith-crawl-index-sweep` → `../seo-autobot-onsite/references/websmith-crawl-index-sweep.md`.
- `six-dimension-site-audit` → `../seo-autobot-onsite/references/six-dimension-site-audit.md`.
