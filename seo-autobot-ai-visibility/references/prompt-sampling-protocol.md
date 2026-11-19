---
name: prompt-sampling-protocol
description: "Use when measuring AI visibility by hand or judging a tracker's numbers: run each buyer prompt enough times to report a visibility rate with its sample size and interval, per engine, and never a rank position."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Prompt sampling protocol"
  source_path: "search-ops/prompt-sampling-protocol/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Prompt sampling protocol
description: >-
  Use when measuring AI visibility by hand or judging a tracker's numbers: run each buyer prompt enough times to report a visibility rate with its sample size and interval, per engine, and never a rank position.
```

Inputs: the fixed prompt set from the question map, the engines the audience uses, the competitor list, the last saved sample, and any tracker export. The helper `scripts/visibility_rate.py` computes rates and intervals from the CSV.

Rule: one answer is an anecdote. Report how often the brand appears across many runs, with the count, and never report a position in an AI answer.

## Why one run proves nothing

- SparkToro and Gumshoe (published 2026-01-27; 600 volunteers, 12 prompts, 2,961 runs on ChatGPT, Claude, and Google's AI features) found under a 1 in 100 chance of the same brand list twice and roughly 1 in 1,000 of the same order. Appearance rate across runs was the stable signal: one agency appeared in 85 of 95 responses.
- In the same work, 142 people writing their own prompt for one intent produced prompts with almost no textual overlap, yet the brands returned stayed consistent. The intent is trackable; the exact wording is not.
- Muck Rack and Generative Pulse (October 2026 edition) ran the same prompt twice in one day: ChatGPT repeated 41% of cited domains, Gemini 45%, Perplexity 94%.

## Step 1: Build clusters, not single prompts

One cluster per buyer question: the canonical full-sentence prompt plus three to five phrasings a real buyer would type (different length, different context, one with a constraint such as budget or stack). Fix the cluster. New phrasings are dated additions, never silent swaps.

## Step 2: Fix the conditions and write them down

Per run record: date, engine, surface (app, web, API), model name as shown, logged in or not, memory or personalization on or off, country, device. Prefer a clean session with memory off. API and app answers can differ; never mix them in one rate. Record the mix if you must use both.

## Step 3: Run enough times

| Purpose | Runs per cluster per engine | Half-width of the 95% Wilson interval at a 50% rate |
| --- | --- | --- |
| Smoke test, never reported as a rate | 5 | about 33 points |
| Working baseline | 30 | about 17 points |
| Reported number | 60 | about 12 points |
| Decision on budget or a before/after verdict | 100 | about 10 points |

Spread runs across the cluster's phrasings and across at least three days. A hand-run budget that cannot reach 30 reports "sample of N, not a rate" and stops there.

## Step 4: Score each answer

Per run: brand mentioned (yes or no), brand cited with a link (yes or no), the user's cited URL, every competitor named, every domain cited, and one word for how the brand was described (recommended, listed, caveated, wrong). Wrong facts go to the Source map as Contest rows.

## Step 5: Report rates with intervals

- Mention rate and citation rate separately, each as k of n with a 95% Wilson interval.
- Competitor rates on the same runs, so share is read from the same sample.
- Per engine. Never averaged across engines: they draw on different sources, and a rise on one says nothing about another.
- Non-branded clusters on their own.
- A change counts only when the before and after intervals do not overlap, or after two consecutive samples move the same way. Otherwise the verdict is "no change yet".
- Cited-domain lists are volatile on ChatGPT and Gemini. Report domains that recur in at least a fifth of runs, not every domain seen once.

## Step 6: Judging a tracker

Ask the vendor, or read the docs, for: runs per prompt per period, whether prompts are synthetic or sourced, API or interface, how personalization and location are handled, and whether they publish variance. A dashboard that shows "rank 3 in ChatGPT" from one daily run is reporting noise. Keep the prompt set and the raw answers in the repo so the measure survives a tool change.

## Output

The raw CSV saved dated, the rate table, the conditions block, and one line per logged change: worked, no change yet, or hurt, with the intervals that justify it.

Never invent a run. Never report a rate without its n. Never present a position in an AI answer as a metric.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
