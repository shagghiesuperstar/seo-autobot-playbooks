# Agent Websmith

**One agent that makes your website work for AI assistants, and checks it's safe while it's at it.**

Agent Websmith is a free, public Grok Bot template. Point it at any business website (Shopify, WooCommerce, Squarespace, Wix, Webflow, Medusa, or custom code) and it will:

1. **Interview you** in plain language (about 10 questions, around 5 minutes),
2. **Audit your site** with 117 read-only checks covering how AI assistants find, read, and act on it, plus security, commerce, and accessibility,
3. **Explain the results** in a one-page summary you can actually read, plus a full evidence report,
4. **Hand you a fix pack**: ready-to-paste files and settings for your exact platform, ranked by what matters most.

It never logs in, never buys anything, never changes your site, and never publishes your results anywhere without asking.

---

## Why this matters now

People increasingly ask an AI assistant instead of searching: "Who sells X near me?", "Does this store ship to Canada?", "What does their basic plan cost?" The assistant fetches websites live, reads what it can, and answers. If it can't read your site, it answers anyway, from whatever else it finds.

What the public data says (each figure comes from the named source; please read the caveats):

- **Assistants read the live web now, not just their training data.** In one 2026 study of 37,927 agent runs about 1,056 businesses, frontier models searched "about nine times out of ten when a fact is fresh," and training knowledge supplied about 7 to 10% of the finished answer. *Source: ora.ai/blog/ax-is-the-new-aeo*
- **When a site shuts agents out, the answers get worse, not fewer.** In that study, answers built without the business's own site were 3.7× more likely to miss every fact the buyer asked for. *Same source.*
- **Agent-ready businesses got recommended 1.9× more often** (up to 2.6× depending on the assistant). *Same source.*
- **About 1 in 10 sites block AI crawlers entirely.** Ora's April 2026 report (~50,000 scanned sites) found 88% shipped a robots.txt and 80% stayed reachable to every major AI crawler. In about 99% of journeys that hit a dead end on a site, the agent answered anyway. *Source: agentready.org (citing Ora data)*
- **The shopping side is moving fast.** On March 24, 2026, OpenAI expanded its Agentic Commerce Protocol to power product discovery in ChatGPT. It named Target, Sephora, Nordstrom, Lowe's, Best Buy, The Home Depot, and Wayfair as integrated, and it moved merchants to their own checkout instead of in-chat Instant Checkout. *Source: openai.com/index/powering-product-discovery-in-chatgpt*
- **Security rules caught up with checkout pages.** PCI DSS v4.0.1 requirements 6.4.3 and 11.6.1 (payment-page script control and tamper detection) became mandatory on March 31, 2025, with a specific eligibility criterion for merchants using embedded payment forms under SAQ A. *Source: blog.pcisecuritystandards.org*

> **Caveat:** the study numbers come from Ora, a company that sells agent-readiness scanning, and the AgentReady standard is maintained alongside it. They're the most detailed public data we found, but they aren't independent. Agent Websmith uses AgentReady as one input among many open standards and doesn't depend on any vendor.

---

## Who it's for

- **Business owners** who want to know "Can ChatGPT/Claude/Perplexity/Google actually answer questions about my business correctly?" and don't want to learn a dozen acronyms to find out.
- **Agencies and freelancers** who need a repeatable, evidence-backed audit and fix list for clients.
- **Developers** who want a precise checklist with exact test commands and sources.
- **Regulated sellers** (supplements, alcohol, tobacco, finance, health) who need agent-facing text to stay within approved claims.

---

## How it works, step by step

### 1. Say hi
Message the bot: *"Check my site"* or just paste your URL.

### 2. The intake interview (about 5 minutes)
The bot asks one question at a time, each with an example answer:

1. Your website address(es), and which one is live
2. What it's built on (or "not sure", and the bot will detect it)
3. What you want AI assistants to be able to answer or do (find products, check stock, book, get a quote)
4. Whether you sell anything with legal rules about claims. If so, you paste your approved wording.
5. Anything hidden on purpose (trade-only prices, age gates, regions you don't serve). These are marked **EXCEPTION**, not failures.
6. Whether AI tools may read and quote your site, and separately whether they may train on it
7. What you already have (MCP server, API, product feed, llms.txt), and "not sure" is fine
8. Who makes site changes (you, a developer, an agency, or platform settings only)
9. Whether outside scanners that publish scores may be used (default: ask each time) and your budget (default: $0)
10. How you want results delivered, and whether to re-check on a schedule

It saves your answers as a **site profile** so you never have to repeat them.

### 3. The audit (read-only)
117 checks in 8 groups. Each one has an exact test command, a pass/fail rule, a typical fix, and the source standard:

| Group | Checks | What it asks |
|---|---|---|
| **FIND** | 16 | Can AI crawlers and assistants reach your site? (robots.txt, firewalls, sitemaps, discovery files) |
| **READ** | 18 | Can they read the important facts without running JavaScript? Are the facts consistent? (llms.txt, structured data, status codes) |
| **ACT** | 11 | Can they do the tasks you care about? (stable URLs, browse-to-cart links, APIs, WebMCP) |
| **MCP** | 20 | If you have an MCP server: is it well described, safe, and discoverable? |
| **AEO** | 11 | Answer-engine basics: titles, entity facts, freshness, being citable |
| **SEC** | 18 | Security headers, HTTPS, security.txt, leaked secrets, payment-page scripts, privacy signals, regulated claims |
| **COM** | 10 | Commerce: product data, feeds for AI shopping (ACP), Universal Commerce Protocol, cart links, policies |
| **A11Y** | 13 | Accessibility (WCAG 2.2) and real-browser checks, which help people and browser-driving agents alike |

Every result is one of: **PASS, FAIL, WARN, N/A, EXCEPTION, UNTESTED**, with evidence saved to disk and labeled [VERIFIED], [INFERRED], [ATTESTED], or [UNKNOWN]. If something couldn't be tested, the report says so and why. Nothing is guessed.

**Real-browser pass (Safari 27):** if you have a Mac with Safari 27 and allow it, the bot drives Safari's built-in MCP server through home → category → product → cart view → checkout entry, and stops before payment. It does this in a clean session, the way a first-time AI agent sees it. Without a Mac, it uses another real browser and labels the results that way.

### 4. The report
- **One-page summary:** where you stand, the top 5 fixes, and roughly how hard each is.
- **Full report:** a scorecard per group (with raw counts, so you can check the math), blockers first, a fix plan ranked by impact versus effort, and all 117 rows with evidence, your EXCEPTIONs with their trade-offs, and what wasn't tested.

### 5. The fix pack
Say *"make my fix pack"* and you get draft files with placement steps for your platform:

- `llms.txt`: a plain-language map of your site for AI assistants
- `robots.txt`: let search and assistant crawlers in, and optionally say no to AI training (Content Signals)
- `/.well-known/ai-catalog.json` and an MCP **server card**, if you have agent tools
- **Structured data (JSON-LD)** for your business and products, matched to what's on the page
- **Security headers** in a safe rollout order (CSP starts in report-only mode)
- `security.txt`, `gpc.json` (Global Privacy Control), MCP tool annotations, and an optional WebMCP snippet
- A README per file covering where it goes on Shopify, WordPress/WooCommerce, Squarespace/Wix/Webflow, Next.js/Medusa, nginx/Apache, or Cloudflare, and the one command to check it's live

Then say *"it's live, re-check"*. The bot re-runs the failed checks and shows before → after.

---

## What it will never do

- **Never log in, buy, submit forms, or create accounts** on your site. All checks are read-only.
- **Never change your site.** It drafts files; you or your developer apply them.
- **Never send your site to a publishing scanner without asking.** Some free tools post scores publicly or send page text to outside AI models. The bot asks you in chat first, every time, per site. (A cached score lookup that triggers no scan is allowed.)
- **Never ask for passwords, API keys, or card numbers in chat.** If a key is ever needed, you set it as an environment variable.
- **Never copy a leaked secret.** If it finds one exposed on your site, it tells you privately so you can rotate it.
- **Never post, email, or message anyone** on your behalf without your explicit OK.
- **Never invent facts.** Missing details become "TODO" for you, and regulated text sticks to your approved wording only.
- **Never hammer your site.** At most 1 request per second, with timeouts and backoff.
- **Never guess a pass.** Failures are reported loudly.

---

## Standards it checks against

AgentReady v2.0 · Robots Exclusion Protocol (RFC 9309) · Sitemaps protocol · llms.txt · Model Context Protocol (2025-11-25 and 2026-07-28) and MCP Server Cards (SEP-2127) · AI Catalog · MCP Registry · WebMCP (draft) · schema.org and Google Search structured-data guidance · OpenAI Agentic Commerce Protocol feed spec · Universal Commerce Protocol · Shopify Storefront MCP/UCP · security.txt (RFC 9116) · OWASP Secure Headers, CSP and HTTP header guidance · HSTS preload · Global Privacy Control · PCI DSS v4.0.1 (6.4.3 / 11.6.1) · OWASP Top 10 for LLM Applications 2025, OWASP Agentic AI Top 10, OWASP MCP Top 10 (beta) · NIST CSF 2.0 and AI RMF · WCAG 2.2 · Core Web Vitals · FDA structure/function and FINRA 2210 (for regulated-claims awareness).

Some of these are still moving (the WebMCP API name, MCP server card paths, A2A card paths). The checklist lists every known conflict and marks anything unverifiable **UNVERIFIED** instead of guessing.

---

## What you get

- A saved **site profile**, so you never repeat yourself
- A **dated evidence folder** for every run
- A **one-page summary** and a **full report**
- A **fix pack** tailored to your platform
- **Re-checks** on demand or on a schedule

## Start

Message the bot with your website address. That's it.
