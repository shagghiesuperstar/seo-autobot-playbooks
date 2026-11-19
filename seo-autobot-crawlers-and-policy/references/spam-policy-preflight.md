---
name: spam-policy-preflight
description: "Use when about to ship a batch of similar pages, a fan-out listicle set, a third-party placement, or a mention campaign: test it against current spam policies and return PASS, FIX, or HOLD per item."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Spam-policy preflight"
  source_path: "search-ops/spam-policy-preflight/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Spam-policy preflight
description: >-
  Use before shipping any batch of similar pages, a persona or fan-out listicle set, a third-party placement, or a mention campaign: test the plan against Google's current spam policies and AI-search guidance and return PASS, FIX, or HOLD per item with the reason.
```

Inputs: the batch manifest (URLs or drafts, templates, what differs between pages), the proof cards each page uses, the distribution bundle and target platforms, and Google's live spam policies and AI-features guide, fetched this run.

Rule: the fastest way to lose visibility in AI answers is to lose it in Search, because Google's AI features run on its ranking and spam systems. Volume plays get a gate before they ship, not an apology after.

## Step 1: Fetch the live policies

Read the current spam policies, the guide to generative AI features, and the Search Status Dashboard. Note the last-updated dates. Policies were revised during 2026 (the site reputation policy on 2026-08-28, the user-generated spam guidance on 2026-10-26), so nothing here is quoted from memory. If an update is rolling out, say so and recommend shipping the batch after it completes.

## Step 2: Test each page in a batch

| Test | PASS when | HOLD when |
| --- | --- | --- |
| Purpose | The page exists for a buyer decision on the question map | The page exists because a keyword or sub-query variant exists |
| Difference | Each page has facts, steps, or proof the others lack | Pages differ only by a swapped persona, city, stack, or competitor name |
| Proof | At least one proof card or first-hand detail per page | Consensus-only text that any site or model could have produced |
| Fit | The operator genuinely serves the case and says where it does not | The page ranks the operator first for a case it does not serve |
| Count | Batch size matches the research capacity (this library's own cap is six persona pages per batch) | Dozens or hundreds from one template in one release |
| Consolidation | No existing page already owns the question | A page already aims at it: refresh that one instead |

Google's wording, read 2026-11-17: scaled content abuse is many pages generated primarily to manipulate rankings and not to help users, and its AI guide says making separate content for every query variation or fan-out query for that purpose falls under it. A FIX verdict names the missing proof or the merge target.

## Step 3: Test self-ranking listicles

A "best of" page that puts the publisher first is allowed and common. It passes only when the criteria are stated, the competitors are described accurately from their own public pages with dates, at least one case is named where a competitor is the better pick, and the page discloses who wrote it. Trade reporting during 2026 described visibility losses for sites built on self-serving roundups; Google has not confirmed a specific system, so treat it as a risk signal, not a rule. A listicle with invented weaknesses, undated prices, or no losing case for the publisher is a HOLD.

## Step 4: Test third-party placements and syndication

- Whose page is it, and did its editors choose to publish it? Content on someone else's site that exists to borrow that site's ranking is what the site reputation policy addresses. Read the live policy for the current wording and regional effect before ruling.
- Is the target page indexable? Platforms have been told to noindex pages made for sharing by default. Check the meta tag, the `X-Robots-Tag`, robots.txt, and whether a comparable page from that platform is in Google.
- Does the mirror carry a canonical to the original, and does the original publish first?
- Are links in user-generated areas expected to be `ugc` or `nofollow`? Then they are not bought as ranking signals.
- Is anything paid presented as editorial? HOLD until disclosed.

## Step 5: Test mention and community plans

Google's guide says seeking inauthentic mentions is not helpful. A reply or review plan passes only when a real practitioner writes each one, discloses the affiliation where rules require it, and answers the question asked. Seeded reviews, undisclosed accounts, and bulk drops are a HOLD with no fix.

## Step 6: Test AI-assisted drafting

AI assistance is not against policy; pages that add nothing are. Each draft needs the slop pass, a proof card, and a named human reviewer before PASS.

## Output

The verdict table saved dated, the count of PASS, FIX, and HOLD, and the single change that would rescue the most pages. A batch with any HOLD does not ship as a batch; the passing pages ship alone.

Never rule from memory of a policy. Never promise that a PASS is safe from a future update. Never downgrade a HOLD because the batch is already written.
