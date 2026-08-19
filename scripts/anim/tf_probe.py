#!/usr/bin/env python3
"""Settle the true/false tap EMPIRICALLY: dump one row's full a11y node before and after a tap.

Three attempts at this failed by reasoning about it. The role appeared to change with selection
(AXButton vs AXGenericElement) but a tap did not flip it, and every explanation offered so far
has been a guess. So: print every field of the node, tap it, print every field again, and let
the diff say what selection actually looks like.
"""
import subprocess as sp, json, time, sys

U = "755B55D9-8E4B-431C-9D1D-A635F38CFF5F"

def raw():
    r = sp.run(["idb", "ui", "describe-all", "--udid", U], capture_output=True, text=True)
    try: return json.loads(r.stdout or "[]")
    except json.JSONDecodeError: return []

def rows(sub):
    return [n for n in raw() if n.get('AXLabel') and sub.lower() in n['AXLabel'].lower()]

if __name__ == '__main__':
    sub = sys.argv[1] if len(sys.argv) > 1 else '50/30/20 rule was popularized'
    before = rows(sub)
    if not before:
        print(f"no row matching {sub!r} on screen"); sys.exit(1)
    n = before[0]
    print("BEFORE:"); print(json.dumps(n, indent=1))
    f = n['frame']
    x, y = round(f['x'] + f['width'] / 2), round(f['y'] + f['height'] / 2)
    print(f"\ntapping ({x},{y})")
    sp.run(["idb", "ui", "tap", "--udid", U, str(x), str(y)], capture_output=True)
    time.sleep(1.2)
    after = rows(sub)
    print("\nAFTER:"); print(json.dumps(after[0], indent=1) if after else "row gone")
    if after:
        d = {k: (n.get(k), after[0].get(k)) for k in set(n) | set(after[0]) if n.get(k) != after[0].get(k)}
        print("\nCHANGED FIELDS:", json.dumps(d, indent=1) if d else "NONE — the tap did not register")
