#!/usr/bin/env python3
"""
Certify every ranked route against the static anchors in refs/LOOP_GOAL.md (criterion 3a).

Static half only — lineHeight ratio, primary-as-small-text contrast, touch-target size.
The two runtime halves are NOT covered here and must still be run:
  criterion 4  ./scripts/sim.sh screen <route>   -> zero unlabelled interactive elements
  criterion 3b a device measurement per fix, before -> after

Exit 1 on any defect, so it can gate a commit hook.
"""
import re, os, sys

SCALE = {'display':40,'title':32,'heading':25,'body':23,'bodyMedium':23,'small':18,'smallBold':18,'label':14}
# primary #A855EB measures 4.48:1 on `card` — under WCAG AA 4.5 for text that is not "large".
SMALL_TYPES = ('small','smallBold','body','bodyMedium','label','heading')

ROUTES = [('home','src/app/(tabs)/home.tsx'),('learn','src/app/(tabs)/learn.tsx'),
 ('lesson','src/app/lesson.tsx'),('digest','src/app/(tabs)/digest.tsx'),
 ('you','src/app/you.tsx'),('trade','src/app/(tabs)/trade.tsx'),
 ('courses','src/app/courses.tsx'),('settings','src/app/settings/[section].tsx'),
 ('league','src/app/league.tsx'),('friends','src/app/friends.tsx'),
 ('games','src/app/(tabs)/games.tsx'),('stock','src/app/stock/[sym].tsx'),
 ('explore/compound','src/app/explore/compound.tsx'),('welcome','src/app/welcome.tsx'),
 ('auth','src/app/auth.tsx'),('start','src/app/start.tsx'),('index','src/app/index.tsx'),
 ('onboarding','src/app/onboarding.tsx')]

def boxes(src):
    out = {}
    for mo in re.finditer(r'(\w+):\s*\{([^{}]*)\}', src):
        b = mo.group(2)
        w, h, mh = (re.search(p, b) for p in (r'\bwidth:\s*(\d+)', r'\bheight:\s*(\d+)', r'minHeight:\s*(\d+)'))
        d = min(int(w.group(1)), int(h.group(1))) if (w and h) else (int(h.group(1)) if h else (int(mh.group(1)) if mh else None))
        if d is not None and d < 44:
            out[mo.group(1)] = d
    return out

def sheet_fonts(src):
    out = {}
    for mo in re.finditer(r'(\w+):\s*\{([^{}]*)\}', src):
        fs = re.search(r'fontSize:\s*(\d+)', mo.group(2))
        if fs:
            out[mo.group(1)] = (int(fs.group(1)), 'lineHeight' in mo.group(2))
    return out

def audit(path):
    s = open(path).read()
    sheet, dims = sheet_fonts(s), boxes(s)
    lh = con = touch = 0
    for mo in re.finditer(r'<ThemedText\b([^>]*)>', s, re.S):
        a = mo.group(1)
        t = re.search(r'type="(\w+)"', a)
        if not t or t.group(1) not in SCALE:
            continue
        if t.group(1) in SMALL_TYPES and 'color: theme.primary' in a:
            con += 1
        L, cands = SCALE[t.group(1)], []
        for im in re.finditer(r'fontSize:\s*(\d+)', a):
            blk = a[max(0, im.start()-160):im.start()+160]
            cands.append((int(im.group(1)), 'lineHeight' in blk))
        for sm in re.finditer(r'styles\.(\w+)', a):
            if sm.group(1) in sheet:
                cands.append(sheet[sm.group(1)])
        lh += sum(1 for fs, has in cands if not has and L/fs < 1.2)
    for mo in re.finditer(r'<(SpringPressable|Pressable|Touchable\w*)\b([^>]*)>', s, re.S):
        a = mo.group(2)
        hs = re.search(r'hitSlop=\{?(\d+)', a)
        slop = int(hs.group(1)) if hs else 0
        touch += sum(1 for sm in re.finditer(r'styles\.(\w+)', a)
                     if sm.group(1) in dims and dims[sm.group(1)] + 2*slop < 44)
    return lh, con, touch

def main():
    bad = 0
    print(f"{'route':17} {'lineHeight':>10} {'contrast':>8} {'touch':>5}   3a")
    for name, f in ROUTES:
        if not os.path.exists(f):
            print(f"{name:17} {'MISSING':>10}"); bad += 1; continue
        lh, con, touch = audit(f)
        ok = not (lh or con or touch)
        bad += 0 if ok else 1
        print(f"{name:17} {lh:10} {con:8} {touch:5}   {'PASS' if ok else 'FAIL'}")
    print(f"\n{'ALL ROUTES PASS 3a (static half)' if not bad else f'{bad} route(s) FAIL'}")
    print("Still required: criterion 4 via sim.sh screen, and 3b per fix.")
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main())
