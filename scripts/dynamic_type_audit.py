"""Dynamic Type audit — what breaks when a user scales text up.

Body text on iOS runs 17pt at the default size and **53pt at AX5**, the largest accessibility
size. That is a 3.1x increase, and WCAG 1.4.4 Resize Text (AA) requires content stay usable at
200%. Any layout that quietly assumes body text stays near 17pt fails somewhere between those
two points, and it fails for exactly the users who need the setting.

THE THREE STATIC RISKS, and why each is a risk rather than a defect:

  numberOfLines      Truncation invisible at the default size becomes load-bearing at AX5. The
                     question is never "does it truncate" but "does what gets cut still carry
                     what the user needs" — a price, a warning, a button label. Static analysis
                     can find every site; only a human can answer that question per site.
  fixed height       A View with `height: 44` wrapping a Text is correct at 17pt and clips at
                     53pt. Paired with flexShrink/flexGrow or minHeight it is usually fine, so
                     the audit reports the pairing rather than the bare number.
  allowFontScaling   `={false}` on body content silently opts a user OUT of the setting they
                     deliberately enabled. Apple sanctions it for chrome (tab labels, nav
                     titles) where scaling would break the frame; on body copy it is a defect.

WHAT THIS CANNOT DO. Truncation and overlap are RUNTIME facts. This lane produces the worklist;
the verdict needs the simulator at AX5. Reporting a static hit as a confirmed defect would be
the same mistake as reading `width: 32` and calling it an undersized touch target.

    python3 scripts/dynamic_type_audit.py [--json]
"""
import glob
import json
import re
import sys

# Apple's published body ramp, default -> AX5. The multiplier is what layouts must survive.
BODY_DEFAULT_PT = 17.0
BODY_AX5_PT = 53.0
AX5_SCALE = BODY_AX5_PT / BODY_DEFAULT_PT  # ~3.12x
# WCAG 1.4.4 floor — content must remain usable at this much scaling.
WCAG_RESIZE = 2.0

# Styles that let a fixed-height box grow or its content shrink, so the height is not a trap.
ESCAPE_HATCHES = ("flexShrink", "flexGrow", "minHeight", "flex:", "flex ")

# A fixed height only threatens TEXT. The first version of this lane flagged 64 sites including
# 5pt progress bars, 6pt button underlines and 8pt slider tracks — none of which contain a
# glyph, all of which are correct at any type size. Reporting those as Dynamic Type risks is
# the same error as reading `width: 32` and calling it an undersized touch target.
#
# A single line of the SMALLEST text in this app (11pt) needs ~14pt of box. Below that floor a
# height cannot be wrapping text at all. Above one AX5 body line it cannot clip one either.
MIN_TEXT_BOX_PT = 20.0
TEXT_MARKERS = ("<Text", "<ThemedText", "ThemedText", "Text>")


def sources():
    return [f for f in glob.glob("src/**/*.tsx", recursive=True) if "node_modules" not in f]


def audit():
    trunc, fixed, opted_out = [], [], []
    for f in sources():
        lines = open(f, encoding="utf-8", errors="ignore").read().split("\n")
        for i, ln in enumerate(lines, 1):
            if "numberOfLines" in ln:
                m = re.search(r"numberOfLines=\{?(\d+)", ln)
                trunc.append({"file": f, "line": i, "lines": int(m.group(1)) if m else None,
                              "src": ln.strip()[:88]})
            if "allowFontScaling={false}" in ln:
                opted_out.append({"file": f, "line": i, "src": ln.strip()[:88]})
            m = re.search(r"\bheight:\s*(\d+)", ln)
            if m:
                hpt = int(m.group(1))
                # Too small to hold a glyph, or already big enough for an AX5 line: not a risk.
                if hpt < MIN_TEXT_BOX_PT or hpt >= BODY_AX5_PT:
                    continue
                ctx = "\n".join(lines[max(0, i - 6):i + 6])
                if any(h in ctx for h in ESCAPE_HATCHES):
                    continue
                if not any(t in ctx for t in TEXT_MARKERS):
                    continue  # no glyph anywhere near it
                fixed.append({"file": f, "line": i, "height": hpt, "src": ln.strip()[:88]})

    # A fixed height only traps text if text is nearby. Rank by how tight it is against AX5 body.
    for r in fixed:
        r["ax5_body_pt"] = BODY_AX5_PT
        r["fits_ax5_line"] = r["height"] >= BODY_AX5_PT

    return {
        "files": len(sources()),
        "ax5_scale": round(AX5_SCALE, 2),
        "truncation_sites": trunc,
        "fixed_heights_no_escape": fixed,
        "font_scaling_opt_outs": opted_out,
    }


def report(a):
    print(f"# Dynamic Type audit\n\n{a['files']} files · body scales {BODY_DEFAULT_PT:.0f}pt -> "
          f"{BODY_AX5_PT:.0f}pt at AX5 ({a['ax5_scale']}x) · WCAG 1.4.4 floor is {WCAG_RESIZE}x\n")

    o = a["font_scaling_opt_outs"]
    print(f"## allowFontScaling={{false}} — opts users OUT of the setting: {len(o)}")
    for r in o[:10]:
        print(f"  {r['file']}:{r['line']}  {r['src']}")
    if not o:
        print("  none  <- good; this is the one unambiguous defect class here")

    t = a["truncation_sites"]
    one_line = [r for r in t if r.get("lines") == 1]
    print(f"\n## numberOfLines — truncation that becomes load-bearing at AX5: {len(t)}")
    print(f"   of which numberOfLines={{1}} (highest risk): {len(one_line)}")
    for r in one_line[:12]:
        print(f"  {r['file']}:{r['line']}")

    fx = a["fixed_heights_no_escape"]
    tight = [r for r in fx if not r["fits_ax5_line"]]
    print(f"\n## fixed height around TEXT, no escape hatch, {MIN_TEXT_BOX_PT:.0f}-{BODY_AX5_PT:.0f}pt: {len(fx)}")
    print(f"   all of these clip before one AX5 body line: {len(tight)}")
    for r in sorted(tight, key=lambda x: x["height"])[:12]:
        print(f"  {r['height']:>4}pt  {r['file']}:{r['line']}")

    print("\n> These are a WORKLIST, not verdicts. Truncation and overlap are runtime facts;")
    print("> the simulator at AX5 decides. A static hit is a place to look, not a defect.")


def _demo():
    assert abs(AX5_SCALE - 3.12) < 0.01, "Apple's body ramp is 17 -> 53pt"
    assert AX5_SCALE > WCAG_RESIZE, "AX5 exceeds WCAG's 200% floor, so passing 200% is not enough"
    # A 44pt row fits one 17pt line comfortably and cannot fit one 53pt line.
    assert 44 < BODY_AX5_PT and 60 >= BODY_AX5_PT
    # The band must exclude decoration and already-safe boxes at both ends.
    assert 8 < MIN_TEXT_BOX_PT, "an 8pt slider track is not a text container"
    assert 60 >= BODY_AX5_PT, "a 60pt box already fits one AX5 line and is not at risk"
    print("dynamic_type_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
