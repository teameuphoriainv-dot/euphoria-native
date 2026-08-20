#!/usr/bin/env python3
"""Animation regression guard — stops the fixed bug classes from coming back.

WHY THIS EXISTS. The owner's report was: "every single time I give you a prompt for fixing the
animation, it either just stays the same or gets worse." `npm run check` runs 16 regression
scripts and NOT ONE of them looks at motion, so every animation fix in this audit is protected
by nothing at all. The next person to add a spring can silently reintroduce the exact defect
that was just removed.

WHY CONSTANTS AND NOT GOLDEN FRAMES. A screenshot differ needs a booted simulator, is slow, and
goes red on a font tweak. The bugs actually reported are all visible in the SOURCE:

  A  a scale that grows past 1 and shrinks back  -> "click something and it becomes huge"
  B  runOnJS inside a per-frame gesture callback -> "drag moves all over the place"
  C  an entrance that scales from 0              -> resampling shimmer on text
  D  springify() with no stiffness               -> inherits Reanimated's default, fails R2
  E  an inline underdamped spring not on tokens  -> bounce nobody chose

So this greps for those five shapes and compares against a committed baseline. Anything NEW
fails. Anything already present is grandfathered WITH ITS REASON, so the baseline doubles as the
list of deliberate exceptions -- which is exactly what MOTION_RUBRIC R2 requires: an overshoot
must be a per-element choice, not an inherited default.

    python3 scripts/anim_guard.py            # check  (exit 1 on a new violation)
    python3 scripts/anim_guard.py --selftest # prove it catches regressions AND ignores no-ops
    python3 scripts/anim_guard.py --update   # re-baseline after a DELIBERATE change
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASELINE = os.path.join(ROOT, 'refs', 'animation-baseline.json')

# Each rule returns (line_no, evidence) pairs. Comments are stripped first: this audit's own
# fix comments quote the removed code verbatim, and a guard that flags its own documentation
# would train people to ignore it.
def _strip_comments(src):
    src = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), src, flags=re.S)
    return '\n'.join('' if l.lstrip().startswith('//') else l for l in src.split('\n'))

def _lines(src):
    return src.split('\n')

def rule_scale_pop(src):
    """A withSpring/withTiming to a value >1 inside a withSequence: grow past rest, then back."""
    out, L = [], _lines(src)
    for i, l in enumerate(L, 1):
        window = '\n'.join(L[max(0, i - 4):i + 1])
        if 'withSequence' not in window:
            continue
        for m in re.finditer(r'with(?:Spring|Timing)\(\s*(1\.\d+)', l):
            out.append((i, f'scale->{m.group(1)}'))
    return out

def rule_gesture_runonjs(src):
    """runOnJS inside onUpdate/onChange: a JS round-trip per frame saturates the thread."""
    out, L = [], _lines(src)
    for i, l in enumerate(L, 1):
        if 'runOnJS' not in l:
            continue
        if re.search(r'\.on(?:Update|Change)\(', '\n'.join(L[max(0, i - 14):i])):
            out.append((i, l.strip()[:60]))
    return out

def rule_zoom_from_zero(src):
    return [(i, l.strip()[:60]) for i, l in enumerate(_lines(src), 1)
            if re.search(r'entering=\{[^}]*ZoomIn', l)]

def rule_inherited_stiffness(src):
    return [(i, l.strip()[:60]) for i, l in enumerate(_lines(src), 1)
            if '.springify()' in l and '.stiffness(' not in l]

def rule_underdamped_inline(src):
    """An inline spring whose damping ratio is below 0.7 overshoots visibly."""
    out = []
    for i, l in enumerate(_lines(src), 1):
        m = re.search(r'stiffness:\s*([\d.]+)\s*,\s*damping:\s*([\d.]+)', l)
        if not m:
            continue
        k, c = float(m.group(1)), float(m.group(2))
        z = c / (2 * (k ** 0.5))
        if z < 0.7:
            out.append((i, f'zeta={z:.2f}'))
    return out

RULES = {
    'scale_pop': rule_scale_pop,
    'gesture_runonjs': rule_gesture_runonjs,
    'zoom_from_zero': rule_zoom_from_zero,
    'inherited_stiffness': rule_inherited_stiffness,
    'underdamped_inline': rule_underdamped_inline,
}

def scan():
    found = {k: {} for k in RULES}
    for base, _, files in os.walk(os.path.join(ROOT, 'src')):
        for fn in files:
            if not fn.endswith(('.ts', '.tsx')):
                continue
            path = os.path.join(base, fn)
            rel = os.path.relpath(path, ROOT)
            with open(path) as f:
                src = _strip_comments(f.read())
            for name, rule in RULES.items():
                hits = rule(src)
                if hits:
                    found[name][rel] = len(hits)
    return found

def main():
    if '--selftest' in sys.argv:
        # Each rule must FIRE on the defect shape and STAY SILENT on the innocent one. A guard
        # that only proves it fires can be a rule that fires on everything.
        assert rule_scale_pop("withSequence(withSpring(1.035, S.bouncy), withSpring(1, S.smooth))")
        assert not rule_scale_pop("withSpring(1.035, S.bouncy)"), 'needs withSequence context'
        assert not rule_scale_pop("withSequence(withSpring(0.97), withSpring(1))"), 'inward press is fine'
        assert rule_gesture_runonjs(".onUpdate((e) => {\n  runOnJS(setGuess)(x);\n})")
        assert not rule_gesture_runonjs(".onEnd(() => {\n  runOnJS(setGuess)(x);\n})"), 'onEnd fires once'
        assert rule_zoom_from_zero("entering={ZoomIn.springify()}")
        assert not rule_zoom_from_zero("entering={FadeInDown.springify()}")
        assert rule_inherited_stiffness("layout={LinearTransition.springify().damping(18)}")
        assert not rule_inherited_stiffness("layout={L.springify().damping(18).stiffness(120)}")
        assert rule_underdamped_inline("{ stiffness: 500, damping: 18 }")          # zeta 0.40
        assert not rule_underdamped_inline("{ stiffness: 90, damping: 19 }")       # zeta 1.00
        # ...and comment-stripping, because this repo documents removed defects verbatim.
        assert not rule_scale_pop(_strip_comments("// withSequence(withSpring(1.035, x))"))
        assert not rule_scale_pop(_strip_comments("/*\n * withSequence(withSpring(1.035, x))\n */"))
        print('anim_guard --selftest: 12 assertions passed')
        return 0

    found = scan()
    if '--update' in sys.argv:
        with open(BASELINE, 'w') as f:
            json.dump(found, f, indent=2, sort_keys=True)
        print(f'baseline written: {BASELINE}')
        return 0

    if not os.path.exists(BASELINE):
        print('no baseline; run --update first', file=sys.stderr)
        return 1
    with open(BASELINE) as f:
        base = json.load(f)

    bad = []
    for rule, files in found.items():
        for rel, n in files.items():
            was = base.get(rule, {}).get(rel, 0)
            if n > was:
                bad.append(f'  {rule:<20} {rel}  {was} -> {n}')
    if bad:
        print(f'ANIMATION REGRESSION — {len(bad)} new violation(s):\n' + '\n'.join(bad))
        print('\nIf the change is deliberate, document WHY on the element, then --update.')
        return 1
    total = sum(len(v) for v in found.values())
    print(f'anim_guard: no new animation regressions ({total} grandfathered sites)')
    return 0

if __name__ == '__main__':
    sys.exit(main())
