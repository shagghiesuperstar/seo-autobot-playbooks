# Advertising a published `/.well-known/*` discovery file (Next.js App Router)

Use when a discovery file already returns 200 but no surface points at it ("advertisement gap",
as opposed to a missing file). Proven on <org>/<store>-store for `<store>.example`
(`apps/storefront`, base `main`) and `<store>.example` (`apps/<b2b-app>`, base
`release/<store>`). The registered relation is `api-catalog` and the live resource is `/.well-known/api-catalog` (RFC 9727 linkset). `rel="ai-catalog"`, `/.well-known/ai-catalog.json`, and `/api/catalog` are not that resource — `curl` the href first; a non-200 means publish the file, never advertise a 404.

## Rule 0 — check whether the file exists before you advertise it
`curl -sD - -o /dev/null https://<host>/.well-known/<file>` and grep the repo for the route.
`<store>.example/.well-known/ai-catalog.json` answered **404** and
`<org>/<store>-store` had no such route: advertising it would point agents at a 404. A missing
file is a different card (author the catalog), never a header you add "to be consistent".

## The one surface that survives Next
Next writes font/CSS preloads as one `Link` response header with `set`, after middleware. Measured on the same route: middleware `append` yields preloads 0 and the extra entry 1; `next.config` `headers()` `Link` yields preloads 7 and the extra entry 0. No ordering yields both. Do not add a discovery `Link` header.

The advertisement is one HTML tag in the root document head:
`<link rel="<rel>" href="/.well-known/<file>">`
The Metadata API cannot emit non-standard `rel`s, so a manual `<head>` is required (same reason the `llms.txt` / `mcp.json` agent links live there). A relative href is enough; an absolute one must come from `publicOrigin(NEXT_PUBLIC_BASE_URL)`, never a hardcoded apex.

If a page already emits that tag, move it into the root head. The diff must delete the old copy. A second tag fails the exactly-once gate. Root layout covers document routes only: served HTML from `next build && next start` must show the tag once on `/`, the region home, and a product page, and zero times on admin, api, static, and `_next`. The preload `Link` count must be byte-identical to before.

Keep path + rel + href in one module the layout imports, and a test that the layout calls that module, so a later page cannot grow a second copy.

## Route matching (only if a non-Next host still emits HTTP `Link`): exact, never one-segment-wildcard
On Next.js, skip this section — do not add a discovery `Link` header. The no-leak rule still applies to the head tag: it belongs in the root layout, not in a `/:countryCode` wildcard.
Home is two sources, not a pattern family: `"/"` (bare host; middleware 301/307s it to the region)
and `"/:countryCode(us)"` (the localized home). A bare `"/:countryCode"` also matches `/cart`,
`/store`, `/apply`, `/dk` — gated or non-home paths — and fails the "no leak onto gated paths"
gate. Assert the negative list in a unit test (gated paths AND bare one-segment legacy paths).

## Traps that cost time
0. **One PR per (repo, base) pair — not one PR per site.** A site can ship from two bases in one
   repo (storefront `main` + b2b `release/<store>`). A card naming three hosts is one card per base
   branch, each branched from `origin/<base>` (not from the previous PR's branch), each with its own
   draft PR. Why: a single PR cannot target two base branches, and stacking one branch on another
   makes the second PR's diff include the first PR's changes, so the reviewer cannot tell which
   surface is actually being advertised.
1. **Do not add a discovery `Link` header to coexist with preloads.** Next `set`s the preload
   header after middleware, so an append replaces the preloads and a `headers()` `Link` never
   appears beside them. Assert the HTML tag and that every preload entry still survives. A probe
   that requires the discovery relation on the HTTP `Link` header is testing a path that cannot
   pass without a preload regression.
2. **`next.config.js` may run production-only gates that call the backend.** `apps/<b2b-app>`
   runs `wholesale-key-binding-gate.cjs` on every production build (`NODE_ENV=production` is forced
   by `next build`), so a backend-less worktree cannot build. Stand up a localhost stub for the one
   endpoint the gate hits (`GET <gate-endpoint>` → `{ ok: true }`) and say so in the
   PR body. Never point it at a real backend.
3. **Missing workspace dep ≠ your bug.** `npm ci` at the repo root can leave an app-level dep
   uninstalled (`rehype-sanitize` in `apps/<b2b-app>`). Install it with
   `npm install <dep>@<range> --workspace apps/<app> --no-save` so `package.json` / lockfile stay
   clean, then re-check `git status` before committing.
4. **Build output dirties tracked files**: `next-env.d.ts` (dev vs build type paths) and
   `src/lib/util/deploy-stamp.generated.ts`. `git checkout --` them before committing or the PR
   carries noise.
5. **A sibling card may be editing the same `headers()` array.** `gh pr list --state all` and grep
   the open diffs first. Two additive `Link` relations on the same source is fine semantically; if
   they collide it is only textual, in the header-object declaration block — say that in both PR
   bodies instead of stacking branches the card told you to base on `origin/<base>`.
6. **Repo drift tests scan `src/` for brand literals.** Keep `"<brand>.com"` out of new files under
   `src/` (comments included) and put the literal only in `next.config.js`, or the allow-list test
   gains an entry.
7. **Never static-import `next/dist/compiled/*` from a `.ts` test.** Those are Next internals with no
   declaration file: `import { match } from "next/dist/compiled/path-to-regexp"` is a `TS7016` the
   moment the file is under `tsc`. It costs exactly one new error, which is enough to fail any
   typecheck ratchet (`+1  src/lib/ai-catalog-link.test.ts: TS7016 ... 76 tsc errors (baseline 75)`).
   Load the same module dynamically with an explicit type instead — matcher semantics unchanged, zero
   new errors:
   ```ts
   import { createRequire } from "node:module";
   const require = createRequire(import.meta.url);
   const { match } = require("next/dist/compiled/path-to-regexp") as {
     match: (source: string, opts?: { decode?: (v: string) => string }) =>
       false | Record<string, unknown>;
   };
   ```
   Prefer this over `@ts-expect-error` (silences whatever comes next) and over `any` (loses the
   return shape the assertions need). Prove the fix by measuring BOTH sides — temporarily restore the
   import, count the errors, restore the fix, count again (75 → 76 → 75; 38 → 39 → 38) — and say which
   number is the base baseline.
8. **A new test file that no workflow runs is not a gate.** Before claiming tests pass, run
   `gh pr checks <n>` and, if it reports nothing, diff the workflow `paths:` filters against
   `git diff --name-only origin/<base>...HEAD`. Both storefronts' gates are NARROW: on `main`,
   `storefront-layout-checks` watches only `src/modules/layout|home|store`, `src/lib/data`,
   `src/lib/state-gate`, and `storefront-transfer-checks` only the order pages — so an advertisement
   change touching `next.config.js` + `src/app/layout.tsx` + `src/lib/ai-catalog-link*` triggers
   **nothing**. Fix it by adding those exact paths to the existing workflow's trigger plus one named
   step running that test, never by widening to `src/**` (that turns every unrelated PR into a
   ratchet run) and never by adding a deployment-shaped workflow. Verify the gate exists by reading
   the run's own step lines on the new head, not by trusting a green badge count.
9. **Assert the origin the build is configured to emit, not the apex.** A test that hardcodes
   `https://<store>.example` passes in a bare env (variable unset) while the deployed build sends
   `https://<store>.example` — it describes nothing real. Derive the expectation from the same
   normalizer production uses (`publicOrigin(process.env.NEXT_PUBLIC_BASE_URL)`), assert the generated
   rules agree with it, and add negative assertions (`no .<store>.example`, no `localhost`/`127.0.0.1`)
   so a misconfigured variable fails instead of silently shipping a wrong host. Then run the probe
   against a production build **with the real production value** injected; a localhost-only probe
   cannot show what production will emit, and that gap is what a reviewer flags as unverified.

## Probe, not source assertions
Ship `scripts/probe-<feature>.mjs` and run it against `next build && next start` (never the source
tree). Also require `npm run build` exit 0 on that head — a green CI check skips typecheck paths
the production build runs. Gates that matter: the head tag present exactly once on document
routes, absent on admin/api/static/`_next`, preload `Link` count unchanged, href resolving to the
canonical origin (no preview/localhost host), the advertised URL itself answers 200 with the right
content-type, and gated paths carry nothing. Print PASS/FAIL per gate and `process.exit(1)` on
any failure so it is CI-shaped.

## Merge sequencing note
The head tag is in the document, so it is live only after the storefront build for that SHA
deploys. Verify post-deploy on served HTML (`curl` the page, count the tag), not on the `Link`
response header, for `/`, the region home, and one product page, signed out. Admin, api, and
static routes must still contain zero.

## Report the skipped site as evidence, not as silence
When a card names several hosts and one host's discovery file is missing, the handoff must carry
that host as an explicit SKIPPED row with the 404 status and the repo grep that found no route —
never just omit it. Why: silence reads as "covered", and the next agent will re-derive the same
404, or worse, advertise the missing file for consistency. A skipped site with a receipt is a
closed decision; a skipped site without one is an open gap with no owner.

## Pre-existing test failures need a BASE-vs-HEAD SET DIFF, not two counts
Full-suite failures in a repo that predates the change are common. Do not report "19 failures" as
if they were caused by the PR, and do not report "19 before, 19 after" without naming them: the
honest receipt is the failing-test NAME SET diffed between the untouched base and the branch in
the same worktree, with the reproducing command for any file the change touches (revert the one
changed config file to `origin/<base>` and re-run). Counts alone read as a regression to a
reviewer and hide a real one when one failure is swapped for a different failure.
