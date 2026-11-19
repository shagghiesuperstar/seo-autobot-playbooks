---
name: video-and-social-citation-surface
description: "Use when Google's AI answers or a source map cite videos and social posts for the tracked questions, or the operator publishes on YouTube, Instagram, TikTok, or X."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Video and social citation surface"
  source_path: "search-ops/video-and-social-citation-surface/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Video and social citation surface
description: >-
  Use when Google's AI answers or a source map cite videos and social posts for the tracked questions, or the operator publishes on YouTube, Instagram, TikTok, or X: find which questions are answered by video and social, check what the operator's accounts already earn in Search, and brief the assets that fill the gap.
```

Inputs: the question map, prompt samples and SERP pulls showing cited videos and posts, the operator's channels and accounts, Search Console platform properties when set up, transcripts when available, and the proof base.

Rule: for many questions the cited source is a video or a post, not a page. Check the format the engine cites before briefing another article.

## Step 1: Find the questions where video and social win

From the samples and SERP pulls, mark each tracked question with the share of runs citing a video or social post, per engine, and list the recurring ones. In Meltwater's October 2026 data YouTube was the most-cited domain across eight AI platforms combined, Google AI Overviews alone produced 64% of YouTube's citations and 75% of Facebook's, and social made up 22.1% of AI Overviews citations in the second half of the month. The same data shows other engines leading with reference and institutional sites, so this surface is mostly a Google one today. Confirm it on the user's own prompts before acting.

## Step 2: Read what the operator's accounts already earn in Search

Search Console platform properties (announced 2026-07-07, worldwide 2026-07-29) report how posts on Instagram, TikTok, X, and YouTube perform on Google Search, Discover, and News: clicks, impressions, click-through rate, and average position, filterable by post, with query groups in the Insights report. Each account is its own property, verification is the operator's step, and data takes a few days to appear. The reports cover Google only, not views on the platform.

With a property connected: list the posts earning Search impressions, the query groups behind them, and the tracked questions with no post at all. Without one: say so, hand over the setup steps, and work from samples only.

## Step 3: Audit the existing assets that should be cited

For each video or post aimed at a tracked question:

- The title states the question or the task in the buyer's words.
- The first lines of the description answer it in plain text, with the entity named in full.
- Chapters are phrased as searchable sub-steps, and the spoken answer arrives in the first thirty seconds.
- A transcript or accurate captions exist, and the numbers spoken match the proof cards.
- The matching page on the site embeds the video, carries `VideoObject` with the same title and description, and states the same answer in text. The page and the video must not contradict each other on any number.

The youtube-seo skill produces titles, chapters, and the embed; this skill decides which questions need a video and checks the result.

## Step 4: Brief the missing assets

One brief per question, only where video or social recurs in the citations and the operator has something to show: the question, the answer in one sentence, the proof to put on screen (a real capture, never stock), the three to five sub-steps as chapters, the target length, and the page it will be embedded on. Short-form and long-form are separate briefs. No proof on screen means no brief; route to proof-kb.

## Step 5: Measure on its own line

Track the video and post citations per engine in the prompt samples, and Search clicks and impressions per post in the platform property. Never fold them into the site's page numbers; the weekly report gets one extra section.

## Output

The surface file saved dated: the question table, the audit of existing assets with fixes, the briefs, and the setup checklist for platform properties.

Never post, upload, or comment. Never invent a view count, a citation, or a ranking. Never brief a video for a question where the citations are all text.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `youtube-seo`: Read `../seo-autobot-content/references/youtube-seo.md` (skill `seo-autobot-content`).
- `proof-kb`: Read `../seo-autobot-content/references/proof-kb.md` (skill `seo-autobot-content`).
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
