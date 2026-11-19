---
name: seo-autobot-ai-visibility
description: "Use when measuring or winning AI answers: AI SEO Tracker, fan-out maps, citable passages, platform ledgers, prompt sampling and reruns, AI referrals, and weekly reports. Holds 10 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# AI answer visibility: tracking, fan-out, passages, sampling, ledgers, attribution, and reports

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. This skill holds 10 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `aiseotracker` | aiseotracker | `references/aiseotracker.md` | Use when the user wants AI search visibility, ChatGPT or Perplexity rankings, citation tracking, or AI SEO Tracker MCP setup; fetch the live skill before quoting tools or pricing. |
| `ai-seo-report` | ai-seo-report | `references/ai-seo-report.md` | Use when the user wants a TL;DR of AI search visibility, a weekly recap, or the same brief as the in-app Report page. |
| `fan-out-coverage-map` | Fan-out coverage map | `references/fan-out-coverage-map.md` | Use when a page ranks or is indexed but is not cited in AI Mode, AI Overviews, ChatGPT, Copilot, or Perplexity. |
| `citable-passage-pass` | Citable passage pass | `references/citable-passage-pass.md` | Use when a page should be quoted by AI Mode, AI Overviews, or an assistant: rewrite the target sections so each question has one self-contained, answer-first paragraph, and inventory which passages engines already lift. |
| `first-party-ai-visibility-ledger` | First-party AI visibility ledger | `references/first-party-ai-visibility-ledger.md` | Use when the user asks how the site is doing in AI answers, when a weekly report needs AI numbers, or after a core update or model switch. |
| `prompt-sampling-protocol` | Prompt sampling protocol | `references/prompt-sampling-protocol.md` | Use when measuring AI visibility by hand or judging a tracker's numbers: run each buyer prompt enough times to report a visibility rate with its sample size and interval, per engine, and never a rank position. Helper files: `references/prompt-sampling-protocol/`. |
| `prompt-rerun-tracker` | Prompt rerun tracker | `references/prompt-rerun-tracker.md` | Use when the user wants to know whether a change worked in Google or AI answers, or for the weekly rerun of tracked buyer questions: measure Google and AI separately, one change at a time. |
| `ai-referral-attribution` | AI referral attribution | `references/ai-referral-attribution.md` | Use when the operator asks what AI search is worth, when assistant traffic looks too small to matter, or before budget moves between search and AI work. |
| `weekly-search-report` | Weekly search report | `references/weekly-search-report.md` | Use when the user asks how search did this week or the Monday report fires: Search Console plus AI visibility, reported separately, with actions. |
| `extra-recurring-checks` | Extra recurring checks | `references/extra-recurring-checks.md` | Use when the user asks for more recurring search or AI-visibility checks beyond the shipped routines. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `ai-referral-attribution` → `../seo-autobot-ai-visibility/references/ai-referral-attribution.md`.
- `ai-seo-report` → `../seo-autobot-ai-visibility/references/ai-seo-report.md`.
- `aiseotracker` → `../seo-autobot-ai-visibility/references/aiseotracker.md`.
- `citable-passage-pass` → `../seo-autobot-ai-visibility/references/citable-passage-pass.md`.
- `extra-recurring-checks` → `../seo-autobot-ai-visibility/references/extra-recurring-checks.md`.
- `fan-out-coverage-map` → `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md`.
- `first-party-ai-visibility-ledger` → `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`.
- `prompt-rerun-tracker` → `../seo-autobot-ai-visibility/references/prompt-rerun-tracker.md`.
- `prompt-sampling-protocol` → `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md`.
- `weekly-search-report` → `../seo-autobot-ai-visibility/references/weekly-search-report.md`.
