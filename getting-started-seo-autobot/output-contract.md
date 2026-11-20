# Output contract

> Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. Generated from the Search Ops export (`outputContract`). Skill names are mapped to staged slugs.


State directory: `seo/`

## Artifacts
| Path | What |
|---|---|
| `seo/<site-slug>/context.md` | site, repo, money pages, routing decisions, unknowns, plus crawl_scope, page_cap, audit_priorities, and audit_data_sources when a six-dimension audit is in scope |
| `seo/<site-slug>/log.md` | one dated line per run, newest last |
| `seo/<site-slug>/backlog.md` | ranked, dated next actions |
| `seo/<site-slug>/kb/brand-ssot.md` | product mechanics, pricing tiers, boundaries, banned public fields |
| `seo/<site-slug>/kb/proof/<category>/<id>.md` | one atomic proof card per benchmark, customer, number, or workflow |
| `seo/<site-slug>/kb/pages-index.md` | which page uses which proof card |
| `seo/<site-slug>/kb/competitors/claims-to-beat.md` | rival claims with their source and date |
| `seo/<site-slug>/kb/open-questions.md` | proof gaps still unanswered |
| `seo/<site-slug>/keyword-clusters.json` | clusters built from live top-ten URL overlap |
| `seo/<site-slug>/keyword-map.csv` | monthly keyword to URL map |
| `seo/intent-locks/<slug>.md` | the required format for a page, locked before writing |
| `seo/<site-slug>/content-map.md` | planned pages mapped to prompt clusters and keywords |
| `seo/<site-slug>/citation-gaps.md` | prompts a competitor owns and the site does not |
| `seo/<site-slug>/tool-specs.md` | free-tool build specs, filtered by value not volume |
| `seo/<site-slug>/competitor-gaps.md` | top-page diffs with the highest-value gap scaffolded |
| `seo/<site-slug>/link-targets.csv` | link prospects with fake-authority flags |
| `seo/<site-slug>/insertion-targets.md` | exact pages on a prospect site where a link fits |
| `seo/outreach-batch-YYYY-MM-DD.md` | SEND/CUT table plus structurally varied drafts |
| `seo/<site-slug>/reddit-serp-queue.md` | qualified threads with replies that survive moderation |
| `seo/<site-slug>/roast-roadmap.md` | revenue-ordered fixes, fatal first |
| `seo/<site-slug>/internal-link-graph.json` | repo link graph, before and after |
| `seo/<site-slug>/internal-links-report.md` | inbound-link before/after table per money page |
| `seo/<site-slug>/redirect-map.csv` | old URL to new URL, one hop each |
| `seo/<site-slug>/backlink-transfer-emails.md` | outreach to the sites that link to the old URLs |
| `seo/<site-slug>/url-inventory.csv` | every URL with its new home |
| `seo/<site-slug>/directories.md` | wave-ordered submission tracker |
| `seo/reports/YYYY-MM-DD.md` | per-run report |
| `submission-manifest.json` | one product manifest reused across every registry |
| `seo/<site-slug>/distribution/<slug>/` | press release, canonicalized mirror post, article, checklist |
| `seo/<site-slug>/data/` | raw connector pulls, dated, never edited by hand |
| `seo/fanout/<slug>.md` | sub-queries per buyer prompt with source, covering passage, status, and edit |
| `seo/passages/<slug>.md` | passage inventory: question, answer paragraph, word count, observed highlights |
| `seo/<site-slug>/ai-ledger.csv` | first-party AI metrics per platform with definition, window, and pull date |
| `seo/<site-slug>/annotations.md` | dated updates, model switches, reporting changes, and shipped site changes |
| `seo/prompt-samples/YYYY-MM-DD.csv` | raw prompt runs with conditions, mention, citation, and cited domains |
| `seo/<site-slug>/engine-source-plan.md` | per-engine cited sources and Own/Claim/Earn/Contest actions, dated |
| `seo/pr/<slug>/` | data asset outline, SEND/CUT outlet table, pitch drafts, indexability checks |
| `seo/<site-slug>/entity-audit.md` | canonical fact sheet, mismatch table, and profile claim checklist |
| `seo/<site-slug>/feed-parity.csv` | feed, JSON-LD, and visible values per sampled product and field |
| `seo/<site-slug>/ai-access-policy.md` | state of every inclusion control and bot rule, decisions per bot class, and the diff |
| `seo/<site-slug>/agent-ux-report.md` | task walks in three views and manifest findings, before and after |
| `seo/spam-preflight/<slug>.md` | PASS, FIX, or HOLD per page or placement with the policy tested |
| `seo/<site-slug>/bot-log-report.md` | bot reach, status mix, unfetched money pages, requested-but-missing URLs |
| `seo/<site-slug>/ai-attribution.md` | provable, platform-claimed, and dark AI demand in separate tables |
| `websmith/profiles/<domain>.md` | site profile for audits: production URLs, platform, agent tasks, approved claims, EXCEPTIONs, scanner approvals |
| `websmith/runs/<domain>/<YYYY-MM-DD-HHMM>/` | one audit or re-check: raw evidence, `agentready-scorecard.{json,md}`, `results.json`, `REPORT.md`, `SUMMARY.md`, `fix-pack/` |
| `seo/<site-slug>/audits/YYYY-MM-DD.md` | scored six-dimension site audit (scores, P0/P1/P2, unmeasured) |
| `seo/<site-slug>/audits/YYYY-MM-DD-diff.md` | four-way diff: fixed / still open / new / regressions |
| `seo/<site-slug>/audits/latest.md` | copy of the latest full six-dimension report |
| `seo/<site-slug>/audits/baseline/` | small snapshots: titles, status, canonical, HTML hashes, short extracts |
| `seo/<site-slug>/audits/evidence/YYYY-MM-DD/` | screenshots and tool links for that six-dimension run |
| `seo/<site-slug>/audits/IMPROVEMENTS.md` | dated process notes from the weekly audit self-improve routine |
| `seo/<site-slug>/video-social-surface.md` | video and social citations per tracked question, asset audit, and briefs |

## Approval gates (stop and get an explicit yes)
- Any directory or registry submission
- Any checkout link the operator will pay through
- Any outreach email before it is sent
- Any public reply or thread post
- Any rewrite that touches more than one URL in a single PR
- Anything that publishes a personal name, address, or private customer detail
- Any change to the Search generative AI control, a robots rule, a snippet directive, or an edge bot setting
- Any claim, verification, or edit of an assistant or search business profile
- Any product feed submission, commerce waitlist, or checkout change
- Any pitch to a journalist or outlet, and any paid placement
- Any batch of similar pages that has not passed the spam-policy preflight
- Any correction request to a reference site
- Any outside scan of a domain (AgentPass or other), once per domain
- Any MCP `tools/call`, even to a read-only tool
- Turning an audit fix pack into a PR, and any security-header, robots, or well-known file change it carries

## Writing rules
- Every claim in shipped copy traces to a proof card or a dated source.
- Numbers carry their date and the method that produced them.
- One hop per redirect; verify the map before and after cutover.
- Answer the page's question in the first forty words.
- Keep the operator's voice; strip tells, not personality.
- Each buyer question gets one self-contained answer paragraph of 75 to 150 words with the subject named in full.
- AI visibility is written as a rate with its n and interval per engine, never as a position.
- A platform metric is written beside the platform's definition of it and the date it was pulled.
- Platform, policy, and protocol facts carry the date they were read.
