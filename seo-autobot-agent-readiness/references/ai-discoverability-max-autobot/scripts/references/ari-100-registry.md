# ARI-100 check registry

113 checks across 8 weighted domains. Generated from `registry/mega.mjs` — do not hand-edit; re-run `node engine/gen-skill.mjs`.

**Tiers.** `essential` = the baseline every agent needs, always scored. `recommended` = scored when the capability exists. `optional` = cheap, low-weight. `bonus` = emerging, contributes to the +5 signal bonus and never subtracts.

| domain | weight | checks | Σ weight |
|---|---|---|---|
| Reachability & Access `access` | 20% | 14 | 44 |
| Render & Delivery `render` | 10% | 11 | 30 |
| Structure & Semantics `structure` | 12% | 14 | 29 |
| Structured Data `data` | 12% | 12 | 29 |
| Discovery Files `discovery` | 14% | 17 | 30 |
| Agent Interfaces `interfaces` | 14% | 22 | 42 |
| Operability & Commerce `commerce` | 10% | 13 | 30 |
| Trust & Authority `trust` | 8% | 10 | 18 |

## Reachability & Access — 20%

_A crawler that is turned away at the edge reads nothing you wrote._

### `robots-valid` — robots.txt is reachable and valid
weight **3** · tier **essential**

- **Pass:** GET /robots.txt returns 200, text/plain, and at least one User-agent group with parseable rules.
- **Fix prompt:** Fix robots.txt at {{origin}}/robots.txt: it must return HTTP 200 with Content-Type text/plain, contain at least one "User-agent: *" group, and contain no HTML. Current evidence: {{evidence}}.

### `ai-search-bots` — AI search crawlers are allowed
weight **5** · tier **essential**

- **Pass:** Live request as OAI-SearchBot, Claude-SearchBot and PerplexityBot all return 200 (not 403/challenge/empty).
- **Fix prompt:** Unblock the AI search crawlers on {{origin}}. In robots.txt add a group with User-agent lines for OAI-SearchBot, Claude-SearchBot, PerplexityBot and "Allow: /", then confirm the CDN/WAF does not challenge them. Current evidence: {{evidence}}.

### `ai-user-agents` — Live AI agents can fetch a page a person asked about
weight **4** · tier **essential**

- **Pass:** Live request as ChatGPT-User, Claude-User and Perplexity-User return 200.
- **Fix prompt:** Allow user-initiated AI agents on {{origin}}: add ChatGPT-User, Claude-User and Perplexity-User to the allowed robots group and remove any firewall rule keyed on those user agents. Evidence: {{evidence}}.

### `search-engines` — Classic search engines are allowed
weight **5** · tier **essential**

- **Pass:** Live request as Googlebot and Bingbot return 200.
- **Fix prompt:** Allow Googlebot and Bingbot for {{origin}} in robots.txt and at the edge — AI answer surfaces are fed by these indexes. Evidence: {{evidence}}.

### `no-edge-block` — The edge does not challenge AI crawlers
weight **5** · tier **essential**

- **Pass:** A request carrying an AI user agent gets a 200 with comparable body size to a browser request; no "cf-mitigated", JS challenge or 403.
- **Fix prompt:** Stop the CDN/WAF on {{origin}} from challenging AI crawlers: add an allow rule for the AI user agents ahead of managed bot protection, and make sure the challenge response is not being served instead of HTML. Evidence: {{evidence}}.

### `no-blanket-disallow` — No blanket Disallow: / applies to everyone
weight **3** · tier **essential**

- **Pass:** The wildcard group does not disallow the whole site, or a wildcard-by-path rule does not shadow the AI groups.
- **Fix prompt:** Remove "User-agent: * / Disallow: /" from robots.txt on {{origin}}, or scope it to private paths only (/cart, /checkout, /account, /admin). Evidence: {{evidence}}.

### `bot-policy-deliberate` — AI bot policy is named, not inherited
weight **2** · tier **recommended**

- **Pass:** robots.txt names at least 6 known AI crawlers in explicit groups.
- **Fix prompt:** Name the AI crawlers explicitly in robots.txt for {{origin}} instead of relying on a wildcard, so each one has a deliberate policy. Evidence: {{evidence}}.

### `training-policy` — Training policy is explicit
weight **1** · tier **recommended**

- **Pass:** A stated allow/block for training-only crawlers (CCBot, Google-Extended, Bytespider) or a Content-Signal line.
- **Fix prompt:** State a training policy on {{origin}}: either name CCBot / Google-Extended / Bytespider explicitly in robots.txt, or add a Content-Signal line (search=yes, ai-input=yes, ai-train=no). Evidence: {{evidence}}.

### `no-captcha` — No CAPTCHA on primary pages
weight **3** · tier **essential**

- **Pass:** Homepage and sampled inner pages contain no visible CAPTCHA widget or captcha JS gate on first paint.
- **Fix prompt:** Remove the visible CAPTCHA from {{url}}; agents stop at them. Keep challenges on login/contact forms only. Evidence: {{evidence}}.

### `no-gate` — No age/consent/geo wall in front of content
weight **3** · tier **essential**

- **Pass:** Server HTML contains the real page content, not an interstitial; no IP-based redirect to another locale on first hit.
- **Fix prompt:** Serve real content from {{url}} in the server HTML and overlay any age/consent gate client-side; serve a default region at / instead of a geo redirect. Evidence: {{evidence}}.

### `indexable` — Page is indexable
weight **5** · tier **essential**

- **Pass:** No noindex in meta robots or X-Robots-Tag, no nofollow on the canonical.
- **Fix prompt:** Remove noindex from {{url}}: drop it from the meta robots tag and the X-Robots-Tag header. Evidence: {{evidence}}.

### `snippets-allowed` — Snippets and large image previews are allowed
weight **2** · tier **essential**

- **Pass:** meta robots or X-Robots-Tag permits snippets (max-snippet >= 0) and max-image-preview:large.
- **Fix prompt:** On {{origin}} set "max-snippet:-1, max-image-preview:large" in the meta robots tag or X-Robots-Tag so assistants can quote the page. Evidence: {{evidence}}.

### `robots-coherent` — robots.txt does not disallow what the site advertises
weight **2** · tier **recommended**

- **Pass:** No sitemap URL, discovery file, or manifest the site publishes is disallowed for the crawler that needs it.
- **Fix prompt:** On {{origin}} make robots.txt consistent with the files you publish: allow /llms.txt, /sitemap.xml and every /.well-known/ endpoint you advertise. Evidence: {{evidence}}.

### `crawl-budget` — Infrastructure paths are excluded from crawl budget
weight **1** · tier **recommended**

- **Pass:** /api/, /cdn-cgi/ and parameter permutations are disallowed; content and static assets are allowed.
- **Fix prompt:** On {{origin}} exclude infrastructure from crawl budget: Disallow /api/ and /cdn-cgi/, then re-Allow /static/ and your badge/sitemap paths. Evidence: {{evidence}}.

## Render & Delivery — 10%

_Text that only exists after JavaScript runs does not exist for most agents._

### `ssr-home` — Homepage content is in the raw HTML
weight **5** · tier **essential**

- **Pass:** At least 500 characters of meaningful text and at least one H1 appear in the response body with scripts stripped.
- **Fix prompt:** Server-render the homepage of {{origin}}: ship at least 500 characters of real text and an H1 in the initial HTML response rather than after hydration (SSR/SSG, or prerender). Evidence: {{evidence}}.

### `ssr-inner` — Inner pages carry text without JavaScript
weight **4** · tier **essential**

- **Pass:** Sampled inner pages each return 400+ characters of text with scripts stripped.
- **Fix prompt:** Server-render the inner pages of {{origin}} ({{evidence}}): move the primary copy into the HTML response for each template, not only the homepage.

### `status-200` — Canonical URL answers 200 within one hop
weight **4** · tier **essential**

- **Pass:** The scanned URL returns 200 after at most one redirect.
- **Fix prompt:** Collapse redirects on {{url}}: aim for 0-1 hops to the final 200 URL and link the final URL directly. Evidence: {{evidence}}.

### `real-404` — Unknown URLs return a real 404
weight **3** · tier **essential**

- **Pass:** A made-up path returns 404 (not 200, not a soft 404 page).
- **Fix prompt:** Return a real 404 status for unknown paths on {{origin}} instead of a 200 soft-404 page, and include links to real pages in the body. Evidence: {{evidence}}.

### `content-type` — Correct Content-Type and charset
weight **2** · tier **essential**

- **Pass:** text/html; charset=utf-8 on HTML, text/plain for llms.txt and robots.txt.
- **Fix prompt:** Set correct Content-Type headers on {{origin}}: text/html; charset=utf-8 for pages, text/plain; charset=utf-8 for robots.txt, llms.txt and markdown mirrors. Evidence: {{evidence}}.

### `ttfb` — Response is fast enough for an agent timeout
weight **3** · tier **recommended**

- **Pass:** Time to first byte under 800 ms and full body under 3 s from a cold request.
- **Fix prompt:** Speed up the server response for {{url}}: TTFB should land under 800 ms. Cache the HTML at the edge, and remove synchronous calls from the render path. Evidence: {{evidence}}.

### `page-weight` — Page weight is reasonable
weight **2** · tier **recommended**

- **Pass:** HTML document under 1 MB and no unbounded inline payloads.
- **Fix prompt:** Reduce the HTML payload of {{url}} to under 1 MB: move large inline JSON/state blobs and base64 images out of the document. Evidence: {{evidence}}.

### `compression` — Text responses are compressed
weight **1** · tier **recommended**

- **Pass:** br or gzip accepted and returned for HTML/JSON.
- **Fix prompt:** Enable Brotli/gzip compression for HTML and JSON on {{origin}}. Evidence: {{evidence}}.

### `text-ratio` — Text-to-markup ratio is workable
weight **2** · tier **recommended**

- **Pass:** Visible text / HTML bytes above 5% after stripping scripts, styles, nav and footer.
- **Fix prompt:** Raise the text-to-markup ratio on {{url}} to at least 5%: trim wrapper divs and inline styles, and put the copy in plain elements. Evidence: {{evidence}}.

### `no-js-only` — Primary content does not depend on client rendering
weight **3** · tier **essential**

- **Pass:** The page text is identical with JavaScript disabled at the HTML level (no empty root node).
- **Fix prompt:** Remove the JavaScript dependency for primary content on {{origin}}: the raw response must not be an empty mount node. Render on the server and hydrate. Evidence: {{evidence}}.

### `streaming-stable` — Document is parseable without executing scripts
weight **1** · tier **recommended**

- **Pass:** No document.write after load, no content injected above the fold on a timer.
- **Fix prompt:** On {{origin}} stop injecting above-the-fold content after load (no document.write, no delayed hero render), so a non-executing parser sees the final DOM. Evidence: {{evidence}}.

## Structure & Semantics — 12%

_Headings, titles and landmarks are the outline an agent extracts passages from._

### `title` — Title is unique and the right length
weight **3** · tier **essential**

- **Pass:** A <title> of 15-65 characters that names the page, not just the brand.
- **Fix prompt:** Rewrite the <title> of {{url}} to 15-65 characters that names the specific page, brand last. Evidence: {{evidence}}.

### `meta-description` — Meta description is present and useful
weight **3** · tier **essential**

- **Pass:** Meta description 50-170 characters, unique per page.
- **Fix prompt:** Write a 50-170 character meta description for {{url}} that states what the page answers. Evidence: {{evidence}}.

### `one-h1` — Exactly one H1 states the page subject
weight **3** · tier **essential**

- **Pass:** One H1 in the document, not empty, distinct from the title tag.
- **Fix prompt:** Ensure exactly one non-empty H1 on {{url}} that states the page subject; demote extra H1s to H2. Evidence: {{evidence}}.

### `heading-order` — Headings are sequential and descriptive
weight **2** · tier **recommended**

- **Pass:** No skipped levels; H2s describe the section, not "Section 1".
- **Fix prompt:** Fix the heading outline on {{url}}: no skipped levels (H2 to H4), and make each H2 describe its section. Evidence: {{evidence}}.

### `canonical` — Canonical points at itself
weight **3** · tier **essential**

- **Pass:** A rel=canonical link to the URL being served (or the deliberate canonical target).
- **Fix prompt:** Add a self-referencing rel=canonical to {{url}} that matches the URL actually served (https, final host, no tracking params). Evidence: {{evidence}}.

### `lang` — Language is declared and well-formed
weight **2** · tier **essential**

- **Pass:** html lang is a valid BCP-47 tag (e.g. en, en-US).
- **Fix prompt:** Set a valid BCP-47 lang attribute on <html> for {{origin}} (for example lang="en-US"). Evidence: {{evidence}}.

### `og-tags` — Open Graph title, description and image
weight **2** · tier **recommended**

- **Pass:** og:title, og:description and og:image (1200x630) present.
- **Fix prompt:** Add Open Graph tags to {{url}}: og:title, og:description, og:image (1200x630 absolute URL), og:url, og:type. Evidence: {{evidence}}.

### `twitter-card` — Card metadata for chat previews
weight **1** · tier **recommended**

- **Pass:** twitter:card plus title/description/image.
- **Fix prompt:** Add twitter:card, twitter:title, twitter:description and twitter:image to {{url}}. Evidence: {{evidence}}.

### `viewport` — Viewport is set and pinch-zoom is not disabled
weight **1** · tier **optional**

- **Pass:** A viewport meta without user-scalable=no or maximum-scale=1.
- **Fix prompt:** Set <meta name="viewport" content="width=device-width, initial-scale=1"> on {{origin}} and remove user-scalable=no / maximum-scale=1. Evidence: {{evidence}}.

### `landmarks` — Content is separated by landmarks
weight **2** · tier **recommended**

- **Pass:** main or article element, plus nav/header/footer.
- **Fix prompt:** Wrap the primary copy of {{url}} in <main> or <article> and keep nav/header/footer outside it, so a parser can isolate the content. Evidence: {{evidence}}.

### `a11y-names` — Controls expose accessible names
weight **3** · tier **essential**

- **Pass:** Every button, link and input has text, aria-label or an associated label.
- **Fix prompt:** Give every interactive control on {{url}} an accessible name: visible text, aria-label, or a <label for>. Evidence: {{evidence}}.

### `link-text` — Link text describes the destination
weight **1** · tier **recommended**

- **Pass:** No "click here" / "read more" as the only link text on sampled pages.
- **Fix prompt:** Replace generic link text on {{url}} ("click here", "read more") with the destination name. Evidence: {{evidence}}.

### `href-lang` — Alternate language versions are declared
weight **1** · tier **optional**

- **Pass:** hreflang plus x-default when more than one locale is served.
- **Fix prompt:** Declare hreflang alternates plus x-default on {{origin}} for each locale you serve. Evidence: {{evidence}}.

### `img-alt` — Images carry text alternatives
weight **2** · tier **recommended**

- **Pass:** All content images have alt, decorative images have alt="".
- **Fix prompt:** Add alt text to content images on {{url}} and alt="" to decorative ones. Evidence: {{evidence}}.

## Structured Data — 12%

_Facts declared in JSON-LD do not have to be inferred from prose._

### `jsonld` — JSON-LD structured data is present
weight **4** · tier **essential**

- **Pass:** At least one application/ld+json block with a parseable @context.
- **Fix prompt:** Add a JSON-LD block to {{url}} with @context https://schema.org and a @type that matches the page. Evidence: {{evidence}}.

### `jsonld-type` — Declared type matches the page
weight **3** · tier **recommended**

- **Pass:** WebPage/Organization for a homepage; Article, Product, Service, FAQPage, HowTo as appropriate.
- **Fix prompt:** Declare the correct schema type on {{url}} ({{evidence}}) — Product for a product page, Article for editorial, Service for a service, FAQPage when the page answers questions.

### `org-entity` — Publisher entity is declared and linked
weight **3** · tier **recommended**

- **Pass:** Organization or Person node with name, url, logo, and sameAs to the profiles the brand owns.
- **Fix prompt:** Add an Organization (or Person) JSON-LD node on {{origin}} with name, url, logo, and sameAs links to the profiles the brand actually owns. Evidence: {{evidence}}.

### `dates` — Published and modified dates are declared
weight **2** · tier **recommended**

- **Pass:** datePublished and dateModified in the page schema.
- **Fix prompt:** Add datePublished and dateModified to the schema on {{url}}, kept in sync with the visible date. Evidence: {{evidence}}.

### `breadcrumb` — BreadcrumbList declares the page position
weight **1** · tier **recommended**

- **Pass:** A BreadcrumbList with name+item for each level.
- **Fix prompt:** Add a BreadcrumbList to {{url}} whose items match the visible breadcrumb. Evidence: {{evidence}}.

### `product-facts` — Product facts are in machine-readable form
weight **4** · tier **recommended**

- **Pass:** Product schema with name, image, offers.price, priceCurrency and availability.
- **Fix prompt:** Add Product JSON-LD to {{url}} with name, image, sku, offers.price, offers.priceCurrency, offers.availability and brand. Evidence: {{evidence}}.

### `product-variants` — Variants are modelled
weight **2** · tier **recommended**

- **Pass:** hasVariant / ProductGroup entries or an ItemList of variants with size/colour identifiers.
- **Fix prompt:** Model the variants of {{url}} in schema with hasVariant (or a ProductGroup with variesBy) including each size/colour and its own offer. Evidence: {{evidence}}.

### `offer-terms` — Shipping and return terms are in structured data
weight **2** · tier **recommended**

- **Pass:** shippingDetails and hasMerchantReturnPolicy on the offer.
- **Fix prompt:** Add shippingDetails (OfferShippingDetails) and hasMerchantReturnPolicy to the offers on {{url}}. Evidence: {{evidence}}.

### `faq-howto` — Answer-shaped extras where the page answers questions
weight **1** · tier **optional**

- **Pass:** FAQPage / HowTo / Question blocks when the page contains those answers.
- **Fix prompt:** Mark the question-and-answer pairs on {{url}} as FAQPage, and any ordered steps as HowTo, matching the visible copy. Evidence: {{evidence}}.

### `jsonld-truthful` — Structured data matches visible content
weight **2** · tier **recommended**

- **Pass:** No price/name mismatch between JSON-LD and the rendered HTML.
- **Fix prompt:** Reconcile JSON-LD with the visible page on {{url}}: {{evidence}} — the declared values must equal what a human sees.

### `reviews` — Ratings or reviews are declared, if real
weight **1** · tier **optional**

- **Pass:** AggregateRating / Review present only where genuinely shown.
- **Fix prompt:** If reviews are genuinely shown on {{url}}, declare AggregateRating with reviewCount and the individual Review nodes; otherwise leave them out. Evidence: {{evidence}}.

### `jsonld-valid` — Structured data validates
weight **4** · tier **essential**

- **Pass:** No parse errors, no missing required properties for the declared type.
- **Fix prompt:** Fix the JSON-LD validation errors on {{url}}: {{evidence}}. Every block must parse and carry the required properties for its type.

## Discovery Files — 14%

_The files an agent reads before it reads a page._

### `sitemap` — A sitemap is declared and lists live URLs
weight **4** · tier **essential**

- **Pass:** Sitemap referenced in robots.txt, returns XML, entries return 200.
- **Fix prompt:** Publish a sitemap index on {{origin}}, reference it from robots.txt, and list only 200-status canonical URLs. Evidence: {{evidence}}.

### `sitemap-lastmod` — Sitemap entries carry real lastmod
weight **2** · tier **recommended**

- **Pass:** lastmod present and not identical for every URL unless that is true.
- **Fix prompt:** Add truthful <lastmod> values to the sitemap on {{origin}} from real content timestamps. Evidence: {{evidence}}.

### `sitemap-segmented` — Sitemaps are split by content type
weight **1** · tier **recommended**

- **Pass:** A sitemap index with child sitemaps for pages, products, posts.
- **Fix prompt:** Split the sitemap on {{origin}} into an index plus child sitemaps per content type (pages, products, posts, images). Evidence: {{evidence}}.

### `llms-txt` — /llms.txt exists and is served as text
weight **3** · tier **essential**

- **Pass:** 200 at /llms.txt (or /.well-known/llms.txt) with text/plain and a non-empty body.
- **Fix prompt:** Publish /llms.txt on {{origin}} as text/plain: a single H1, a one-line blockquote summary, then H2 sections of [name](url) links to the pages that answer the most common questions. Evidence: {{evidence}}.

### `llms-conform` — llms.txt follows the published format
weight **2** · tier **recommended**

- **Pass:** H1 first, blockquote summary, H2 sections, links in [name](url) form, optional ## Optional section.
- **Fix prompt:** Restructure /llms.txt on {{origin}} to the published format: H1, blockquote summary under it, H2 sections whose bullets are [name](url) with optional ": note" suffixes, and a ## Optional section for secondary links. Evidence: {{evidence}}.

### `llms-full` — /llms-full.txt offers one-request ingestion
weight **1** · tier **optional**

- **Pass:** A single-document variant exists.
- **Fix prompt:** Publish /llms-full.txt on {{origin}} concatenating the primary content of the site in Markdown for one-request ingestion, and link it from /llms.txt. Evidence: {{evidence}}.

### `md-mirror` — A Markdown mirror of the page exists
weight **2** · tier **recommended**

- **Pass:** /<path>.md or /<path>/index.md returns text/markdown.
- **Fix prompt:** Publish a Markdown mirror for each page on {{origin}}: serve /<path>.md with Content-Type text/markdown and the same content as the HTML. Evidence: {{evidence}}.

### `md-negotiation` — Content negotiation returns Markdown on request
weight **3** · tier **recommended**

- **Pass:** Accept: text/markdown yields text/markdown, with Vary: Accept.
- **Fix prompt:** Support Accept: text/markdown on {{origin}}: return the Markdown mirror with Content-Type text/markdown and add Vary: Accept so caches stay separate. Evidence: {{evidence}}.

### `md-alternate` — HTML advertises its Markdown twin
weight **1** · tier **recommended**

- **Pass:** <link rel="alternate" type="text/markdown" href="...">.
- **Fix prompt:** Add <link rel="alternate" type="text/markdown" href="/<path>.md"> to the head of {{url}}. Evidence: {{evidence}}.

### `link-headers` — HTTP Link headers point at machine resources
weight **2** · tier **recommended**

- **Pass:** Link: <...>; rel="describedby"/"alternate"/"api-catalog" on page responses.
- **Fix prompt:** Add Link response headers on {{origin}} pointing at its machine-readable resources: rel="describedby" to /llms.txt, rel="api-catalog" to /.well-known/api-catalog, rel="alternate" to the Markdown mirror. Evidence: {{evidence}}.

### `dns-aid` — DNS advertises agent endpoints
weight **1** · tier **bonus**

- **Pass:** A discovery TXT/HTTPS record (e.g. _agents or _index._agents) resolves.
- **Fix prompt:** Publish a DNS discovery record for {{origin}} (a TXT record listing the agent endpoints the site exposes) so an agent learns the surface before fetching a page. Evidence: {{evidence}}.

### `agents-md` — A skill file tells coding agents how to work with the site
weight **2** · tier **recommended**

- **Pass:** /AGENTS.md or /.well-known/agents.md exists.
- **Fix prompt:** Publish /AGENTS.md on {{origin}} describing how a coding agent should build against or use the site: install, configuration, and worked examples. Evidence: {{evidence}}.

### `agents-md-depth` — The skill file is substantive
weight **1** · tier **recommended**

- **Pass:** Contains at least two of: install, configuration, usage examples.
- **Fix prompt:** Deepen /AGENTS.md on {{origin}} to include install steps, configuration, and at least one complete usage example. Evidence: {{evidence}}.

### `content-signal` — Content usage preferences are declared
weight **2** · tier **recommended**

- **Pass:** A Content-Signal line stating search / ai-input / ai-train.
- **Fix prompt:** Add a Content-Signal line to robots.txt on {{origin}}, e.g. "Content-Signal: search=yes, ai-input=yes, ai-train=no", so usage terms are machine-readable. Evidence: {{evidence}}.

### `llms-indexes-agents` — The index file advertises the agent entry points
weight **1** · tier **recommended**

- **Pass:** llms.txt or the discovery index names the MCP/API endpoints.
- **Fix prompt:** Add a section to /llms.txt on {{origin}} listing the machine interfaces an agent can call (API base, MCP endpoint, A2A card) with one line each. Evidence: {{evidence}}.

### `describedby` — The page declares the index that covers it
weight **1** · tier **optional**

- **Pass:** rel="describedby" link element or Link header to the covering llms.txt.
- **Fix prompt:** Add a rel="describedby" link to the covering /llms.txt from every page on {{origin}} so an agent can widen from one page to the index. Evidence: {{evidence}}.

### `discovery-file-404` — Discovery files do not 404 quietly
weight **1** · tier **optional**

- **Pass:** Every file the site advertises resolves; no advertised card points at a dead endpoint.
- **Fix prompt:** Remove or publish the advertised-but-missing discovery artefacts on {{origin}}: {{evidence}}. A card for an interface that does not exist is worse than no card.

## Agent Interfaces — 14%

_What an agent can call once it decides to act._

### `openapi` — An OpenAPI description is published
weight **4** · tier **essential**

- **Pass:** /openapi.json or /.well-known/openapi.json parses and declares paths.
- **Fix prompt:** Publish /openapi.json on {{origin}} (OpenAPI 3.1) describing every public endpoint, with operation summaries and example responses. Evidence: {{evidence}}.

### `api-catalog` — An API catalog linkset is published
weight **2** · tier **recommended**

- **Pass:** /.well-known/api-catalog returns an RFC 9727 linkset.
- **Fix prompt:** Publish /.well-known/api-catalog on {{origin}} as an RFC 9727 linkset pointing at the API, its OpenAPI description and its docs. Evidence: {{evidence}}.

### `oauth-protected-resource` — Protected resources declare their authorization server
weight **2** · tier **recommended**

- **Pass:** /.well-known/oauth-protected-resource (RFC 9728) resolves.
- **Fix prompt:** Publish /.well-known/oauth-protected-resource on {{origin}} naming the resource and its authorization server, so an agent can discover how to get a token without scraping docs. Evidence: {{evidence}}.

### `oauth-as` — Authorization server metadata is published
weight **2** · tier **recommended**

- **Pass:** /.well-known/oauth-authorization-server (RFC 8414) resolves.
- **Fix prompt:** Publish /.well-known/oauth-authorization-server on {{origin}} with issuer, authorization_endpoint, token_endpoint and grant types. Evidence: {{evidence}}.

### `scopes` — Permissions are scoped
weight **2** · tier **recommended**

- **Pass:** OAuth/OpenAPI declares named scopes or per-endpoint permissions rather than all-or-nothing.
- **Fix prompt:** Replace all-or-nothing credentials on {{origin}} with named scopes (for example read:catalog, write:cart) declared in the OpenAPI security scheme and the authorization-server metadata. Evidence: {{evidence}}.

### `auth-md` — Agent sign-up is documented for machines
weight **2** · tier **recommended**

- **Pass:** /auth.md or a machine-readable credential section exists.
- **Fix prompt:** Publish /auth.md on {{origin}} telling an agent how to register, get a credential and revoke it, with the exact request/response shapes. Evidence: {{evidence}}.

### `mcp-card` — An MCP server card describes the server
weight **3** · tier **essential**

- **Pass:** /.well-known/mcp.json or /.well-known/mcp/server-card.json parses.
- **Fix prompt:** Publish an MCP server card at /.well-known/mcp.json on {{origin}}: name, description, transport, endpoint, and the tool list with input schemas. Evidence: {{evidence}}.

### `mcp-card-fields` — The MCP card carries the fields a client needs
weight **2** · tier **recommended**

- **Pass:** Transport, endpoint, auth requirement and at least one tool with an input schema.
- **Fix prompt:** Complete the MCP server card on {{origin}}: transport, endpoint URL, auth requirement, and every tool with a declared input schema and description. Evidence: {{evidence}}.

### `mcp-live` — The advertised MCP endpoint answers
weight **3** · tier **essential**

- **Pass:** The endpoint from the card responds to an initialize/tools list request.
- **Fix prompt:** Make the MCP endpoint advertised by {{origin}} actually answer: respond to initialize and tools/list at the URL in the card, and keep the card in sync with the deployed tool set. Evidence: {{evidence}}.

### `a2a-card` — An A2A agent card is published
weight **2** · tier **recommended**

- **Pass:** /.well-known/agent-card.json parses with name, capabilities, skills.
- **Fix prompt:** Publish a /.well-known/agent-card.json on {{origin}} describing the agent: name, description, capabilities, skills and endpoint. Evidence: {{evidence}}.

### `agent-skills` — Agent skills are indexable
weight **1** · tier **bonus**

- **Pass:** /.well-known/agent-skills/index.json lists skill documents.
- **Fix prompt:** Publish /.well-known/agent-skills/index.json on {{origin}} listing each skill document with name, description and URL. Evidence: {{evidence}}.

### `webmcp` — Site actions are exposed to in-browser agents
weight **1** · tier **bonus**

- **Pass:** WebMCP tool registration is present in the page source.
- **Fix prompt:** Register the site's real actions (search, filter, add to cart) as WebMCP tools on {{origin}} so a browser agent can call them without guessing at the DOM. Evidence: {{evidence}}.

### `ard` — One index lists every agent interface
weight **1** · tier **bonus**

- **Pass:** An ARD / AI-catalog manifest enumerates the MCP, A2A, skills and API surfaces.
- **Fix prompt:** Publish an ARD manifest at /.well-known/ard.json on {{origin}} listing every agentic artefact with its type and URL, and advertise it with rel="ard". Evidence: {{evidence}}.

### `json-errors` — Errors are machine-readable
weight **2** · tier **recommended**

- **Pass:** Unknown API routes return JSON with a type/title/status, not an HTML error page.
- **Fix prompt:** Return RFC 9457 problem-details JSON for every error on {{origin}}, including unknown routes, so an agent can recover instead of parsing an HTML error page. Evidence: {{evidence}}.

### `rate-limit-headers` — Rate limits are declared in headers
weight **1** · tier **recommended**

- **Pass:** RateLimit-* / X-RateLimit-* or Retry-After on API responses.
- **Fix prompt:** Emit RateLimit-Limit / RateLimit-Remaining / RateLimit-Reset (and Retry-After on 429) from the API on {{origin}}. Evidence: {{evidence}}.

### `fc-friendly` — The API is easy to call from a model
weight **2** · tier **recommended**

- **Pass:** Flat parameters, enums over free text, descriptions on every field, no nested auth dance.
- **Fix prompt:** Simplify the API surface on {{origin}} for function calling: flat named parameters, enums instead of free-text where possible, and a description on every field in the OpenAPI spec. Evidence: {{evidence}}.

### `dev-portal` — A developer portal is reachable from the homepage
weight **2** · tier **recommended**

- **Pass:** A link to docs/API reference from the homepage or main nav.
- **Fix prompt:** Link the developer docs from the homepage and main navigation of {{origin}} — one hop, not three. Evidence: {{evidence}}.

### `public-api` — A public API answers without a human
weight **3** · tier **recommended**

- **Pass:** At least one documented endpoint responds to an unauthenticated request.
- **Fix prompt:** Expose at least one unauthenticated read endpoint on {{origin}} that returns the site's core facts as JSON, and document it in the OpenAPI spec. Evidence: {{evidence}}.

### `agent-instruction` — The site tells an agent when to use it
weight **2** · tier **recommended**

- **Pass:** A when-to-use / instructions block in the manifest, llms.txt or MCP card.
- **Fix prompt:** Add a when-to-use block to {{origin}} (in llms.txt, the MCP card or the agent manifest) stating what the agent is for, what it must not do, and one worked call. Evidence: {{evidence}}.

### `idempotency` — Writes are retry-safe
weight **1** · tier **optional**

- **Pass:** Idempotency-Key accepted on POST, or a documented natural key.
- **Fix prompt:** Accept an Idempotency-Key header on mutating endpoints of {{origin}} and document it, so an agent can retry without duplicating work. Evidence: {{evidence}}.

### `agent-discovery-path` — Discovery lives at predictable paths
weight **1** · tier **optional**

- **Pass:** The well-known paths used are the conventional ones, not bespoke URLs.
- **Fix prompt:** Move the machine-readable artefacts on {{origin}} to their conventional paths (/.well-known/*, /llms.txt, /sitemap.xml) and keep redirects from the old ones. Evidence: {{evidence}}.

### `payment-negotiation` — Paid access is discoverable by an agent
weight **1** · tier **optional**

- **Pass:** A 402 challenge carries the payment requirements, or pricing is machine-readable.
- **Fix prompt:** Make paid access discoverable on {{origin}}: return HTTP 402 with a machine-readable list of accepted payment options, or publish a machine-readable price list. Evidence: {{evidence}}.

## Operability & Commerce — 10%

_Real controls, real prices, real checkout — for agents that buy._

### `ucp-profile` — A commerce profile is published
weight **3** · tier **recommended**

- **Pass:** /.well-known/ucp returns a valid commerce protocol profile.
- **Fix prompt:** Publish a commerce profile at /.well-known/ucp on {{origin}} declaring the merchant, the catalogue, and the endpoints an agent may call. Evidence: {{evidence}}.

### `agent-endpoint` — The advertised commerce endpoint is live
weight **3** · tier **recommended**

- **Pass:** The endpoint in the profile responds with catalogue/cart operations.
- **Fix prompt:** Make the commerce endpoint advertised by {{origin}} answer for real: catalogue read, cart create, cart update. Register {{evidence}}.

### `checkout-permalink` — A cart can be handed back to a shopper
weight **2** · tier **recommended**

- **Pass:** A cart or checkout permalink an agent can send to a human.
- **Fix prompt:** Add a shareable cart/checkout permalink on {{origin}} that carries line items in the URL, so an agent can build a cart and hand the link to a person. Evidence: {{evidence}}.

### `x402` — Machine payment is accepted
weight **1** · tier **bonus**

- **Pass:** x402 accepts array on a 402 response, or an advertised payment resource.
- **Fix prompt:** Accept machine payment on {{origin}}: answer with HTTP 402 and an x402 accepts array (asset, amount, network, payTo) on the paid resource. Evidence: {{evidence}}.

### `ap2` — Delegated payment authorization is advertised
weight **1** · tier **bonus**

- **Pass:** AP2 support declared on the agent card or commerce profile.
- **Fix prompt:** Advertise delegated payment authorization on {{origin}} (AP2 extension on the agent card or commerce profile) with the mandate shapes you accept. Evidence: {{evidence}}.

### `acp-profile` — A checkout protocol profile is published
weight **1** · tier **bonus**

- **Pass:** /.well-known/acp.json or equivalent.
- **Fix prompt:** Publish a checkout-protocol profile at /.well-known/acp.json on {{origin}} naming the checkout endpoint and supported payment methods. Evidence: {{evidence}}.

### `add-to-cart` — Add-to-cart is a real labelled control
weight **3** · tier **essential**

- **Pass:** A <button> or <input type=submit> inside a form, with an accessible name, not a div with a click handler.
- **Fix prompt:** Replace the add-to-cart div on {{url}} with a real <button type="submit"> inside a <form>, with an accessible name that includes the product. Evidence: {{evidence}}.

### `variant-controls` — Variant pickers are real form controls
weight **3** · tier **essential**

- **Pass:** select/input/radiogroup elements with names and labels for each option.
- **Fix prompt:** Convert the variant pickers on {{url}} to real form controls (select or radio inputs) with a label per option, so an agent can set a value. Evidence: {{evidence}}.

### `site-search` — Search works through a GET URL
weight **3** · tier **essential**

- **Pass:** A search form that produces a shareable ?q= URL returning results in HTML.
- **Fix prompt:** Make site search on {{origin}} work over GET with a ?q= parameter that returns results in the server HTML, so an agent can construct a search URL. Evidence: {{evidence}}.

### `pdp-facts-html` — Price, stock and variants are in the HTML
weight **4** · tier **essential**

- **Pass:** Product name, price, currency and availability in the raw HTML of the product page.
- **Fix prompt:** Put product name, price, currency and availability in the server HTML of {{url}} — not fetched client-side — with the variants listed. Evidence: {{evidence}}.

### `guest-checkout` — A cart can be built without an account
weight **2** · tier **recommended**

- **Pass:** Cart add succeeds unauthenticated; checkout does not require login before payment.
- **Fix prompt:** Allow an unauthenticated cart on {{origin}} and do not force account creation before payment; if accounts are required by policy, say so in llms.txt with the exact steps. Evidence: {{evidence}}.

### `checkout-docs` — Checkout terms an agent needs are documented
weight **2** · tier **recommended**

- **Pass:** Shipping, returns, tax/VAT and lead time stated in text an agent can read.
- **Fix prompt:** Document the checkout terms an agent must know on {{origin}}: shipping cost and regions, return window, tax handling, and lead time. Evidence: {{evidence}}.

### `policy-links` — Policy pages are linked sitewide
weight **2** · tier **recommended**

- **Pass:** Returns, shipping, terms, privacy and contact reachable from every page.
- **Fix prompt:** Link returns, shipping, terms, privacy and contact from the footer of every page on {{origin}}. Evidence: {{evidence}}.

## Trust & Authority — 8%

_Who said it, when, and can the claim be checked._

### `author` — A named, accountable author or publisher
weight **3** · tier **recommended**

- **Pass:** Visible author byline or declared publisher with a real identity.
- **Fix prompt:** Show a named author or accountable publisher on {{url}}, with a link to an about page that establishes who they are. Evidence: {{evidence}}.

### `visible-date` — A visible publish or update date
weight **2** · tier **recommended**

- **Pass:** A human-readable date on the page matching the schema dates.
- **Fix prompt:** Show a visible publish or last-updated date on {{url}} that matches dateModified in the schema. Evidence: {{evidence}}.

### `sources` — Claims are checkable
weight **2** · tier **recommended**

- **Pass:** Outbound links to primary sources for factual claims.
- **Fix prompt:** Add outbound links to primary sources for the factual claims on {{url}} — the operator documentation, study or specification, not another summary. Evidence: {{evidence}}.

### `about-contact` — About and contact are reachable
weight **2** · tier **recommended**

- **Pass:** An about page and a contact method one hop from the page.
- **Fix prompt:** Publish a reachable About and Contact page on {{origin}} and link both from the footer. Evidence: {{evidence}}.

### `org-completeness` — The organization node is complete
weight **2** · tier **recommended**

- **Pass:** legalName, address, contactPoint, logo, sameAs in the Organization schema.
- **Fix prompt:** Complete the Organization schema on {{origin}} with legalName, address, contactPoint, logo and sameAs. Evidence: {{evidence}}.

### `entity-consistency` — The brand is named the same way everywhere
weight **2** · tier **recommended**

- **Pass:** Consistent brand string across title, og:site_name, schema name, llms.txt and footer.
- **Fix prompt:** Make the brand name identical across the title suffix, og:site_name, schema Organization.name, llms.txt heading and footer on {{origin}} — one canonical string. Evidence: {{evidence}}.

### `https` — Every page is served over HTTPS
weight **2** · tier **essential**

- **Pass:** HTTPS with a valid certificate; http:// redirects to https://.
- **Fix prompt:** Serve {{origin}} only over HTTPS and 301 every http:// URL to https://. Evidence: {{evidence}}.

### `mixed-content` — No insecure subresources
weight **1** · tier **recommended**

- **Pass:** No http:// script/img/css on an https page.
- **Fix prompt:** Rewrite the http:// subresources on {{url}} to https:// and keep the scheme relative. Evidence: {{evidence}}.

### `security-headers` — Baseline security headers are set
weight **1** · tier **optional**

- **Pass:** HSTS, X-Content-Type-Options: nosniff, and a Referrer-Policy.
- **Fix prompt:** Set Strict-Transport-Security, X-Content-Type-Options: nosniff and Referrer-Policy: strict-origin-when-cross-origin on {{origin}}. Evidence: {{evidence}}.

### `no-broken-links` — Sampled internal links resolve
weight **1** · tier **recommended**

- **Pass:** No 404s among the internal links sampled from the page.
- **Fix prompt:** Fix the broken internal links found on {{url}}: {{evidence}}.

## Bonus signals (+1 each, capped at +5)

- `webmcp` — WebMCP tools
- `a2a` — A2A agent card
- `ard` — Agent interface index
- `x402` — x402 machine payment
- `ucp` — Commerce profile (rel=ucp)
- `dns-aid` — DNS discovery record
- `agent-skills` — Agent skills index
- `md-negotiation` — Markdown content negotiation
- `llms-full` — llms-full.txt

## Crawler reachability matrix

Weights are for being found and cited. Training-only crawlers carry 0: blocking them is a commercial choice, not a defect.

| crawler | platform | role | weight |
|---|---|---|---|
| `OAI-SearchBot` | ChatGPT search | search | 10 |
| `ChatGPT-User` | ChatGPT | user | 9 |
| `Claude-SearchBot` | Claude search | search | 10 |
| `Claude-User` | Claude | user | 9 |
| `PerplexityBot` | Perplexity | search | 10 |
| `Perplexity-User` | Perplexity | user | 9 |
| `Googlebot` | Google / AI Overviews | search | 10 |
| `Google-Agent` | Google AI Mode | user | 7 |
| `Google-GeminiNotebook` | Gemini | user | 5 |
| `bingbot` | Bing / Copilot | search | 8 |
| `Applebot` | Siri / Apple Intelligence | search | 6 |
| `meta-webindexer` | Meta AI | search | 5 |
| `meta-externalfetcher` | Meta AI | user | 5 |
| `MistralAI-Index` | Mistral Le Chat | search | 4 |
| `MistralAI-User` | Mistral Le Chat | user | 4 |
| `Amzn-SearchBot` | Alexa | search | 4 |
| `Amzn-User` | Alexa | user | 3 |
| `DuckAssistBot` | DuckDuckGo AI | search | 3 |
| `YouBot` | You.com | search | 3 |
| `GPTBot` | OpenAI training | train | 0 |
| `ClaudeBot` | Anthropic training | train | 0 |
| `Google-Extended` | Gemini training | train | 0 |
| `Applebot-Extended` | Apple training | train | 0 |
| `CCBot` | Common Crawl | train | 0 |
| `Bytespider` | ByteDance | train | 0 |
| `meta-externalagent` | Meta training | train | 0 |
| `cohere-ai` | Cohere training | train | 0 |
| `AI2Bot` | Allen Institute | train | 0 |
| `Diffbot` | Diffbot | other | 1 |
| `Amazonbot` | Amazon | train | 0 |
| `GoogleOther` | Google other | other | 1 |
| `Google-CloudVertexBot` | Vertex AI | train | 0 |

## Accessibility sub-score

23 checks, reported separately, 0-100. A site below 80 cannot hold an A+ grade.

- `img-alt` — Images and image inputs carry a text alternative (WCAG 1.1.1)
- `form-label` — Form controls have a programmatic label (WCAG 1.3.1 / 4.1.2)
- `control-name` — Links and buttons expose an accessible name (WCAG 4.1.2)
- `media-dims` — Media declares explicit dimensions (CLS proxy)
- `aria-refs` — aria-labelledby / label-for references resolve (WCAG 1.3.1)
- `iframe-title` — Iframes have a title or aria-label (WCAG 4.1.2)
- `heading-levels` — Heading hierarchy has no skipped levels (WCAG 1.3.1)
- `tabindex` — No positive tabindex hijacking focus order (WCAG 2.4.3)
- `zoom` — Viewport does not disable pinch-zoom (WCAG 1.4.4)
- `doc-title` — Document has a non-empty title (WCAG 2.4.2)
- `label-in-name` — aria-label contains the visible label text (WCAG 2.5.3)
- `skip-link` — A main landmark or skip link bypasses the chrome (WCAG 2.4.1)
- `lang-valid` — lang is a well-formed BCP-47 tag (WCAG 3.1.1)
- `aria-hidden-focus` — No focusable element inside aria-hidden (WCAG 4.1.2)
- `nested-interactive` — No interactive control nested in another (WCAG 4.1.2)
- `empty-heading` — Headings are not empty (WCAG 1.3.1)
- `meta-refresh` — No timed meta refresh (WCAG 2.2.1)
- `autocomplete` — autocomplete values are valid autofill tokens (WCAG 1.3.5)
- `table-headers` — Tables declare headers with resolving scope/headers (WCAG 1.3.1)
- `svg-title` — SVGs exposed as images carry a text alternative (WCAG 1.1.1)
- `captions` — Audio/video declares a captions track (WCAG 1.2.2)
- `list-structure` — Lists contain only list items and sit in a list (WCAG 1.3.1)
- `aria-valid` — ARIA roles and attributes are valid and complete (WCAG 4.1.2)
