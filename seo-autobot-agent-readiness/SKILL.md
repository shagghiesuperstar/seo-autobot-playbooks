---
name: seo-autobot-agent-readiness
description: "Use when making a site or store findable, readable, and usable by AI agents. Two modes: AUDIT (read-only AgentReady v2.0 scorecard + 129 Websmith checks + MCP review + browser-agent check, via websmith-audit-runner) and BUILD (implementation playbooks: discoverability standard and ARI-100 kit, Safari 27 MCP, wholesale, ARD, feed parity; Read references/<slug>.md) that ship fixes as a PR, then re-check."
metadata:
  version: "1.1.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# Agent readiness and agentic commerce: discoverability standard, ARI-100 kit, Safari 27, wholesale, ARD, feed parity

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT.

## Two modes: audit first, then build

| Mode | Runs | Writes | Entry |
|---|---|---|---|
| **AUDIT** (read-only, the Agent Websmith method) | `websmith-audit-runner` → `agentready-safari-checks` (AgentReady v2.0 scorecard first) → `websmith-checklist` 129 checks incl. `websmith-crawl-index-sweep` → `websmith-mcp-review` (if MCP) → `websmith-browser-agent-check` → `websmith-report-writer` → `websmith-fix-pack` (drafts) | Only evidence, report, and draft files under `websmith/runs/<domain>/<run>/`. Never the site, never the repo. | W9 step 1, R19 to R22, RT16 |
| **BUILD** (the playbooks below) | the playbook that fits the failing checks | One reviewable PR after an explicit yes, never auto-merged; no DNS, edge, robots, AI-setting, or feed change without its own yes | W9 step 4, R10, R14 |

Then W9 step 5: re-run the audit in re-check mode on production and show before → after.

Audit-mode rules (full list in `getting-started-seo-autobot` section 9): GET and HEAD only, at most 1 request per second per host, MCP `initialize` and list calls only, no logins, purchases, or form submits, no outside scan without a per-domain yes (AgentPass is the only one recommended), deliberate owner choices are EXCEPTION never FAIL, UNTESTED is never a guessed PASS, and no Safari pass is claimed unless it ran.

Which instrument when: the AgentReady scorecard and the 129 checks are the audit of record and the re-check. The local ARI-100 scanner (`ai-discoverability-max-autobot`, `node scripts/agentkit/cli.mjs`) is a build-mode before/after instrument: it sends parallel requests (one per crawler identity) and an MCP `initialize`, so run it only on the operator's own site after a yes, and never inside the rate-limited audit. An AgentPass report the operator pastes in is shown in its own box beside the audit, never merged into it.

## Playbook index (audit and build)

This skill holds 15 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `ai-discoverability-max-autobot` | same method; slug suffixed -autobot | `references/ai-discoverability-max-autobot.md` | Use when asked for AEO/GEO/SEO/AIO, Safari 27, or MCP optimization on any site: the superset agent-readiness standard with the ARI-100 scan, kit, preview, and probe scripts. Helper files: `references/ai-discoverability-max-autobot/`. |
| `agent-discoverability-max` | agent-discoverability-max | `references/agent-discoverability-max.md` | Use when any website card, spec, review, or release needs the max AI-agent discoverability checklist stamped in; it is the checklist behind ecomm-ai-discoverability. |
| `ecomm-ai-discoverability` | ecomm-ai-discoverability | `references/ecomm-ai-discoverability.md` | Use when asked for AEO/GEO/SEO/AIO/Safari/MCP on an e-commerce store: dedupe against existing work first, run the live scorecard, and write one fix card per site against the shared standard. |
| `safari-27-mcp-optimization-autobot` | same method; slug suffixed -autobot | `references/safari-27-mcp-optimization-autobot.md` | Use when optimizing, smoke-testing, or verifying e-commerce storefronts for Safari 27 safaridriver MCP: agent-legible DOM, pre-DNS bake-in, Pack A/B smoke, llms.txt and /.well-known, sterile-session proof. Helper files: `references/safari-27-mcp-optimization-autobot/`. |
| `wholesale-agent-discoverable` | wholesale-agent-discoverable | `references/wholesale-agent-discoverable.md` | Use when humans are gated but agents see the full catalog. Helper files: `references/wholesale-agent-discoverable/`. |
| `agent-ux-and-ard-conformance` | Agent UX and ARD conformance | `references/agent-ux-and-ard-conformance.md` | Use when browsing agents must complete a task on the site or when the Lighthouse agentic browsing audits are in scope. Helper files: `references/agent-ux-and-ard-conformance/`. |
| `agentic-commerce-feed-parity` | Agentic commerce feed parity | `references/agentic-commerce-feed-parity.md` | Use when a store wants its products shown or bought inside ChatGPT, AI Mode, or Gemini: check that the product feed, the page's structured data, and the visible page agree on every offer fact, and prepare the feed and protocol steps for approval. |
| `websmith-audit-runner` | websmith-audit-runner | `references/websmith-audit-runner.md` | Use when the owner asks to check, audit, score, or re-check how ready their website is for AI agents (ChatGPT, Claude, Perplexity, Google AI, browser agents), or after fixes ship and need verifying. Runs the AgentReady v2.0 scorecard (agentready-safari-checks) plus the read-only Websmith check catalog and saves evidence. |
| `websmith-browser-agent-check` | websmith-browser-agent-check | `references/websmith-browser-agent-check.md` | Use when an audit needs to see the site the way a browser-driving AI agent does, covering rendered content vs raw HTML, the browse-to-cart path, gates, accessibility, and WebMCP. Prefers Safari 27's built-in MCP server (safaridriver --mcp) on a Mac, and falls back to another real browser with the engine clearly labeled. Browse-only. |
| `websmith-checklist` | websmith-checklist | `references/websmith-checklist.md` | Use this when running, scoring, or explaining any of the 129 read-only Websmith checks (FIND, READ, ACT, MCP, AEO, SEC, COM, A11Y, CRAWL), and you need a check's exact test, pass rule, level, fix, or source. |
| `websmith-fix-pack` | websmith-fix-pack | `references/websmith-fix-pack.md` | Use when the owner asks for the fixes, a fix pack, the files, or "how do I fix this" after an audit. Drafts ready-to-paste llms.txt, robots.txt, ai-catalog.json, JSON-LD, security headers, security.txt, gpc.json, MCP server card, and tool annotations, with placement steps for the owner's platform. Drafts only. Never deploys. |
| `websmith-intake-interview` | websmith-intake-interview | `references/websmith-intake-interview.md` | Site-profile schema and read-only platform detection for the Websmith audit skills. Inside ULTIMATE SEO/GEO/AEO/AIO AUTOBOT the questions are asked by getting-started-seo-autobot (interview Part agent), not here; use this skill to write or update websmith/profiles/<domain>.md and to detect the platform. |
| `websmith-mcp-review` | websmith-mcp-review | `references/websmith-mcp-review.md` | Use when a business has (or is building) an MCP server and wants it checked for quality and safety, covering tool names, annotations, outputSchema, server card, auth, errors, and OWASP MCP risks. Also use when the audit runner finds an MCP endpoint. Read-only by default. |
| `websmith-report-writer` | websmith-report-writer | `references/websmith-report-writer.md` | Use when an audit run has finished (results.json exists) and the owner needs the results explained, as a one-page summary for a non-technical owner and/or a full report with a scorecard, evidence table, and ranked copy-paste fixes for their platform. |
| `agentready-safari-checks` | agentready-safari-checks | `references/agentready-safari-checks.md` | Use when auditing a site for AI-agent readiness against AgentReady v2.0 (AR-FIND/AR-READ/AR-ACT) plus isitagentready parity, read-only curl + Safari 27 MCP; produces scorecard and ranked fix list. |

Audit names below are now internal playbooks in this category (the CRAWL sweep is in `seo-autobot-onsite`), not separately required skills. Read their reference file through this category. AgentReady normative Conforms/Does not conform, Websmith 129 checks, and local ARI-100 scores stay separate instruments and are never merged.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `agent-discoverability-max` → `../seo-autobot-agent-readiness/references/agent-discoverability-max.md`.
- `agent-ux-and-ard-conformance` → `../seo-autobot-agent-readiness/references/agent-ux-and-ard-conformance.md`.
- `agentic-commerce-feed-parity` → `../seo-autobot-agent-readiness/references/agentic-commerce-feed-parity.md`.
- `agentready-safari-checks` → `../seo-autobot-agent-readiness/references/agentready-safari-checks.md`.
- `ai-discoverability-max-autobot` → `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot.md`.
- `ecomm-ai-discoverability` → `../seo-autobot-agent-readiness/references/ecomm-ai-discoverability.md`.
- `safari-27-mcp-optimization-autobot` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `websmith-audit-runner` → `../seo-autobot-agent-readiness/references/websmith-audit-runner.md`.
- `websmith-browser-agent-check` → `../seo-autobot-agent-readiness/references/websmith-browser-agent-check.md`.
- `websmith-checklist` → `../seo-autobot-agent-readiness/references/websmith-checklist.md`.
- `websmith-crawl-index-sweep` → `../seo-autobot-onsite/references/websmith-crawl-index-sweep.md`.
- `websmith-fix-pack` → `../seo-autobot-agent-readiness/references/websmith-fix-pack.md`.
- `websmith-intake-interview` → `../seo-autobot-agent-readiness/references/websmith-intake-interview.md`.
- `websmith-mcp-review` → `../seo-autobot-agent-readiness/references/websmith-mcp-review.md`.
- `websmith-report-writer` → `../seo-autobot-agent-readiness/references/websmith-report-writer.md`.
- `wholesale-agent-discoverable` → `../seo-autobot-agent-readiness/references/wholesale-agent-discoverable.md`.
