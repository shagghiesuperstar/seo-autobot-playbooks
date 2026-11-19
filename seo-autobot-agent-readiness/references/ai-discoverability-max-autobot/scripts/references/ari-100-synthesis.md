# How the superset was assembled

Four scoring instruments were reversed to their check lists, weights and scoring semantics, then merged. This note records what each family contributes, in behaviour terms, so a future edit knows what would be lost by dropping a domain.

| instrument family | shape | what it contributes | what it misses |
|---|---|---|---|
| crawler-access checker | one live request per crawler identity, weighted by commercial importance, plus a small file checklist | the reachability matrix; the finding that an edge rule blocks what robots.txt allows; exclusion of untestable crawlers instead of a false fail | almost nothing about content, structure or operability |
| standards-ladder checker | 23 named standards, each mapped to a level 0-5, with applicability per site type | the level ladder; the rule that a card for an interface that does not exist is worse than no card; control-bot comparison | no per-page content quality, no commerce |
| commerce-storefront scorer | 24 checks in 5 weighted categories plus bonus signals, with a copy-paste fix prompt per failing check | the operability axis: real controls, price and stock in HTML, a machine-readable commerce profile, cart permalinks | narrow to stores; no API/auth surface |
| protocol-spec scanner | ~72 checks split across a readability spec, an index-file spec and a protocol manifest group, scored at page and site level | breadth over specs: OpenAPI, MCP cards, agent cards, payment protocols, markdown mirrors, content negotiation | attribute-signal checks are cosmetic; protocol checks fire on sites with no protocol |
| geo/answer-engine audit | ~42 checks in 5 sections with per-check weight out of 5 and a narrative fix | the trust and answer-readiness half: author, dates, sources, entity consistency, answer-shaped content | no live crawler access; no protocol layer |

Merged conventions kept from the set:

- **Longest-match robots evaluation** with allow-wins-on-tie, and a live probe per crawler identity rather than reading the file.
- **Null is not zero.** Excluded, not failed.
- **Weighted, not counted.** A check worth 5 outweighs a check worth 1.
- **Applicability by evidence.** Capability-gated domains renormalise instead of penalising.
- **A fix prompt per check**, ordered by recoverable points, aggregateable into one prompt for a coding agent.
- **Bonus never subtracts.**

Merged conventions rejected:

- Counting a missing interface as a failure on a site that has no interface.
- Scoring a training-only crawler block as a defect (it is a commercial choice).
- Marketing-tier signals inside the numeric score (turned into the separate accessibility sub-score instead).
- A single opaque number with no domain breakdown (the breakdown is what makes the output a worklist).
