---
name: prompt-rerun-tracker
description: "Use when the user wants to know whether a change worked in Google or AI answers, or for the weekly rerun of tracked buyer questions: measure Google and AI separately, one change at a time."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Prompt rerun tracker"
  source_path: "search-ops/prompt-rerun-tracker/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Prompt rerun tracker
description: >-
  Use when the user wants to know whether a change worked in Google or AI answers, or for the weekly rerun of tracked buyer questions: measure Google and AI separately, one change at a time.
```

Inputs: the fixed prompt set from the question map, the diagnosis log, the change log, Search Console, any prompt-visibility export, and the conversion event from memory.

Loop: measure the gap, diagnose why, make one specific change, rerun the same prompts, check whether visibility and real users moved, double down on what worked.

1. Keep the prompt set fixed. Add new prompts only as a dated addition so trends stay comparable.
2. Log every change before it ships: date, page or source, what changed, which prompts it targets. One change per prompt group at a time so you can tell what worked.
3. Rerun on schedule. For each prompt record, separately:
   - Google: position and clicks for the matching queries from Search Console or an export.
   - AI: whether the user is mentioned, whether they are cited with a link, which sources were cited, who was recommended. Dated. A sample unless an export backs it.
4. Never merge the two. A page can rise on Google and stay invisible in AI answers, and AI mentions can rise while organic traffic stays flat. Report each system on its own.
5. Tie it to users. Where a real source exists (analytics, CRM, warehouse, a pasted list), report activated users or conversions from AI referrals and organic search separately. Never guess attribution.
6. Report non-branded rows on their own; branded prompts flatter the numbers.
7. Verdict per change: worked, no change yet, or hurt, with the numbers. Recommend doubling down on what worked and dropping what did not after a fair window.

Output: a short table (prompt, Google before and after, AI before and after, change made, verdict), the one thing to double down on, saved dated. Every run compares against the last saved run.

Never invent a mention, citation, position, click, or conversion.
