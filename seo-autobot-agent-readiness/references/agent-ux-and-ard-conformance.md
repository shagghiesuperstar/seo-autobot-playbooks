---
name: agent-ux-and-ard-conformance
description: "Use when browsing agents must complete a task on the site or when the Lighthouse agentic browsing audits are in scope."
metadata:
  version: "1.0.0"
  category: "agent-discoverability"
  collection: "extended"
  source_name: "Agent UX and ARD conformance"
  source_path: "agent-discoverability/agent-ux-and-ard-conformance/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Agent UX and ARD conformance
description: >-
  Use when browsing agents must complete a task on the site or when the Lighthouse agentic browsing audits are in scope: check the page as an agent sees it (screenshot, DOM, accessibility tree), fix the interaction blockers, and bring the ard.json manifest to conformance.
```

Inputs: the site and repo, the two or three tasks that matter (find and compare, add to cart, book, submit a lead form), the existing `/.well-known/` files, and a Lighthouse run with the agentic browsing category when available.

Rule: an agent reads three views of the page and acts on what they agree on. Where the screenshot, the DOM, and the accessibility tree disagree, the task fails. Fix the disagreement, then publish the manifest, then run the same instrument again.

This skill adds the interaction and manifest-conformance layer. The files, structured data, endpoint, and edge access remain with ai-discoverability-max-autobot and are not repeated here.

## Step 1: Walk each task in all three views

For every step of each task record the control, its role and accessible name in the accessibility tree, whether it is a real `<a href>` or `<button>`, and whether it is visible and unobstructed in a screenshot. Browse only: no purchase, signup, or form submission.

## Step 2: Fix the blockers Google's guidance names

From web.dev's guide to agent-friendly sites (last updated 2026-04-01):

- No ghost elements. A transparent overlay over a control can cause the agent's visual pass to discard the node beneath it. Cookie layers, click-catchers, and invisible full-page links are the usual cause.
- Semantic controls. `<button>` and `<a>`, not styled `<div>` or `<span>`. Where that is impossible, add the right `role` and `tabindex`.
- Labels bound to inputs with `for`, so the field's purpose travels with it.
- `cursor: pointer` on actionable elements; it is read as a signal of actionability.
- Every control needed for the task is visible and larger than 8 square pixels.
- Stable layout. The same action sits in the same place across templates; an add-to-cart button that moves by category confuses screenshot-driven agents.
- WebMCP tools for explicit tasks, feature-detected, with a confirmation step on sensitive actions. The API is a proposal in active development and under origin trial in Chrome; ship it as an enhancement, never as the only path.

Everything here is also an accessibility improvement. Nothing may change the visual design beyond that.

## Step 3: Bring ard.json to conformance

Lighthouse's Agentic Resource Discovery audit (Lighthouse 13.5, documentation updated 2026-10-20, validating against ARD v0.91) looks for the manifest in this order: an `Agentmap:` directive in robots.txt, a `<link rel="ard">` in the HTML, an HTTP `Link` header with `rel="ard"`, then `/.well-known/ard.json`. The legacy `ai-catalog` locations are still read but raise a warning.

Errors, which fail the audit:

- Invalid JSON or a schema mismatch; no `entries` array.
- An entry missing `identifier`, `displayName`, or `type`.
- An `identifier` not in the form `urn:air:<publisher>:<namespace>:<name>`.
- An entry with both `url` and inline `data`, or neither.
- A `trustManifest` that is not an object with an `identity` property.
- A manifest advertised in robots.txt, a link tag, or a header that cannot be loaded.

Warnings, which cap the score at 0.9:

- Missing `representativeQueries`: each entry should carry 2 to 5 sample queries. Registries build their search index from these, so an entry without them does not appear in registry search.
- A deprecated `type`, for example `application/mcp-server+json`, which is now `application/mcp-server-card+json`.
- A top-level `collections` field, which is no longer part of the spec.
- A manifest found only at a legacy location, or any advertised location that fails while another works.

Lighthouse validates the manifest only. It does not fetch the artifact an entry points to, so a passing audit does not prove the MCP server card or endpoint works; the existing probes still have to run. The category is experimental and the spec is moving; record the Lighthouse and spec versions with every score.

Write `representativeQueries` from the question map: the real things a buyer would ask an agent that this resource can answer. Generate the manifest from the same source as the server card and the endpoint's tool list so the three cannot drift.

`scripts/ard_check.py <base-url-or-file>` runs the manifest checks on a saved file without a browser.

## Step 4: Rerun and report

Run the task walk and the manifest check again on production. Report each task as completed, blocked at step N, or not tested, and each manifest finding as closed or open.

## Output

The fix PR, the report with before and after, the versions of every instrument used, and the list of anything not testable without an account.

Never complete a purchase, create an account, or submit a form during a walk. Never declare a tool, transport, or capability the site does not run. Never call the site agent-ready on a manifest score alone.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `ai-discoverability-max-autobot`: Read `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot.md` (skill `seo-autobot-agent-readiness`).
