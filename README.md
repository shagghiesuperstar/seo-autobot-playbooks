# seo-autobot-playbooks

The playbook library for the **ULTIMATE SEO/GEO/AEO/AIO AUTOBOT** Grok Bot template.

Built from @pixelrainbownft's own e-commerce experience: SEO, GEO, AEO, and AIO methods across regulated and unregulated industries.

The bot template ships short category skills. Each category skill is an index: it names the playbooks it covers and tells the bot to fetch the full playbook text from this repo when it needs it. Nothing here is site-specific. Wherever a playbook needs your details, it uses a placeholder such as `<your-site>`, `<store>`, `<org>/<repo>`, `<memory-store>`, or `<your-ops-dir>`.

## Folder layout

```
getting-started-seo-autobot/        onboarding skill: interview, routing, methods, guardrails, skill index
seo-autobot-<category>/             one folder per category skill
  SKILL.md                          the category index (slug, use-when, path)
  references/<slug>.md              the full playbook body for each slug
  references/<slug>/...             that playbook's helper files (scripts, templates, checklists, site configs)
agentready-safari-checks/           standalone agent-readiness scorecard skill (+ ar_probe.js)
websmith-*/                         standalone audit skills referenced by the agent-readiness playbooks
INDEX.md                            every slug with its category and raw URL
MANIFEST.json                       machine-readable map: category -> slugs -> use-when -> raw URL
```

Categories: `seo-autobot-agent-readiness`, `seo-autobot-ai-visibility`, `seo-autobot-authority`, `seo-autobot-content`, `seo-autobot-copy-and-marketing`, `seo-autobot-crawlers-and-policy`, `seo-autobot-onsite`, `seo-autobot-research`.

Paths are stable: a playbook is always at `<category>/references/<slug>.md`, and relative paths inside a playbook resolve against its own folder. Raw URLs follow the pattern:

```
https://raw.githubusercontent.com/shagghiesuperstar/seo-autobot-playbooks/main/<path>
```

## How the bot uses it

1. Load the category skill that matches the task.
2. Pick the slug from its table.
3. Fetch `references/<slug>.md` (and any helper file it names) from this repo and read the whole file before acting.

Platform facts, prices, and protocol details in the playbooks are dated. Re-check the live source before quoting any of them.

## License

All rights reserved unless stated.

Credit: @pixelrainbownft
