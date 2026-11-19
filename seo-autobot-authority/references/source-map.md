---
name: source-map
description: "Use when AI answers or search results for a buyer question lean on third-party sources (Reddit, review sites, directories, articles): list the sources shaping the answer and sort each into Own, Claim, Earn, or Contest."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Source map"
  source_path: "search-ops/source-map/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Source map
description: >-
  Use when AI answers or search results for a buyer question lean on third-party sources (Reddit, review sites, directories, articles): list the sources shaping the answer and sort each into Own, Claim, Earn, or Contest.
```

Inputs: the lost prompts from Lost prompt diagnosis, the user's owned and claimable profiles from memory, buyer communities from memory, competitors, and any citation export.

The question is not how to get more backlinks. It is which sources shape this specific recommendation, and why competitors are represented there better.

1. For each lost prompt, list every source the AI answer cites or clearly draws from, plus the top Google results for the same question: Reddit and forum threads, review and comparison sites, directories and marketplaces, editorial articles and listicles, videos, competitor pages.
2. For each source note: URL, type, date, whether the user is mentioned, how competitors are described there, and what is wrong or missing about the user.
3. Sort each into one bucket. Different source, different action:
   - OWN. Pages the user controls (site, docs, help center, blog). Action: fix or add the page, via audit or brief.
   - CLAIM. Profiles and listings they can take ownership of (review site profiles, directory and marketplace listings, business profiles). Action: claim it, complete it, match the facts to the site.
   - EARN. Editorial mentions, reviews, and community discussion they have to deserve. Action: name the outlet or thread and what would make them worth including: data, a demo, customer reviews, a genuine answer.
   - CONTEST. Outdated or incorrect information about them. Action: the correction to request and from whom, with evidence.
4. Community plan. Do not post everywhere. Pick the few communities closest to the product and buyer, using the same buyer questions tracked in the question map to choose which conversations are worth joining. Draft suggested replies only on request, flag community rules and disclosure, and never post, comment, or message anyone yourself.
5. Rank actions by how many tracked prompts a source influences and how close those prompts are to buying.

Output: a table per prompt (source, type, bucket, what is wrong, action, effort), the top five actions across all prompts, saved dated under the search content folder.

Never invent a source, quote, or citation. Never contact a site, reviewer, or community on the user's behalf.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Lost prompt diagnosis (`lost-prompt-diagnosis`): Read `../seo-autobot-onsite/references/lost-prompt-diagnosis.md` (skill `seo-autobot-onsite`).
