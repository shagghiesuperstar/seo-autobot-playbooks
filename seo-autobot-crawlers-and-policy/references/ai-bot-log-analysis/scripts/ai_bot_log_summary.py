#!/usr/bin/env python3
"""Summarize AI bot activity from access logs.

Usage: python ai_bot_log_summary.py access.log [bots.json] [money-pages.txt]
Reads combined-format lines or JSON lines (keys: path|uri|url, status, user_agent|ua).
bots.json maps a class name to a list of user-agent substrings. Fetch the vendors'
current published token lists and write bots.json each run; the built-in map is a
dated fallback (2026-11-17) and will go stale.
Classification is by user-agent only and is therefore UNVERIFIED: confirm against
the edge provider's verified-bot field, published network ranges, or signatures.
"""
import json, re, sys
from collections import Counter, defaultdict

FALLBACK = {
    "search-engine": ["Googlebot", "bingbot", "Applebot/"],
    "ai-training": ["GPTBot", "ClaudeBot", "CCBot", "Meta-ExternalAgent", "Applebot-Extended"],
    "ai-search-index": ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "DuckAssistBot"],
    "ai-user-triggered": ["ChatGPT-User", "Claude-User", "Perplexity-User", "MistralAI-User"],
}
COMBINED = re.compile(r'"(?:GET|HEAD|POST) (\S+) [^"]*" (\d{3}) \S+ "[^"]*" "([^"]*)"')

def parse(line):
    line = line.strip()
    if not line:
        return None
    if line.startswith("{"):
        try:
            r = json.loads(line)
        except ValueError:
            return None
        path = r.get("path") or r.get("uri") or r.get("url")
        ua = r.get("user_agent") or r.get("ua") or ""
        status = r.get("status")
        return (str(path), int(status), str(ua)) if path and status else None
    m = COMBINED.search(line)
    return (m.group(1), int(m.group(2)), m.group(3)) if m else None

def classify(ua, bots):
    low = ua.lower()
    for cls in sorted(bots, key=lambda c: 0 if c.startswith("ai-") else 1):
        if any(tok.lower() in low for tok in bots[cls]):
            return cls
    return None

def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    bots = json.load(open(argv[2], encoding="utf-8")) if len(argv) > 2 else FALLBACK
    money = [l.strip() for l in open(argv[3], encoding="utf-8") if l.strip()] if len(argv) > 3 else []
    status_by_class = defaultdict(Counter)
    hits = defaultdict(Counter)
    missing = Counter()
    unparsed = 0
    with open(argv[1], encoding="utf-8", errors="replace") as f:
        for line in f:
            rec = parse(line)
            if rec is None:
                unparsed += 1
                continue
            path, status, ua = rec
            cls = classify(ua, bots)
            if cls is None:
                continue
            path = path.split("?")[0]
            status_by_class[cls][status] += 1
            hits[path][cls] += 1
            if status == 404 and cls == "ai-user-triggered":
                missing[path] += 1
    print("## Status by bot class (user-agent only, UNVERIFIED)")
    for cls in sorted(status_by_class):
        total = sum(status_by_class[cls].values())
        mix = ", ".join(f"{s}: {n}" for s, n in sorted(status_by_class[cls].items()))
        print(f"{cls}\ttotal {total}\t{mix}")
    if money:
        print("\n## Money pages with no AI search or user-triggered fetch in this log")
        for p in money:
            if not (hits[p]["ai-search-index"] or hits[p]["ai-user-triggered"]):
                print(p)
    print("\n## URLs assistants requested that returned 404 (2+ hits)")
    for p, n in missing.most_common(50):
        if n >= 2:
            print(f"{n}\t{p}")
    print(f"\nunparsed lines: {unparsed}")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
