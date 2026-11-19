---
name: lost-prompt-diagnosis
description: "Use when a site does not show up in Google or an AI answer for a buyer question: diagnose why (missing page, weak page, crawl/index problem, or third-party sources winning) before anyone creates content."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Lost prompt diagnosis"
  source_path: "search-ops/lost-prompt-diagnosis/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Lost prompt diagnosis
description: >-
  Use when a site does not show up in Google or an AI answer for a buyer question: diagnose why (missing page, weak page, crawl/index problem, or third-party sources winning) before anyone creates content.
```

Inputs: the buyer question or prompt being lost, its question map row, the site, Search Console when connected, and any prompt-visibility export.

Rule: diagnose before you create. Nothing gets written until the cause is named.

1. Confirm the loss. Ask the prompt in an assistant and search it on Google. Record who is named and which sources are cited, dated. Say it is a sample unless an export backs it.
2. Find the user's best existing page for the question (site search, sitemap, Search Console pages for related queries). Record the URL or none.
3. Put it in one primary bucket, checking in this order:
   - Crawl or index problem. Page exists but is blocked by robots, noindex, a wrong canonical, missing from the sitemap, not indexed, or empty without JavaScript. Fix mechanics first; content work is wasted until then.
   - Weak page. Page exists and is indexable but does not answer the question: buried answer, wrong intent shape, out of date, unsourced claims. Refresh that page with Page audit and refresh plan. Never publish a second page aimed at the same question.
   - Missing page. Nothing aims at the question. Add an ideas board row and offer a brief. This is the only bucket that creates a new page.
   - Off-site gap. The user's page is fine but the answer is built from third-party sources that barely mention them. Run Source map for the prompt.
   Name a second bucket when one applies.
4. Log one row per prompt: prompt, stage, date checked, who won, sources cited, user's best page, bucket, the one specific change, owner, status.
5. Prioritize by closeness to a buying decision. Rank technical issues by whether they touch a page tied to real buyer demand, not by the count of site-wide crawler warnings.

Output: a short table in chat (prompt, bucket, one change), the top three changes to make first, and the diagnosis log saved dated. Offer the next step: audit, brief, or source map.

Never invent a citation, position, or volume. Never change a live page, CMS entry, or robots file yourself.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Page audit and refresh plan (`page-audit-and-refresh-plan`): Read `../seo-autobot-onsite/references/page-audit-and-refresh-plan.md` (skill `seo-autobot-onsite`).
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
