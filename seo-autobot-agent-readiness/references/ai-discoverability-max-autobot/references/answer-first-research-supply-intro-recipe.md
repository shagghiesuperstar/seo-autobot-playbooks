# Answer-first research-supply category-intro recipe (<store> / <catalog> / research-supply catalogs)

When a task-tracker issue asks for category intros on a research-supply catalog (<store>, <catalog>, or any site whose public surface is class filters behind a research-access gate), the deliverable is answer-first research-supply copy: a 60-90 word intro per class plus 2-3 FAQ pairs, written so an AI answer engine can quote the class summary without the human having to click in. This reference is the recipe; the umbrella SKILL.md still owns the AEO/AIO standard.

## When to use

A task-tracker issue from the <store>-store, <catalog>, or any research-supply lane that asks for "category intros", "class intros", "answer-first research-supply copy", or "drafts only — do not publish". Specifically NOT for: Medusa write lanes, catalog publish, hero/PDP copy, AEO/AIO scan/fix cards (those are full ai-discoverability-max-autobot jobs), or wholesale description batches (wholesale-product-description).

## Output shape (per class)

- **Intro**: 60-90 words, opening with the class name and a countable fact from the live class page. Required sentence shape: "`<Class> is a public class on the <brand> store, listing N of M compounds at <canonical class URL>.`" The intro must name the live count, the canonical URL, and the single-compound + multi-component entries the live class page actually lists. The last sentence is the research-use line ("These materials are supplied for laboratory research use only." for research-supply, the equivalent for <catalog>'s research-only lanes).
- **FAQ pairs**: 2-3 per class. Each pair must cite the live page it answers. For research-supply the default set is: (1) where to read purity / certificate status, (2) shipping facts that the live shipping page states, (3) a per-class swap-in question ONLY when the class has a distinctive fact (e.g. the class' only product with a published storage temperature; the class' only product whose certificate slot is published; never invent a question to fill a slot).
- **Sources line** per class: live class page URL + date, shipping policy URL, certificate index URL, sampled product pages with the cited fact, and the in-repo class membership file (e.g. `apps/storefront/src/lib/catalog-browse.ts`).
- **Header rows per class**: `class_id`, `label`, `public_url`, `live_count`, `live_handles` (semicolon-separated), `intro`, `intro_words`, three `faqN_question` / `faqN_answer` pairs, and `sources` as a single string.

Deliverable files (one docs-only PR, one branch, one commit):

- `docs/marketing/<slug>-category-intros-001/categories.md` — human-readable with one H2 per class.
- `docs/marketing/<slug>-category-intros-001/categories.csv` — same rows, machine-readable.
- `docs/marketing/<slug>-category-intros-001/` always opens with a "Dedupe list" section that lists every earlier `docs/marketing/category-intros*/`, `learn-outlines-*/<class>.md`, `blog-batch-*/<class>.md`, `site-faq-001/faq.md`, and `pdp-faq-drafts/` row on main, so a future reader does not refile the same intro.

## Live evidence first (the cardinal rule)

Before any text, fetch the live public class URLs from a signed-out browser session. The recipe's "live" facts are:

- Live public class count from a signed-out GET of `/us/store` and each `/us/store?class=<id>` — quote status code and chip presence in `categories.md` and the PR body. Anything that does not 200 OR is not on the live chip set is out of scope; gated paths under `/us/categories/<handle>` redirect to research-access and are not public, so the in-repo handle list (an in-repo class map) is a different set from the public chip list.
- Shipping policy facts from `/us/shipping` — the flat rate, the free-shipping threshold, the ship-from legal name and address, address rules (e.g. no PO Boxes), and ship days, quoted exactly as the live page shows them.
- Certificate index facts from `/us/coa` and `/us/coa/<handle>` — `Certificate pending` when no certificate is on file; never invent a purity percent.
- Per-class live handle set: the catalog-card ids that actually appear on the live class page. Do not list handles that the in-repo map names but the live page does not.

A fact that lives in the in-repo class map but is not on the live page is the repository going stale; trust the live page.

## Dedupe (do this BEFORE writing)

Run these in the SAME turn as the first read:

1. `mcp__graphify__query_graph` against the repo (project_path = the absolute repo path, see graphify-first) with a question like "category intros marketing docs product classes". If the graph returns an earlier `category-intros*` or `learn-outlines*` path, read it before writing. The earlier draft may be on main and not-merged-as-such; treat it as in-scope content to skip, not as OBE.
2. `search_files` for `docs/marketing/**/category*` and `docs/marketing/learn-outlines-*/19-research__category*` on the worktree; list any matches in the dedupe section of the new `categories.md`.
3. `search_files` for `docs/marketing/site-faq-001/faq.md`, `docs/marketing/storage-handling-001/storage.md`, `docs/marketing/how-we-test-001/how-we-test.md`, and the entire `docs/marketing/pdp-faq-drafts/` directory; list each in the dedupe section. Do not repeat their content in the new draft.

If the graph is unreachable, write `graphify: unreachable (<error>, <iso time>)` in the handoff and continue; never block on it.

## Banned-terms compliance

The repo carries a `banned-terms.txt` in the storefront's compliance directory (e.g. `apps/storefront/src/lib/compliance/banned-terms.txt`). Build ONE combined regex file in the build script:

```
grep -v '^#' apps/storefront/src/lib/compliance/banned-terms.txt | grep -v '^$' > /tmp/banned.rx
# add the issue's extra forbidden wording, one pattern per line:
printf '%s\n' '\beffects?\b' '\bprotocols?\b' '\bdosage\b' '\bhuman\b' '\bconsumption\b' >> /tmp/banned.rx
rg -n -i -f /tmp/banned.rx docs/marketing/<slug>-category-intros-001
```

Target: 0 hits. A hit on the research-use line itself (e.g. "research") is not a hit if the pattern is a word match and the word is "research-use". Verify each non-zero exit by reading the matched line and re-writing the intro to use neutral language (e.g. "for laboratory use" instead of "for research participants"). The compliance scan section of `categories.md` must print the final hit count and the date.

## Build script as the gate

Do not write 10 intros in a chat, then ask a review to count words. Encode the word-count gate in the build script:

```
def wc(s): return len(s.split())
if not 60 <= wc(intro) <= 90:
    raise SystemExit("WORD COUNT FAIL: " + class_id)
```

The script also writes the markdown and CSV in the same pass, so the SAME `wc()` call that fails the gate is the function that prints the count next to the intro in the markdown ("Intro words: 65"). When the script is the gate, a word-count regression is a non-zero exit, not a review comment. Re-run after every edit, paste the per-class count into the PR body so the reader sees the actual numbers, not a hand claim.

## Word-count cheat (use sparingly)

If one intro lands at 57 words and the rubric is 60-90, the fix is to add a class-level fact the live page already shows ("The class page shows all four cards side by side" is one cheap line). NEVER stretch by adding a fact that is not on the live page or by removing the research-use line. The research-use line is mandatory for research-supply catalogs; removing it to hit a count is a different defect.

## PR body stamp (docs-only, do not merge)

Every research-supply copy PR body ends with this exact pair, so a future reader does not try to land it as a deploy:

```
## Test plan
- [x] Docs-only paths. No build.
- [ ] Do not merge. Draft only.
- [ ] Confirm the N class URLs still match the live chips before any later publish step.
```

`build skipped: docs-only diff` in the PR body header. The PR is `--draft` (the gh CLI flag, not just a comment). Branch name is `<branch>/<ticket-id>-rev-<slug>-answer-first-research-supply` (matches your task tracker's branch-naming pattern).

## Repo + remote

- Repo: `<org>/<store>-store` (<store>, <catalog>, or whatever the research-supply repo is). NOT `<org>` — those are client repos. Switch with `gh auth switch --user <org>` if needed and verify with `gh auth status` before the push.
- Know each repo's shadow remote name (it is not always `origin`). Always `git rev-parse <shadow> refs/remotes/<remote>/main` before the commit, prove the branch is at the same tip, and pin the build card body to `refs/remotes/<remote>/main` (task-card lifecycle rule: pin the build card to the remote main tip). A worker that builds 50 commits behind main is a routing defect.
- The repo is set up for `git push -u github-backup HEAD:<branch>`; PR with `gh pr create --draft --base main --head <branch> --title "[<ticket-id>] REV: <slug> category intros — answer-first research-supply copy (files only)" --body-file <pr-body>`. Title tag is `[<TICKET-ID>]` so a future reader can grep the issue.

## Common traps

- **A count that does not match the live page.** The live `/us/store?class=<id>` page may show N of M today and N+1 of M after a catalog publish; the in-repo class map may still say N. Trust the live page. A mismatch in the draft is a re-pull + a re-write, not a soft "approximately".
- **A handle listed in the intro that is not on the live class page.** The class page lists catalogue-card ids; the in-repo class map may list Medusa handles. Use the live page's card ids (the "title slugs" the page renders), not the Medusa `handle` field.
- **Re-using an earlier draft's intros because they are "good enough".** Dedupe is for OBE-detection, not for re-use. The earlier draft may have been seeded from a different data snapshot. The recipe requires re-writing from the live page in the same turn as the count check.
- **A multi-component entry that lives in two classes.** "<blend-a>" and "<blend-b>" are blends AND include a class-A compound AND a class-B compound. They appear on multiple class filters. Count the compound under each class, but list the multi-component entry under ONE primary class in the intro (the class whose compound is the namesake), then mention the cross-listing in the FAQ. Counting "<blend-a>" under three classes is correct; describing it three times is drift.
- **The shipped intro contradicts the live policy page.** The agent-readable intro must match the visible shipping policy and certificate index. If the live page says `$<rate>` and the intro says `flat shipping`, fix the intro. Cross-check shipping, COA, and storage facts by curl-ing the live page in the same turn as the draft write, not by memory.
- **Pushing to a wrong-identity branch.** A research-supply copy PR for <store> goes to `<org>/<store>-store`, base `main`. A PR opened against `<org>/<catalog>` is a wrong-repo defect — close it and re-open against the right repo. The branch name and remote must match the surface.

## Verification (paste in PR body)

- `curl -s -o /dev/null -w "%{http_code}\n" https://<host>/us/store` -> 200; per-class `?class=` -> 200; gated `?category=` -> 307 to research-access (this is the out-of-scope signal).
- Per-class live count quoted: must equal the count on the live class page and the sum must equal the store total.
- Banned-terms rg: `HITS 0`. The compliance scan section prints the count and date.
- Intro words per class: 60-90, all inside the band. The build script asserts this at write time; the PR body prints the actual numbers.
- `git rev-parse HEAD` and `git rev-parse refs/remotes/<remote>/main` equal, OR the diff is a one-commit lead the build card body names.

## One-line summary (paste in handoff)

> "10 public classes, 60-90 word answer-first intros, 3 FAQ pairs each, banned-terms rg 0 hits, draft PR #N open at <sha>, dedupe list of N earlier drafts. Build skipped: docs-only diff. Do not merge. Draft only."


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- `intro`: Read `../seo-autobot-content/references/intro.md` (skill `seo-autobot-content`).
