#!/usr/bin/env node
// Emits the skill reference set from the registry. Run after any registry edit:
//   node engine/gen-skill.mjs [outDir]
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { CHECKS, DOMAINS, A11Y, CRAWLERS, BONUS_SIGNALS, GRADES, LEVELS, RESULT_POINTS } from './registry/mega.mjs';

const out = process.argv[2] || new URL('./skill-out', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

// ── registry reference ──────────────────────────────────────────────────────
const L = [];
L.push('# ARI-100 check registry');
L.push('');
L.push(`${CHECKS.length} checks across ${DOMAINS.length} weighted domains. Generated from \`registry/mega.mjs\` — do not hand-edit; re-run \`node engine/gen-skill.mjs\`.`);
L.push('');
L.push('**Tiers.** `essential` = the baseline every agent needs, always scored. `recommended` = scored when the capability exists. `optional` = cheap, low-weight. `bonus` = emerging, contributes to the +5 signal bonus and never subtracts.');
L.push('');
L.push('| domain | weight | checks | Σ weight |');
L.push('|---|---|---|---|');
for (const d of DOMAINS) {
  const cs = CHECKS.filter((c) => c.domain === d.id);
  L.push(`| ${d.name} \`${d.id}\` | ${d.weight}% | ${cs.length} | ${cs.reduce((a, c) => a + c.weight, 0)} |`);
}
L.push('');
for (const d of DOMAINS) {
  L.push(`## ${d.name} — ${d.weight}%`);
  L.push('');
  L.push(`_${d.blurb}_`);
  L.push('');
  for (const c of CHECKS.filter((x) => x.domain === d.id)) {
    L.push(`### \`${c.id}\` — ${c.title}`);
    L.push(`weight **${c.weight}** · tier **${c.tier}**`);
    L.push('');
    L.push(`- **Pass:** ${c.how}`);
    L.push(`- **Fix prompt:** ${c.fix}`);
    L.push('');
  }
}
L.push('## Bonus signals (+1 each, capped at +5)');
L.push('');
for (const b of BONUS_SIGNALS) L.push(`- \`${b.id}\` — ${b.label}`);
L.push('');
L.push('## Crawler reachability matrix');
L.push('');
L.push('Weights are for being found and cited. Training-only crawlers carry 0: blocking them is a commercial choice, not a defect.');
L.push('');
L.push('| crawler | platform | role | weight |');
L.push('|---|---|---|---|');
for (const c of CRAWLERS) L.push(`| \`${c.ua}\` | ${c.platform} | ${c.role} | ${c.weight} |`);
L.push('');
L.push('## Accessibility sub-score');
L.push('');
L.push(`${A11Y.length} checks, reported separately, 0-100. A site below 80 cannot hold an A+ grade.`);
L.push('');
for (const a of A11Y) L.push(`- \`${a.id}\` — ${a.title}`);
L.push('');
writeFileSync(out + '/ari-100-registry.md', L.join('\n'));

// ── scoring reference ───────────────────────────────────────────────────────
const S = `# ARI-100 scoring method

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

Domain weights: ${DOMAINS.map((d) => `${d.name} ${d.weight}`).join(', ')} — sum 100.

## Applicability gating (discover, then validate)

A recommended check is only scored when scan evidence shows the capability exists.

- **Interfaces domain** scores only when a developer surface is detected: \`/openapi.json\` parses, a developer or API link is present on the page, an MCP card exists, or robots.txt mentions \`/api\`. Otherwise the whole domain is \`not_applicable\` and its weight redistributes.
- **Commerce checks** score only when commerce is detected: a Product node, a product page, add-to-cart copy, or a \`/cart\` path. \`site-search\` is always scored.

The consequence is intended: a content site can reach a high score on the seven remaining domains, and a store is judged on all eight.

## Grades

| ARI-100 | grade | label |
|---|---|---|
${GRADES.map((g) => `| ≥ ${g.min} | **${g.grade}** | ${g.label} |`).join('\n')}

An accessibility sub-score under 80 caps the grade at A.

## Levels

| level | name | unlocked by |
|---|---|---|
${LEVELS.map((l) => `| L${l.level} | ${l.name} | ${l.need} |`).join('\n')}

## Stated limits

1. **One vantage point.** Crawler probes come from a single server, not from each operator's published IP ranges. A rule keyed on verified identity reads \`unverifiable\` and is excluded. Identity-verified crawlers (Googlebot, bingbot, Applebot) returning 403 while a browser gets 200 are treated as unverifiable, not blocked.
2. **A snapshot.** Status codes, policies, rendered content and advertised protocol support change after the scan. The score describes one URL at one time.
3. **Parse depth.** HTML is parsed with deterministic extractors, not a DOM engine. A tool registered by code the extractor cannot read is missed.
4. **Not a guarantee.** The score measures machine readability and operability. It says nothing about security, legal compliance, content quality or whether a model will choose to cite the site.
5. **Sampling.** Two inner pages and one representative detail page, chosen from the homepage links, stand in for a template. A single-page failure is reported as one page's failure.

## Reading a report

1. Failed **essential** checks first — they are the baseline an ordinary agent needs.
2. Then **recommended** failures whose domain weight is high; the report ranks every failing check by recoverable points (weight × points lost).
3. Emerging-signal gaps last: they add, never subtract.
4. Re-scan the same URL after a fix; keep the host stable so scores are comparable over time.
`;
writeFileSync(out + '/ari-100-scoring.md', S);

// ── synthesis reference (behavioural, no attribution) ───────────────────────
const Y = `# How the superset was assembled

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
`;
writeFileSync(out + '/ari-100-synthesis.md', Y);

console.log('wrote', out, '\n', CHECKS.length, 'checks');
