# Standing up a site `/mcp` endpoint and wiring a bot template to it

Depth for the "Serving the site to a bot over MCP" section in SKILL.md. Read when the ask is "make this site agentically drivable / give it a bot", not for a read-only grading pass (that is `mcp-endpoint-live-probe.md`).

## 1. Audit what the agent layer already gives you

Before designing tools, measure the site. The endpoint is usually the only missing piece.

| Existing asset | Becomes |
|---|---|
| `llms.txt` + `llms-full.txt` | the guidance/notice field on every tool response |
| per-item JSON feed (`items.json`, catalog feed) | the `list_*` and `get_*` tools, straight from the same build |
| markdown twins | the `url` + `markdown` pair on every item the tools return |
| in-page WebMCP tools (`navigator.modelContext`) | the server-side twin — same names, same `inputSchema`, same semantics |
| an existing grounded chat endpoint | proof the data supports real answers, and the citation rule to copy |

Live probe for what is already exposed:

```bash
for p in /mcp /api/mcp /.well-known/mcp.json /.well-known/agent.json; do
  curl -s -o /dev/null -w "$p %{http_code} %{content_type}\n" "https://<host>$p"
done
```

A 404 on `/mcp` next to a 200 on the JSON feed is the whole finding: the data layer shipped, the endpoint never did.

## 2. Tool inventory for a read-only content/catalog site

Start from the in-page WebMCP tools so both surfaces stay identical, then add only what an agent genuinely lacks:

- `search_<things>` — name, brand, street/slang name, typo, goal. Returns matches plus URLs.
- `get_<thing>` — one entry by slug: summary, evidence label, regulatory status, benefits, side effects, verified quotes, source links.
- `list_<things>` — every entry, filterable by evidence label or family.
- `get_sources` — the cited-source list for an entry. **This is usually the genuinely new tool**: it is what lets a bot hand the user a research source instead of a summary.
- `get_site_guidance` — the agent-context block (clinician rule, no-advice constraint, regions/legality). Carrying the rules as a tool enforces them at the record level; prose alone drifts.

Never add a mutating tool the site does not have. On a site with no cart, no account and no checkout, a read-only endpoint is a real safety property, not a limitation.

## 3. The notice/attribution contract

Every response carries the site's own constraint verbatim, exactly as <store> does with "Products are for research use only and not for human consumption." Mechanism: a tool description is the only text guaranteed to reach the model on every call, so the constraint lives there and in a guidance tool — not only on the page a bot may never open.

For an educational/research index the rule is attribution: the site reports what a cited source says and makes no claims of its own, so the bot must attribute to the source's link, never to the site.

**Brand rule that travels to the bot:** anything the bot says is the brand speaking. That is why the attribution rule belongs in the instructions — every claim traces to the cited source's link, never to the site.

**The corollary, and the mistake it prevents:** do NOT add a rule telling the bot to steer toward "what has been studied and reported, not what is doubted," and do NOT suppress a skeptical or cautionary quote that a cited source makes. On an attribution-only site those are the same defect. A source's doubt is what that source says; the site's entire identity is that it reports a source rather than speaking. Suppressing the caveat on the site's instruction makes the site the author of the claim it says it never makes — and it defeats the `get_sources` tool you just built, whose whole purpose is to let the user read the source and judge for themselves.

**Audit the template as an instruction set before it ships** (`/bitterpillengineering`, or the Five Questions inline). This is where a rule like the one above gets caught, along with the boring ones. Typical verdict for a five-rule template: keep the attribution rule; keep the no-medical-advice rule (a safety gate, never cut); keep the voice rule; cut any restatement of the NEVER list (it already travels via `get_site_guidance`, and a second copy drifts); cut "be accurate"/"be helpful" (model defaults); cut per-tool usage recipes (the tool descriptions carry selection criteria at selection time).

## 4. Hosting decision table

| Situation | Do this |
|---|---|
| Site already on an edge Worker/route | add the `/mcp` path to that same Worker — one deploy, same CI, no new infra |
| Server is local only | tunnel required; Cloudflare quick tunnels do NOT carry SSE (use ngrok for SSE, Cloudflare is fine for Streamable HTTP) |
| Read-only public data | no auth; correct v1. OAuth (`workers-oauth-provider`) is a product-posture change, an owner GO |

Check the platform's current transport table before choosing a handler shape — the stateful Durable-Object path has been deprecated for new servers, and a read-only server wants the stateless one.

## 4b. Three build-time traps that decide whether the endpoint works

Check all three while PLANNING. Each one is invisible in a code read and only shows up as a runtime failure, so a spec that skips them hands the builder a mid-flight stall.

**(a) The site's data modules usually cannot be imported into Worker code.** On an Astro site the shared data layer reads the filesystem at module scope — `fs.readFileSync` for a manifest, `fs.existsSync` for asset checks, often `path.join(process.cwd(), ...)`. None of that exists in the Worker runtime, and the import fails where the build looks fine. Find them before you plan:

```bash
grep -rn "node:fs\|node:path\|process.cwd\|existsSync\|readFileSync" src/lib/
```

Every hit is a module you cannot import from a handler. **Do not add a compatibility flag to make the import work** — that is a change to the deploy surface for a problem the site already solved elsewhere. Find the existing Worker-side pattern and reuse it: a site with a grounded chat endpoint almost always already loads its data at build time and reads it through the assets binding (`env.ASSETS.fetch(...)`) inside the Worker. The MCP tools load the SAME artifact that way, which also guarantees the endpoint and the rendered pages cannot drift. Modules with no filesystem dependency (a site-facts/guidance module, a safety-copy module) are safe to import — reuse them as the source for `get_site_guidance` so the rules have one owner.

**(b) A stateless handler's default hostname allowlist does not include your custom domain.** The default covers localhost and `workers.dev` only, so a site on its own domain 403s in production while local dev passes clean — the worst possible failure shape. Name the custom domain (and any alias domains the Worker already serves) in the handler options. Say so as a named requirement in the card, not as a footnote.

**(c) Dispatch `/mcp` before every other route that can claim it.** An existing Worker usually has an `/api/` catch-all that 404s unknown subpaths and a content-negotiation branch for extensionless page paths; `/mcp` has no extension, so both are candidates to swallow it. Put the `/mcp` check above both, and add a test that asserts `/api/<existing>` and the markdown negotiation still behave identically afterwards — a new route in a shared dispatcher is exactly where a non-regression regression hides.

## 5. Connector vs template — the split that breaks installs

- The **bot template** carries identity, description, skills, routines. It does NOT carry MCP connectors.
- The **connector** is added by whoever installs: connect URL → New Connector → Custom → the server URL.
- Therefore every template's setup section opens with the connector URL and the exact click-path, plus the tool names the bot will see. A recipient who skips it gets a bot with zero tools.

Bot instructions worth pinning in the template: which tools to use and in what order; what to do when a tool returns nothing (say so plainly, never invent); the attribution rule; the hard NEVER list (no advice, no dosing, no "approved for" beyond what a page states, no directing anyone to buy); and a tone line.

## 6. Voice: confirm the platform before scoping

Check the bot platform's own docs for native voice chat, dictation and voice memos before writing any TTS/STT work. If it ships them, the requirement is already met and a separate pipeline is rebuilding a shipped feature. Spend the effort on what gets spoken: tool descriptions and the guidance tool.

State the limit of the evidence honestly — confirmed in docs is not the same as exercised hands-on. If a rollout gap is possible, name it as a gap rather than a build.

## 7. Definition of done for milestone 1

- `/mcp` answers `tools/list` and `tools/call` over Streamable HTTP on the live host.
- Tool output matches the live site; zero invented facts; notice + attribution present.
- Nothing visible on the site changed (visual diff clean, per the standard's section 7).
- Bot instructions drafted but UNPUBLISHED — publishing a template is the owner's account action.
- Each new check proved it FAILS before the fix ships, and the live check curls the host, never PR or card state.

## 8. The parity test — the gate that makes an agent endpoint trustworthy

An agent endpoint is trusted precisely because it cannot say anything the site does not. That is a testable property, so test it rather than asserting it in a card body.

Write ONE parity test that, for every entry in the catalog, compares the MCP tool's response against the site's own public JSON feed for the same slug, field for field. Two hundred entries compare as cheaply as two, and the test fails the moment a tool starts summarising, rounding, dropping a field or inventing a qualifier. It is also the thing that catches an endpoint silently diverging after a later data-model change, which no review reads by hand.

Add a live half on top: exercise the deployed endpoint over the network the way a real client does — `initialize`, `tools/list`, then one `tools/call` per tool — and fold it into the site's existing verification script so it runs with the normal gate rather than as a one-time check. Watch the two transport gotchas: a `curl` of an MCP endpoint returns SSE, not JSON (strip the `data:` prefix before parsing), and GET/DELETE on a stateless lane return 405 by design, so probe with POST.

Then make the non-regression half explicit: the endpoint adds a route and must touch no template, data file or generated agent file. Byte-identical build output for every existing page is the proof.
