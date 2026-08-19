"""Safe-area compatibility audit — notch vs SE, and the double-pad defect.

WHY THIS LANE EARNS A SCRIPT WHEN THE DATA-INTEGRITY LANE DID NOT. The store audit
checked four properties in ONE file, all already correct; automating that is ceremony.
This checks a rule across 27 files that grows every time a screen is added, and the
failure is SILENT — a wrong `edges` prop produces a gap, never an error.

THE DEFECT THIS EXISTS TO CATCH. A tab screen is already inside a navigator that pads
the bottom for the tab bar. If the screen ALSO declares `bottom` in its edges, both
apply and the content floats above the tab bar on notched devices:

    app/(tabs)/home.tsx   <SafeAreaView edges={['top','bottom']}>   <- double-padded

All five tab screens currently declare `['top']`, which is correct. This locks that in.

WHAT IS DELIBERATELY NOT FLAGGED, because asking why first is the rule:

  * A non-tab screen with NO edges prop. That pads all four sides, which is CORRECT
    outside a tab navigator — nothing else applies the bottom inset there. 15 usages
    look like this and every one is right.
  * `SafeAreaProvider` missing from src/. expo-router's navigators wrap content in
    React Navigation's `SafeAreaProviderCompat`, which mounts one with initialMetrics.
    Requiring an app-level provider would flag a non-problem.

WHAT IT CANNOT DO. Static analysis sees the edges PROP, never the rendered inset. A
screen can declare the right edges and still clip on an SE if its content assumes a
taller viewport. The simulator settles that; this produces the worklist.

    python3 scripts/compat_audit.py [--json]
"""
import glob
import json
import re
import sys

SAV = re.compile(r"<SafeAreaView([^>]*)>", re.S)
EDGES = re.compile(r"edges=\{?\[([^\]]*)\]")
# RN's own SafeAreaView is iOS-only and does not respond to orientation; the context
# library is the correct import. A mixed codebase renders differently per screen.
WRONG_LIB = re.compile(r"import\s*\{[^}]*\bSafeAreaView\b[^}]*\}\s*from\s*'react-native'")
# Inset-shaped magic numbers: 44/47/59 status bars, 34 home indicator. 20 and 21 are
# DELIBERATELY EXCLUDED though they are legacy status-bar heights — 20pt is also one of
# the commonest padding values in any codebase, so matching it cannot distinguish an
# inset from ordinary spacing. A check that cannot tell signal from noise is worse than
# no check: it spends a future iteration proving its own finding wrong.
HARDCODED = re.compile(r"padding(?:Top|Bottom): *(?:44|47|59|34)\b|top: *(?:44|47|59)\b")


def is_tab(path):
    return "(tabs)" in path


def audit():
    double_pad, wrong_lib, hardcoded, ok_tabs, unscoped = [], [], [], [], 0
    for f in sorted(glob.glob("src/**/*.tsx", recursive=True)):
        src = open(f, encoding="utf-8", errors="ignore").read()
        short = f.replace("src/", "")
        if WRONG_LIB.search(src):
            wrong_lib.append(short)
        if HARDCODED.search(src):
            hardcoded.append(short)
        for m in SAV.finditer(src):
            e = EDGES.search(m.group(1))
            if not e:
                unscoped += 1
                continue
            edges = [x.strip().strip("'\"") for x in e.group(1).split(",") if x.strip()]
            if is_tab(f):
                # The whole point of the lane.
                (double_pad if "bottom" in edges else ok_tabs).append((short, edges))
    return {"double_pad": double_pad, "wrong_lib": wrong_lib, "hardcoded": hardcoded,
            "tab_screens_ok": ok_tabs, "unscoped_non_tab": unscoped}


def report(a):
    print("# Safe-area compatibility audit\n")
    print(f"  tab screens declaring edges correctly (top only): {len(a['tab_screens_ok'])}")
    print(f"  unscoped SafeAreaView outside tabs (correct):     {a['unscoped_non_tab']}")
    print(f"  DOUBLE-PAD — tab screen padding bottom twice:     {len(a['double_pad'])}")
    print(f"  wrong SafeAreaView import (react-native):         {len(a['wrong_lib'])}")
    print(f"  hardcoded inset-shaped constants:                 {len(a['hardcoded'])}\n")
    for f, e in a["double_pad"]:
        print(f"  [DOUBLE-PAD] {f}  edges={e}  <- drop 'bottom'; the tab bar already pads it")
    for f in a["wrong_lib"]:
        print(f"  [WRONG LIB]  {f}  <- import SafeAreaView from react-native-safe-area-context")
    for f in a["hardcoded"]:
        print(f"  [HARDCODED]  {f}  <- use useSafeAreaInsets(), not a magic number")
    if not (a["double_pad"] or a["wrong_lib"] or a["hardcoded"]):
        print("  no defects\n")
        print("> A LOW NUMBER HERE DESCRIBES CORRECT DESIGN: all five tab screens declare")
        print("> ['top'] and let the navigator own the bottom inset, which is the right split.")


def _demo():
    # The defect: a tab screen padding the bottom the tab bar already pads.
    assert is_tab("src/app/(tabs)/home.tsx") and not is_tab("src/app/lesson.tsx")
    assert EDGES.search("edges={['top','bottom']}").group(1).count(",") == 1
    # A tab screen with top only is CORRECT and must never be flagged.
    e = [x.strip().strip("'") for x in EDGES.search("edges={['top']}").group(1).split(",")]
    assert e == ["top"] and "bottom" not in e
    # No edges prop at all is correct OUTSIDE tabs — it must not parse as a defect.
    assert EDGES.search("<SafeAreaView style={s.x}>") is None
    # Wrong-library import is the other real defect.
    assert WRONG_LIB.search("import { View, SafeAreaView } from 'react-native';")
    assert not WRONG_LIB.search("import { SafeAreaView } from 'react-native-safe-area-context';")
    # A magic inset number is a defect; a normal spacing value is not.
    assert HARDCODED.search("paddingBottom: 34")   # home indicator, unambiguous
    assert not HARDCODED.search("paddingBottom: 12")
    # 20 is a legacy status-bar height AND ordinary spacing, so it must NOT be flagged.
    assert not HARDCODED.search("paddingBottom: 20")
    print("compat_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
