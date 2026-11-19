---
name: websmith-report-writer
description: Use when an audit run has finished (results.json exists) and the owner needs the results explained, as a one-page summary for a non-technical owner and/or a full report with a scorecard, evidence table, and ranked copy-paste fixes for their platform.
---

# Websmith report writer

> **Inside ULTIMATE SEO/GEO/AEO/AIO AUTOBOT (2026-11):** this skill is part of W9 `agent-readiness` and runs in audit mode (read-only; `getting-started-seo-autobot` section 9). It writes only under `websmith/`. Fixes reach the site only through W9 step 4 (one reviewable PR, after a yes).

## AgentReady scorecard (required)

Open the report with the AgentReady v2.0 scorecard from `agentready-scorecard.md` / `agentready-scorecard.json` in the run folder (exact AR-FIND / AR-READ / AR-ACT IDs, Conforms / Does not conform, ESTIMATED isitagentready). Put Websmith WS-* extras and security/commerce/a11y after that. Never invent AgentReady results; if the scorecard is missing, mark UNTESTED and say the AgentReady pass was not run.


Turns `websmith/runs/<domain>/<run>/results.json` plus evidence into `REPORT.md` (and `SUMMARY.md` if the owner wants it short). Write for a smart owner who isn't a developer.

## Rules

- Use only results from this run's files. Re-read `results.json` before writing. No invented numbers, scores, or stats.
- Every FAIL/WARN cites its evidence file and the check's source URL from `../seo-autobot-agent-readiness/references/websmith-checklist/CHECKLIST.md`.
- EXCEPTIONs are shown respectfully: "You chose this on purpose (reason). Here's the trade-off." Never count them against the score.
- UNTESTED items get their own list with the reason. Never hide them.
- Regulated sites: fix text uses only the owner's approved claims.
- All times in the owner's timezone with a label (e.g. "Oct 23, 2026, 2:10 PM CT").

## Scoring (transparent, simple)

For each category: points = PASS×1 + WARN×0.5, out of PASS + WARN + FAIL. Skip N/A, EXCEPTION, and UNTESTED. MUST checks count double. Show the raw counts next to every percentage. Overall = the average of the applicable categories. Say plainly that this is the Websmith score, not an official standard score. An owner-provided AgentPass report (ARI-100 score, grade, level) can appear in a separate "AgentPass" box with its date; it is never merged into this score.

## REPORT.md structure

1. **The short version** (≤150 words): what agents can and can't do with the site today, the top 3 fixes, and how long they'll likely take, in plain words. Example: "AI assistants can find your shop but can't see prices because they load by JavaScript. Fixing that one setting matters most."
2. **Scorecard:** a table of 9 categories (incl. CRAWL) with score %, PASS/WARN/FAIL/N/A/EXC/UNTESTED counts, and a one-line meaning.
3. **Blockers first:** every BLOCKER, explained in one sentence each.
4. **Fix plan, ranked by impact × effort:**
   - Impact: 3 = MUST/BLOCKER, 2 = SHOULD/MAJOR, 1 = MAY/POLISH.
   - Effort: 1 = a settings toggle or adding a file, 2 = a template/theme edit, 3 = developer work.
   - Rank by impact ÷ effort, highest first.
   - For each fix give: what to do, who does it (from the profile's `fixer`), and a copy-paste block for the owner's platform. See `websmith-fix-pack` for platform recipes (Shopify, WooCommerce/WordPress, Squarespace/Wix/Webflow, Next.js/Medusa, custom nginx/Apache, Cloudflare edge). If a platform can't do something (e.g. no root-file hosting), say so and give the closest workaround or "ask your platform support".
5. **Full check table:** ID | check | result | severity | evidence label | evidence file | note | source URL. All 129 rows (aliases CRAWL-04/05 shown with their READ result, scored once).
6. **Your deliberate choices (EXCEPTIONs):** each with its trade-off.
7. **Not tested and why** (UNTESTED).
8. **Conflicts and moving standards:** copy the relevant items from CHECKLIST "Known conflicts".
9. **Crawl & Index before/after** (if the sweep ran): URL | status | title | body start, before → after; then **"Confirm in Search Console"**: each CRAWL check with a problem whose Search Console column is Yes, with the report name to open.
10. **What I didn't do:** no logins, no purchases, no form submits, no publishing scanners (or list the ones the owner approved), nothing deployed.

## SUMMARY.md (one page)

Overall score, 3 sentences on where things stand, the top 5 fixes as checkboxes, and a line saying "Want the fix files? Say 'make my fix pack'."

## Delivery

Save both files in the run folder. Show the owner the short version in chat and offer the full report. Don't email or post it anywhere unless the owner names the recipient and approves the message.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `websmith-fix-pack` → `../seo-autobot-agent-readiness/references/websmith-fix-pack.md`.
