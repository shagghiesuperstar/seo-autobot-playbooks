---
name: websmith-browser-agent-check
description: Use when an audit needs to see the site the way a browser-driving AI agent does, covering rendered content vs raw HTML, the browse-to-cart path, gates, accessibility, and WebMCP. Prefers Safari 27's built-in MCP server (safaridriver --mcp) on a Mac, and falls back to another real browser with the engine clearly labeled. Browse-only.
---

# Websmith browser-agent check (Safari 27 first)

Feeds WS-READ-01 (rendered comparison), WS-ACT-07 (WebMCP), WS-COM-06/08/09, and WS-A11Y-01..13 in `CHECKLIST.md`.

## Hard locks

- **Browse-only.** No login, no form submits, no add-to-cart POST unless it's a plain link/GET, no checkout past the entry page, no payment, no coupon tries. Stop at the checkout entry or the sign-in/apply gate.
- **Clean session every run:** a fresh automation window with no saved cookies, passwords, AutoFill, or previous age/region choices. A saved choice hides what a first-time agent sees.
- **Content beats screenshots.** A pass means the facts are in the accessible text (`get_page_content`). If the screenshot and the text disagree, the text wins.
- **Navigate by real hrefs** taken from the page. Never invent product URLs.
- **Fail loud.** If the browser or MCP won't start, mark the browser checks UNTESTED with the error. Never say Safari was tested when it wasn't. Never claim the run got past a bot wall (Cloudflare, CAPTCHA) unless it actually did, and never try to defeat one.
- **Production only** unless the owner names a preview. Label every preview finding PREVIEW in its first line.

## Engine choice

1. **Safari 27+ on the owner's Mac (preferred).** It needs a connected Mac and the owner's OK to run it. Setup (from WebKit's announcement):
   - Safari → Settings → Advanced → show Develop features. Then Develop → **Allow remote automation** and allow external agents.
   - Register the server with the agent client. For example: `claude mcp add safari-mcp -- "/usr/bin/safaridriver" --mcp`. For Safari Technology Preview, use `/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver`.
   - Expect about 17 tools: `create_tab, list_tabs, switch_tab, close_tab, navigate_to_url, wait_for_navigation, get_page_content, page_info, page_interactions, screenshot, evaluate_javascript, browser_console_messages, browser_dialogs, list_network_requests, get_network_request, set_viewport_size, set_emulated_media`. Record the Safari version and the tool list. If `create_tab` fails, remote automation is off: stop and tell the owner.
   - Privacy note for owners: the server runs locally and doesn't use AutoFill or personal info. Page data goes to the agent you connected, not to Apple.
2. **Fallback:** any real browser the bot can drive (e.g. a Chrome DevTools MCP or the bot's own desktop browser). Label the results `ENGINE: Chromium (not Safari)`. Safari-specific checks become UNTESTED.

## Path (one host at a time)

home → category/listing → 1 to 3 product or service pages → cart (view only) → checkout entry or sign-in/apply gate. **STOP. Never pay.**

At each step: `navigate_to_url` → `wait_for_navigation` → wait for the page to settle (nav/cart labels can flash "0" or blank early) → `get_page_content` + `screenshot` + `page_info` → `browser_console_messages` → `list_network_requests` (note any 4xx/5xx on assets, images, or price APIs). Save everything in `websmith/runs/<domain>/<run>/browser/`. Unwrap double-encoded MCP JSON before parsing links.

## What to check

**Discovery (D):** the root is a real site, not parked or blank. Nav links lead to real listing/product pages. Sitemap/robots/llms.txt URLs match the production domain.

**Agent-legible page (H):**
- H1 landmarks: `header`, `nav`, `main`, `footer`, one `h1`.
- H2 named controls: buttons/links have accessible names, with no icon-only "button".
- H3 product page contract: name, price (or a plainly worded gate like "Trade pricing: sign in"), variant choice, availability, primary action.
- H4 cart totals as text.
- H5 gates in words: age/region/login/licence rules explained in text, not only a modal image.
- H6 trust links: shipping, returns, contact, and required documents (e.g. lab reports) labeled and returning 200.
- H7 errors, empty states, and out-of-stock in readable words.
- H8 stable names/IDs on key controls.

**Architecture (X):**
- X1 key facts are in raw HTML (compare to `curl` output) or arrive by progressive enhancement.
- X2 redirects are intentional and land on shoppable pages.
- X3 anonymous browsing works, or the gate is explained.
- X4 nothing depends on a cookie the agent wouldn't have.
- X5 content matches the screenshot.

**Accessibility quick pass (WCAG 2.2 AA subset):** `set_viewport_size` 390×844 and 1280×800. `set_emulated_media` with `prefers-reduced-motion: reduce` and `prefers-color-scheme: dark`. Keyboard-reachable main actions (use `page_interactions`). Focus not hidden by sticky bars (2.4.11). Targets at least 24×24 CSS px (2.5.8). Image alt text. Form labels (read only, don't submit). Accessible authentication (3.3.8) noted at the gate.

**WebMCP (ACT-07):** `evaluate_javascript`: `JSON.stringify({doc: !!(document.modelContext), nav: !!(navigator.modelContext)})`. Report what's there. The API is a moving draft.

**Defensive security notes (report only, no exploit code):** soft-404 or parked root, open redirects in nav/cart links, injected script/HTML visible in titles or prices, a gate that's bypassable by direct URL in a clean session, mixed content, console errors leaking stack traces or keys (never copy a key).

## Output

Ranked defects: BLOCKER / MAJOR / POLISH, each with URL, step, what the agent saw vs expected, and the artifact file. Then the mapped CHECKLIST IDs with PASS/FAIL/WARN/UNTESTED, merged into the run's `results.json`.

## Done gate (V)

The browser part is done only when the engine and version are recorded, the path reached at least one real product/service page, every step has saved content + screenshot, and there are zero unexplained UNTESTED steps.
