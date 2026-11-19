---
name: seo-autobot-crawlers-and-policy
description: "Use when deciding or checking AI crawler access: inclusion settings, bot verification, access logs, scraper firewalls, or a spam-policy preflight before a batch ships. Holds 4 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# AI crawler access, inclusion policy, bot logs, scraper firewalls, and spam-policy preflight

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. This skill holds 4 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `ai-inclusion-and-crawler-policy` | AI inclusion and crawler policy | `references/ai-inclusion-and-crawler-policy.md` | Use when starting any AI-visibility work or when asked about opting out, blocking, or allowing AI: find which controls include or exclude the site per AI surface, verify bots, and write one access-policy table. |
| `ai-bot-log-analysis` | AI bot log analysis | `references/ai-bot-log-analysis.md` | Use when server or CDN logs are available and the question is whether AI crawlers and assistants can reach the pages that matter. Helper files: `references/ai-bot-log-analysis/`. |
| `block-ai-scrapers` | block-ai-scrapers | `references/block-ai-scrapers.md` | Use when the user wants to prevent scraping, block AI bots, protect dataset pages, add llms.txt or robots.txt rules, stop curl/Playwright harvesting, or protect API and database credits. |
| `spam-policy-preflight` | Spam-policy preflight | `references/spam-policy-preflight.md` | Use when about to ship a batch of similar pages, a fan-out listicle set, a third-party placement, or a mention campaign: test it against current spam policies and return PASS, FIX, or HOLD per item. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `ai-bot-log-analysis` → `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md`.
- `ai-inclusion-and-crawler-policy` → `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md`.
- `block-ai-scrapers` → `../seo-autobot-crawlers-and-policy/references/block-ai-scrapers.md`.
- `spam-policy-preflight` → `../seo-autobot-crawlers-and-policy/references/spam-policy-preflight.md`.
