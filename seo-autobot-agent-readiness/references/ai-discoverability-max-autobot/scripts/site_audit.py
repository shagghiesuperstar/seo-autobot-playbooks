#!/usr/bin/env python3
"""Live, read-only AI-discoverability scorecard for an e-commerce site (signed-out GETs only, <=2 req/s).

usage: site_audit.py <base-url> [--out <dir>] [--pdp <path>] [--cat <path>]
Writes <out>/<host>.json + <host>.md. Exit 0 always (it is a measurement, not a gate).
Measures: robots per AI bot, sitemap union (index children), llms files, .well-known, real 404,
home/category/PDP head tags + JSON-LD types + landmarks, browser-vs-GPTBot parity (cloaking/WAF), TTFB.
"""
import json, re, sys, time, urllib.request, urllib.error, urllib.parse, argparse, os
from html.parser import HTMLParser

BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot",
        "Perplexity-User", "Google-Extended", "Googlebot", "Applebot", "Applebot-Extended", "Bingbot", "CCBot",
        "meta-externalagent", "Amazonbot", "DuckAssistBot", "MistralAI-User"]
FEEDS = ["/products.json", "/feeds/products.json", "/feeds/catalog.json", "/rss.xml", "/feed.xml"]
SEC_HEADERS = ["strict-transport-security", "content-security-policy", "referrer-policy", "x-content-type-options"]
UA_BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Safari/605.1.15"
UA_GPT = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot"
WELL_KNOWN = ["/.well-known/security.txt", "/.well-known/mcp.json", "/.well-known/mcp", "/.well-known/agent.json",
              "/.well-known/ai-plugin.json", "/.well-known/llms.txt"]
_last = [0.0]


def get(url, ua=UA_BROWSER, follow=True):
    wait = 0.5 - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    _last[0] = time.time()
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "*/*"})
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect())
    t0 = time.time()
    try:
        r = opener.open(req, timeout=25)
        body = r.read(3_000_000)
        return {"status": r.status, "url": r.geturl(), "ctype": r.headers.get("content-type", ""),
                "body": body.decode("utf-8", "replace"), "ms": int((time.time() - t0) * 1000),
                "location": r.headers.get("location"), "headers": {k.lower(): v for k, v in r.headers.items()}}
    except urllib.error.HTTPError as e:
        b = e.read(200_000).decode("utf-8", "replace") if e.fp else ""
        return {"status": e.code, "url": url, "ctype": e.headers.get("content-type", ""), "body": b,
                "ms": int((time.time() - t0) * 1000), "location": e.headers.get("location")}
    except Exception as e:
        return {"status": 0, "url": url, "ctype": "", "body": "", "ms": int((time.time() - t0) * 1000), "error": str(e)[:200]}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


class Head(HTMLParser):
    def __init__(self):
        super().__init__(); self.d = {"title": "", "meta": {}, "links": [], "ld": [], "h1": 0, "tags": set(), "lang": None,
                                      "img": 0, "img_no_alt": 0, "click_div": 0, "headings": []}
        self._in = None; self._buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs); self.d["tags"].add(tag)
        if tag == "html": self.d["lang"] = a.get("lang")
        if tag == "title": self._in = "title"; self._buf = []
        if tag == "h1": self.d["h1"] += 1
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"): self.d["headings"].append(int(tag[1]))
        if tag == "img":
            self.d["img"] += 1
            if "alt" not in a: self.d["img_no_alt"] += 1
        if tag in ("div", "span") and ("onclick" in a or a.get("role") == "button"): self.d["click_div"] += 1
        if tag == "meta":
            k = a.get("name") or a.get("property")
            if k and k.lower() not in self.d["meta"]: self.d["meta"][k.lower()] = a.get("content", "")
        if tag == "link" and a.get("rel"): self.d["links"].append((a.get("rel"), a.get("href"), a.get("hreflang"), (a.get("type") or "").lower()))
        if tag == "script" and (a.get("type") or "").lower() == "application/ld+json": self._in = "ld"; self._buf = []

    def handle_data(self, data):
        if self._in: self._buf.append(data)

    def handle_endtag(self, tag):
        if self._in == "title" and tag == "title": self.d["title"] = "".join(self._buf).strip(); self._in = None
        if self._in == "ld" and tag == "script": self.d["ld"].append("".join(self._buf)); self._in = None


def ld_types(blobs):
    out, bad = [], 0
    def walk(o):
        if isinstance(o, dict):
            t = o.get("@type")
            if t: out.extend(t if isinstance(t, list) else [t])
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    for b in blobs:
        try: walk(json.loads(b))
        except Exception: bad += 1
    return out, bad


def page(base, path):
    r = get(urllib.parse.urljoin(base, path))
    h = Head()
    try: h.feed(r["body"])
    except Exception: pass
    d = h.d; types, bad = ld_types(d["ld"])
    canon = [l[1] for l in d["links"] if "canonical" in (l[0] or "")]
    text = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", r["body"], flags=re.S)
    words = len(re.findall(r"[A-Za-z]{2,}", text))
    return {"path": path, "status": r["status"], "final": r["url"], "ms": r["ms"], "bytes": len(r["body"]),
            "title": d["title"], "title_len": len(d["title"]), "desc_len": len(d["meta"].get("description", "")),
            "canonical": canon[:2], "og_title": bool(d["meta"].get("og:title")), "og_image": bool(d["meta"].get("og:image")),
            "twitter_card": d["meta"].get("twitter:card"), "robots_meta": d["meta"].get("robots"), "lang": d["lang"],
            "h1": d["h1"], "landmarks": sorted(t for t in d["tags"] & {"main", "nav", "header", "footer"}),
            "jsonld_types": sorted(set(types)), "jsonld_type_counts": {t: types.count(t) for t in set(types)},
            "jsonld_parse_errors": bad, "ssr_words": words, "hreflang": [l[2] for l in d["links"] if l[2]][:5],
            "og_extra": {k: bool(d["meta"].get(k)) for k in ("og:site_name", "og:type", "og:locale", "og:url")},
            "md_twin_link": [l[1] for l in d["links"] if "alternate" in (l[0] or "") and l[3] == "text/markdown"][:1],
            "rss_link": [l[1] for l in d["links"] if "alternate" in (l[0] or "") and ("rss" in l[3] or "atom" in l[3])][:1],
            "img": d["img"], "img_no_alt": d["img_no_alt"], "click_div": d["click_div"],
            "heading_skips": sum(1 for x, y in zip(d["headings"], d["headings"][1:]) if y - x > 1),
            "webmcp": "modelContext" in r["body"], "headers": {h: bool((r.get("headers") or {}).get(h)) for h in SEC_HEADERS},
            "flags": [f for f, bad_ in [("title>60", len(d["title"]) > 60), ("desc>155", len(d["meta"].get("description", "")) > 155),
                                        ("desc<50", len(d["meta"].get("description", "")) < 50), ("no-canonical", not canon),
                                        ("h1!=1", d["h1"] != 1), ("no-og:image", not d["meta"].get("og:image"))] if bad_]}


def robots_rules(txt):
    groups, cur, agents_open = [], None, False
    for raw in txt.splitlines():
        line = raw.split("#")[0].strip()
        if ":" not in line: continue
        k, v = [x.strip() for x in line.split(":", 1)]; k = k.lower()
        if k == "user-agent":
            if cur is None or not agents_open: cur = {"ua": [], "rules": []}; groups.append(cur)
            cur["ua"].append(v.lower()); agents_open = True
        elif k in ("allow", "disallow") and cur is not None:
            cur["rules"].append((k, v)); agents_open = False
    def verdict(bot):
        g = [x for x in groups if bot.lower() in x["ua"]] or [x for x in groups if "*" in x["ua"]]
        if not g: return "allowed (no group)"
        rules = [r for x in g for r in x["rules"]]
        if any(k == "disallow" and v == "/" for k, v in rules) and not any(k == "allow" and v == "/" for k, v in rules):
            allows = [v for k, v in rules if k == "allow" and v]
            return f"PARTIAL: Disallow / except {len(allows)} allowed paths" if allows else "BLOCKED /"
        dis = [v for k, v in rules if k == "disallow" and v]
        return "allowed" + (f" (disallow {len(dis)} paths)" if dis else "")
    return {b: verdict(b) for b in BOTS}


def robots_star_disallows(path, txt):
    """True if the * group disallows path (longest-match, Allow wins ties). Approximate, prefix rules only."""
    rules, in_star = [], False
    for raw in txt.splitlines():
        line = raw.split("#")[0].strip()
        if ":" not in line: continue
        k, v = [x.strip() for x in line.split(":", 1)]; k = k.lower()
        if k == "user-agent": in_star = (v == "*")
        elif in_star and k in ("allow", "disallow") and v: rules.append((k, v.rstrip("*").rstrip("$")))
    hits = [(len(v), k == "allow") for k, v in rules if path.startswith(v)]
    return bool(hits) and not max(hits)[1]


def sitemap_union(base, robots_txt):
    seeds = re.findall(r"(?im)^\s*sitemap:\s*(\S+)", robots_txt) or [urllib.parse.urljoin(base, "/sitemap.xml")]
    seen, urls, chain = set(), [], []
    queue = list(seeds)
    while queue and len(seen) < 40:
        sm = queue.pop(0)
        if sm in seen: continue
        seen.add(sm); r = get(sm)
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r["body"])
        is_index = "<sitemapindex" in r["body"]
        lm = re.findall(r"<lastmod>\s*([^<\s]+)", r["body"])
        top = max((lm.count(x) for x in set(lm)), default=0)
        chain.append({"sitemap": sm, "status": r["status"], "index": is_index, "locs": len(locs),
                      "lastmod": len(lm), "lastmod_same_value_max": top, "images": r["body"].count("<image:loc>")})
        (queue.extend if is_index else urls.extend)(locs)
    kinds = {}
    for u in urls:
        p = urllib.parse.urlparse(u).path
        k = ("product" if re.search(r"/products?/", p) else "category" if re.search(r"/categor|/collections?/", p)
             else "learn/blog" if re.search(r"/learn|/blog|/guides?|/articles?", p) else "other")
        kinds[k] = kinds.get(k, 0) + 1
    hosts = sorted({urllib.parse.urlparse(u).netloc for u in urls})
    return {"seeds": seeds, "chain": chain, "total": len(urls), "kinds": kinds, "hosts": hosts, "sample": urls[:400]}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("base"); ap.add_argument("--out", default=".")
    ap.add_argument("--pdp"); ap.add_argument("--cat"); a = ap.parse_args()
    base = a.base.rstrip("/") + "/"; host = urllib.parse.urlparse(base).netloc
    rep = {"base": base, "at": time.strftime("%Y-%m-%dT%H:%M:%S%z")}
    rb = get(base + "robots.txt"); rep["robots"] = {"status": rb["status"], "bots": robots_rules(rb["body"]) if rb["status"] == 200 else {}}
    rep["sitemaps"] = sitemap_union(base, rb["body"] if rb["status"] == 200 else "")
    for f in ["llms.txt", "llms-full.txt"]:
        r = get(base + f)
        rep[f] = {"status": r["status"], "ctype": r["ctype"], "bytes": len(r["body"]),
                  "links": len(re.findall(r"\]\(https?://", r["body"])), "first_line": r["body"].strip().splitlines()[0][:120] if r["body"].strip() else ""}
    rep["well_known"] = {p: get(base.rstrip("/") + p, follow=False)["status"] for p in WELL_KNOWN}
    def _fs(p):  # a 200 text/html on a .json/.xml/.md path is a SOFT-200 (catch-all route), not a feed
        r = get(base.rstrip("/") + p, follow=False)
        soft = r["status"] == 200 and "html" in r["ctype"] and not p.endswith("/")
        return f"{r['status']} {r['ctype'].split(';')[0]}" + (" SOFT-200" if soft else "")
    rep["feeds"] = {p: _fs(p) for p in FEEDS}
    smp = rep["sitemaps"]["sample"]
    rep["sitemap_urls_disallowed"] = [u for u in smp if robots_star_disallows(urllib.parse.urlparse(u).path, rb["body"])][:10] if rb["status"] == 200 else []
    for tw in ["/us/about.md", "/us/faq.md", "/about.md"]:
        rep.setdefault("md_twins", {})[tw] = _fs(tw)
    rep["soft404"] = get(base + "us/zz-not-a-real-page-" + str(int(time.time())))["status"]
    v = get(base + "version"); rep["version"] = v["body"][:200] if v["status"] == 200 and "json" in v["ctype"] else v["status"]
    sample = rep["sitemaps"]["sample"]
    pdp = a.pdp or next((urllib.parse.urlparse(u).path for u in sample if re.search(r"/products?/", u)), None)
    cat = a.cat or next((urllib.parse.urlparse(u).path for u in sample if re.search(r"/categor|/collections?/", u)), None)
    rep["pages"] = {"home": page(base, "/")}
    if cat: rep["pages"]["category"] = page(base, cat)
    if pdp: rep["pages"]["pdp"] = page(base, pdp)
    for extra in ["/us/faq", "/us/about", "/us/learn"]:
        rep["pages"][extra] = page(base, extra)
    g_home = get(base, ua=UA_GPT); g_pdp = get(urllib.parse.urljoin(base, pdp), ua=UA_GPT) if pdp else None
    rep["gptbot_parity"] = {"home_status": g_home["status"], "home_bytes": len(g_home["body"]),
                            "browser_home_bytes": rep["pages"]["home"]["bytes"],
                            "pdp_status": g_pdp["status"] if g_pdp else None}
    rep["sitemaps"].pop("sample")
    os.makedirs(a.out, exist_ok=True)
    json.dump(rep, open(os.path.join(a.out, host + ".json"), "w"), indent=1, default=list)
    L = [f"# {host} AI-discoverability scorecard ({rep['at']})", "",
         f"- robots.txt {rep['robots']['status']}; blocked bots: {[b for b, v in rep['robots']['bots'].items() if 'BLOCKED' in v] or 'none'}",
         f"- sitemaps: {rep['sitemaps']['total']} URLs {rep['sitemaps']['kinds']} hosts={rep['sitemaps']['hosts']}",
         f"- llms.txt {rep['llms.txt']['status']} ({rep['llms.txt']['bytes']} B, {rep['llms.txt']['links']} links); llms-full.txt {rep['llms-full.txt']['status']} ({rep['llms-full.txt']['bytes']} B)",
         f"- .well-known: {rep['well_known']}", f"- unknown path -> {rep['soft404']} (want 404)", f"- /version: {rep['version']}",
         f"- GPTBot parity: {rep['gptbot_parity']}",
         f"- feeds: {rep['feeds']} | markdown twins: {rep['md_twins']}",
         f"- sitemap URLs Disallowed by robots (*): {len(rep['sitemap_urls_disallowed'])} {rep['sitemap_urls_disallowed'][:3]}",
         f"- sitemap chain: {[(c['sitemap'].rsplit('/',1)[-1], c['locs'], 'same-lastmod-max', c['lastmod_same_value_max'], 'img', c['images']) for c in rep['sitemaps']['chain']]}",
         f"- security headers (home): {rep['pages']['home']['headers']}", ""]
    for k, p in rep["pages"].items():
        L.append(f"## {k} {p['path']} -> {p['status']} {p['ms']}ms")
        L.append(f"title({p['title_len']}): {p['title'][:90]} | desc {p['desc_len']} | canonical {p['canonical']} | og {p['og_title']}/{p['og_image']} | h1 {p['h1']} | lang {p['lang']} | robots {p['robots_meta']}")
        L.append(f"JSON-LD {p['jsonld_type_counts']} (parse errors {p['jsonld_parse_errors']}) | landmarks {p['landmarks']} | SSR words {p['ssr_words']}")
        L.append(f"FLAGS {p['flags']} | og {p['og_extra']} | twitter {p['twitter_card']} | md-twin {p['md_twin_link']} | rss {p['rss_link']} | img {p['img']} no-alt {p['img_no_alt']} | click-div {p['click_div']} | heading skips {p['heading_skips']} | webmcp {p['webmcp']}"); L.append("")
    open(os.path.join(a.out, host + ".md"), "w").write("\n".join(L))
    print("\n".join(L))


if __name__ == "__main__":
    main()
