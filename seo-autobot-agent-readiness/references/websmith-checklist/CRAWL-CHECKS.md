# Crawl & Index checks (WS-CRAWL-01..12)

Proposed 2026-11-02 (CT). Ninth Websmith group, "Crawl & Index". All tests are read-only (GET/HEAD), ≤ 1 req/s, fail loud. Where a CRAWL check duplicates an existing WS/AR check, it is an **alias/extension**: the existing ID (and, for AR IDs, the AgentReady scorecard) stays the source of truth and the result is not double-counted in the score (overlaps are named per check).

## Variables and conventions
- `S=https://<production-host>` (no trailing slash), `HOST=<production-host>`.
- `C='curl -sS -m 20'`; every request ≤ 1 req/s per host; ≤ 20 sampled URLs per check unless the check says otherwise (CRAWL-11 crawl cap 200 URLs, depth 3).
- `UA_GB='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'` (Googlebot desktop token, per Google's crawler overview). `UA_BROWSER` as in CHECKLIST.md for comparison.
- `pages.txt` = the run's **main pages**: home, 1 listing/category, 3 product/service, pricing, help/FAQ, contact, policies (real links only, from raw HTML or the sitemap; never invented). Cart/checkout/account/login are *not* main pages.
- Run all commands inside the run folder `websmith/runs/<domain>/<YYYY-MM-DD-HHMM>/` so `raw/` paths resolve.
- Spoofed-Googlebot caveat: many WAFs verify Googlebot by reverse DNS and block impostors. A 403/429 to `UA_GB` is **UNTESTED (bot-verification)**, not FAIL; re-run with `UA_BROWSER` and send the owner to Search Console URL Inspection for the real answer.

Result vocabulary: PASS / FAIL / WARN / N/A / EXCEPTION / UNTESTED; evidence labels [VERIFIED] / [INFERRED] / [ATTESTED] / [UNKNOWN] (same as CHECKLIST.md).

## Summary table

| ID | Group | Level | Check | Overlaps | Search Console? |
|---|---|---|---|---|---|
| WS-CRAWL-01 | Crawling | MUST | Main pages readable as Googlebot without JS | Extends WS-READ-01 / AR-READ-01 (raw-HTML facts) with the Googlebot UA and a title+body text record | Yes |
| WS-CRAWL-02 | Crawling | MUST | No empty root shell (SSR/prerender if JS-only) | Overlaps WS-READ-01 / AR-READ-01 and AR Part B X-PAGE-SIZE | Optional |
| WS-CRAWL-03 | Crawling | MUST | robots.txt / noindex only on admin/login-type pages | Overlaps WS-FIND-01/02 (robots), WS-AEO-08 (noindex), AR Part B X-META-ROBOTS | Yes |
| WS-CRAWL-04 | Crawling | MUST | Missing pages return a real 404 (no soft-200) | Same as WS-READ-02 / AR-READ-02 and AR Part B X-404-BODY | Yes |
| WS-CRAWL-05 | Crawling | MUST | Navigation uses real <a href> links, not onClick-only | Same as WS-READ-04 / AR-READ-03 (and safari-27-mcp-optimization step 3; ar_probe fakeButtons) | No |
| WS-CRAWL-06 | Every page | MUST | Unique title, meta description, self-referencing canonical | Extends WS-READ-14 (title/meta) and WS-FIND-13 (canonical) and AR Part B X-CANONICAL with uniqueness and self-reference across all main pages | Yes |
| WS-CRAWL-07 | Every page | SHOULD | Lighthouse LCP < 2.5 s and CLS < 0.1 | Same thresholds as WS-AEO-09 (Core Web Vitals; LCP ≤ 2 | Yes |
| WS-CRAWL-08 | Every page | SHOULD | Images modern format with width, height and alt | Overlaps WS-READ-17 and WS-A11Y-04 (alt text) and WS-CRAWL-07/X-CLS (dimensions prevent layout shift) | No |
| WS-CRAWL-09 | Every page | MAY | No FAQ schema added expecting rich results | Same topic as WS-AEO-05 and CHECKLIST Known conflict #5 and fix-pack JSON-LD note | No |
| WS-CRAWL-10 | Site-wide | MUST | sitemap.xml lists only indexable 200 URLs and is in robots.txt | Overlaps WS-FIND-05/06/07 and AR-FIND-03 (sitemap present/referenced) | Yes |
| WS-CRAWL-11 | Site-wide | SHOULD | Full crawl: no broken links; redirects are a single hop | Extends WS-FIND-13 (redirects/canonical host) | Yes |
| WS-CRAWL-12 | Site-wide | SHOULD | No orphan pages (every important page has an internal link) | New (no existing WS/AR ID) | Optional |

Counts: Crawling 5 · Every page 4 · Site-wide 3 · **12**. Levels: MUST 7 (01,02,03,04,05,06,10) · SHOULD 4 (07,08,11,12) · MAY 1 (09).

Scoring note: aliases scored once. CRAWL-04 ≡ READ-02/AR-READ-02 and CRAWL-05 ≡ READ-04/AR-READ-03 take the existing result; CRAWL-01/02 extend READ-01/AR-READ-01; the rest are scored in the new CRAWL category.

## Checks in detail

### WS-CRAWL-01 — Main pages readable as Googlebot without JS

- **Group:** Crawling · **Level:** MUST
- **Maps to / overlaps:** Extends WS-READ-01 / AR-READ-01 (raw-HTML facts) with the Googlebot UA and a title+body text record. Overlap: same evidence file can satisfy both; AR-READ-01 stays source of truth for the AR ID.
- **Search Console confirmation needed:** Yes — URL Inspection → 'View crawled page' confirms what real Googlebot received.
- **Source:** https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics ; https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers

**Read-only test**
```bash
while read -r u; do f=raw/crawl01-$(echo "$u"|md5sum|cut -c1-8).html; $C -A "$UA_GB" -o "$f" -w "%{http_code} $u\n" "$u"; python3 - "$f" <<'PY'
import re,sys,html;h=open(sys.argv[1],errors='ignore').read()
t=re.search(r'<title[^>]*>(.*?)</title>',h,re.S|re.I);b=re.sub(r'(?is)<(script|style|noscript|template)[^>]*>.*?</\1>','',h)
b=re.search(r'(?is)<body[^>]*>(.*)',b);txt=' '.join(html.unescape(re.sub(r'<[^>]+>',' ',b.group(1) if b else '')).split())
print('TITLE:',(t.group(1).strip() if t else ''),'| CHARS:',len(txt),'| START:',txt[:200])
PY
sleep 1; done < pages.txt | tee crawl-before.txt
```

**Pass rule:** PASS: every main page returns 200 to the Googlebot UA, has a non-empty <title>, and ≥ ~500 chars of visible body text that includes the page's key fact (product name/price, service, address). WARN: text present but key fact only in JSON. FAIL: empty title or body < ~200 chars. UNTESTED: 403/429 to the Googlebot UA (many WAFs block spoofed Googlebot by reverse-DNS check) — re-run with UA_BROWSER and note it; only Search Console URL Inspection proves what real Googlebot gets.

**Typical fix (by platform):** Shopify/Squarespace/Wix/Webflow: content is server-rendered by default; move key facts out of JS apps/embeds into native blocks. WooCommerce/WordPress: avoid page builders that inject content client-side; check caching plugin isn't serving a JS shell. Next.js/Medusa: use SSR/SSG (App Router server components, getStaticProps/generateStaticParams), not 'use client' at page root. Custom SPA: prerender (e.g. static export, prerender service). Cloudflare/nginx: don't serve a different shell to bots.

### WS-CRAWL-02 — No empty root shell (SSR/prerender if JS-only)

- **Group:** Crawling · **Level:** MUST
- **Maps to / overlaps:** Overlaps WS-READ-01 / AR-READ-01 and AR Part B X-PAGE-SIZE. Decision rule only: uses CRAWL-01 evidence; no extra requests.
- **Search Console confirmation needed:** Optional — URL Inspection rendered HTML shows whether Google's renderer fills it in; agents and most AI crawlers do not run JS, so FAIL stands regardless.
- **Source:** https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

**Read-only test**
```bash
grep -c '' crawl-before.txt; python3 - <<'PY'
import re,glob
for f in glob.glob('raw/crawl01-*.html'):
    h=open(f,errors='ignore').read()
    shell=re.search(r'<div id="(root|app|__next|__nuxt)"[^>]*>\s*</div>',h)
    print(f, 'EMPTY_ROOT' if shell else 'ok', len(h))
PY
```

**Pass rule:** PASS: no main page is an empty app shell. FAIL: any main page has an empty #root/#app/#__next/#__nuxt container AND CRAWL-01 body < ~200 chars → recommend SSR or prerendering for those routes.

**Typical fix (by platform):** Next.js: remove client-only page wrappers, enable SSR/SSG. React/Vue SPA (Vite, CRA): add prerendering or migrate key routes to a framework with SSR (Next/Nuxt/Remix/Astro). Medusa storefront: keep Next.js storefront server components. Hosted builders: replace custom-code app embeds with native content.

### WS-CRAWL-03 — robots.txt / noindex only on admin/login-type pages

- **Group:** Crawling · **Level:** MUST
- **Maps to / overlaps:** Overlaps WS-FIND-01/02 (robots), WS-AEO-08 (noindex), AR Part B X-META-ROBOTS. CRAWL-03 adds the per-page cross-check: no main page blocked or noindexed.
- **Search Console confirmation needed:** Yes — Page indexing report ('Excluded by noindex', 'Blocked by robots.txt') and the robots.txt report.
- **Source:** https://developers.google.com/search/docs/crawling-indexing/block-indexing ; https://www.rfc-editor.org/rfc/rfc9309

**Read-only test**
```bash
$C -A "$UA_GB" "$S/robots.txt" -o raw/robots.txt; grep -inE '^(user-agent|disallow|allow)' raw/robots.txt
while read -r u; do echo "== $u"; $C -I -A "$UA_GB" "$u" | grep -i '^x-robots-tag'; $C -A "$UA_GB" "$u" | grep -ioE '<meta[^>]+name=["'"'"'](robots|googlebot)["'"'"'][^>]*>'; sleep 1; done < pages.txt
python3 -c "import urllib.robotparser as r,sys;p=r.RobotFileParser();p.parse(open('raw/robots.txt').read().splitlines());[print(p.can_fetch('Googlebot',u.strip()),u.strip()) for u in open('pages.txt')]" 
```

**Pass rule:** PASS: every main page is allowed for Googlebot and has no noindex (meta or X-Robots-Tag); Disallow/noindex appear only on admin, login, account, cart/checkout, search-results, staging or other private paths. FAIL: any main page disallowed or noindexed. EXCEPTION: owner-declared private sections from the profile.

**Typical fix (by platform):** Shopify: edit robots.txt.liquid; remove theme-level noindex. WordPress: Settings → Reading 'Discourage search engines' OFF; Yoast/Rank Math per-page 'noindex' off. Squarespace/Wix/Webflow: page SEO settings 'Hide from search' off. Next.js: check metadata robots and middleware headers. nginx/Apache/Cloudflare: remove stray X-Robots-Tag rules (common leftover from staging).

### WS-CRAWL-04 — Missing pages return a real 404 (no soft-200)

- **Group:** Crawling · **Level:** MUST
- **Maps to / overlaps:** Same as WS-READ-02 / AR-READ-02 and AR Part B X-404-BODY. CRAWL-04 adds Googlebot UA and a second random path under a section. Treat as alias; do not double-score in the overall score.
- **Search Console confirmation needed:** Yes — Page indexing report → 'Soft 404'.
- **Source:** https://developers.google.com/crawling/docs/troubleshooting/http-status-codes

**Read-only test**
```bash
for p in "/ws-404-$(date +%s)" "/products/ws-404-$(date +%s)"; do $C -A "$UA_GB" -o raw/crawl04.html -w "%{http_code} %{size_download} $p\n" "$S$p"; grep -ioE '<title[^>]*>[^<]*' raw/crawl04.html; sleep 1; done
```

**Pass rule:** PASS: both return 404 or 410 (a helpful 404 body is fine). FAIL: 200 (soft 404) or a redirect to the homepage. WARN: 404 status but the body is the full homepage.

**Typical fix (by platform):** Shopify/Squarespace/Wix: native 404s are correct; check redirect apps that send everything to '/'. WordPress: disable 'redirect 404 to homepage' plugins. Next.js: notFound() / not-found.tsx, never return 200 for unknown slugs. SPA: server must return 404 for unknown routes (not index.html with 200). nginx: try_files ... =404; Cloudflare: check Workers/Page Rules catch-all.

### WS-CRAWL-05 — Navigation uses real <a href> links, not onClick-only

- **Group:** Crawling · **Level:** MUST
- **Maps to / overlaps:** Same as WS-READ-04 / AR-READ-03 (and safari-27-mcp-optimization step 3; ar_probe fakeButtons). Alias; scored once.
- **Search Console confirmation needed:** No (optional: URL Inspection shows discovered links indirectly via indexing of linked pages).
- **Source:** https://developers.google.com/search/docs/crawling-indexing/links-crawlable

**Read-only test**
```bash
while read -r u; do $C -A "$UA_GB" "$u" > raw/crawl05.html; echo "$u hrefs=$(grep -oiE '<a [^>]*href=["'"'"'][^"'"'"'#j][^"'"'"']*' raw/crawl05.html | wc -l) fake=$(grep -oiE '<(div|span|li)[^>]*onclick|<a [^>]*href=["'"'"'](#|javascript:)' raw/crawl05.html | wc -l)"; sleep 1; done < pages.txt
```

**Pass rule:** PASS: header/footer nav, category, pagination and product links are <a href> with real URLs in raw HTML. FAIL: primary nav or product links exist only as onClick handlers, href="#" or javascript:. WARN: some secondary controls fake.

**Typical fix (by platform):** All platforms: use the theme's link components; replace <div onclick=router.push> with <a href> (Next.js <Link>). Infinite scroll: add paginated ?page=N links. Webflow/Wix: use Link settings, not interactions, for navigation.

### WS-CRAWL-06 — Unique title, meta description, self-referencing canonical

- **Group:** Every page · **Level:** MUST
- **Maps to / overlaps:** Extends WS-READ-14 (title/meta) and WS-FIND-13 (canonical) and AR Part B X-CANONICAL with uniqueness and self-reference across all main pages.
- **Search Console confirmation needed:** Yes — URL Inspection 'User-declared vs Google-selected canonical'; Page indexing 'Duplicate without user-selected canonical'.
- **Source:** https://developers.google.com/search/docs/appearance/title-link ; https://developers.google.com/search/docs/appearance/snippet ; https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

**Read-only test**
```bash
while read -r u; do h=$($C -A "$UA_GB" "$u"); t=$(echo "$h"|grep -ioE '<title[^>]*>[^<]*'|sed 's/<[^>]*>//'); d=$(echo "$h"|grep -ioE '<meta[^>]+name=["'"'"']description["'"'"'][^>]*>'|grep -oiE 'content=["'"'"'][^"'"'"']*'); c=$(echo "$h"|grep -ioE '<link[^>]+rel=["'"'"']canonical["'"'"'][^>]*>'|grep -oiE 'href=["'"'"'][^"'"'"']*'); printf '%s\t%s\t%s\t%s\n' "$u" "$t" "$d" "$c"; sleep 1; done < pages.txt > crawl06.tsv; cut -f2 crawl06.tsv|sort|uniq -d; cut -f3 crawl06.tsv|sort|uniq -d; awk -F'\t' '{print $1, $4}' crawl06.tsv
```

**Pass rule:** PASS: every main page has a non-empty title and meta description, no duplicates across pages, and a canonical whose URL equals the page's own preferred URL (after normalising scheme/host/trailing slash). FAIL: missing title/description, duplicate titles, or canonicals that all point to the homepage / another page. WARN: duplicates only on paginated or variant pages that canonicalise correctly.

**Typical fix (by platform):** Shopify: theme.liquid uses {{ page_title }}, {{ page_description }}, {{ canonical_url }}; fill SEO fields per product/collection. WordPress: Yoast/Rank Math templates + per-page fields; remove hard-coded homepage canonical in header.php. Squarespace/Wix/Webflow: per-page SEO title/description; don't set a site-wide custom canonical. Next.js: generateMetadata with alternates.canonical per route. nginx/Apache: don't inject a global Link: rel=canonical header.

### WS-CRAWL-07 — Lighthouse LCP < 2.5 s and CLS < 0.1

- **Group:** Every page · **Level:** SHOULD
- **Maps to / overlaps:** Same thresholds as WS-AEO-09 (Core Web Vitals; LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) and AR Part B X-CLS. CRAWL-07 is the lab (Lighthouse) per-page view; AEO-09 field data wins when both exist.
- **Search Console confirmation needed:** Yes — Core Web Vitals report (field data, CrUX) confirms real-user results.
- **Source:** https://web.dev/articles/vitals ; https://developer.chrome.com/docs/lighthouse/overview

**Read-only test**
```bash
command -v lighthouse || npx --yes lighthouse --version   # if neither works → UNTESTED
while read -r u; do npx --yes lighthouse "$u" --only-categories=performance --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path="raw/lh-$(echo "$u"|md5sum|cut -c1-8).json"; sleep 1; done < pages.txt
jq -r '[.finalDisplayedUrl,.audits["largest-contentful-paint"].numericValue,.audits["cumulative-layout-shift"].numericValue]|@tsv' raw/lh-*.json
```

**Pass rule:** PASS: every main page LCP < 2500 ms and CLS < 0.1 (record mobile + desktop if time allows). WARN: LCP 2.5–4 s or CLS 0.1–0.25. FAIL: worse. UNTESTED: Lighthouse/Chrome not available on the box — say so; never estimate. Lab numbers vary run to run; state that.

**Typical fix (by platform):** Shopify/Squarespace/Wix/Webflow: compress hero images, cut apps/scripts, preload hero, set image dimensions. WordPress: caching + image optimisation plugin, remove heavy builders. Next.js: next/image with priority on LCP image, font-display swap, avoid layout-shifting banners. Cloudflare: enable Polish/caching; nginx: compression + caching headers.

### WS-CRAWL-08 — Images modern format with width, height and alt

- **Group:** Every page · **Level:** SHOULD
- **Maps to / overlaps:** Overlaps WS-READ-17 and WS-A11Y-04 (alt text) and WS-CRAWL-07/X-CLS (dimensions prevent layout shift). New: format check.
- **Search Console confirmation needed:** No (optional: Core Web Vitals report reflects CLS from missing dimensions).
- **Source:** https://developers.google.com/search/docs/appearance/google-images ; https://www.w3.org/TR/WCAG22/

**Read-only test**
```bash
while read -r u; do $C -A "$UA_GB" "$u" | grep -oiE '<img[^>]*>' > raw/crawl08.txt; echo "$u imgs=$(wc -l < raw/crawl08.txt) noalt=$(grep -vic 'alt=' raw/crawl08.txt) nowh=$(grep -viE 'width=.*height=|height=.*width=' raw/crawl08.txt|wc -l) legacy=$(grep -oiE 'src=["'"'"'][^"'"'"']+\.(jpe?g|png|gif)(\?|["'"'"'])' raw/crawl08.txt|wc -l) picture=$($C -A "$UA_GB" "$u"|grep -oiE 'image/(webp|avif)|\.(webp|avif)'|wc -l)"; sleep 1; done < pages.txt
# spot-check one image: $C -I -H 'Accept: image/avif,image/webp,*/*' <img-url> | grep -i content-type
```

**Pass rule:** PASS: content images have alt (decorative alt=""), explicit width+height (or CSS aspect-ratio), and are served as WebP/AVIF (via <picture>/srcset or CDN content negotiation — confirm with the Accept-header spot check). WARN: legacy JPEG/PNG only or some missing dimensions. FAIL: product/hero images without alt.

**Typical fix (by platform):** Shopify: image_url + image_tag filters auto-serve WebP and add width/height; fill alt in admin. WordPress: core adds width/height; WebP via core uploads or an optimisation plugin; alt in Media Library. Squarespace/Wix/Webflow: CDN serves WebP automatically; add alt in image settings. Next.js: next/image (AVIF/WebP, sizes). Cloudflare: Polish / Image Resizing format=auto.

### WS-CRAWL-09 — No FAQ schema added expecting rich results

- **Group:** Every page · **Level:** MAY
- **Maps to / overlaps:** Same topic as WS-AEO-05 and CHECKLIST Known conflict #5 and fix-pack JSON-LD note. Advisory: changes the recommendation, not the markup.
- **Search Console confirmation needed:** No (the FAQ rich result report was removed from Search Console in June 2026).
- **Source:** https://developers.google.com/search/updates (entries 'Deprecating the FAQ rich result feature' and 'Removing documentation for the FAQ rich result feature') ; https://developers.google.com/search/docs/appearance/structured-data/faqpage (now 301 → changelog)

**Read-only test**
```bash
while read -r u; do echo "$u faqpage=$($C -A "$UA_GB" "$u" | grep -oiE '"@type"\s*:\s*"FAQPage"' | wc -l)"; sleep 1; done < pages.txt
```

**Pass rule:** PASS: no FAQPage markup, or FAQPage present but no plan/claim that it will earn Google FAQ rich results. WARN: owner, agency or plugin claims FAQ markup gives rich results. N/A: no FAQ content. Never FAIL for having valid FAQPage markup (still valid schema.org; harmless). Verified 2026-11-02: Google stopped showing FAQ rich results on May 7, 2026; FAQ docs removed June 2026 (old doc URL now 301s to the changelog).

**Typical fix (by platform):** All platforms: keep a visible on-page FAQ (useful to people and agents); leave existing FAQPage JSON-LD or remove it — no requirement either way; don't buy plugins/services for FAQ rich results. Spend effort on Product/Organization/Breadcrumb data instead.

### WS-CRAWL-10 — sitemap.xml lists only indexable 200 URLs and is in robots.txt

- **Group:** Site-wide · **Level:** MUST
- **Maps to / overlaps:** Overlaps WS-FIND-05/06/07 and AR-FIND-03 (sitemap present/referenced). New: every listed URL must be 200, non-redirect, not noindex, self-canonical (sample up to 20, ≤1 req/s).
- **Search Console confirmation needed:** Yes — Sitemaps report (submitted/read status, discovered URLs) and Page indexing filtered by sitemap.
- **Source:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap ; https://www.sitemaps.org/protocol.html

**Read-only test**
```bash
grep -i '^sitemap:' raw/robots.txt; $C -A "$UA_GB" "$S/sitemap.xml" -o raw/sitemap.xml -w "%{http_code}\n"
grep -oE '<loc>[^<]+' raw/sitemap.xml | sed 's/<loc>//' > sm-urls.txt; wc -l sm-urls.txt   # if index, fetch child sitemaps (≤5)
shuf -n 20 sm-urls.txt | while read -r u; do $C -A "$UA_GB" -o raw/sm.html -w "%{http_code} %{redirect_url} $u" "$u"; grep -qiE 'name=["'"'"']robots["'"'"'][^>]*noindex' raw/sm.html && echo -n ' NOINDEX'; echo; sleep 1; done
```

**Pass rule:** PASS: robots.txt has a Sitemap: line to an absolute URL that returns 200 XML; every sampled URL returns 200 directly (no 3xx/4xx/5xx), has no noindex, and canonicalises to itself; host/scheme match production. FAIL: sitemap missing, not referenced, or any sampled URL redirects, errors, or is noindex. Report the sample size.

**Typical fix (by platform):** Shopify/Squarespace/Wix/Webflow: auto sitemap — fix by un-hiding/deleting pages and fixing redirects; Webflow: exclude pages via SEO settings. WordPress: core wp-sitemap or Yoast/Rank Math; exclude noindex types. Next.js: app/sitemap.ts from the same source as routes. Add 'Sitemap: https://<host>/sitemap.xml' to robots.txt.

### WS-CRAWL-11 — Full crawl: no broken links; redirects are a single hop

- **Group:** Site-wide · **Level:** SHOULD
- **Maps to / overlaps:** Extends WS-FIND-13 (redirects/canonical host). New: bounded crawl for broken internal links and multi-hop chains.
- **Search Console confirmation needed:** Yes — Page indexing ('Not found (404)', 'Page with redirect', 'Redirect error').
- **Source:** https://developers.google.com/search/docs/crawling-indexing/301-redirects ; https://developers.google.com/crawling/docs/troubleshooting/http-status-codes

**Read-only test**
```bash
# bounded, polite crawl of internal links only (max 200 URLs, 1 req/s, GET/HEAD only)
wget --spider -r -l 3 -nd -nv --wait=1 --random-wait=off -U "$UA_GB" --reject-regex '(cart|checkout|account|login|logout|search|\?add)' -e robots=on --max-redirect=0 -o raw/crawl11.log "$S/" ; grep -E 'broken link|40[0-9]|50[0-9]' raw/crawl11.log | sort -u
for u in http://$HOST/ http://www.$HOST/ https://www.$HOST/ $(head -20 pages.txt); do $C -I -L -A "$UA_GB" -o /dev/null -w "%{num_redirects} %{url_effective} <- $u\n" "$u"; sleep 1; done
```

**Pass rule:** PASS: no internal link returns 4xx/5xx; every redirect (http→https, www↔apex, old URLs, trailing slash) reaches the final URL in one hop. WARN: 2-hop chains. FAIL: broken internal links on main pages, chains ≥ 3, or loops. Stop the crawl at the cap and report coverage.

**Typical fix (by platform):** Shopify: URL Redirects admin — point old→final directly; fix menu links. WordPress: Redirection plugin, update old internal links. Squarespace/Wix/Webflow: 301 redirect manager. Next.js: redirects() in next.config to final targets. nginx/Apache/Cloudflare: combine http→https and www→apex into one rule (e.g. Cloudflare single redirect rule).

### WS-CRAWL-12 — No orphan pages (every important page has an internal link)

- **Group:** Site-wide · **Level:** SHOULD
- **Maps to / overlaps:** New (no existing WS/AR ID). Uses CRAWL-10 sitemap list and CRAWL-11 crawl log.
- **Search Console confirmation needed:** Optional — Links report (internal links per page) helps confirm.
- **Source:** https://developers.google.com/search/docs/crawling-indexing/links-crawlable

**Read-only test**
```bash
grep -oE 'https?://[^ ]+' raw/crawl11.log | sed 's/[?#].*//' | sort -u > crawled.txt
sed 's/[?#].*//' sm-urls.txt | sort -u > sm-sorted.txt; comm -23 sm-sorted.txt crawled.txt > orphans.txt; wc -l orphans.txt; head -50 orphans.txt
```

**Pass rule:** PASS: every sitemap URL (and every owner-listed key page) is reachable by ≥1 internal <a href> within the crawl depth. WARN: orphans are low-value (old campaigns). FAIL: product, service, pricing or policy pages only reachable via sitemap. [INFERRED] if the crawl hit its cap — say so.

**Typical fix (by platform):** All platforms: add the page to a menu, collection/category, footer, related-products block or HTML sitemap page; or remove/noindex dead pages and drop them from the sitemap.

## Crawl & Index sweep (procedure)

Goal: one read-only pass over the 12 WS-CRAWL checks, one drafted fix pack, and a before/after proof.

0. **Preconditions.** Profile loaded (`websmith/profiles/<domain>.md`), run folder created, `pages.txt` built from real links. Owner has said "run it". No live-site edits ever: Websmith **drafts** fixes; if the owner gave a repo, it drafts patches (`*.patch` / `git diff` output) in the run folder and never pushes, merges, or deploys.
1. **BEFORE snapshot (required, before any fix work):** for every URL in `pages.txt`, `curl` with `UA_GB` (fallback `UA_BROWSER`), record HTTP status, `<title>`, and the first ~200 chars of visible body text (the CRAWL-01 command writes `crawl-before.txt`). Save to `crawl-before.txt` with the CT timestamp.
2. **Three parallel read-only checkers** (subagents, or sequential passes if subagents are unavailable — say which). Each gets only read tools, the variables above, and its check IDs; each must edit nothing and return a table `check_id | result | URL | problem | file(s) behind it | evidence path`:
   - **Crawling checker:** WS-CRAWL-01..05.
   - **Every-page checker:** WS-CRAWL-06..09.
   - **Site-wide checker:** WS-CRAWL-10..12.
   "Files behind it" = the template/setting/file that produces the problem (e.g. `theme.liquid`, `robots.txt.liquid`, Yoast setting, `app/[slug]/page.tsx`, `next.config.js redirects()`, Cloudflare redirect rule). Mark `[INFERRED]` when guessed from platform fingerprints rather than seen in a repo.
   Global rate limit across all three: ≤ 1 req/s per host total (stagger them or split by time slot).
3. **Merge** the three lists into `crawl-results.json` (`[{id,result,severity,evidence_label,evidence_files[],urls[],files_behind[],note}]`) and add the 12 IDs to the run's `results.json`. Skip checks that don't apply (N/A with reason, e.g. no images, no FAQ content) — don't pad.
4. **ONE fix-pack pass** (websmith-fix-pack, section "Crawl & Index fixes"): from the merged list, draft every fix at once, grouped by file behind it, with platform placement and a verify command per fix. Owner repo → patch files; hosted platform → exact settings path + pasted snippet. Nothing is applied by Websmith.
5. **AFTER snapshot (only when the owner says the fixes are live):** re-curl every URL in `pages.txt` the same way → `crawl-after.txt`, then re-run the FAIL/WARN CRAWL checks plus all MUST CRAWL checks (re-check mode).
6. **Before/after table:** `URL | status before→after | title before → after | body start before → after | checks fixed`. Changes highlighted; unchanged rows say "no change".
7. **Close with the Search Console list:** every check whose "Search Console confirmation needed" is Yes (CRAWL-01, 03, 04, 06, 07, 10, 11; optional 02, 12) that had a problem, with the exact report to open (URL Inspection, Page indexing, Sitemaps, Core Web Vitals). Websmith cannot log in to Search Console; the owner confirms.

### Owner prompt template (verbatim)

> "Send one subagent per group to check without editing anything, and list the URLs with problems and the files behind them. Then fix everything yourself from their lists in one pass. Before changing anything, curl every main page and note its title and how its body text starts. Curl them again when you're done and show me the before and after. Skip anything that doesn't apply, and at the end tell me which ones I have to log in to Search Console to confirm"

**Under Websmith rules, "fix" means: draft the fix pack (and patches if a repo was shared) in one pass — Websmith never edits, pushes, or deploys to the live site.** "Curl them again when you're done" happens after the owner says the fixes are live.

## FAQ rich results verification (CRAWL-09)

Verified by web search on 2026-11-02 (CT): Google Search Central's changelog (https://developers.google.com/search/updates) has "Deprecating the FAQ rich result feature" (May 8, 2026: feature no longer appears starting May 7, 2026) and "Removing documentation for the FAQ rich result feature" (June 2026). The old FAQPage doc URL now returns 301 to the changelog (checked with curl -I on 2026-11-02). Search Console's FAQ report and Rich Results Test support were dropped in June 2026; Search Console API support in August 2026 (per the deprecation notice as quoted by searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/). FAQPage remains valid schema.org.

## Source URL status (checked 2026-11-02 CT, HEAD/GET of Google docs only)

- developers.google.com/search/docs/crawling-indexing/http-network-errors → 301 to developers.google.com/crawling/docs/troubleshooting/http-status-codes (new URL used above)
- developers.google.com/search/docs/crawling-indexing/overview-google-crawlers → 301 to developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers (new URL used above)
- All other CRAWL source URLs returned 200.
