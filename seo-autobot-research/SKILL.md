---
name: seo-autobot-research
description: "Use when researching competitors, backlinks, SERPs, keyword clusters, buyer questions, comparison or alternatives pages, or AI-prompt content gaps. Holds 6 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# Keyword, SERP, competitor, and buyer-question research

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. This skill holds 6 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `ahrefs-research` | ahrefs-research | `references/ahrefs-research.md` | Use when the user asks for competitor research, content gaps, top pages, backlink audits, 'is this DR real', Reddit topic mining, or picking a page on a prospect site for a link insertion. |
| `dataforseo-serp` | dataforseo-serp | `references/dataforseo-serp.md` | Use when the user asks to cluster keywords, check what ranks, avoid cannibalization, pick a free tool to build, find who AI Overviews or ChatGPT cite, or decide what format a page must take before writing it. |
| `keyword-and-question-research` | Keyword and question research | `references/keyword-and-question-research.md` | Use when the user pastes keywords, a CSV, or names a category and wants page ideas: start from buyer decisions, expand into search terms and AI prompts, and rank ideas onto the ideas board. |
| `buyer-question-map` | Buyer question map | `references/buyer-question-map.md` | Use when the user wants to know what buyers ask before choosing in their category, or where they show up in Google and AI answers: map buyer decisions to both keywords and AI prompts. |
| `vs-and-alternatives` | vs-and-alternatives | `references/vs-and-alternatives.md` | Use when the user asks for comparison pages, competitor alternative pages, "X vs Y" content, "best tool for [stack]" listicles, or wants to win buyers who are leaving a competitor. |
| `content-coverage` | content-coverage | `references/content-coverage.md` | Use when the user wants content for ChatGPT gaps, citation listicles, competitor sources, or a content campaign from AI SEO Tracker. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `ahrefs-research` → `../seo-autobot-research/references/ahrefs-research.md`.
- `buyer-question-map` → `../seo-autobot-research/references/buyer-question-map.md`.
- `content-coverage` → `../seo-autobot-research/references/content-coverage.md`.
- `dataforseo-serp` → `../seo-autobot-research/references/dataforseo-serp.md`.
- `keyword-and-question-research` → `../seo-autobot-research/references/keyword-and-question-research.md`.
- `vs-and-alternatives` → `../seo-autobot-research/references/vs-and-alternatives.md`.
