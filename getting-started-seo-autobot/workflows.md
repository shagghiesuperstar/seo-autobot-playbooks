# Workflows (full chains and gates)

> Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. Generated from the Search Ops export (`workflows`). Skill names are mapped to staged slugs.


## W1. Ship a proof-backed post that ranks and gets cited (`ship-a-proven-post`)
**When:** The operator wants one article that can win a term and show up in AI answers.

1. `dataforseo-serp` (Read `../seo-autobot-research/references/dataforseo-serp.md`): cluster by live URL overlap and lock the format for the target term → output: seo/<site-slug>/keyword-clusters.json, seo/intent-locks/<slug>.md
2. `proof-kb` (Read `../seo-autobot-content/references/proof-kb.md`): pull atomic first-hand proof, then write the receipt intro last → output: seo/<site-slug>/kb/proof/<category>/<id>.md
3. `seo-blog-images` (Read `../seo-autobot-content/references/seo-blog-images.md`): real capture or deterministic chart plus a compressed cover → output: inline visuals, cover file
4. `unslop-seo` (Read `../seo-autobot-content/references/unslop-seo.md`): strip tells and enforce the answer-engine structure → output: edited MDX, clean check
5. `internal-linking` (Read `../seo-autobot-onsite/references/internal-linking.md`): route contextual anchors to the money page → output: seo/<site-slug>/internal-links-report.md
6. `parasite-and-pr` (Read `../seo-autobot-copy-and-marketing/references/parasite-and-pr.md`): syndicate across a wire, a canonicalized mirror, and a network article → output: seo/<site-slug>/distribution/<slug>/

**Gate:** Approve the outline and the proof cards before prose; approve the distribution bundle before it leaves.

## W2. Capture buyers leaving a competitor (`capture-switchers`)
**When:** There is a named competitor and a budget for comparison pages.

1. `ahrefs-research` (Read `../seo-autobot-research/references/ahrefs-research.md`): diff competitor top pages and filter real links → output: seo/<site-slug>/competitor-gaps.md, seo/<site-slug>/link-targets.csv
2. `vs-and-alternatives` (Read `../seo-autobot-research/references/vs-and-alternatives.md`): mine public switching triggers, do the seat math, ship the routes → output: new /vs/ and alternative routes, nav and footer links
3. `reddit-serp` (Read `../seo-autobot-authority/references/reddit-serp.md`): find unlocked threads that already rank and draft practitioner replies → output: seo/<site-slug>/reddit-serp-queue.md
4. `honest-link-outreach` (Read `../seo-autobot-authority/references/honest-link-outreach.md`): pitch varied, ask-first emails to ranking pages → output: seo/outreach-batch-YYYY-MM-DD.md

**Gate:** Every trigger needs a source and a date; every reply needs a moderator-rule check.

## W3. Push a page-two URL into the top three (`page-two-to-top-three`)
**When:** A money page already ranks but sits below the fold.

1. `seo-title-optimization` (Read `../seo-autobot-onsite/references/seo-title-optimization.md`): fix intent match and truncation in title and H1 → output: edited titles
2. `blog-refresher` (Read `../seo-autobot-onsite/references/blog-refresher.md`): close entity and proof gaps against the current top ten → output: gap table plus rewrite
3. `intro` (Read `../seo-autobot-content/references/intro.md`): cut the bounce in the first eighty words → output: rewritten opening
4. `linkdr` (Read `../seo-autobot-authority/references/linkdr.md`): point a small number of high-authority contextual links at the refreshed URL → output: one approval-gated checkout link

**Gate:** Show the gap table before rewriting; one checkout, one approval.

## W4. Win citations in AI answers (`geo-visibility`)
**When:** The operator is invisible in assistant answers but ranks in Google.

1. `customer-journey` (Read `../seo-autobot-copy-and-marketing/references/customer-journey.md`): map buyer prompts across the five awareness stages → output: seo/<site-slug>/ai-prompts.md
2. `aiseotracker` (Read `../seo-autobot-ai-visibility/references/aiseotracker.md`): connect once and scan live answers → output: scanned prompts and cited sources
3. `ai-seo-report` (Read `../seo-autobot-ai-visibility/references/ai-seo-report.md`): brief on which third-party pages win and which topics are missing → output: seo/reports/YYYY-MM-DD.md
4. `content-coverage` (Read `../seo-autobot-research/references/content-coverage.md`): ship pages covering the unowned prompt clusters → output: seo/<site-slug>/content-map.md plus drafts

**Gate:** Approve the batch manifest before drafting; claim nothing the scans did not show.

## W5. Launch a new product from zero authority (`launch-from-zero`)
**When:** A new site with no links and no traffic.

1. `understand-customers` (Read `../seo-autobot-copy-and-marketing/references/understand-customers.md`): extract the buyer's own language before writing → output: buyer brief
2. `blitz-copy` (Read `../seo-autobot-copy-and-marketing/references/blitz-copy.md`): write the landing page on tension and payoff → output: page copy
3. `directory-submissions` (Read `../seo-autobot-authority/references/directory-submissions.md`): one manifest, then the five-wave cascade → output: submission-manifest.json, seo/<site-slug>/directories.md
4. `awesome-tools` (Read `../seo-autobot-authority/references/awesome-tools.md`): submit for a verified dofollow listing → output: listing
5. `blitz-seo` (Read `../seo-autobot-onsite/references/blitz-seo.md`): thirty-day sprint on the single commercial term → output: daily edits plus links

**Gate:** Manifest reviewed once, then waves run without re-asking; sprints only start after the base pages exist.

## W6. Run the site on autopilot (`daily-autopilot`)
**When:** The operator wants ongoing work without a standing brief.

1. `seo-autopilot` (Read `../seo-autobot-onsite/references/seo-autopilot.md`): health check, claim fact-check against recent commits, page-two push, sitemap diff, one reviewable PR → output: PR, seo/<site-slug>/log.md
2. `diff-marketing` (Read `../seo-autobot-copy-and-marketing/references/diff-marketing.md`): turn shipped code into a changelog and launch posts → output: changelog, social drafts

**Gate:** The PR is reviewed, not auto-merged; pruning is proposed with evidence.

## W7. Find out why nothing ranks (`teardown`)
**When:** Traffic or signups are flat and nobody knows why.

1. `seo-roast` (Read `../seo-autobot-onsite/references/seo-roast.md`): six-point decision procedure, kill fatal blockers in a fix PR, write a revenue-ordered roadmap → output: fix PR, seo/<site-slug>/roast-roadmap.md

**Gate:** Fatals ship first and alone; cosmetic work waits for the roadmap.

## W8. Move a domain or URL structure without losing traffic (`migrate`)
**When:** Rebrand, subdomain merge, or bulk slug change.

1. `domain-migration` (Read `../seo-autobot-onsite/references/domain-migration.md`): union URLs with backlinks, build one-hop redirects, verify, cut over canonicals and schema, email the linking sites → output: seo/<site-slug>/redirect-map.csv, verified run, seo/<site-slug>/backlink-transfer-emails.md

**Gate:** Every redirect verified before cutover; nothing ships on an unverified map.

## W9. Make a site findable, readable, and usable by answer engines and AI agents (`agent-readiness`)
**When:** The operator wants to be readable by assistants and browsing agents, asks for an AgentReady score, an MCP or security review, or says an agent can't complete a purchase or booking. Also the follow-up to any search chain that finds crawl or structured-data blockers.

1. `websmith-audit-runner` (**audit mode, read-only**): build or reuse `websmith/profiles/<domain>.md` from `seo/<site-slug>/context.md` plus interview Part `agent`; run the AgentReady v2.0 scorecard via `agentready-safari-checks` (AR-FIND-01..04, AR-READ-01..11 with AR-READ-10 retired, AR-ACT-01..10; Conforms / Does not conform); then the 129 checks in `websmith-checklist` (FIND, READ, ACT, MCP, AEO, SEC, COM, A11Y, and CRAWL via `websmith-crawl-index-sweep`); `websmith-mcp-review` when an MCP server exists; `websmith-browser-agent-check` for the rendered, buy-path, and accessibility checks (Safari 27 when available, otherwise the engine that ran, named) → output: `websmith/runs/<domain>/<run>/` with `agentready-scorecard.{json,md}`, `results.json`, raw evidence
2. `websmith-report-writer`: SUMMARY (one page) and REPORT (AgentReady scorecard first, blockers, fixes ranked impact ÷ effort, EXCEPTIONs, UNTESTED) → output: `websmith/runs/<domain>/<run>/REPORT.md`, `SUMMARY.md`; FAIL/WARN in CRAWL and AEO also land as dated lines in `seo/<site-slug>/backlog.md`
3. `websmith-fix-pack`: draft only the files the failing checks need (llms.txt, robots.txt, ai-catalog.json, JSON-LD, security headers, security.txt, MCP server card and annotations, crawl fixes) with placement steps per platform → output: `websmith/runs/<domain>/<run>/fix-pack/` plus README
4. **Ship (build mode, after a yes):** with a repo, turn the fix pack into one reviewable PR, fatals and BLOCKERs first, using `ai-discoverability-max-autobot` (Read `../seo-autobot-agent-readiness/references/ai-discoverability-max-autobot.md`) for the implementation recipes and `agent-discoverability-max` (Read `../seo-autobot-agent-readiness/references/agent-discoverability-max.md`) for the well-known surface; `image-seo-checklist` (Read `../seo-autobot-content/references/image-seo-checklist.md`) for failing images. Without a repo, hand over the fix pack and its README instead → output: PR link (never merged by the bot) or the handed-over fix pack
5. `websmith-audit-runner` **re-check mode** once the operator says it is live: re-run the last FAIL/WARN plus every MUST on production, show before → after, and list what to confirm in Search Console → output: new run folder and a before/after table

**Gate:** The audit writes nothing and runs no outside scan without a per-domain yes (AgentPass is the only one recommended). The PR needs its own yes, touches one concern at a time, and is never auto-merged. Deliberate owner choices stay EXCEPTION and are never "fixed". Nothing is called done until the same checks re-run on production and the numbers move.

## W10. Turn a ranking page into a cited one (`ranked-but-not-cited`)
**When:** A page ranks or is indexed for the buyer question but AI answers cite someone else.

1. `ai-inclusion-and-crawler-policy` (Read `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md`): confirm no control, header, or edge rule excludes the page → output: seo/<site-slug>/ai-access-policy.md
2. `fan-out-coverage-map` (Read `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md`): collect the real sub-queries and map each to a passage → output: seo/fanout/<slug>.md
3. `citable-passage-pass` (Read `../seo-autobot-ai-visibility/references/citable-passage-pass.md`): rewrite buried answers as self-contained answer-first paragraphs on the same page → output: diff, seo/passages/<slug>.md
4. `prompt-sampling-protocol` (Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md`): sample the cluster before and after, per engine → output: seo/prompt-samples/YYYY-MM-DD.csv

**Gate:** No new URL in this chain; the verdict waits until the before and after intervals separate.

## W11. Stand up AI measurement that survives scrutiny (`measure-ai-honestly`)
**When:** The operator wants AI visibility numbers they can put in front of a board or a client.

1. `first-party-ai-visibility-ledger` (Read `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`): pull each platform's own AI report beside its definition and annotate the timeline → output: seo/<site-slug>/ai-ledger.csv, seo/<site-slug>/annotations.md
2. `prompt-sampling-protocol` (Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md`): fix the clusters and conditions and sample to a reportable n → output: rate table with intervals
3. `ai-referral-attribution` (Read `../seo-autobot-ai-visibility/references/ai-referral-attribution.md`): separate provable, platform-claimed, and dark demand → output: seo/<site-slug>/ai-attribution.md
4. `weekly-search-report` (Read `../seo-autobot-ai-visibility/references/weekly-search-report.md`): report search and answer engines on their own lines → output: seo/reports/YYYY-MM-DD.md

**Gate:** No merged score, no position in an AI answer, no rate without its n.

## W12. Get into the sources the engines cite (`win-the-sources`)
**When:** The page is fine but answers are built from third-party sources that leave the operator out.

1. `source-map` (Read `../seo-autobot-authority/references/source-map.md`): list and sort the sources behind each lost prompt → output: source map rows
2. `engine-source-plan` (Read `../seo-autobot-authority/references/engine-source-plan.md`): build one dated plan per engine from sampled citations → output: seo/<site-slug>/engine-source-plan.md
3. `entity-and-brand-memory-audit` (Read `../seo-autobot-authority/references/entity-and-brand-memory-audit.md`): align the facts everywhere and prepare the profile claims → output: seo/<site-slug>/entity-audit.md
4. `earned-media-and-data-study` (Read `../seo-autobot-authority/references/earned-media-and-data-study.md`): one first-hand data asset and a vetted pitch list → output: seo/pr/<slug>/
5. `video-and-social-citation-surface` (Read `../seo-autobot-authority/references/video-and-social-citation-surface.md`): brief video or posts only where they recur in citations → output: seo/<site-slug>/video-social-surface.md

**Gate:** Every claim, pitch, and profile change is approved by the operator; paid placements are never counted as earned.

## W13. Make a store buyable through assistants (`agentic-commerce-ready`)
**When:** A store wants products shown or purchased inside assistants and AI search.

1. `agentic-commerce-feed-parity` (Read `../seo-autobot-agent-readiness/references/agentic-commerce-feed-parity.md`): prove feed, structured data, and page agree on every offer fact → output: seo/<site-slug>/feed-parity.csv
2. `ecomm-ai-discoverability` (Read `../seo-autobot-agent-readiness/references/ecomm-ai-discoverability.md`): publish the storefront's agent-readable layer → output: fix PR
3. `agent-ux-and-ard-conformance` (Read `../seo-autobot-agent-readiness/references/agent-ux-and-ard-conformance.md`): walk the buying tasks in three views and bring the manifest to conformance → output: fix PR, seo/<site-slug>/agent-ux-report.md
4. `ai-inclusion-and-crawler-policy` (Read `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md`): allow the search, user-triggered, and signed-agent classes; protect the costly routes → output: seo/<site-slug>/ai-access-policy.md

**Gate:** No feed submission, waitlist, or checkout change without a yes; no purchase during any walk.

## W14. Read a core update or model switch without guessing (`after-an-update`)
**When:** Traffic or AI visibility moved after a confirmed update or an announced model change.

1. `first-party-ai-visibility-ledger` (Read `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`): annotate the event and compare the right weeks once the rollout is complete → output: seo/<site-slug>/annotations.md, ledger rows
2. `prompt-sampling-protocol` (Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md`): resample the fixed clusters under the new model → output: rate table
3. `lost-prompt-diagnosis` (Read `../seo-autobot-onsite/references/lost-prompt-diagnosis.md`): bucket each real loss before any change → output: diagnosis log
4. `spam-policy-preflight` (Read `../seo-autobot-crawlers-and-policy/references/spam-policy-preflight.md`): check anything shipped in batches against the live policies → output: seo/spam-preflight/<slug>.md

**Gate:** Nothing ships while an update is still rolling out; overlapping events are reported as inseparable.

## W15. Ship a page batch that will not be read as scaled abuse (`ship-a-batch-safely`)
**When:** Persona listicles, comparison sets, or coverage pages are about to publish together.

1. `spam-policy-preflight` (Read `../seo-autobot-crawlers-and-policy/references/spam-policy-preflight.md`): PASS, FIX, or HOLD per page against the live policies → output: seo/spam-preflight/<slug>.md
2. `proof-kb` (Read `../seo-autobot-content/references/proof-kb.md`): supply the missing first-hand proof for FIX pages → output: proof cards
3. `citable-passage-pass` (Read `../seo-autobot-ai-visibility/references/citable-passage-pass.md`): one answer paragraph per question on the passing pages → output: diff
4. `ai-bot-log-analysis` (Read `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md`): confirm the new pages are fetched and what the bots receive → output: seo/<site-slug>/bot-log-report.md

**Gate:** A batch with any HOLD ships only its passing pages.


## W16. Agent layer before a domain cutover (`agent-cutover-readiness`)
**When:** replacing a site at the same domain.
1. `safari-27-mcp-optimization-autobot`: get preview URL and cutover date, run the pre-DNS recipe and clean-session smoke on preview; expected password/noindex gates stay labeled.
2. `agentready-safari-checks`: compare discovery files, structured data, canonical hosts, redirects, and agent/MCP manifests against current production. Produce a go/no-go checklist with blockers, cutover-only flips, and post-cutover checks.
3. After the owner confirms cutover, re-run on production within 24 hours and show before/after evidence.
**Gate:** read-only throughout; no DNS, deploy, merge, checkout, or gate change. Every expected exception has its reason. Missing browser is UNTESTED, not green.

## W17. Keep live discovery truth current (`discovery-control-plane`)
**When:** hosts or prior reports disagree about what is live, or discovery baselines drift.
1. `live-discovery-scorecard`: select the canonical production host, collect the fixed response sample, metadata, proof binds, category and sitemap counts, and soft-404 probes.
2. Compare last scorecard; annotate changed cells only. Route crawl defects to `websmith-crawl-index-sweep`, claim-proof gaps to `proof-kb`, and agent-file gaps to `ai-discoverability-max-autobot`.
3. Write one hitlist with evidence, expected status, owner, blast radius, and pass-when condition. Re-drop only on a real delta; otherwise one dated log line.
**Gate:** L0 measure only until a separate written yes unlocks a next rung. No branch replay, paid trial, routine activation, ticket creation, outreach, publish, merge, or client-site change.


## W18. Scored six-dimension site audit (`six-dimension-site-audit-run`)
**When:** The operator wants a scored, evidence-backed audit of one production site across SEO technical, content, speed, accessibility, CRO, and schema, or routing lands on R29.

1. `six-dimension-site-audit` (Read `../seo-autobot-onsite/references/six-dimension-site-audit.md`): confirm the production URL, crawl scope, priorities, and data sources (ask q39–q41 if unknown); crawl public pages only at the audit-mode rate limit; score measured checks only → output: `seo/<site-slug>/audits/YYYY-MM-DD.md`, `seo/<site-slug>/audits/latest.md`, baseline snapshots, evidence under `seo/<site-slug>/audits/evidence/YYYY-MM-DD/`
2. If a previous report or baseline exists, write `seo/<site-slug>/audits/YYYY-MM-DD-diff.md` with sections fixed / still open / new / regressions. No fix claimed without evidence.
3. Offer the next method, do not run it: crawl or index fatals to `seo-roast` or `websmith-crawl-index-sweep`; agent-readiness gaps to W9; a named weak page to `page-audit-and-refresh-plan`. Offer RT18 and RT19 in plain text, paused, only after a timezone is saved.

**Gate:** Read-only throughout (getting-started section 9). GET and HEAD only, at most 1 request per second per host. No live-site change, no PR, no outside PageSpeed or schema-validator URL fetch without a per-domain yes. Never invent a Lighthouse, traffic, ranking, or conversion number. Unmeasured checks are listed and excluded from scores. These dimension scores are never averaged with AgentReady or Websmith scores.
