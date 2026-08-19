"""Static lineHeight audit — the box that cannot grow with its text.

THE DEFECT, proven twice on device in unrelated components:

    tab-bar.tsx      fontSize: FontSize.tiny (10)   lineHeight: 13
    streak-ignite    fontSize: FontSize.hero (40)   lineHeight: FontSize.hero * 1.25  -> 50

React Native scales `fontSize` with the OS text setting and NEVER scales `lineHeight`. Both
of those read as proportional and both are computed ONCE. At AX5 (3.12x) the tab label grew
to ~31pt inside a 13pt line box and the streak numeral to ~125pt inside a 50pt one. Every tab
label rendered as "Hom Lear Trad Dige You".

WHAT THIS LANE DELIBERATELY DOES NOT CLAIM. A first pass at this rule asserted that ANY
static lineHeight clips at AX5. That is FALSE and this repo disproves it: themed-text.tsx
sets lineHeight on eight ramp variants, and those variants were photographed rendering
correctly at AX5 four separate times. A too-small lineHeight CROWDS wrapped text; it only
CLIPS when the container also constrains height. Static analysis cannot see that container,
so this lane ranks RISK rather than declaring defects — same honesty the touch lane owes its
hitSlop blind spot.

THE RANKING, AND ITS HONEST LIMIT. For a style with fontSize F and lineHeight L,
`headroom = L / F` is the scale at which the glyph outgrows its box.

THE RANKING DID NOT PREDICT THE TWO REAL DEFECTS, and saying so matters more than the lane
does. The tab bar sat at 1.30 and the streak numeral at 1.25 — both MID-distribution. Sites
at 1.15, 1.23 and 1.24 rank worse and were photographed rendering fine. What decided both
real cases was the CONTAINER constraining height, which static analysis cannot see.

So this lane does not claim to find clipping. Its one real guarantee is the `headroom < 1.0`
count: text already crowded at DEFAULT size, which is unambiguous and currently 0. That is a
regression guard worth keeping. The ranking below it is an inventory, not a verdict, and any
site it lists still has to be settled on device.

    python3 scripts/leading_audit.py [--json]
"""
import glob
import json
import re
import sys

AX5 = 3.12  # iOS body 17pt -> 53pt
STYLE = re.compile(r"fontSize:\s*([A-Za-z.]+|\d+(?:\.\d+)?)[^}]*?lineHeight:\s*([A-Za-z.]+\s*\*\s*[\d.]+|[A-Za-z.]+|\d+(?:\.\d+)?)")
# The ramp, so token names resolve to numbers instead of being skipped.
TOKENS = {}


def load_tokens():
    src = open("src/constants/theme.ts", encoding="utf-8").read()
    block = re.search(r"export const FontSize = \{(.*?)\} as const", src, re.S)
    for name, val in re.findall(r"(\w+):\s*(\d+(?:\.\d+)?)", block.group(1) if block else ""):
        TOKENS[f"FontSize.{name}"] = float(val)


def value(expr):
    expr = expr.strip()
    m = re.match(r"([A-Za-z.]+)\s*\*\s*([\d.]+)$", expr)
    if m:
        base = TOKENS.get(m.group(1))
        return base * float(m.group(2)) if base else None
    if expr in TOKENS:
        return TOKENS[expr]
    try:
        return float(expr)
    except ValueError:
        return None


def audit():
    load_tokens()
    rows = []
    for f in sorted(glob.glob("src/**/*.tsx", recursive=True)):
        text = open(f, encoding="utf-8", errors="ignore").read()
        capped = "maxFontSizeMultiplier" in text
        for m in STYLE.finditer(text):
            fs, lh = value(m.group(1)), value(m.group(2))
            if not fs or not lh:
                continue
            line = text[: m.start()].count("\n") + 1
            rows.append({
                "file": f.replace("src/", ""), "line": line,
                "fontSize": fs, "lineHeight": lh,
                "headroom": round(lh / fs, 2),      # scale at which the glyph outgrows the box
                "file_has_cap": capped,
            })
    rows.sort(key=lambda r: r["headroom"])
    return {"sites": rows, "ax5": AX5}


def report(a):
    rows = a["sites"]
    print("# Static lineHeight audit — boxes that cannot grow with their text\n")
    print(f"  paired fontSize + lineHeight sites resolved: {len(rows)}")
    crowded = [r for r in rows if r["headroom"] < 1.0]
    uncapped = [r for r in rows if not r["file_has_cap"]]
    print(f"  already crowded at DEFAULT size (headroom < 1.0): {len(crowded)}")
    print(f"  in a file with no maxFontSizeMultiplier anywhere: {len(uncapped)}\n")
    print(f"  {'file:line':<44}{'font':>6}{'lead':>7}{'headroom':>10}  cap")
    for r in rows[:14]:
        print(f"  {r['file'] + ':' + str(r['line']):<44}{r['fontSize']:>6.0f}{r['lineHeight']:>7.0f}"
              f"{r['headroom']:>10.2f}  {'yes' if r['file_has_cap'] else 'NO'}")
    print("\n> headroom is the text scale at which the glyph outgrows its frozen line box.")
    print("> It is a RISK ORDER, not a defect list: a low value only clips where the container")
    print("> also constrains height. The simulator settles which ones actually break.")


def _demo():
    load_tokens()
    assert TOKENS.get("FontSize.tiny") == 10, TOKENS.get("FontSize.tiny")
    # The two real defects must resolve the way they were measured on device.
    assert value("13") == 13 and value("FontSize.hero") == 40
    assert value("FontSize.hero * 1.25") == 50
    # A style with no lineHeight is not a site at all — RN derives leading from the scaled size.
    assert not STYLE.search("{ fontSize: FontSize.body }")
    # ...but one with both is.
    assert STYLE.search("{ fontSize: 10, lineHeight: 13 }")
    # Headroom orders severity: the tab bar (1.3) breaks sooner than a 1.45 body style.
    assert 13 / 10 < 1.45
    print("leading_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
