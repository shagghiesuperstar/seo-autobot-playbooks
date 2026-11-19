---
name: engine-source-plan
description: "Use when deciding where off-site effort goes for AI visibility, or when a Source map shows different sources on different engines."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Engine source plan"
  source_path: "search-ops/engine-source-plan/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Engine source plan
description: >-
  Use when deciding where off-site effort goes for AI visibility, or when a Source map shows different sources on different engines: build one plan per engine from the sources that engine actually cites for the tracked prompts, and re-check it monthly because the mixes move.
```

Inputs: the latest prompt samples (cited domains per engine), the Source map, the engines the audience uses from memory, Bing AI Performance and Business Hub topics when connected, and a current public citation-mix report fetched this run.

Rule: "AI search" is not one channel. Each engine draws on a different part of the web, and each can change its mix inside a month. Plan per engine, from the user's own sampled citations first and industry reports second.

## Step 1: Start from the user's own samples

From Prompt sampling protocol output, list per engine the domains and source types that recur in at least a fifth of runs for each prompt cluster. This beats any industry table, because cross-industry reports mix categories the user does not sell in.

## Step 2: Fetch the current cross-industry mix and date it

Fetch the newest monthly citation report available and quote it with its window. Do not recall it. As a dated example of how different the engines are, Meltwater's October 2026 report (about 120,000 prompts, 12.7 million answers, 88.6 million citations, eight platforms) had these most-cited domains for 1 to 31 October:

| Engine | Leading domain | Next |
| --- | --- | --- |
| Google AI Overviews | YouTube | Facebook, Google |
| Google AI Mode | Google's own pages | YouTube |
| ChatGPT | NIH | FDA |
| Claude | Wikipedia | NIH, SEC |
| Copilot | Wikipedia | LinkedIn, Reddit |
| Perplexity | Yahoo | Reddit |
| Gemini | Reddit (mostly before its mid-month change) | YouTube |
| Grok | X | Wikipedia, NIH |

Muck Rack and Generative Pulse's October 2026 edition found only 212 domains cited by all four of ChatGPT, Claude, Gemini, and Perplexity in its September analysis.

## Step 3: Record the volatility, because it decides how long a plan lasts

Same Meltwater report, comparing 1 to 15 October with 16 to 31 October:

- Perplexity began listing at most 10 sources around 6 October, down from about 24. LinkedIn nearly vanished from its citations (about 99% down) and Reddit's share rose.
- Gemini went from about 9.8 links per answer to about 3.7 from 15 October, and its Reddit citations fell 88%.
- Reddit held near 3% of citations on AI Overviews and AI Mode, near 0.4% on ChatGPT, and was not cited by Claude in the tracked prompts.
- Social rose from 19.9% to 22.1% of AI Overviews citations; AI Overviews produced 64% of all YouTube citations in the dataset.

Fewer source slots means the direct, evidenced page keeps its place and the marginal one drops. A plan built on one engine's habit is good for about a month.

## Step 4: Write the plan, one block per engine the audience uses

For each engine: the two or three source types that recur for the user's prompts, where the user is present or absent in each, and the action sorted Own, Claim, Earn, or Contest. Typical shapes, to be confirmed against Step 1 and never assumed:

- Google AI Overviews and AI Mode: organic rank on the sub-queries, YouTube, and forum threads. Chain to Fan-out coverage map, Video and social citation surface, reddit-serp.
- ChatGPT: its own search retrieval plus what the model already knows about the brand. Chain to Fan-out coverage map and Entity and brand-memory audit; claim the Business Hub profile.
- Claude and Copilot: reference sources. Check the Wikipedia and Wikidata facts about the brand and category; request corrections with evidence, never write promotional entries.
- Perplexity: news and community. Chain to Earned media and data study.

## Step 5: Check crawler access per engine before blaming content

An engine cannot cite a publisher it cannot fetch. In the Muck Rack October 2026 report, 81% of major publishers blocking Claude's search crawler received almost no Claude citations, against 12% of those allowing it. Run AI inclusion and crawler policy on the user's site, and note for each Earn target whether that outlet blocks the engine in question.

## Output

The plan saved dated, the top five actions ranked by how many tracked prompts they touch, and a re-check date one month out. State which engines were sampled and which were taken from an industry report only.

Never invent a citation share. Never move budget on one month's shift; flag it and wait for the next sample. Never post, pitch, or edit a reference site from this skill.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
- Entity and brand-memory audit (`entity-and-brand-memory-audit`): Read `../seo-autobot-authority/references/entity-and-brand-memory-audit.md` (skill `seo-autobot-authority`).
- Earned media and data study (`earned-media-and-data-study`): Read `../seo-autobot-authority/references/earned-media-and-data-study.md` (skill `seo-autobot-authority`).
- Video and social citation surface (`video-and-social-citation-surface`): Read `../seo-autobot-authority/references/video-and-social-citation-surface.md` (skill `seo-autobot-authority`).
- `reddit-serp`: Read `../seo-autobot-authority/references/reddit-serp.md` (skill `seo-autobot-authority`).
- Fan-out coverage map (`fan-out-coverage-map`): Read `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md` (skill `seo-autobot-ai-visibility`).
- Prompt sampling protocol (`prompt-sampling-protocol`): Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md` (skill `seo-autobot-ai-visibility`).
- AI inclusion and crawler policy (`ai-inclusion-and-crawler-policy`): Read `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md` (skill `seo-autobot-crawlers-and-policy`).
