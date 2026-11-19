---
name: ai-discoverability-max-autobot
description: Use when a website (Astro, Next.js, Medusa storefront, or similar) needs to be made maximally readable by search engines (SEO), AI answer engines (AEO/AIO), generative engines (GEO), and AI agents browsing with Safari 27's safaridriver MCP or other agent browsers. One-shot implementation plus verification, with no change to what humans see.
version: 1.1.0
---

# AI Discoverability Max (SEO + AEO/AIO + GEO + Safari 27 MCP)

## Goal
Make the site as machine-readable as possible for search engines, AI answer engines, generative engines, and AI agents that browse with Safari 27's `safaridriver --mcp`. Do this WITHOUT changing the visual design or anything a human visitor sees. The only exceptions are accessibility fixes that are invisible or strictly additive.

## Hard rules
- Never invent facts, prices, reviews, ratings, credentials, awards, lab results, or stock levels.
- Never hide text from humans to manipulate rankings (no keyword stuffing, doorway pages, or invisible text).
- The agent layer MAY say things humans don't see, as long as it's true. Example: "humans must sign in because this is a licensed-retailer-only store; here is how to apply." Give agents the context and the rationale, and let them judge for themselves.
- Never change the visual design. Never touch payments, auth, secrets, DNS, or production deploys.
- Never put private data (wholesale/trade prices behind login, customer data, internal URLs, keys) into any public agent file unless the owner explicitly approves it.
- If a step is impossible, record why and keep going.

## 0. Discover first, then plan (do not skip)
- Detect the framework (Astro is likely if it runs on :4321), router, rendering mode, content sources (CMS, Medusa, MDX, JSON), host/CDN, and existing SEO setup. Read every route and content collection.
- Infer the business: what it is, who it serves, what it sells, location, and any legal/age/state/region/trade-only rules.
- Build ONE source-of-truth data module (e.g. `src/lib/site-facts.ts`) holding business name, description, contact, policies, rules, and catalog access. Every output below (pages' meta, JSON-LD, llms.txt, feeds, markdown twins) must read from it so nothing drifts.
- Write ambiguities to `AI-OPTIMIZATION-QUESTIONS.md` and proceed with safe defaults.
- Write `AI-OPTIMIZATION-PLAN.md` as a checklist mapped to every section below, then implement all of it.
- Take baseline screenshots of key pages (home, category, product/service, article, about, contact) for the visual-diff check at the end.

## 1. Crawlability and technical SEO
- Important content is in the initial HTML response (SSG/SSR). Nothing essential depends on client JS. Use islands only for interactivity.
- A single SEO component per page: unique `<title>` (60 chars max), meta description (155 chars max), canonical, `<html lang>`, charset, and viewport.
- Open Graph and Twitter cards with per-page 1200x630 images, plus `og:site_name`, `og:type`, and `og:locale`.
- `robots.txt`:
  - Explicitly allow search and AI crawlers: Googlebot, Bingbot, Applebot, Applebot-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, CCBot, DuckAssistBot, Meta-ExternalAgent, Amazonbot, MistralAI-User.
  - Disallow only genuinely private paths (cart, checkout, account, admin, internal APIs).
  - Link every sitemap. Never Disallow a URL that a sitemap lists.
  - Optional, owner's choice: a `Content-Signal:` line (search / ai-input / ai-train) stating AI usage preferences.
- Sitemaps: an index plus split sitemaps (pages, products/services, categories, posts) with true `<lastmod>`, image entries, and only 200-status canonical URLs.
- URLs: stable and readable, consistent trailing slashes, 301s for changed paths, a real 404 (status 404) with helpful links.
- Faceted/filtered/sorted URLs: canonicalize to the clean page, and don't let parameter variants bloat sitemaps. Paginated lists use real `<a href>` page links.
- `hreflang` with x-default if there's more than one language or region.
- Performance: green Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1); AVIF/WebP responsive images with width/height; lazy-load below the fold; eager loading with `fetchpriority=high` for the hero; `font-display: swap`; minimal JS.
- Security headers where the host allows: HSTS, a non-breaking CSP, Referrer-Policy, X-Content-Type-Options.
- RSS/Atom feeds for blog/news.
- IndexNow: generate a key file and ping on build/deploy so Bing, Yandex and others pick up changes fast. Document Google Search Console and Bing Webmaster Tools sitemap submission as an owner step.

## 2. Structured data (JSON-LD, validated)
- One `@graph` per page from a shared component. Use as applicable:
  - `Organization` (logo, sameAs, contactPoint) and `WebSite` (with `SearchAction` if real site search exists)
  - `WebPage` and `BreadcrumbList`
  - `Product` + `Offer`: price, priceCurrency, availability, url, itemCondition; sku/gtin/mpn/brand only if real. Include `OfferShippingDetails`, with region exclusions where shipping is restricted, and `MerchantReturnPolicy`.
  - `ItemList` on category/collection pages
  - `Article`/`BlogPosting` with real `Person` author, datePublished, and dateModified
  - `FAQPage` only for visible FAQs; `HowTo` only for visible steps
  - `LocalBusiness` only with a real location
  - `Review`/`AggregateRating` ONLY for real, visible reviews
  - Optional: `speakable` on key answer paragraphs
- Prices behind login (B2B/trade): no `Offer.price` in public markup. Describe how to get pricing instead.
- Add a build-time test that fails if JSON-LD name, price, or availability differs from the rendered page.

## 3. Content for answer engines (AEO/GEO)
- Every key page opens with a direct, quotable 1-2 sentence answer: what this is, who it's for, and what it costs or how to buy.
- Use question-shaped H2/H3 headings that match real user queries, each followed by a 40-60 word answer paragraph, then depth.
- Visible FAQ sections built from real questions the business can answer truthfully.
- Specs, comparisons, and definitions as real `<table>` / `<dl>`, never images.
- Consistent entity naming everywhere. Add a glossary page if the domain has jargon.
- E-E-A-T: About page, real author bios, contact info, shipping/returns/privacy/terms pages, "last updated" dates, and citations to primary sources for factual claims (lab reports, regulations, studies).
- Internal linking: every page reachable within 3 clicks, descriptive anchor text, related-content links, and a hub page per topic.
- Rules and compliance (age, state/region legality, trade-only) are stated plainly in text so agents can explain them correctly.

## 4. The AI-agent layer (files agents read)
- `/llms.txt` per llmstxt.org: an H1 with the site name, a blockquote summary, then link sections with one-line descriptions (key pages, policies, feeds, markdown twins). Include an "Agent context" section with who can buy, age/region limits, why any login or gate exists, how to apply or contact, and what agents may and may not do (for example, "do not attempt checkout on behalf of minors").
- `/llms-full.txt`: the full markdown of key pages, generated at build time from the same source.
- Markdown twins: each content page also served as `.md`, linked with `<link rel="alternate" type="text/markdown">`. Where the host allows, also return markdown when a request sends `Accept: text/markdown`.
- Catalog feed (if products or services exist): `/products.json` with name, url, price, currency, availability, image, description, category, and restrictions, built from the same data as the pages. Optionally add a Google Merchant-compatible XML feed.
- `/.well-known/security.txt`. Do not create speculative `.well-known` files that claim capabilities the site doesn't have.
- Optional, feature-detected only: expose real site actions (search, add to cart, contact) to in-browser agents via WebMCP (`navigator.modelContext`), guarded by `if ('modelContext' in navigator)`. Zero effect elsewhere.
- Every agent file returns 200 with the correct content-type, is linked from robots.txt or llms.txt, and is not blocked by CDN bot protection.

## 5. Safari 27 / safaridriver MCP and agent browsing
Agents drive pages through the accessibility tree, so:
- Use semantic landmarks (`header`, `nav`, `main`, `footer`, `aside`), one `h1`, and logical heading order. Add a skip link.
- Every control is a real `<a href>` or `<button>`, keyboard-reachable, with an accessible name. No clickable divs, hover-only menus, or mouse-only actions.
- Forms: `<label>`, correct `type`, `autocomplete`, `inputmode`, and visible errors tied with `aria-describedby`.
- Images: meaningful `alt`, or `alt=""` for decorative ones. Icon buttons get `aria-label`. Footer and social links have text names.
- Modals (age gate, cookies, popups) are real dialogs: focus-trapped, keyboard-dismissible, with clearly named buttons. The content under them stays in the HTML for crawlers.
- Stable `id`s or `data-testid`s on key elements: search, price, add-to-cart, quantity, nav, primary CTA.
- Price, availability, and key facts are DOM text, never baked into images or canvas.
- No infinite scroll without paginated links, and no JS-only tabs without a fallback.
- Respect `prefers-reduced-motion`. Don't let animations hide content from the accessibility tree.
- axe-core: zero serious or critical violations.

## 6. Bot access at the edge
- Check the CDN/WAF (Cloudflare, Vercel, Medusa Cloud, etc.) for "block AI bots", bot-fight modes, or challenge pages. Agent files and public pages must be reachable by the allowed crawlers.
- Verify with curl using real user-agent strings (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Applebot) and confirm each gets 200 plus real HTML, not a challenge page.
- If analytics exist, make sure AI/bot traffic is labeled rather than dropped, so the owner can see agent visits.

## 7. Verification (must pass before saying done)
Add these as scripts and wire them into CI or the build where possible:
- The build succeeds; serve the production build locally.
- Crawl every route: every page returns 200, no broken internal links, every sitemap URL returns 200, and no sitemap URL is Disallowed.
- JSON-LD validates against schema.org shapes and matches visible content.
- Lighthouse (mobile) on key pages: SEO 100, Accessibility 95+, Best Practices 95+, Performance 90+.
- axe-core: zero serious or critical issues.
- curl `/robots.txt`, `/llms.txt`, `/llms-full.txt`, sitemaps, feeds, and `.md` twins: check status, content-type, and content.
- curl key pages with no JS: main content, prices, and headings are present in raw HTML.
- Bot user-agent curl checks from section 6.
- Safari 27 smoke (on a Mac with Safari 27 and Remote Automation enabled; use `safaridriver --mcp`): open a tab, load home, a category, and a product/service page; read the accessibility tree; confirm the h1, price, availability, and a named primary CTA are present; confirm any age gate is a named dialog the agent can dismiss; no console errors. Browse only: no checkout, sign-up, or form submits.
- Visual diff against the baseline screenshots: no visible design changes beyond accessibility fixes.

## 8. Deliverables
- Small, well-named commits on a new branch. Do not push to main or deploy.
- `AI-OPTIMIZATION-REPORT.md`: what was added, where each file lives, test results with numbers, anything skipped and why, and open questions.
- `AI-OPTIMIZATION-MAINTENANCE.md`: how llms.txt, sitemaps, feeds, markdown twins, and JSON-LD stay in sync automatically when content changes, and how to re-run the checks.
- Owner to-do list: submit sitemaps to Search Console and Bing, confirm robots/Content-Signal choices, confirm what (if anything) gated prices agents may see, and approve the deploy.
