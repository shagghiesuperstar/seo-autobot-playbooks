---
name: first-party-ai-visibility-ledger
description: "Use when the user asks how the site is doing in AI answers, when a weekly report needs AI numbers, or after a core update or model switch."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "First-party AI visibility ledger"
  source_path: "search-ops/first-party-ai-visibility-ledger/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: First-party AI visibility ledger
description: >-
  Use when the user asks how the site is doing in AI answers, when a weekly report needs AI numbers, or after a core update or model switch: pull the platforms' own AI reports into one dated ledger, each number beside the platform's definition, never merged.
```

Inputs: Search Console (connector or export), Bing Webmaster Tools (connector or export), ChatGPT Business Hub Insights (pasted or screenshot), Google Analytics, the change log, and the last saved ledger.

Rule: platform reports first, third-party scans second, and the two are never added together. Every number is written beside the platform's own definition of it, the window, and the pull date.

## The four first-party sources (definitions read 2026-11-17; re-read before quoting)

| Source | What it gives | What it does not give |
| --- | --- | --- |
| Search Console, Generative AI performance report (all sites since 2026-08-31) | Impressions for AI Overviews and AI Mode together, by page, country, date, device, and search type (text or multimodal) | No queries, no clicks, no position, no split between AI Overviews and AI Mode. Discover has its own report |
| Bing Webmaster Tools, AI Performance (public preview since 2026-02-10) | Citations across Copilot, Bing AI summaries, and partner surfaces; cited pages; grounding queries mapped to pages; Intents, Topics, Citation Share, Compare (preview 2026-06-16); Topics Portfolio (beta 2026-10-13) | No placement inside an answer, no competitor domains, no traffic share |
| ChatGPT Business Hub, Insights (beta 2026-11-10) | Mentions, website clicks, and discovery topics over the past 28 days, after claim and identity verification | No prompts, no conversations. Topics are themes, not intent |
| Google Analytics, AI Assistant channel (since 2026-05-13) | Sessions and conversions where the referrer is a recognized assistant: medium `ai-assistant`, campaign `(ai-assistant)` | Visits with no referrer, which land in Direct |

## Definitions that change the reading

- Search Console counts an impression when a link to the site is shown in the AI feature. A link the user has to expand counts only once expanded (John Mueller, 2026-06-25). The chart aggregates by property, the page table by page, so totals differ.
- The report is missing when impressions are too few or when the property, or a parent it inherits from, is excluded in Settings > Search generative AI. Check the control before reporting "no AI visibility".
- AI-feature clicks sit inside the normal Performance totals. Never divide AI impressions by total clicks and call it an AI click-through rate.
- A ChatGPT mention for an online business counts only when ChatGPT references the website; the brand name alone does not count. For a local business it counts when a result for that location is shown. A blank metric can mean below threshold or still collecting, not zero.
- A Business Hub click is not a confirmed visit. Put it beside Analytics sessions for the same 28 days and report the gap, do not reconcile it by guessing.
- Bing Citation Share is the site's share of all citations for one grounding query. Microsoft calls it observational, not a ranking.
- The Analytics channel began on 2026-05-13. Annotate that date; a year-over-year line crossing it compares two different definitions.

## Step 1: Pull and save before analyzing

Same windows every run: last 28 days and the 28 before. Save the raw pulls in `seo/<site-slug>/data/` dated, then append rows to the ledger with columns: date_pulled, platform, metric, definition, window, scope (site, page, topic, grounding query), value, source (connector or export or pasted).

## Step 2: Split branded from non-branded where the platform allows

Search Console has a branded queries filter in the interface and, since 2026-11-16, in the Search Analytics API, along with the multimodal search type and multi-country filters. Use it for the search side. For Bing, tag each grounding query branded or not by the brand terms in `seo/<site-slug>/kb/brand-ssot.md`.

## Step 3: Annotate the timeline

Write to `seo/<site-slug>/annotations.md`, and add a Search Console annotation where the operator allows: every confirmed Google update (start and end), every announced default-model change on a tracked engine, every platform reporting change, and every shipped site change. Entries already known: core update began 2026-11-10 with up to two weeks to roll out; AI Mode's default model changed 2026-11-12.

## Step 4: After an update, wait, then compare like with like

Google's advice is to wait at least a full week after a core update finishes, then compare that week with the week before the rollout began. Name any holiday or seasonal week inside the comparison. Two changes two days apart cannot be separated; say so and report both dates.

## Step 5: Read the ledger

1. Pages with AI impressions rising and clicks flat: the page is used as a source. Check the money path from it with internal linking, not the page copy.
2. Pages with search clicks and zero AI impressions: candidates for Fan-out coverage map.
3. Bing grounding queries with low Citation Share on a page that should own them: Citable passage pass.
4. Business Hub topics that do not match what the company sells: Entity and brand-memory audit.

## Output

The ledger rows, the annotations file, and a short table in chat: platform, metric, this window, last window, definition, one line on what it means. Say which sources were not connected and which export would fill each gap.

Never invent an impression, citation, mention, or click. Never merge platforms into one score. Never change the Search generative AI control or claim a profile from this skill; both are approval-gated elsewhere.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Entity and brand-memory audit (`entity-and-brand-memory-audit`): Read `../seo-autobot-authority/references/entity-and-brand-memory-audit.md` (skill `seo-autobot-authority`).
- Fan-out coverage map (`fan-out-coverage-map`): Read `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md` (skill `seo-autobot-ai-visibility`).
- Citable passage pass (`citable-passage-pass`): Read `../seo-autobot-ai-visibility/references/citable-passage-pass.md` (skill `seo-autobot-ai-visibility`).
