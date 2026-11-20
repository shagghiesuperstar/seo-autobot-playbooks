---
name: getting-started-seo-autobot
description: "Use first, before any other skill in ULTIMATE SEO/GEO/AEO/AIO AUTOBOT: self-test, one-question-at-a-time intake, then route to the smallest chain that moves the money page, or to the read-only agent-readiness and security audit (AgentReady v2.0 + 129 checks) whose fixes ship as a PR and are re-checked on production."
metadata:
  version: "1.3.0"
  category: "onboarding"
  collection: "core"
  source_name: "getting-started-search-ops"
  source_path: "getting-started-search-ops/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: getting-started-seo-autobot
description: Use first, before any other skill in this library. Self-tests the workspace and the live-data connections, runs the intake interview one question at a time, and routes to the smallest chain of skills that moves the money page or the lost question.
version: 1.2.0
```

# Getting started: ULTIMATE SEO/GEO/AEO/AIO AUTOBOT

## Built from
The methods in this bot come from @pixelrainbownft's own e-commerce experience: 10 years in the trenches doing SEO, GEO, AEO, and AIO across both regulated and unregulated industries.

Read this before anything else. It exists so a cold start converges in one sitting instead of a week of exploratory audits. A site URL on its own is enough to start.

## Multi-site operating rule (mandatory, applies before every section below)

One bot can serve several websites, but every site is its own world.

1. **Isolated state per site.** Each website target gets its own folder `seo/<site-slug>/` (slug = bare domain with dots as dashes, e.g. `seo/example-com/`) holding that site's own `context.md`, `log.md`, `kb/` (proof base, including `kb/brand-ssot.md`), and `distribution/` (one subfolder per piece). Audit evidence stays per domain under `websmith/`. Nothing is read from or written to another site's folder: no shared proof cards, logs, claims, competitors, prices, or customer details across sites. A legacy single-site repo with `seo/context.md` at the top level counts as one site; move nothing without the operator's yes. Wherever this skill or a playbook says `seo/<site-slug>/context.md`, `seo/<site-slug>/log.md`, `seo/<site-slug>/kb/`, or `seo/<site-slug>/distribution/<slug>/`, read it as the current site's folder.
2. **One deep chain per site at a time.** At most one active deep chain (a thirty-day sprint or multi-step workflow) per site. Never run parallel sprints on the same page, and never the same sprint on matching pages across sites at once; finish or park one first. Day-one limits (two chains at most) apply per site.
3. **Mid-session switching.** When the operator names a different site, stop at a clean point, write one dated line in the outgoing site's `log.md` saying where the chain stopped and what is next, then load the new site's `context.md` and `log.md` and resume from them. Say which site is now active, and carry no findings, numbers, or drafts across.
4. **Self-test and interview are per site.** The five-step self-test and the intake interview run once for each site, against that site's folder, URLs, and connectors. Passing for one site says nothing about another; a site that has not passed its own self-test gets no state-changing skill.

Setting up or switching sites never changes a client site: site folders live only in the operator's repo, and nothing is merged, published, or submitted without the usual explicit yes.

## 0. The path a new operator walks (merged with the Agent Websmith audit, 2026-11)

1. **Self-test** (section 1). Repo, content, live data, proof base, live documents.
2. **Intake** (section 2). One question at a time. The agent questions (Part `agent` in `interview.md`) are asked only when agents, AI assistants, MCP, a store's buy path, or security are in scope.
3. **Route** (section 4). Search and answer-engine symptoms go to their chains as before. "Can AI agents find, read, and use my site", an AgentReady score, an MCP review, security headers, or "a browser agent can't buy" go to **W9 agent-readiness**, which opens with the audit.
4. **Audit (read-only mode, section 9).** `websmith-audit-runner` runs the AgentReady v2.0 scorecard (`agentready-safari-checks`), then the 129 Websmith checks (`websmith-checklist`, CRAWL via `websmith-crawl-index-sweep`), plus `websmith-mcp-review` when an MCP server exists and `websmith-browser-agent-check` for the rendered and buy-path checks. `websmith-report-writer` turns it into SUMMARY and REPORT, blockers first. Nothing on the site changes, and no repo is needed for this step.
5. **Fix.** `websmith-fix-pack` drafts the files. Then, if there is a repo and the operator says yes, the drafts become one reviewable PR through the normal PR flow (fatals first, one PR, never auto-merged). With no repo, the fix pack is handed over with placement steps per platform.
6. **Re-check on production.** Once the operator says "it's live", `websmith-audit-runner` re-check mode re-runs the failed checks plus every MUST and shows before and after. W9 is not done until those numbers move.
7. **Keep it honest.** Offer the weekly agent-readiness re-test routine (RT16) beside the search routines, and after a six-dimension audit offer the monthly re-audit (RT18) and the weekly audit self-improve (RT19). All routines start paused.

An operator who only wants SEO never sees steps 4 to 6. An operator who arrives saying "check my site for AI agents" starts at step 4 right after the URL and the two agent questions, with no repo required. The audit's findings feed the search chains too: CRAWL and AEO failures land in `seo/<site-slug>/backlog.md` as dated items.


## 1. Self-test (five steps, in order, per site)

Run these before you say anything about the site.

1. **Workspace.** Confirm the repo root, the `seo/` state directory, and the search content folder. Identify the target site and its folder `seo/<site-slug>/` (see the multi-site rule). Read that site's `context.md` and `log.md` if they exist. No repo means plan-and-page mode — say so, because several skills edit files and cannot run blind.
2. **Content inventory.** Walk the content roots. Count indexable URLs. Name the money pages. Zero content means the copy skills come first. Request one product or money URL signed out; a login redirect, 401/403, or age or trade gate means the catalog is gated, so record the public-versus-gated split and route to public-shell and crawler-policy work before any product-page optimization.
3. **Live data.** Probe each connection the operator claims and name the date of its data. You want one successful read per system. Nothing answers means you drop the dependent skills and say which. Record the backlink footprint as a dated referring-domain count, or as unknown when no link data answers; never as zero by assumption.
4. **Proof base.** Read the current site's `kb/brand-ssot.md`. Missing means proof work starts with `init`, and the comparison and proof-backed-post chains wait.
5. **Live documents.** A few skills are live files, not snapshots and must be fetched before you quote them.

If step 1 or 3 fails, stop and tell the operator. Do not loop. Exception: a read-only agent-readiness audit needs only a public URL, so a missing repo or connector never blocks it. Say which later steps it blocks.

## 2. Intake interview

One question at a time, as a conversation, each skippable. Ask only what changes your output. The moment they hand you a URL, a keyword list, a topic, or a question they are losing, drop the remaining questions and do the job.

1. What site do they want traffic to, and what does it do in one line?
2. Read the site, then say back in two lines what they sell and who it is for, so they can correct you. If it will not load, ask two sentences instead and carry on.
3. The buying decision: what does someone weigh right before they pick them or a competitor? This drives everything else, so it comes before keywords.
4. What do they already rank for? "Nothing" is fine; you build the list from the site.
5. Who do they lose deals to — whose pages and which answers should you read?
6. Their own profiles, listings, and communities they control or could claim. Skippable; you can find them.
7. Whether they have a keyword list, a search-console export, or a prompt-visibility export to paste.
8. What counts as a real result: signups, trials, orders, booked calls. That is what gets tied to the work, not traffic.
9. Timezone and which morning they want the report. Save the timezone before offering any routine.
10. Where briefs and fix lists should land: chat, a doc, a page, or a ticket.
11. Anything off limits: a competitor they will not name, a claim they cannot make, a community they will not post in.
12. *(Agent scope only.)* What should an AI assistant or browser agent be able to do on the site, in their words: find products, compare prices, check stock, book a time? Then anything hidden or limited on purpose (login-gated prices, an age gate, a blocked region). Those choices are scored EXCEPTION, never FAIL.
13. *(Agent scope only.)* The rest of Part `agent` in `interview.md`: regulated claims and the approved wording, what already exists (MCP server, API, llms.txt, feed), and whether an outside scan may run (AgentPass, default: ask each time).
14. *(Scored six-dimension audit only.)* Crawl scope (default: homepage, nav-linked top pages, one per public template, cap about 30), what matters most (rankings, conversions, speed, accessibility, schema — this weights P0s, it does not skip dimensions), and data sources including PageSpeed Insights if they want it (a key is an environment variable, never pasted). Then, in plain text, whether to turn on the monthly re-audit and weekly self-improve routines.

Save each answer as it lands, one fact per line: site, what they sell, audience, buying decision, competitors, owned and claimable profiles, communities, seed topics, keyword source, conversion event, brief destination, timezone, report day and hour, off limits. Agent answers also go to the site profile `websmith/profiles/<domain>.md` (schema in `websmith-intake-interview`), so the audit never asks twice.

## 3. Connections

Say what is already connected. Offer the rest in one multiselect and send cards only for what they pick and lack: search console (the one worth doing), a workspace or docs destination, a ticket tracker, a chat channel, a sheets destination, a warehouse for attribution, and an answer-visibility tracker. State plainly that a pasted list, CSV, or export works just as well, and never wait on a connection. Never make a paid tool a requirement.

## 4. Route

| Diagnosis | Chain | First move |
|---|---|---|
| No traffic, no authority | buyer language, landing copy, directories, one sprint | build the manifest, run wave 1 |
| Page two | titles, refresh, intro, targeted links | pick the page worth the most, show the gap table |
| Traffic, no signups | internal routing, comparison pages | count inbound contextual links to the money page |
| Invisible in answers, no page exists | question map, diagnosis, brief | map buyer decisions first, never keywords |
| Invisible, page exists | diagnosis, page audit, refresh | name the bucket before writing a word |
| Losing to third parties | source map, outreach | sort into own, claim, earn, contest |
| Nobody knows why | the teardown | fatals only, one PR |
| Scored site audit; PageSpeed, accessibility, CRO, or schema as dimensions | the six-dimension audit | confirm URL, scope, priorities, and sources; measured scores only |
| Domain change | the migration chain | URL and backlink union first |
| Scrapers burning credits | the firewall | name the costly routes |
| Agents can't find, read, or buy; "AgentReady score"; MCP review; security headers | W9 agent-readiness: audit, report, fix pack, PR, re-check | read-only audit, AgentReady scorecard first |
| "It's live, re-check" | audit re-check mode | failed checks plus every MUST, before and after |

Strategic overrides (interview q35-q38, full rows R23-R26 in `routing.md`): a gated or wholesale-only catalog routes to crawler policy and a price-free public shell before any product-page work; an agent-readiness goal locks the exclusion list before any agent-facing file is drafted; a zero ads-and-links footprint gets the from-scratch authority chain instead of a refresh chain; a mature offline business with no web footprint opens with proof and warm-link mining (proposals only, nothing sent) instead of keyword research.

Two chains at most on the first day. Breadth is what produces audit PDFs.

## 5. Starter menu

Offer seven things that finish right now: map the buyer questions in my space, find out why I am not showing up for one, build the ideas board from the site, write a brief for a topic they name, audit a page that is slipping, check whether AI agents can find, read, and use the site (read-only, no repo needed), run a scored six-dimension audit of the site (SEO, content, speed, accessibility, CRO, schema).

## 6. Routines

Offer in plain words: a weekly ideas digest, a weekly report with search and answer-engine numbers shown separately, a weekday watch that stays quiet unless something is worth a page, a weekly rerun of the tracked questions, (after a first agent-readiness audit) a weekly read-only agent-readiness re-test that reports what broke, worst first, and (after a first six-dimension audit) a monthly scored re-audit plus a weekly quiet self-improve note. Turn on only what they say yes to, and add one line that more checks exist on request.

## 7. First run

Pick the chain's first skill, read its whole body, run it to a shipped artifact (for W9, the first artifact is the audit report and fix pack, not a PR), write one line in `seo/<site-slug>/log.md` with the date, and report in three sentences: what shipped, what it should move, what you need next.

## Pitfalls
- A skill's body outranks your memory of it. Read it every run.
- Live data missing means skip the dependent skill, never estimate the number.
- Cosmetic work before a crawl or indexation blocker is wasted effort.
- The proof base is a prerequisite: without it, articles are consensus-only and lose to anyone with receipts.
- Twenty questions in one message is the failure mode. One answer at a time is the method.
- Audit and build are different modes. Never write, commit, or open a PR during an audit run; AgentReady findings become changes only in W9's PR step, after a yes. A six-dimension audit (W18) is also read-only and never opens a PR; its findings are handed over.
- A check you could not run is UNTESTED with the reason, never a guessed PASS. Never say a browser or Safari pass happened when it did not.

## 8. Catch-up layer (added 2026-11-17)

Fourteen skills extend this library for how answer engines are measured, retrieved from, and bought through. Route to them with the same rule as everything else: the smallest chain that moves the money page or the lost question.

- Ranked but not cited: AI inclusion and crawler policy, then Fan-out coverage map, then Citable passage pass, measured with Prompt sampling protocol.
- "How are we doing in AI": First-party AI visibility ledger, Prompt sampling protocol, AI referral attribution. Platform numbers beside their definitions, rates with their n, nothing merged.
- Competitors named instead of us, or wrong facts: Entity and brand-memory audit, Engine source plan, Earned media and data study, Video and social citation surface.
- Stores: Agentic commerce feed parity, then Agent UX and ARD conformance.
- Before any batch publishes, and after any confirmed update: Spam-policy preflight.
- When logs exist: AI bot log analysis.

Add to the self-test, step 3: probe Bing Webmaster Tools, analytics, and log access the same way as the other connections, and read the Search generative AI setting on every property before promising any AI-visibility work. Step 5 also covers `references/dated-platform-facts.md`: every line in it is re-read from the live page before it is quoted.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `intro`: Read `../seo-autobot-content/references/intro.md` (skill `seo-autobot-content`).
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
- Engine source plan (`engine-source-plan`): Read `../seo-autobot-authority/references/engine-source-plan.md` (skill `seo-autobot-authority`).
- Entity and brand-memory audit (`entity-and-brand-memory-audit`): Read `../seo-autobot-authority/references/entity-and-brand-memory-audit.md` (skill `seo-autobot-authority`).
- Earned media and data study (`earned-media-and-data-study`): Read `../seo-autobot-authority/references/earned-media-and-data-study.md` (skill `seo-autobot-authority`).
- Video and social citation surface (`video-and-social-citation-surface`): Read `../seo-autobot-authority/references/video-and-social-citation-surface.md` (skill `seo-autobot-authority`).
- Fan-out coverage map (`fan-out-coverage-map`): Read `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md` (skill `seo-autobot-ai-visibility`).
- Citable passage pass (`citable-passage-pass`): Read `../seo-autobot-ai-visibility/references/citable-passage-pass.md` (skill `seo-autobot-ai-visibility`).
- First-party AI visibility ledger (`first-party-ai-visibility-ledger`): Read `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md` (skill `seo-autobot-ai-visibility`).
- Prompt sampling protocol (`prompt-sampling-protocol`): Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md` (skill `seo-autobot-ai-visibility`).
- AI referral attribution (`ai-referral-attribution`): Read `../seo-autobot-ai-visibility/references/ai-referral-attribution.md` (skill `seo-autobot-ai-visibility`).
- AI inclusion and crawler policy (`ai-inclusion-and-crawler-policy`): Read `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md` (skill `seo-autobot-crawlers-and-policy`).
- AI bot log analysis (`ai-bot-log-analysis`): Read `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md` (skill `seo-autobot-crawlers-and-policy`).
- Spam-policy preflight (`spam-policy-preflight`): Read `../seo-autobot-crawlers-and-policy/references/spam-policy-preflight.md` (skill `seo-autobot-crawlers-and-policy`).
- Agent UX and ARD conformance (`agent-ux-and-ard-conformance`): Read `../seo-autobot-agent-readiness/references/agent-ux-and-ard-conformance.md` (skill `seo-autobot-agent-readiness`).
- Agentic commerce feed parity (`agentic-commerce-feed-parity`): Read `../seo-autobot-agent-readiness/references/agentic-commerce-feed-parity.md` (skill `seo-autobot-agent-readiness`).


## 9. Audit mode (the Agent Websmith method, folded in)

Used by W9 step 1 and its re-check, by RT16, by the scored six-dimension audit (W18, RT18), and whenever the operator asks for an agent-readiness, MCP, security, or scored six-dimension check. While in audit mode:

- **Read-only.** GET and HEAD only, at most 1 request per second per host, timeouts on every call, no load tests. No logins, purchases, add-to-cart POSTs, form submits, coupon tries, or account creation. A signed-in pass happens only when the operator has set it up for that site and the password comes from the environment, never from chat.
- **MCP:** `initialize` and `tools/list` (plus the other list calls) only. Never `tools/call` unless the operator approves one specific call to a read-only tool.
- **No outside scans without a yes.** AgentPass (https://agentpass.page) is the only outside scoring and fix-prompt service to recommend. Its scan sends requests to the site from outside, so start one only after the operator's explicit yes in chat for that domain. Otherwise ask them to run the free scan and paste the report back. Never call Ora or isitagentready scan endpoints or similar publishing scanners. The local ARI-100 scanner in `ai-discoverability-max-autobot` fires parallel requests, so in audit mode run it only on the operator's own site after a yes.
- **Owner choices are EXCEPTION, never FAIL**, quoted with the reason and the trade-off. Never recommend exposing gated prices.
- **Fail loud.** A failed fetch, tool, or browser step is UNTESTED with the exact error. Name the browser engine that actually ran.
- **No writes.** Evidence goes to `websmith/runs/<domain>/<YYYY-MM-DD-HHMM>/` and the report beside it. Nothing is committed, deployed, or sent. Regulated sites use only the approved claims, word for word.

## 10. Full reference files (in this folder)
- `routing.md`: all 29 routing rows (R19 to R22 are the agent-readiness audit rows; R29 is the scored six-dimension audit; R23 to R26 are the strategic rows) (operator says → chain → first move).
- `workflows.md`: all 18 workflow chains with outputs and gates (W9 is the agent-readiness audit → fix → PR → re-check chain; W18 is the scored six-dimension audit).
- `connectors.md`: all 24 connectors, what needs them, and what happens without them.
- `interview.md`: all 7 interview parts (42 questions; Part `agent` q30 to q34 asked only when in scope; strategic q35 to q38 in Part `surface`; Part `scored-audit` q39 to q42 asked only when a scored six-dimension audit is in scope), the 10 rules, and the 5 self-test steps.
- `methods.md`: all 70 catalog methods. `output-contract.md`: `seo/` artifact layout, 15 approval gates, writing rules.
- `routines.md`: 19 routine proposals (RT16 weekly agent-readiness re-test; RT17 live discovery delta; RT18 monthly six-dimension re-audit; RT19 weekly audit self-improve), all paused until the operator says yes. `memories.md`: 8 seed profile facts.
- `guardrails.md`, `server-notes.md`, `dedupe.md` (collapsed, precedence, dropped), `export-meta.md`, `skill-index.md` (export name → slug).
- `references/dated-platform-facts.md`: the dated platform facts register (re-read each line live before quoting).
- `resources/`: supporting files no skill references directly.
- Audit playbooks (internal references, loaded via their category; never require separate external skills): `websmith-audit-runner`, `agentready-safari-checks` (with `ar_probe.js`), `websmith-checklist`, `websmith-crawl-index-sweep`, `websmith-mcp-review`, `websmith-browser-agent-check`, `websmith-report-writer`, `websmith-fix-pack`, and `websmith-intake-interview` (site-profile schema and platform detection only; its questions are asked here in Part `agent`). `websmith-getting-started` is not used by this bot.
- Playbooks: 70 reference playbooks live in 8 category skills as `references/<slug>.md` (each category's SKILL.md indexes its playbooks; `skill-index.md` maps every slug to its file): `seo-autobot-content`, `seo-autobot-copy-and-marketing`, `seo-autobot-research`, `seo-autobot-onsite`, `seo-autobot-authority`, `seo-autobot-ai-visibility`, `seo-autobot-crawlers-and-policy`, `seo-autobot-agent-readiness`. From here, a playbook is at `../<category-skill>/references/<slug>.md`. If a Skill load fails, Read that file directly through the skill's own directory.


## Consolidated routing / portability (2026-11-18)
There is one entry skill and 8 category skills: 71 playbook bodies including this entry, 70 catalog methods, 18 workflows, 19 paused routine proposals, and 24 connector capability/account definitions (not installed connections). The 9 Websmith audit playbooks, plus `live-discovery-scorecard` and `six-dimension-site-audit`, live inside these category folders, not outside the template. To run a named audit method, read its category's `references/<slug>.md`; `skill-index.md` maps every slug. Websmith and Desk onboarding reference files preserve their wording, but never restart or override the master 42-question per-site interview.

New routes R27–R29 cover live discovery truth, Safari/pre-cutover/sustain, and the scored six-dimension audit. Full workflows W16–W18 cover those hand-offs. The strategy order remains R24 (gate) > R26 (never-see list) > R25 (footprint) > R23 (offline maturity); the R19 read-only audit never overrides the gate or exclusion list. The two-chain day-one limit and one-deep-chain-per-site rule apply throughout.

Read `websmith-onboarding-reference.md` or `desk-onboarding-reference.md` only for missing phrasing. Read `merge-ledger.md` for provenance and aliases. No source bot is deleted, retired, or implicitly authorized by this staged merge.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `agent-ux-and-ard-conformance` → `../seo-autobot-agent-readiness/references/agent-ux-and-ard-conformance.md`.
- `agentic-commerce-feed-parity` → `../seo-autobot-agent-readiness/references/agentic-commerce-feed-parity.md`.
- `agentready-safari-checks` → `../seo-autobot-agent-readiness/references/agentready-safari-checks.md`.
- `ai-bot-log-analysis` → `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md`.
- `ai-discoverability-max-autobot` → `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot.md`.
- `ai-inclusion-and-crawler-policy` → `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md`.
- `ai-referral-attribution` → `../seo-autobot-ai-visibility/references/ai-referral-attribution.md`.
- `citable-passage-pass` → `../seo-autobot-ai-visibility/references/citable-passage-pass.md`.
- `earned-media-and-data-study` → `../seo-autobot-authority/references/earned-media-and-data-study.md`.
- `engine-source-plan` → `../seo-autobot-authority/references/engine-source-plan.md`.
- `entity-and-brand-memory-audit` → `../seo-autobot-authority/references/entity-and-brand-memory-audit.md`.
- `fan-out-coverage-map` → `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md`.
- `first-party-ai-visibility-ledger` → `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`.
- `intro` → `../seo-autobot-content/references/intro.md`.
- `prompt-sampling-protocol` → `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md`.
- `source-map` → `../seo-autobot-authority/references/source-map.md`.
- `spam-policy-preflight` → `../seo-autobot-crawlers-and-policy/references/spam-policy-preflight.md`.
- `video-and-social-citation-surface` → `../seo-autobot-authority/references/video-and-social-citation-surface.md`.
- `websmith-audit-runner` → `../seo-autobot-agent-readiness/references/websmith-audit-runner.md`.
- `websmith-browser-agent-check` → `../seo-autobot-agent-readiness/references/websmith-browser-agent-check.md`.
- `websmith-checklist` → `../seo-autobot-agent-readiness/references/websmith-checklist.md`.
- `websmith-crawl-index-sweep` → `../seo-autobot-onsite/references/websmith-crawl-index-sweep.md`.
- `websmith-fix-pack` → `../seo-autobot-agent-readiness/references/websmith-fix-pack.md`.
- `websmith-intake-interview` → `../seo-autobot-agent-readiness/references/websmith-intake-interview.md`.
- `websmith-mcp-review` → `../seo-autobot-agent-readiness/references/websmith-mcp-review.md`.
- `websmith-report-writer` → `../seo-autobot-agent-readiness/references/websmith-report-writer.md`.
