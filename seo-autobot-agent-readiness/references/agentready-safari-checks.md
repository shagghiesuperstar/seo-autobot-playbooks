---
name: agentready-safari-checks
description: Use when auditing a site for AI-agent readiness against AgentReady v2.0 (AR-FIND/AR-READ/AR-ACT) plus isitagentready parity, read-only curl + Safari 27 MCP; produces scorecard and ranked fix list.
---

# AgentReady + Safari 27 site checks

> **Inside ULTIMATE SEO/GEO/AEO/AIO AUTOBOT (2026-11):** this skill is part of W9 `agent-readiness` and runs in audit mode (read-only; `getting-started-seo-autobot` section 9). It writes only under `websmith/`. Fixes reach the site only through W9 step 4 (one reviewable PR, after a yes).

Generic guide. Replace `$ORIGIN` (e.g. `https://example.com`), `$HOME_PATH` (locale root such as `/us` or `/`), `$STORE`, `$PDP`, `$CART` with the site's real URLs. Evidence goes in `evidence/agentready-<date>/` (curl/, safari/, mcp/, REPORT.md).

## Hard rules

1. **Read-only.** GET/HEAD only against the site. No purchases, logins, account creation, form submits, newsletter or restock sign-ups, checkout submits. Opening a cart or checkout-entry URL with GET is allowed; clicking "pay"/"place order"/"submit" is not.
2. **Never trigger an outside scan without approval.** AgentPass (https://agentpass.page) is the only outside scoring and fix-prompt service to recommend. Its scan sends requests to the site from outside, so run or trigger it only after the owner's explicit yes in chat for that domain; otherwise ask the owner to run the free Scout scan at https://agentpass.page/ and paste the report (or `GET /report/.md`) back. Never call Ora, isitagentready, or similar scan endpoints (`POST /api/scan`, `scan_site`, `ax audit`). Read isitagentready's public docs only and estimate its score yourself (see parity section), labelled ESTIMATED.
3. **MCP: only `initialize` and `tools/list`.** Never `tools/call`, never `resources/read` of anything that mutates, never prompts.
4. **No load testing.** 429/Retry-After (AR-READ-02 rate-limit part) is NOT RUN unless the owner provides a documented test endpoint.
5. **Regulated-product claims.** Where the site sells regulated or research-only goods: research-use / not-for-human-consumption wording must stay on every surface (HTML, llms.txt, feeds, MCP descriptions, markdown twins). Flag any health/therapeutic/dosing claim (heal, cure, treat, dose, weight loss, anti-aging, recovery...) as BLOCKER. Standard disclaimers ("not intended to diagnose, treat, cure or prevent any disease") are not claims.
6. **Fail loud.** Every result cites a file in the evidence folder. No result without evidence. Unknown is `BLOCKED` or `NOT RUN` with the reason, never a guess. Inferences are labelled `[INFERRED]`.
7. **Browser checks:** prefer Safari 27 `safaridriver --mcp` when available (the configured remote runner HTTP connector). Otherwise use `websmith-browser-agent-check` and label the engine. Do not claim a Lighthouse browser test unless it actually ran; Safari limitations remain labeled. Never claim Safari testing that didn't happen.
8. **Never use SSH.** If Safari/the configured remote runner is down: mark every DOM check `BLOCKED` with the reason, still run every curl check, and label raw-HTML (jsdom, JS off) results `PARTIAL (raw HTML)`.
9. **On a -32001 / timeout** from a the configured remote runner Safari run: run `check` on the run id before resending. At most one follow-up `ask`. Never re-submit blindly.
10. **Don't message anyone**, don't write to the configured remote runner memory plugins, don't file tickets. Output is files + the final report.
11. **Business intent beats a generic rule.** A deliberate trade gate (B2B pricing behind login, robots block on product pages of a trade-only store) is tagged `DECISION`, not FAIL. Never recommend exposing gated wholesale prices.

## Result vocabulary

The AgentReady spec's own wording: a requirement is **satisfied** or **not satisfied**; a site **conforms** when it satisfies every MUST (including MUST NOT) that applies; a stage is **moot** when it is unreachable; AR-ACT "applies only to products agents are expected to act on", and "a purely informational site conforms on AR-FIND-* and AR-READ-* alone".

| Scorecard value | Meaning |
|---|---|
| PASS | Satisfied |
| WARN | Partly satisfied / satisfied with a defect (SHOULD/MAY), or DECISION pending |
| FAIL | Not satisfied |
| BLOCKED | Could not be observed (tool down, gate) — give reason |
| N/A | Does not apply (spec scope, e.g. AR-ACT on an informational site) |
| MOOT | Stage unreachable because an earlier MUST failed |
| NOT RUN | Deliberately skipped by a hard rule (e.g. 429 testing) |

Site line: **Conforms** / **Does not conform** (list failing MUSTs).

## How to run

```bash
O=$ORIGIN; UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Safari/605.1.15"
fetch(){ curl -sS -m 25 -A "$UA" -D "$2.hdr" -o "$2.body" -w "%{http_code} %{content_type} %{size_download} %{redirect_url}\n" "$1"; }
```

Safari DOM probe (preferred): send one the configured remote runner `ask` that (a) opens a clean session with `safaridriver --mcp`, (b) navigates to each URL, waits for `document.readyState=="complete"` + 2 s, (c) runs `return <ar_probe.js>` (the IIFE in `ar_probe.js` in this playbook's helper folder, returns JSON), (d) saves a JSON array and replies with it. Then poll with `check <run_id>`. Else run `websmith-browser-agent-check` with the same probe intent. Raw-HTML fallback: run the same probe in jsdom against the curl HTML (`runScripts:'outside-only'`, stub `CSS.escape`, `getBoundingClientRect`, `innerText`).

Pages per site: home, store/category, one product, cart (GET only). Add docs/policy pages if the site has them.

---

# Part A — AgentReady v2.0 (spec order, spec IDs, spec levels)

Stages: **FIND** (can an agent find it), **READ** (can it understand it), **ACT** (can it do things). AR-READ-10 is retired. v1.0 IDs (AR-DISC/CONT/CAPA/IDEN/COMM) are retired; do not use them.

## FIND

### AR-FIND-01 — MUST NOT block agents (robots.txt and network layer)
- **Checks:** robots.txt does not disallow AI agents from the content they need; WAF/bot manager does not challenge or block agent UAs (throttle with 429, never a challenge page). Normative notes: prefer one `User-agent: *` rule; a named group overrides `*` for that bot.
- **Verify (curl):**
  ```bash
  curl -sS $O/robots.txt
  for ua in "GPTBot/1.2" "OAI-SearchBot/1.0" "ChatGPT-User/1.0" "ClaudeBot/1.0" "Claude-User/1.0" "Claude-SearchBot/1.0" "PerplexityBot/1.0" "Perplexity-User/1.0" "Google-Extended" "Googlebot/2.1" "CCBot/2.0" "Applebot/0.1" "Amazonbot/0.1" "curl/8.5" "python-requests/2.32"; do
    for u in $O$HOME_PATH $O$PDP; do curl -sS -m 20 -A "$ua" -o /tmp/b -D /tmp/h -w "$ua | %{http_code} %{size_download}" "$u"; echo " | cf-mitigated=$(grep -i cf-mitigated /tmp/h|tr -d '\r') challenge=$(grep -ciE 'cf-chl|challenge-platform|captcha|Just a moment' /tmp/b)"; done; done
  ```
  Evaluate robots with Google semantics (longest match wins, Allow wins ties; named group replaces `*`).
- **PASS:** every AI UA gets 200 with real content; robots allows home, catalog, product, docs, llms.txt, /.well-known/. **WARN:** many duplicate named groups (maintenance risk), or a deliberate block on gated paths tagged `DECISION`. **FAIL:** any AI UA gets 403/challenge/CAPTCHA, or robots disallows `/` (or catalog/product paths) for AI agents without a business reason.

### AR-FIND-02 — SHOULD: one canonical, current first-party docs page
- **Checks:** a single first-party page that tells an agent what the site/product is and how to use it (for stores: how to browse, buy, policies; for APIs: docs).
- **Verify:** curl the obvious candidates (`/docs`, `/help`, `/faq`, `/grok`, `/agents`, `/agents.md`, `/about`) and the targets of llms.txt; check `<link rel=canonical>` on it, that it returns 200 and has a recent date/version.
- **PASS:** one clear page, 200, canonical, linked from home. **WARN:** several overlapping pages, or no freshness signal. **FAIL:** none.

### AR-FIND-03 — SHOULD: sitemap.xml, referenced from robots.txt
- **Verify:** `grep -i '^sitemap:' robots.txt`; `curl $O/sitemap.xml` (and each index child); count `<loc>`; sample 20 locs for 200; check key pages (home, catalog, products) are present; check `<lastmod>`.
- **PASS:** referenced, valid XML, key pages present, locs 200. **WARN:** missing key pages, many non-200 locs, no lastmod. **FAIL:** none / not XML.

### AR-FIND-04 — MAY: AI catalog at /.well-known/ai-catalog.json
- **Verify:** `curl -i $O/.well-known/ai-catalog.json` (expect `application/ai-catalog+json` or JSON, `specVersion`, `host`, `entries[]` with `urn:air:<domain>:...` ids, `type`, one of `url`/`data`; each entry URL returns 200). Home: `<link rel="ai-catalog">` in raw HTML and `Link: <...>; rel="ai-catalog"` HTTP header.
- **PASS:** file valid, entries resolve, linked by both `<link>` and `Link:` header. **WARN:** file valid but not linked (or only one of the two). **FAIL:** present but invalid/broken entries. Absent = FAIL-at-MAY → report as `WARN (not offered, MAY)`.

## READ

### AR-READ-01 — MUST: answers are in the initial HTML
- **Checks:** product name, price (when public), availability, policies and key facts are in the server response, not only after JS.
- **Verify:** curl raw HTML; strip tags; grep for the h1/product name, price, availability text. Compare with Safari `innerText` (probe `visible.*`).
- **PASS:** key facts in raw HTML. **WARN:** some facts only post-JS. **FAIL:** raw HTML is an empty shell.

### AR-READ-02 — MUST: honest status codes
- **Checks:** missing paths → 404 (or a valid redirect to a real page); no soft-200 ("Not found" page with 200); rate limiting → 429 + Retry-After; no challenge page instead of 429.
- **Verify:** `for p in /no-such-$RANDOM $HOME_PATH/products/does-not-exist $HOME_PATH/categories/does-not-exist /.well-known/does-not-exist; do curl -sS -o /tmp/b -w "$p %{http_code} %{redirect_url}\n" $O$p; grep -o '<title>[^<]*' /tmp/b; done`. 429: NOT RUN.
- **PASS:** all 404 with an HTML body. **WARN:** redirect (307/302) of missing paths to a login/home page (gated sites: DECISION). **FAIL:** any 200 with a "not found" title/body (soft-200).

### AR-READ-03 — SHOULD: homepage raw HTML links to docs, product and pricing
- **Verify:** `grep -oE '<a [^>]*href="[^"]+"' home.html` — real `<a href>` (not JS buttons) to docs/help, catalog/products, pricing/policies.
- **PASS:** all three present as real links. **WARN:** one missing. **FAIL:** none.

### AR-READ-04 — SHOULD: docs pages answer the tasks
- **Checks:** the docs/FAQ/agent page answers the real agent tasks (what is sold, who can buy, where it ships, how ordering works, returns, contact; for APIs: auth, endpoints, errors).
- **Verify:** read the AR-FIND-02 page and llms.txt; tick each task. **PASS:** all answered. **WARN:** gaps. **FAIL:** no task answered.

### AR-READ-05 — SHOULD: fenced, language-tagged code
- **Applies when** the site publishes code/API examples. **Verify:** markdown twins/llms-full contain ```` ```lang ```` fences; HTML uses `<pre><code class="language-…">`. **N/A** for sites without code.

### AR-READ-06 — SHOULD: discovery files are linked
- **Verify:** home raw `<head>`: `<link rel="alternate" type="text/markdown">`, `<link ... href="/llms.txt">`, MCP card / ai-catalog links; footer or a "resources/for agents" section links them.
- **PASS:** head + footer links. **WARN:** head only or footer only. **FAIL:** files exist but nothing links them.

### AR-READ-07 — SHOULD: /llms.txt
- **Verify:** `curl -i $O/llms.txt` (200, text/plain or text/markdown, `# Title`, `> summary`, `## sections` with links); sample links 200; same for `/llms-full.txt`. Facts must match the site (see X-FACTS).
- **PASS:** valid, links 200, facts match. **WARN:** stale/broken links or fact drift. **FAIL:** 404.

### AR-READ-08 — SHOULD: JSON-LD on key pages (home above all); facts also visible
- **Verify (Safari probe `jsonld`):** blocks parse (`parseErrors==0`); home has Organization + WebSite (and Person for a portfolio); PDP has Product + Offer (price, priceCurrency, availability, sku, brand); `nameVisible` and `priceVisible` true.
- **PASS:** present, valid, matches visible text. **WARN:** missing on some key pages / missing fields. **FAIL:** none on home, parse errors, or JSON-LD contradicts visible text.

### AR-READ-09 — MAY: markdown mirror
- **Verify:** `<link rel="alternate" type="text/markdown" href>` in head and/or `Link:` header; `curl -H 'Accept: text/markdown' $O$HOME_PATH` → `Content-Type: text/markdown`; `.md` twin returns 200.
- **PASS:** linked twin + negotiation. **WARN:** one of the two. Absent → `WARN (not offered, MAY)`.

### AR-READ-10 — retired (do not score)

### AR-READ-11 — SHOULD: pricing on a first-party page
- **Verify:** price visible in raw HTML on PDP/pricing page and in JSON-LD Offer.
- **PASS:** public prices. **WARN / DECISION:** prices deliberately gated (trade/B2B) with the gate explained on a public page. **FAIL:** prices only on third-party sites or "contact us" without explanation.

## ACT (only for products agents are expected to act on; otherwise N/A)

### AR-ACT-01 — SHOULD: auth an agent can complete
- **Verify:** `curl -i $O/.well-known/oauth-authorization-server`, `/.well-known/openid-configuration`, `/.well-known/oauth-protected-resource` (RFC 8414 / OIDC / RFC 9728); self-serve API key page. If the MCP/API needs no auth, record "no auth needed" → PASS.
- **PASS:** no auth needed, or complete metadata + PKCE. **WARN:** auth exists but no metadata. **FAIL:** auth only via human login/CAPTCHA for an agent-facing API.

### AR-ACT-02 — SHOULD: OpenAPI description
- **Verify:** `/openapi.json`, `/.well-known/openapi.json`, `/api/openapi.json`, `Link: rel="service-desc"`. Validate it parses. **N/A** when the site has no HTTP API beyond MCP (say so).

### AR-ACT-03 — SHOULD: MCP server over Streamable HTTP
- **Verify (initialize + tools/list only):**
  ```bash
  H=(-H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-06-18')
  curl -sS -D init.hdr "${H[@]}" -X POST $O/mcp -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"agentready-audit","version":"1.0"}}}'
  SID=$(grep -i '^mcp-session-id' init.hdr|awk '{print $2}'|tr -d '\r')
  curl -sS "${H[@]}" ${SID:+-H "Mcp-Session-Id: $SID"} -X POST $O/mcp -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
  ```
  Also: OAuth protected-resource for /mcp if it needs auth; MCP Registry `server.json`.
- **PASS:** initialize 200 with serverInfo, tools/list returns tools. **WARN:** works but registry/server.json missing or protocol mismatch. **FAIL:** /mcp advertised but broken.

### AR-ACT-04 — MAY: MCP server card (SEP-2127)
- **Verify:** `/.well-known/mcp/server-card.json`, `/.well-known/mcp.json`: `name`/`serverInfo.name`, `version`, `remotes[]` (type streamable-http + url), **tools listed** and matching live `tools/list` (names, count).
- **PASS:** card valid and tool list matches live server. **WARN:** card has no tools array or drifts from live. Absent → `WARN (not offered, MAY)`.

### AR-ACT-05 — MAY: MCP Apps (`ui://` resources)
- **Verify:** `initialize` capabilities include `resources`, and tools/list `_meta` references `ui://`. Do not read resources that mutate. Absent → `WARN (not offered, MAY)` or N/A.

### AR-ACT-06 — SHOULD: SDKs and a CLI
- **Verify:** docs/llms.txt link an npm/pypi package or CLI. Stores without a developer API: N/A (state why).

### AR-ACT-07 — SHOULD: WebMCP on `document.modelContext`
- **Verify (Safari):** probe `webmcp`: `'modelContext' in document`, `navigator.modelContext`, registered tools, `<form toolname tooldescription>` count.
- **PASS:** tools registered or forms annotated. **FAIL:** none (note: Safari 27 may not expose the API; if `document.modelContext` is undefined *and* no declarative `toolname` forms exist, report FAIL with that note).

### AR-ACT-08 — MAY: agent payments
- **Verify:** `/.well-known/ucp`, `/.well-known/acp.json`, 402 responses with x402 headers on API routes (GET only), MPP `x-payment-info` in OpenAPI, Stripe Link / Shared Payment Token mentions; checkout entry (GET) has no CAPTCHA (probe `walls`).
- **PASS:** a protocol offered. **WARN:** none but checkout has no CAPTCHA. **FAIL:** CAPTCHA in checkout. N/A if not a store.

### AR-ACT-09 — MAY: NLWeb `/ask`
- **Verify:** `curl -i "$O/ask?query=test"` (GET). **PASS:** NLWeb JSON. Absent → `WARN (not offered, MAY)`.

### AR-ACT-10 — MUST (for products agents act on): an MCP server or a CLI
- **PASS:** AR-ACT-03 PASS or a CLI exists. **FAIL:** neither, for a site whose job is transactions. **N/A:** informational site.

---

# Part B — Beyond AgentReady (not in the spec)

| ID | Check | Verify | PASS / WARN / FAIL |
|---|---|---|---|
| X-A11Y-TREE | Lighthouse `agent-accessibility-tree` replica: every visible control has an accessible name; no div/span click handlers, `role=button` without tabindex, `a` without href / `href="#"` / `javascript:`; no `aria-hidden` subtree containing focusables; no invalid roles; no duplicate ids | Safari probe `names`, `fakeButtons`, `roleButtonNoTabindex`, `ariaHiddenFocusable`, `invalidRoles`, `dupIds` | PASS all zero · WARN ≤3 issues · FAIL unnamed controls >0 on buy path or fake buttons |
| X-LANDMARKS | One `main`, nav/header/footer, one h1, no heading-level skips | probe `landmarks`, `h1`, `headingSkips` | PASS · WARN multiple h1/skips · FAIL no main/h1 |
| X-HOOKS | Stable automation hooks (`data-testid` / `data-agent`) on buy-path controls | probe `hooks` | PASS buy path covered · WARN partial · FAIL none (polish) |
| X-CANONICAL | `<link rel=canonical>` absolute, self or correct, on every key page; old domains/twins 301 | raw head + `curl -I` twins | PASS · WARN missing on gated/login pages · FAIL wrong host |
| X-META-ROBOTS | No `noindex`/`nosnippet` on content; `X-Robots-Tag` header sane | probe `metaRobots`; `grep -i x-robots-tag *.hdr` | PASS · FAIL noindex on content |
| X-CONTENT-SIGNAL | `Content-Signal:` in robots.txt (search / ai-input / ai-train) | grep robots | PASS present · WARN absent |
| X-CLS | Lighthouse `cumulative-layout-shift` replica | probe `cls.supported`; Safari lacks `layout-shift` entries → BLOCKED in Safari | PASS <0.1 · WARN <0.25 · FAIL ≥0.25 |
| X-LLMS-LH | Lighthouse `llms-txt` replica | same as AR-READ-07 + valid markdown structure | see READ-07 |
| X-WEBMCP-SCHEMA | Lighthouse `webmcp-schema-validity` / `webmcp-registered-tools` / `webmcp-form-coverage`: each registered tool has name, description, valid JSON Schema; forms on buy path carry `toolname` | probe `webmcp` | PASS · WARN partial · FAIL none (if ACT applies) |
| X-IDENTITY | `/.well-known/identity.json`, `/.well-known/agent.json` / `agent-card.json` (A2A) present, valid, consistent with site | curl + JSON parse | PASS · WARN missing/legacy shape · N/A |
| X-MCP-ANNOT | Every MCP tool has `annotations` (readOnlyHint, destructiveHint, idempotentHint, openWorldHint) and `outputSchema`; read tools `readOnlyHint:true`; anything that creates carts/orders `readOnlyHint:false` | tools/list JSON | PASS 100% · WARN partial · FAIL 0% |
| X-FACTS | Same facts everywhere: name, price, availability, ordering status, shipping/age/state rules, COA status across HTML, JSON-LD, llms.txt, feeds, markdown twin, MCP card + tool descriptions | diff greps per fact | PASS · FAIL any contradiction (e.g. "ordering opens soon" on site but checkout tools in MCP) |
| X-ORDER-STATUS | Ordering state is explicit and machine-readable (open / closed / opens soon / gated) | grep site + llms + MCP | PASS · WARN only on one surface |
| X-CHECKOUT-FRICTION | Path to checkout entry (GET) without CAPTCHA, forced account for guest-capable stores, or dead-end modals; sold-out items cannot be added (no enabled sticky add-to-cart) | Safari GET of cart/checkout entry + probe `walls`, `visible.soldOut`, enabled add-to-cart buttons | PASS · WARN extra steps · FAIL CAPTCHA or add-to-cart on sold-out |
| X-PRICE-VIS | Prices visible to signed-out users, **except deliberate trade gates** (then: no wholesale price in HTML, RSC payload, llms, feeds, sitemap, MCP card/tools, markdown twins) | grep `\$[0-9]+\.[0-9]{2}` (ignore Next.js `$L1`-style refs) | PASS · DECISION gated · FAIL gated price leaked |
| X-REGULATED | Regulated-product wording present on all surfaces; no health claims; banned categories absent (site-specific, e.g. "no nicotine") | grep all surfaces | PASS · FAIL (BLOCKER) |
| X-FEEDS | Product feed(s) (`/products.json`, `/feeds/*.json`) agree with sitemap and HTML (count, handles, taxonomy, stock) | JSON diff | PASS · WARN drift |
| X-OG | Open Graph + twitter tags present, images on the site's own domain | raw head | PASS · WARN old-domain images |
| X-SECURITY-TXT | `/.well-known/security.txt` 200 with Contact + Expires | curl | PASS · WARN |
| X-404-BODY | 404 responses have an HTML body with content-type | curl | PASS · WARN empty body |
| X-PAGE-SIZE | Raw HTML of key pages < ~500 KB (agentready.md "page size") | `%{size_download}` | PASS · WARN |

# Part C — Beyond AgentReady: isitagentready.com parity

Cloudflare's scanner (isitagentready.com, docs at `/llms.txt` and `/llms-full.txt`). Read its docs; **never** call `POST /api/scan` or its MCP `scan_site` (public scan). Estimate locally with the checks below.

**Statuses:** pass / fail / neutral / unableToCheck. **Score** = passed ÷ scored checks × 100, over the 15 default scored checks (Discoverability 4, Content Accessibility 1, Bot Access Control 2, API/Auth/MCP & Skill Discovery 8); Commerce is shown separately as "Optional" and only scored when commerce signals are detected. Informational (never scored): Web Bot Auth, Personal Agent Protocol (Poppy). Opt-in (not in defaults): A2A Agent Card, AP2. [Reconstructed from its docs + front-end bundle; cross-checked: reproduces a known 40/100 = 6/15 result.]

**Levels (its names):** 0 Not Ready · 1 Basic Web Presence (2 of 3: robots.txt, sitemap, Link headers) · 2 Bot-Aware (L1 + AI bot rules AND Content Signals) · 3 Agent-Readable (L2 + markdown negotiation) · 4 Agent-Integrated (L3 + 1 of: MCP Server Card, A2A Agent Card, Agent Skills, API Catalog) · 5 Agent-Native (L4 + 2 of 3: Web Bot Auth, all four integration checks, auth metadata). Its own caveat: levels describe site types, not quality.

| isitagentready check (key) | Category | Its pass criterion | Our mapping | Local verify |
|---|---|---|---|---|
| robots.txt (`robotsTxt`) | Discoverability | 200 text/plain with ≥1 User-agent | AR-FIND-01 | curl robots |
| Sitemap (`sitemap`) | Discoverability | /sitemap.xml valid XML or Sitemap: in robots | AR-FIND-03 | curl |
| Link headers (`linkHeaders`) | Discoverability | Home `Link:` header with agent rels (service-desc, describedby, api-catalog, ...) — `preload` does not count | **IIA-LINK** (new; AR-FIND-04 / READ-09 mention Link) | `curl -sI $O$HOME_PATH \| grep -i '^link:'` |
| DNS-AID (`dnsAid`) | Discoverability | DNSSEC-validated SVCB/HTTPS under `_agents` | **IIA-DNSAID** (new) | `curl -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=_index._agents.$DOMAIN&type=SVCB&do=1"` (Status 0, AD true, Answer>0) |
| Markdown negotiation (`markdownNegotiation`) | Content | `Accept: text/markdown` on home → `Content-Type: text/markdown` | AR-READ-09 | `curl -sI -H 'Accept: text/markdown' $O/` (test the bare origin it scans and the locale root) |
| AI bot rules (`robotsTxtAiRules`) | Bot Access | named AI UAs or wildcard rules | AR-FIND-01 | robots |
| Content Signals (`contentSignals`) | Bot Access | `Content-Signal:` with ai-train/search/ai-input | X-CONTENT-SIGNAL | grep robots |
| Web Bot Auth (`webBotAuth`) | Bot Access (informational) | `/.well-known/http-message-signatures-directory` JWKS | **IIA-WBA** (new) | curl |
| MCP Server Card (`mcpServerCard`) | Discovery | `/.well-known/mcp/server-card.json`, `/.well-known/mcp/server-cards.json` or `/.well-known/mcp.json` with `serverInfo.name` or `name` | AR-ACT-04 | curl + JSON |
| A2A Agent Card (`a2aAgentCard`) | Discovery (opt-in) | `/.well-known/agent-card.json` with name, version, supportedInterfaces | X-IDENTITY | curl + JSON |
| Agent Skills (`agentSkills`) | Discovery | `/.well-known/agent-skills/index.json` (or legacy `/.well-known/skills/index.json`) with skills[] | **IIA-SKILLS** (new) | curl |
| WebMCP (`webMcp`) | Discovery | `document.modelContext.registerTool()` or `<form toolname tooldescription>` | AR-ACT-07 | Safari probe |
| API Catalog (`apiCatalog`) | Discovery | `/.well-known/api-catalog` application/linkset+json with linkset[] (RFC 9727) | **IIA-APICAT** (new; relates to AR-ACT-02) | curl |
| OAuth discovery (`oauthDiscovery`) | Discovery | openid-configuration or oauth-authorization-server | AR-ACT-01 | curl |
| OAuth Protected Resource (`oauthProtectedResource`) | Discovery | `/.well-known/oauth-protected-resource` with resource + authorization_servers | AR-ACT-01 / AR-ACT-03 | curl |
| Auth.md (`authMd`) | Discovery | `/auth.md` + PRM + `agent_auth` in AS metadata | **IIA-AUTHMD** (new) | curl |
| ARD (`ard`) | Discovery | ai-catalog.json manifest with specVersion + ≥1 valid entry | AR-FIND-04 | curl + JSON |
| Poppy (`personalAgentProtocol`) | Discovery (informational) | `/.well-known/poppy.json` | **IIA-POPPY** (new) | curl |
| x402 (`x402`) | Commerce | API routes return 402 with x402 headers | AR-ACT-08 | GET only |
| MPP (`mpp`) | Commerce | `/openapi.json` with `x-payment-info` | AR-ACT-08 / AR-ACT-02 | curl |
| UCP (`ucp`) | Commerce | `/.well-known/ucp` with protocol_version + services | AR-ACT-08 | curl |
| ACP (`acp`) | Commerce | `/.well-known/acp.json` with protocol, api_base_url, transports, capabilities.services | AR-ACT-08 | curl |
| AP2 (`ap2`) | Commerce (opt-in) | AP2 extension in A2A card | AR-ACT-08 | JSON |

New checks we add for parity (score them in Part B style): **IIA-LINK** (PASS agent-rel Link header on home; FAIL only preload), **IIA-DNSAID**, **IIA-WBA** (informational), **IIA-SKILLS**, **IIA-APICAT**, **IIA-AUTHMD**, **IIA-POPPY** (informational). For each: PASS = criterion met; FAIL = absent/invalid; N/A for commerce checks on non-commerce sites.

Note when scanning a locale site (e.g. `$O/us`): the scanner fetches well-known files from the origin, but markdown negotiation and Link headers from the URL given. Test both.

---

# Report format (REPORT.md)

1. **Header:** date/time (owner's timezone), sites, tools used (curl from box; Safari 27 via the approved Mac runner run id; jsdom raw fallback), what was NOT run and why.
2. **Per-site scorecard:** one table, rows = check IDs in Part A order then Part B then Part C, columns = sites, cells = PASS/WARN/FAIL/BLOCKED/N/A/MOOT/NOT RUN + one-line evidence pointer. Then a site line: Conforms / Does not conform (failing MUSTs).
3. **Plain-English summary per site** (3–5 sentences: what an agent can and can't do today).
4. **isitagentready ESTIMATED:** per site, category fractions, score, level + level name, labelled ESTIMATED, with the checks assumed pass/fail.
5. **Ranked fix list — NEW findings only:** BLOCKER / MAJOR / POLISH. Each item: site — Linear-ready title (imperative, <80 chars) — evidence path — `DECISION` tag where it's a business call.
6. **Fixed since last review:** item → evidence.
7. **Still open from last review** (one line each, not re-ranked).
8. **Blocked / not run:** what, why.
9. **Evidence index.**
10. **Ideas worth borrowing** (from other scanners/specs).



## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `websmith-browser-agent-check` → `../seo-autobot-agent-readiness/references/websmith-browser-agent-check.md`.
