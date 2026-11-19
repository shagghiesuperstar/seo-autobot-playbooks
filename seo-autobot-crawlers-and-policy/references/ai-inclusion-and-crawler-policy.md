---
name: ai-inclusion-and-crawler-policy
description: "Use when starting any AI-visibility work or when asked about opting out, blocking, or allowing AI: find which controls include or exclude the site per AI surface, verify bots, and write one access-policy table."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "AI inclusion and crawler policy"
  source_path: "search-ops/ai-inclusion-and-crawler-policy/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: AI inclusion and crawler policy
description: >-
  Use before any AI-visibility content work and whenever the operator asks about opting out, blocking, or allowing AI: establish which controls currently include or exclude the site from each AI surface, verify bots by signature or network rather than user-agent, and write the access policy as one decision table.
```

Inputs: Search Console property list and settings (or screenshots), `robots.txt`, response headers and robots meta on the money pages, CDN or WAF bot settings, server or CDN logs when available, and the operator's stance on training, licensing, and costly routes.

Rule: inclusion is a setting before it is a content problem. A site excluded by a toggle, a header, or a firewall rule cannot be fixed by writing. Read the controls first, change nothing without a yes.

## Step 1: Read every control that can exclude the site

| Control | Where | Effect (read 2026-11-17) |
| --- | --- | --- |
| Search generative AI control | Search Console, Settings > Search generative AI (all sites since 2026-08-31) | Excludes links and content from AI Overviews, AI Mode, and Discover's AI features. Not a ranking signal elsewhere. Does not affect training. Takes a few days |
| Inheritance | Same page, per property | A child property inherits from its closest configured parent, and a child can override. Check every verified property, including subdomains and URL-prefix ones |
| `noindex` | Meta or `X-Robots-Tag` | Out of Search entirely, so out of its AI features |
| `nosnippet`, `max-snippet`, `data-nosnippet` | Meta or attribute | Google's AI features require a page that is indexed and eligible to show with a snippet. Removing the snippet removes the eligibility |
| `Google-Extended` | robots.txt | Limits use for training the models; does not remove the site from Search AI features |
| Per-bot robots rules | robots.txt | Each vendor's training, search, and user-triggered fetchers are separate tokens with separate effects |
| CDN and WAF bot settings | Edge dashboard | A managed "block AI bots" rule or a challenge page overrides everything above |

Report the state of each as found, with the date. An exclusion nobody remembers setting is the first finding.

## Step 2: Sort bots into four classes, then decide per class

1. Training crawlers: collect for model training.
2. Search and index crawlers: build the index an assistant retrieves from.
3. User-triggered fetchers: fetch one page because a person asked.
4. Browsing agents: operate the site on a person's behalf.

Fetch each vendor's current published list of tokens and network ranges this run; names change. The decision table has one row per class and vendor: allow, block, or allow with limits, and what is lost. Blocking class 2 or 3 removes the site from that engine's answers: in Muck Rack's October 2026 report, 81% of major publishers blocking Claude's search crawler got almost no Claude citations, against 12% of those allowing it. Blocking class 1 only is a legitimate stance that costs no retrieval.

## Step 3: Verify identity properly

- A user-agent string proves nothing in either direction. A curl with a bot's user-agent that gets a 200 does not prove the real bot gets one, and a 403 on the spoof may be the firewall correctly rejecting a fake. Treat spoofed-agent curls as a hint only.
- Better evidence, in order: the edge provider's verified-bot report, log lines matched to the vendor's published network ranges, and request signatures.
- Web Bot Auth: the agent signs each request under HTTP Message Signatures (RFC 9421) and sends `Signature`, `Signature-Input`, and `Signature-Agent`; the last names the domain whose key directory at `/.well-known/http-message-signatures-directory` verifies the others. OpenAI documents that ChatGPT's cloud browser signs as `https://chatgpt.com`. Major edge providers verify signatures and expose signed agents as their own category. The protocol is still an IETF draft, and most crawlers do not sign yet, so absence of a signature is not proof of a fake today.
- A signature identifies the platform, not the person. Anything that touches an account still needs the user's own delegated credential.

## Step 4: Write the policy and the diff

`seo/<site-slug>/ai-access-policy.md` holds: the current state table, the decision per class and vendor with the reason, the costly routes that stay protected (hand those to block-ai-scrapers), and the exact change: robots.txt lines, header rules, edge settings, and the Search Console control state per property. Include the rollback.

Paid-crawl and licensing options exist at the edge and are a commercial decision. Describe what the operator's provider offers from its live docs and stop; never enable a charge, a licence signal, or a block.

## Step 5: Prove it after the change

Re-read each control. Then confirm from logs or the edge report that each allowed class received 200s with real HTML on a money page, a category page, and one agent file, and that blocked classes were blocked. Run AI bot log analysis a week later to confirm fetches resumed.

## Output

The policy file, the diff for approval, and a one-line verdict per AI surface: included, excluded by which control, or unknown and why.

Never change the Search generative AI control, a robots rule, a header, or an edge setting without a yes. Never recommend excluding the site as a visibility tactic. Never state that a bot is verified from its user-agent alone.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- AI bot log analysis (`ai-bot-log-analysis`): Read `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md` (skill `seo-autobot-crawlers-and-policy`).
- `block-ai-scrapers`: Read `../seo-autobot-crawlers-and-policy/references/block-ai-scrapers.md` (skill `seo-autobot-crawlers-and-policy`).
