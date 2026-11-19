# The server card must list the tools the endpoint serves

Depth for the "Serving the site to a bot over MCP" section in SKILL.md. Read when the ask is
"the card and the endpoint disagree", "agents say there is nothing to call", or "make the
discovery document advertise the MCP tools".

Read `mcp-endpoint-live-probe.md` first if you have never graded the endpoint — this file assumes
you can already enumerate `tools/list`.

## The failure shape

`/.well-known/mcp.json` is the document an agent reads FIRST. `GET` it and it can return 200 with
a perfectly well-formed card whose `tools` key is missing entirely, or present but empty, while
the very same site serves three working tools on `/mcp`.

The endpoint is fine. The card is the problem. The visible symptom is an agent that reads the
card, concludes there is nothing to call, and never opens `/mcp`.

Two sub-shapes, both real:
- **No `tools` key at all.** The tools are hidden in a vendor-namespaced metadata block
  (`_meta["<vendor>/tools"]`) as `name`/`title`/`description`/`annotations` summaries — no
  `inputSchema`, no `outputSchema`. The information is present but not where a reader looks.
- **`tools` present but only summaries.** Each entry has a name and a blurb, not the schema the
  server accepts.

Either way the card under-advertises the endpoint. Fix the CARD; do NOT add tools to the endpoint
to make the card look complete. A tool that exists only so the card is not empty is a capability
the site does not have — the same dishonesty as claiming one that does not exist.

**The honesty rule and this failure are the same axis, opposite directions.** "Never claim
capabilities that don't exist" covers the over-claim. This is the under-claim: the card must not
withhold capabilities the site genuinely serves. Both are agent-facing lies about the site's
surface.

## The fix: one source of truth for the tool list

The card's `tools` array must be built from the SAME array `tools/list` serves. Not a second
hand-maintained copy, not a subset someone curates.

Shape it so drift is structurally impossible:
- Extract the tool-definition array into one exported function (`liveTools(config)`), and have BOTH
  the `tools/list` handler and the card builder call it.
- The card spreads each served definition VERBATIM — `name`, `title`, `description`,
  `inputSchema`, `outputSchema`, `annotations` — rather than re-typing fields. A card entry that
  paraphrases the schema is a card that can drift.
- If the card must append site-specific text (a research-use notice, a usage constraint), append
  it to the `description` ONLY when the description does not already state it, and assert that in
  a test.

Keep the legacy/vendor-namespaced copy of the tools if one exists — something may already read it.
Add a test asserting the two agree, so the legacy copy cannot rot into a second source of truth.

Leave the REST of the card alone: `$schema`, `name`, `title`, `description`, `version`,
`websiteUrl`, `remotes`, `supportedProtocolVersions` are unchanged. The card is a discovery
document; adding tools must not quietly restyle the rest of it.

## The probe that proves it

One script, run against production and against the PR head. It must compare the two lists, not
just assert one of them is non-empty.

```
CARD  GET /.well-known/mcp.json          -> 200, content-type application/json
CARD TOOLS  names from the card's tools array
LIVE TOOLS  names from initialize + tools/list on /mcp
```

The acceptance test is a three-way equality, and all three must hold:
1. Same NAMES, same COUNT, same ORDER.
2. Each card entry's `inputSchema` deep-equals the `inputSchema` the endpoint serves for that
   tool.
3. Every live tool appears in the card, and every card tool is actually served.

Fail loudly per tool ("`get_product` is served but missing from the card"), not as one boolean.
A boolean tells a future agent that something is wrong; the per-tool line tells them what to fix.

Exit non-zero on disagreement so the script can be a CI gate and a release check.

**Use the packaged probe rather than writing one per site.** `scripts/mcp-card-probe.mjs [base-url] [card-path]` does this comparison: it GETs the card, calls `initialize` + `tools/list` on `/mcp`, and asserts same names, same count, same order, and that each card `inputSchema` deep-equals the served one. It prints one failure line per missing tool and exits 0 (AGREE) / 1 (DISAGREE). Run it against production and against the PR head; the same script becomes the release card's live re-check.

Read the transport gotcha in `mcp-endpoint-live-probe.md` before writing the script: a `POST` to
`/mcp` answers SSE, so strip the `data:` prefix before parsing.

### Verify the PRERENDERED artefact, not just the dev server

If the card route is prerendered at build time (Next.js static export of
`/.well-known/mcp.json`), then `next dev` serving the right JSON proves nothing about what the
CDN serves. After `next build`, read the emitted body directly:

```
.next/server/app/.well-known/mcp.json.body
```

Parse it and confirm the `tools` array is there. A dev-server check that passes while the
prerendered body is stale is the classic false-green.

Then: the card is prerendered, so it goes live with the next production build of the commit.
There is NO operator step — no host setting, no DNS, no Cloud env var. Say so explicitly in the
handoff, because "needs an operator step" and "ships with the next build" read the same in a
release checklist.

## Validate the shape against the SCHEMA SOURCE, not against a URL that resolves

A card's `$schema` is often a URL that no longer resolves (static schema hosting gets retired).
An unresolvable `$schema` is NOT evidence the document is invalid, and it is NOT a reason to skip
validation.

What to do:
1. Find the MAINTAINED source of the schema — the protocol repo's schema file (e.g. the
   server-card schema in the `modelcontextprotocol` repos) — and read it.
2. Check two things in the definition of the card type: does it declare the property you want to
   add, and does it set `additionalProperties: false`?
   - Property absent + `additionalProperties` NOT false => the extra key is ALLOWED. That is the
     common case for extension-friendly card schemas.
   - `additionalProperties: false` => the extra key is INVALID and you need a different slot
     (e.g. put it under `_meta` instead, and keep a top-level pointer to it).
3. Record in the PR body which file you read and what it said. A reviewer cannot re-derive
   "the `$schema` URL 404s, so I checked the repo source instead" from a diff.

Note the `$schema` value itself: if the hosted schema is gone, that is a separate, smaller
finding. Do not silently leave a dangling `$schema` and do not repoint it to a URL you invented —
report it and keep the card's other fields untouched.

## A sibling site that already ships the right shape is your precedent

Before designing the card shape, look at the sibling store you also run. If one site already
publishes a top-level `tools` array with `inputSchema`/`outputSchema`, that IS the house shape —
copy it, cite it in the PR body, and you have no schema argument to settle.

This is also how you detect the "one site got the real fix, the sibling only got the metadata
block" situation: if a sibling's card lists tools top-level and this one's does not, the
divergence is the bug, and the sibling is the reference implementation. Read the sibling's actual
live card, not your memory of it.

## The test that can encode the defect

A card-shape assertion written against a sibling site's key set ("the card's keys must be exactly
the keys the other store's card has, no more") **locks in the missing key**. When you add
`tools`, that assertion fails and it is the assertion that is wrong, not the fix.

When a test fails because it encoded the old (wrong) shape:
- Fix the assertion to the CORRECT shape, in the same change.
- Say so in the PR body, naming what the old assertion encoded. A reviewer who sees a changed
  test needs to know it was the defect, not a test weakened to make the build green.

Prefer asserting the RELATIONSHIP over the literal set: assert the card lists exactly the live
tools and that the served-definition fields are unchanged, rather than asserting a hardcoded list
of top-level keys. A relationship test survives the next legitimate shape change; a literal key
set does not.

## Writing the new card test

The test must read the REAL builders and the REAL request handler — never restate the tool list
from memory. A test whose expected tool list is a hand-typed literal can pass while the endpoint
drifted, which is the exact bug you are fixing.

Cover at least:
- names and count equal the live `tools/list` (read-only mode, and again with the write-tools
  flag on, so the card follows the endpoint to the larger set);
- each entry carries a title, a description, and the `inputSchema` the server accepts;
- per-tool argument requirements (which tool requires a handle, which takes none) asserted
  against the live contract, not guessed;
- the notice text is present where required and the rest of the description is not rewritten;
- `$schema`, `remotes` and the protocol version list are unchanged;
- the legacy metadata copy of the tools still exists and agrees with the top-level array.

## Pitfalls

- **Do not "fix" the card by adding tools to the endpoint.** The endpoint's inventory is the
  site's real capability surface. A tool added to make a card look complete is a false claim in
  the other direction.
- **Do not drop the schema fields from the card to keep it small.** `inputSchema` is the point: an
  agent that cannot see the argument shape cannot call the tool. If the JSON is large, that is a
  CDN-cost conversation, not a correctness one — and `outputSchema` is the droppable part.
- **Do not assert the card against a sibling site's key set.** See the section above.
- **Do not verify with `next dev` only.** The prerendered body is what ships.
- **Do not claim CI green when the token cannot read check runs.** If check results are unreadable
  (see the token-scope note in `prod-deploy-verification`), report CI as UNVERIFIED and name the
  local gates you actually ran.
