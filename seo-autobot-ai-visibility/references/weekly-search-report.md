---
name: weekly-search-report
description: "Use when the user asks how search did this week or the Monday report fires: Search Console plus AI visibility, reported separately, with actions."
metadata:
  version: "1.1.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Weekly search report"
  source_path: "search-ops/weekly-search-report/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

Inputs: search-console data for their property when connected, a pasted or uploaded export otherwise, the ideas board, the change log, the latest prompt rerun, and the last saved report.

1. Pull the last 7 days and the 7 before that: clicks, impressions, average position, top queries, top pages. Save this run before you analyze it; the next report compares against this copy.
2. Write short sections.
   - What moved. The pages and queries that changed enough to matter, with the numbers and the change.
   - Answer engines. Mentions and citations on the tracked questions versus the last run, non-branded on its own. Never fold this into the search numbers. Say it is a sample unless an export backs it.
   - Why, as far as you can tell. A new page landing, a page slipping, a query set drying up, someone else taking the top spot. Say when you cannot tell.
   - What to do. Two to four actions, each a page to write, refresh, or fix, tied to a row on the board and labeled missing page, weak page, crawl fix, or off-site.
   - New queries worth a page. Terms getting impressions with no page aimed at them.
3. Users, when a real source exists: conversions from organic and from assistant referrals, reported separately.
4. Never invent a click, an impression, a position, a CTR, a mention, or a citation. Every number comes from the export or the connected property.

Output: the report in chat, saved dated under the search content folder, delivered to the destination they picked as a draft first.

Fallbacks: no connection and no export means you name exactly what you need, a performance export for the last 28 days with pages and queries, and offer to read a pasted table instead. A week with nothing material is one line saying it was quiet, not a report.

## Optional: image search

Only when image search matters to this site, add one line for image results (`type: image`), compared against last week's saved copy. Skip it otherwise. Never estimate image clicks or impressions.


## SEO & AEO Desk v2 retained details (union, 2026-11-18)

The richer AUTOBOT procedure above remains primary. This shorter source procedure is kept in full so its precise phrasing and constraints are not lost; it is the same method, not a second task or a second result. All approval gates still apply.

Inputs: Search Console or a pasted export, the latest prompt rerun, the ideas board, change log, and last saved report.

1. Pull the last 7 days and the 7 before: clicks, impressions, average position, top queries, top pages. Save this run before analyzing.
2. Five short sections:
   - Google: what moved, with the numbers.
   - AI answers: mentions and citations on the tracked prompts versus last run, non-branded on its own. Say it is a sample unless an export backs it. Never fold this into the Google numbers.
   - Why, as far as you can tell, linked to the change log. Say when you cannot tell.
   - What to do: two to four actions, each labeled missing page, weak page, crawl fix, or off-site, tied to an ideas board or diagnosis row.
   - New questions worth a page: terms with impressions and nothing aimed at them.
3. Users, when a real source exists: conversions from organic and from AI referrals, separately.

Never invent a click, impression, position, CTR, mention, or citation. No connection and no export: name the exact export needed (Search Console performance, last 28 days, pages and queries) and stop. A quiet week is one line. Deliver as a draft first.
