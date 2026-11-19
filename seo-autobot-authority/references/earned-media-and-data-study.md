---
name: earned-media-and-data-study
description: "Use when the Source map or engine plan shows answers built from news, analyst, and third-party pages that do not mention the user."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Earned media and data study"
  source_path: "search-ops/earned-media-and-data-study/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Earned media and data study
description: >-
  Use when the Source map or engine plan shows answers built from news, analyst, and third-party pages that do not mention the user: turn first-hand proof into one citable data asset and a vetted pitch list, and check every placement is a page meant to be found.
```

Inputs: proof cards from `seo/<site-slug>/kb/proof/`, the Source map and engine source plan, the banned public fields in `seo/<site-slug>/kb/brand-ssot.md`, the named spokesperson allowed to be quoted (or none), and the link and PR budget.

Rule: answer engines mostly cite pages the brand does not own and did not pay for. Earn the mention with something only the operator has, and buy nothing that is not a real editorial page.

## Why earned beats placed

Muck Rack and Generative Pulse, October 2026 edition (over 40 million AI responses and 207 million citations in 2026, plus 1,020 prompts in September across ChatGPT, Claude, Gemini, and Perplexity):

- More than 84% of cited links came from earned and third-party sources; about 99% from non-paid sources.
- Paid and advertorial content was 0.3% of citations, unchanged from May.
- Owned media rose from 13.7% to 15.2%, strongest on product and how-to questions.
- Journalism fell from 27% to 22% between May and September, mostly on ChatGPT; the share moved to other third-party sources, not to brand sites.
- Within ChatGPT's Forbes citations, editorial outperformed the pay-to-play contributor program about 1.7 to 1.

Google's guide adds that seeking inauthentic mentions is not as helpful as it seems, because its AI features sit on the same ranking and spam systems.

## Step 1: Pick the one asset

Read the proof cards and choose a single finding that is first-hand, has a method a stranger can check, and answers a question the tracked prompts ask. Good shapes: a benchmark with raw numbers, an anonymized usage dataset, a price index, a teardown with reproducible steps. No such proof means stop and run proof-kb; a consensus roundup is not an asset.

## Step 2: Build the canonical page first

On the user's domain: the headline number in the first sentence with its date, a method section (sample, window, exclusions, what would change the result), the table, a downloadable CSV, and one chart. Every figure traces to a proof card. Run Citable passage pass on the findings. This page is what outlets link and what engines retrieve when the brand is named.

## Step 3: SEND/CUT the outlets

Candidates come from the Source map: outlets and authors already cited for the tracked prompts on the engines that matter. For each row record the outlet, the author, the cited URL, the fit, the ask, and the reason to cut. Cut when:

- The page is pay-to-play, contributor-network, or advertorial and the buyer expects ranking or citation value from it.
- The target page carries `noindex` in a robots meta tag or `X-Robots-Tag`, is blocked in robots.txt, or is not found in Google for its exact URL.
- The outlet blocks the crawler of the engine the plan is aimed at.
- The author has not covered the topic in the last year.

## Step 4: Check the page is meant to be found

On 2026-10-26 Google told platforms to keep pages made for direct sharing, collaboration, or utility out of the index by default, and to watch for a few users generating a large share of indexable URLs. A self-published post, a shared document, or a page built in an AI tool on someone else's platform may be noindexed by design, however good it is. Check the live response headers and meta tag of an existing page on that platform before counting it as coverage. Links in user-generated areas should be expected to carry `ugc` or `nofollow`.

Wire and press-release sites are listed by Google as not inconsistent with its site reputation policy, which makes a wire release safe to issue, not authoritative. Use the wire to notify, never as the proof of coverage.

## Step 5: Draft the pitches

Ask-first rules apply: one finding, one sentence on method, the link to the data, an easy no. Offer the CSV and a quote from the named spokesperson only if one was approved; otherwise the quote line is omitted, never invented. Vary structure across the batch. Scrub banned fields.

## Step 6: After coverage

Log each piece in the Source map as Earn, check it is indexed, and add it to the fixed prompt set's watch list. Measure with Prompt sampling protocol per engine after a fair window. Route the new figures through proof-kb so every owned page that claims them matches.

## Output

`seo/pr/<slug>/` with `asset-outline.md`, `outlets.csv` (SEND/CUT with reasons), `pitches.md`, and `indexability.md`. Nothing is sent.

Never send a pitch, submit a release, or pay for a placement without a yes. Never invent a statistic, a quote, a journalist, or coverage. Never describe a paid placement as earned.

> **Template guardrail (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT):** never submit, publish, post, send outreach, open or complete a checkout, pay, merge, deploy, or change DNS/firewall/feeds without an explicit yes from the operator for that specific action. Any price, promo code, plan, or tool list in this skill is vendor-supplied and dated; re-fetch it live before quoting, and never quote a number without live data.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `proof-kb`: Read `../seo-autobot-content/references/proof-kb.md` (skill `seo-autobot-content`).
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
- Engine source plan (`engine-source-plan`): Read `../seo-autobot-authority/references/engine-source-plan.md` (skill `seo-autobot-authority`).
- Citable passage pass (`citable-passage-pass`): Read `../seo-autobot-ai-visibility/references/citable-passage-pass.md` (skill `seo-autobot-ai-visibility`).
- Prompt sampling protocol (`prompt-sampling-protocol`): Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md` (skill `seo-autobot-ai-visibility`).
