# The standard: the owner's AEO/AIO/SEO/GEO/MCP optimization brief (verbatim, received 2026-10-11)
This is the bar every site is scored against. Read SKILL.md "Overrides for our stores" before applying it:
store holds (<store> trade-only, <store> research gate, B2C wording) and our ship pipeline win where they conflict.

---

Make this site the most machine-readable site on the web, for search engines (SEO), AI answer engines (AEO/AIO), generative engines (GEO), and AI agents browsing with Safari 27's safaridriver MCP, WITHOUT changing the visual design or anything a human shopper/reader sees, except where accessibility fixes are invisible or strictly additive.

## 0. Discover first, then plan (do not skip)
- Detect the framework (likely Astro on :4321), router, content sources, build/deploy target, and existing SEO setup. Read every page/route and content collection.
- Infer the business: what it is, who it serves, what it sells/offers, location/legal constraints, and any pricing/age/state rules. If something is ambiguous, write it to `AI-OPTIMIZATION-QUESTIONS.md` and keep going with safe defaults. Never invent facts, prices, reviews, ratings, credentials, awards, or lab results.
- Write `AI-OPTIMIZATION-PLAN.md` with a checklist mapped to the sections below, then implement all of it.

## 1. Crawlability & technical SEO
- Every important page is server-rendered/static HTML with real content in the initial response (no content that only appears after JS). Prefer Astro static/SSR output; islands only for interactivity.
- Unique, descriptive `<title>` (≤60 chars) and meta description (≤155) per page from a single SEO component; canonical URL on every page; `<html lang>`; correct `charset` and `viewport`.
- Open Graph + Twitter card tags with per-page images (1200×630), `og:site_name`, `og:type`, `og:locale`.
- `robots.txt` that explicitly allows search and AI crawlers (Googlebot, Bingbot, Applebot, Applebot-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, CCBot, DuckAssistBot, Meta-ExternalAgent, Amazonbot, MistralAI-User) and links every sitemap. Block only genuinely private paths (cart, checkout, account, admin, API internals). Never Disallow a page that a sitemap lists.
- XML sitemaps: index + split sitemaps (pages, products/services, categories, posts), with accurate `<lastmod>`; image entries where useful. Only 200-status canonical URLs; no redirects or 404s.
- Clean, stable, human-readable URLs; trailing-slash consistency; 301s for any changed paths; a real 404 page with status 404 and helpful links.
- Performance: Core Web Vitals green (LCP < 2.5s, INP < 200ms, CLS < 0.1). Optimized responsive images (AVIF/WebP, width/height, lazy below the fold, eager+fetchpriority for the hero), font-display swap, minimal JS, preconnect/preload only where measured.
- Security/trust headers where the host allows: HTTPS assumptions, HSTS, sensible CSP that doesn't break the site, Referrer-Policy.
- RSS/Atom feed for any blog/news content.

## 2. Structured data (JSON-LD, validated)
- One `@graph` per page via a shared component. Include as applicable: `Organization` (logo, sameAs, contactPoint), `WebSite` (+ `SearchAction` if there is site search), `WebPage`, `BreadcrumbList`, `Product` + `Offer` (price, priceCurrency, availability, url, sku/gtin/brand only if real), `ItemList` on category pages, `Article`/`BlogPosting` (author, datePublished, dateModified), `FAQPage` only where visible FAQs exist, `HowTo` only where real steps are visible, `LocalBusiness` only if it truly has a location, `Person` for real authors, `Review`/`AggregateRating` ONLY if real reviews exist on the page.
- Structured data must match visible content exactly (same prices, names, availability). Add a build-time check that fails if JSON-LD price/name differs from the rendered page.

## 3. Content for answer engines (AEO/GEO)
- Each key page opens with a direct, quotable 1–2 sentence answer to "what is this / who is it for / what does it cost", then detail.
- Question-shaped H2/H3s matching real user queries; concise answer paragraphs (40–60 words) right under them; then depth.
- Visible FAQ sections on key pages, built from real questions the business can answer truthfully.
- Comparison tables, specs, and definitions as real HTML `<table>`/`<dl>`, not images.
- Clear entity naming: consistent business name, product names, and terms everywhere; a glossary page if the domain has jargon.
- E-E-A-T signals: About page, author bios, contact info, policies (shipping, returns, privacy, terms), "last updated" dates, and citations to primary sources where claims are made.
- Internal linking: every page reachable within 3 clicks; descriptive anchor text (never "click here"); related-content links; hub pages per topic.
- Do NOT add keyword stuffing, hidden text, doorway pages, or fake content.

## 4. The AI-agent layer (files agents read)
- `/llms.txt` (per llmstxt.org): H1 site name, a blockquote summary, then sections of links with one-line descriptions to the most important pages and machine-readable resources. Plainly state context and rules (who can buy, age/region limits, why any login exists, how to contact/apply) so an AI can explain the site accurately.
- `/llms-full.txt`: the full plain-text/markdown content of key pages concatenated, generated at build time from the same source as the pages so it never drifts.
- Markdown twins: every content page also available as `.md` (e.g. `/about.md` or `/about/index.md`) generated at build time, linked with `<link rel="alternate" type="text/markdown">`.
- Machine-readable catalog if there are products/services: `/products.json` (and/or a feed) with name, url, price, currency, availability, image, description, category, built from the same data as the pages.
- `/.well-known/` as appropriate: `security.txt`; and expose the llms.txt/feeds there by link where useful. Don't create speculative well-known files that claim capabilities the site doesn't have.
- Optional, feature-detected only: if the site has real actions (search, add to cart, contact form), expose them to in-browser agents via WebMCP (`navigator.modelContext`) behind `if ('modelContext' in navigator)`, with zero effect on browsers that lack it.

## 5. Safari 27 / safaridriver MCP and agent browsing
Agents drive the page through the accessibility tree, so:
- Semantic HTML landmarks (`header`, `nav`, `main`, `footer`, `aside`), one `h1` per page, logical heading order.
- Every interactive element is a real `<a href>` or `<button>`, keyboard reachable, with an accessible name. No clickable `div`s, no hover-only menus, no actions that exist only on mouse events.
- All form fields have `<label>`, correct `type`, `autocomplete`, `inputmode`, and visible error text tied with `aria-describedby`.
- Images: meaningful `alt`; decorative images `alt=""`. Icon buttons get `aria-label`. Footer/social links have text names.
- Modals (age gates, cookie banners, popups) are real dialogs (`<dialog>` or proper ARIA), focus-trapped, dismissible by keyboard, with clearly named buttons, and they never block crawlers from the underlying HTML.
- Stable, meaningful `id`s/`data-testid`s on key elements (search box, add-to-cart, price, nav).
- Prices, availability, and key facts are rendered as text in the DOM, not inside images or canvas.
- No infinite scroll without paginated links; no content behind JS-only tabs without a fallback.
- Pass axe-core with zero serious/critical violations.

## 6. Verification (must pass before you say done)
Add scripts and run them, fixing everything they find:
- `npm run build` succeeds; then serve the production build locally.
- Crawl every route: all 200, no broken internal links, every sitemap URL resolves 200, no sitemap URL is Disallowed in robots.txt.
- JSON-LD validates (schema.org shape) and matches visible content; run a Rich Results–style check locally where possible.
- Lighthouse (mobile) on key pages: SEO 100, Accessibility ≥ 95, Best Practices ≥ 95, Performance ≥ 90.
- axe-core: zero serious/critical issues.
- Fetch `/robots.txt`, `/llms.txt`, `/llms-full.txt`, sitemaps, feeds, and `.md` twins with curl and confirm content-types and content.
- Fetch key pages with curl (no JS) and confirm the main content, prices, and headings are present in raw HTML.
- Visual check: screenshot key pages before and after; confirm no visible design changes beyond accessibility fixes.

## 7. Deliverables
- All code changes in small, well-named commits on a new branch (do not push to main or deploy).
- `AI-OPTIMIZATION-REPORT.md`: what was added, where each file lives, test results with numbers, anything skipped and why, and the open questions for the owner.
- A short `AI-OPTIMIZATION-MAINTENANCE.md`: how llms.txt, sitemaps, feeds, and JSON-LD stay in sync automatically when content changes.

Rules: never fabricate facts, reviews, ratings, prices, or credentials; never hide text from humans; never change visual design; never touch payments, auth, secrets, or production deploys. If a step is impossible, record why and continue.
