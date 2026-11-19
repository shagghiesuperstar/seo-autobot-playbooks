# Markdown negotiation must not gate harder than HTML (overlay parity)

## The rule
A markdown twin request (`Accept: text/markdown`, or a `.md` path) must get the SAME
access verdict as the equivalent HTML request. If a signed-out browser GET on a page
returns 200 (because the age/research gate is drawn over the page as an overlay), the
markdown twin of that page must also return 200 with `text/markdown` — not a 307 to the
gate page.

Mechanism: a 307 to the gate for the markdown variant pushes the agent to the gate HTML
instead of the content it asked for, so the whole agent-read layer is unreachable while
the human surface works. The overlay pages are public by design; the twin prints the same
research-use / age notice as its first line, which is how the twin stays honest.

## Where the bug lives
Middleware, the markdown-twin branch. Typical shape: a gate verdict of `overlay` is
turned into a redirect to the gate page before the twin rewrite runs. The fix is to drop
that redirect so the request falls through to the existing rewrite to the twin route.

## What must NOT change
- The 401 for POST / server-action requests to a twin (write path stays unauthenticated).
- Every walled path that has NO overlay (cart, account, checkout, order, apply): those
  still 307 to the gate, in both HTML and markdown.
- The gate notice wording on the twin; it stays the first line.

## Verification recipe (this is the gate)
1. `pnpm build` with the repo's committed PUBLIC env template values only (placeholder
   publishable key + localhost backend URL). Never a live key, never a prod URL.
2. Serve the production build locally (`next start` on a scratch port) and run ONE
   probe script against it and against prod, so the before/after rows come from the same
   code path.
3. The probe must assert, per URL:
   - markdown Accept -> 200 + `content-type: text/markdown` + body starts with the gate
     notice line
   - browser Accept -> 200 + `text/html` (unchanged)
   - `/llms.txt` and a non-twin page -> 200 unchanged
   - a walled non-overlay path -> 307 to the gate WITH and WITHOUT the markdown Accept
   - every markdown link is absolute and answers 200
4. Prove the regression test bites: run the new unit test against the BASE source and
   show it RED, then against the head and show it GREEN.
5. Scope any pre-existing suite failure by running the same suite on base; report both
   counts side by side so a baseline failure is not read as a regression.

## Pitfalls
- **Do not build the probe to trust the local origin.** The twin's canonical links come
  from the request origin (`NEXT_PUBLIC_BASE_URL`), so a local run emits local absolute
  links. Rewrite same-site links to the probe BASE before resolving them, and say so.
- **A 200 with the wrong content-type is not a pass.** Always check
  `content-type: text/markdown`; a catch-all HTML 200 is the SOFT-200 failure mode.
- **Never widen the gate to make the agent happy.** The fix belongs in the twin branch,
  never in the gate decision, so human HTML traffic and the walled paths are untouched.
- **Wildcards never select markdown.** Only an explicit `text/markdown` or
  `text/x-markdown` that outranks `text/html` switches the representation; browsers send
  `text/html` and curl sends `*/*`, so neither is switched.
