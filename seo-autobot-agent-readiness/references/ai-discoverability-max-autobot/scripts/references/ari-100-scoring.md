# ARI-100 scoring method

## Result values

| result | points | meaning |
|---|---|---|
| pass | 1.0 | the evidence is present and correct |
| partial | 0.5 | present but incomplete, or correct on one surface and missing on another |
| warn | 0.4 | present but fragile (an allow-list robots.txt that currently works) |
| fail | 0 | absent or wrong |
| not_applicable | excluded | the capability the check validates does not exist on this site |
| inconclusive | excluded | the check could not be tested from this vantage point |

Null results are **excluded, never counted as zero**. A brochure site is not punished for having no checkout, and a site behind identity-verified bot rules is not punished for a test a single server cannot perform.

## Formula

    domain_score = 100 * Σ(check_weight × points) / Σ(check_weight)      over scorable checks
    core         = Σ(domain_score × domain_weight) / Σ(domain_weight)     over domains with ≥1 scorable check
    bonus        = min(5, count of bonus signals present)
    ARI-100      = min(100, round(core + bonus))

Domain weights: Reachability & Access 20, Render & Delivery 10, Structure & Semantics 12, Structured Data 12, Discovery Files 14, Agent Interfaces 14, Operability & Commerce 10, Trust & Authority 8 — sum 100.

## Applicability gating (discover, then validate)

A recommended check is only scored when scan evidence shows the capability exists.

- **Interfaces domain** scores only when a developer surface is detected: `/openapi.json` parses, a developer or API link is present on the page, an MCP card exists, or robots.txt mentions `/api`. Otherwise the whole domain is `not_applicable` and its weight redistributes.
- **Commerce checks** score only when commerce is detected: a Product node, a product page, add-to-cart copy, or a `/cart` path. `site-search` is always scored.

The consequence is intended: a content site can reach a high score on the seven remaining domains, and a store is judged on all eight.

## Grades

| ARI-100 | grade | label |
|---|---|---|
| ≥ 95 | **A+** | Exemplary |
| ≥ 90 | **A** | Agent-native |
| ≥ 75 | **B** | Agent-aware |
| ≥ 60 | **C** | Partly readable |
| ≥ 40 | **D** | Largely invisible |
| ≥ 0 | **F** | Unreadable |

An accessibility sub-score under 80 caps the grade at A.

## Levels

| level | name | unlocked by |
|---|---|---|
| L0 | Hidden | robots.txt and a sitemap |
| L1 | Crawlable | AI crawlers named with a deliberate policy |
| L2 | Agent-readable | Markdown on request and discovery files |
| L3 | Agent-discoverable | an index of machine interfaces |
| L4 | Agent-operable | a callable interface: MCP, A2A or API |
| L5 | Agent-commerce | a checkout an agent can complete |

## Stated limits

1. **One vantage point.** Crawler probes come from a single server, not from each operator's published IP ranges. A rule keyed on verified identity reads `unverifiable` and is excluded. Identity-verified crawlers (Googlebot, bingbot, Applebot) returning 403 while a browser gets 200 are treated as unverifiable, not blocked.
2. **A snapshot.** Status codes, policies, rendered content and advertised protocol support change after the scan. The score describes one URL at one time.
3. **Parse depth.** HTML is parsed with deterministic extractors, not a DOM engine. A tool registered by code the extractor cannot read is missed.
4. **Not a guarantee.** The score measures machine readability and operability. It says nothing about security, legal compliance, content quality or whether a model will choose to cite the site.
5. **Sampling.** Two inner pages and one representative detail page, chosen from the homepage links, stand in for a template. A single-page failure is reported as one page's failure.

## Reading a report

1. Failed **essential** checks first — they are the baseline an ordinary agent needs.
2. Then **recommended** failures whose domain weight is high; the report ranks every failing check by recoverable points (weight × points lost).
3. Emerging-signal gaps last: they add, never subtract.
4. Re-scan the same URL after a fix; keep the host stable so scores are comparable over time.
