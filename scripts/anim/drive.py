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
import subprocess as sp, json, os, re, time, sys


def booted_simulator_udid():
    """Use the requested simulator, or the one iOS simulator that is actually booted.

    A fixed UDID made an audit silently target a simulator that had been shut down to reduce
    CPU/GPU usage. The accessibility calls then returned empty trees, which looks like 300 app
    failures even though the app was running correctly on a different device. Requiring exactly
    one booted simulator keeps the target deterministic without baking one developer machine's
    device identifier into the audit.
    """
    requested = os.environ.get("EUPHORIA_SIM_UDID")
    if requested:
        return requested

    result = sp.run(
        ["xcrun", "simctl", "list", "devices", "--json"],
        capture_output=True,
        text=True,
        check=True,
    )
    payload = json.loads(result.stdout)
    booted = [
        device["udid"]
        for devices in payload.get("devices", {}).values()
        for device in devices
        if device.get("state") == "Booted" and device.get("isAvailable", True)
    ]
    if len(booted) != 1:
        raise RuntimeError(
            f"Expected exactly one booted iOS simulator, found {len(booted)}. "
            "Set EUPHORIA_SIM_UDID to choose explicitly."
        )
    return booted[0]


U = booted_simulator_udid()
BUNDLE = "com.euphoriainv.euphoria"

# Short-lived cache for the accessibility tree.
#
# WHY: one driver step calls labels(), find(), at_launcher(), dismiss_logbox(), dismiss_sheet()
# and button() before it taps anything -- six full `idb ui describe-all` round-trips at roughly
# 0.5-1.5s each. That is ~6s of pure overhead per step and ~350s for a 16-step lesson, and
# nothing on screen changes across those calls because no tap has happened yet.
#
# WHY A BARE TTL IS SAFE HERE: every tap in this module is followed by a settle sleep of at
# least 0.5s (tap 1.1s, dismiss_logbox 1.0s, dismiss_sheet 1.4s, reveal 0.5s, check 1.8s), all
# longer than this TTL. So the cache is always expired by the time anything could have changed.
# Anything added later with a shorter settle must pass fresh=True.
_CACHE = {'at': 0.0, 'val': None}
_TTL = 0.30

class CompanionUnavailable(RuntimeError):
    """idb's companion process is gone. Never let this read as an empty screen."""


def tree(fresh=False):
    now = time.time()
    if not fresh and _CACHE['val'] is not None and now - _CACHE['at'] < _TTL:
        return _CACHE['val']
    try:
        r = sp.run(["idb", "ui", "describe-all", "--udid", U], capture_output=True,
                   text=True, timeout=8)
    except sp.TimeoutExpired:
        return []
    # A DEAD COMPANION IS NOT AN EMPTY SCREEN. idb reports a lost companion on stderr and leaves
    # stdout empty, so `json.loads(stdout or "[]")` handed the driver a blank tree: every step
    # then reported no-button/no-match and the lesson failed exactly as if the app were broken.
    # One companion death mid-sweep silently invalidated every lesson after it. Recover once,
    # then refuse to keep going rather than manufacture 288 false failures.
    if r.returncode != 0 or not (r.stdout or '').strip():
        detail = (r.stderr or '').strip()
        sp.run(["idb", "kill"], capture_output=True, timeout=30)
        time.sleep(2)
        try:
            r = sp.run(["idb", "ui", "describe-all", "--udid", U], capture_output=True,
                       text=True, timeout=12)
        except sp.TimeoutExpired:
            raise CompanionUnavailable('idb companion timed out after restart') from None
        if r.returncode != 0 or not (r.stdout or '').strip():
            raise CompanionUnavailable(f'idb companion unavailable: {detail[:200]}')
    try: out = json.loads(r.stdout or "[]")
    except json.JSONDecodeError: out = []
    _CACHE['val'], _CACHE['at'] = out, time.time()
    return out

def nodes():
    return [(round(n['frame']['x']), round(n['frame']['y']), round(n['frame']['width']),
             round(n['frame']['height']), n['AXLabel'], n.get('role') or '', n.get('AXValue') or '')
            for n in tree() if n.get('AXLabel')]

def labels(): return {n[4] for n in nodes()}
def find(sub): return [n for n in nodes() if sub.lower() in n[4].lower()]


def authored_step_position(current_labels):
    """Return the native authored-step header `(current, total)`, if present."""
    for label in current_labels:
        match = re.fullmatch(r"(\d+)/(\d+)", label.strip())
        if match:
            return int(match.group(1)), int(match.group(2))
    return None


def node_is_tappable(node, top=105, bottom=830):
    return node[1] >= top and node[1] + node[3] <= bottom


def bring_into_view(node, top=105, bottom=830):
    """Scroll an exact target out from behind/beyond the lesson chrome before tapping it."""
    label = node[4]
    for _ in range(4):
        exact = [candidate for candidate in nodes() if candidate[4] == label]
        visible = [candidate for candidate in exact if node_is_tappable(candidate, top, bottom)]
        if visible:
            return visible[0]
        candidate = exact[0] if exact else node
        if candidate[1] + candidate[3] > bottom:
            start, end = ('200', '700'), ('200', '400')
        elif candidate[1] < top:
            start, end = ('200', '350'), ('200', '650')
        else:
            return candidate
        try:
            sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.45",
                    start[0], start[1], end[0], end[1]], capture_output=True, timeout=8, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            return candidate
        time.sleep(0.65)
    return node


def button(*subs):
    """Find a tappable BUTTON whose label contains one of `subs`.

    Substring matching alone tapped a PARAGRAPH. On the multi-select step the prose
    "Select all that apply, then check." contains "check", sits above the real "Check answer"
    button, and matched first -- so the driver tapped body text and reported the step as stuck.

    The fix is to exclude PROSE, not to require a button role: see the comment below. Matches are
    returned lowest-first, because action buttons sit at the bottom of these screens.
    """
    # EXCLUDE STATIC TEXT, do not require AXButton. Requiring AXButton fixed the paragraph bug
    # and immediately caused a worse one: the lesson-intro Continue renders as AXGenericElement
    # (a different button component), so `button()` returned nothing and every lesson in the
    # sweep drove 0 steps while recording 150s of a static intro. Both failure modes are covered
    # by the real distinction -- a tappable control is anything that is NOT prose or an image.
    # ONLY PROSE IS EXCLUDED. The same Continue button has now been observed as AXButton,
    # AXGenericElement AND AXImage across three reads of the same app -- the role is simply not
    # stable here. Excluding AXImage cost another stall. AXStaticText is the only role that
    # actually caused the original bug (the paragraph "Select all that apply, then check."), so
    # it is the only one worth excluding.
    # Honour caller priority before vertical position. Calculator screens contain both an inner
    # "Check" and the fixed lesson-footer "Continue" at the same time. Sorting all matches by
    # y always returned the lower, disabled Continue even when the caller explicitly requested
    # button('check', 'continue'), so correct numbers were never graded and were appended again.
    for sub in subs:
        needle = sub.lower()
        hits = [n for n in nodes()
                if n[5] != 'AXApplication'
                and ((n[5] != 'AXStaticText' and needle in n[4].lower())
                     or n[4].strip().lower() == needle)]
        if hits:
            return sorted(hits, key=lambda n: -n[1])
    return []


def post_solve_button():
    """Control that submits an answer or advances an authored multi-stage interaction."""
    return button('check', 'submit', 'next round', 'see the full order', 'next statement', 'finish',
                  'continue', 'next decision', 'see results', 'finish decision path')


def advance_warmup():
    """Advance one exact beat of the canonical lesson warmup, if visible.

    These choices are not scored curriculum answers, but picking an arbitrary accessibility row
    would weaken the same evidence invariant used inside lessons. Keep the canonical first option
    for each primer explicit and verify that every tap changes the screen.
    """
    beats = (
        ('Warm up', 'warmup:intro'),
        ("Curious, let's go", 'warmup:primer-1'),
        ("Yes, let's do it", 'warmup:primer-2'),
        # The warmup CTA reads 'Start lesson' whenever the recall pool is empty (fresh device, no
        # completed lessons) and again as the final beat after the primers. Ordered last so a
        # populated pool still walks intro -> primers -> start.
        ('Start lesson', 'warmup:start'),
    )
    current = labels()
    for label, action in beats:
        if label not in current:
            continue
        exact = [node for node in nodes()
                 if node[4] == label and node[5] != 'AXApplication']
        if not exact:
            return False, f'{action}:control-missing'
        return tap(exact[0]), action
    return None

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
    n = bring_into_view(n)
    x, y, w, h = n[0], n[1], n[2], n[3]
    sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)], capture_output=True)
    time.sleep(settle)
    return labels() != before


def position_reveal_card(label, top=120, bottom=720):
    """Place one tall reveal card wholly inside the safe lesson viewport after scroll settles."""
    for _attempt in range(8):
        exact = [candidate for candidate in nodes() if candidate[4] == label]
        if not exact:
            return None
        candidate = exact[0]
        if node_is_tappable(candidate, top, bottom):
            return candidate
        desired_y = 250
        delta = desired_y - candidate[1]
        distance = min(300, max(80, abs(delta)))
        if delta > 0:
            start_y, end_y = 350, min(700, 350 + distance)
        else:
            start_y, end_y = 650, max(200, 650 - distance)
        try:
            sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.45",
                    "200", str(start_y), "200", str(end_y)],
                   capture_output=True, timeout=8, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            return None
        # Measure only after momentum has stopped; the old 0.65s re-read observed an apparently
        # safe frame that kept moving until the subsequent tap landed on empty space.
        time.sleep(1.0)
    return None


def flip_reveal_card(node):
    """Flip one exact reveal card and verify its accessibility state changed.

    Reveal cards are 280pt tall inside a scrolling view. Rapidly alternating between cards above
    and below the viewport leaves scroll momentum active, so a centre tap can be swallowed as the
    end of a drag. Work on one current card at a time, keep the whole card above the pinned lesson
    footer, let scrolling settle, and accept only disappearance of its exact hidden label.
    """
    hidden_label = node[4]
    for _attempt in range(3):
        target = position_reveal_card(hidden_label)
        if target is None:
            continue
        sp.run(["idb", "ui", "tap", "--udid", U,
                str(target[0] + target[2] // 2), str(target[1] + target[3] // 2)],
               capture_output=True)
        time.sleep(0.9)
        current = [candidate for candidate in nodes() if candidate[4] == hidden_label]
        if not current:
            return True
        time.sleep(0.6)
    return False


def reveal_hidden_cards(max_cards=12):
    """Reveal cards sequentially, returning `(verified_flips, still_hidden)`."""
    flipped = 0
    for _ in range(max_cards):
        hidden = [node for node in nodes() if 'not revealed yet' in node[4].lower()]
        if not hidden:
            return flipped, 0
        # Avoid the old stale-frame ping-pong by preferring a card that already fits, then the
        # card closest to the safe viewport.
        target = min(hidden, key=lambda candidate: 0 if node_is_tappable(candidate, 105, 730)
                     else min(abs(candidate[1] - 105), abs(candidate[1] + candidate[3] - 730)))
        if not flip_reveal_card(target):
            return flipped, len(hidden)
        flipped += 1
    remaining = len([node for node in nodes() if 'not revealed yet' in node[4].lower()])
    return flipped, remaining

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
    # Reuses button() rather than re-testing the role here. The AXButton assumption was wrong
    # once already -- the lesson-intro Continue renders as AXGenericElement -- and a duplicated
    # assumption is one that only gets fixed in one place.
    for want in ('not now', 'maybe later', 'dismiss', 'close'):
        b = button(want)
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
    # The ROUTE ids are kebab-case ('personal-finance'); the answers JSON is keyed camelCase
    # ('personalFinance'). Callers hold the JSON key, so convert here rather than at every call
    # site -- an ad-hoc caller that passed the camelCase key straight through got the "That
    # lesson isn't available." screen and this function returned True (see below).
    slug = ''.join('-' + c.lower() if c.isupper() else c for c in course_slug)
    for _attempt in range(tries):
        dismiss_logbox(); dismiss_sheet()
        # ALWAYS reset via home, including the first attempt. Opening the same lesson URL while
        # already inside it is a navigation no-op; its Ask Atlas label still contains the lesson
        # title, so the old verifier accepted a mid-lesson screen as a fresh route and recorded
        # only the tail. Unmounting the lesson is the only reliable reset of local step/input state.
        sp.run(["xcrun", "simctl", "openurl", U, "euphorianative://home"], capture_output=True)
        time.sleep(2.5)
        sp.run(["xcrun", "simctl", "openurl", U,
                f"euphorianative://lesson?course={slug}&num={num}"], capture_output=True)
        # Do not make a 300-route audit pay the full worst-case navigation timeout 300 times.
        # Release builds usually expose the destination title in under a second. Poll the actual
        # accessibility contract and return as soon as it is true; the 3.5s deadline preserves the
        # old tolerance for a cold route without turning that tolerance into a mandatory sleep.
        deadline = time.time() + 3.5
        while time.time() < deadline:
            time.sleep(0.25)
            labs = ' '.join(labels()).lower()
            if "available" in labs and "pick another" in labs:
                break
            if title and title.lower()[:28] in labs:
                return True
            if not title and ('lesson' in labs or 'continue' in labs):
                return True
        dismiss_logbox(); dismiss_sheet()
        labs = ' '.join(labels()).lower()
        # REJECT THE FAILURE SCREEN FIRST. lesson.tsx renders "That lesson isn't available." when
        # the course id or num does not resolve -- and that sentence CONTAINS the word "lesson",
        # so the generic fallback below matched the exact screen that means failure and returned
        # True. Measured: a bad slug produced 8 identical "advance" steps against a dead end while
        # the driver reported success. Check the negative before the positive.
        if "available" in labs and "pick another" in labs:
            continue
        if title and title.lower()[:28] in labs:
            return True
        if not title and ('lesson' in labs or 'continue' in labs):
            return True
    return False


def settle_read_gate(max_wait=25):
    """Satisfy a teaching slide's read gate, then report whether it opened.

    `ready = bottomReached && remaining === 0`. The slide keeps Continue MOUNTED AND TAPPABLE the
    whole time it is gated, so a tap that changes nothing is the gate -- not a missing control,
    and not a stall worth counting. Scrolling is what sets bottomReached; once it is set the
    button relabels to `Continue in Ns` until the dwell expires, so that label is the live signal.
    """
    for _ in range(8):
        if any(re.match(r'continue in \d+\s*s', label.lower()) for label in labels()):
            break
        sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.35",
                "200", "640", "200", "260"], capture_output=True)
        time.sleep(0.45)
    deadline = time.time() + max_wait
    while time.time() < deadline:
        if not any(re.match(r'continue in \d+\s*s', label.lower()) for label in labels()):
            return True
        time.sleep(1.0)
    return False


def advance(allow_guess=True):
    """One step forward. Returns (moved, what_was_tried).

    NOTE THE TUPLE. `if not advance():` is always False because a non-empty tuple is truthy --
    that mistake hid a stall for 8 steps. Unpack it: `moved, how = advance()`.
    """
    if at_launcher():
        return reconnect(), 'reconnect'
    if dismiss_logbox():
        return True, 'logbox'
    if dismiss_sheet():
        return True, 'sheet'
    # TAP-REVEAL GATE. A reveal step renders its cards as "<term>. Not revealed yet." and the
    # Continue button stays inert until every one is flipped -- so the generic button tap below
    # is a silent no-op and the driver burns its whole step budget on a screen it can never
    # leave. Measured: 8 identical no-op steps. The a11y label states the card's own state, so
    # flip them all first and let the next call take the button.
    hidden = [n for n in nodes() if 'not revealed yet' in n[4].lower()]
    if hidden:
        total, remaining = reveal_hidden_cards()
        if remaining:
            return False, f'reveal-stuck:{remaining}'
        return total > 0, f'reveal x{total}'

    # Conversational steps carry their own CTAs (Atlas vocabulary runs `Teach me` -> `Let's go`
    # -> `Done` across nine beats). `Skip` is deliberately absent: skipping past authored
    # content would weaken the very interaction coverage the recording exists to prove.
    btn = button('start the challenge', 'next statement', 'finish', 'begin', 'continue', 'check',
                 'next', 'got it', 'teach me', "let's go", 'show me how', 'done')
    if not btn:
        return False, 'no-button'
    if tap(btn[0]):
        return True, 'button'
    # MORE THAN ONE ADVANCE CONTROL CAN BE MOUNTED AT ONCE. A teaching slide's recap puts
    # `Got it, continue lesson` above a Continue that is disabled for exactly as long as the
    # recap is open (`disabled={!ready || showRecap}`). Taking only the first match sat on the
    # dead control forever and the step read as a stall.
    for other in btn[1:]:
        if tap(other):
            return True, f'button:{other[4][:28]}'
    # A gated read step, not a dead end: scroll to the bottom, let the dwell timer expire, and
    # take the button. Without this every teachingSlide is a permanent stall.
    if settle_read_gate():
        again = button('continue', 'next', 'got it', 'finish') or btn
        if tap(again[0]):
            return True, 'button:read-gate'
    # A parity recording must use the extracted canonical answer. The legacy CLI probe can still
    # opt into its arbitrary-row fallback, but run_lesson passes allow_guess=False: selecting the
    # first tappable row made wrong feedback look like movement and recorded an incorrect journey
    # as coverage before the answer solver ever got a turn.
    if not allow_guess:
        return False, 'stuck'
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
        moved, how = advance(allow_guess=False)
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
    log, stalls, highest_authored_step = [], 0, 0
    for i in range(max_steps):
        # STOP WHEN THE RECORDING DOES. Without this the thread outlives its capture window and
        # keeps TAPPING while the next lesson tries to deep-link -- lesson N's driver fighting
        # lesson N+1's navigation. That is what made 27 consecutive lessons report
        # "did-not-navigate" when goto_lesson works perfectly when called on its own.
        if stop is not None and stop.is_set():
            return False, log
        current_labels = labels()
        authored_position = authored_step_position(current_labels)
        if authored_position:
            current_authored_step, _authored_total = authored_position
            if current_authored_step < highest_authored_step:
                log.append((i, f'step_regression:{current_authored_step}<{highest_authored_step}', False))
                return False, log
            highest_authored_step = max(highest_authored_step, current_authored_step)
        # An unexpected tab route is not a hard lesson step. One failed run jumped from a checked
        # quiz to Games and then logged three generic no-matches; make the route escape explicit.
        if {'Home', 'Learn', 'Trade', 'Digest', 'Games'}.issubset(current_labels):
            log.append((i, 'route_escape:tab-bar', False))
            return False, log
        text = ' '.join(current_labels).lower()
        if any(k in text for k in ('lesson complete', 'xp earned', 'you earned', 'well done', '+30 xp')):
            return True, log
        warmup = advance_warmup()
        if warmup is not None:
            moved, how = warmup
            log.append((i, how, moved))
            stalls = stalls + 1 if not moved else 0
            if stalls >= stall_limit:
                return False, log
            continue
        revealed = 0
        hidden = find('not revealed')
        if hidden:
            revealed, remaining = reveal_hidden_cards()
            if remaining:
                log.append((i, f'reveal-stuck:{remaining}', False))
                stalls += 1
                if stalls >= stall_limit:
                    return False, log
                continue
        # Evidence captures must never choose an arbitrary row merely to make the screen move.
        # The authored-answer solver below owns all interaction choices.
        graph_ok, graph_kind = getattr(solve_mod, 'exercise_graph', lambda _lesson: (False, 'not-graph'))(lesson)
        if graph_kind != 'not-graph' and not graph_ok:
            log.append((i, graph_kind, False))
            stalls += 1
            if stalls >= stall_limit:
                return False, log
            continue
        moved, how = advance(allow_guess=False)
        if not moved and how in ('stuck', 'no-button'):
            ok, kind = solve_mod.answer(lesson)
            btn = post_solve_button()
            if ok and btn:
                before = labels()
                time.sleep(0.5)          # let the selection taps settle before checking them
                btn = post_solve_button() or btn      # re-read: layout may have shifted
                target = bring_into_view(btn[0])
                sp.run(["idb", "ui", "tap", "--udid", U, str(target[0] + target[2] // 2),
                        str(target[1] + target[3] // 2)], capture_output=True)
                time.sleep(1.8)
                after = labels()
                # A WRONG ANSWER CHANGES THE SCREEN WITHOUT ADVANCING. multi-select relabels its
                # button to "Not quite -- answers are marked. Fix and check again.", so a naive
                # `labels() != before` reads as progress and the stall detector never fires: one
                # run reported moved=True thirty times in a row while sitting on one step.
                rejected = any('not quite' in l.lower() for l in after)
                moved = (after != before) and not rejected
                how = (f'solved:{kind}' + ('/rejected' if rejected else '')
                       + f'@{target[4]}[{target[0]},{target[1]},{target[2]},{target[3]}]')
            else:
                how = f'unsolved:{kind}'
        if graph_ok:
            how = f'exercised:{graph_kind}+{how}'
        if revealed:
            # Reveals are authored interactions in their own right. They happen before the
            # footer advances, so preserve them in the same action record instead of losing
            # the evidence behind a generic "button" entry.
            how = f'reveal({revealed})+{how}'
        log.append((i, how, moved))
        stalls = stalls + 1 if not moved else 0
        if stalls >= stall_limit:
            return False, log
    return False, log
