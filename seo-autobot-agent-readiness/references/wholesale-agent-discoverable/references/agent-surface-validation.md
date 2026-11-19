# Agent-surface validation — sitemap ↔ feed parity, stamp accuracy, JSON-LD audit

The wholesale-agent-discoverable doctrine keeps the human gate closed and opens the agent layer. This file is the per-surface validation recipe: prove the machine layer agrees with itself and with the human-visible source of truth, on every Production retest and every release.

Run all probes after any change to `apps/storefront` or `apps/<b2b-app>` agent files, before claiming DONE. A green Vitest build is not proof of a live surface.

## 1. Sitemap product handles MUST equal feed product handles

The product sitemap and the public product feed are two views of the same catalog. When the handle sets drift, the agent layer advertises URLs it does not return (404) or omits URLs it sells.

```bash
SITEMAP=$(curl -fsS https://<host>/product-sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed -E 's#.*/products/(.+)</loc>#\1#')
FEED=$(curl -fsS https://<host>/feeds/products.json | jq -r '.products[].handle // .products[].handles[]' 2>/dev/null)
```

Pass criteria:
- `comm -23 <(echo "$SITEMAP" | sort -u) <(echo "$FEED" | sort -u)` is EMPTY (every sitemap handle exists in the feed).
- `comm -13 <(echo "$SITEMAP" | sort -u) <(echo "$FEED" | sort -u)` is the set of feed-only handles (acceptable; the feed may be larger than the sitemap).
- Each sitemap handle returns HTTP 200 via `for h in $SITEMAP; do curl -o /dev/null -fsS -w "%{http_code} $h\n" "https://<host>/products/$h"; done`. Any 404 is a defect; drop that handle.

## 2. Sitemap MUST NOT list URLs that robots.txt disallows

When `robots.txt` allows only `/llms.txt`, `/llms-full.txt`, `/feeds/`, `/.well-known/`, and `/sitemap.xml` and then `Disallow: /`, every `<loc>` in `sitemap.xml` MUST be on the allow-list. A sitemap loc that robots disallows is a contradicting pair the crawler cannot reconcile.

```bash
ALLOW=$(curl -fsS https://<host>/robots.txt | awk '/^Allow:/ {print $2}' | sort -u)
LOCS=$(curl -fsS https://<host>/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed -E 's#<loc>(.*)</loc>#\1#' | sed -E "s#https://<host>##")
while read -r path; do
  case " $ALLOW " in *" $path "*) ;; *) echo "BLOCKED: $path";; esac
done <<< "$LOCS"
```

Pass criteria: no `BLOCKED:` lines. Wholesale about/careers pages stay off the sitemap because robots disallows them — not because they fail a separate human list.

## 3. llms.txt / llms-full.txt MUST carry the running build, not a frozen stamp

When the storefront uses a generated `deploy-stamp.generated.ts` for its build timestamp, llms.txt must NOT interpolate that stamp — it is the commit that first introduced the file, not the running Cloud build. Read the BACKEND `/version` (source `env:MEDUSA_CLOUD_GIT_COMMIT_SHA`) for the live commit, and use a request-time ISO timestamp in llms files instead.

```bash
LIVE=$(curl -fsS https://<backend>.app/version | jq -r .commit_sha)
curl -fsS https://<host>/llms.txt | grep -i 'build timestamp' || echo "no build timestamp line — OK"
```

Pass criteria: the running backend SHA matches what the operator's on-disk evidence records (e.g. release tag, deploy marker commit). The llms file either omits the field, or prints a request-time stamp.

## 4. JSON-LD on signed-out PDPs MUST match the page's own facts

A signed-out product page may already print "Out of stock" without exposing a price. JSON-LD on that page MUST:
- Include `@type: Product`, `sku`, `offers.availability` (from the same stock signal the page renders).
- Copy `offers.price` only if the same price is on the anonymous page — never from a hidden source.
- Omit the literal string `[BRAND]` (a placeholder). If there is no real brand string, omit `brand` entirely; do not patch the visible placeholder as part of this fix.

```bash
curl -fsS https://<host>/us/products/<handle> \
  | grep -oE '<script type="application/ld\+json">[^<]*</script>' \
  | jq -R 'fromjson? | .[] | select(.["@type"]=="Product") | {sku, availability: .offers.availability, price: .offers.price, brand: .brand}'
```

Pass criteria: `availability` matches the page's visible stock signal; `price` is either absent or matches a value present in the same HTML response; `brand` is not the literal string `[BRAND]`.

## 5. Feed images MUST be catalog images, not hero/decorative stills

A research-catalog feed with empty `images: []` is acceptable. A feed that fills images from `/<hero-art>/` or other decorative folders is misusing non-catalog assets as product images and breaks every agent's product lookup.

```bash
curl -fsS https://<host>/feeds/catalog.json \
  | jq '.products[] | select(.images | length > 0) | .images[] | select(test("/<hero-art>/|/stills/"))'
```

Pass criteria: no rows. If a product has no catalog image, leave `images` empty.

## 6. Why this validation matters

- The wholesale doctrine says "same catalog as a logged-in trade buyer, not more." A sitemap with handles the feed does not serve is advertising a catalog that doesn't exist from the agent's perspective.
- A sitemap with disallowed URLs makes the human-gate story unclear to crawlers that read robots.
- A llms.txt with a stale frozen stamp dates the discovery file's claims by weeks. Agents who trust the timestamp will skip the merchant.
- JSON-LD with a price or brand string that the anonymous page does not show is cloaking-by-data, not cloaking-by-route.

Run all six probes after every agent-layer PR. A green `vitest` does not satisfy this file — the probe is a live `curl` against the host, with HTTP 200 expected.
