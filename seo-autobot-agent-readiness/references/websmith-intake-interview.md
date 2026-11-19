---
name: websmith-intake-interview
description: Site-profile schema and read-only platform detection for the Websmith audit skills. Inside ULTIMATE SEO/GEO/AEO/AIO AUTOBOT the questions are asked by getting-started-seo-autobot (interview Part agent), not here; use this skill to write or update websmith/profiles/<domain>.md and to detect the platform.
---

# Websmith intake interview

> **Inside ULTIMATE SEO/GEO/AEO/AIO AUTOBOT (2026-11):** do not run this as a separate interview. `getting-started-seo-autobot` asks these questions once (q1, q17, q26, q29, q10/q18 plus Part `agent` q30 to q34). Use the schema and platform detection below to save `websmith/profiles/<domain>.md`. The approvals question now names AgentPass as the only recommended outside scan.

You're interviewing a busy business owner who may not be technical. Keep it friendly and short. Ask one question at a time and give an example answer with each. Never ask for passwords, API keys, or card numbers.

## Before asking

1. Look for an existing profile at `websmith/profiles/<domain>.md` in the bot's store or workspace. If one exists, show a 5-line summary and ask "Still right?" Then only re-ask what changed.
2. If the owner already gave answers in chat, don't ask again. Confirm them.

## The questions (ask in this order, skip what's already known)

1. **Site.** "What's your website address? If you have more than one (shop, booking site, docs), list them all." Confirm which one is *production*. Label any staging or preview URL PREVIEW.
2. **Platform.** "What's it built on? Shopify, WooCommerce/WordPress, Squarespace, Wix, Webflow, Medusa, BigCommerce, custom code, or not sure?" If they're not sure, tell them you'll detect it from the page source and confirm later.
3. **What agents should do.** "When someone asks ChatGPT, Claude, Perplexity, or Google about you, what should the AI be able to answer or do? For example: find products, compare prices, check stock, book a time, get a quote, find opening hours." Capture the top 3 to 5 tasks in their words.
4. **Regulated?** "Do you sell anything with legal rules about what you can say? Supplements, alcohol, firearms, financial advice, health or medical, kids' products?" If yes: "Please paste or link your approved claims and required disclaimers. I'll only ever use those exact words."
5. **Deliberate restrictions.** "Is anything hidden or limited on purpose? Trade-only or wholesale pricing, login-to-see-prices, age gates, states or countries you don't ship to, blocked bots?" Record each one as an EXCEPTION. The audit won't fail you for choices you made on purpose.
6. **AI usage preferences.** "Are you OK with AI search tools reading and quoting your site? And with AI companies training on it? You can say yes to one and no to the other."
7. **Existing agent tech.** "Do you already have any of these: an MCP server, a public API, llms.txt, a product feed to ChatGPT or Google, or an app/plugin that does 'AI readiness'? Not sure is fine."
8. **Who fixes things.** "Who makes changes to the site? You, a developer, an agency, or the platform's settings only?" This decides how the fixes get written.
9. **Approvals.** "Some free outside scanners publish your score on a public leaderboard or send your page text to outside AI models. Do you want me to (a) never use those, (b) ask you each time, or (c) a specific one is fine?" Default to (b). Also ask: "Any budget for paid tools? Default is $0."
10. **Delivery.** "How do you want results: a one-page summary, the full report, or both? Should I check again on a schedule?"

## Save the profile

Write `websmith/profiles/<domain>.md` with these fields. Fill in "unknown" rather than guessing.

```
domain: example.com
production_urls: [https://example.com]
preview_urls: []
platform: shopify | woocommerce | squarespace | wix | webflow | medusa | bigcommerce | custom | unknown
platform_detected_from: <evidence, e.g. "cdn.shopify.com in HTML">
agent_tasks: ["find products", "check stock", ...]
regulated: no | yes (<category>)
approved_claims: <pasted list or link>   # empty if not regulated
required_disclaimers: <text>
exceptions:            # deliberate choices, never scored FAIL
  - id_hint: WS-FIND-02
    what: "Blocks all bots on /wholesale"
    why: "trade-only catalog"
ai_preferences: {search: yes, ai_input: yes, ai_train: no}
existing: {mcp: unknown, api: no, llms_txt: unknown, product_feed: unknown}
fixer: owner | developer | agency | platform-settings
third_party_scanners: never | ask-each-time | allowed: [<name>]
budget_usd: 0
delivery: summary | full | both
recheck: none | weekly | monthly
created: <YYYY-MM-DD CT>
```

## Detect the platform (read-only)

`curl -sS -m 20 -A '<Safari UA>' https://<domain>/ | grep -oiE 'cdn\.shopify\.com|wp-content|woocommerce|squarespace|wix\.com|webflow|_next/|medusa|bigcommerce' | sort -u`. Tell the owner what you found and let them correct it.

## Finish

Read the saved profile back in plain words (5 to 8 lines) and ask "Run the audit now?" Don't start any scan the owner hasn't okayed.

## Rules

- Plain words. Explain any acronym the first time ("MCP, a plug that lets AI assistants use your site's tools").
- Never collect secrets in chat. If a key is needed later, it goes in an environment variable the owner sets.
- If the owner skips a question, write "unknown" and move on.
