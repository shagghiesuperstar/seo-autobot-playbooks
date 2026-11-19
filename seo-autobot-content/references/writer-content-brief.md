---
name: writer-content-brief
description: "Use when the user picks a topic or ideas board row and wants a writer-ready brief that wins both Google and AI answers."
metadata:
  version: "1.1.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Writer content brief"
  source_path: "search-ops/writer-content-brief/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

Inputs: the topic or cluster, its row on the ideas board, their audience and what they sell, and the pages that rank today.

1. Confirm the target in one line: the page idea, the primary term, the assistant prompt it must win, who it is for, and whether it is a new page or a refresh. Ask only when the board does not already say. If a page already aims at this question, brief the refresh, not a new article.
2. Read the top 5 results and the answer an assistant gives for the main question. Note what all of them cover, what none of them do, and which third-party sources the answer leans on.
3. Write the brief:
   - Angle. One or two sentences on the take that makes this page worth reading.
   - Reader and moment. Who lands here and what they need next.
   - Primary term, supporting terms, and the questions the page has to answer outright.
   - Outline. H2 and H3 with a line under each on what belongs there.
   - Proof. The data, examples, screenshots, or customer lines the writer needs, and who to get them from.
   - Internal links in and out, with the URLs.
   - Two title options and two meta description options.
   - Word range, and the one thing that would make this the best result on the page.
4. Add an answer-ready block: the two or three questions this page should answer in a single quotable paragraph each, with plain numbers and a definition or table an assistant can lift.
5. Add an off-site note: the sources the answer leans on for this topic, and whether the supporting action is own, claim, earn, or contest.
6. Do not write the finished article unless they ask for it outright. The brief is the deliverable.

Output: the brief in chat, saved dated under the search content folder, sent to the destination they picked whether that is a doc, a workspace page, or a ticket, and the board row marked briefed. Log it as one change in the rerun tracker once published.

Fallback: no board row means you build the brief from the topic alone and say which parts are your read rather than their research.

## Images

Add an Images section to every brief, shaped by the image checklist skill and the owner's image sourcing in memory:
- Which images the page needs, one line each: what it shows and where it goes.
- Original or stock for each one. Prefer original photos, screenshots, or diagrams. Flag any slot where stock would match what competing pages already use.
- A suggested filename (short, descriptive, hyphenated), alt text that describes the image (target term only where it fits naturally, empty alt for decorative), and a caption where it adds context.
- Format and size: WebP or AVIF, sized to the display width, width and height set. The main above-the-fold image loads normally; everything below it is lazy-loaded.
- Schema: ImageObject for product, licensed, or key editorial images, with creator or license if known.

Leave the section out only when the page truly needs no images, and say so in one line.


## SEO & AEO Desk v2 retained details (union, 2026-11-18)

The richer AUTOBOT procedure above remains primary. This shorter source procedure is kept in full so its precise phrasing and constraints are not lost; it is the same method, not a second task or a second result. All approval gates still apply.

Inputs: topic or cluster, its ideas board and diagnosis rows, audience, what they sell, and current top results and AI answers.

1. Confirm in one line: page idea, primary term, the AI prompt it must win, who it is for, and whether it is a new page or a refresh. If a page already aims at this question, brief the refresh, not a new article.
2. Read the top five results and the AI answer for the main prompt. Note what all cover, what none do, and which third-party sources the AI cites.
3. Write the brief: angle; reader and moment; primary and supporting terms; the questions to answer outright; outline with H2 and H3 and a line each; proof needed and who has it; internal links in and out with URLs; two titles and two meta descriptions; word range; the one thing that makes it the best result.
4. Answer-ready block: the two or three questions this page should answer in a single quotable paragraph each, with plain numbers and a definition or table an assistant can lift.
5. Off-site note: the sources the AI leans on for this topic and the Own, Claim, Earn, or Contest action that would support the page.
6. Do not write the article unless asked outright.

Output: the brief in chat, saved dated, sent to their destination, ideas board row marked briefed, and the change logged in the rerun tracker once published.
