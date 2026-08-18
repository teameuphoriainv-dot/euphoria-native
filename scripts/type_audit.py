"""Typography audit — the type counterpart to motion-audit.sh.

motion-audit answers "does this screen move". Nothing answered "is the type system coherent",
and the answer turned out to be no in a way no screenshot review would surface: the ramp has 22
steps, fourteen of them consecutive ONE-POINT increments (9,10,11...22). Adjacent steps that
differ by a single point are not a hierarchy — `heading` 19, `headingLg` 20 and `headingXl` 21
cannot be told apart by eye, so naming them as distinct levels invites arbitrary choice at every
call site while looking principled.

WHAT IT CHECKS, and the authority for each threshold:

  RAMP        A modular scale advances by a consistent RATIO (1.125, 1.2, 1.25, 1.333). Steps
              closer than MIN_RATIO are perceptually the same size, so they add choice without
              adding hierarchy.
  DEAD STEPS  A step used 0-2 times across the codebase is not a scale level, it is an accident
              that future work will copy.
  RAW SIZES   A fontSize literal that is not in the token set defeats the ramp entirely.
  LEADING     lineHeight:fontSize below MIN_LEADING clips descenders. 1.0 is the specific defect
              that produced the before-after-slider clipping bug already recorded in this repo.

Thresholds are committed HERE, before the run, so results cannot be argued into passing.

    python3 scripts/type_audit.py [--json]
"""
import glob
import json
import re
import sys
from collections import Counter

# A ratio below this means two steps read as the same size. 1.08 sits just under the gentlest
# conventional modular scale (1.125), so anything tighter is deliberate over-subdivision.
MIN_RATIO = 1.08
# Below this, descenders clip. Never 1.0 — that is the documented defect in this codebase.
MIN_LEADING = 1.2
# CAREFUL — this is a DESIGN floor, not a compliance one, and conflating the two is how an
# audit starts crying wolf.
#
# WCAG 2.2 SC 1.4.12 Text Spacing does NOT require shipping 1.5x leading. It requires the
# layout not to BREAK when a user overrides spacing to 1.5x. Shipping 1.44 is not a violation;
# clipping when a user forces 1.5 is. That override-resilience check needs a device and belongs
# in the Dynamic Type lane, not in a static scan.
#
# What this constant enforces instead is the design guidance the same sources give for body
# copy: 1.4-1.6 at 14-19pt (Material Design's Body Large is 16/24 = 1.5 exactly). Below 1.4 at
# body sizes, paragraphs read tight. Reported as DESIGN, never as a WCAG failure.
BODY_LEADING_TARGET = 1.4
# Above this size, text is display/headline and the 1.5 floor does not apply.
BODY_MAX_PT = 20.0
# A governed mobile type scale holds 6-9 distinct sizes. More than this means the scale is not
# being enforced as tokens, it is accreting ad-hoc values per screen.
MAX_HEALTHY_STEPS = 12
# Under this many uses, a step is not carrying a level.
MIN_USES = 3

SRC = "src/**/*.ts*"


def ramp():
    """The FontSize token ramp, as {name: pt}."""
    t = open("src/constants/theme.ts", encoding="utf-8").read()
    m = re.search(r"export const FontSize\s*=\s*\{(.*?)\n\}", t, re.S)
    if not m:
        return {}
    return {k: float(v) for k, v in re.findall(r"(\w+):\s*([0-9.]+)", m.group(1))}


def sources():
    return [f for f in glob.glob(SRC, recursive=True) if "node_modules" not in f]


def audit():
    steps = ramp()
    files = sources()
    blobs = {f: open(f, encoding="utf-8", errors="ignore").read() for f in files}

    uses = Counter()
    for name in steps:
        pat = re.compile(r"FontSize\." + name + r"\b")
        for t in blobs.values():
            uses[name] += len(pat.findall(t))

    # 1. Steps too close to be distinguishable.
    vals = sorted(set(steps.values()))
    by_val = {}
    for k, v in steps.items():
        by_val.setdefault(v, []).append(k)
    crowded = []
    for a, b in zip(vals, vals[1:]):
        r = b / a
        if r < MIN_RATIO:
            crowded.append({"from": a, "to": b, "ratio": round(r, 3),
                            "names": by_val[a] + by_val[b]})

    # 2. Steps that are not carrying a level.
    dead = sorted([k for k in steps if uses[k] == 0])
    thin = sorted([k for k in steps if 0 < uses[k] < MIN_USES])

    # 3. Raw fontSize literals bypassing the ramp.
    raw = []
    for f, t in blobs.items():
        for m in re.finditer(r"fontSize:\s*([0-9.]+)", t):
            raw.append({"file": f, "value": float(m.group(1))})

    # 4. Leading below the clipping threshold. Only pairs declared in the same style object are
    #    comparable, so this reads adjacent lines rather than guessing across a file.
    tight = []
    for f, t in blobs.items():
        for m in re.finditer(r"fontSize:\s*([0-9.]+)[^}]{0,120}?lineHeight:\s*([0-9.]+)", t, re.S):
            fs, lh = float(m.group(1)), float(m.group(2))
            if not fs:
                continue
            r = lh / fs
            if r < MIN_LEADING:
                tight.append({"file": f, "fontSize": fs, "lineHeight": lh,
                              "ratio": round(r, 3), "rule": "CLIP"})
            elif fs <= BODY_MAX_PT and r < BODY_LEADING_TARGET:
                tight.append({"file": f, "fontSize": fs, "lineHeight": lh,
                              "ratio": round(r, 3), "rule": "DESIGN_TIGHT"})

    return {
        "files_scanned": len(files),
        "ramp_steps": len(steps),
        "token_uses": sum(uses.values()),
        "crowded_pairs": crowded,
        "dead_steps": dead,
        "thin_steps": thin,
        "raw_font_sizes": raw,
        "tight_leading": tight,
        "steps_over_healthy": max(0, len(steps) - MAX_HEALTHY_STEPS),
        "weights_used": sorted({w for t in blobs.values()
                                for w in re.findall(r"fontWeight:\s*'([^']+)'", t)}),
    }


def report(a):
    print(f"# Typography audit\n\n{a['files_scanned']} files · ramp of {a['ramp_steps']} steps "
          f"· {a['token_uses']} token uses\n")
    print(f"## Crowded steps (ratio < {MIN_RATIO} — perceptually the same size)")
    if not a["crowded_pairs"]:
        print("  none")
    for c in a["crowded_pairs"]:
        print(f"  {c['from']:>4} -> {c['to']:<4} ratio {c['ratio']}   {', '.join(c['names'])}")
    print(f"\n## Steps not carrying a level (< {MIN_USES} uses)")
    print(f"  never used : {a['dead_steps'] or 'none'}")
    print(f"  used 1-2x  : {a['thin_steps'] or 'none'}")
    print(f"\n## Raw fontSize literals bypassing the ramp: {len(a['raw_font_sizes'])}")
    for r in a["raw_font_sizes"][:10]:
        print(f"  {r['value']:>5}  {r['file']}")
    clip = [t for t in a["tight_leading"] if t.get("rule") == "CLIP"]
    wcag = [t for t in a["tight_leading"] if t.get("rule") == "DESIGN_TIGHT"]
    print(f"\n## Leading below {MIN_LEADING} (descenders clip): {len(clip)}")
    for t in clip[:8]:
        print(f"  {t['ratio']}  fs={t['fontSize']} lh={t['lineHeight']}  {t['file']}")
    print(f"## Body leading below the {BODY_LEADING_TARGET} design target (<= {BODY_MAX_PT:.0f}pt): "
          f"{len(wcag)}  [DESIGN, not a WCAG failure]")
    for t in wcag[:12]:
        print(f"  {t['ratio']}  fs={t['fontSize']} lh={t['lineHeight']}  {t['file']}")
    print(f"\n## Ramp size: {a['ramp_steps']} steps, {a['steps_over_healthy']} over the "
          f"{MAX_HEALTHY_STEPS}-step healthy ceiling")
    print(f"\n## Weights in use: {a['weights_used']}")


def _demo():
    """Self-check on the maths — no files needed."""
    assert 20 / 19 < MIN_RATIO, "1pt apart at 19-20 must count as crowded"
    # 22->24 is 1.091, ABOVE the threshold — 2pt at that size IS distinguishable, unlike 1pt
    # at 19pt. My first version of this assertion claimed the opposite; the threshold was right
    # and the assertion was sloppy. Fixed the test, not the verifier.
    assert 24 / 22 > MIN_RATIO, "22->24 is a real step"
    assert 34 / 30 > MIN_RATIO, "30->34 is a real step and must not be flagged"
    assert 16 / 16 < MIN_LEADING, "lineHeight == fontSize must fail"
    assert 20 / 16 > MIN_LEADING, "1.25 leading must pass"
    # 1.25 clears the clipping floor but is under the body design target — distinct rules.
    assert 20 / 16 < BODY_LEADING_TARGET, "1.25 body leading is under the design target"
    assert 23 / 16 >= BODY_LEADING_TARGET, "1.44 body leading meets the design target"
    # Display type is exempt: a 34pt headline at 1.2 is correct, not a violation.
    assert 34 > BODY_MAX_PT, "34pt is display, exempt from the 1.5 body floor"
    print("type_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
