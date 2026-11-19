---
name: keyword-and-question-research
description: "Use when the user pastes keywords, a CSV, or names a category and wants page ideas: start from buyer decisions, expand into search terms and AI prompts, and rank ideas onto the ideas board."
metadata:
  version: "1.1.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Keyword and question research"
  source_path: "search-ops/keyword-and-question-research/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

Inputs: a site on its own, pasted keywords, a CSV or export from any keyword tool, a search-console query export, their competitors, or just the category they sell into.

1. Start from whatever they gave you. With nothing but a site, read their pages, pull the terms they already write about, read the competitors they named, and expand from there. Never send them away to go get keywords first.
2. Anchor every cluster to a buying decision, then expand three ways: what people type into a search box, the full-sentence questions they ask an assistant, and the comparison and alternative terms buyers use late.
3. Check what already exists: who ranks, what the answer engines cite, what the top pages actually cover, and whether the user already has a page on it. An existing page means a refresh row, not a new page.
4. Group into clusters of 3 to 8 terms with one page idea each. A cluster is one brief, not one term per brief.
5. Rank each idea on three things you can defend: how close the term is to buying, how thin the current top results and answers are, and whether the user has something real to say. Never invent a search volume, a difficulty score, or a position. When a number comes from their export, name the export and its date.
6. Write the rows to the ideas board: cluster, buying decision, page idea, new or refresh, intent, terms, the assistant prompt, who ranks now, what the answer engines cite, status, source, date. Status is idea, queued, briefed, or published.

Output: the top 5 to 10 ideas in chat with one line each on why, then the full board saved under the search content folder. Offer a brief on the top pick in the same message.

Fallbacks: no export and no connected tool means you work from public results and their own site, and you say plainly which numbers you do not have. A CSV that will not parse means you ask them to paste the rows.

## Image-intent queries

Some terms are mostly answered with pictures: "examples", "ideas", "diagram", "chart", "before and after", "what does X look like". Flag those on the board, since the page will need original images to compete. With a search-console connection, pull the image-result queries (`type: image`) to see which already send image traffic. Report only numbers you actually pulled.


## SEO & AEO Desk v2 retained details (union, 2026-11-18)

The richer AUTOBOT procedure above remains primary. This shorter source procedure is kept in full so its precise phrasing and constraints are not lost; it is the same method, not a second task or a second result. All approval gates still apply.

Inputs: a site, pasted keywords, any keyword tool or Search Console export, competitors, the buying decision from the current site's configured working state, or just the category.

1. Start from what they gave you. With only a site, read its pages and the competitors' pages. Never send them away for keywords first.
2. Anchor every cluster to a buying decision, then expand three ways: what people type into Google, the full-sentence questions they ask an assistant, and late-stage comparison and alternative terms.
3. Check what exists: who ranks, who AI answers cite, and whether the user already has a page. An existing page means a refresh row, not a new page.
4. Cluster 3 to 8 terms per page idea. One cluster, one brief.
5. Rank on three defensible things: closeness to buying, how thin the current results and AI answers are, and whether the user has something real to say. Never invent a volume, difficulty, or position; name the export and date when a number comes from one.
6. Write ideas board rows: cluster, decision, page idea, new or refresh, intent, terms, AI prompt, who ranks, who AI cites, status (idea, queued, briefed, published), source, date.

Output: top 5 to 10 ideas in chat with one line each, board saved, brief offered on the top pick. Without an export, say which numbers you do not have.
