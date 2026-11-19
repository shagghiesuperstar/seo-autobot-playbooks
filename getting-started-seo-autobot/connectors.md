# Connectors (full)

> Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. Generated from the Search Ops export (`connectors`). Skill names are mapped to staged slugs.


How to attach: check what is connected with `GetDynamicTools`; search the plugin/connector catalog (`SearchPlugins`) for named plugins; attach a remote MCP by URL with `AddMcpServer` only after the operator says yes; credentials are entered by the operator as masked secrets (none ship in this template). A pasted export always works instead of a connection. Never quote a number without live data; when a connector is down, skip the dependent skill and say which one was skipped.

## C1. competitor-and-link-data (capability)
- **transport:** http-mcp or REST
- **url:** the operator's own account (server URL or API token entered at install)
- **auth:** OAuth or API token, held as a masked secret
- **Needed by:** `ahrefs-research` (Read `../seo-autobot-research/references/ahrefs-research.md`), `seo-roast` (Read `../seo-autobot-onsite/references/seo-roast.md`), `vs-and-alternatives` (Read `../seo-autobot-research/references/vs-and-alternatives.md`)
- **Capabilities:** competitor top pages; backlink exports; domain authority per link; aggregated subreddit topics; prospect link-insertion candidates
- **Without it:** Gap diffs and the fake-authority check are skipped; say so rather than estimating.

## C2. live-serp-and-volume (capability)
- **transport:** http-mcp or REST v3
- **url:** the operator's own account (server URL or login entered at install)
- **auth:** login or API token, masked secret
- **Needed by:** `dataforseo-serp` (Read `../seo-autobot-research/references/dataforseo-serp.md`)
- **Capabilities:** live top-ten result URLs; keyword volume and cost-per-click; AI Overview references; LLM answer citations
- **Without it:** Clustering and intent locks drop to inference; label them unverified.

## C3. ai-answer-tracking (capability)
- **transport:** streamable-http
- **url:** https://aiseotracker.com/api/agent/mcp
- **auth:** OAuth, one-time per project
- **Needed by:** `aiseotracker` (Read `../seo-autobot-ai-visibility/references/aiseotracker.md`), `ai-seo-report` (Read `../seo-autobot-ai-visibility/references/ai-seo-report.md`), `content-coverage` (Read `../seo-autobot-research/references/content-coverage.md`)
- **Capabilities:** live prompt rankings; cited source URLs; competitor share of voice; weekly scan diffs across ChatGPT, Perplexity, Gemini, Copilot, and AI Overviews
- **Without it:** The GEO chain cannot run on live data; route to the prompt-mapping skill only.

## C4. transcription (capability)
- **transport:** streamable-http
- **url:** https://scribiz.com/mcp
- **auth:** account key, masked secret
- **Needed by:** `scribiz` (Read `../seo-autobot-content/references/scribiz.md`), `youtube-seo` (Read `../seo-autobot-content/references/youtube-seo.md`), `proof-kb` (Read `../seo-autobot-content/references/proof-kb.md`)
- **Capabilities:** speaker-labelled transcripts; on-screen text extraction; summaries; timestamped chapters
- **Without it:** Work from a transcript the operator supplies.

## C5. tool-directory (capability)
- **transport:** streamable-http
- **url:** https://awesome.tools/mcp
- **auth:** account key for submission, none for search
- **Needed by:** `awesome-tools` (Read `../seo-autobot-authority/references/awesome-tools.md`)
- **Capabilities:** search the catalogue; submit a listing; verify a badge backlink
- **Without it:** Use the JSON API path in the skill, or queue the submission for a human.

## C6. managed-link-building (capability)
- **transport:** https markdown + approval-gated checkout
- **url:** https://linkdr.com/SKILL.md
- **auth:** account login at checkout time
- **Needed by:** `linkdr` (Read `../seo-autobot-authority/references/linkdr.md`)
- **Capabilities:** DR-tier pricing per link; link insertions; listicle placements; single approval-gated checkout link
- **Without it:** Plan the mix and hand the operator the parameters; never quote a price from memory.

## C7. Notion (plugin)
- **transport:** marketplace plugin
- **pluginId:** 404
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Ideas board, briefs, question map, source map where the team writes.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C8. Slack (plugin)
- **transport:** marketplace plugin
- **pluginId:** 674
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Weekly report and topic watch in a channel, as drafts first.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C9. Linear (or any task tracker) (plugin)
- **transport:** marketplace plugin
- **pluginId:** 512
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Briefs and fixes filed as tickets on the content backlog.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C10. Google Sheets (plugin)
- **transport:** marketplace plugin
- **pluginId:** 47662908
- **pluginIdsAlt:** ['45893414']
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Ideas board and prompt rerun history as sheets; read keyword exports.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C11. Google Docs (plugin)
- **transport:** marketplace plugin
- **pluginId:** 45893412
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Briefs as docs.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C12. Google Drive (plugin)
- **transport:** marketplace plugin
- **pluginId:** 45893413
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Briefs in the writers' folder.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C13. Hex (plugin)
- **transport:** marketplace plugin
- **pluginId:** 651
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Tie organic and AI-referral pages to signups and deals.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C14. Profound (plugin)
- **transport:** marketplace plugin
- **pluginId:** 51168001
- **Needed by:** optional destination (no skill hard-depends on it)
- **Why:** Prompt volumes, AI mentions and citations for tracked prompts.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C15. Google Search Console (account-or-export)
- **transport:** connector or pasted export
- **Needed by:** `weekly-search-report` (Read `../seo-autobot-ai-visibility/references/weekly-search-report.md`), `page-audit-and-refresh-plan` (Read `../seo-autobot-onsite/references/page-audit-and-refresh-plan.md`), `prompt-rerun-tracker` (Read `../seo-autobot-ai-visibility/references/prompt-rerun-tracker.md`)
- **Why:** Connect via the account's connector setup or read a Search Console performance export (last 28 days, pages and queries). Search the plugin catalog for 'Search Console' first.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C16. Semrush (account-or-export)
- **transport:** connector or pasted export
- **Needed by:** `weekly-search-report` (Read `../seo-autobot-ai-visibility/references/weekly-search-report.md`), `page-audit-and-refresh-plan` (Read `../seo-autobot-onsite/references/page-audit-and-refresh-plan.md`), `prompt-rerun-tracker` (Read `../seo-autobot-ai-visibility/references/prompt-rerun-tracker.md`)
- **Why:** Optional. Read exports or connect the Semrush connector if the owner already pays for it.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C17. Bing Webmaster Tools (account-or-export)
- **transport:** connector or pasted export
- **Needed by:** `first-party-ai-visibility-ledger` (Read `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`), `fan-out-coverage-map` (Read `../seo-autobot-ai-visibility/references/fan-out-coverage-map.md`), `engine-source-plan` (Read `../seo-autobot-authority/references/engine-source-plan.md`)
- **Why:** Optional. AI Performance gives citations, cited pages, and grounding queries mapped to pages: the only first-party sub-query data. Read an export when no connection exists.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C18. ChatGPT Business Hub (account-or-export)
- **transport:** pasted figures or screenshot
- **Needed by:** `first-party-ai-visibility-ledger` (Read `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`), `entity-and-brand-memory-audit` (Read `../seo-autobot-authority/references/entity-and-brand-memory-audit.md`), `ai-referral-attribution` (Read `../seo-autobot-ai-visibility/references/ai-referral-attribution.md`)
- **Why:** Optional. Insights (mentions, website clicks, discovery topics) after the operator claims and verifies the business. The operator makes the claim; this bot only reads what they paste.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C19. Google Analytics (account-or-export)
- **transport:** connector or pasted export
- **Needed by:** `ai-referral-attribution` (Read `../seo-autobot-ai-visibility/references/ai-referral-attribution.md`), `first-party-ai-visibility-ledger` (Read `../seo-autobot-ai-visibility/references/first-party-ai-visibility-ledger.md`), `weekly-search-report` (Read `../seo-autobot-ai-visibility/references/weekly-search-report.md`)
- **Why:** Optional. The AI Assistant channel and conversions by landing page. Without it, attribution reports sessions it cannot see as unknown.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C20. Server or CDN logs (account-or-export)
- **transport:** file upload, bucket path, or log connector
- **Needed by:** `ai-bot-log-analysis` (Read `../seo-autobot-crawlers-and-policy/references/ai-bot-log-analysis.md`), `ai-inclusion-and-crawler-policy` (Read `../seo-autobot-crawlers-and-policy/references/ai-inclusion-and-crawler-policy.md`), `ai-referral-attribution` (Read `../seo-autobot-ai-visibility/references/ai-referral-attribution.md`)
- **Why:** Optional. Thirty days of access logs with user-agent and status. Without them bot reach is reported unmeasured, never estimated.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.

## C21. Product feed and Merchant Center (account-or-export)
- **transport:** feed file, hosted URL, or pasted diagnostics
- **Needed by:** `agentic-commerce-feed-parity` (Read `../seo-autobot-agent-readiness/references/agentic-commerce-feed-parity.md`)
- **Why:** Optional, stores only. The product feed and its diagnostics for the three-copy parity check.
- **Without it:** Skip it; accept a pasted export or keep the artifact in chat/files.


## C22. Real browser / Safari MCP (capability)
- **transport:** approved local or remote real-browser runner; Safari `safaridriver --mcp` needs a Mac.
- **Needed by:** `websmith-browser-agent-check`, `agentready-safari-checks`, `safari-27-mcp-optimization-autobot`.
- **Without it:** label raw-HTML checks PARTIAL and DOM checks UNTESTED; another real browser is allowed only with the engine named. Never claim Safari ran. No credentials or private hostnames ship.
- **Gate:** browse-only, sterile session; no login, form submit, cart mutation or checkout. Signed-in checks are separate specifically approved sessions.

## C23. Public HTTP and standards / cached-score reads (capability)
- **transport:** GET/HEAD; public standards and optional cached GET score lookups that trigger no scan.
- **Needed by:** `websmith-audit-runner`, `websmith-checklist`, `websmith-crawl-index-sweep`, `live-discovery-scorecard`.
- **Without it:** save exact error, mark UNTESTED, fail loud. No guessed score. Read the source standard live before quoting its date-sensitive rules.
- **Gate:** at most 1 request/second/host, timeouts/backoff, no load test. A public scan or third-party model transfer is not a read and needs its own per-domain approval. AgentPass is the only recommended outside scoring/fix-prompt service; no automatic scan.

## C24. Target MCP metadata / list reader (capability)
- **transport:** public server-card/OpenAPI reads and approved MCP `initialize`, `tools/list`, and other list/discover calls.
- **Needed by:** `websmith-mcp-review`, `agentready-safari-checks`.
- **Without it:** mark MCP checks UNTESTED or N/A with reason, use owner-provided schema exports as labeled evidence.
- **Gate:** never call `tools/call` from an audit without approval of one specific read-only call. No token/cookie copying, no auth settings imported from another bot.
