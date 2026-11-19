#!/usr/bin/env python3
"""Visibility rates with 95% Wilson intervals from a prompt-sample CSV.

Usage: python visibility_rate.py samples.csv [previous.csv]
Required columns: cluster, engine, mentioned, cited  (mentioned/cited: 1/0, yes/no, true/false)
Optional column:  branded (1/0) -- branded clusters are reported separately.
No model and no network in the scoring path; output is byte-stable for the same input.
"""
import csv, math, sys
from collections import defaultdict

Z = 1.959964

def truthy(v):
    return str(v).strip().lower() in ("1", "yes", "true", "y")

def wilson(k, n):
    if n == 0:
        return (0.0, 0.0)
    p = k / n
    den = 1 + Z * Z / n
    mid = (p + Z * Z / (2 * n)) / den
    half = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / den
    return (max(0.0, mid - half), min(1.0, mid + half))

def load(path):
    rows = defaultdict(lambda: {"n": 0, "mentioned": 0, "cited": 0})
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            key = (r["cluster"].strip(), r["engine"].strip(), "branded" if truthy(r.get("branded", 0)) else "non-branded")
            rows[key]["n"] += 1
            rows[key]["mentioned"] += truthy(r["mentioned"])
            rows[key]["cited"] += truthy(r["cited"])
    return rows

def label(n):
    if n < 30:
        return "sample only, not a rate"
    if n < 60:
        return "working baseline"
    if n < 100:
        return "reportable"
    return "decision-grade"

def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    cur = load(argv[1])
    prev = load(argv[2]) if len(argv) > 2 else {}
    print("cluster,engine,branded,metric,k,n,rate,ci_low,ci_high,grade,verdict_vs_previous")
    for key in sorted(cur):
        c = cur[key]
        for metric in ("mentioned", "cited"):
            lo, hi = wilson(c[metric], c["n"])
            verdict = ""
            if key in prev and prev[key]["n"]:
                plo, phi = wilson(prev[key][metric], prev[key]["n"])
                if c["n"] < 30 or prev[key]["n"] < 30:
                    verdict = "too few runs"
                elif lo > phi:
                    verdict = "up"
                elif hi < plo:
                    verdict = "down"
                else:
                    verdict = "no change yet"
            print(",".join([key[0], key[1], key[2], metric, str(c[metric]), str(c["n"]),
                            f"{c[metric] / c['n']:.3f}", f"{lo:.3f}", f"{hi:.3f}", label(c["n"]), verdict]))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
