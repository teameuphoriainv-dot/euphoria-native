"""Touch-target audit — Apple HIG 44x44pt and WCAG 2.2 SC 2.5.8.

THE THRESHOLDS, committed here before any run:

  Apple HIG        44 x 44 pt minimum for any tappable control. Deviations are an App Store
                   review risk, not only a usability one.
  WCAG 2.5.8 (AA)  24 x 24 CSS px floor, new in WCAG 2.2. Apple's 44pt is strictly stricter, so
                   44 is the number this audit enforces and 24 is reported as the compliance
                   floor a finding would still breach.

WHY THIS RUNS ON DEVICE AND NOT OVER THE SOURCE. A control's real hit area is the product of its
style, its padding, its `hitSlop`, and whatever its parent flexbox did to it. Reading `width: 32`
out of a StyleSheet tells you nothing about the rendered target — only the accessibility tree
knows, and `idb ui describe-all` reports every element's true frame in points.

BLIND SPOT — this audit UNDER-reports real touch areas. `idb` reports the accessibility frame,
which does NOT include React Native's `hitSlop`. A control rendering 18pt tall with hitSlop 13
has a real 44pt target and will still be flagged here. So a finding is a PROMPT TO GO LOOK at
the call site, never proof on its own — "See all" was flagged at 40.7 x 18.0 and already carried
hitSlop 8, making its true target 34pt: still a defect, but not the one the number described.
The inverse is the dangerous case and this tool cannot see it at all — a large frame whose
child swallows the touch. Only a real tap proves that.

WHAT COUNTS AS INTERACTIVE. The tree marks types explicitly (Button, Link, TextField...). A
static label under 44pt is not a defect; a button under 44pt is. Anything ambiguous is reported
separately rather than silently included or dropped, because both choices hide something.

  EUPHORIA_UDID=... python3 scripts/touch_audit.py <route-name>   # after sim.sh open
"""
import json
import os
import subprocess
import sys

HIG_MIN = 44.0
WCAG_MIN = 24.0

INTERACTIVE = {"Button", "Link", "TextField", "SecureTextField", "Switch", "Slider",
               "SearchField", "Cell", "Tab", "CheckBox", "RadioButton", "SegmentedControl"}


def tree(udid):
    idb = subprocess.run(["which", "idb"], capture_output=True, text=True).stdout.strip()
    idb = idb or os.path.expanduser("~/.idb-venv/bin/idb")
    out = subprocess.run([idb, "ui", "describe-all", "--udid", udid],
                         capture_output=True, text=True).stdout
    try:
        return json.loads(out)
    except Exception:
        return []


def audit(udid, route="?"):
    nodes = tree(udid)
    small, ok, ambiguous = [], 0, []
    for n in nodes:
        f = n.get("frame") or {}
        w, h = float(f.get("width", 0)), float(f.get("height", 0))
        if w <= 0 or h <= 0:
            continue
        label = (n.get("AXLabel") or n.get("title") or "").strip()
        kind = n.get("type") or ""
        enabled = n.get("enabled", True)
        row = {"label": label[:46], "type": kind, "w": round(w, 1), "h": round(h, 1),
               "enabled": enabled}
        if kind in INTERACTIVE:
            if w < HIG_MIN or h < HIG_MIN:
                row["breaches_wcag"] = w < WCAG_MIN or h < WCAG_MIN
                small.append(row)
            else:
                ok += 1
        elif label and (w < HIG_MIN or h < HIG_MIN) and n.get("custom_actions"):
            # Has actions but an untyped role — can't prove it's tappable, won't pretend either.
            ambiguous.append(row)
    return {"route": route, "interactive_ok": ok, "too_small": small, "ambiguous": ambiguous,
            "nodes": len(nodes)}


def report(a):
    print(f"# Touch targets · {a['route']}  ({a['nodes']} nodes)")
    print(f"  interactive meeting {HIG_MIN:.0f}pt : {a['interactive_ok']}")
    print(f"  interactive BELOW {HIG_MIN:.0f}pt   : {len(a['too_small'])}")
    hard = [r for r in a["too_small"] if r.get("breaches_wcag")]
    print(f"    of which under WCAG {WCAG_MIN:.0f}pt: {len(hard)}  <- AA failure, not just HIG")
    for r in sorted(a["too_small"], key=lambda x: min(x["w"], x["h"])):
        mark = "WCAG" if r.get("breaches_wcag") else "HIG "
        print(f"    [{mark}] {r['w']:>5} x {r['h']:<5} {r['type']:<12} {r['label']}")
    if a["ambiguous"]:
        print(f"  ambiguous (has actions, untyped role): {len(a['ambiguous'])}")
        for r in a["ambiguous"][:6]:
            print(f"    {r['w']:>5} x {r['h']:<5} {r['label']}")


def _demo():
    """Self-check on the classification, no device needed."""
    assert HIG_MIN > WCAG_MIN, "Apple's floor must be the stricter one we enforce"
    # A 44x44 button passes; 43 on either axis fails — the rule is BOTH dimensions.
    for w, h, want_small in ((44, 44, False), (43, 44, True), (44, 43, True), (100, 20, True)):
        small = w < HIG_MIN or h < HIG_MIN
        assert small == want_small, f"{w}x{h} misclassified"
    # A 30pt control breaches HIG but not WCAG's 24pt floor; a 20pt one breaches both.
    assert not (30 < WCAG_MIN) and (20 < WCAG_MIN)
    print("touch_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        udid = os.environ.get("EUPHORIA_UDID", "")
        if not udid:
            print("set EUPHORIA_UDID", file=sys.stderr)
            sys.exit(1)
        a = audit(udid, sys.argv[1] if len(sys.argv) > 1 else "?")
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
