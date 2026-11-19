# Buyer-glossary + DefinedTermSet recipe (public B2C, <store> class of site)

When a task-tracker issue asks for a buyer-facing glossary, "explain the words on the label", or N short definitions of product-page terms with a JSON-LD companion, the deliverable is a defined-term-set draft: N terms at 30-80 words each, every term anchored to a live product or category on the site, plus one `DefinedTermSet` JSON-LD file with N `DefinedTerm` nodes whose `@id` and `url` point at the live page the term is shown on. This reference is the recipe; the umbrella SKILL.md still owns the AEO/AIO standard.

## When to use

A task-tracker issue from the <store> B2C lane (or any public, age-gated B2C catalog whose public surface is product pages and categories) that asks for a buyer glossary, a term dictionary, a "what does X mean on the label" page, or a draft `DefinedTermSet` for AI discoverability. Specifically NOT for: the published storefront glossary content (which lives in `apps/storefront/src/app/[countryCode]/(main)/learn/learn-copy.ts` and renders at `/us/learn/glossary` — extend THAT file, not this recipe), research-supply category intros (the `answer-first-research-supply-intro-recipe.md` recipe is the right one for those), wholesale description batches, or a full AEO/AIO scan/fix card.

## Output shape

- **One markdown file**, one H2 per term (`## N. <Term name>`). Each term has: the 30-80 word definition, a "Where on the site" line that links to the live product or category the term is shown on, a "Store facts" line whose source URLs are the live pages the facts were read from, and an optional "Public reference" line for general terms (federal CFR, FDA, NIST, etc., fetched once on the day of the draft).
- **One JSON-LD file** as the companion. Shape: one `DefinedTermSet` with `@id` ending `#<set-slug>`, `inLanguage: "en-US"`, `url` pointing at the future published glossary page, and `hasDefinedTerm` an array of `DefinedTerm` nodes. Each `DefinedTerm` has `@type: "DefinedTerm"`, `@id` ending `#<term-slug>`, `name`, `termCode`, `description` (the SAME 30-80 word text as the markdown — md/jsonld parity is a gate), `url` pointing at the live product/category page the term is shown on (NOT the glossary hash), and `inDefinedTermSet: { "@id": <set-id> }`. Use `sameAs` for general references when there is more than one public reference, or a single string when there is one.
- **One check script** that runs every check in the SAME Python file and exits non-zero on any failure. It parses the JSON-LD, asserts the 30-node count, asserts 30-80 word definitions, asserts md/jsonld parity (the definition paragraph in section N of the md matches `terms[N-1].description` in the JSON-LD), asserts no term's name collides with the headings of the published storefront glossary (so the new terms are genuinely new), runs the claim-word regex against both files (0 hits), and (under `--live`) GETs every internal link at ~0.6 s per request (under 2 req/s) and asserts 200. The script is the gate; the build is whatever writes both files in one pass.

Deliverable files (one docs-only PR, one branch, one commit):

- `docs/marketing/ud-glossary-001/glossary.md` — human-readable with one H2 per term.
- `docs/marketing/ud-glossary-001/glossary.jsonld` — DefinedTermSet + N DefinedTerm nodes.
- `docs/marketing/ud-glossary-001/check_glossary.py` — the offline checks; `--live` adds the link check.

`ud-glossary-001` is the slug the day the card was dispatched; rename per task-tracker id when reused.

## Dedupe (do this BEFORE writing)

The published storefront glossary already covers the technical terms (COA, batch, serving size, active-ingredient potency, ratios, state gate, age check, etc.). Adding a duplicate heading creates a "two definitions, which is right?" problem the day the new page goes live. The recipe is: skip what is already defined, write the new terms. Run these in the SAME turn as the first read:

1. `mcp__graphify__query_graph` against the repo with a question like "storefront glossary learn page DefinedTerm" and a `project_path` for <store>-store main (see graphify-first). If the graph returns an earlier `ud-glossary-*` or `*-glossary*` path, read it before writing — earlier drafts may be on main and not-merged-as-such; treat as in-scope content to skip, not as OBE.
2. `search_files` for `apps/storefront/src/app/**/learn-copy.ts` on the worktree. Extract every `### <heading>` from the `GLOSSARY_MARKDOWN = String.raw\`...\`` block (the published glossary content). That set is the dedupe baseline.
3. `search_files` for `docs/marketing/coa-explainer-001/*.jsonld.json`, `docs/marketing/site-faq-draft/faq.md`, and the entire `docs/marketing/pdp-faq-drafts/` directory. The per-product FAQ drafts are product-specific (label, COA, variant, return) and do not define glossary terms, but they tell you which facts already exist on the page.
4. The `docs/marketing/<store>-site-faq-001/faq.md` B2B FAQ is a different audience and is not used.
5. `git grep -il` for terms that look borderline (e.g. `mg per piece`, `milligram`, `low sugar`, `nano`, `proprietary blend`) across `docs/marketing/`. If any of them appears as a FAQ heading, that is a cross-check, not a skip.

Quoted at the top of `glossary.md` is a "Dedupe list" section that names every file read, the count of headings inside it, and a one-line note on why it was skipped. The check script re-derives the published-glossary heading set on every run and asserts no new term collides.

## Claim-word regex (no claims about the body, no amounts to take)

The <store> store does not have a `banned-terms.txt` in `apps/storefront/src/lib/compliance/` (<store> does; <store> does not). Build the regex in the build script and quote it inside `glossary.md` between two marker lines so a future reader can re-run it:

```
\b(cure[sd]?|curing|treat\w*|heal\w*|diagnos\w*|prevent\w*|therap\w*|medic\w*|relax\w*|calm\w*|sleep\w*|insomnia|
anxi\w*|stress\w*|pain\w*|ache[sd]?|inflam\w*|relie[fv]\w*|energ\w*|focus\w*|mood\w*|euphor\w*|high|buzz\w*|
effects?|affect\w*|onset|dos(e|es|ed|ing|age)|immun\w*|cognit\w*|memory|brain\w*|nootropic\w*|wellness|health\w*|
sedat\w*|stoned|clinical\w*|disease\w*|symptom\w*|benefit\w*|boost\w*)\b
```

`glossary.md` quotes this regex between `<!-- regex:start -->` and `<!-- regex:end -->` markers, then reports the hit count. Run it against `glossary.md` and `glossary.jsonld` (after stripping the marker block from the md). Target: 0 hits in both. Product names like "Enhanced" are not claims and are not in the regex. A non-zero hit is a re-write, not a comment — most common causes are stray words in the "Public reference" line (drop the line, the citation can live in the store-facts line) and a body-effect sentence in a term that should describe a label.

## Build script as the gate

Encode the word-count band, the dedupe check, the md/jsonld parity, and the claim-word regex in one Python file (`build.py` outside the deliverable dir, or inline in `check_glossary.py` — same rule). The same call that writes `glossary.md` and `glossary.jsonld` also prints the per-term word count. When the script is the gate, a word-count regression is a non-zero exit, not a review comment. Re-run after every edit; paste the per-term count into the PR body so the reader sees the actual numbers, not a hand claim.

The word-count band is **30-80 words** per definition. Below 30, the term is too thin to quote; above 80, an AI answer engine is more likely to truncate and drop the named page. The published storefront glossary uses 40-60 word definitions — the wider band here is on purpose because each term is anchored to one live product page, not a general concept.

## "Where on the site" links are the load-bearing piece

Every term's `url` in the JSON-LD (and the "Where on the site" line in the md) must point at a live product or category page where the term is actually shown. That is what makes the glossary crawlable from search and quotable by an answer engine. Three traps:

- **The same product can be a quote for two terms only when both terms appear on the page.** A "<ingredient> extract" definition that points at the <brand-a> page is correct because <brand-a> lists "<Ingredient> Extract" in the ingredient list. A "<qualifier> <ingredient> extract" definition that points at the same <brand-a> page is wrong — <brand-a> does not say "<qualifier>". Point that one at the <brand-b> product whose page label does.
- **Category pages are valid anchors when the term names a category** (e.g. "<category> beverage" → the live `/us/categories/<category>-beverage` page). A category anchor with one product today may have six next month; the link is to the category, not the product, and the link check tolerates the category size change.
- **The link text in the md is the term a shopper would search for, not the page h1.** A shopper searching "what is a chewable tablet" wants the <brand> page; the link text is "<brand> product page", and the URL is the live PDP. The check asserts the link domain is the storefront host and the path starts with `/us/`.

## Catalog quirks to surface, not guess

When a fact on the page is partial or contradictory, the definition says **UNKNOWN** rather than invent a value. Three real patterns that show up on public B2C catalogs and that have to be flagged as data gaps for the operator, not smoothed over:

- **A category whose name does not match the product it holds.** "<category> softgels and capsules" holding one product that the page describes as chewable tablets is a catalog-vs-format mismatch. Surface it in the "Data gaps for your orchestrator" section of the handoff, not in the glossary entry — the entry defines the format, the gap is the catalog.
- **A product page with no ingredient list and no COA.** Every product in one category may show "No COA on file", and most may show no ingredient list. The definitions that need an ingredient list (e.g. "vegan", "gluten-free") point at the ONE page that has one and say so; the others say "UNKNOWN" in the entry and the gap is named in the handoff.
- **An unexplained number on the label.** An "N:1" extract ratio, or a proprietary blend total that lists four ingredients but no per-ingredient amount, is "UNKNOWN" in the entry. Federal 21 CFR 101.36 lets a dietary-supplement label put four ingredients under one proprietary-blend total, so the term "proprietary blend" gets its own entry that points at the page and cites the CFR; the per-ingredient amounts stay UNKNOWN unless the page says otherwise.

## Source URLs

Every store-fact line carries a source URL. The check verifies the URL host is the storefront host. A general term (federal CFR, FDA, NIST, Wikipedia, the Vegan Society) gets a public-reference URL that is fetched ONCE on the day of the draft and confirmed to load; record the date in the term entry. Never cite a public reference you have not fetched; the URL is the receipt, the fetched content is the proof, and "I read it once" is not durable.

The <store> PDPs render label/value pairs with the label on its own line and a dash before the value (e.g. `Distributor\n- <lab name>`). A literal search for `Distributor: <lab name>` misses this; a regex tolerant of `^\s*-\s*<lab name>$` finds it. Use the tolerant pattern when grepping the live HTML for label facts, and record the actual on-page line in the term's "Store facts" line.

## Live evidence first (the cardinal rule)

Before any text, fetch the live public pages at ~0.6 s per request (under 2 req/s) from a signed-out shell session. The recipe's "live" facts are:

- The product feed `feeds/products.json` (one GET) for the catalog count and category membership.
- Each product page (`/us/products/<handle>`) the terms will quote. One GET per page, in handle order, time-stamped with `date` in the PR body.
- The public reference URLs the terms cite. One HEAD/GET each, on the day of the draft.
- `llms.txt` and the site footer for the operator's full legal name (legal entity, any D/B/A, and registered address exactly as published) and the FDA disclaimer wording, so the term entries that mention the operator or the disclaimer cite the real text.

A fact that lives in the in-repo class map but is not on the live page is the repository going stale; trust the live page. Re-pull and re-write in the same turn.

## PR body stamp (docs-only, do not merge)

Every glossary PR body ends with this exact pair, so a future reader does not try to land it as a deploy:

```
build skipped: docs-only diff
Do not merge. Draft only.
```

`build skipped: docs-only diff` in the PR body header. The PR is `--draft` (the gh CLI flag, not just a comment). Branch name is `<branch>/<ticket-id>-rev-<slug>-buyer-glossary-30-terms-with-definedterm-json` (matches your task tracker's branch-naming pattern). Title is `[<TICKET-ID>] <slug>: buyer glossary draft, N terms with DefinedTerm JSON-LD (docs only)`. Files: exactly the three under `docs/marketing/<slug>/`.

## Repo + remote

- Repo: `<org>/<store>-store` for <store> (`<org>/<store>-store`). For <store>, swap to `<org>/<store>-store` and use the research-supply intro recipe instead. NOT `<org>` — those are client repos. Switch with `gh auth switch --user <org>` if needed and verify with `gh auth status` before the push.
- The shadow remote on <store> is `origin`; the repo has a `<sha>` (or current `main` tip) at the moment of the draft. Always `git rev-parse origin/main` before the commit, prove the branch is at the same tip, and pin the build card body to `refs/remotes/origin/main` (task-card lifecycle rule: pin the build card to the remote main tip). A worker that builds 50 commits behind main is a routing defect.
- The branch is `<owner>/sha-590-rev-<store>-buyer-glossary-30-terms-with-definedterm-json`; PR with `gh pr create --draft --base main --head <branch> --title "[<ticket>] <ticket>: buyer glossary draft, 30 terms with DefinedTerm JSON-LD (docs only)" --body-file <pr-body>`. Title tag is `[<TICKET-ID>]` so a future reader can grep the issue.

## Common traps

- **Re-using a published-glossary heading as a new term.** A shopper who lands on `/us/learn/glossary` and then on the new page sees two different definitions for the same word. The check asserts the new term's name is not in the published heading set; on a collision, the right answer is to write a more specific term (e.g. "<ingredient>-derived" instead of "<ingredient>", "mg per piece" instead of "milligram") or to extend the published file instead of adding a new file.
- **Inventing facts to fill a UNKNOWN.** When the site is silent on a term (e.g. "nano-emulsion" appears in two customer-forum quotes in `docs/marketing/voc-001/voc.csv` but in zero product statements), the entry defines the general meaning with a public reference and explicitly says "no <store> product statement found". Inventing a value to make the entry look complete is the same class of bug as hallucinating a citation.
- **JSON-LD that points at the glossary hash, not the product.** The `url` field on a `DefinedTerm` is what an answer engine follows; pointing it at `#<term-slug>` instead of the live product page makes the term a no-op for crawlability. The check asserts every `url` starts with the storefront host and the path starts with `/us/`.
- **Pushing the same change to learn-copy.ts as a side-effect.** The published glossary content lives in `learn-copy.ts` (GLOSSARY_MARKDOWN). Do NOT edit that file from a glossary-recipe card — the new file is a separate DRAFT page, and editing learn-copy.ts risks breaking the live `/us/learn/glossary` route. If the operator later wants the new terms to appear on the live glossary, that is a follow-up card with its own AR pass.
- **A check that is a status-only call.** `check_glossary.py --live` GETs every internal link and reports the status, but the scorecard marks a 200 on a SOFT-200 catch-all as a gap (see the umbrella pitfalls). If a future term is added on a category that returns 200 text/html for any path, the scorecard stays green. Always also assert the response Content-Type is `text/html` (or `application/ld+json` for the JSON-LD), not a 200 that is a 404 page.
- **A word-count regression after one edit.** The 30-80 word band is tight; adding a single sentence can push a term to 85. Re-run `check_glossary.py` after every edit, and let the script print the new count. A hand claim of "still in band" is not evidence; a `print(len(definition.split()))` line is.
- **A UNKNOWN that is a real answer on a different page.** When a term is marked UNKNOWN, re-grep the live product/category once before writing. "Nano-emulsion" may be UNKNOWN on the storefront while "<ingredient>-derived" is not, because one <brand> page literally says it in the product name. The grep is part of the build, not a post-hoc check.

## Verification (paste in PR body)

- `python3 check_glossary.py` -> ALL PASS. Required checks: JSON-LD parses, type is `DefinedTermSet`, exactly 30 `DefinedTerm` nodes, unique names, 30-80 word definitions, md/jsonld parity, every term's `url` is on the storefront host, no term's name collides with a published-glossary heading, claim-word regex 0 hits in md and jsonld, no zero-sugar wording, "21+" present.
- `python3 check_glossary.py --live` -> all N internal links return 200.
- `git rev-parse HEAD` and `git rev-parse refs/remotes/origin/main` equal, OR the diff is a one-commit lead the build card body names.
- The PR body quotes the per-term word count and the dedupe list verbatim. A future reader must be able to re-derive the count from the file without re-running the build.

## One-line summary (paste in handoff)

> "30 buyer terms at 30-80 words each, one `DefinedTermSet` JSON-LD with 30 `DefinedTerm` nodes (each `url` pointing at a live product or category on <store>.example), md/jsonld parity, dedupe list of N earlier FAQ/glossary/per-product drafts, claim-word regex 0 hits in md and jsonld, draft PR #N open at <sha>, all internal links return 200, build skipped: docs-only diff, Do not merge. Draft only."


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `intro`: Read `../seo-autobot-content/references/intro.md` (skill `seo-autobot-content`).
