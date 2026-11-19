---
name: seo-autobot-copy-and-marketing
description: "Use when copy explains instead of sells, when you need buyer language or journey stages, or to turn shipped code and data into launch posts and syndication. Holds 5 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# Copywriting, buyer language, launch marketing, and distribution

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. This skill holds 5 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `blitz-copy` | blitz-copy | `references/blitz-copy.md` | Use when rewriting flat marketing copy that explains instead of sells, or when the user mentions "blitz copy", "dopamine copywriting", or conversion hooks. |
| `understand-customers` | understand-customers | `references/understand-customers.md` | Use when researching an ICP before landing page or ad copy, or when the user mentions "understand customers", "empathy engine", or "customer pain points". |
| `customer-journey` | customer-journey | `references/customer-journey.md` | Use when the user asks about search intent, AI SEO prompts, discoverability, buyer journeys, awareness stages, or what content to create for a brand, website, or keyword list. |
| `diff-marketing` | diff-marketing | `references/diff-marketing.md` | Use when the user invokes /diff-marketing or /marketing, or asks for blog posts, tweets, changelogs, or emails about what shipped. |
| `parasite-and-pr` | parasite-and-pr | `references/parasite-and-pr.md` | Use when distributing launch announcements, original data benchmarks, or "Best [Category] (2026)" and "[Competitor] Alternatives" articles across high-DR platforms and press-release wires to win fast Google rankings and ChatGPT/Perplexity citations. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `blitz-copy` → `../seo-autobot-copy-and-marketing/references/blitz-copy.md`.
- `customer-journey` → `../seo-autobot-copy-and-marketing/references/customer-journey.md`.
- `diff-marketing` → `../seo-autobot-copy-and-marketing/references/diff-marketing.md`.
- `parasite-and-pr` → `../seo-autobot-copy-and-marketing/references/parasite-and-pr.md`.
- `understand-customers` → `../seo-autobot-copy-and-marketing/references/understand-customers.md`.
