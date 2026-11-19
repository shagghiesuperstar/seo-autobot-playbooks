---
name: fan-out-coverage-map
description: "Use when a page ranks or is indexed but is not cited in AI Mode, AI Overviews, ChatGPT, Copilot, or Perplexity."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Fan-out coverage map"
  source_path: "search-ops/fan-out-coverage-map/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Fan-out coverage map
description: >-
  Use when a page ranks or is indexed but is not cited in AI Mode, AI Overviews, ChatGPT, Copilot, or Perplexity: list the sub-queries the engine actually searches for a buyer question, map each to an existing passage, and close the gaps on the existing page before any new URL.
```

Inputs: one row from the question map (buyer decision, Google terms, full-sentence prompt), the user's best page for it, Bing Webmaster AI Performance when connected, the SERP connector when connected, and any prompt-visibility export.

Rule: pages are cited when searched. The engine rewrites the buyer's prompt into several narrower searches, retrieves pages for those, and cites from what it retrieved. Win the sub-queries or the page never reaches the model.

## Why this comes before content work

- Google describes query fan-out as a set of concurrent related queries the model issues to fetch more results (its lawn-weeds example fans out to herbicides, chemical-free removal, and prevention). Read 2026-11-17.
- A 90-day study of 158,099 answers and 468,037 citations (Chen and Koudas, arXiv 2610.15033, submitted 2026-10-10) found every page ChatGPT cited was one its own search retrieved, that the sub-queries are rewritten on every answer and rarely match Google's or Bing's results, and that retrieval explained far more of the variation than page properties (32% against 2.8%).
- Same study, comparing pages of one website: title and paragraphs that match the questions people ask were cited more. FAQ blocks, structured data, summary boxes, and page speed looked effective only when comparing across websites. Treat those as hygiene, not as the lever.

## Step 1: Collect real sub-queries, labeled by source

Take them in this order and write the source next to every row.

1. `bing-grounding`: grounding queries from Bing Webmaster AI Performance, which are the phrases the AI used when retrieving the cited content. First-party, so they lead.
2. `observed`: searches an assistant shows it ran while answering the prompt. Sample at least five runs, because the rewrites change every time. Record the date and the model.
3. `serp-tool`: AI Overview or AI Mode references and related queries from the SERP connector.
4. `paa`: People Also Ask and related searches for the Google terms.
5. `inferred`: sub-queries you reasoned out from the buyer decision. Allowed, but labeled, capped at a third of the list, and never reported as observed.

Keep 8 to 20 sub-queries per prompt. Merge near-duplicates. Note which sub-queries name a brand: the same study found ChatGPT writes brands it already knows into its searches, so a branded sub-query that names a rival and not the user is an entity problem, not a page problem. Send it to Entity and brand-memory audit.

## Step 2: Map each sub-query to a passage

For each sub-query record the best existing URL, the heading, and the paragraph that answers it. Status is one of:

- `covered`: a self-contained paragraph answers it and the title or heading matches the question.
- `buried`: the answer exists but sits mid-paragraph, under a clever heading, or depends on text above it.
- `absent-right-page`: the right page exists and says nothing on it.
- `absent-no-page`: nothing on the site aims at it.
- `off-site`: the retrieved results are third-party pages. Send to Source map.

## Step 3: Fix in this order

1. `buried`: retitle the heading as the question and run Citable passage pass on that paragraph.
2. `absent-right-page`: add one section to the existing page. One section per sub-query, on the page that already owns the buyer question.
3. `absent-no-page`: only now consider a new URL, and only through Lost prompt diagnosis (missing-page bucket) and Spam-policy preflight.

Never ship one page per sub-query. Google's guide says creating separate content for every variation or fan-out query, primarily to manipulate rankings or AI responses, violates the scaled content abuse policy, and that its systems match pages without exact wording.

## Step 4: Log the change and rerun

Log one change per prompt group in the change log, then measure with Prompt sampling protocol. Rebuild the map when a model switch is announced: Google made a new default model in AI Mode on 2026-11-12 and said its fan-out improved, so maps older than that date are stale for Google surfaces.

## Output

`seo/fanout/<slug>.md` with the table (sub-query, source, date, URL, heading, status, edit), the three edits to make first, and a count by status. Say how many rows are `inferred`.

Never invent a sub-query and present it as observed. Never claim an engine's internal query list; report only what a first-party report, a visible search step, or a connector returned.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Lost prompt diagnosis (`lost-prompt-diagnosis`): Read `../seo-autobot-onsite/references/lost-prompt-diagnosis.md` (skill `seo-autobot-onsite`).
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
- Entity and brand-memory audit (`entity-and-brand-memory-audit`): Read `../seo-autobot-authority/references/entity-and-brand-memory-audit.md` (skill `seo-autobot-authority`).
- Citable passage pass (`citable-passage-pass`): Read `../seo-autobot-ai-visibility/references/citable-passage-pass.md` (skill `seo-autobot-ai-visibility`).
- Prompt sampling protocol (`prompt-sampling-protocol`): Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md` (skill `seo-autobot-ai-visibility`).
- Spam-policy preflight (`spam-policy-preflight`): Read `../seo-autobot-crawlers-and-policy/references/spam-policy-preflight.md` (skill `seo-autobot-crawlers-and-policy`).
