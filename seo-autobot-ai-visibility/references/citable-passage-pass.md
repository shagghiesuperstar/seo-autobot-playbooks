---
name: citable-passage-pass
description: "Use when a page should be quoted by AI Mode, AI Overviews, or an assistant: rewrite the target sections so each question has one self-contained, answer-first paragraph, and inventory which passages engines already lift."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Citable passage pass"
  source_path: "search-ops/citable-passage-pass/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Citable passage pass
description: >-
  Use when a page should be quoted by AI Mode, AI Overviews, or an assistant: rewrite the target sections so each question has one self-contained, answer-first paragraph, and inventory which passages engines already lift.
```

Inputs: the URL, its fan-out coverage map or question map rows, the live page HTML, and any AI Mode citation URLs for the page from the SERP connector or a pasted export.

Rule: the passage is the unit of citation, not the page. This pass edits paragraphs. It does not split pages, add pages, or change the page's voice.

## What the evidence says, and how far to trust it

Pillarbase's June 2026 census of 15,699,298 AI Mode citations across 148 industries found:

- 47.7% of citations carried a `#:~:text=` fragment that scrolls to a highlighted passage rather than linking the page top.
- Reconstructed highlighted passages ran a median of 117 words (mean 134, 90th percentile 197). They are full paragraphs, not snippets.
- 80% opened with the answer and 83 to 86% made sense lifted out of the page.
- 80.9% of distinct passages were used once; about 2,300 were reused 61 times or more, and one passage served 483 distinct queries.
- Passages reused 20 times or more came from a page ranking first organically 59% of the time (76% at 100 reuses or more).

Limits to state in any report: this is one vendor's dataset, the ranking relationship is correlational, the question-led reuse trend rests on 28 and 12 passages in its top tiers, and Google's own guide says there is no requirement to chunk content for AI. Read it as a description of well-written answers, which is what the edit produces.

## Step 1: Inventory what is already lifted

For each citation URL with a `#:~:text=` fragment, decode the start and end words, find the span in the live page, and record the heading above it, the word count, and the query that produced it. No citation data means the inventory starts empty; say so and do not guess which passages are lifted.

The fragment is never sent to the server, so it will not appear in server logs or in a landing-page report. The only sources are a SERP tool, a visibility export, or a pasted URL.

## Step 2: Edit each target section

1. Heading is the buyer's question in their words. One question per heading.
2. Sentence one answers it, unqualified, with the subject named in full. No "it", "this tool", "the above".
3. The paragraph runs 75 to 150 words and stands alone: the entity, the number, the unit, the date, and the condition are all inside it.
4. One paragraph, then the detail. Tables, steps, and caveats follow the answer paragraph; they do not replace it.
5. Prefer question-and-answer and numbered how-to shapes for buyer questions. Keep narrative where the page is a story; narrative gets cited once and rarely reused, which is acceptable for a page that is not chasing a question.
6. Numbers carry their date and source in the same sentence, from a proof card.
7. Cut every cross-reference that breaks when the paragraph is lifted: "as mentioned above", "see below", "in the previous section".

This sits on top of the forty-word rule, it does not replace it: the first forty words of the page still answer the title question.

## Step 3: Check before shipping

- Every edited paragraph: word count in range, first sentence answers, no dangling pronoun in sentence one, no claim without a proof card or dated source.
- Read each paragraph alone, out of order. If it needs its neighbour, it fails.
- The page still reads as one piece to a human. If the edit made it read like a quiz, restore the connective sentences between sections, outside the answer paragraphs.
- No section was duplicated onto a second URL.

## Output

The diff, the passage inventory saved dated, and a one-line change-log entry naming the prompts the edit targets. Offer Prompt sampling protocol as the measurement.

Never promise a citation. Never fabricate a highlight or a reuse count. Never rewrite a paragraph that already answers first and stands alone.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Fan-out coverage map (`fan-out-coverage-map`): Read `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md` (skill `seo-autobot-ai-visibility`).
- Prompt sampling protocol (`prompt-sampling-protocol`): Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md` (skill `seo-autobot-ai-visibility`).
