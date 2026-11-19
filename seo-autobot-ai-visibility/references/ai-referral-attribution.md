---
name: ai-referral-attribution
description: "Use when the operator asks what AI search is worth, when assistant traffic looks too small to matter, or before budget moves between search and AI work."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "AI referral attribution"
  source_path: "search-ops/ai-referral-attribution/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: AI referral attribution
description: >-
  Use when the operator asks what AI search is worth, when assistant traffic looks too small to matter, or before budget moves between search and AI work: assemble what can be measured about assistant-driven visits and conversions, name what cannot, and never fill the gap with a guess.
```

Inputs: Google Analytics or the analytics in use, the conversion event from memory, CRM or warehouse access when a real source exists, ChatGPT Business Hub Insights, Search Console, server logs when available, and any self-reported attribution field on forms.

Rule: report three things separately: what the analytics can prove, what the platforms claim, and what nobody can see. The third one is stated, never estimated into the first.

## Step 1: The provable layer

1. Analytics, AI Assistant channel. Since 2026-05-13 Google Analytics assigns medium `ai-assistant` and the campaign name `(ai-assistant)` when the referrer is a recognized assistant, under an AI Assistant default channel. Pull sessions, engaged sessions, and conversions by source and landing page. The Source Group dimension added 2026-06-11 groups assistant sources such as ChatGPT and Perplexity and is populated retroactively.
2. Before that date, and for assistants the channel does not recognize, build a custom channel or a saved filter on referrer hostnames and on any `utm_source` an assistant appends to outbound links. Keep the hostname list in the repo with the date it was last checked.
3. Annotate 2026-05-13 on every trend line. A rise across that date is partly a relabel of traffic that used to sit in Referral.
4. Conversions and revenue come from the CRM or warehouse joined on the session source where a real join exists. Where it does not, report sessions only.

## Step 2: The platform-claimed layer

- Business Hub website clicks for the same 28 days. A recorded click is not a confirmed visit; show it beside analytics sessions from ChatGPT and report the difference as a number, with no explanation invented.
- Search Console generative AI impressions by page. These are link displays inside AI Overviews and AI Mode; the clicks they produce are already inside normal Search clicks and cannot be separated. Never compute a click rate from them.
- Bing AI Performance citations by page.

## Step 3: The dark layer, tested rather than guessed

Assistant apps and some in-app browsers send no referrer, so those visits arrive as Direct. Three checks narrow it without inventing a number:

1. Direct landings on deep pages. Count Direct sessions that land on long, non-navigational URLs nobody types, by week. A rise on the pages that also gained AI impressions or user-triggered bot fetches is consistent with assistant traffic. Say "consistent with", not "is".
2. User-triggered fetches from AI bot log analysis, by page, next to Direct landings on the same pages.
3. Self-reported attribution. One optional field at signup or checkout, "How did you hear about us?", free text or with an AI assistant option. Report the share naming an assistant and the sample size. Recommend adding it where it is missing; it is the only measure that survives a missing referrer.

A scroll-to-text citation link carries its highlight in the URL fragment, which browsers do not send to the server and strip from the page's script-visible URL. Do not plan a measurement on it.

## Step 4: Value the assist, not only the click

Most assistant exposure ends without a visit. Track two first-party proxies over the same window as the visibility work, each on its own line: branded-query impressions and clicks from Search Console's branded filter, and Direct plus branded-organic conversions. A change that raised mention rate and branded demand with flat assistant referrals still worked; say which numbers moved.

## Step 5: Compare quality, not just volume

Report conversion rate and revenue per session for the AI Assistant channel beside organic search, with session counts. Under about a hundred conversions in either group, give the counts and no ratio.

## Output

The attribution file saved dated: the three layers in separate tables, the limits paragraph, and one recommendation, usually the self-reported field or a missing join. Feed the provable layer into the weekly report's users section.

Never assign Direct traffic to AI. Never multiply impressions by an assumed click rate. Never report revenue from a source without a real join behind it.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- AI bot log analysis (`ai-bot-log-analysis`): Read `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md` (skill `seo-autobot-crawlers-and-policy`).
