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
             round(n['frame']['height']), n['AXLabel'], n.get('role') or '', n.get('AXValue') or '')
            for n in tree() if n.get('AXLabel')]

def labels(): return {n[4] for n in nodes()}
def find(sub): return [n for n in nodes() if sub.lower() in n[4].lower()]


def button(*subs):
    """Find a tappable BUTTON whose label contains one of `subs`.

    Substring matching alone tapped a PARAGRAPH. On the multi-select step the prose
    "Select all that apply, then check." contains "check", sits above the real "Check answer"
    button, and matched first -- so the driver tapped body text and reported the step as stuck.
    Filtering on role AXButton and preferring the LOWEST match (action buttons sit at the
    bottom) fixes a whole class of silent stalls, not just this one.
    """
    hits = [n for n in nodes() if n[5] == 'AXButton' and any(s.lower() in n[4].lower() for s in subs)]
    return sorted(hits, key=lambda n: -n[1])

def at_launcher():
    l = labels()
    return 'Development Build' in l or 'DEVELOPMENT SERVERS' in l

def reconnect():
    """The launcher trap. Tapping the dev-server row re-enters the app."""
    rows = [n for n in nodes() if '8081' in n[4]]
    if not rows: return False
    x, y, w, h = rows[0][0], rows[0][1], rows[0][2], rows[0][3]
    sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)], capture_output=True)
    time.sleep(14)
    return not at_launcher()

def tap(n, settle=1.6):
    """Tap and report whether the screen actually changed."""
    before = labels()
    x, y, w, h = n[0], n[1], n[2], n[3]
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


def dismiss_sheet():
    """Close a modal sheet if one is up (trial reward, gate, dismissal offer).

    These block EVERYTHING behind them and are invisible to a label check that only looks for
    lesson text. A reward sheet -- "You've earned something / Open it / Not now" -- appears after
    the first completed lesson and stalled a 60-lesson sweep on its very first run: the driver
    reported 0 steps while 150 seconds of a static modal were recorded as 295 "transitions".

    "Not now" / "Dismiss" is preferred over "Open it", which would navigate somewhere new.
    """
    ns = nodes()
    labs = ' '.join(n[4] for n in ns).lower()
    if not any(k in labs for k in ("you've earned", 'not now', 'maybe later', 'open it')):
        return False
    for want in ('not now', 'maybe later', 'dismiss', 'close'):
        b = [n for n in ns if n[5] == 'AXButton' and want in n[4].lower()]
        if b:
            sp.run(["idb", "ui", "tap", "--udid", U, str(b[0][0] + b[0][2] // 2),
                    str(b[0][1] + b[0][3] // 2)], capture_output=True)
            time.sleep(1.4)
            return True
    return False


def goto_lesson(course_slug, num, title=None, tries=3):
    """Deep-link to a lesson and VERIFY it actually opened.

    Deep links silently fail when the app is already on a pushed screen -- measured across a
    26-route walk where only 9 of 23 routes actually navigated, while every one of them was
    recorded and scored as if it had. A deep link that does nothing is indistinguishable from a
    screen with no animation, which is the worst possible failure for an animation audit.

    So: clear anything blocking, fire the link, and confirm the lesson's own title is on screen.
    Falling back through home resets the navigation stack when a direct link will not take.
    """
    for attempt in range(tries):
        dismiss_logbox(); dismiss_sheet()
        if attempt:                     # a pushed screen blocks deep links; reset via home first
            sp.run(["xcrun", "simctl", "openurl", U, "euphorianative://home"], capture_output=True)
            time.sleep(2.5)
        sp.run(["xcrun", "simctl", "openurl", U,
                f"euphorianative://lesson?course={course_slug}&num={num}"], capture_output=True)
        time.sleep(3.5)
        dismiss_logbox(); dismiss_sheet()
        labs = ' '.join(labels()).lower()
        if title and title.lower()[:28] in labs:
            return True
        if not title and ('lesson' in labs or 'continue' in labs):
            return True
    return False


def advance():
    """One step forward. Returns (moved, what_was_tried)."""
    if at_launcher():
        return reconnect(), 'reconnect'
    if dismiss_logbox():
        return True, 'logbox'
    if dismiss_sheet():
        return True, 'sheet'
    btn = button('continue', 'check', 'next', 'got it')
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
    btn = button('continue', 'check')
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

def run_lesson(lesson, solve_mod, max_steps=48, stall_limit=3, stop=None):
    """Drive one lesson to completion. Returns (done, log).

    STALL DETECTION IS THE POINT. An earlier version looped 28 times reporting "solved" while the
    screen never changed: the solver returned ok=True, the caller only bailed on ok=False, and a
    step that is answered but does not ADVANCE is indistinguishable from progress unless the
    screen is compared. Solving is not advancing, and only advancing counts.
    """
    log, stalls = [], 0
    for i in range(max_steps):
        # STOP WHEN THE RECORDING DOES. Without this the thread outlives its capture window and
        # keeps TAPPING while the next lesson tries to deep-link -- lesson N's driver fighting
        # lesson N+1's navigation. That is what made 27 consecutive lessons report
        # "did-not-navigate" when goto_lesson works perfectly when called on its own.
        if stop is not None and stop.is_set():
            return False, log
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
            btn = button('check', 'continue')
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

