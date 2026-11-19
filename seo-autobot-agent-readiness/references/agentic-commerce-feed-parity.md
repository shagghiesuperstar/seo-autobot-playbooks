---
name: agentic-commerce-feed-parity
description: "Use when a store wants its products shown or bought inside ChatGPT, AI Mode, or Gemini: check that the product feed, the page's structured data, and the visible page agree on every offer fact, and prepare the feed and protocol steps for approval."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Agentic commerce feed parity"
  source_path: "search-ops/agentic-commerce-feed-parity/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Agentic commerce feed parity
description: >-
  Use when a store wants its products shown or bought inside ChatGPT, AI Mode, or Gemini: check that the product feed, the page's structured data, and the visible page agree on every offer fact, and prepare the feed and protocol steps for approval.
```

Inputs: the product feed (file, hosted URL, or platform export), the storefront repo and live product pages, Merchant Center diagnostics when available, the returns and shipping policy pages, and the list of products that must never be exposed (trade-only prices, restricted items).

Rule: an agent trusts three copies of the same offer: the feed, the structured data, and the page a browser sees. Any disagreement on price, availability, or identifier is a reason to drop the product or mis-sell it. Parity first, protocols second.

## Where things stand (read 2026-11-17; these move monthly, fetch the live docs before quoting)

- OpenAI: product feeds supply structured catalog data for discovery in ChatGPT. Setup starts in Business Hub and requires identity verification. Delivery is manual upload, a hosted HTTPS URL, or SFTP, as full snapshots. Every record needs the required fields and a stable `item_id`. The feed does not update a cart or confirm a purchase; the live site or plugin still checks the current offer when the customer acts. A connected feed does not guarantee recommendation.
- Google: the Universal Commerce Protocol enables buying on AI Mode and Gemini from existing Merchant Center feeds. Native checkout is the default path; embedded checkout is for specific approved merchants. The merchant stays merchant of record. Access is by waitlist, with lodging and food waitlists open. It supports REST and MCP bindings and is described as compatible with AP2, A2A, and MCP.
- Both ecosystems are changing scope quarter to quarter. Treat any statement about who offers in-chat checkout as stale unless fetched today.

## Step 1: Sample and compare three sources per product

Take the top products by revenue plus ten at random, at least 30 where the catalog allows. For each, record the feed value, the JSON-LD value from the raw HTML, and the visible DOM text for:

| Field | Pass condition |
| --- | --- |
| Identifier (`item_id`, SKU, GTIN, MPN) | Same value in all three; stable across the last two feed snapshots |
| Title | Same product, no promotional text in the feed title |
| Price and currency | Exact match, including sale price and its end date |
| Availability | Same state; out-of-stock is stated, not hidden |
| Variant | Each sellable variant resolves to its own URL or selected state with its own price |
| Image | Feed image URL returns 200 and shows the same variant |
| Shipping and returns | Feed or account settings match `OfferShippingDetails`, `MerchantReturnPolicy`, and the policy page |
| Canonical URL | Feed link is the canonical, returns 200 without JavaScript, and is not gated |

Price, availability, and identifiers must be DOM text in the server response. A price painted by client script or baked into an image fails for the agent even when the feed is right.

## Step 2: Find the drift source

Most mismatches come from one of four places: a feed built on a schedule slower than price changes, a cached page in front of a fresh feed, sale logic applied in the storefront and not in the feed, and variant identifiers regenerated on each export. Name the one that applies and the fix in the repo or the feed app. Do not patch values by hand.

## Step 3: Make the answers an agent needs explicit

For each sampled product, confirm the page states in text: what it is and who it is for, compatibility or sizing, what is in the box, shipping regions and exclusions, return window, and warranty. Missing answers become proof-card requests, never invented copy. These are the questions a shopper asks an assistant before buying.

## Step 4: Go/no-go per surface

- ChatGPT product feed: profile claimed and verified, countries and currencies chosen, required fields present on every record, identifiers stable, policies match. Submission is the operator's click.
- Google: Merchant Center account healthy with no disapprovals on sampled items, shipping and return settings present, waitlist status known. Record whether native or embedded checkout is intended.
- Storefront agent surface: the well-known commerce files this library already publishes when `commerce: true` are present and agree with the feed. Run ai-discoverability-max-autobot for that layer.

## Step 5: Keep it in parity

Add a check to CI or the daily routine: re-sample ten products, compare the three sources, and fail on any price or availability mismatch. Log the mismatch rate in the ledger.

## Output

The parity CSV, the mismatch rate with the sample size, the drift source, and the go/no-go checklist with each blocker named.

Never submit a feed, join a waitlist, enable a checkout, or change a price. Never put gated or trade prices in a feed without explicit approval. Never invent a GTIN, a rating, a stock level, or a policy.

> **Template guardrail (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT):** never submit, publish, post, send outreach, open or complete a checkout, pay, merge, deploy, or change DNS/firewall/feeds without an explicit yes from the operator for that specific action. Any price, promo code, plan, or tool list in this skill is vendor-supplied and dated; re-fetch it live before quoting, and never quote a number without live data.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `ai-discoverability-max-autobot`: Read `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot.md` (skill `seo-autobot-agent-readiness`).
