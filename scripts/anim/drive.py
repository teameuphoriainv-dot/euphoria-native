#!/usr/bin/env python3
"""Lesson driver that DETECTS ITS OWN STALLS.

The first version of this tapped `Check` four times on a quiz step and reported
nothing wrong, because a tap that does nothing looks exactly like a tap that
worked. Two facts learned the hard way and encoded here:

  * A quiz will not advance until an OPTION IS SELECTED. Tapping Check with
    nothing selected is a silent no-op.
  * An edit can drop the app to the Expo dev-client launcher, which reads as a
    perfectly valid screen with a handful of labels.

So every tap is verified by comparing the label set before and after. Anything
that does not change the screen is escalated rather than repeated.
"""
import subprocess as sp, json, time, sys

U = "755B55D9-8E4B-431C-9D1D-A635F38CFF5F"
BUNDLE = "com.euphoriainv.euphoria"

def tree():
    r = sp.run(["idb", "ui", "describe-all", "--udid", U], capture_output=True, text=True)
    try: return json.loads(r.stdout or "[]")
    except json.JSONDecodeError: return []

def nodes():
    return [(round(n['frame']['x']), round(n['frame']['y']), round(n['frame']['width']),
             round(n['frame']['height']), n['AXLabel']) for n in tree() if n.get('AXLabel')]

def labels(): return {n[4] for n in nodes()}
def find(sub): return [n for n in nodes() if sub.lower() in n[4].lower()]

def at_launcher():
    l = labels()
    return 'Development Build' in l or 'DEVELOPMENT SERVERS' in l

def reconnect():
    """The launcher trap. Tapping the dev-server row re-enters the app."""
    rows = [n for n in nodes() if '8081' in n[4]]
    if not rows: return False
    x, y, w, h, _ = rows[0]
    sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)], capture_output=True)
    time.sleep(14)
    return not at_launcher()

def tap(n, settle=1.6):
    """Tap and report whether the screen actually changed."""
    before = labels()
    x, y, w, h, _ = n
    sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)], capture_output=True)
    time.sleep(settle)
    return labels() != before

def dismiss_logbox():
    """Clear a React Native LogBox banner if one is up.

    Not cosmetic: the banner sits at y~800-822 and OVERLAPS the Continue button at y=760-816,
    so it swallows the tap and the step never advances. A live RevenueCat warning ("[iap]
    configured but the current offering has NO packages") reappears on every launch of this
    build, so any run longer than one screen has to handle it. Its dismiss X is at the right
    edge of the banner.
    """
    banner = [n for n in nodes() if '[iap]' in n[4] or (len(n[4]) > 2 and n[4][0].isdigit() and n[4][1] == ',')]
    if not banner: return False
    sp.run(["idb", "ui", "tap", "--udid", U, "381", "811"], capture_output=True)
    time.sleep(1.0)
    return not [n for n in nodes() if '[iap]' in n[4]]


def advance():
    """One step forward. Returns (moved, what_was_tried)."""
    if at_launcher():
        return reconnect(), 'reconnect'
    if dismiss_logbox():
        return True, 'logbox'
    btn = find('continue') or find('check') or find('next') or find('got it')
    if not btn:
        return False, 'no-button'
    if tap(btn[0]):
        return True, 'button'
    # Silent no-op: the step needs solving first. Selecting any tappable
    # non-button row is enough to satisfy a choice/multi step.
    skip = ('continue', 'check', 'next', 'close', 'gearshape', 'atlas', 'tab bar')
    for n in nodes():
        if n[3] < 24 or n[3] > 110: continue
        if any(s in n[4].lower() for s in skip): continue
        if tap(n, 0.9): break
    btn = find('continue') or find('check')
    if btn and tap(btn[0]):
        return True, 'solve+button'
    return False, 'stuck'

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'tap to flip'
    maxs = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    for i in range(maxs):
        if find(target):
            print(f"REACHED {target!r} at step {i}"); sys.exit(0)
        moved, how = advance()
        print(f"  step {i:>2} {how:<12} moved={moved}")
        if not moved and how in ('stuck', 'no-button'):
            print(f"  STOPPED — visible: {sorted(labels())[:6]}"); sys.exit(1)
    print(f"did not reach {target!r} in {maxs} steps"); sys.exit(2)

def run_lesson(lesson, solve_mod, max_steps=48, stall_limit=3):
    """Drive one lesson to completion. Returns (done, log).

    STALL DETECTION IS THE POINT. An earlier version looped 28 times reporting "solved" while the
    screen never changed: the solver returned ok=True, the caller only bailed on ok=False, and a
    step that is answered but does not ADVANCE is indistinguishable from progress unless the
    screen is compared. Solving is not advancing, and only advancing counts.
    """
    log, stalls = [], 0
    for i in range(max_steps):
        text = ' '.join(labels()).lower()
        if any(k in text for k in ('lesson complete', 'xp earned', 'you earned', 'well done', '+30 xp')):
            return True, log
        for c in find('not revealed'):
            sp.run(["idb", "ui", "tap", "--udid", U, str(c[0] + c[2] // 2), str(c[1] + c[3] // 2)],
                   capture_output=True)
            time.sleep(0.5)
        moved, how = advance()
        if not moved and how in ('stuck', 'no-button'):
            ok, kind = solve_mod.answer(lesson)
            btn = find('check') or find('continue')
            if ok and btn:
                before = labels()
                sp.run(["idb", "ui", "tap", "--udid", U, str(btn[0][0] + btn[0][2] // 2),
                        str(btn[0][1] + btn[0][3] // 2)], capture_output=True)
                time.sleep(1.8)
                moved, how = labels() != before, f'solved:{kind}'
            else:
                how = f'unsolved:{kind}'
        log.append((i, how, moved))
        stalls = stalls + 1 if not moved else 0
        if stalls >= stall_limit:
            return False, log
    return False, log

