# A client-rendered SPA on a Worker: getting to agent-ready

For a Vite/React (or Vue/Svelte) single-page app served by a Cloudflare Worker, where every route returns one
HTML shell and the mount node fills in client-side. Measured effect on one build: 65/100 grade C -> 88/100
grade B (L4), Render & Delivery 40% -> 100%, Structure 82% -> 100%, a11y 91 -> 92+.

Do the work in this order. Discovery files are worthless while the page is empty.

## 1. Prerender into the mount node from one switch

Keep a `worker/prerender.ts` exporting `pageMeta(path, query) -> { title, description, html } | null` and
`markdownFor(path)`. One `switch` over the known routes, plain template strings, the app's own class names.

In the Worker's fetch handler, before the asset fallback:

```ts
const clean = path.replace(/\/+$/, "") || "/";
if ((req.method === "GET" || req.method === "HEAD") && KNOWN_PATHS.has(clean)) {
  const page = pageMeta(clean, url.searchParams.get("q") || "");
  if (page) return renderHtml(req, env, page, base);   // HEAD -> null body, same headers
}
```

`renderHtml` fetches `/index.html` from `env.ASSETS`, then:

- replaces `<title>…</title>` and the `<meta name="description">` tag,
- replaces `<div id="root"></div>` with `<div id="root">${page.html}</div>`,
- returns it with the discovery headers (§4) and page cache-control (§5).

Rules that keep this from biting:

- The prerendered body must be well-formed and self-sufficient (header, `<main>`, footer, real `<a href>`s).
- `createRoot(el).render()` clears prerendered children — safe. `hydrateRoot` does not tolerate a string
  prerender whose markup differs from what React would emit — do not mix the two.
- Any route the client app also renders stays in `KNOWN_PATHS`, or the 404 branch in §2 eats it.
- A route that is complete as served HTML (a broker/product search over a native `GET` form, an about page)
  can skip the client mount entirely: `if (!SERVER_ONLY.includes(path)) createRoot(...)`.

## 2. Real 404s

`not_found_handling: "single-page-application"` returns the shell at **200** for every unknown path, so
`env.ASSETS.fetch()` never reports 404 for a page miss. Detect it:

```ts
const asset = await env.ASSETS.fetch(req);
if (asset.status !== 404) {
  const type = asset.headers.get("content-type") || "";
  if (type.includes("text/html") && !KNOWN_PATHS.has(clean)) return notFoundPage(env, req, base);
  return asset;
}
```

`notFoundPage` returns the same shell with a short "not found" body and `status: 404`.

## 3. Markdown twins and negotiation

- `if (path.endsWith(".md")) return text(markdownFor(path.slice(0, -3), base), "text/markdown")` before the
  page branch — `/pricing.md`, `/about.md`.
- `Accept: text/markdown` returns markdown for the same path, with `vary: Accept`.
- Both must exist for the **home page** too; a `markdownFor("/")` returning `null` is the usual reason a
  negotiation check still fails after the `.md` twins work.

## 4. Head and headers on every HTML response

- `<link rel="canonical">`, `og:*`, `twitter:card=summary_large_image`, and a real 1200x630 `og:image`
  PNG that answers `200 image/png` live. A cropped hero reads as an unfinished card; a mini board (the actual
  product surface) reads as a product.
- one `<h1>` per document. A `<noscript>` block with its own `<h1>` breaks the one-H1 check.
- Response headers (GET and HEAD):

```ts
link: `<${base}/llms.txt>; rel="alternate"; type="text/plain", <${base}/AGENTS.md>; rel="alternate"; type="text/markdown", <${base}/.well-known/mcp.json>; rel="service-desc"; type="application/json", <${base}/.well-known/openapi.json>; rel="service-desc"; type="application/openapi+json"`,
"content-signal": "search=yes, ai-input=yes, ai-train=no"
```

- robots.txt: the `Content-Signal:` line must be a real directive, not a `#` comment.
- Publish discovery artefacts at every spelling a scanner probes: `/openapi.json` and
  `/.well-known/openapi.json`, `/AGENTS.md` and `/agents.md`, `/.well-known/agent-card.json` and
  `/.well-known/agent.json`.

## 5. Deploy, then prove the deploy

- Serve pages `cache-control: public, max-age=0, must-revalidate`. With `max-age=60`, a fresh `wrangler
  deploy` reads as unshipped for a minute in curl and in the browser, and the next hour goes into chasing a
  change that already landed.
- Bind `version_metadata` in `wrangler.jsonc` (`{ "version_metadata": { "binding": "CF_VERSION_METADATA" } }`)
  and return `env.CF_VERSION_METADATA.id` from `/version`. That id is how you state which build is live.
- After a deploy, verify with a cache-buster before concluding anything:

```sh
curl -s -H 'cache-control: no-cache' "$B/?x=$RANDOM" | grep -c '<the thing you changed>'
curl -s "$B/version?t=$RANDOM"
```

## 5.5 Serving the apex of a real domain (not `*.workers.dev`)

A Worker on `*.workers.dev` needs nothing. A real apex needs one decision, and Cloudflare makes it for you
badly if you let it.

- **A Workers custom domain on an apex provisions `AAAA … 100::` and can provision no `A` at all.** Then
  IPv4 clients (most of them) get `Couldn't connect`, while `curl --resolve <apex>:443:<any CF IP>` returns
  200 — which proves the Worker is bound and the *record* is the only thing missing. Confirm the two paths
  separately before touching anything.
- **A manual `A` is refused while that hostname is a custom domain:** `A DNS record managed by Workers
  already exists on that host` (81062), and re-attaching later fails with `already has externally managed
  DNS records` (100117). Detaching from `wrangler.jsonc` deletes the managed records, so add the `A` **while
  detached**, then re-attach.
- **The combo that works:** a proxied placeholder `A <apex> → 192.0.2.1` (the origin is never contacted)
  plus a Worker **route** instead of a custom domain for that hostname:

```jsonc
"routes": [
  { "pattern": "www.example.com", "custom_domain": true },
  { "pattern": "example.com/*", "zone_name": "example.com" }
]
```

  Keep the `www` custom domain (Cloudflare manages its records and it answers both families) and serve the
  apex over the route.
- **Do not trust your own resolver after adding an `A`.** The earlier NODATA answer is cached for the SOA
  minimum (often 1800s), so `curl` and `socket.getaddrinfo` keep saying `000` while the zone is correct.
  Verify authoritatively — `dig +short @1.1.1.1 <apex> A` and
  `curl -s -o /dev/null -w '%{http_code}' --resolve <apex>:443:<CF IP> https://<apex>/` — and re-check from an
  external fetch (a public reader URL) before reporting either success or failure.
- **Token scope decides which of these you can do at all.** A `Zone:DNS:Edit` API token can create the `A`
  but cannot read the script, touch routes, or set Always-Use-HTTPS; wrangler's OAuth token does routes and
  scripts but not DNS. Expect to need both, and say which one a task is blocked on instead of hand-waving.

## 6. Build and runtime traps on Workers

- **PBKDF2 caps at 100,000 iterations.** `crypto.subtle.deriveBits` with `iterations: 210_000` throws
  `NotSupportedError: Pbkdf2 failed: iteration counts above 100000 are not supported`, and the client sees only
  `error code: 1101`. Use `100_000` and state the real number in `auth.md` rather than a marketing one.
- **`npx wrangler tail --format pretty`** is the fastest way to read the exception behind a 1101: start the
  tail in the background, replay the request, read the log line.
- **D1 before the first deploy:** `npx wrangler d1 migrations apply <db> --remote`. Assert with
  `npx wrangler d1 execute <db> --remote --json --command "SELECT …"` and parse the `results` array — the
  human table output is not greppable.
- **Prove the cron handler, don't assume it.** `npx wrangler dev --test-scheduled`, seed one row that is due,
  then `curl "http://127.0.0.1:8787/__scheduled?cron=23+7+*+*+*"` and read the row back. A deployed trigger
  with an untested handler is a claim.
- **When a foreground-process guard refuses `npx vite build`** as long-lived, run
  `node ./node_modules/vite/bin/vite.js build` — same build, no heuristic trip.
- **A check that mutates state must be idempotent-ish for demos:** clear test accounts with one D1 delete
  across the child tables before handing the app over, so the next human signs into an empty board.

## 7. Verification battery (quote the numbers)

```sh
node scripts/agentkit/cli.mjs https://<host> --json /tmp/ari.json   # before and after
for p in / /pricing /about /search /privacy; do printf '%s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' $B$p)"; done
curl -s -o /dev/null -w '%{http_code}\n' "$B/nope-nope"                       # 404
curl -s -H 'accept: text/markdown' "$B/pricing" | head -3                     # markdown
curl -sD- -o /dev/null "$B/" | grep -iE '^link|^content-signal'               # headers
curl -s "$B/" | python3 -c 'import sys,re;t=re.sub("<[^>]+>"," ",sys.stdin.read());print(len(t.split()))'  # >400 words of no-JS text
```

Then click through the real app in a browser (sign in, add a record, open a dialog, submit) — prerender
injection and the 404 branch are the two changes most likely to break the client app while leaving the
HTML looking correct.
