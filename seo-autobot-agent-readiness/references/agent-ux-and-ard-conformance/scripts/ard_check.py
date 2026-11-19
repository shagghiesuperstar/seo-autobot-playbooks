#!/usr/bin/env python3
"""Check an ard.json manifest against the findings the Lighthouse ARD audit reports.

Usage: python ard_check.py path/to/ard.json
Run it on a saved copy of the manifest (curl it first). Validates the manifest only:
it does not fetch the artifacts the entries point to, so run the endpoint probes too.
Rules mirror the Lighthouse documentation dated 2026-10-20 (ARD v0.91); re-read the
live documentation when the spec version changes. Exit code 1 on any error.
"""
import json, re, sys

URN = re.compile(r"^urn:air:[^:\s]+:[^:\s]+:[^:\s]+$")
DEPRECATED_TYPES = {"application/mcp-server+json": "application/mcp-server-card+json"}

def check(doc):
    errors, warnings = [], []
    if not isinstance(doc, dict):
        return ["manifest is not a JSON object"], warnings
    entries = doc.get("entries")
    if not isinstance(entries, list):
        errors.append("missing `entries` array")
        entries = []
    if "collections" in doc:
        warnings.append("top-level `collections` is no longer part of the spec")
    if "trustManifest" in doc:
        tm = doc["trustManifest"]
        if not (isinstance(tm, dict) and "identity" in tm):
            errors.append("`trustManifest` must be an object with an `identity` property")
    for i, e in enumerate(entries):
        tag = f"entries[{i}]"
        if not isinstance(e, dict):
            errors.append(f"{tag} is not an object")
            continue
        for field in ("identifier", "displayName", "type"):
            if not e.get(field):
                errors.append(f"{tag} missing `{field}`")
        ident = e.get("identifier")
        if ident and not URN.match(str(ident)):
            errors.append(f"{tag} identifier is not urn:air:<publisher>:<namespace>:<name>")
        has_url, has_data = "url" in e, "data" in e
        if has_url == has_data:
            errors.append(f"{tag} must have exactly one of `url` or `data`")
        if e.get("type") in DEPRECATED_TYPES:
            warnings.append(f"{tag} type `{e['type']}` is deprecated; use `{DEPRECATED_TYPES[e['type']]}`")
        rq = e.get("representativeQueries")
        if not isinstance(rq, list) or not 2 <= len(rq) <= 5:
            warnings.append(f"{tag} should carry 2 to 5 `representativeQueries`")
    return errors, warnings

def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    try:
        with open(argv[1], encoding="utf-8") as f:
            doc = json.load(f)
    except (OSError, ValueError) as exc:
        print(f"ERROR cannot load manifest: {exc}")
        return 1
    errors, warnings = check(doc)
    for e in errors:
        print("ERROR  ", e)
    for w in warnings:
        print("WARNING", w)
    print(f"{len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
