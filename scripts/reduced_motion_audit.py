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
    # ONLY NON-LITERAL VALUES. `rotate: '-4deg'` and `translateX: -13` are STATIC layout --
    # a card pinned at an angle, a thumb offset by half its width -- and they never move. Matching
    # the property name alone flagged three files whose only animation is an opacity fade, and an
    # opacity fade is what Reduced Motion SUBSTITUTES for motion. Widening this lane to catch
    # `entering=` briefly traded a false negative for three false positives; a literal value is
    # the discriminator, because an animated transform must read from a shared value.
    # NOTE the \s* sits INSIDE each lookahead. Outside it, the engine backtracks the
    # whitespace, evaluates the lookahead at the space, fails to see a number there, and the
    # NEGATION therefore succeeds -- so every static transform still matched.
    "rotate": r"rotate\s*:(?!\s*['\"`]?-?[\d.]+deg)",
    "translate": r"translate[XY]\s*:(?!\s*-?[\d.]+\s*[,}])",
    # WIDENED 2026-08-19. Reanimated's PRESET layout animations move or scale a whole view and
    # are every bit as vestibular as a hand-rolled translate -- ZoomIn grows a view from scale 0,
    # SlideIn sweeps it across the screen. They were invisible to this lane because they are
    # declarative: they never call withTiming/withSpring, so the ANIM gate below skipped the file
    # before any check ran. tap-reveal.tsx shipped an unguarded ZoomIn through exactly that hole.
    "layout-preset": r"\b(Zoom|Slide|Flip|Bounce|Lightspeed|Rotate|Stretch)(In|Out)\w*",
}
# Animation that is fine — or actively desirable — under Reduced Motion.
EXEMPT_REASON = {
    "shared/motion/spring-pressable.tsx":
        "press feedback: 3% scale bound to the user's own touch; iOS keeps this under the setting",
    "components/read-reward.tsx":
        "opacity fade: a cross-fade is what Reduced Motion substitutes FOR motion",
}
# WIDENED 2026-08-19. `entering=` / `exiting=` / `layout=` are animation, and a file can use
# them without ever calling a with* helper. Missing them made this lane report 0 defects on a
# component that had one -- a lane that UNDER-reports is worse than one that over-reports,
# because a clean report is read as proof.
# WIDENED 2026-08-24. A file can rotate a view every frame with useAnimatedStyle reading a shared
# value and never call a with* helper or use a declarative prop -- budget-balancer.tsx does exactly
# that, and this lane could not see it. Same hole shape as the tap-reveal.tsx ZoomIn: the gate below
# skipped the file before any check ran.
ANIM = r"withTiming|withRepeat|withSpring|withSequence|entering\s*=|exiting\s*=|layout\s*=|useAnimatedStyle"



def selftest():
    """Prove the lane can still CATCH a defect before its zero is believed.

    This lane has reported a false zero once already: it matched only with*/rotate/translate and
    so never scanned files that animate declaratively via `entering=`, which is how an unguarded
    ZoomIn shipped in tap-reveal.tsx. Widening it then produced three FALSE POSITIVES, because
    matching a property NAME cannot tell `rotate: '-4deg'` (a card pinned at an angle, forever)
    from a rotation driven by a shared value.

    So a zero from this lane means nothing on its own. These fixtures are the evidence that a
    zero is real, and they are asserted rather than eyeballed.
    """
    must_flag = [
        ("animated rotate",    "const s=useAnimatedStyle(()=>({transform:[{rotate:`${r.get()}deg`}]}));"),
        ("animated translate", "const s=useAnimatedStyle(()=>({transform:[{translateX: x.get()}]}));"),
        ("repeat",             "v.set(withRepeat(withTiming(1,{duration:900}),-1,true));"),
        ("zoom preset",        "<Animated.View entering={ZoomIn.springify()} />"),
    ]
    must_ignore = [
        ("static rotate",    "card: { transform: [{ rotate: '-4deg' }] },"),
        ("static translateX","thumb: { transform: [{ translateX: -13 }] },"),
        ("fade preset",      "<Animated.View entering={FadeIn} exiting={FadeOut} />"),
        # THE FALSE POSITIVE THIS LANE ACTUALLY SHIPPED: a comment that names the preset it
        # removed. money-2048.tsx read "This was ZoomIn and BOTH gates caught it" and was
        # reported as an unguarded defect for its own changelog.
        ("preset in a line comment",  "// FADE, NOT ZOOM. This was ZoomIn and both gates caught it"),
        ("preset in a block comment", "/* was SlideInLeft, replaced with a fade */"),
        ("url that looks like one",   "// see https://example.com/x -- keeps strings intact"),
    ]
    kinds = vestibular_kinds
    for label, src in must_flag:
        assert kinds(src), f"lane MISSED {label}: {src}"
    for label, src in must_ignore:
        assert not kinds(src), f"lane FALSE-POSITIVED on {label}: {kinds(src)}"
    print(f"self-check OK — {len(must_flag)} defect shapes caught, {len(must_ignore)} static shapes ignored")


# STRIP COMMENTS BEFORE MATCHING. money-2048.tsx was reported as a defect for a ZoomIn that
# lived in a COMMENT explaining an already-fixed ZoomIn -- the lane matched its own documentation
# and named a clean file. Strings are consumed first so a "https://..." URL is never read as a
# line comment. ponytail: no JS regex-literal handling; a bare /re/ with a // inside could still
# confuse it, which costs a false NEGATIVE only in a file that has no other vestibular match.
_TOKENS = re.compile(r"""
    "(?:\\.|[^"\\])*"    |
    '(?:\\.|[^'\\])*'    |
    `(?:\\.|[^`\\])*`    |
    //[^\n]*              |
    /\*.*?\*/
""", re.S | re.X)


def strip_comments(src):
    return _TOKENS.sub(lambda m: "" if m.group(0)[:2] in ("//", "/*") else m.group(0), src)


def vestibular_kinds(src):
    """One matcher, used by both the audit and its self-check, so they cannot drift."""
    code = strip_comments(src)
    return sorted(k for k, pat in VESTIBULAR.items() if re.search(pat, code))


def audit():
    rows = []
    for f in sorted(glob.glob("src/**/*.tsx", recursive=True) + glob.glob("src/**/*.ts", recursive=True)):
        src = open(f, encoding="utf-8", errors="ignore").read()
        code = strip_comments(src)
        if not re.search(ANIM, code):
            continue
        short = f.replace("src/", "")
        kinds = vestibular_kinds(src)
        rows.append({
            "file": short,
            "guarded": "useReducedMotion" in code,
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
    # An ANIMATED rotate reads from a shared value, so the lane must flag it...
    assert re.search(VESTIBULAR["rotate"], "transform: [{ rotate: spin.get() }]")
    # ...and a LITERAL degree value is static layout, so it must not. This assertion asserted the
    # OPPOSITE and had failed on every run since the lane was narrowed to non-literal values --
    # invisible because --demo was in no script. Both directions are pinned so it cannot drift back.
    assert not re.search(VESTIBULAR["rotate"], "transform: [{ rotate: '4deg' }]")
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
    if "--selftest" in sys.argv:
        selftest()
        sys.exit(0)
    if "--demo" in sys.argv:
        _demo()
    else:
        # RUN THE SELF-CHECKS ON THE DEFAULT PATH. --selftest and --demo were never wired into
        # `npm run check`, so nothing invoked them: _demo's rotate assertion contradicted the
        # pattern it guards and had been failing in silence. A check nothing runs is not a check.
        selftest()
        _demo()
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
        # EXIT NON-ZERO ON A DEFECT. This printed [DEFECT] and returned 0 for its whole life, so
        # `npm run check` chained straight past it with && and money-2048.tsx's unguarded
        # layout-preset shipped. A check that cannot fail the gate is decoration, not a gate.
        sys.exit(1 if a["unguarded_vestibular"] else 0)
