# Safari 27 MCP: tool surface, limits vs Chromium, and agent-legibility (research brief)

**Read:** 2026-09-22 (re-read the sources live before quoting; Safari 27.0.1 later listed 17 tools, see `safari-27-mcp-optimization-autobot`). Source: the Safari 27 bot's research brief, private implications removed.

**Sources**
- WebKit (2026-07-01): [Introducing the Safari MCP server](https://webkit.org/blog/18136/introducing-the-safari-mcp-server-for-web-developers/)
- Apple Developer: [Connecting an AI agent to Safari](https://developer.apple.com/documentation/safari-developer-tools/connecting-an-ai-agent-to-safari)
- Independent compare (Achiya, 2026-07): clean-room WebDriver vs logged-in Safari tools

---

## 1) Tool surface (17 — Apple / WebKit)

| Tool | Role |
| --- | --- |
| `create_tab` / `list_tabs` / `switch_tab` / `close_tab` | Tab lifecycle |
| `navigate_to_url` / `wait_for_navigation` / `page_info` | Load + URL/title/state |
| `get_page_content` | Page text as markdown / HTML / JSON |
| `screenshot` | PNG evidence |
| `evaluate_javascript` | In-page JS (perf, a11y probes, queries) |
| `page_interactions` | click, type, scroll, hover, keyPress (sequenced) |
| `list_network_requests` / `get_network_request` | Network inspect (read) |
| `browser_console_messages` | Console buffer |
| `browser_dialogs` | alert / confirm / prompt |
| `set_viewport_size` / `set_emulated_media` | Viewport + media emulation |

**Enable:** Safari ≥27 beta (or STP 247+) → Settings → Advanced → Show features for web developers → Developer → **Allow remote automation and external agents**. Launch: `/usr/bin/safaridriver --mcp` (or STP bundle `…/safaridriver --mcp`). Local only; data goes to the connected agent, not Apple.

---

## 2) Limits vs Chromium automation

| Axis | Safari 27 `safaridriver --mcp` | Typical Chromium (Playwright / CDP / Chrome DevTools MCP) |
| --- | --- | --- |
| Engine | **WebKit** (real Safari layout/CSS) | Blink |
| Session | **Isolated** automation window — **no** cookies, AutoFill, passwords, existing tabs | Often persistent profile / CDP attach possible |
| Tool depth | ~17 DevTools-shaped tools | Usually deeper (trace, coverage, request intercept, multi-context) |
| Network | List + get detail (**read**); no official mock/throttle in this set | Intercept / mock / throttle common |
| Auth flows | Must re-auth inside sterile session (or stay anonymous) | Can reuse logged-in profile (when allowed) |
| Where it runs | A **Mac** only (local or a remote Mac runner); not a hosted connector | Often available on Linux CI + agent boxes |
| Best for | Repro smoke, Safari-compat, agent-legible DOM checks | Cross-browser CI, logged-in ops, heavy network control |

**Implication:** Safari MCP is the WebKit truth lane for preview/local smoke. It will not replace Chromium for authenticated admin or cookie-bound checks. A Linux agent box cannot run `safaridriver`; it needs a Mac.

---

## 3) Ecommerce agent-legibility (humans first, agents second)

Agents succeed when facts survive `get_page_content` + roles/names — not when a human can “see” a canvas.

1. **Landmarks & controls** — real `<nav>`, `<main>`, `<button>`, `<a>`; avoid click-only `div`s.
2. **PDP contract** — title, price, variant state, primary CTA in accessible text; variant changes update readable state.
3. **Cart** — line items + totals in DOM text (not image-only).
4. **Trust / COA** — normal anchors with clear labels (e.g. “Certificate of Analysis”).
5. **Errors / empty / gates** — license walls, OOS, validation copy readable without guessing.
6. **Stable hooks** — `role` + accessible name, or durable `data-testid`; avoid brittle CSS-only chains.
7. **Evidence loop** — `screenshot` for visuals; `evaluate_javascript` for a11y/perf probes; rank defects with repro steps.

Hard stops: no Production deploys, DNS, ESP, or live charges. Browse-only unless sandbox payment is explicitly authorized.
