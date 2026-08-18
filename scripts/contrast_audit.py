"""WCAG contrast audit over the theme palette.

Contrast carries the largest single weight in a professional typography/UI scorecard (20 of 100)
because it is the one property where failure is a compliance issue rather than a matter of taste.
It is also the one no screenshot review reliably catches: a pairing can look fine to a sighted
reviewer on a good display and still fail 4.5:1.

THRESHOLDS — WCAG 2.2, committed here before any run:

  1.4.3 Contrast (Minimum), AA   normal text 4.5:1 · large text 3:1
  1.4.6 Contrast (Enhanced), AAA normal text 7:1   · large text 4.5:1
  1.4.11 Non-text Contrast, AA   UI component boundaries and meaningful icons 3:1

  "Large text" is >=18pt regular OR >=14pt bold. Below that it is normal text and must clear the
  stricter ratio.

WHY EVERY PAIR AND NOT THE VISIBLE ONES. Dark themes characteristically have secondary and muted
text colours that pass against the base background and fail against a lighter card or elevated
surface. Auditing only what someone happened to look at is how those survive to production, so
this enumerates the full cross product and reports it.

A NOTE THE NUMBERS DO NOT CAPTURE. Pure #FFFFFF on pure #000000 is 21:1 and clears every
threshold, yet is a known readability defect on OLED — halation makes strokes bloom. Passing is
the floor, not the goal.

FINDING, 2026-08-18 — read before "fixing" the primary button.

  primaryForeground #FFFFFF on primary #A855EB = 4.07:1

That is BELOW the 4.5:1 AA floor for normal text and would look like a violation on every CTA
in the app. It is not one, and the reason matters: ui/button.tsx renders its label with
type="heading", which resolves to Fonts.heading — DM Sans BOLD — at FontSize.bodyLg (17pt).
WCAG counts >=14pt bold as LARGE text, so the applicable floor is 3:1 and 4.07 clears it.

It clears it by 0.43. If anyone ever sets that label to a regular weight, or drops it below
14pt, the same colours silently become a real AA failure on every primary action in the product.
That is a risk to watch, not a defect to fix, and the distinction is the difference between a
useful audit and one that cries wolf.

    python3 scripts/contrast_audit.py [--json]
"""
import json
import re
import sys

AA_NORMAL = 4.5
AA_LARGE = 3.0
AAA_NORMAL = 7.0

# Which palette keys are text vs. surfaces. Anything not listed is reported as a UI/icon colour
# and held to the 3:1 non-text floor instead.
TEXT_KEYS = {"text", "textSecondary", "mutedForeground", "primaryForeground", "foreground"}
SURFACE_KEYS = {"background", "card", "cardElevated", "backgroundElement", "backgroundSelected",
                "chip", "border", "primary"}


def palette(theme="dark"):
    src = open("src/constants/theme.ts", encoding="utf-8").read()
    m = re.search(theme + r":\s*\{(.*?)\n\s{2}\}", src, re.S)
    if not m:
        return {}
    return {k: v for k, v in re.findall(r"(\w+):\s*'(#[0-9A-Fa-f]{6})'", m.group(1))}


def _lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color):
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def audit(theme="dark"):
    pal = palette(theme)
    texts = {k: v for k, v in pal.items() if k in TEXT_KEYS}
    surfaces = {k: v for k, v in pal.items() if k in SURFACE_KEYS}
    # Anything that is neither is treated as an icon/accent held to the non-text floor.
    others = {k: v for k, v in pal.items() if k not in TEXT_KEYS and k not in SURFACE_KEYS}

    rows = []
    for tk, tv in sorted(texts.items()):
        for sk, sv in sorted(surfaces.items()):
            r = ratio(tv, sv)
            rows.append({
                "fg": tk, "fg_hex": tv, "bg": sk, "bg_hex": sv, "ratio": round(r, 2),
                "aa_normal": r >= AA_NORMAL, "aa_large": r >= AA_LARGE, "aaa_normal": r >= AAA_NORMAL,
            })

    icons = []
    for ik, iv in sorted(others.items()):
        for sk, sv in sorted(surfaces.items()):
            if sk == "primary":
                continue  # an accent on itself is not a real pairing
            r = ratio(iv, sv)
            icons.append({"fg": ik, "bg": sk, "ratio": round(r, 2), "non_text_aa": r >= AA_LARGE})

    return {"theme": theme, "text_pairs": rows, "icon_pairs": icons,
            "palette_size": len(pal)}


def report(a):
    rows = a["text_pairs"]
    fail_n = [r for r in rows if not r["aa_normal"]]
    fail_l = [r for r in rows if not r["aa_large"]]
    print(f"# Contrast audit ({a['theme']} theme, {a['palette_size']} colours)\n")
    print(f"## Text pairings: {len(rows)} checked")
    print(f"  fail AA normal (<{AA_NORMAL}:1) : {len(fail_n)}")
    print(f"  fail AA large  (<{AA_LARGE}:1)  : {len(fail_l)}   <- these fail at ANY size")
    print(f"  pass AAA       (>={AAA_NORMAL}:1): {sum(1 for r in rows if r['aaa_normal'])}\n")
    print(f"  {'fg':<19}{'bg':<20}{'ratio':>7}  AAnorm AAlarge")
    for r in sorted(rows, key=lambda x: x["ratio"]):
        print(f"  {r['fg']:<19}{r['bg']:<20}{r['ratio']:>7}  "
              f"{'PASS' if r['aa_normal'] else 'FAIL':<7}{'PASS' if r['aa_large'] else 'FAIL'}")
    bad_icons = [i for i in a["icon_pairs"] if not i["non_text_aa"]]
    print(f"\n## Icon / accent pairings failing 1.4.11 non-text (<{AA_LARGE}:1): {len(bad_icons)}")
    for i in sorted(bad_icons, key=lambda x: x["ratio"])[:12]:
        print(f"  {i['fg']:<19}{i['bg']:<20}{i['ratio']:>7}")


def _demo():
    """Self-check against values WCAG itself publishes, so the formula cannot drift."""
    assert round(ratio("#FFFFFF", "#000000"), 1) == 21.0, "white on black must be 21:1"
    assert round(ratio("#000000", "#000000"), 1) == 1.0, "a colour on itself must be 1:1"
    # WebAIM's canonical worked example: #777777 on #FFFFFF is 4.48:1 — just UNDER AA normal.
    r = ratio("#777777", "#FFFFFF")
    assert 4.4 < r < 4.6, f"#777 on white should be ~4.48, got {r}"
    assert r < AA_NORMAL, "4.48 must fail AA normal — the threshold is a floor, not a target"
    assert r >= AA_LARGE, "4.48 must still pass AA large"
    # Symmetry: contrast does not care which is foreground.
    assert abs(ratio("#A855EB", "#09090D") - ratio("#09090D", "#A855EB")) < 1e-9
    print("contrast_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
