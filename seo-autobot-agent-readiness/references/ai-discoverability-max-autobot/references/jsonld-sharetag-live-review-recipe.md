# JSON-LD + share-tag live review recipe (docs-only PR, no build, no deploy)

When a task-tracker issue asks for a live fact-check of the page's structured data and head tags (JSON-LD, og:/twitter:, BreadcrumbList, Organization @id, per-Offer price/availability/sku, share-image width/height, etc.) against the visible page, the deliverable is a signed-out live read and a per-page `blocks.csv` with severity-classified rows. Same shape as the `Read-only review variant` in the umbrella SKILL.md, but the comparison axis is the page's own structured data and share tags (not the agent files). The standard's section 7 gates do not apply (no build, no code change, no deploy). Static scorecard counts from `scripts/site_audit.py` stay the on-call landing pad for all sites; this recipe is the deeper, docs-only PR that proves a real cross-check ran on a specific sample.

## When to use

A task-tracker issue that names a sample size, a host, and asks for "live JSON-LD validation", "share-tag audit", "validate N pages JSON-LD + og:", "schema.org cross-check on the live site", or "Rich Results review". Specifically NOT for: full AEO/AIO scan/fix cards (those are full ai-discoverability-max-autobot jobs that ship section 7 numbers), Medusa write lanes, catalog publish, or wholesale description batches.

## Output shape (per run)

- `docs/qa/<site>-jsonld-live-<NNN>/REPORT.md` — narrative: dedupe list, page table (URL, HTTP, ld+json blocks, graph nodes, og: count, twitter: count), findings by count with severity, what was checked and passed, what was not verified, suggested next steps.
- `docs/qa/<site>-jsonld-live-<NNN>/blocks.csv` — machine-readable, columns: `url,type,issue,severity,source_file_guess`. Severity is one of `error` (parse, missing required, null/empty, duplicate Organization, unresolved @id, price/currency mismatch, wrong availability URL, broken share image), `warn` (recommended prop missing, share-card quality), `info` (by-design missing, UX question, partial confirmation), `info-blocked` (page could not be read live, e.g. 307 to research-access), `info-source` (static read of source, not live).
- `docs/qa/<site>-jsonld-live-<NNN>/tools/` — the Python scripts that produced the numbers (`fetch.py`, `extract.py`, `validate.py`). Reproducible by re-running in the same Python session.
- One commit on a new branch named `<branch>/<ticket-id>-rev-<site>-live-json-ld-share-tags-validation-N-pages`, `--draft` PR, repo `<org>/<store>-store` (NOT `<org>` for these), base `main`, head `<branch>`. Title tag `[<TICKET-ID>]`.
- PR body stamps `build skipped: docs-only diff` and the test plan says `Do not merge. Draft only.`

## Live evidence first (the cardinal rule)

Before any finding, fetch the live pages from a signed-out browser session at the rate already in the SKILL.md `Measure live` step (about 2 req/s). For a 15-page run: 1 sitemap + 15 page fetches + 6 HEAD checks for the unique share images + a handful of exploratory GETs is well under any rate cap. Use a UA string that identifies the run (`<issue-id>-jsonld-review/1.0 (read-only fact check)`) so logs are attributable.

The recipe's "live" facts are:
- HTTP status of every URL (200/307/404/...). 307 to a research-access or login page is `info-blocked`, not a gap to fix in this recipe.
- The exact `ld+json` block count per page, the `@graph` node count, and the SET of `@type` values. One page == one block is the typical pattern; multiple blocks need a row explaining why.
- The per-page `og:` tag count and `twitter:` tag count. Counted from the live HTML, not the React component.
- The Offer-level cross-check: for each product, the lowest Offer `price` and the default-size Offer `price` must equal the visible "$X per unit" and "size · $X" lines, and the Offer `availability` URL must be a valid schema.org URL.
- The Organization `@id` must be the same string on every page (one Organization per domain); count duplicates.
- Every `BreadcrumbList` position must have a `name` and `item`, and the last `item` must equal the page URL.
- Every `shippingDetails` and `hasMerchantReturnPolicy` `@id` reference must resolve to a node in the same `@graph`.

## Sampling (don't claim you covered all 48)

If the catalog has 48 products, sample 10 to 12 with a deterministic stride (e.g. every 4th URL of `product-sitemap.xml`). Quote the stride and the sampled indices in the report so a future reader can reproduce. State the sample size in the headline number ("0 hard errors on the 10 products sampled"). A 100% claim on a 10-of-48 sample is a defect.

## Cross-check the structured data against the visible page

This is the part a static scorecard cannot do. For each product page, parse the JSON-LD, then parse the visible HTML, then assert:
- `Product.name` == `<h1>` text
- Lowest `Offer.price` == visible "$X per unit" line (float-equal, not string-equal — JSON-LD has `"52.40"`, visible HTML has `"$52.40"`)
- Default-size `Offer.price` == visible "size · $X" line
- `Offer.availability` URL validity (must start with `https://schema.org/`)
- `Offer.priceCurrency` == `USD` and the visible `$` symbol
- `Offer.sku` non-empty
- `OfferShippingDetails` and `MerchantReturnPolicy` nodes present in the same graph

Same shape for Organization, WebSite, BreadcrumbList: required props present, no null/empty values, no unresolved `@id` references.

For share tags: `og:title` == `twitter:title`, `og:image` == `twitter:image`, `og:url` == `<link rel=canonical>`, and each unique `og:image` URL returns `200 image/*` from a HEAD.

## Walled URLs (the row that should never be a gap)

If a category URL returns 307 to `/us/research-access` for a signed-out visitor, do not log in and do not skip. Record one `info-blocked` row per walled URL, with the redirect target in the issue text. Then do a static read of the source route (`app/[countryCode]/(main)/categories/[...category]/page.tsx` and the matching `modules/categories` template) and record an `info-source` row with the grep evidence (e.g. "0 PageGraph / ld+json / breadcrumb references found, so the page would emit no BreadcrumbList even for a signed-in visitor"). Two rows, not one, so a future reader can split the "what we could not check" from the "what the source emits".

## graphify path staleness (10-12)

`mcp__graphify__query_graph` returns file paths that the index saw on a given snapshot. If the file was renamed, deleted, or moved after the index ran, the path string is stale and a `git ls-files` will not find it. The recipe that this skill predates (and any recipe that uses graphify) must verify every path string graphify returns with `git ls-files` (or `git grep -l`) against the live `main` head, before stamping it into a `source_file_guess` cell. Do not append a `graphify: stale` caveat after writing; the path string itself is the defect. The <store>-store session that produced this recipe opened with `product-json-ld.ts` and `organization-json-ld.ts` from graphify; the real paths were `lib/structured-data.ts` and `lib/site-meta.ts`. Re-running `git ls-files` first would have written the right paths from the start.

## Source-file guesses with real line numbers

Every row in `blocks.csv` should name the file that emits the field it flags, with a real line number. Get the line number from the source on the branch (not from the description in graphify or the in-file JSDoc):
- `git grep -n -E 'export function (productNodeFromRecord|organizationNode|webPageNode|breadcrumbNode|offerNode)' <remote>/main -- <path>` for top-level builders.
- For inline builders in a page route: `git show <remote>/main:<path>` to a buffer, then `sed -n '<line>,<line>p'`. Don't paste a description that includes the file as if the description is the evidence.

The validator is the script that re-derives these from the source on every run; do not hand-count. A "31 offers" claim in the report that the validator's direct product["offers"] count says is 24 is a hand-count error; re-run the validator, paste the right number.

## Per-URL og: and per-URL twitter: count is a count, not a coverage check

The 4 `og:` tags that every page should have (`og:title`, `og:description`, `og:url`, `og:image`) and the 4 `twitter:` tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) appear on every page. The total counts per page are a count, not a quality bar. The quality bar is: `og:description` equals the meta description (or differs by a known reason the report names); `og:type` is `product` on product pages (not `website`); `og:image` carries `og:image:width` and `og:image:height`; the per-product `og:image` is a product photo, not a generic stock still shared across N products. The "shared generic share image" finding is one finding spanning the N products, not N rows; the report says "5 stock product stills across 10 products", not "10 findings".

## Non-default Offer prices are not in the server HTML

A Medusa starter product page that has a size picker renders only the "from" price and the default-size price as DOM text. The non-default Offer `price` values are in the JSON-LD, but not in the visible HTML, so a per-size cross-check from the HTML side is impossible without a session. Record this as an `info` row that names the limit, not as a `warn` that pretends the check could have run. Future scripts that want per-size cross-checks need to mount the size picker or replay the click; do not paper over the limit.

## Medusa PDP offer prices are floats, not strings

JSON-LD `Offer.price` is a JSON number that ships through the API as a string in the HTML (`"52.40"`, with a trailing zero). The visible HTML carries `$52.40`. Comparing the two as strings fails on the leading `$` and the trailing zero; the right comparison is `abs(float(o["price"]) - float(visible.strip("$"))) < 0.005`. Encode the comparison in the validator, not in a chat-side `grep -F`.

## Build skipped: docs-only diff

The PR body header says `build skipped: docs-only diff` and the test plan says `Do not merge. Draft only.` so a future reader does not try to land it. The change set is `docs/qa/...` only; no `apps/`, no `package.json`, no `next.config.js`, no env vars, no Cloud env. `git diff --stat HEAD~1` should show only files under `docs/qa/...`.

## Repo + remote

- Repo: `<org>/<store>-store` (<store>, <store>, or whatever the live host's repo is). NOT `<org>` for these.
- The shadow remote is `github-backup` (<store>, <store>). Always `git rev-parse <remote>/main` before the commit, prove the branch tip is at the same SHA, and pin the body to `refs/remotes/<remote>/main`. A worker that builds 50 commits behind main is a routing defect.
- `git sparse-checkout init --cone && git sparse-checkout set docs/qa` is enough to read prior `docs/qa/<site>-*-review-*` audits before writing; do not full-clone when a sparse read is enough.
- Branch name is `<branch>/<ticket-id>-rev-<site>-live-json-ld-share-tags-validation-N-pages`. PR with `gh pr create --draft --base main --head <branch> --title "[<ticket-id>] REV: <site> live JSON-LD and share-tag validation, N pages" --body-file <pr-body>`.

## Common traps

- **Stale graphify path string in `source_file_guess`.** See "graphify path staleness" above. The path string is the evidence; the caveat is not.
- **Hand-counted offer totals.** The validator's first CSV said 31, the direct count said 24. The direct count wins; re-run the validator and paste the right number.
- **One finding spanning N products listed as N rows.** "Shared generic share image across 10 products" is one row in the per-page table, not 10 `warn` rows. The 10 `warn` rows are "this product has no per-product share image" and the dedupe is in the report's findings-by-count table.
- **Walled URL recorded as a gap to fix.** A category URL that 307s to research-access is the operator's deliberate <decision-id> ruling on <store> (or the equivalent on the next site), not a defect to fix in this recipe. Record `info-blocked` and `info-source`; do not invent a fix.
- **Logging in to read a walled URL.** A signed-out audit is the contract. Logging in is a different, larger card with its own AR pass and its own blast radius. The recipe's section 1 says "Do NOT log in" because logging in voids the cross-site claim this recipe's numbers make.
- **Validator-based required-prop check that drifts from Google's documentation.** A "missing priceValidUntil" `warn` is a Google recommendation, not a schema.org requirement. Mark Google-recommendation warnings `warn` and required-prop errors `error`; do not collapse the two. A reader reading the report should be able to tell at a glance which findings break a Rich Result test and which are quality nits. Google's product structured-data page renders the property table in the client, so a static fetch with no table neither confirms nor refutes a recommendation — do not cite "the docs page did not mention X" from that fetch.
- **Sample size in the headline number.** "0 hard errors on the 10 products sampled" beats "0 hard errors" in the headline. The sample size is the audit's claim, not a footnote.
- **One org node, same `@id`, on every page.** The <store>-store org node is `https://<store>.example/#organization` on every page. If the org `@id` drifts between pages, that is one finding, not one finding per page. Count distinct org `@id` values, not org nodes.

## Verification (paste in PR body)

- `gh pr view <n> --repo <org>/<store>-store --json isDraft,state,baseRefName,changedFiles,headRefOid -q '.'` returns `isDraft:true`, `state:OPEN`, `baseRefName:main`, and the changed files are only under `docs/qa/<site>-jsonld-live-<NNN>/`.
- `wc -l docs/qa/<site>-jsonld-live-<NNN>/blocks.csv` and `csv.DictReader` on it assert the schema (5 columns, severity in the allowed set, every url/type/issue non-empty). Paste the row count and the severity breakdown.
- `python3 tools/validate.py | head` re-runs without import errors and prints the summary lines.
- The page table in the report has one row per URL, the HTTP code, the ld+json count, the @graph count, the og: count, the twitter: count. The totals at the bottom of the report match the sum of the per-page counts.
- `git diff --stat HEAD~1` shows only `docs/qa/...` files.

## One-line summary (paste in handoff)

> "N pages live read, signed-out, 2 req/s, M ld+json blocks, K @graph nodes, 0 hard errors, W warnings, I info, B info-blocked (walled URLs not logged in), S info-source (static source reads), draft PR #N open at <sha>, dedupe list of N earlier audits. Build skipped: docs-only diff. Do not merge. Draft only."
