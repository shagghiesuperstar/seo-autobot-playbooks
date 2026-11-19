# Publishing (and independently reviewing) a well-known DISCOVERY INDEX whose truthful content is EMPTY

Use when a site must publish a well-known discovery INDEX — an index of artifacts the site
publishes, rather than a description of the site itself — and the site currently publishes NONE.
The Agent Skills Discovery index (`/.well-known/agent-skills/index.json`, RFC v0.2.0) is the
proven instance. Sibling recipes in this skill: `rfc9727-api-catalog-linkset-recipe.md` (a
linkset that names endpoints) and `wellknown-file-advertisement-recipe.md` (advertising a file
that already exists). This one covers the empty-index case and the multi-site reachability map.

## The artifact
`GET /.well-known/agent-skills/index.json` returns `application/json` on GET and HEAD with:

```json
{ "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [] }
```

`$schema` and `skills` are both required. Each entry, when there ARE skills, needs five
required fields: `name` (1-64 chars, `a-z 0-9` and hyphen, no leading/trailing/consecutive
hyphen), `type` (`skill-md` or `archive`), `description` (max 1024 chars), `url`, and `digest`
(`sha256:` + 64 lowercase hex of the artifact's RAW BYTES).

**The index is an index of things that already exist. It must never create, publish, or
invent one.** A site that serves no `SKILL.md` publishes `"skills": []` — a truthful, valid,
empty index — not a 404 and not a fabricated entry.

## Rule 1 — "empty" is a claim the reviewer must PROVE, not accept
The builder asserting "this site publishes no skills" is the same class of claim as "the live
page already looks right". Verify it yourself at the frozen head:

- Enumerate the tree and search for any skill artifact: `SKILL.md`, `skill.md`, `*.skill.md`,
  `skills/` directories, and archives (`*.zip`, `*.tar.gz`).
- Check BOTH the repo tree and `public/` — a `SKILL.md` served from `public/` is live even
  when no source file mentions it.
- Only a zero-hit search justifies `"skills": []`.

If the tree contains a skill artifact that is NOT in the index, that is a HIGH finding: the
index under-claims a published artifact, and a client that trusts the index will never fetch it.
If the index lists an entry whose `url` 404s, that is the same class of defect as a linkset
naming a dead href.

## Rule 2 — the digests must be recomputable, and a test must recompute them
`digest` is the sha256 of the artifact's RAW BYTES as served at `url`. The builder's test
should fetch each listed `url` and recompute the digest, failing on a tampered or missing
artifact. A test that only asserts the SHAPE of an entry (name regex, digest regex) proves the
string format, not the artifact — that is a tautology and must not be counted as the digest
gate. Verify the test actually performs a fetch-and-hash.

## Rule 3 — the LEGACY path must stay a 404, and must NOT be in the reachability allowlist
v0.1.0 served `/.well-known/skills/index.json`; v0.2.0 renamed it to
`/.well-known/agent-skills/index.json`. Serving the new path is the fix; serving the old path
too is a defect (the old body would need the retired `version`/`files` shape).

The trap: the mechanism that makes dotted well-known paths reachable is often an ALLOWLIST, and
the allowlist is per-site. Adding the new path to the allowlist while leaving the old path out
is correct — but a reviewer who only checks "does the new path 200" will never notice that the
old path was also allowlisted, and will never confirm the old path actually 404s. Check BOTH:
the new path resolves, and the old path is absent from the allowlist and returns 404 live.

## Rule 4 — reachability is PER-SITE, and the mechanisms differ
There is no single "how does a well-known file reach the router" answer for our stack. Each site
family has its own mechanism, and a reviewer who checks only the pattern they know will find
nothing on the other sites and may wrongly conclude the route is unreachable (or, worse, wrongly
conclude it is reachable):

- **<store>-style (`<org>/<store>-store`)**: the middleware's `edgeRoute()` rewrites any
  dotted root path that is NOT in `ROOT_FILES` (`src/lib/route-table.ts`) to the not-found page.
  A new route under `src/app` needs its literal added to `ROOT_FILES` AND to `ROUTE_LITERALS`
  (`src/lib/analytics/scrub.ts`) — the repo's own tests walk `src/app` and fail otherwise.
  Also: the middleware must `next()` the path BEFORE the research-access wall, or the route
  404s even though the file exists.
- **<store>-style (`<store>-store` `apps/storefront`)**: the middleware allowlists the
  `.well-known` first segment, then a dotted-path check calls `NextResponse.next()`. A static
  `route.ts` outranks the `[countryCode]/[...slug]` catch-all. Read that catch-all to confirm
  it 404s (rather than redirecting) for an invalid country code — a catch-all that 307s would
  turn the new path into a redirect loop.
- **<store>-style (`<store>-store` `apps/<b2b-app>`, base `release/<store>`)**: the
  middleware must next() any dotted `/.well-known` path BEFORE the `/us` region redirect, or
  the path 307s to the region home instead of serving the file.

**Verify reachability against a LIVE sibling on the same host, not by analogy.** The cheapest
proof that the mechanism works on a host you cannot build: curl a sibling well-known file that
already serves on that host (`/.well-known/mcp.json`) and confirm it answers 200
`application/json`. If the sibling serves, the mechanism is live on that host.

## Rule 5 — advertise it, and say the index is empty in the advertisement
The discovery link goes in `llms.txt` (and `llms-full.txt` if the site has one), with the
absolute URL and a sentence stating that the site publishes no skills so the array is empty.
That sentence is not filler: it is what stops a client from reading `"skills": []` as a
malformed response and retrying the legacy path.

The link must be ABSOLUTE, built from the site's own origin helper, not a hardcoded apex.

## Rule 6 — an index needs no feature gate, and needs no new shopper surface
An index that names no endpoint and exposes nothing is static, prerendered, and cannot
advertise a 404. It therefore does NOT belong behind the site's agent-route flag
(`UD_AGENT_ROUTES` / `MCP_BUY_ENABLED`): gating it creates the failure mode where the flag is
off in production and the advertised index 404s. The inverse trap also exists: if the index IS
flag-gated, curl the sibling to confirm the flag is currently ON, and say so in the review.

Reviewers must also confirm the change adds no shopper-visible surface: no new redirect, no
gate, no client JS, no change to an existing page's rendered output.

## Multi-site scope: state what is IN and what is OUT
A ticket may name more sites than the work order scoped. When the work order narrows the
scope, the review MUST say so explicitly and list the sites that are NOT covered by name with
their current live status (e.g. "the remaining two hosts still answer 404 on this path"). A
verdict that silently covers only the built sites lets the orchestrator close the ticket as
"all N sites done". Skipped sites need a receipt — the live status — not silence.

## Builder-side gates, per repo
- `<store>-store` is an npm workspace: `npm ci` at the REPO ROOT as well as in the app.
  `apps/<b2b-app>` runs `scripts/<build-gate-script>` during a production
  build, which fetches the Medusa backend; without Cloud env it needs a localhost stub
  answering `<gate-endpoint>`. The build regenerates
  `src/lib/util/deploy-stamp.generated.ts` and `.buildstamp.json` — revert before committing.
  Tests: `npx vitest run`.
- `<store>-store` is pnpm: `pnpm install --frozen-lockfile` at root (`npm ci` silently does
  nothing there). Tests: `node --test` via `npm test` in `apps/storefront`.

## Reviewer's evidence list (independent AR, read-only)
- For EVERY PR in the set: base branch, exact head SHA, draft state, mergeability. One repo
  can ship two bases (`apps/storefront` on `main`, `apps/<b2b-app>` on `release/<store>`).
- Raw file reads at the PR head via `gh api -H "Accept: application/vnd.github.raw"` for the
  route, the index builder, the route table / allowlist, the middleware, and the llms.txt
  source. Do not read only the PR body.
- The zero-hit skill-artifact search over the tree at the head (Rule 1).
- Live signed-out curls for: the NEW index path, the LEGACY path, a sibling well-known file
  on the same host, and `llms.txt`. Record status + content-type for each. The legacy path's
  404 and the new path's 200 are the two halves of Rule 3.
- A spec citation for the body shape and for each required field rule.
- Explicitly state what you did NOT re-run (the builder's build, probe script, and test
  suites) and keep the builder's pass counts labelled as the builder's claim.

## Verdict shape
Number the findings. Severity per row: blocking / non-blocking / info. A LOW row for "no
served-app probe on this host" is acceptable when the work order accepted the build gate stop
AND the live sibling proves the mechanism — but say plainly that the local probe was not
re-run. End with `VERDICT: APPROVE` or `VERDICT: REQUEST_CHANGES`.

When the deliverable is truthful-empty and nothing blocks shipping, say so plainly and name
the remaining operational dependency (the deploy, the out-of-scope hosts) in the NEXT ACTION
line, so the orchestrator merges without treating the ticket as fully closed.
