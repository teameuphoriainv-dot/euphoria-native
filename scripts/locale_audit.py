"""Locale-formatting audit — for an app that is English-only ON PURPOSE.

WHY THIS IS NOT A TRANSLATION AUDIT. Checked the premise before building the lane: this app
declares no locales, ships no i18n framework, and has ZERO imports of expo-localization despite
carrying it as a config plugin. Auditing it for hardcoded strings would flag every user-facing
word in the product — hundreds of findings with nowhere to move them to. That is a lane that
makes work rather than finding defects.

The REAL risk in an English-only app is narrower and easy to miss: `toLocaleString()` with no
locale argument formats from the DEVICE locale. So a user in Germany sees European separators
inside English copy, and the app's own numbers disagree with each other depending on whose
phone they are on.

  compound.tsx:  `${contributed.toLocaleString()}`  ->  "$1.234,56" on a German device
                 a US currency symbol wired to European separators, in an English sentence.

The codebase already knows the right pattern — lib/stocks.ts `money()` pins 'en-US' explicitly.
This lane finds the call sites that do not.

WHAT IT DELIBERATELY DOES NOT FLAG: a pinned locale of any kind. Pinning 'de-DE' would be a
choice; pinning nothing is an accident that varies per user.

    python3 scripts/locale_audit.py [--json]
"""
import glob
import json
import re
import sys

# toLocaleString / toLocaleDateString / toLocaleTimeString with NO first argument.
UNPINNED = re.compile(r"\.toLocale(?:String|DateString|TimeString)\(\s*(?:\)|\{)")
# ...and the same call WITH a locale string, which is correct and must not be flagged.
PINNED = re.compile(r"\.toLocale(?:String|DateString|TimeString)\(\s*['\"]")
# A currency symbol immediately before an interpolated number is the highest-severity shape:
# it hardcodes one region's symbol onto another region's separators.
CURRENCY_ADJACENT = re.compile(r"[$£€]\s*\$\{[^}]*toLocale")


def strip_comments(text):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return re.sub(r"//[^\n]*", "", text)


def audit():
    unpinned, pinned, currency = [], 0, []
    for f in sorted(glob.glob("src/**/*.ts*", recursive=True)):
        if "node_modules" in f:
            continue
        for i, ln in enumerate(strip_comments(open(f, encoding="utf-8", errors="ignore")
                                              .read()).split("\n"), 1):
            if PINNED.search(ln):
                pinned += 1
                continue
            if UNPINNED.search(ln):
                row = {"file": f, "line": i, "src": ln.strip()[:78]}
                unpinned.append(row)
                if CURRENCY_ADJACENT.search(ln):
                    currency.append(row)
    return {"unpinned": unpinned, "pinned_correctly": pinned, "currency_adjacent": currency}


def report(a):
    print("# Locale formatting audit\n")
    print(f"  pinned correctly (e.g. money() uses 'en-US'): {a['pinned_correctly']}")
    print(f"  UNPINNED — formats from the device locale:    {len(a['unpinned'])}")
    print(f"    of which sit beside a hardcoded currency symbol: {len(a['currency_adjacent'])}"
          "  <- highest severity\n")
    for r in a["currency_adjacent"]:
        print(f"  [CURRENCY] {r['file'].replace('src/','')}:{r['line']}")
        print(f"             {r['src']}")
    for r in a["unpinned"]:
        if r not in a["currency_adjacent"]:
            print(f"  [unpinned] {r['file'].replace('src/','')}:{r['line']}")
    print("\n> This app is English-only by design. The defect is not 'no translations',")
    print("> it is the same number rendering differently depending on whose phone it is on.")


def _demo():
    # No locale argument is the defect.
    assert UNPINNED.search("xp.toLocaleString()")
    assert UNPINNED.search("n.toLocaleString({ minimumFractionDigits: 2 })")
    # A pinned locale is correct and must never be flagged — money() does this.
    assert PINNED.search("n.toLocaleString('en-US', { minimumFractionDigits: 2 })")
    assert not UNPINNED.search("n.toLocaleString('en-US')")
    # A currency symbol adjacent to an unpinned number is the worst shape.
    assert CURRENCY_ADJACENT.search("`$${contributed.toLocaleString()}`")
    assert not CURRENCY_ADJACENT.search("`${xp.toLocaleString()} XP`")
    print("locale_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
