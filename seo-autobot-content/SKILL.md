---
name: seo-autobot-content
description: "Use when writing or fixing content: blog intros, transcripts and YouTube SEO, blog and image SEO, de-slopping drafts, writer briefs, or the proof knowledge base. Holds 8 AUTOBOT playbooks; Read references/<slug>.md."
metadata:
  version: "1.0.0"
  template: "ULTIMATE SEO/GEO/AEO/AIO AUTOBOT"
  source_template: "Search Ops (agent-template-export v1)"
---

# Content production and proof

Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. This skill holds 8 playbooks. Each playbook is the complete original method (its own frontmatter included), with nothing summarized or dropped.

How to run one:
1. Find the slug in the table below. Routes, workflows, and routines name playbooks by slug or by export name.
2. Read `references/<slug>.md` from this skill's own directory, and read the whole file, the same way you would read a skill body.
3. Helper files (scripts, references, site configs, examples) live in `references/<slug>/`, which is the playbook's original skill folder. Every relative path inside a playbook (`examples.md`, `scripts/...`, `references/...`, `sites/...`) is relative to `references/<slug>/`, so resolve it there, and run its scripts with `references/<slug>/` as the working directory. A path the playbook tells you to create in the operator's repo stays a repo path.
4. Paths that start with `../` are relative to this category skill's directory: a playbook in another category is at `../<category-skill>/references/<slug>.md`, and another playbook's helper is at `../<category-skill>/references/<slug>/<file>`. Each playbook ends with a list of where its referenced methods live.
5. The playbook's gates apply in full. Never submit, publish, post, send, open a checkout, pay, merge, deploy, or change DNS, firewall, robots, AI settings, or feeds without an explicit yes. Never quote a number without live data and its date.

If loading this skill fails, Read this `SKILL.md` or `references/<slug>.md` directly through this skill's directory. Nothing here depends on any skill outside this template. State lives only in the operator's repo under `seo/`.

| Slug | Export name | Playbook | Use when |
|---|---|---|---|
| `intro` | intro | `references/intro.md` | Use when the user asks for /intro, a blog intro, opening paragraph, article lead, listicle intro, or hook copy for a post. Helper files: `references/intro/`. |
| `scribiz` | scribiz | `references/scribiz.md` | Use when the user wants to transcribe a YouTube, TikTok, Instagram, podcast, or local media file, generate SRT or VTT subtitles, summarize a video, ask questions about a video, or turn a video into a blog post, show notes, or social posts. |
| `seo-blog-images` | seo-blog-images | `references/seo-blog-images.md` | Use when adding a blog cover or OG image, generating inline visuals without dark icon-box AI slop, capturing real product screenshots or data charts, or auditing image alt text, filenames, and Core Web Vitals attributes. |
| `unslop-seo` | unslop-seo | `references/unslop-seo.md` | Use when cleaning up AI-generated drafts, grounding vague marketing copy in real codebase facts, optimizing headings and opening paragraphs for ChatGPT and Perplexity citations, or removing AI tells like em dashes and puffery. |
| `youtube-seo` | youtube-seo | `references/youtube-seo.md` | Use when the user uploads or links a video, asks for YouTube titles, descriptions, chapters, or timestamps, wants a video to rank on Google or show in AI Overviews, or wants to embed a video on a blog post for SEO. |
| `image-seo-checklist` | Image SEO checklist | `references/image-seo-checklist.md` | Use when auditing, briefing, or optimizing the images on a page for search: filenames, compression, alt text, schema, originality, and captions. |
| `writer-content-brief` | Writer content brief | `references/writer-content-brief.md` | Use when the user picks a topic or ideas board row and wants a writer-ready brief that wins both Google and AI answers. |
| `proof-kb` | proof-kb | `references/proof-kb.md` | Use when scaffolding seo/<site-slug>/kb/, extracting founder proof from transcripts or interviews, upgrading thin SEO posts with real receipts, or routing a new benchmark, customer win, or pricing change across multiple pages. |


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `image-seo-checklist` → `../seo-autobot-content/references/image-seo-checklist.md`.
- `intro` → `../seo-autobot-content/references/intro.md`.
- `proof-kb` → `../seo-autobot-content/references/proof-kb.md`.
- `scribiz` → `../seo-autobot-content/references/scribiz.md`.
- `seo-blog-images` → `../seo-autobot-content/references/seo-blog-images.md`.
- `unslop-seo` → `../seo-autobot-content/references/unslop-seo.md`.
- `writer-content-brief` → `../seo-autobot-content/references/writer-content-brief.md`.
- `youtube-seo` → `../seo-autobot-content/references/youtube-seo.md`.
