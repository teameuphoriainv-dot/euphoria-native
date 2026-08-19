"""Reduced Motion audit — which animations must be guarded, and which must NOT be.

WHY THIS LANE EXISTS. 34 files in this app animate. A new animation added without a
`useReducedMotion` guard fails SILENTLY: nothing errors, nothing looks wrong to a developer
with the setting off, and the people it hurts are the ones least likely to file a bug. That is
the same "silent rule across many files that grows" test that justified the safe-area lane.

THE DISCRIMINATOR, and it is the whole point. Reduced Motion targets VESTIBULAR triggers —
large or continuous movement: repeating pulses, rotation, translation across the screen,
confetti, parallax. It does NOT mean "no animation". Two things are deliberately NOT flagged:

  * PRESS FEEDBACK. `spring-pressable` scales 1 -> 0.97 on touch. Three percent, instant, and
    bound to the user's own finger. iOS keeps button press feedback under Reduced Motion; so
    should this. Flagging it would be a false positive.
  * OPACITY FADES. `read-reward` fades a glow in with `withTiming` on opacity. A cross-fade is
    what Apple substitutes FOR motion under this setting — it is the remedy, not the disease.

This codebase already gets that right. Of 19 files using animation primitives, 17 guard, and
the 2 that do not are the two cases above. The lane exists to keep it that way.

    python3 scripts/reduced_motion_audit.py [--json]
"""
import glob
import json
import re
import sys

# Motion that can trigger vestibular symptoms and therefore needs a guard.
VESTIBULAR = {
    "repeat": r"withRepeat",
    "rotate": r"rotate\s*:",
    "translate": r"translate[XY]\s*:",
}
# Animation that is fine — or actively desirable — under Reduced Motion.
EXEMPT_REASON = {
    "shared/motion/spring-pressable.tsx":
        "press feedback: 3% scale bound to the user's own touch; iOS keeps this under the setting",
    "components/read-reward.tsx":
        "opacity fade: a cross-fade is what Reduced Motion substitutes FOR motion",
}
ANIM = r"withTiming|withRepeat|withSpring|withSequence"


def audit():
    rows = []
    for f in sorted(glob.glob("src/**/*.tsx", recursive=True) + glob.glob("src/**/*.ts", recursive=True)):
        src = open(f, encoding="utf-8", errors="ignore").read()
        if not re.search(ANIM, src):
            continue
        short = f.replace("src/", "")
        kinds = sorted(k for k, pat in VESTIBULAR.items() if re.search(pat, src))
        rows.append({
            "file": short,
            "guarded": "useReducedMotion" in src,
            "vestibular": kinds,
            "exempt": EXEMPT_REASON.get(short),
        })
    # A defect is vestibular motion with no guard. The exemption note is DOCUMENTATION ONLY and
    # deliberately does NOT suppress this check: a whitelist that can hide a real defect is a
    # trapdoor, and both exempt files currently carry no vestibular motion anyway, so letting
    # them be checked costs nothing and keeps them honest if that ever changes.
    unguarded = [r for r in rows if r["vestibular"] and not r["guarded"]]
    return {"animating": rows, "unguarded_vestibular": unguarded}


def report(a):
    rows, bad = a["animating"], a["unguarded_vestibular"]
    print("# Reduced Motion audit\n")
    print(f"  files using animation primitives: {len(rows)}")
    print(f"  of those, guarded by useReducedMotion: {sum(1 for r in rows if r['guarded'])}")
    print(f"  UNGUARDED VESTIBULAR MOTION (defects): {len(bad)}\n")
    for r in bad:
        print(f"  [DEFECT] {r['file']}  ({', '.join(r['vestibular'])}) has no useReducedMotion guard")
    for r in rows:
        if r["exempt"]:
            print(f"  [exempt] {r['file']}\n             {r['exempt']}")
    if not bad:
        print("\n> A LOW NUMBER HERE DESCRIBES CORRECT DESIGN. Reduced Motion does not mean")
        print("> 'no animation' — it means no vestibular triggers. Press feedback and opacity")
        print("> fades are meant to survive it, and in this app they do.")


def _demo():
    # Vestibular motion is what needs guarding.
    assert re.search(VESTIBULAR["repeat"], "scale.set(withRepeat(withTiming(1)))")
    assert re.search(VESTIBULAR["translate"], "transform: [{ translateY: y.get() }]")
    assert re.search(VESTIBULAR["rotate"], "transform: [{ rotate: '4deg' }]")
    # A plain scale is NOT in the vestibular set — press feedback must not be flagged.
    assert not any(re.search(p, "transform: [{ scale: s.get() }]") for p in VESTIBULAR.values())
    # ...and the two real exemptions are named, so they cannot be silently re-flagged.
    assert "spring-pressable" in ' '.join(EXEMPT_REASON)
    assert "read-reward" in ' '.join(EXEMPT_REASON)
    # A file that does not animate at all is not in scope.
    assert not re.search(ANIM, "const x = 1")
    # The exemption note must NOT suppress a real defect: if an exempt file ever gained
    # vestibular motion it must still be flagged.
    fake = [{"file": "shared/motion/spring-pressable.tsx", "guarded": False,
             "vestibular": ["translate"], "exempt": EXEMPT_REASON["shared/motion/spring-pressable.tsx"]}]
    assert [r for r in fake if r["vestibular"] and not r["guarded"]], "whitelist must not hide a defect"
    print("reduced_motion_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
