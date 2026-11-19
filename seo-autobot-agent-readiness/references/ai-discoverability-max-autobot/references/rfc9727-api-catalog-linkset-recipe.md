# RFC 9727 API Catalog linkset: build + independent-review recipe

Use when a site must publish `/.well-known/api-catalog` (RFC 9727) or when you are the
INDEPENDENT reviewer of such a change across one or more storefronts. The linkset is a
discoverability surface, so it rides the `ai-discoverability-max-autobot` standard, but its failure
modes are specific enough to keep separate.

## What the artifact is
`GET /.well-known/api-catalog` returns `application/linkset+json` with the RFC 9727 profile
parameter, and a body shaped as RFC 9264 / RFC 9727 Appendix A.1:

```json
{ "linkset": [
  { "anchor": "<origin>/.well-known/api-catalog",
    "item": [{ "href": "<origin>/mcp", "type": "application/json" }] },
  { "anchor": "<origin>/mcp",
    "service-desc": [{ "href": "<origin>/.well-known/mcp.json", "type": "application/json" }],
    "service-meta": [{ "href": "<origin>/.well-known/agent.json", "type": "application/json" }] }
] }
```

Relation values are ARRAYS of `{href, type, title?}`. `anchor` is required on every entry.
Never emit a bare string for a relation value.

## Rule 1 — `service-desc` is a relation type, NOT "an OpenAPI link"
RFC 9727 Appendix A.1 defines `service-desc` as "a machine-readable description of the API".
OpenAPI is the canonical EXAMPLE, not the only legal target. A linkset whose `service-desc`
points at the site's MCP server card is conformant. Do NOT treat "there is no OpenAPI
document" as a reason to omit `service-desc`; the reason to omit an OpenAPI relation is that
the site publishes no OpenAPI document and a `service-desc` pointing at a 404 is worse than
no relation at all.

Signals to confirm the reading before you rule:
- the issue's own wording ("omit service-desc" usually means "do not invent or link a
  non-existent OpenAPI file", not "publish no service-desc at all");
- a sibling site's LIVE `/.well-known/agent.json` already sending `rel="service-desc"` to
  `/.well-known/mcp.json` — a live sibling is the reference implementation;
- the spec text itself.

Also: each PR should carry a NEGATIVE test that the catalog never mentions `openapi` when
no OpenAPI document exists, so "we invented one" fails loudly.

## Rule 2 — every href must answer 200 TODAY, signed out
Before approving, curl every href the linkset names on every affected host:
`mcp.json`, `agent.json`, `/mcp`, and the catalog itself. A linkset that names a 404 is
worse than no linkset. If the site genuinely publishes no OpenAPI document, the OpenAPI
relation is omitted and that omission is documented in the repo — not silently guessed.

## Rule 3 — reachability has two independent parts
1. The route exists and is not swallowed by a catch-all.
2. Document routes carry exactly one `<link rel="api-catalog" href="/.well-known/api-catalog">` in served HTML.

On Next.js the HTTP `Link` header cannot carry that relation. Next `set`s font/CSS preloads as one `Link` header after middleware: an append drops the preloads, and a `headers()` `Link` never appears beside them. Do not add either. Publish the pointer in the root document head. If a page already emits the tag, move it — the diff must delete the old copy. A second tag fails the exactly-once gate.

Check the home page that shoppers and agents actually receive. Probe with
`curl -sS -o /dev/null -w '%{http_code} %{redirect_url}'` and follow the chain: the bare root
usually redirects (`/` → `/us`), and the real home is the region path. Count the tag in served HTML from `next build && next start`, not in source: document routes = 1, admin / api / static / `_next` = 0, and the preload `Link` count is unchanged.

### Dotted-path trap (<store>-class)
A path containing a dot is a FILE, not a page. In `src/lib/route-table.ts` the middleware's
`edgeRoute()` rewrites any dotted root path that is not in `ROOT_FILES` to the not-found page.
A new `/.well-known/api-catalog` route therefore ALSO needs its literal in `ROOT_FILES`, and
the middleware must return `NextResponse.next()` for it BEFORE the research-access wall — or
the route 404s even though the file exists. Sibling `/.well-known/mcp.json` already takes that
path; copy its treatment.

### Gate coupling
The catalog route and the head tag must share the SAME flag as the cards they link (`UD_AGENT_ROUTES`,
`MCP_BUY_ENABLED`, etc.) so a disabled site never advertises a 404. Do not add a static `headers()` `Link` to "keep the header in sync" — that path does not survive Next, and a static header can outlive the flag. Verify the flag is ON in production right now (curl the sibling `mcp.json` — if it is 200, the flag is on) and say so in the review. A flag-off state is a low-severity finding, not a blocker, when production is currently correct.

## Rule 4 — origin must be the origin the site advertises elsewhere
Derive the origin the way the app does, not by hardcoding an apex:
- `publicOrigin(getBaseURL())` (<store>) maps `*.<store>.example` → brand domain and
  otherwise honours the configured base URL.
- `SITE_ORIGIN = getBaseURL()` (<store>).
- allow-listed request-origin helpers (<store>) echo only known hosts.

Then cross-check against LIVE cards: the live `/.well-known/mcp.json` already names the
public origin (`websiteUrl`, `remotes[].url`). The linkset must use that same origin, and
every target on that origin must be 200 — including the `www` variant if that is what
production advertises.

## Rule 5 — the catalog resource answers HEAD and GET; discovery is the head tag
The catalog URL must answer HEAD and GET with the linkset content-type. Next exports implicit HEAD for GET routes, so a GET route already answers HEAD — confirm it rather than assuming: `curl -I` the catalog and the sibling well-known routes on all affected hosts. Home-page discovery is the HTML `<link>` in served document HTML, not an HTTP `Link` header on `/` or the region home.

## Reviewer's evidence list (independent AR, read-only)
- Draft PR state: base branch + exact head SHA for every repo (one repo can ship two bases:
  `apps/storefront` on `main`, `apps/<b2b-app>` on `release/<store>`).
- Raw file reads at the PR head via `gh api -H "Accept: application/vnd.github.raw"` for the
  route, the linkset builder, the route table, and the root layout that emits the head tag.
  Do not read only the PR body. A diff that adds the tag without deleting an existing page-level copy is a duplicate, not a move.
- Live signed-out curls with `--max-redirs 0` for: catalog, `mcp.json`, `agent.json`, `/mcp`,
  `openapi.json`, `/`, and the region home. Record status, content-type, redirect target.
- A spec citation for every relation and every structural choice (RFC 9727 §3/§4.2/Appendix
  A.2, RFC 9264 §4.2, RFC 8631 relation types).
- Explicitly state what you did NOT re-run (e.g. the builder's test suites and local builds)
  and keep the builder's pass counts labelled as the builder's claim.

## Reviewer output shape
Number the findings. For each: severity (blocking / non-blocking / info), the concrete
mechanism, and the spec or live evidence. End with `VERDICT: APPROVE` or
`VERDICT: REQUEST_CHANGES`. If every finding is non-blocking, say plainly that nothing
should block shipping and name the one production dependency (the gate flag) that must stay
on.
