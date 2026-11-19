# Dated platform facts (catch-up layer)

Every line here was read on 2026-11-17 and will go stale. Treat this file as a list of things to re-verify, not as a source to quote. A skill that needs one of these facts fetches the platform's live page first and updates the line and its date in the same run. If the live page disagrees, the live page wins and the skill says so.

## Measurement surfaces

| Fact | Date |
| --- | --- |
| Search Console Generative AI performance report available to all sites; impressions only, AI Overviews and AI Mode combined, no queries | 2026-08-31 |
| Search Console Search generative AI control available to all sites; excludes from AI Overviews, AI Mode, Discover AI features; child properties inherit | 2026-08-31 |
| Search Console AI impression = a link to the site shown; expandable links count once expanded | 2026-06-25 |
| Search Analytics API gains branded filter, multimodal search type, multi-country and multi-device filters | 2026-11-16 |
| Search Console platform properties (Instagram, TikTok, X, YouTube) worldwide | 2026-07-29 |
| Bing Webmaster AI Performance public preview; grounding queries mapped to pages | 2026-02-10 |
| Bing Intents, Topics, Citation Share, Compare in preview | 2026-06-16 |
| Bing Topics Portfolio beta | 2026-10-13 |
| ChatGPT Business Hub beta: claim, verify, Insights (mentions, website clicks, discovery topics, 28 days) | 2026-11-10 |
| Google Analytics AI Assistant default channel; medium `ai-assistant` | 2026-05-13 |

## Ranking, policy, and model events

| Fact | Date |
| --- | --- |
| Google core update began; up to two weeks to roll out | 2026-11-10 |
| AI Mode default model changed; Google says fan-out and linking improved | 2026-11-12 |
| Site reputation policy revised | 2026-08-28 |
| Guidance to noindex pages made for sharing, collaboration, or utility by default | 2026-10-26 |
| Google's AI-features guide: no special files, markup, or chunking required; pages per fan-out variant made to manipulate fall under scaled content abuse; llms.txt neither helps nor hurts in Search | read 2026-11-17 |

## Agent and commerce surface

| Fact | Date |
| --- | --- |
| web.dev guide to agent-friendly sites (ghost elements, semantic controls, 8 square pixel minimum, stable layout) | 2026-04-01 |
| Lighthouse 13.5 ARD audit documentation, validating ARD v0.91; `Agentmap:` robots directive, `rel="ard"`, `/.well-known/ard.json` | 2026-10-20 |
| llms.txt v2 adds link relations and a header for pointing agents to Markdown versions | 2026-08-17 |
| OpenAI product feeds: discovery only, stable `item_id`, upload, hosted URL, or SFTP; setup through Business Hub | read 2026-11-17 |
| Google UCP: native checkout default, embedded by approval, waitlist; lodging and food waitlists open | read 2026-11-17 |
| Web Bot Auth: IETF draft on RFC 9421; ChatGPT cloud browser signs as chatgpt.com | read 2026-11-17 |

## Studies quoted by the skills

| Study | Window | What it is good for |
| --- | --- | --- |
| Chen and Koudas, arXiv 2610.15033 | 90 days to 2026-10 | Retrieval and model memory outweigh page-level tweaks |
| Pillarbase text-fragment census | 2026-06 | Shape of passages AI Mode highlights |
| SparkToro and Gumshoe consistency study | 2026-01 | Why a rate with n, never a position |
| Muck Rack and Generative Pulse, What Is AI Reading | 2026-10 edition | Earned against paid and owned share; crawler blocking |
| Meltwater AI search visibility report | 2026-10 | Per-engine source mix and month-to-month volatility |

Each is one dataset with its own sampling. Quote the number with the study and its window, never as a general law.
