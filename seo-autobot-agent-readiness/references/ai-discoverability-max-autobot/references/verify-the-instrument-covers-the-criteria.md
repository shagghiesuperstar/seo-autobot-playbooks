# The discovery instrument must test the routes you claim (2026-11-05)
APPROVE was wrong. The acceptance criterion named `/us`, `/us/store`, and a product page, and
`apps/<b2b-app>/scripts/api-catalog-probe.mjs` sampled nine routes (`/us`, `/us/vendors`,
`/us/about`, `/us/faq`, `/us/brands/juul`, `/us/grok`, `/grok`, `/us/coa`, `/us/contact`, plus a
404 shell) that included NEITHER `/us/store` NOR any product page. The probe could print
`RESULT PASS` with the criterion that mattered most untested.

## Rules

1. **Enumerate the sample, line-cite it, tick each named route.** Any discovery probe whose
   acceptance criteria name specific paths must list them explicitly. If a named path is missing
   from the sample and a silent skip is possible, the instrument is REQUEST_CHANGES even when
   the product code is perfect.
2. **A probe that can PASS by not running is a defect.** If it cannot resolve a required sample
   (e.g. no product handle from the feed), it must FAIL with a distinct message, never skip
   quietly.
3. **Discover product handles at runtime, never hardcode.** Read the live feed/store API, take a
   real handle, build `/<countryCode>/products/<handle>`.
4. **Say what is not covered, in the output.** The PASS line should name the sample and state
   that routes outside it and non-root-layout shells (`/foo.php` global-error) are untested.
   An honest partial gate beats a lying total one.
5. **Separate product from instrument, and review both.** A runtime change can be approved and
   still be unreleasable because the gate that proves it measures something else.
6. **Never grade a redirect's destination as the requested page.** Second generation of the same
   defect (PR #<pr>, `<sha>`): the probe fetched `/us/store`, followed a **307 to
   `/us/account`**, and printed `RESULT PASS` on a 94783-byte body byte-identical to the account
   door. Requests must default to manual redirects; a final path that differs from the requested
   path is a FAIL unless the hop is listed in an explicit `ALLOWED_REDIRECTS` map, in which case
   assert the status AND the `Location`, and print it as `REDIRECT (expected, tag NOT asserted)`.
   Anonymous auth-gated routes (`/us/store`) belong in that map with the doc saying they carry no
   tag for anonymous visitors — never silently graded.
