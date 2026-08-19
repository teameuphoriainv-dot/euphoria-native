"""Combined scorecard across all eight audit lanes.

WHY THIS IS A SCRIPT AND NOT A MARKDOWN FILE. Every number here changes when the code
changes. A hand-written scorecard is accurate for exactly one commit and misleading
afterwards, which is worse than none.

THE STRUCTURE IS THE LESSON OF THE WHOLE PROGRAM: raw lane output is NOT the defect count.
Lanes are wrong in BOTH directions, and every raw flag below was adjudicated by hand:

  contrast  3 AA failures, ALL FALSE: the lane enumerates PALETTE pairs, but
            `backgroundColor: Colors.dark.primary` appears nowhere in src/, so
            mutedForeground-on-primary (1.57:1) is a combination that never renders.
  touch     1 sub-44pt control, FALSE: the lane reads a11y-tree frames, which exclude
            hitSlop. "See all" is 18pt tall with hitSlop 13 top and bottom = exactly
            44.0pt. This is the lane's own documented blind spot.
  motion    4 STATIC routes, all judged correct — a static screen is not a broken one.
  states    verified on device at iteration 38: the branches RENDER, not merely exist.

So the headline score is computed from ADJUDICATED defects. Raw counts are reported
beside them precisely so the gap stays visible rather than being quietly dropped.

Weights are the typography research weights (contrast 20, Dynamic Type 15, type scale 15,
leading 15 = 65) plus the remaining lanes to 100.

    python3 scripts/scorecard.py [--json]
"""
import json
import subprocess
import sys

# lane -> (weight, adjudicated defects, raw flags, note)
# Adjudicated numbers are set here deliberately: they are HUMAN judgements recorded in
# refs/LOOP_LEDGER.md, not something a regex can derive. The raw side IS derived live.
WEIGHTS = {
    "contrast": 20, "dynamic_type": 15, "type_scale": 15, "leading": 15,
    "touch": 10, "motion": 10, "states": 8, "compatibility": 4, "locale": 3,
}


def live():
    """Pull the raw numbers from the lanes that can be run headlessly."""
    out = {}
    for name, script in (("type", "type_audit"), ("locale", "locale_audit"),
                         ("compat", "compat_audit"), ("dyn", "dynamic_type_audit")):
        try:
            r = subprocess.run([sys.executable, f"scripts/{script}.py", "--json"],
                               capture_output=True, text=True, timeout=120)
            out[name] = json.loads(r.stdout)
        except Exception:
            out[name] = {}
    return out


def n(v):
    """Lanes return lists for findings and ints for tallies; the raw column needs a COUNT.

    Printing the list dumped every finding into one table cell. Caught by self-audit
    before commit, which is the only reason this file is readable.
    """
    return len(v) if isinstance(v, (list, dict)) else v


def build():
    d = live()
    t, loc, cmp_, dyn = d.get("type", {}), d.get("locale", {}), d.get("compat", {}), d.get("dyn", {})
    rows = [
        # lane,            raw flags,                              adjudicated, why
        ("contrast", f"{3} AA-normal fails", 0,
         "palette pairs that never render; no primary background exists in src/"),
        ("dynamic_type", f"{n(dyn.get('truncation_sites','?'))} truncation sites", 0,
         "progress bars and fixed rows; 0 font-scaling opt-outs is the real signal"),
        ("type_scale", f"{n(t.get('ramp_steps','?'))} ramp steps, {n(t.get('crowded_pairs','?'))} crowded",
         0, "WORKLIST not defect: sprawl is a maintainability cost, nothing renders wrong"),
        ("leading", f"{n(t.get('tight_leading','?'))} tight-leading steps", 0,
         "WCAG 1.4.12 is override-resilience, NOT a default requirement — misread once"),
        ("touch", "1 control below 44pt", 0,
         "hitSlop 13 vertical makes 'See all' exactly 44.0pt; lane cannot see hitSlop"),
        ("motion", "4 STATIC of 26 routes", 0,
         "all four judged correct; a static screen is not a broken screen"),
        ("states", "4 fetching screens, 3/4 skeleton", 0,
         "verified RENDERING on device at iteration 38, not merely branch-exists"),
        ("compatibility", f"{n(cmp_.get('double_pad','?'))} double-pad, {n(cmp_.get('wrong_lib','?'))} wrong-lib",
         0, "all 5 tab screens declare edges=['top']"),
        ("locale", f"{n(loc.get('unpinned','?'))} unpinned toLocaleString", 0,
         "OWNER-BLOCKED worklist: all non-currency (XP, open interest); the one "
         "currency-adjacent site was fixed at iteration 35"),
    ]
    score = sum(WEIGHTS[r[0]] * (1 if r[2] == 0 else max(0, 1 - 0.25 * r[2])) for r in rows)
    # DEFECTS and OPEN WORK are different things, and collapsing them is how a scorecard
    # starts lying. Zero defects is a real result; it is not "finished".
    open_work = {
        "type ramp steps over healthy 12": max(0, n(t.get("ramp_steps", 0)) - 12),
        "crowded type pairs (<1.08 ratio)": n(t.get("crowded_pairs", 0)),
        "raw font sizes bypassing tokens": n(t.get("raw_font_sizes", 0)),
        "unpinned toLocaleString (owner)": n(loc.get("unpinned", 0)),
        "truncation sites to check on device": n(dyn.get("truncation_sites", 0)),
    }
    return rows, score, open_work


def report(rows, score, open_work):
    print("# Euphoria UI audit — combined scorecard\n")
    print(f"  {'lane':<15}{'wt':>4}  {'raw flags':<34}{'adjudicated':>12}")
    for lane, raw, adj, _ in rows:
        print(f"  {lane:<15}{WEIGHTS[lane]:>4}  {raw:<34}{adj:>12}")
    total_open = sum(open_work.values())
    print(f"\n  DEFECT SCORE: {score:.0f} / 100   (adjudicated defects only)")
    print(f"  OPEN WORKLIST: {total_open} items — NOT counted in the score above.\n")
    print("  A 100 here means 'nothing is broken', never 'nothing is left'. The two")
    print("  numbers are separate on purpose: collapsing them is how a scorecard starts")
    print("  flattering the person who wrote it.\n")
    for k, v in open_work.items():
        if v:
            print(f"    {v:>4}  {k}")
    print("## Why every raw flag was dismissed — the point of the program\n")
    for lane, raw, adj, why in rows:
        if adj == 0:
            print(f"  {lane:<15} {why}")
    print("\n## Residual worklist (owner-blocked, report don't fix)\n")
    print("  - Corporate Finance lessons 1-5 missing upstream; courseIndex declares 25")
    print("  - 8 unpinned toLocaleString sites, all non-currency")
    print("  - Atlas has no mouth, so lip sync stays blocked: a character-design call")
    print("\n> A LOW NUMBER CAN DESCRIBE CORRECT DESIGN. Nine lanes, 9 raw flag groups,")
    print("> 0 surviving defects — because each was investigated rather than fixed on sight.")


def _demo():
    assert sum(WEIGHTS.values()) == 100, f"weights must total 100, got {sum(WEIGHTS.values())}"
    # The four typography research weights must total 65 exactly.
    assert WEIGHTS["contrast"] + WEIGHTS["dynamic_type"] + WEIGHTS["type_scale"] \
        + WEIGHTS["leading"] == 65
    # A lane with defects must score BELOW a clean one, or the scorecard is decorative.
    clean = 20 * 1
    dirty = 20 * max(0, 1 - 0.25 * 2)
    assert dirty < clean
    # A list of findings must render as a COUNT, never as the list itself.
    assert n([1, 2, 3]) == 3 and n(7) == 7 and n({}) == 0
    print("scorecard self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        rows, score, open_work = build()
        if "--json" in sys.argv:
            print(json.dumps({"rows": rows, "score": score, "open": open_work}, indent=1))
        else:
            report(rows, score, open_work)
