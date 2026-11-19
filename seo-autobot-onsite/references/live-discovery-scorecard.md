---
name: live-discovery-scorecard
description: "Use when a storefront needs a dated, read-only scorecard of what search and answer engines actually get from the live host (titles, canonicals, JSON-LD, proof bindings, llms.txt, sitemap, robots, soft 404s, blank meta), kept as the single source of truth and re-dropped only when something changes."
metadata:
  version: "1.0.0"
  category: "onsite"
  collection: "extended"
  source_name: "Live discovery scorecard"
  source_template: "Distilled 2026-11-18 from a private discovery bot's working method (memory log 2026-08-31..2026-09-14 and its scorecard drops). Site names, hosts, people, and ticket IDs removed."
---

# Live discovery scorecard (control-plane method)

A measure-only method. It writes nothing to the site and opens no PR. It produces one dated scorecard per host that every other playbook can cite, and an engineering hitlist of the smallest fixes. Use it when several hosts, branches, or past audits disagree about what is live, or before any AEO/GEO content work on a store.

## Rules
1. **One host of record.** Name the single production host the scorecard measures (the one whose canonicals the live pages emit). Staging, previews, parked domains, and legacy apex sites are listed separately and never scored as production. A run against the wrong host is void; say so.
2. **Claim tags on every line.** `[VERIFIED]` observed live this run with saved output; `[REPORTED]` someone said it; `[INFERRED]` reasoned from indirect evidence; `[UNKNOWN]`; `[CONFLICTING]` two sources disagree; `[NEEDS OWNER REVIEW]` a business call.
3. **Source order when sources disagree:** live production response > analytics and logs > commerce backend API > repository `main` > docs and earlier reports. A merged PR on a side branch is not live; a stamp in `llms.txt` is not proof of what is deployed.
4. **Unlock ladder, one written yes per rung.** L0 measure (public GET/HEAD only) → L1 isolated worktree for a named fix → L2 read-only Search Console / analytics / Bing → L3 crawler and Lighthouse runs → L4 paid rank tool → L5 AI-visibility tool → L6 routines → L7 one draft PR (a human merges). Stay at the current rung until the operator names the next one.
5. **Re-drop only on change.** A re-probe with no delta is one line in `seo/<site-slug>/log.md`, not a new scorecard.
6. Never publish, merge, spend, send, change DNS, or contact customers or vendors.

## Scorecard (save as `seo/<site-slug>/discovery/scorecard-<YYYY-MM-DD>.md`)
Header: host of record, mode (read-only), measured window in the operator's timezone plus UTC, method (GET/HEAD tool), who reviews.

1. **Home:** status and bytes, title, meta description, visible H1, canonical, JSON-LD `@type`s, FAQPage present or absent, Organization NAP (name, url, phone, email, address, logo) exactly as emitted.
2. **Claim strings:** the exact hero and meta claims (for example "every product is lab-tested") quoted verbatim, so the proof bind below can test them.
3. **Product pages (a fixed sample of 5, same handles every run):** status, title, meta, H1, canonical, JSON-LD types, `sku`, `Offer.price`, `availability`, the proof field in schema (for example `additionalProperty` or `subjectOf` pointing at a certificate), the visible proof link, and a **bind** verdict: MATCH when the schema proof URL and the visible proof URL resolve to the same document, MISMATCH, or NO_PROOF. A page that makes a universal claim with NO_PROOF is a claim-honesty finding for the owner, not an engineering ticket, unless the owner says otherwise.
4. **Category pages:** every category URL in the sitemap with status, meta description present or blank, product-link count on page. List blank-description and zero-product categories by handle.
5. **Agent files:** `/llms.txt` status, size, any build stamp it carries and whether that stamp can be checked against the deploy; `/robots.txt` rules (one `User-agent: *` group or many named groups); sitemap index and child counts (total locs, product locs).
6. **Soft-404 probe:** request three made-up URLs per template (category, product, brand or proof index, plus a city or landing path if those exist). Any HTTP 200, even one titled "404", is a soft-404 FAIL with the status and title quoted.
7. **Planned-but-absent routes:** paths the plan or nav promises (guides, learn hub, location pages) that return 404. Record them; whether to build them is an owner decision.
8. **Alternate hosts:** for each non-production host, status and whether it emits its own canonical and title; flag any that could be indexed as a duplicate.

## Hitlist (save as `seo/<site-slug>/discovery/hitlist-<YYYY-MM-DD>.md`)
Ranked MUST-FIX for engineering, each with ID, severity (P0/P1/P2), the exact evidence request and response, expected result, blast radius, owner, and a "pass when" line. Typical order: soft-404 templates → blank meta on indexable categories → empty indexable categories (noindex or fill) → proof-bind mismatches → missing planned routes. Items the owner has killed or deferred are kept on the scorecard as observations only and never re-raised as tickets.

## Hand-offs
- Fixes go through `seo-roast` (one PR) or `websmith-crawl-index-sweep` (CRAWL before/after table) once the ladder reaches L7.
- Proof-claim findings go to `proof-kb`; agent-file findings to `ai-discoverability-max-autobot`.

Never invent a count, a status, or a date. A URL that did not answer is `[UNKNOWN]` with the error text.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `ai-discoverability-max-autobot` → `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot.md`.
- `proof-kb` → `../seo-autobot-content/references/proof-kb.md`.
- `seo-roast` → `../seo-autobot-onsite/references/seo-roast.md`.
- `websmith-crawl-index-sweep` → `../seo-autobot-onsite/references/websmith-crawl-index-sweep.md`.
