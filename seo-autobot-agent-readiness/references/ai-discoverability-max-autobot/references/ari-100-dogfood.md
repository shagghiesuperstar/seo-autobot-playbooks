# Dogfood — measured, one site at a time

Run with the ARI-100 engine in this repo. Every number below came from `node engine/bench.mjs <site>`, which scans the live host, then scans the same host with the generated readiness kit applied through a local TLS preview proxy. Nothing here is projected from a checklist by hand.

## Method (and why it is trustworthy)

1. `node engine/kit.mjs sites/<site>.json out/kit-<host>` generates the static readiness kit from one config: robots.txt with named AI groups and a Content-Signal line, llms.txt, llms-full.txt, AGENTS.md, auth.md, a sitemap index with segmented children, the full `.well-known` set, an OpenAPI description, a head snippet and the response headers to add.
2. `node engine/preview.mjs sites/<site>.json <port>` proxies the live site and overlays that kit: kit files win at their own paths, HTML gets the head snippet injected, markdown is served on `Accept: text/markdown`, a `/mcp` JSON-RPC endpoint answers `initialize` and `tools/list`, and a dev footer links the machine surfaces. It serves over HTTPS (`TLS=1`) with gzip, because an `http://` harness can never pass the https and compression checks and would silently depress every projection.
3. The same scanner scores both. Baseline is the untouched live site; projected is the site with kit + middleware.

**Measure one site per process, with a gap between runs.** Each scan makes 32 live crawler probes; running six sites back to back rate-limits the target and reads 3-7 points low. That variance is the instrument being honest about the network, and it is the single biggest threat to a "our score went up" claim — always rescan the same host, alone, before quoting a delta.

## Results (fill in per run)

| site | baseline | with kit + middleware | grade | level |
|---|---|---|---|---|
| <site-a>.example | <n> | **<n>** | <grade> | <level> |

Baselines move by several points between runs on the same day for the same reason. Treat the baseline as an interval, and the projected figure as the one you re-measure.

## What is left, per site — this is the work list

For each site, list the remaining fix ids with their recoverable points, then say what kind of work each is:

- **Template-level** (accessible names on icon buttons, alt text, a footer link, an Organization entity, a public API surface).
- **Deliberately gated commerce** (a trade-only store that hides prices and cart signed-out fails `add-to-cart` / `variant-controls` / `checkout-permalink` by design). That is a one-line policy decision for the owner, not a build.
- **Thin product prose** (`text-ratio`): fixed by copy, not code.
- **Cheap infra** (`real-404`, `ttfb`, `ucp-profile`): a catch-all 404 route, edge caching, and the UCP file the kit already emits once `commerce: true` is set in the config.
- **Client-rendered sites** (`ssr-home`, `ssr-inner`, `no-js-only`): if the text is not in the initial HTML, no amount of files fixes it. These need prerendering (SSG or SSR) before any other work is worth doing.

## Honest read

- Quote only measured numbers, per site, from one quiet run each.
- The remaining gap after the kit is usually not discovery files. It is (a) prerendering on SPAs, (b) accessible names and alt text on templates, (c) commerce controls on gated stores, which is an owner policy call.
- A service you control end to end can score 100/100 (`node engine/cli.mjs http://127.0.0.1:8787`), which proves the ceiling is reachable — a site that owns its template can pass every check.
- Never claim "all sites at 95+" unless every row above says so.

## Reproduce

```bash
cd <your-checkout>/agentkit
for s in site-a site-b site-c site-d site-e site-f; do
  NODE_TLS_REJECT_UNAUTHORIZED=0 node engine/bench.mjs $s   # merges into out/bench.json
  sleep 8
done
```

`out/bench.json` holds the last run per site, with the remaining fix ids and their recoverable points.
