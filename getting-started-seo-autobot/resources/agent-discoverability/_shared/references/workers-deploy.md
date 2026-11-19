# Serving the ARI-100 scanner on Cloudflare Workers

The scanner's web service is a plain `node:http` app (`web/server.mjs`, zero npm
dependencies). It runs unchanged on Workers behind a ~100-line adapter
(`worker.mjs`), which is worth it because a tunnel is not a host: a
`trycloudflare` quick tunnel dies with the process, and a plugin whose default
endpoint is dead fails on a judge's first tool call.

## The four bugs the adapter hit, in order

| symptom | cause | fix |
|---|---|---|
| deploy rejects with `Invalid URL string` | a module reads a JSON file via `readFileSync(new URL(..., import.meta.url))` — no filesystem in a Worker | bundle it: `import DATA from './x.json' with { type: 'json' }` |
| JSON-RPC `Parse error` on POST | the app reads bodies with `for await (const c of req)`, and the shim only implemented `.on()` | give the shim `async *[Symbol.asyncIterator]()` yielding the buffered body |
| response body is binary garbage | the app gzips its own responses; the shim decoded chunks to UTF-8 | keep chunks as Buffers, and `DecompressionStream('gzip')` + delete `content-encoding` before returning |
| self-scan drops to **L0** with sitemap/canonical checks failing | `host` is hop-by-hop and got filtered, but the app builds absolute URLs from it | pass `headers.host = url.host` through explicitly |

## Routing and DNS gotchas

- **Custom domains disable `*.workers.dev`.** Adding `routes: [{pattern, custom_domain: true}]` silently turns the workers.dev hostname off, so any fallback endpoint on it 404s. Set `"workers_dev": true` to keep both.
- **`assets` binding + a fetch handler coexist**: matching files are served by the edge, everything else falls through to the Worker. Assets answered a `Range` request with `200` and no `Accept-Ranges`, so players that seek (Safari inline, embeds) restart — move large media to R2 if that matters.
- **macOS caches the NXDOMAIN** of a zone created minutes ago: `dig +short @1.1.1.1 <host>` answers while python/curl fail with `gaierror`/exit 7. Verify the edge with `curl --resolve host:443:<ip>`; flushing needs sudo.

## Client-side lesson that generalises

An MCP client that returns `[]` on a network error instead of raising will make a
multi-candidate endpoint probe **pin an unreachable host** and never fall through —
every later call fails with the resolver having reported success. Require a
non-empty `list_tools()` before accepting a candidate.
