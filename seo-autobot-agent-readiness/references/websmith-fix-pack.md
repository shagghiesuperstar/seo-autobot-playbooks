---
name: websmith-fix-pack
description: Use when the owner asks for the fixes, a fix pack, the files, or "how do I fix this" after an audit. Drafts ready-to-paste llms.txt, robots.txt, ai-catalog.json, JSON-LD, security headers, security.txt, gpc.json, MCP server card, and tool annotations, with placement steps for the owner's platform. Drafts only. Never deploys.
---

# Websmith fix pack

> **Inside ULTIMATE SEO/GEO/AEO/AIO AUTOBOT (2026-11):** this skill is part of W9 `agent-readiness` and runs in audit mode (read-only; `getting-started-seo-autobot` section 9). It writes only under `websmith/`. Fixes reach the site only through W9 step 4 (one reviewable PR, after a yes).
>
> In W9, these drafts are the input to step 4. With a repo and the owner's yes, the AUTOBOT turns them into one reviewable PR (BLOCKERs first, never auto-merged). Without a repo, hand them over as below. Either way this skill itself never commits, pushes, or deploys. If the owner pasted an AgentPass report, map its fix prompts to the matching drafts and cite the check id.

Writes files into `websmith/runs/<domain>/<run>/fix-pack/`, plus a `README.md` that walks through each one: what it is, where it goes on your platform, and how to check it worked.

## Rules

- **Draft only.** Never upload, deploy, commit, push, edit a CMS, or change DNS/CDN settings. The owner or their developer applies the files. If they ask you to deploy, explain that this bot only drafts and point them to the platform step.
- Use only facts from the site itself, the saved evidence, or the owner's answers. Mark missing facts `TODO(owner): ...`. Never invent prices, hours, addresses, SKUs, GTINs, ratings, or reviews.
- Regulated sites: agent-facing copy uses only the profile's `approved_claims` and `required_disclaimers`, word for word.
- Respect EXCEPTIONs. Never "fix" a deliberate choice (for example, don't unhide trade-only prices). Explain the trade-off instead.
- No secrets, internal hostnames, staff-only emails, or private endpoints in any public file. Run the WS-SEC-10 grep on the drafts before handing them over.
- Security headers ship in a safe order: CSP starts as `Content-Security-Policy-Report-Only`. HSTS `preload` only after the owner confirms every subdomain is HTTPS.

## Files (generate only what the failing checks need)

### 1. `llms.txt` (site root). Format per llmstxt.org.
```markdown
# {Business name}

> {One or two sentences: what you sell or do, for whom, where.}

{Optional short paragraph: key facts an assistant should get right, e.g. ships to US only, trade accounts need approval.}

## Products / Services
- [{Category or service}]({absolute URL}): {what's there}

## Policies
- [Shipping]({url}): {one line}
- [Returns]({url}): {one line}

## Help
- [FAQ]({url}): {one line}
- [Contact]({url}): {phone/email/hours if public}

## Agent context
- Prices and stock: {where the live source is, e.g. product pages or /products.json}
- Actions: {MCP endpoint or "browse and check out on the site; no agent API"}

## Optional
- [{Lower-priority page}]({url})
```
Link only to URLs that returned 200 in this run. Add `<link rel="alternate" type="text/markdown" href="/llms.txt">` to the HTML head if the platform allows it.

### 2. `robots.txt`
```
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /account
# Optional Content Signals (contentsignals.org). Owner's choice from the profile:
Content-Signal: search=yes, ai-input=yes, ai-train={yes|no}

Sitemap: https://{domain}/sitemap.xml
```
To block training only: add groups for training crawlers (e.g. `User-agent: GPTBot` / `Disallow: /`, `User-agent: Google-Extended` / `Disallow: /`, `User-agent: CCBot` / `Disallow: /`). Never block search/user-triggered agents (`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`) unless the owner chose to. Keep the file under 500 KiB.

### 3. `/.well-known/ai-catalog.json` (serve as `application/ai-catalog+json`)
```json
{
  "specVersion": "1.0",
  "entries": [
    {
      "identifier": "urn:air:{domain}:mcp:{name}",
      "type": "application/mcp-server-card+json",
      "url": "https://{mcp-host}/mcp/server-card"
    }
  ]
}
```
Only list artifacts that exist. Add `<link rel="ai-catalog" href="/.well-known/ai-catalog.json">` in `<head>` and/or a `Link: </.well-known/ai-catalog.json>; rel="ai-catalog"` header. Check entry types against the current spec at ai-catalog.io before publishing.

### 4. MCP server card (`<mcp-url>/server-card`, `application/mcp-server-card+json`)
Sketch. SEP-2127 names these identity fields: `name`, `version`, `description`, optional `title`, `icons`, `repository`, `websiteUrl`, plus remote transport endpoints. **Validate the exact shape against the `experimental-ext-server-card` schema before shipping.** The `remotes` layout below is INFERRED from the MCP Registry `server.json`.
```json
{
  "name": "{reverse-dns or brand name}",
  "title": "{Business} store assistant",
  "version": "1.0.0",
  "description": "Search products, check stock and prices, build a cart link.",
  "websiteUrl": "https://{domain}",
  "remotes": [{ "type": "streamable-http", "url": "https://{mcp-host}/mcp" }]
}
```
No tools list (by design), no tokens, no internal hosts.

### 5. MCP tool annotations + outputSchema (for the developer)
```json
{
  "name": "search_products",
  "title": "Search products",
  "description": "Search the public catalog by keyword. Returns name, price, currency, availability, and URL.",
  "inputSchema": {"type":"object","properties":{"q":{"type":"string","maxLength":200},"limit":{"type":"integer","minimum":1,"maximum":50}},"required":["q"],"additionalProperties":false},
  "outputSchema": {"type":"object","properties":{"items":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"price":{"type":"string"},"currency":{"type":"string"},"availability":{"type":"string"},"url":{"type":"string"}},"required":["name","url"]}}},"required":["items"]},
  "annotations": {"readOnlyHint": true, "openWorldHint": false}
}
```
See the annotation table in `websmith-mcp-review`.

### 6. JSON-LD (`<script type="application/ld+json">`, server-rendered)
Organization/LocalBusiness on the home page, Product+Offer on product pages, BreadcrumbList on deep pages. Values must match the visible text exactly (WS-READ-09).
```json
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"https://{domain}/#org","name":"{Name}","url":"https://{domain}/","logo":"{logo URL}","sameAs":["{social URLs}"],"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"{public email}"}},
 {"@type":"Product","name":"{visible name}","image":["{url}"],"description":"{visible description}","sku":"{sku}","gtin":"TODO(owner) if you have one","brand":{"@type":"Brand","name":"{brand}"},
  "offers":{"@type":"Offer","url":"{page URL}","price":"{visible price}","priceCurrency":"USD","availability":"https://schema.org/InStock",
   "shippingDetails":{"@type":"OfferShippingDetails","TODO":"rates/regions from shipping page"},
   "hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy","TODO":"from returns page"}}}
]}
```
Don't add FAQPage expecting rich results (Google removed FAQ rich results). Never add Review/AggregateRating that isn't shown on the page.

### 7. Security headers
```
Strict-Transport-Security: max-age=63072000; includeSubDomains   # add "; preload" only after owner confirms all subdomains are HTTPS
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' {allowed CDNs/payment}; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; report-to csp
```
After 1 to 2 weeks with no unexpected reports, switch to the enforcing `Content-Security-Policy`. On card-paying sites, the script inventory and integrity monitoring tie to PCI DSS v4.0.1 6.4.3/11.6.1. Point the owner to their payment provider/QSA, and don't claim compliance.

### 8. `/.well-known/security.txt` (RFC 9116)
```
Contact: mailto:security@{domain}
Expires: {YYYY-MM-DD, less than 1 year from today}T00:00:00.000Z
Preferred-Languages: en
Canonical: https://{domain}/.well-known/security.txt
Policy: https://{domain}/security-policy   # TODO(owner) or remove
```

### 9. `/.well-known/gpc.json` (only if the owner honors Global Privacy Control)
```json
{ "gpc": true, "lastUpdate": "{YYYY-MM-DD}" }
```

### 10. WebMCP (optional, browser-side tools; draft spec, API name is moving)
```js
const mc = document.modelContext || navigator.modelContext; // draft renamed navigator → document
if (mc && mc.registerTool) {
  mc.registerTool({
    name: "search_products",
    description: "Search this store's catalog",
    inputSchema: { type: "object", properties: { q: { type: "string" } }, required: ["q"] },
    annotations: { readOnlyHint: true },
    async execute({ q }) { const r = await fetch(`/search?q=${encodeURIComponent(q)}&view=json`); return await r.json(); }
  });
}
```
Label it EXPERIMENTAL in the README and check the current W3C draft before shipping.

### 11. Crawl & Index fixes (from WS-CRAWL results, drafted in ONE pass)

Group by *file behind the problem*, one README section per file. Owner repo shared → write `crawl-fixes.patch` (unified diff) in the run folder; never push/merge/deploy. Hosted platform → exact settings path + snippet.

- **Titles/descriptions/canonical (CRAWL-06):** Shopify `theme.liquid`: `<title>{{ page_title }}{% unless page_title contains shop.name %} – {{ shop.name }}{% endunless %}</title>`, `<meta name="description" content="{{ page_description | escape }}">`, `<link rel="canonical" href="{{ canonical_url }}">`. Next.js: `export async function generateMetadata({params}){ return { title, description, alternates:{ canonical: `https://{domain}/${path}` } } }`. WordPress: remove hard-coded canonical from `header.php`; let the SEO plugin output it. Never one canonical for all pages.
- **robots/noindex (CRAWL-03):** remove `Disallow` lines and `noindex` (meta or `X-Robots-Tag`) from main pages; keep them on `/admin`, `/account`, `/cart`, `/checkout`, `/search`, staging. Add `Sitemap: https://{domain}/sitemap.xml`.
- **Real 404 (CRAWL-04):** nginx `try_files $uri $uri/ =404;` · Next.js `notFound()` · SPA hosts: return 404 for unknown routes, not `index.html` 200.
- **SSR/prerender (CRAWL-01/02):** name the routes, the rendering mode to switch to, and the framework setting.
- **Links (CRAWL-05/12):** replace onClick nav with `<a href>`; add orphan URLs to menus/collections/footer/HTML sitemap.
- **Images (CRAWL-08):** add `width`/`height`/`alt`; serve WebP/AVIF via platform image filters, `<picture>`, or CDN `format=auto`.
- **Sitemap (CRAWL-10):** remove redirecting/404/noindex URLs at the source (unpublish, fix redirect) rather than hand-editing a generated sitemap.
- **Redirect chains (CRAWL-11):** one rule per old URL straight to the final https canonical host; merge http→https and www↔apex into one hop.
- **FAQ (CRAWL-09):** no change needed; don't add FAQPage expecting Google rich results (retired May 7, 2026).

Verify per fix: `curl -sS -m 20 -A "$UA_GB" -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' -L https://{domain}/{path}` plus the CRAWL check's own test; then "tell me when it's live and I'll re-check" (AFTER snapshot).

## Where it goes (put in README per file)

| Platform | Root files (llms.txt, security.txt, .well-known) | robots.txt | Headers | JSON-LD |
|---|---|---|---|---|
| Shopify | No arbitrary root files. Use an app or a URL redirect to a page/asset. `/.well-known/ucp` is platform-managed. | `robots.txt.liquid` template | Limited. Use a CDN/proxy (e.g. Cloudflare) for custom headers. | `theme.liquid` / product section |
| WooCommerce / WordPress | Upload to web root (SFTP/host file manager) or a plugin | SEO plugin robots editor or a physical file | Host panel, `.htaccess` (Apache), nginx conf, or a headers plugin | SEO plugin schema or a theme hook |
| Squarespace / Wix / Webflow | Usually not possible at root. Ask platform support or use a CDN worker. | Platform SEO settings (limited) | CDN/proxy | Code injection / custom code in head |
| Next.js / Medusa storefront | `public/` folder (`public/.well-known/...`) | `public/robots.txt` or `app/robots.ts` | `headers()` in `next.config.js` or middleware | Server component `<script type="application/ld+json">` |
| Custom (nginx / Apache) | Web root | Web root | `add_header ... always;` / `Header always set ...` | Templates |
| Cloudflare in front of anything | Workers can serve files at any path | Worker or origin | Transform Rules → Response Header Modification | Origin |

## Verify step (in README)

For each file: the exact `curl -sS -I https://{domain}/{path}` command, the expected status and content type, then "tell me when it's live and I'll re-check" (this triggers `websmith-audit-runner` re-check mode).


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `websmith-audit-runner` → `../seo-autobot-agent-readiness/references/websmith-audit-runner.md`.
- `websmith-mcp-review` → `../seo-autobot-agent-readiness/references/websmith-mcp-review.md`.
