# Probing a live MCP endpoint (enumerate, grade, prove)

Recipe for grading an MCP server that is ALREADY LIVE, before writing any card against it. Everything here is read-only except where a step says it mutates server-side session state.

## Transport gotcha that will waste a round-trip if you forget it

`POST https://<host>/mcp` with `content-type: application/json` and
`accept: application/json, text/event-stream` replies as SSE — one `data: {...}` line
per event. Handing the raw body to `json.loads` fails on the prefix and reads as a dead
endpoint. Strip it first:

```python
out = raw
for line in out.splitlines():
    if line.startswith("data:"):
        out = line[5:].strip(); break
d = json.loads(out)
```

Some servers answer with bare JSON. Try the `data:` strip, fall back to raw parse.

## 1. Enumerate every tool and grade its metadata

```python
tl = call("tools/list")
tools = {t["name"]: t for t in tl["result"]["tools"]}
for t in tools.values():
    has_ann = "annotations" in t
    has_out = "outputSchema" in t
    print(t["name"], has_ann, has_out)
```

The `annotations` object is where `readOnlyHint` / `destructiveHint` / `idempotentHint`
live. A server can pass every functional check and still be unrankable purely because
these are absent — metadata completeness and behaviour are separate axes, grade both.

Read `inputSchema` for every tool you intend to CALL before calling it. The schemas are
often stricter than the prose description suggests (array-of-objects `items` vs flat
args), and a schema-validation error is worded like a product error.

Dump the schemas of the mutating tools first — that is the tool inventory you need for
the idempotency probe below.

## 2. Read the schema, then establish a session

Mutating calls generally need a session/session token minted by a setup tool, plus
sometimes a cart token. Call the setup tool, keep both tokens, and thread them through
every subsequent call. Losing the token between calls invalidates the whole probe.

## 3. Prove or disprove idempotency on a mutating tool (the money-path probe)

The single most valuable thing to test on a live agent surface: can a retrying agent
double-charge a customer?

Hold the session CONSTANT, vary exactly ONE variable (the key), and read state back.

```
call 1: mutating tool, session token S, key K          -> note object id + resulting state
call 2: mutating tool, session token S, SAME key K,
        SAME payload, plus the object token from call 1 -> note resulting state
call 3 (CONTROL): session token S, DIFFERENT key K2,
        same payload, same object token                 -> note resulting state
```

Then read state back with the view/list tool and compare.

| call 2 result | call 3 result | verdict |
|---|---|---|
| state UNCHANGED from call 1 | state DOUBLED | idempotency honoured |
| state DOUBLED | state DOUBLED | **no idempotency layer at all; the key is ignored** |
| state DOUBLED | state UNCHANGED | key honoured but mis-scoped to a different object |

The control call is what separates "the key works" from "the key is decoration" — with
only calls 1 and 2 you cannot tell those apart, and they are very different defects.

Mechanism of the common false-negative: a mutating call that omits the session or cart
token makes the server MINT A NEW ONE, so the two calls acted on two different objects
and both "succeeded". Always pass the token from call 1 into call 2. If you see two
different object ids, your probe proved nothing.

## 4. Stop before the irreversible step

Establish and inspect carts, quotes, and reservations freely — they are session-scoped
and expire. Do NOT run the final pay/confirm/charge tool to complete the proof. A
defect proven at the cart stage is the same defect; a proven one that also moved money
is a customer incident plus a reconciliation problem. Say where you stopped and why.

## 5. Check the surfaces a scanner will claim are missing

Cheap, independent, all read-only:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<host>/.well-known/ai-catalog.json
curl -sI https://<host>/ | grep -i '^link:'                 # HTTP Link header
curl -s https://<host>/ | grep -oE '<link[^>]*(llms|ai-catalog|mcp)[^>]*>'
curl -s https://<host>/ | grep -oE 'href="[^"]*(llms|mcp|grok)[^"]*"'
for p in /.well-known/oauth-protected-resource /.well-known/oauth-protected-resource/mcp \
         /.well-known/oauth-authorization-server; do
  curl -s -o /dev/null -w "$p %{http_code}\n" "https://<host>$p"
done
```

For "is this fact visible to a human" questions (price, stock, SKU, ship-to, COA),
strip tags and count occurrences in VISIBLE text only — JSON-LD hits prove nothing about
what a shopper reads, and a count of zero against visible text with a hit in the
structured data is precisely the finding:

```python
txt = re.sub(r'<(script|style).*?</\1>', '', html_src, flags=re.S|re.I)
txt = re.sub(r'<[^>]+>', ' ', txt)
txt = re.sub(r'\s+', ' ', html.unescape(txt))
for kw in ['In stock', 'Out of stock', 'SKU', 'Certificate of Analysis', 'Ships to']:
    print(kw, len(re.findall(re.escape(kw), txt, re.I)))
```

Get a REAL product handle from the server's own search/list tool before probing a product
page. Guessing a URL slug tests nothing.

## 6. Registry presence

```bash
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=<name>"
```

An empty body is "not registered". Do not read an unreachable registry as "registered"
or as "the registry is down" without noting which — timeouts and empty results are
different answers.
