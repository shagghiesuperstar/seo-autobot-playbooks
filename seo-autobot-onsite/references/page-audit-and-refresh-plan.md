---
name: page-audit-and-refresh-plan
description: "Use when a page is slipping, or a diagnosis says weak page or crawl/index problem: audit it and plan a refresh instead of publishing a new page."
metadata:
  version: "1.1.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Page audit and refresh plan"
  source_path: "search-ops/page-audit-and-refresh-plan/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

Inputs: the URL or a list of them, the query and the assistant prompt the page should win, its diagnosis row, and search-console data for it when it exists.

1. Fetch the page. Note the title, meta description, H1, heading structure, length, publish and update dates, schema, canonical, and whether the main answer sits above the fold.
2. Check intent match first. Read the top results for the target query and the answer an assistant gives, then say plainly whether this page is even the right shape. A tutorial does not win a comparison query.
3. Check the mechanics: indexable, canonical pointing at itself, in the sitemap, renders without JavaScript, one H1, headings in order, images with alt text, relevant internal links coming in, and load time from a real fetch. Rank each issue by whether it blocks a page tied to buyer demand; skip site-wide noise that touches nothing important.
4. Check answer quality. Does the page answer the main question in one liftable paragraph, are the claims sourced and dated, is anything out of date.
5. Refresh, do not duplicate. If this page is the right home for the question, the fix is here, not a new article.
6. Write the fixes in priority order, each with the reason and the effort, split into rewrite, add, and delete.
7. With search-console data, add what the page actually ranks for today against what it was aimed at. That gap is usually the real problem. With a rerun history, note search and answer engines separately.

Output: the findings and the ordered fix list in chat, saved dated under the search content folder, logged as one change in the rerun tracker. Offer a refresh brief when the fix is a rewrite rather than a tweak.

Fallbacks: a page you cannot fetch gets named, not guessed at. A page behind a login is out of scope. Never change a live page, a CMS entry, or a robots file yourself; hand over the fixes.

## Images

Run the image checklist on every image on the page as part of the audit. In the refresh plan, list each failing image with the fix: filename, compression and format, alt text, schema, stock versus original, caption, and lazy-loading below the fold only. Measure file sizes and dimensions from the live page or say they were not measured. Never guess a size or a score.


## SEO & AEO Desk v2 retained details (union, 2026-11-18)

The richer AUTOBOT procedure above remains primary. This shorter source procedure is kept in full so its precise phrasing and constraints are not lost; it is the same method, not a second task or a second result. All approval gates still apply.

Inputs: the URL or list, the query and AI prompt it should win, its diagnosis row, and Search Console data for it.

1. Fetch the page. Note title, meta description, H1, heading structure, length, publish and update dates, schema, canonical, and whether the main answer sits above the fold.
2. Intent match first. Read the top Google results and the AI answer for the target question. Say plainly whether the page is the right shape. A tutorial does not win a comparison.
3. Mechanics: indexable, self-canonical, in the sitemap, renders without JavaScript, one H1, ordered headings, alt text, relevant internal links in, real load time. Rank each issue by whether it blocks a page tied to buyer demand; skip site-wide noise that touches no important page.
4. Answer quality: the main question answered in one liftable paragraph, plain numbers, sourced claims, nothing out of date.
5. Refresh, do not duplicate. If this page is the right home for the question, the fix is here, not a new article.
6. Fixes in priority order, each with reason and effort, split into rewrite, add, delete.
7. With Search Console, compare what it ranks for against what it was aimed at. With a rerun history, note Google and AI separately.

Output: findings and ordered fix list, saved dated, logged as one change in the rerun tracker. Offer a refresh brief when it is a rewrite.

Never change a live page, CMS entry, or robots file yourself. A page you cannot fetch gets named, not guessed at.
