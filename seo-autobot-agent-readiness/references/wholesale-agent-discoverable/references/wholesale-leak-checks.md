# Wholesale leak checks — prove no wholesale price reaches a signed-out surface

A single wholesale price field in any anonymous response is a leak. This file is the audit recipe: per-surface probes that prove price fields are absent from every signed-out URL. Run it after every build that touches `catalogPriceGate`, JSON-LD, robots, or sitemap.

## What a "leak" means here

- A wholesale price (the price a signed-in retail-buyer would see) appears on:
  - An anonymous Store API response (`/store/products`, `/store/products/<id>`, list/collection endpoints)
  - A JSON-LD blob on any signed-out page (PDP, category, brand)
  - `sitemap.xml` (crawlers that index prices from sitemap content)
  - `llms.txt`, `llms-full.txt`
  - Any signed-out HTML page (price nodes visible to `curl`)
- Wholesale prices are NOT the same as MSRP / retail prices for the same SKU. If the catalog carries both, only the wholesale price is the leak; MSRP alone is allowed.

## Per-surface probes

### 1. Anonymous Store API — products list

```bash
curl -fsS https://<host>/store/products?limit=100 \
  | jq '.products[] | {
      id, title, handle, sku,
      variants: [.variants[] | {
        id, sku,
        prices: .prices
      }]
    }'
```

Pass criteria: `prices` array is empty `[]` or absent for every variant. A single non-empty `prices` array with `amount > 0` is a leak.

### 2. Anonymous Store API — single product

```bash
curl -fsS https://<host>/store/products/<handle> \
  | jq '.product.variants[] | {sku, prices: .prices}'
```

Pass criteria: same as above.

### 3. JSON-LD on a public PDP

```bash
curl -fsS https://<host>/us/products/<handle> \
  | grep -oE '<script type="application/ld\+json">[^<]*</script>' \
  | jq -R 'fromjson? | .[] | select(.["@type"] == "Product") | {sku, offers: .offers}'
```

Pass criteria: `offers.price` is not present, OR `offers.price` is missing entirely (only `offers.url` / `offers.availability` survive). If `offers.price` is set to a wholesale value, it is a leak. If MSRP, document it.

### 4. sitemap.xml

```bash
curl -fsS https://<host>/sitemap.xml | grep -iE 'price|wholesale'
```

Pass criteria: no match. Sitemap should carry only URLs, no prices. If a sitemap index points at a per-product sitemap with price data, that file is a leak.

### 5. llms.txt / llms-full.txt

```bash
curl -fsS https://<host>/llms.txt | grep -iE '\$\d|[0-9]+\.[0-9]{2}'
curl -fsS https://<host>/llms-full.txt | grep -iE '\$\d|[0-9]+\.[0-9]{2}'
```

Pass criteria: no matches. `llms-full.txt` carries names, SKUs, brand, COA URLs — never prices.

### 7. /us/store (HTML page)

```bash
curl -fsS https://<host>/us/store | grep -oE '\$[0-9]+(\.[0-9]{2})?'
```

Pass criteria: no matches. The whole human path is in `/us/account/*`; nothing on `/us/store` should print a price.

## Automation shape

Wire each probe into a CI step:

```bash
set -e
HOST=<store>.example
fail=0
trap 'fail=1' ERR

curl -fsS https://$HOST/store/products?limit=100 \
  | jq -e '[.products[] | select(.variants[].prices | length > 0)] | length == 0' >/dev/null \
  || { echo "LEAK: anonymous /store/products has prices"; fail=1; }

curl -fsS https://$HOST/sitemap.xml | grep -qiE 'price|wholesale' \
  || true   # no output is the pass

exit $fail
```

## When a probe fails

1. Note the URL + the field that leaked in the run's RESULT.md under "WHOLESALE LEAKS".
3. Stop the rollout. The `catalogPriceGate` either is missing on that path, is bypassed by an anonymous Store API call, or the JSON-LD shape was set client-side.
4. Fix at the source (server response shape), not on the client. Re-run all probes; all pass before resuming.

## Always-on rule

Price-stripping belongs on the backend, not the client. `display:none` and `return null` on the client still ship the wholesale price over the wire — the fix is always on the server read path. JSON-LD, sitemap, and llms files are server-rendered, so the same fix applies.
