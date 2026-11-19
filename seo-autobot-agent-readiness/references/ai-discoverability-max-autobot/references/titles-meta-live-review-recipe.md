# Titles + meta descriptions + canonical + h1 live review recipe (head-tag-only)

When a task-tracker issue asks for a live check of page titles, meta descriptions, canonicals, or h1s across a Next.js / Medusa storefront, the deliverable is a docs-only PR that lists (a) the clean checks ("0 of 36 missing description"), (b) the per-finding rows with file:line pointers, and (c) the dedupe list against every prior `docs/research/*-audit-*/` and `docs/qa/*-review-*/` on main. This is the narrowest of the read-only review recipes; it does not touch JSON-LD, agent files, or the live body copy.

## When to use

A task-tracker issue that names "title", "meta description", "page titles", "description length", "duplicate titles", "canonical", "h1", or "head tags" and asks for a check of the LIVE site against a known threshold. NOT for: JSON-LD / share-tag review (use `jsonld-sharetag-live-review-recipe.md`), agent-file / llms.txt review (use the umbrella "Read-only review variant" block, agent-file shape), policy-copy or content audit, Medusa writes, catalog publish.

## What "live" means here

The site is fetched with plain `curl` from a signed-out shell, NOT a browser. The page's `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`, og / twitter tags, and h1 are all rendered in the initial HTML by Next.js SSR / `force-dynamic` (<store> product page runs `export const dynamic = "force-dynamic"` because preview DBs are empty), so no JS execution is needed. Each page gets one curl + one Python `html.parser` walk; no Playwright, no headless Chrome, no screenshot, no Lighthouse.

## Threshold guidance (do not invent)

Every threshold you quote in the report must be one of:

1. **The repo's own constant** (e.g. `apps/storefront/src/lib/seo/fit.ts` `DESC_MIN = 120`, `TITLE_MAX = 60`). These are the strongest source — a description shorter than the repo's own floor is a defect, full stop.
2. **A real search-engine threshold** cited from a current primary source (Google's ~155-160 description snippet cap, the ~60 title cap). Cite the URL in the report footer so a future reader can re-verify.
3. **The card body's stated threshold**, repeated verbatim. If the task-tracker issue says "titles should be 50-60 chars", the report's "clean check" prints that range and the actual distribution next to it.

NEVER invent a threshold like "70 characters" because it "sounds about right" — that turns a real audit into a noise generator. The audit's job is to find what the project itself thinks is wrong, not to apply generic SEO rules.

## Dedupe (do this BEFORE the first fetch)

1. `git log --oneline docs/research docs/qa | head -50` and `ls docs/research docs/qa` on the worktree. The umbrella already warns: ~12 read-only audits sat In Review without a fix card (10-11). Quote the dedupe list in the report so a future reader does not refile the same gaps.
2. `search_files` for `seo-meta` and `head` and `description` inside `docs/marketing/*` on main. The override table at `apps/storefront/src/lib/constants/seo-meta-overrides.ts` (<store> <ticket>) is a reviewed, intentional, owner-decision artifact — every per-product title/description in there is "used verbatim when the handle has a row; every other product keeps the derived copy below." Reading this is what tells you whether a `title != h1` is a defect or a deliberate neutralisation.
3. If `docs/marketing/seo-meta-proposals/DECISIONS.md` exists, read it before reporting any title-vs-h1 drift. <ticket> lists open owner decisions (e.g. "neutralised catalog words: 'Nootropic' dropped from titles but kept in h1s and URL slugs") that are NOT defects — they are flagged in `decision_flags` of the proposal CSV and the override table comments.

A title-vs-h1 difference WITHOUT the DECISIONS.md cross-check is a false-positive generator. The pattern: Day Tripper chocolates have h1 "Day Tripper Milk Chocolate Trip-45g/10pcs bar" and title "Day Tripper Milk Chocolate 45g/10pcs bar | <store>" — the title drops "Trip" by owner decision (DECISIONS.md open decision #1), not by oversight.

## File layout (one docs-only PR, one branch, one commit)

- `docs/qa/<site>-titles-meta-live-<NNN>/REPORT.md` — narrative, dedupe list, clean-checks table, per-finding rows, method footer.
- `docs/qa/<site>-titles-meta-live-<NNN>/findings.csv` — same rows, machine-readable. Columns: `id,severity,page,source,issue,evidence,smallest_fix`.

NEVER put these at `docs/research/...` — the umbrella's "Read-only review variant" already standardises on `docs/qa/<site>-<kind>-review-<NNN>/`. Mixing both folders across sessions makes future dedupe impossible.

## Method footer (paste verbatim)

> Fetched each URL with curl (follow redirects), parsed `<title>`, `<meta name="description">`, `<h1>`, `<link rel="canonical">`, robots meta and og tags with Python html.parser. Product list = product-sitemap.xml cross-checked against links on /us, /us/store and the 9 category shelves. Duplicates computed on exact string match. Raw per-page data was not committed; findings.csv holds the flagged rows. Repo commit read for file:line pointers: `<head-sha>` (main).

## Findings row shape

Each row in `findings.csv` carries:

- `id`: `F-01`, `F-02`, ... (zero-padded).
- `severity`: `MED` for hard threshold failures (under the repo's own floor), `LOW` for title-vs-h1 differences that the DECISIONS.md might cover, `INFO` for any other note.
- `page`: full live URL.
- `source`: `apps/storefront/src/lib/constants/seo-meta-overrides.ts:<line>` (or whichever file holds the copy that produces the observed value). The line number must come from a `grep -n` against the live `main` head, not from memory.
- `issue`: one-sentence statement of what is wrong, including the measured value (e.g. "Meta description under 70 characters: 56 chars: '...'").
- `evidence`: the measured value as it appears on the live page (paste the string, not a paraphrase).
- `smallest_fix`: the change that would resolve the row. Quote an existing sentence or a new file:line edit; never invent copy that is not already used somewhere on the live site.

## Pitfalls

- **The repo's `DESC_MIN` is rarely 70.** <store> `fit.ts:11` sets `DESC_MIN = 120`. Reporting a 98-char description as a "real threshold failure" because 70 "sounds about right" is the failure shape — it makes the auditor the source of the threshold, not the project. Always grep the repo for the actual constant before naming a number in the report.
- **Title vs h1 difference ≠ defect.** A neutralised-word project will drop catalog terms in titles on purpose (and the override table comments call this out). Read `docs/marketing/seo-meta-proposals/DECISIONS.md` and the `decision_flags` column of the proposal CSV before reporting any title≠h1 row. If a h1 still says "Trip" or "Nootropic" and the title doesn't, the title is doing what the owner asked; the h1 is the live product name, unchanged.
- **graphify returns path strings, not facts.** `mcp__graphify__query_graph` is a useful first pointer but the returned path may be stale (renamed, deleted, moved). Run `git ls-files <path>` or `git grep -l <symbol>` against the live `main` head BEFORE writing a file:line citation into findings.csv. The umbrella's "graphify: stale" caveat is a pointer, not a fix.
- **One product in the sitemap is a missing product, not a false positive.** Cross-check the product list: `product-sitemap.xml` is the canonical product inventory; cross-check it against links on `/us`, `/us/store`, and the category shelves. A product in any of those but missing from the sitemap is a real gap. A product in the sitemap but not in your fetched set is a `psm-not-fetched` row, not a clean check.
- **Canonical host is a finding, not noise.** A canonical pointing at a different host than the page is served from is a duplicate-content signal (search engines see the page as belonging to whichever host the canonical names). <store> ships on `<store>.example` while the public canonical may eventually live on `<store>.example` — verify whether the served host is the intended public host, and name the assumption in the report footer if not.
- **Soft-200 on `/version` is not a finding here.** Gates and catch-alls (`/version` 307s to research-access on <store>, etc.) are part of the broader AEO site audit (`site_audit.py`), not this recipe. A title-meta audit reads HTML 200s; walled URLs go in a separate, gate-aware list.
- **Suggested copy must already exist on the live site.** The smallest-fix column is allowed to add a word from `/us/returns`, from a sibling PDP's description, or from the home-page meta description — never a fact that is not already in the live HTML. A "smallest fix" that invents copy is a stealth content write, not a meta audit.

## PR body stamp (docs-only, do not merge)

Every title-meta audit PR body ends with this exact pair:

```
build skipped: docs-only diff

Result: <one line — e.g. "36 live pages checked; 1 hard-threshold failure, 8 title-vs-h1 differences (4 LOW, 3 INFO, 1 LOW brand-only h1), 3 INFO notes.">

Draft PR. Do not merge or deploy from this PR.
```

`--draft` is the gh CLI flag, not just a comment. Branch name is `<branch>/<ticket-id>-<slug>-titles-meta-live` (matches your task tracker's branch-naming pattern).

## Verification (paste in PR body)

- `gh pr view <N> --json isDraft,state,files,baseRefName` — `isDraft: true`, `state: OPEN`, `baseRefName: main`, files = exactly the two docs files. Quote the JSON in the PR body.
- Per-finding file:line: re-`grep -n` the cited symbol against the live `main` head, paste the matched line in the PR body's "Method" section.
- Product list: count of `<loc>` tags in `product-sitemap.xml` matches the count of product paths in your fetched set; both should equal the number of category-shelf links.
- Clean-checks table: every "0 of N" claim is a real `==0` count, not a hand count.

## One-line summary (paste in handoff)

> "N live pages checked (home, store, about, all M products). Hard-threshold failures: K. Title-vs-h1 differences: J (M LOW by DECISIONS.md, N INFO). No missing, duplicate, over-length, or cross-host-canonical issues. N rows total, listed in findings.csv. Draft PR #N open at <sha>. Build skipped: docs-only diff. Do not merge."
