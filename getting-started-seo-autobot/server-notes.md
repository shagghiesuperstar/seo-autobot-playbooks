# Known server notes

> Part of ULTIMATE SEO/GEO/AEO/AIO AUTOBOT. Generated from the Search Ops export (`knownServerNotes`). Skill names are mapped to staged slugs.


1. Three skills self-describe as live documents and must be fetched before use: the AI-answer tracker setup, the report brief, the content-coverage planner, and the managed link builder. Quoting them from memory is the most common failure.
2. The managed link builder serves its instructions as markdown from a single URL and takes a checkout call with URL parameters; the operator approves one link, not a campaign.
3. The AI-answer tracker's server is one HTTP endpoint with OAuth; the connection is per project and only needs doing once.
4. The tool directory offers three paths (remote server, browser tools, JSON API). Try them in that order; the free listing path needs a badge backlink to verify.
5. The competitor-data skill ships four distinct workflows — gap diffing, authority audit, community topic mining, and insertion matching. They are separate runs, not one pass.
6. The transcript path degrades gracefully: if the transcription connector is absent, ask for a transcript file before reaching for a video skill.
7. The firewall skill's own advice is to serve a real page with a 200 instead of an error, and to verify the search crawler by network identity, because user-agent is trivially spoofed.
8. The clustering skill's whole point is that semantic similarity cannibalizes; only live URL overlap is trustworthy.
9. The refresh skill demands an approval gate between the gap table and the rewrite. Skipping it is what produces rewrites nobody wanted.
10. Snapshot data goes stale: attach the pull date to every number that came from a connector.
11. Catch-up layer (2026-11-17): fourteen skills, four supporting files, and eighteen methods were added without changing any existing skill body except one appended section in the getting-started skill. Where an older instruction and a catch-up skill disagree, dedupe.precedence decides.
12. Every dated platform fact in the catch-up skills is also listed in search-ops/references/dated-platform-facts.md. Re-read the live page before quoting; the register is a list of things to verify, not a source.
13. Older skill bodies verify crawler access with a curl that sets a bot user-agent. Keep the check, but report it as a hint: only the edge provider's verified-bot field, a published network range, or a request signature confirms identity.
14. Search Console's generative AI report has no query dimension and combines AI Overviews with AI Mode. Any connector or tracker that shows AI queries or AI positions for Google is estimating; label it as a third-party sample.
15. ChatGPT Business Hub has no export this bot can call. Its Insights figures arrive as pasted numbers or a screenshot, and the claim and identity verification are the operator's own acts.
16. The three helper scripts are standard-library Python with no network calls. ai_bot_log_summary.py carries a dated fallback bot list; pass a fresh bots.json built from the vendors' published token lists.
17. ARD, WebMCP, Web Bot Auth, llms.txt v2, and the agentic commerce protocols are drafts or previews. Record the spec or tool version with every score, and never present a passing manifest audit as proof the endpoint works.
