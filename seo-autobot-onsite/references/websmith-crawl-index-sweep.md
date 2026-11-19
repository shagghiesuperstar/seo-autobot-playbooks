---
name: websmith-crawl-index-sweep
description: Use when the owner asks for a crawl/index/SEO-basics sweep, "can Google see my pages", canonicals, sitemap, soft 404s, redirect chains, orphan pages, or uses the "one subagent per group… before and after… Search Console" prompt. Runs WS-CRAWL-01..12 read-only with 3 parallel checkers, drafts one fix pack, and shows a before/after curl table.
---

# Websmith Crawl & Index sweep

Runs the 12 WS-CRAWL checks (full tests, pass rules, fixes, overlaps: `CRAWL-CHECKS.md` / CHECKLIST.v2 "CRAWL" section). Read-only, ≤ 1 req/s per host across all checkers, fail loud, evidence in the run folder.

## Hard rules
- GET/HEAD only. No logins (including Search Console — the owner confirms there), no form submits, no publishing scanners.
- Websmith never edits the live site. "Fix" = draft fix pack; with an owner repo, draft patches only (no push/merge/deploy).
- Spoofed Googlebot blocked (403/429) → UNTESTED (bot verification) + browser-UA retry, never FAIL.
- Lighthouse missing → CRAWL-07 UNTESTED with the error; never estimate.

## Variables
- `S=https://<production-host>` (no trailing slash), `HOST=<production-host>`.
- `C='curl -sS -m 20'`; every request ≤ 1 req/s per host; ≤ 20 sampled URLs per check unless the check says otherwise (CRAWL-11 crawl cap 200 URLs, depth 3).
- `UA_GB='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'` (Googlebot desktop token, per Google's crawler overview). `UA_BROWSER` as in CHECKLIST.md for comparison.
- `pages.txt` = the run's **main pages**: home, 1 listing/category, 3 product/service, pricing, help/FAQ, contact, policies (real links only, from raw HTML or the sitemap; never invented). Cart/checkout/account/login are *not* main pages.
- Run all commands inside the run folder `websmith/runs/<domain>/<YYYY-MM-DD-HHMM>/` so `raw/` paths resolve.
- Spoofed-Googlebot caveat: many WAFs verify Googlebot by reverse DNS and block impostors. A 403/429 to `UA_GB` is **UNTESTED (bot-verification)**, not FAIL; re-run with `UA_BROWSER` and send the owner to Search Console URL Inspection for the real answer.

## Steps
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

## Owner prompt template (verbatim)

> "Send one subagent per group to check without editing anything, and list the URLs with problems and the files behind them. Then fix everything yourself from their lists in one pass. Before changing anything, curl every main page and note its title and how its body text starts. Curl them again when you're done and show me the before and after. Skip anything that doesn't apply, and at the end tell me which ones I have to log in to Search Console to confirm"

**Under Websmith rules, "fix" means: draft the fix pack (and patches if a repo was shared) in one pass — Websmith never edits, pushes, or deploys to the live site.** "Curl them again when you're done" happens after the owner says the fixes are live.

## Check index

- **WS-CRAWL-01** (Crawling, MUST) Main pages readable as Googlebot without JS. Overlaps: Extends WS-READ-01 / AR-READ-01 (raw-HTML facts) with the Googlebot UA and a title+body text record. Search Console: Yes.
- **WS-CRAWL-02** (Crawling, MUST) No empty root shell (SSR/prerender if JS-only). Overlaps: Overlaps WS-READ-01 / AR-READ-01 and AR Part B X-PAGE-SIZE. Search Console: Optional.
- **WS-CRAWL-03** (Crawling, MUST) robots.txt / noindex only on admin/login-type pages. Overlaps: Overlaps WS-FIND-01/02 (robots), WS-AEO-08 (noindex), AR Part B X-META-ROBOTS. Search Console: Yes.
- **WS-CRAWL-04** (Crawling, MUST) Missing pages return a real 404 (no soft-200). Overlaps: Same as WS-READ-02 / AR-READ-02 and AR Part B X-404-BODY. Search Console: Yes.
- **WS-CRAWL-05** (Crawling, MUST) Navigation uses real <a href> links, not onClick-only. Overlaps: Same as WS-READ-04 / AR-READ-03 (and safari-27-mcp-optimization step 3; ar_probe fakeButtons). Search Console: No.
- **WS-CRAWL-06** (Every page, MUST) Unique title, meta description, self-referencing canonical. Overlaps: Extends WS-READ-14 (title/meta) and WS-FIND-13 (canonical) and AR Part B X-CANONICAL with uniqueness and self-reference across all main pages. Search Console: Yes.
- **WS-CRAWL-07** (Every page, SHOULD) Lighthouse LCP < 2.5 s and CLS < 0.1. Overlaps: Same thresholds as WS-AEO-09 (Core Web Vitals; LCP ≤ 2. Search Console: Yes.
- **WS-CRAWL-08** (Every page, SHOULD) Images modern format with width, height and alt. Overlaps: Overlaps WS-READ-17 and WS-A11Y-04 (alt text) and WS-CRAWL-07/X-CLS (dimensions prevent layout shift). Search Console: No.
- **WS-CRAWL-09** (Every page, MAY) No FAQ schema added expecting rich results. Overlaps: Same topic as WS-AEO-05 and CHECKLIST Known conflict #5 and fix-pack JSON-LD note. Search Console: No.
- **WS-CRAWL-10** (Site-wide, MUST) sitemap.xml lists only indexable 200 URLs and is in robots.txt. Overlaps: Overlaps WS-FIND-05/06/07 and AR-FIND-03 (sitemap present/referenced). Search Console: Yes.
- **WS-CRAWL-11** (Site-wide, SHOULD) Full crawl: no broken links; redirects are a single hop. Overlaps: Extends WS-FIND-13 (redirects/canonical host). Search Console: Yes.
- **WS-CRAWL-12** (Site-wide, SHOULD) No orphan pages (every important page has an internal link). Overlaps: New (no existing WS/AR ID). Search Console: Optional.

## Done gate
Done only when: `crawl-before.txt` exists, `crawl-results.json` has all 12 IDs (N/A counts, with reason), the fix pack draft exists for every FAIL/WARN, and the final message lists the Search Console confirmations. AFTER table only once the owner says fixes are live.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `safari-27-mcp-optimization` → `../seo-autobot-agent-readiness/references/safari-27-mcp-optimization-autobot.md`.
- `websmith-fix-pack` → `../seo-autobot-agent-readiness/references/websmith-fix-pack.md`.
