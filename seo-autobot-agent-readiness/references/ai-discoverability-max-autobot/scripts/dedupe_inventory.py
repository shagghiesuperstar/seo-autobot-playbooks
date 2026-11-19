#!/usr/bin/env python3
"""usage: python3 dedupe_inventory.py <out.json> [--tracker-json issues.json] [--board-db tasks.db] [--repo owner/name ...]
Dedupe inventory: every task-tracker issue, task-board card, and GitHub PR already covering
AEO/GEO/SEO/AIO/Safari/MCP work, so new fix cards never duplicate in-flight work.
Generic version for the public template (the original read one operator's private ops-runner layout):
- --tracker-json: an export of your task tracker's issues, a JSON list of {"id","title","state","updated"}.
- --board-db: an optional sqlite task board with a `tasks(id,status,title,created_at)` table (last 21 days are read).
- --repo: one or more GitHub repos; PRs are listed read-only with the `gh` CLI.
Every source is optional and read-only. Keyword list and output shape are unchanged from the original."""
import argparse, json, re, sqlite3, subprocess, sys
from pathlib import Path
KW = ["SEO", "AEO", "GEO", "JSON-LD", "llms", "sitemap", "robots", "metadata", "schema", "FAQ", "discoverab", "Safari",
      "MCP", "canonical", "structured data", "agent", "Open Graph", "og-image", "breadcrumb", "learn-page", "glossary",
      "a11y", "accessib", "Lighthouse", "Core Web", "feed", "hreflang", "noindex", "404"]
pat = re.compile("|".join(re.escape(k) for k in KW), re.I)
ap = argparse.ArgumentParser(); ap.add_argument("out", nargs="?", default="dedupe-inventory.json")
ap.add_argument("--tracker-json"); ap.add_argument("--board-db"); ap.add_argument("--repo", nargs="*", default=[])
a = ap.parse_args()
out = {"tracker": {}, "board": {}, "prs": {}}
if a.tracker_json:
    for n in json.loads(Path(a.tracker_json).expanduser().read_text()):
        if pat.search(n.get("title") or ""):
            out["tracker"][str(n.get("id"))] = [n.get("state", ""), (n.get("title") or "")[:120], str(n.get("updated", ""))[:10]]
if a.board_db:
    db = sqlite3.connect(str(Path(a.board_db).expanduser()))
    for tid, st, title, ca in db.execute("select id,status,title,date(created_at,'unixepoch') from tasks where created_at > strftime('%s','now','-21 days')"):
        if pat.search(title or ""): out["board"][str(tid)] = [st, title[:120], ca]
for repo in a.repo:
    j = subprocess.run(["gh", "pr", "list", "--repo", repo, "--state", "all", "--limit", "400", "--json",
                        "number,title,state,mergedAt,isDraft,headRefName"], capture_output=True, text=True).stdout
    for p in json.loads(j or "[]"):
        if pat.search(p["title"]): out["prs"][f"{repo.split('/')[1]}#{p['number']}"] = [p["state"] + ("/draft" if p["isDraft"] else ""), p["title"][:120], (p["mergedAt"] or "")[:10]]
dst = Path(a.out).expanduser(); dst.write_text(json.dumps(out, indent=1))
for k, v in out.items():
    print(f"== {k}: {len(v)}")
    states = {}
    for row in v.values(): states[row[0]] = states.get(row[0], 0) + 1
    print(states)
