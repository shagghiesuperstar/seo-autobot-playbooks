---
name: safari-27-mcp-optimization-autobot
description: "Use when optimizing, smoke-testing, or verifying e-commerce storefronts for Safari 27 safaridriver MCP: agent-legible DOM, pre-DNS bake-in, Pack A/B smoke, llms.txt and /.well-known, sterile-session proof."
metadata:
  version: "1.0.0"
  category: "agent-discoverability"
  collection: "extended"
  source_name: "safari-27-mcp-optimization"
  source_path: "agent-discoverability/safari-27-mcp-optimization/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

# Safari 27 MCP optimization & discovery

## When to Use
- Prove or re-run Safari 27 `safaridriver --mcp` smoke on preview/local (or <owner>-cleared browse-only production).
- Bake agent-forward discovery (`llms.txt`, `/.well-known`) and semantic DOM before DNS cutover.
- Rank defects for humans+agents (landmarks, PDP price/gate, cart, soft-404).
- Distinguish harness bugs from real storefront gaps.
- Never for Production DNS flips, live charges, merge, or brand/hero redesign without the operator's coordinator+<owner>.

## Hard locks
- Chain: <owner> → your orchestrator → the operator's coordinator → Safari 27 specialists.
- B2C domain SSOT: **one canonical host only**. Never a parked or alternate domain.
- B2B code: its own app folder only (e.g. `apps/<b2b-app>`).
- Browse-only unless sandbox payment explicitly authorized.
- Clean WebDriver session — no operator cookies/passwords/AutoFill.
- Prefer the operator's own ops-runner HTTP endpoint if one exists. Memory → the bot's configured memory store only 
- Label claims `[VERIFIED]` / `[INFERRED]` / `[UNKNOWN]`.

## Pack definitions
| Pack | Host | Path | Stop |
|------|------|------|------|
| **A** | <store> B2B preview/staging twin | home → category/PLP → PDP → cart → observe auth/gate | no payment |
| **B** | B2C **`<store>.example`** | same; allow one intentional shop redirect | hard stop before pay |

Pass = accessible text via `get_page_content` (markdown), not pretty screenshot alone.

## Steps

### 0) Limb health
1. Safari ≥ 27.0 on Mac (an approved Mac runner preferred for execution; your orchestrator = AR/merge).
2. Develop → **Allow remote automation and external agents** ON (required for `create_tab`).
3. Start `safaridriver --mcp`; list tools (~17). Record version + tool list to evidence path.
4. Fail loud if `create_tab` fails.

### 0a) MCP-wire smoke (driver-wired probe without a browser)
The `claude mcp add` smoke only proves the entry is registered; it does NOT prove the
gateway actually launched `safaridriver --mcp`. After any `config.yaml` MCP edit + a
gateway reload, run the JSON-RPC `initialize` handshake directly against the binary
before declaring the limb live:

```python
import json, subprocess, time, select
proc = subprocess.Popen(["/usr/bin/safaridriver","--mcp"],
                        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE)
proc.stdin.write((json.dumps({"jsonrpc":"2.0","id":1,"method":"initialize",
    "params":{"protocolVersion":"2024-11-05","capabilities":{},
              "clientInfo":{"name":"<host>","version":"0"}}})+"\n").encode())
proc.stdin.flush()
buf = b""
deadline = time.time() + 8
while time.time() < deadline:
    r,_,_ = select.select([proc.stdout],[],[],0.5)
    if r:
        chunk = proc.stdout.read1(4096) if hasattr(proc.stdout,"read1") else proc.stdout.read(4096)
        if not chunk: break
        buf += chunk
        if b"\n" in buf: break
proc.kill()
# Success = `{"id":1,"jsonrpc":"2.0","result":{"serverInfo":{"name":"Safari",...`
# on stdout, rc=None (still alive), stderr empty. Anything else = the MCP entry
# is in config but the driver did not start.
```

If the gateway's last_run log shows `removed=[] added=['safari']` after the config
edit AND the handshake above returns a `Safari` serverInfo, the limb is ready. If
only one of those two signals is true, the wiring is half-done — fix it before opening
the next smoke card.

### 1) Discovery bake-in (pre-DNS) — D1–D5
1. `llms.txt` (+ `/llms.txt`): shop purpose, key routes, agent constraints — 200 text.
2. `/.well-known/` stubs: `mcp` / `agent` / `llms` (or documented equiv) — 200, no soft-404.
3. Stable route map: home → PLP → PDP → cart → checkout entry (B2C) or Apply/Sign-in (B2B).
4. Apex is real storefront (or intentional 301 to shop) — **not** empty/parked lander.
5. robots/sitemap → indexable shop URLs with real titles.

### 2) Semantic / agent-legible DOM — H1–H8
1. Real `<nav>`, `<main>`, footer; real `<a>`/`<button>`.
2. Named primary CTAs in text (Shop/Catalog, Cart, Sign in / Apply).
3. **PDP contract:** title, price **or** spoken gate, variant state, primary CTA in accessible text.
4. Cart line items + totals (or empty state) in DOM text.
5. Auth/license/age/region gates spoken in DOM for anonymous session.
6. Trust/COA as labeled anchors when claims exist.
7. Errors / empty / OOS readable.
8. Prefer `role` + accessible name or durable `data-testid` on critical controls.

### 3) Architecture for sterile MCP — X1–X5
1. Critical facts SSR or progressive enhance — not client-only paint.
2. Root redirect intentional; final URL shoppable.
3. Anonymous PLP/PDP (B2C) **or** explicit trade gate copy (B2B).
4. No reliance on operator cookies.
5. If screenshot ≠ content, **content wins** for agent truth.

### 4) Run smoke
1. One host at a time. Screenshot + `get_page_content` each step.
2. Unwrap MCP JSON envelopes / double-encoded `evaluate_javascript` results before parsing links.
3. Navigate via real hrefs from content/JS; do not invent PDP URLs.
4. Stop on first BLOCKER; continue softs with notes.
5. Emit ranked defects: BLOCKER / MAJOR / POLISH — each with URL, step, repro, artifact path.

### 5) Verification gates — V1–V5
- V1 remote automation + `create_tab`
- V2 Pack A green including real PDP
- V3 Pack B on **<store>.example** browse-only
- V4 zero BLOCKER; MAJORs fixed or <owner>-accepted
- V5 live price/COA URLs still 200 on cutover build

### 6) Hand off for AR + security
- Code/store/money/login/customer-data PRs → your orchestrator AR + security (vuln/abuse) mandatory.
- Docs-only markdown/config → security waived; independent model review + your orchestrator merge still apply.
- Safari lane does **not** write exploit PoCs — report abuse surface + expected harden.

### 6a) Orchestrator fan-out for Pack A work (B2B preview)
The orchestrator (your orchestrator) does not implement Pack A. It writes three (or more) task cards that share one workspace dir, each with a non-overlapping file split, and gates downstream children on upstream completion. Use this recipe when <owner> says "do the discovery work" or any equivalent direct GO on the <store> B2B preview.

1. **Builder card (cc / Opus 5.5, goal_mode).** Body names TELOS, SPEC path, 3-8 DONE-MEANS checks, AUTONOMY with explicit real stops (e.g. "stop only if a build would touch Production"), and the pinned preview branch + tip SHA. Spec file is `SPEC.md` in the shared workspace. Engine pinned on the card so the worker profile default is irrelevant.
2. **Scout card (scout / minimax-M3)**, parallel to builder, with a distinct spec file (`SCOUT.md`) and a distinct deliverable file (`COMPETITIVE.md`). Comment the scout card: "write only COMPETITIVE.md; do not edit SPEC.md or create a worktree." Comment the builder card: "workspace is shared with scout; put your git worktree in `wt/` and do not delete SCOUT.md / SPEC.md / REVIEW.md / PHASE2.md / COMPETITIVE.md."
3. **AR + security review card (grok-4.7 / xai-oauth).** `parents=[<builder_id>]`, `gated_by` enforced. Spec file is `REVIEW.md` with frozen-SHA rule, per-DONE-MEANS PASS/FAIL, and the security section (price-leak, redirect, XSS, rate-limit, apps/storefront diff = 0). Reviewer = grok, Critic = gpt-6.1-sol via Codex, no GLM.
4. **Depth-layer card (cc / Opus 5.5).** `parents=[<ar_id>]`. Spec file is `PHASE2.md` with the depth-only checks (brands, FAQ, line sheet no-prices, state feeds, blog = 0 posts unless real ones exist). Do not start until the AR card closes.

Rule of thumb: every shared decision (schema, file format, names, deployed SHA, preview env) is decided ONCE by the orchestrator and stamped verbatim into each card body that depends on it. A later child that re-derives it loses a round.

### 6b) Card-custody for Pack A dispatching
- A card the orchestrator just created is `ready`, not `running`. Before any "we're in flight" / "grinding" / "almost done" line in chat, the orchestrator MUST quote the dispatcher-cron job's `last_run_at`, the card's `started_at` + `current_run_id`, or a fresh `ps -p <pid> -o pid,etime,stat` line in the same message.
- "Created" + a workspace path is not the same as "running"; the card-custody watchdog will surface the stall if no worker claims the card by the next 1-minute dispatcher tick. After ~10 minutes unclaimed, escalate in chat as a stall with the cron `last_status` and last error.
- Sibling runners share the same dispatcher lane. If a builder and scout card share a workspace, comment BOTH cards with the file boundary BEFORE the next dispatcher tick — otherwise one worker overwrites the other's spec or deliverable.

### 6c) Compliance pages and review gates
- State legality / compliance pages on Pack A ship as **PENDING COMPLIANCE REVIEW**, not as legal fact. The preview is a brand-and-discovery surface, not the publication of a regulatory opinion. Encode this in the SPEC.md so the builder writes the right copy; flag any change that quietly promotes a state page to authoritative status as a defect.
- Cart, checkout, and order endpoints stay behind sign-in on Pack A. Any review-time signed-out surface that resolves to a checkout step is a leak.

## Inputs / tools
- `safaridriver --mcp` tools (17, verified Safari 27.0.1): browser_console_messages, browser_dialogs, close_tab, create_tab, evaluate_javascript, get_network_request, get_page_content, list_network_requests, list_tabs, navigate_to_url, page_info, page_interactions (click/type/scroll/hover/keyPress), screenshot, set_emulated_media, set_viewport_size, switch_tab, wait_for_navigation. There is NO `click`/`type`/`navigate` tool.
- Start every smoke run with GET `/version`; anything but our deploy-stamp JSON voids the run (wrong-host guard).
- Live baseline + plan: keep your own dated `references/current-truth-<YYYYMMDD>.md` (live probe of llms.txt, well-known, robots, sitemap, `/version` per host) next to this file; it is site-specific and not shipped in this library. Re-probe before trusting it.
- Evidence: `/workspace/safari27-g39/evidence/` (or the operator's coordinator-named drop)
- Optional harness: `<local workspace>`
- Fleet: the operator's host coordinator for limb health; the operator's coordinator for priority; your orchestrator for AR/merge

## Unique Safari 27 skills (what this owner adds)
1. **Sterile-session truth** — prove what a cookieless Apple WebDriver agent actually sees.
2. **PDP/gate contract** — price vs spoken wholesale/license gate; never assume Chromium DevTools Behavior.
3. **Harness vs site triage** — double-encoded JS / JSON envelope unwrap so we don’t false-fail Catalog.
4. **Pre-DNS MCP bake-in** — D/H/X/V checklist so first indexer cache isn’t a lander.
5. **Domain hygiene** — <store>.example SSOT; void bad-host runs loudly.
6. **Ranked defect currency** — blocker/major/polish with repro for Eng + AR, not theory walls.
7. **Limb routing** — execute on an approved Mac runner; protect your orchestrator for AR/merge only.

## Pitfalls
- Running Pack B on any host other than <store>.example.
- Treating screenshots as pass when markdown title/content empty.
- Skipping remote-automation toggle then declaring MCP broken.
- Burning your orchestrator model budget on smoke.
- Redesigning brand/hero without the operator's coordinator+<owner>.
- Writing durable facts anywhere but the bot's configured memory store.
- Shipping discovery stubs that soft-404 or open-redirect.
- Calling a just-created task card "running" or "in flight" without a verified PID + dispatcher-cron `last_run_at` in the same message — the card-custody watchdog exists because "ready" silently sits for >10 min after creation when no worker claims it.
- Letting two sibling cards share one workspace without a per-card file-boundary comment BEFORE the next dispatcher tick — the second worker claims the lane and overwrites the first worker's spec or deliverable before it can be read.
- Promoting a state legality page from "PENDING COMPLIANCE REVIEW" copy to authoritative status on a preview build — the preview is a discovery surface, not a regulatory publication; a quiet promotion reads as a legal fact to downstream consumers.

## Verification
- `create_tab` succeeds; tool list recorded.
- Pack A A0–A5 PASS with PDP artifact.
- Pack B B0–B3 PASS on <store>.example; B4 hard-stop no pay.
- Ranked defects file updated; Retain the outcome in the bot's configured memory store.
- the operator's coordinator can sign V4/V5 without UNKNOWN host confusion.
- For orchestrator-dispatched builds (6a): one builder card, one scout card, one AR+security card parent-gated on builder, one depth card parent-gated on AR; each card body carries TELOS / DONE-MEANS / engine override; workspace file split is in the SPEC / REVIEW / PHASE2 / COMPETITIVE files, not in chat.

> **Template guardrail (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT):** never submit, publish, post, send outreach, open or complete a checkout, pay, merge, deploy, or change DNS/firewall/feeds without an explicit yes from the operator for that specific action. Any price, promo code, plan, or tool list in this skill is vendor-supplied and dated; re-fetch it live before quoting, and never quote a number without live data.


## Safari 27 portable operating recipes (union, 2026-11-18)

The longer Pack A/B procedure above stays primary. These six compact procedures add the clean-session, evidence, accessibility, production/staging comparison, and weekly-diff constraints. They are aliases into this one playbook, not six duplicate tasks. Browser actions remain browse-only. A named control is checked without clicking a mutating control; adding to cart requires separate explicit approval and is never part of the Websmith audit.

### Source recipe: safari-27-field-lessons


# Safari 27 MCP field lessons

Practical lessons for agent-testing sites with Safari 27 `safaridriver --mcp`.

- Start every run with a clean session; close it at the end. Stale sessions give wrong results.
- Wait for `document.readyState == "complete"` plus about 2 s before reading the DOM; client-rendered pages often hydrate late.
- Read the accessibility tree / visible text, not only raw HTML. Things that exist in HTML but are hidden, unlabeled, or behind hover are invisible to agents.
- Icon-only buttons (cart, search, menu, close) without an accessible name are the most common agent blocker. Record them.
- Cookie banners, age gates, and pop-ups can cover the page. Note them; dismiss only with a clearly non-committal control (e.g. "Close"), never "Accept all" on the owner's behalf unless they said so.
- Infinite scroll and "load more" hide products from agents; check that a crawlable paginated path exists.
- On timeout (-32001 or similar): check the existing run before resending. At most one retry. Never re-submit blindly.
- Never type into login, payment, or account forms. Browse-only.
- Always label which engine produced a result (Safari 27 MCP, other browser, raw HTML). Never claim Safari testing that did not happen.
- Save screenshots or JSON output into the evidence folder; every finding must point to a file.


### Source recipe: safari-27-mcp-optimization


# Make a site agent-legible for Safari 27 MCP

Recipe for recommending (not applying) changes so agents driving Safari via `safaridriver --mcp` can use the site. The bot proposes fixes; the owner's team applies them.

1. Semantic structure: one `h1`, logical headings, `main`/`nav`/`header`/`footer` landmarks.
2. Every interactive control has an accessible name (visible label, `aria-label`, or `aria-labelledby`). Prioritise search, add-to-cart, quantity, variant pickers, cart, checkout entry, menu.
3. Use real `<button>` and `<a href>` elements, not clickable `div`s. Links must have real URLs.
4. Forms: `<label for>` on inputs, correct `type`/`autocomplete`, visible error text.
5. Product facts in text and JSON-LD (`Product`, `Offer` with price, currency, availability); `BreadcrumbList`; `Organization`/`WebSite` with `SearchAction`.
6. Stable, human-readable URLs for search results, categories, product pages, and cart.
7. Avoid content that only appears on hover, in canvas, or after infinite scroll.
8. Keep overlays dismissible with a labelled close button; do not trap focus.
9. Expose machine-readable entry points: `robots.txt`, `sitemap.xml`, `llms.txt`, and (if offered) an MCP/agent manifest as described in AgentReady.
10. Re-verify each change with the agentready-safari-checks probe and record before/after evidence.
No visual change for humans except additive accessibility fixes.


### Source recipe: safari-mcp-ecomm-smoke


# Safari MCP e-commerce smoke (browse-only)

A short end-to-end check that an agent can shop, without buying.

URLs come from the current site's recorded context: home, a search query, a product page (PDP), cart.
Steps in Safari 27 `safaridriver --mcp` (else another engine, labelled):
1. Home: loads, has `h1`, nav and search are named and reachable.
2. Search: submit a search via a GET URL or the named search box; results list products with names, prices, and links.
3. PDP: name, price, availability, variant controls named; JSON-LD Product/Offer present and matching visible price.
4. Add to cart only if it is a harmless client-side action the owner has allowed; otherwise just confirm the add-to-cart control is named and enabled.
5. Cart: open the cart URL with GET; line items and totals readable.
STOP before checkout submission. Never log in, enter payment, place orders, or sign up.
Record PASS/WARN/FAIL/BLOCKED per step with evidence files. Report in plain language: "An agent can / cannot do X today because Y."


### Source recipe: safari-mcp-evidence-gate


# Evidence gate (fail loud)

Every run writes to `evidence/<check>-<YYYY-MM-DD>/` with `curl/`, `safari/` (or `browser/`), `mcp/`, and `REPORT.md`.

Rules:
- No result without a file. Each scorecard cell cites its evidence path.
- Unknown is BLOCKED or NOT RUN with a reason, never PASS. Inferences are labelled [INFERRED].
- Record the engine, time (owner's timezone), and URLs tested in the report header.
- If a tool errors or times out, record the error text and stop that check; do not paper over it.
- Before sending a report, check that every cited file exists and is non-empty. If any is missing, fix it or downgrade the result.
- Never store secrets, cookies, or tokens in evidence.


### Source recipe: safari-mcp-pre-dns-bake-in


# Agent layer bake-in before DNS cutover

Use when a new site is about to replace an old one at the same domain.

1. Ask the owner for the staging/preview URL and the cutover date. Do not touch DNS.
2. Run agentready-safari-checks and the ecomm smoke against staging. Note any staging-only gates (password, noindex) as expected.
3. Compare with the current production site: robots.txt, sitemap, llms.txt, structured data, canonical URLs, redirects for old URLs, agent/MCP manifests. List anything that would regress at cutover.
4. Produce a go/no-go checklist: BLOCKERs that must be fixed before cutover, items to flip at cutover (remove noindex, swap canonical host, update sitemap host), and post-cutover checks.
5. After the owner confirms cutover, rerun the full checks on production within 24 h and report differences.
Read-only throughout. Never change DNS, deploy, or merge.


### Source recipe: safari-mcp-sustain


# Weekly sustain checks

Keep a site agent-ready over time.

1. Load the current site's production URLs and last report from its context/evidence.
2. Run the curl checks from agentready-safari-checks and the browse-only ecomm smoke (Safari 27 MCP if available).
3. Diff against the last run: new FAILs, fixes, still-open items. Watch for silent regressions: robots changes, sitemap 404s, lost JSON-LD, unnamed buttons after a redesign, new pop-ups.
4. Report briefly in plain language: what changed, what broke, what to fix first. If nothing changed, say so in one line.
5. If a check cannot run (host down), say so loudly; never report green on missing data.


### Dated research reference
Read `references/safari-27-mcp-tool-surface.md` under this playbook's helper folder for the original 17-tool surface, clean-room/WebKit vs Chromium comparison, and agent-legibility contract. It is a dated reference, not proof of today's version.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `agentready-safari-checks` → `../seo-autobot-agent-readiness/references/agentready-safari-checks.md`.
- `safari-27-field-lessons` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `safari-27-mcp-optimization` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `safari-mcp-ecomm-smoke` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `safari-mcp-evidence-gate` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `safari-mcp-pre-dns-bake-in` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `safari-mcp-sustain` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
