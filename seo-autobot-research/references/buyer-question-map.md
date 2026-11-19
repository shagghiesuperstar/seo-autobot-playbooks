---
name: buyer-question-map
description: "Use when the user wants to know what buyers ask before choosing in their category, or where they show up in Google and AI answers: map buyer decisions to both keywords and AI prompts."
metadata:
  version: "1.1.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Buyer question map"
  source_path: "search-ops/buyer-question-map/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

Inputs: their site, what they sell, the audience, the buying decision, competitors, the ideas board, and any visibility or keyword export they already have.

1. List the decisions a buyer makes before choosing in this category: do I need this, which type, which vendor, is it worth the price, how hard is setup, what do others say.
2. Under each decision write the real questions, 20 to 40 total, grouped by stage: what is this, how do I choose, how does it compare, how do I do it, is it worth it.
3. Turn every question into two tracked forms on the same row: the search terms someone types, and the full-sentence prompt someone asks an assistant.
4. Check each form. Search: who ranks, and whether the user has a page. Assistant: ask the prompt where you can, and record who is named and which sources are cited, dated. Say it is a sample unless an export backs it.
5. Map each question to what they have today: covered well, covered badly, or nothing at all.
6. Mark each row: winning, losing with a page (weak), losing with no page (missing), or losing to third-party sources (off-site). Send every losing row to lost-prompt diagnosis before anything is created.
7. Mark the gaps worth a page: close to buying, and the current answers thin or wrong about their category. Say what makes a page quotable: the direct answer in the first paragraph, plain numbers, a clear definition, a table an assistant can lift, sourced claims.

Output: the map with one row per question (decision, stage, search terms, assistant prompt, search status, answer status, cited sources, what they have, the page that should answer it, priority), the five losses to fix first, and an offer to diagnose or brief the top one. This row set becomes the fixed prompt set the rerun tracker re-asks on schedule.

Fallbacks: a visibility or keyword tool they already pay for adds real citations the moment they paste an export. None is required and you never suggest they buy one. Without an export, say your read comes from asking the questions directly, so it is a sample rather than a measurement.

## Images and citations

When a question is best answered visually, note that the page should carry an original diagram or screenshot with a clear caption and descriptive alt text. Do not claim images or captions earn citations unless you saw it in the answers you checked; say what you saw and where.


## SEO & AEO Desk v2 retained details (union, 2026-11-18)

The richer AUTOBOT procedure above remains primary. This shorter source procedure is kept in full so its precise phrasing and constraints are not lost; it is the same method, not a second task or a second result. All approval gates still apply.

Inputs: site, what they sell, audience, the buying decision from the current site's configured working state, competitors, the ideas board, and any prompt-visibility or keyword export.

Rule: start from buyer decisions, not keywords.

1. List the decisions a buyer makes before choosing in this category: do I need this, which type, which vendor, is it worth the price, how hard is setup, what do others say.
2. Under each decision write the real questions, 20 to 40 total, grouped by stage: what is this, how do I choose, how does it compare, how do I do it, is it worth it.
3. Turn every question into two tracked forms: the Google search terms someone types for it, and the full-sentence prompt someone asks an assistant. Both forms go on the same row.
4. Check each form. Google: who ranks and whether the user has a page. AI: ask the prompt where you can, record who is named and which sources are cited, dated. Say it is a sample unless an export backs it.
5. Mark each row: winning, losing with a page (weak), losing with no page (missing), or losing to third-party sources (off-site). Send every losing row to Lost prompt diagnosis before anything is created.
6. Say what makes a page quotable: the direct answer in the first paragraph, plain numbers, a clear definition, a table an assistant can lift, and sourced claims.

Output: the map with one row per question (decision, stage, Google terms, AI prompt, Google status, AI status, cited sources, user's page, priority), the five losses to diagnose first, and an offer to run the diagnosis. This row set becomes the fixed prompt set Prompt rerun tracker re-asks every week.

Never invent a volume, a position, or a citation. Save the map dated under the search content folder.
