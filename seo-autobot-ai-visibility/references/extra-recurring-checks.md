---
name: extra-recurring-checks
description: "Use when the user asks for more recurring search or AI-visibility checks beyond the shipped routines."
metadata:
  version: "1.1.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Extra recurring checks"
  source_path: "search-ops/extra-recurring-checks/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

Three routines ship with this bot: the weekly ideas digest, the Monday search report, and the weekday topic watch. These are the others, set up on request, built only on an explicit yes, in the timezone saved in memory, quiet by default.

- Daily search alert. Each weekday, flag a page or query that dropped hard overnight or a page that fell out of the index. Say nothing unless something needs a decision. Worth it for sites that publish weekly or ship often.
- Weekly prompt rerun. Re-ask the fixed question set with the rerun tracker, report search and answer engines separately, and give a verdict on each logged change. Say up front that it is a sample unless they have a visibility export, and never make the export a condition.
- Source watch. Weekly, check the sources on the source map for new threads, reviews, or listings about the category, and any new wrong information to contest. Never post or reply.
- Technical check on buyer pages. Weekly, crawl and index status of only the pages tied to the question map. Ignore site-wide noise.
- Organic pipeline check. Weekly, tie signups, trials, or closed deals back to the pages that brought them, from a warehouse query, a CRM export, or a pasted list. Only when a real source exists. Never guess attribution.
- Content request queue. Watch the workspace, channel, or backlog where people ask for content, and post a short triage each morning: what came in, what it maps to on the board, what needs a decision. Never answer a request on their behalf.
- Publish check. Weekly, list what shipped against what was briefed, and name the briefs sitting more than two weeks.

For each one, ask what they want out of it, confirm the day and hour in their timezone, and say what nothing-to-report looks like.

## Optional: image check on new pages

On request, a paused check that runs the image checklist on pages published since the last run and lists only the images that fail, with the fix. Nothing is sent when every image passes.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).


## SEO & AEO Desk v2 retained details (union, 2026-11-18)

The richer AUTOBOT procedure above remains primary. This shorter source procedure is kept in full so its precise phrasing and constraints are not lost; it is the same method, not a second task or a second result. All approval gates still apply.

Build one only on an explicit yes, in the timezone in the current site's configured working state, quiet by default.

- Daily search alert: weekdays, flag a page or query that dropped hard or fell out of the index. Silent unless a decision is needed.
- Weekly prompt rerun: re-ask the fixed buyer prompt set with Prompt rerun tracker; report Google and AI separately and the verdict on each logged change.
- Source watch: weekly, check the sources in the Source map for new threads, reviews, or listings about the category and any new wrong info to Contest. Never post or reply.
- Technical check on buyer pages: weekly, crawl and index status of only the pages tied to the question map. Ignore site-wide noise.
- Organic and AI pipeline check: weekly, tie signups or deals to organic and AI-referral pages from a real source only.
- Content request queue: triage new content asks against the ideas board each morning. Never answer for them.
- Publish check: weekly, what shipped versus what was briefed, and briefs older than two weeks.

For each, ask what they want from it, confirm day and hour, and say what nothing-to-report looks like.
