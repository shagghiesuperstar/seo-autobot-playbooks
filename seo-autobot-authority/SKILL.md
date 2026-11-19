---
name: seo-autobot-authority
description: "Use when third parties win the answer: source maps, per-engine source plans, entity audits, earned media, video/social, link outreach, managed links, directories, or Reddit. Holds 10 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# Off-site authority, sources, entity, earned media, links, directories, and communities

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
| `source-map` | Source map | `references/source-map.md` | Use when AI answers or search results for a buyer question lean on third-party sources (Reddit, review sites, directories, articles): list the sources shaping the answer and sort each into Own, Claim, Earn, or Contest. |
| `engine-source-plan` | Engine source plan | `references/engine-source-plan.md` | Use when deciding where off-site effort goes for AI visibility, or when a Source map shows different sources on different engines. |
| `entity-and-brand-memory-audit` | Entity and brand-memory audit | `references/entity-and-brand-memory-audit.md` | Use when assistants name competitors and not the user, describe the user wrongly, or recommend the brand only when it is named in the prompt. |
| `earned-media-and-data-study` | Earned media and data study | `references/earned-media-and-data-study.md` | Use when the Source map or engine plan shows answers built from news, analyst, and third-party pages that do not mention the user. |
| `video-and-social-citation-surface` | Video and social citation surface | `references/video-and-social-citation-surface.md` | Use when Google's AI answers or a source map cite videos and social posts for the tracked questions, or the operator publishes on YouTube, Instagram, TikTok, or X. |
| `honest-link-outreach` | honest-link-outreach | `references/honest-link-outreach.md` | Use when writing link-building outreach emails, asking integration partners or customers for backlinks, pitching ranking listicles or guides, or auditing an outreach list for weak prospects. |
| `linkdr` | linkdr | `references/linkdr.md` | Use when the user wants authority backlinks, link building, guest posts, or DR-tier placements via LinkDR with human approval; fetch the live SKILL.md before quoting any price. |
| `directory-submissions` | directory-submissions | `references/directory-submissions.md` | Use when launching a new product from DR 0, building foundational dofollow backlinks, publishing one repo to 15+ MCP & agent registries, or running directory submissions. |
| `awesome-tools` | awesome-tools | `references/awesome-tools.md` | Use when submitting a software tool to Awesome Tools via the JSON API or WebMCP: complete the free backlink path or review paid listing options; never submit or pay without an explicit yes. |
| `reddit-serp` | reddit-serp | `references/reddit-serp.md` | Use when the user asks for Reddit marketing, Reddit SEO, "get mentioned on Reddit", wants to show up in "best X reddit" results, or asks which Reddit threads AI assistants cite. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `awesome-tools` → `../seo-autobot-authority/references/awesome-tools.md`.
- `directory-submissions` → `../seo-autobot-authority/references/directory-submissions.md`.
- `earned-media-and-data-study` → `../seo-autobot-authority/references/earned-media-and-data-study.md`.
- `engine-source-plan` → `../seo-autobot-authority/references/engine-source-plan.md`.
- `entity-and-brand-memory-audit` → `../seo-autobot-authority/references/entity-and-brand-memory-audit.md`.
- `honest-link-outreach` → `../seo-autobot-authority/references/honest-link-outreach.md`.
- `linkdr` → `../seo-autobot-authority/references/linkdr.md`.
- `reddit-serp` → `../seo-autobot-authority/references/reddit-serp.md`.
- `source-map` → `../seo-autobot-authority/references/source-map.md`.
- `video-and-social-citation-surface` → `../seo-autobot-authority/references/video-and-social-citation-surface.md`.
