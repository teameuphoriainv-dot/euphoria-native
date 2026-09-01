#!/usr/bin/env python3
"""Answer an on-screen lesson step using the extracted curriculum answers.

MATCHING IS BY CONTENT, NOT BY INDEX. `lesson-steps.ts` normalises raw curriculum steps into
render steps, and the two are not 1:1 -- a counter walking both in parallel drifts, and the
drift is silent because a wrong answer looks like a hard step. So instead: read what is on
screen, find the lesson step whose options all appear there, and use ITS answer. Index-free,
so it cannot desynchronise.
"""
import re
import json, subprocess as sp, time, os

# The QA simulator changes whenever a device is recreated. Honour the same explicit target as the
# driver so the navigator and answer solver can never tap two different booted devices.
U = os.environ.get("EUPHORIA_SIM_UDID") or "755B55D9-8E4B-431C-9D1D-A635F38CFF5F"
ANSWERS = "/tmp/lesson-answers.json"
IDB_TIMEOUT = 8

def load(course=None):
    with open(ANSWERS) as f: d = json.load(f)
    return d if course is None else d.get(course, [])

def nodes():
    try:
        r = sp.run(["idb", "ui", "describe-all", "--udid", U], capture_output=True,
                   text=True, timeout=IDB_TIMEOUT)
    except sp.TimeoutExpired:
        return []
    # A dead companion is not an empty screen. idb reports the lost connection on stderr with an
    # empty stdout, so returning [] here made the solver report `no-match` on a perfectly rendered
    # lesson -- the same silent failure that can invalidate an entire sweep after one crash.
    if r.returncode != 0 or not (r.stdout or '').strip():
        raise RuntimeError(f"idb companion unavailable: {(r.stderr or '').strip()[:200]}")
    try: t = json.loads(r.stdout or "[]")
    except json.JSONDecodeError: return []
    return [(round(n['frame']['x']), round(n['frame']['y']), round(n['frame']['width']),
             round(n['frame']['height']), n['AXLabel'], n.get('role') or '', n.get('AXValue') or '')
            for n in t if n.get('AXLabel')]

def norm(s):
    # NO TRUNCATION. Truncating to 40 chars cut "Position 1. Pay off high-interest debt (credit
    # cards)" mid-word, so the substring test against the item text failed and the whole
    # drag-sort step reported "no-match". The comparison is already substring-based, so length
    # costs nothing and the truncation only ever removed the discriminating tail.
    return ''.join(ch for ch in s.lower() if ch.isalnum())

def find_match(lesson, screen_labels):
    """A match step matches on its PAIR TEXTS -- both sides must be on screen."""
    keys = [norm(l) for l in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'match' or not st.get('pairs'): continue
        hits = sum(1 for p in st['pairs']
                   if any(norm(p[0])[:40] in k for k in keys) and any(norm(p[1])[:40] in k for k in keys))
        if hits >= max(2, len(st['pairs']) - 1): return st
    return None


def find_truefalse(lesson, screen_labels):
    """A true/false interaction matches on its visible STATEMENT TEXT.

    `tf` originally captured only the booleans, so there was nothing to match against the screen
    and the step reported 'no-match' -- the same omission that made sliders unmatchable. The
    answer is useless without the thing it is an answer TO. Native now presents one statement at
    a time, so a single exact statement is authoritative; the older all-at-once renderer still
    returns the full step when most statements are visible.
    """
    keys = [norm(l) for l in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'trueFalse' or not st.get('statements'): continue
        visible = [s for s in st['statements']
                   if any(norm(s['text'])[:50] in k for k in keys)]
        if len(visible) >= max(2, len(st['statements']) - 1): return st
        if len(visible) == 1:
            return {**st, 'visibleStatement': visible[0]}
    return None


def find_interactive_graph(lesson, screen_labels):
    """Return a standard authored graph from its exact title and extracted slider contract."""
    keys = [norm(label) for label in screen_labels]
    for st in lesson.get('steps', []) or []:
        args = st.get('_a') or []
        if st.get('kind') != 'interactiveGraph' or len(args) < 8:
            continue
        title, graph_type, sliders = args[1], args[2], args[7]
        if not title or not isinstance(sliders, list):
            continue
        if any(norm(title) in key for key in keys):
            return {'kind': 'interactiveGraph', 'title': title, 'graphType': graph_type,
                    'sliders': sliders}
    return None


def find_slider(lesson, screen_labels):
    """A slider has no options to match on, so it matches on its PROMPT."""
    keys = [norm(l) for l in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'slider' or not st.get('question'): continue
        if any(norm(st['question'])[:60] in k for k in keys): return st
    return None


def find_calculator(lesson, screen_labels):
    """A calculator matches its authored blank labels to the visible text fields."""
    keys = [norm(label) for label in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'calculator' or not st.get('blanks'):
            continue
        hits = sum(1 for blank in st['blanks']
                   if any(norm(blank['label'])[:60] in key for key in keys))
        if hits == len(st['blanks']):
            return st
    return None


def find_decision(lesson, screen_labels):
    """Return the currently visible branch of a multi-screen decision tree."""
    keys = {norm(label) for label in screen_labels}
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'decisionTree':
            continue
        for decision in st.get('decisions', []):
            options = decision.get('options') or []
            if len(options) < 2:
                continue
            if all(any(norm(option) in key for key in keys) for option in options):
                return {'kind': 'decisionTree', 'options': options,
                        'correct': decision.get('correct', -1)}
    return None


def find_explorable(lesson, screen_labels):
    """The authored explorable identified by title or a widget-specific live control."""
    keys = [norm(label) for label in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'explorable' or not st.get('title'):
            continue
        title = norm(st['title'])
        if title and any(title in key for key in keys):
            return st
        widget_markers = {
            'inflationEroder': ('increaseinflationrate', 'increaseyears'),
            'compoundGrowthLab': ('compoundgrowthhandledragrightformoreyearsandupforahigherreturn',),
            'portfolioMixer': ('portfolioallocationbardragthetwodividerstorebalancestocksbondsandcash',),
        }.get(st.get('widget'), ())
        if widget_markers and any(any(marker in key for key in keys) for marker in widget_markers):
            return st
    return None


def node_is_unobscured(node, top=105, bottom=730):
    """Whether a node's whole hit target is outside fixed lesson overlays."""
    return node[1] >= top and node[1] + node[3] <= bottom


def accessible_value(nodes_list, label):
    """The populated AXValue for an exact label, ignoring duplicate static headings."""
    return next((node[6] for node in nodes_list
                 if norm(node[4]) == norm(label) and str(node[6]).strip()), None)


def compound_handle_values(raw):
    """Return (annual return, years) from the compound handle's AXValue."""
    values = re.findall(r"-?\d+(?:\.\d+)?", str(raw or ''))
    return (float(values[0]), float(values[1])) if len(values) >= 2 else None


def ensure_node_visible(label, top=105, bottom=730, require_value=False):
    """Scroll a lesson graph until an exact accessibility target is safely tappable.

    React Native exposes rows that are below the viewport or behind the fixed Atlas/Continue
    footer. Tapping those coordinates either hits the footer or (in development) the floating
    Expo tools button. Accessibility presence alone therefore is not proof of tap visibility.

    A slider publishes its label TWICE: a static caption and the control that carries AXValue.
    The caption sorts first and is always on screen, so the plain lookup silently taps text and
    the value never moves. `require_value` selects the node that actually owns the value.
    """
    wanted = norm(label)
    for _ in range(4):
        current = nodes()
        matches = [node for node in current if norm(node[4]) == wanted
                   and (not require_value or str(node[6]).strip())]
        if matches and node_is_unobscured(matches[0], top, bottom):
            return matches[0]
        if not matches:
            return None
        node = matches[0]
        if node[1] + node[3] > bottom:
            start, end = (200, 700), (200, 400)
        else:
            start, end = (200, 350), (200, 650)
        try:
            sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.5",
                    str(start[0]), str(start[1]), str(end[0]), str(end[1])],
                   capture_output=True, timeout=IDB_TIMEOUT, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            return None
        time.sleep(0.7)
    return None


def tap_fraction(node, fx, settle=0.7):
    """Tap a horizontal fraction across a node instead of its centre.

    The graph control is a single `accessibilityRole="adjustable"` track whose value follows the
    touch position. A centre tap cannot move a thumb that already rests mid-track, so callers aim
    at the far side of the current value.
    """
    x, y, w, h = node[0], node[1], node[2], node[3]
    try:
        sp.run(["idb", "ui", "tap", "--udid", U, str(int(x + w * fx)), str(int(y + h // 2))],
               capture_output=True, timeout=IDB_TIMEOUT)
    except sp.TimeoutExpired:
        return False
    time.sleep(settle)
    return True


def exercise_slider(label, minimum=None, maximum=None):
    """Move one adjustable graph track and report whether its value provably changed.

    Graph sliders are `accessibilityRole="adjustable"` tracks whose value follows touch position.
    The `Increase X` / `Decrease X` buttons these call sites used to tap were retired when the
    control gained accessibilityValue plus increment/decrement actions, so aim across the current
    thumb instead. Authored min/max need not match the rendered track -- steps quantise and some
    tracks do not start at zero -- so fall back to the opposite end before calling a control dead.
    """
    before = accessible_value(nodes(), label)
    control = ensure_node_visible(label, require_value=True)
    if control is None:
        return False
    numbers = re.findall(r"-?\d+(?:\.\d+)?", str(before or ''))
    current = float(numbers[0]) if numbers else None
    low = float(minimum or 0)
    high = float(maximum if maximum is not None else (current if current is not None else 0))
    span = high - low
    ratio = (current - low) / span if current is not None and span else 0.0
    first = 0.15 if ratio > 0.5 else 0.85
    tap_fraction(control, first)
    after = accessible_value(nodes(), label)
    if before is not None and after == before:
        control = ensure_node_visible(label, require_value=True) or control
        tap_fraction(control, round(1.0 - first, 2))
        after = accessible_value(nodes(), label)
    return before is not None and after is not None and before != after


def exercise_graph(lesson):
    """Exercise synthesized explorable controls. Returns (ok, evidence-kind).

    These controls are absent from the authored `sliders` field but present in the renderer.
    Merely recording their initial pixels is not interaction coverage, so the parity lane must
    manipulate them and verify the resulting accessible state before it may Continue.
    """
    ns = nodes()
    labels = [n[4] for n in ns]
    st = find_explorable(lesson, labels)
    if not st:
        generic = find_interactive_graph(lesson, labels)
        if not generic:
            return False, 'not-graph'
        changed = 0
        for slider in generic['sliders']:
            label = slider.get('label')
            if label and exercise_slider(label, slider.get('min'), slider.get('max')):
                changed += 1
        expected = len(generic['sliders'])
        family = re.sub(r'[^A-Za-z0-9_-]+', '', str(generic.get('graphType') or 'generic')) or 'generic'
        if changed != expected:
            return False, f'interactive_graph_controls_failed:{family}({changed}/{expected})'
        return True, f'interactive_graph_controls:{family}[{changed}/{expected}]'
    if st.get('widget') not in ('compoundGrowthLab', 'inflationEroder', 'portfolioMixer'):
        return False, 'not-graph'

    if st['widget'] == 'compoundGrowthLab':
        predict = (st.get('params') or {}).get('predict') or {}
        options = predict.get('options') or []
        if options and any(norm(options[0]) in norm(label) for label in labels):
            hit = [node for node in ns if norm(node[4]) == norm(options[-1])]
            if not hit:
                return False, 'interactive_graph_controls_failed:compound-prediction'
            tap(hit[0], 0.9)

        handle_label = 'Compound growth handle. Drag right for more years and up for a higher return.'
        handle = ensure_node_visible(handle_label)
        if handle is None:
            return False, 'interactive_graph_controls_failed:compound-handle-missing'
        initial = compound_handle_values(handle[6])
        if initial is None:
            return False, 'interactive_graph_controls_failed:compound-handle-value'

        # The handle is mounted at the right edge, so drag left to change years. Re-read after
        # every gesture: moving/scrolling the graph invalidates its prior accessibility frame.
        cx, cy = handle[0] + handle[2] // 2, handle[1] + handle[3] // 2
        try:
            sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.7",
                    str(cx), str(cy), str(max(40, cx - 90)), str(cy)],
                   capture_output=True, timeout=IDB_TIMEOUT, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            return False, 'interactive_graph_controls_failed:compound-years-gesture'
        time.sleep(0.9)
        handle = ensure_node_visible(handle_label)
        after_years = compound_handle_values(handle[6]) if handle else None

        # A deliberately long vertical gesture crosses the renderer's 2-point exploration
        # threshold. Choose whichever direction has more unobscured room.
        if handle is None:
            return False, 'interactive_graph_controls_failed:compound-handle-lost'
        cx, cy = handle[0] + handle[2] // 2, handle[1] + handle[3] // 2
        target_y = 110 if cy - 110 >= 700 - cy else 700
        try:
            sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.9",
                    str(cx), str(cy), str(cx), str(target_y)],
                   capture_output=True, timeout=IDB_TIMEOUT, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            return False, 'interactive_graph_controls_failed:compound-return-gesture'
        time.sleep(0.9)
        handle = ensure_node_visible(handle_label)
        after_return = compound_handle_values(handle[6]) if handle else None

        monthly_label = 'Monthly contribution'
        before_monthly = accessible_value(nodes(), monthly_label)
        for _ in range(2):
            increase = ensure_node_visible('Increase Monthly contribution')
            if increase is None:
                break
            tap(increase, 0.7)
        after_monthly = accessible_value(nodes(), monthly_label)
        monthly_numbers = [re.findall(r"-?\d+(?:\.\d+)?", str(value or ''))
                           for value in (before_monthly, after_monthly)]
        monthly_changed = (all(numbers for numbers in monthly_numbers)
                           and abs(float(monthly_numbers[1][0]) - float(monthly_numbers[0][0])) >= 50)
        years_changed = after_years is not None and abs(after_years[1] - initial[1]) >= 5
        return_changed = (after_return is not None and after_years is not None
                          and abs(after_return[0] - after_years[0]) >= 2)
        verified = sum((years_changed, return_changed, monthly_changed))
        if verified != 3:
            return False, (f'interactive_graph_controls_failed:compound('
                           f'years={years_changed},return={return_changed},monthly={monthly_changed})')
        return True, 'interactive_graph_controls:compoundGrowthLab[3/3]'

    if st['widget'] == 'inflationEroder':
        # The prediction is a deliberate first interaction that unlocks the two live controls.
        predict = (st.get('params') or {}).get('predict') or {}
        options = predict.get('options') or []
        if options and any(norm(options[0]) in norm(label) for label in labels):
            hit = [n for n in ns if norm(n[4]) == norm(options[-1])]
            if not hit:
                return False, 'interactive_graph_controls_failed:prediction'
            tap(hit[0], 0.8)
        changed = 0
        for control_label in ('Inflation rate', 'Years'):
            if exercise_slider(control_label):
                changed += 1
        if changed != 2:
            return False, f'interactive_graph_controls_failed:inflation({changed}/2)'
        # Proving the controls move is not enough to continue. The eroder's insight -- and with it
        # the only advance affordance -- unlocks on `duration >= 28 && lostFraction >= 0.2`, so an
        # exercise pass that parks the slider at a short horizon strands the lesson on this screen.
        # Leave both controls at the long-horizon end the step is authored to teach.
        for control_label in ('Years', 'Inflation rate'):
            node = ensure_node_visible(control_label, require_value=True)
            if node is not None:
                tap_fraction(node, 0.95)
        return True, 'interactive_graph_controls:inflationEroder[3/3]'

    allocation_label = next((n[4] for n in ns if n[4].startswith('Portfolio allocation bar.')), None)
    allocation = ensure_node_visible(allocation_label) if allocation_label else None
    if allocation is None:
        return False, 'interactive_graph_controls_failed:allocation-missing'
    seen = set()
    for fraction in (0.25, 0.45, 0.65):
        current = nodes()
        live = [n for n in current if n[4].startswith('Portfolio allocation bar.')]
        if not live:
            break
        bar = live[0]
        try:
            sp.run(["idb", "ui", "tap", "--udid", U,
                    str(int(bar[0] + bar[2] * fraction)), str(bar[1] + bar[3] // 2)],
                   capture_output=True, timeout=IDB_TIMEOUT, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            break
        time.sleep(0.75)
        reread = [n for n in nodes() if n[4].startswith('Portfolio allocation bar.')]
        if reread:
            seen.add(reread[0][6])
    # Each stress test is an independent authored button. Proving only the first would make the
    # interaction *family* look covered while two of its three controls were never exercised.
    crash_labels = ('2008 crash', 'Dot-com bust', '2022 inflation shock')
    crashes_seen = []
    for crash_label in crash_labels:
        current = nodes()
        button_label = f'Run {crash_label} stress test'
        crash = ensure_node_visible(button_label)
        if crash is None:
            crashes_seen.append(False)
            continue
        tap(crash, 0.9)
        result_label = f'{crash_label}: your mix vs all-in on stocks'
        crashes_seen.append(any(result_label in n[4] for n in nodes()))
    if len(seen) < 3 or not all(crashes_seen):
        return False, (f'interactive_graph_controls_failed:portfolio(states={len(seen)}/3,'
                       f'crashes={sum(crashes_seen)}/3)')
    # The allocation bar exposes two coupled dividers (two effective sliders). Three distinct
    # accessible allocation states prove that the combined control moves; all three crash
    # results prove the other three controls. That is 5/5 renderer controls for this graph.
    return True, 'interactive_graph_controls:portfolioMixer[5/5]'


def find_step(lesson, screen_labels):
    """The lesson step whose options/items are all present on screen."""
    keys = {norm(l) for l in screen_labels}
    best = None
    for st in (lesson.get('steps', []) or []) + (lesson.get('challenge', []) or []):
        opts = st.get('options') or st.get('order')
        if not opts or len(opts) < 2: continue
        # PRECEDENCE BUG, fixed. This read
        #     any(norm(o) and norm(o) in k or k in norm(o) for k in keys)
        # which Python groups as (norm(o) and (norm(o) in k)) or (k in norm(o)) -- so any SHORT
        # screen label contained in a long option counted as a match. "20%" on a slider screen
        # is a substring of plenty of drag-sort items, so a dragSort step matched a slider screen
        # and the wrong answer was applied. Now the OPTION must appear in the LABEL, one
        # direction only, with a length floor so trivial strings cannot match.
        def present_on_screen(o):
            n = norm(o)
            # Short prose fragments are ambiguous substrings, but an exact numeric option is not.
            # Rule-of-72 choices (`9`, `6`, `12`, `15`) were all rejected by the length floor,
            # leaving a fully authored fill-blank unsolvable.
            return ((len(n) >= 4 and any(n in k for k in keys))
                    or (n.isdigit() and n in keys))
        present = sum(1 for o in opts if present_on_screen(o))
        if present == len(opts):
            best = st; break
    return best

def find_drag_sort(lesson, screen_labels):
    """The production dragSort screen shows one ADJACENT pair, not the whole ordering."""
    keys = {norm(label) for label in screen_labels}
    if norm('Which one comes first?') not in keys:
        return None
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'dragSort' or len(st.get('order') or []) < 2:
            continue
        visible = [item for item in st['order']
                   if any(len(norm(item)) >= 4 and norm(item) in key for key in keys)]
        if len(visible) != 2:
            continue
        positions = sorted(st['order'].index(item) for item in visible)
        if positions[1] == positions[0] + 1:
            return {**st, 'visibleItems': visible}
    return None

def tap(n, settle=1.1):
    # Answer rows can extend below the viewport and under the fixed lesson footer. Accessibility
    # still reports their authored frame (for example the correct IF2 option at y=782), but a raw
    # tap there hits Check instead. Re-read the exact label after bounded scrolling first.
    visible = ensure_node_visible(n[4])
    if visible is not None:
        n = visible
    x, y, w, h = n[0], n[1], n[2], n[3]
    try:
        sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)],
               capture_output=True, timeout=IDB_TIMEOUT)
    except sp.TimeoutExpired:
        return
    time.sleep(settle)


def entry_matches(raw, blank):
    """Whether an accessibility field value is already the authored numeric answer."""
    cleaned = ''.join(c for c in str(raw or '') if c.isdigit() or c in '.-')
    if cleaned in ('', '-', '.', '-.'):
        return False
    try:
        value = float(cleaned)
    except ValueError:
        return False
    return abs(value - float(blank['answer'])) <= float(blank.get('tolerance', 0))


def numeric_accessibility_value(value):
    cleaned = ''.join(char for char in str(value or '') if char.isdigit() or char in '.-')
    return cleaned not in ('', '-', '.', '-.')


def slider_track_node(nodes_list, question):
    """Find a number-line track before or after its first placement.

    Before the first tap the native control is an AXButton with the textual value
    "No value placed yet". After placement it may become numeric and, on some runtimes, an
    AXSlider. Its authored prompt + populated AXValue + wide hit target are the stable identity.
    """
    question_key = norm(question)[:40]
    matches = ([node for node in nodes_list if node[5] == 'AXSlider']
               or [node for node in nodes_list
                   if numeric_accessibility_value(node[6]) and question_key in norm(node[4])]
               or [node for node in nodes_list
                   if str(node[6]).strip() and node[2] > 150 and question_key in norm(node[4])]
               or [node for node in nodes_list if numeric_accessibility_value(node[6]) and node[2] > 150])
    return matches[0] if matches else None


def ensure_slider_track_visible(question, top=105, bottom=730):
    """Return the populated number-line track wholly above pinned lesson controls."""
    for _attempt in range(6):
        track = slider_track_node(nodes(), question)
        if track is None:
            return None
        if node_is_unobscured(track, top, bottom):
            return track
        if track[1] + track[3] > bottom:
            start, end = (200, 700), (200, 400)
        else:
            start, end = (200, 350), (200, 650)
        try:
            sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.45",
                    str(start[0]), str(start[1]), str(end[0]), str(end[1])],
                   capture_output=True, timeout=IDB_TIMEOUT, check=True)
        except (sp.TimeoutExpired, sp.CalledProcessError):
            return None
        time.sleep(0.8)
    return None


def place_slider(ns, st):
    """Tap the track at the correct value, then VERIFY the value that landed.

    Selected by accessibility ROLE, not geometry. The prompt appears twice on screen -- once as
    the heading and once as the track's own label -- and both are 354pt wide, so picking "the
    widest match" tapped the HEADING and set a value from a stray coordinate. The track reports
    role 'AXSlider'; the heading reports 'AXStaticText'.

    That same node exposes AXValue ("50%"), so the placement is checked rather than assumed. A
    proportional tap can miss by a few percent from padding inside the hit area, so it re-taps
    with a correction. number-line.tsx accepts a tolerance, so landing near is enough.
    """
    # IDENTIFIED BY ITS VALUE, NOT ITS ROLE. The same track has been observed as AXSlider and
    # as AXButton on different reads -- role instability has now bitten four different element
    # types in this app. What is stable is that the track is the node carrying a numeric AXValue
    # ("20%"). Role is kept only as a first preference.
    # RE-READ, do not trust the caller's snapshot. Direct taps at the computed coordinates were
    # verified to work (frac 0.8 -> 80%, 0.5 -> 58%) while place_slider reported a no-op from the
    # same maths -- the difference was stale geometry. Third handler to need this; match and
    # trueFalse already do.
    ns = nodes()
    track = ensure_slider_track_visible(st['question'])
    if track is None: return False, 'slider-track-not-found'
    x, y, w, h, _, _, _ = track
    lo, hi, want = st['min'], st['max'], st['correct']
    span = (hi - lo) or 1

    def read():
        # Same rule as the track lookup: the value, not the role.
        for n in nodes():
            if n[5] != 'AXSlider' and not (numeric_accessibility_value(n[6]) and norm(st['question'])[:40] in norm(n[4])):
                continue
            try: return float(''.join(c for c in n[6] if c.isdigit() or c in '.-'))
            except ValueError: return None
        return None

    prev = read()
    noop = 0
    for _ in range(4):
        track = ensure_slider_track_visible(st['question'])
        if track is None:
            return False, 'slider-track-not-found'
        x, y, w, h, _, _, _ = track
        frac = max(0.0, min(1.0, (want - lo) / span))
        sp.run(["idb", "ui", "tap", "--udid", U, str(int(x + frac * w)), str(y + h // 2)], capture_output=True)
        time.sleep(0.9)
        got = read()
        if got is None:
            # A tap on an offscreen/still-moving frame used to return success here, then opened
            # the pinned Atlas sheet. Missing value evidence is a retry, never coverage.
            continue
        if abs(got - st['correct']) <= max(1.0, span * 0.03):
            return True, f'slider({got:g})'
        # A NO-OP IS NOT A MISS. place() early-returns once the step is solved, so the value stops
        # responding entirely. Chasing that drives `want` out of range until frac clamps to 0 and
        # the reading is the MINIMUM -- which looks exactly like a tap landing at the far left.
        # That cost a debugging round: single taps were always exact (0.75 -> 70%), and only this
        # loop was wrong.
        # A SINGLE no-op is not a stall -- THE FIRST TAP ON THIS CONTROL IS SWALLOWED.
        # Measured: tapping the computed coordinates by hand left the value at 20, while
        # place_slider hit the same coordinates and reached 80 -- the difference was purely that
        # it retried. Bailing on the first no-op therefore aborted a control that was about to
        # work, and produced "already solved?" on a step that was not solved at all.
        if prev is not None and got == prev:
            noop += 1
            if noop >= 2:
                return True, f'slider(no-op x2 at {got:g})'
        else:
            noop = 0
        prev = got
        want = want + (st['correct'] - got)   # correct the aim in value-space
    final = read()
    if final is None:
        return False, 'slider-value-not-observed'
    return abs(final - st['correct']) <= max(1.0, span * 0.03), f'slider(off:{final})'


VOCAB_ASK = re.compile(r'which term means:\s*(.+)', re.I | re.S)


def find_vocab_ask(lesson, screen_labels):
    """Answer the vocabulary conversation's generated quiz.

    `buildVocabConversation` emits `Which term means: <definition>` and the answer is simply the
    term that owns that definition. Which of the reading-level variants renders is decided at
    runtime, so match against all of them rather than guessing the level.
    """
    prompt = next((label for label in screen_labels if VOCAB_ASK.match(label.strip())), None)
    if not prompt:
        return None
    wanted = norm(VOCAB_ASK.match(prompt.strip()).group(1))
    if not wanted:
        return None
    for step in lesson.get('steps', []) or []:
        if step.get('kind') != 'vocabTerms':
            continue
        for entry in step.get('terms') or []:
            for definition in entry.get('definitions') or []:
                d = norm(definition)
                if d and (d == wanted or (len(wanted) > 20 and wanted in d) or (len(d) > 20 and d in wanted)):
                    if any(norm(label) == norm(entry['term']) for label in screen_labels):
                        return {'kind': 'quiz', 'options': [entry['term']], 'correct': 0}
    return None


def answer(lesson):
    """Apply the correct answer for whatever step is on screen. → (solved, kind)"""
    ns = nodes()
    labels = [n[4] for n in ns]
    st = (find_vocab_ask(lesson, labels) or find_drag_sort(lesson, labels) or find_step(lesson, labels) or find_match(lesson, labels)
          or find_truefalse(lesson, labels) or find_slider(lesson, labels)
          or find_calculator(lesson, labels) or find_decision(lesson, labels))
    if not st: return False, 'no-match'
    if st['kind'] in ('quiz', 'fillBlank', 'visual', 'challenge', 'scenario', 'decisionTree'):
        want = norm(st['options'][st['correct']])
        hit = [n for n in ns if norm(n[4]) == want]
        if not hit and len(want) >= 4:
            hit = [n for n in ns if want in norm(n[4])]
        if not hit: return False, f"option-not-on-screen:{st['kind']}"
        tap(hit[0]); return True, st['kind']
    if st['kind'] == 'match':
        # "Tap a term, then tap its match." Pair them one at a time, re-reading the tree between
        # pairs: matched rows leave the list, so coordinates captured up front go stale.
        done = 0
        for left, right in st['pairs']:
            cur = nodes()
            a = [n for n in cur if norm(left)[:40] in norm(n[4])]
            b = [n for n in cur if norm(right)[:40] in norm(n[4])]
            if not a or not b: continue
            tap(a[0], 0.5); tap(b[0], 0.6); done += 1
        return (done > 0), f'match({done} pairs)'
    if st['kind'] == 'trueFalse':
        visible = st.get('visibleStatement')
        if visible is not None:
            label = 'True. Choose true.' if visible['a'] else 'False. Choose false.'
            hit = [node for node in ns if norm(node[4]) == norm(label)]
            if not hit:
                return False, 'trueFalse-choice-not-on-screen'
            tap(hit[0], 0.6)
            return True, f"trueFalse(single:{str(bool(visible['a'])).lower()})"
        # SELECTION IS A TOGGLE, so state must be read before tapping -- tapping blind means a
        # second pass DESELECTS everything the first pass got right, while the log cheerfully
        # reports "2 true" each time.
        #
        # STATE IS IN AXValue, NOT THE ROLE. Probed on device: the row reads
        # 'checkbox, unchecked' -> 'checkbox, checked' and its role stays AXButton THROUGHOUT.
        # An earlier guess keyed on role (AXButton vs AXGenericElement) and was simply wrong --
        # the AXGenericElement seen once was a different node that happened to contain matching
        # text. Three attempts were spent reasoning about this before measuring it.
        picked = already = 0
        for stmt in st['statements']:
            # RE-READ BEFORE EVERY TAP. `ns` was snapshotted once at the top of answer(), and a
            # tap here can shift the layout -- the "Not quite" banner appearing or clearing
            # changes row positions -- so stale coordinates land on the WRONG statement and check
            # something that should have been cleared. Same failure already fixed for `match`.
            cur = nodes()
            hit = [n for n in cur if norm(stmt['text'])[:50] in norm(n[4])]
            if not hit: continue
            val = (hit[0][6] or '').lower()
            selected = 'checked' in val and 'unchecked' not in val
            if stmt['a'] and not selected:
                tap(hit[0], 0.6); picked += 1
            elif stmt['a'] and selected:
                already += 1
            elif not stmt['a'] and selected:
                tap(hit[0], 0.6)              # wrongly selected — clear it
        return (picked + already > 0), f'trueFalse({picked} set, {already} kept)'
    if st['kind'] == 'slider':
        return place_slider(ns, st)
    if st['kind'] == 'calculator':
        filled = 0
        for blank in st['blanks']:
            cur = nodes()
            hit = [n for n in cur
                   if n[5] == 'AXTextField' and norm(blank['label'])[:60] in norm(n[4])]
            if not hit:
                continue
            field = hit[0]
            if entry_matches(field[6], blank):
                filled += 1
                continue
            try:
                sp.run(["idb", "ui", "tap", "--udid", U,
                        str(field[0] + field[2] // 2), str(field[1] + field[3] // 2)],
                       capture_output=True, timeout=IDB_TIMEOUT, check=True)
                time.sleep(0.25)
                # `idb ui text` appends. Clear a bounded 32 characters first so retries are
                # idempotent rather than turning 9 -> 99 -> 999. USB HID usage 42 is Delete/
                # Backspace; it was verified against this calculator on the QA simulator.
                sp.run(["idb", "ui", "key-sequence", "--udid", U] + ["42"] * 32,
                       capture_output=True, timeout=IDB_TIMEOUT, check=True)
                sp.run(["idb", "ui", "text", "--udid", U, str(blank['answer'])],
                       capture_output=True, timeout=IDB_TIMEOUT, check=True)
                time.sleep(0.35)
                current = nodes()
                reread = [n for n in current
                          if n[5] == 'AXTextField' and norm(blank['label'])[:60] in norm(n[4])]
                if reread and entry_matches(reread[0][6], blank):
                    filled += 1
            except (sp.TimeoutExpired, sp.CalledProcessError):
                continue
        # Decimal-pad has no Return key. Dismiss through the component's explicit accessory so
        # Check is not covered and the driver never relies on tapping arbitrary blank space.
        done = [n for n in nodes() if n[4].lower() == 'done typing']
        if done:
            tap(done[0], 0.5)
        return filled == len(st['blanks']), f'calculator({filled}/{len(st["blanks"])})'
    if st['kind'] == 'dragSort':
        # Production 49e decomposes the authored order into adjacent head-to-head calls. Of the
        # two visible items, choose whichever occurs first in the canonical ordering.
        visible = st.get('visibleItems') or []
        if len(visible) != 2:
            return False, 'dragSort-visible-pair-not-found'
        want = min(visible, key=st['order'].index)
        hit = [n for n in ns if norm(want) in norm(n[4]) and 'not selected' not in n[4].lower()]
        if not hit:
            return False, 'dragSort-correct-item-not-on-screen'
        tap(hit[0], 0.7)
        return True, 'dragSort'
    return False, f"unhandled:{st['kind']}"

def demo():
    # order solver: a known permutation must be reduced to the identity
    assert plan_order_swaps(['c','a','b'], ['a','b','c']) , 'must produce swaps'
    _c = ['c','a','b']
    for _i,_j in plan_order_swaps(_c, ['a','b','c']):
        _c[_i], _c[_j] = _c[_j], _c[_i]
    assert _c == ['a','b','c'], _c
    assert plan_order_swaps(['a','b'], ['a','b']) == [], 'already sorted needs no swaps'
    # order_rows parses the a11y label, and the pure planner passing says nothing about it --
    # a missing `import re` shipped once because only the planner was covered.
    _nodes = [(0, 100, 300, 50, 'Position 2. Gold ETF shares'),
              (0, 40, 300, 50, 'Position 1. Publicly traded REITs'),
              (0, 200, 300, 50, 'Continue')]
    _rows = order_rows(_nodes)
    assert set(_rows) == {0, 1}, _rows
    assert _rows[0][0] == norm('Publicly traded REITs'), _rows[0][0]
    assert _rows[1][0] == norm('Gold ETF shares'), _rows[1][0]

    """Self-check: content matching, with no device involved."""
    lesson = {'steps': [
        {'kind': 'quiz', 'options': ['25% more', '50% more', '75% more'], 'correct': 2},
        {'kind': 'dragSort', 'order': ['alpha', 'beta']},
    ]}
    st = find_step(lesson, ['25% more', '50% more', '75% more', 'Check'])
    assert st and st['kind'] == 'quiz', st
    assert st['options'][st['correct']] == '75% more'
    assert find_step(lesson, ['Continue', 'Something else']) is None
    drag = find_drag_sort(lesson, ['Which one comes first?', 'alpha', 'beta'])
    assert drag and drag['visibleItems'] == ['alpha', 'beta'], drag
    calc = {'steps': [{'kind': 'calculator', 'blanks': [
        {'label': 'At 8%, how many years?', 'answer': 9, 'tolerance': .5},
        {'label': 'At 12%, how many years?', 'answer': 6, 'tolerance': .5},
    ]}]}
    assert find_calculator(calc, ['At 8%, how many years?', 'At 12%, how many years?', 'Check'])
    assert entry_matches('9', calc['steps'][0]['blanks'][0])
    assert not entry_matches('99', calc['steps'][0]['blanks'][0])
    tree = {'steps': [{'kind': 'decisionTree', 'decisions': [{
        'options': ['Sell now', 'Hold and keep contributing'], 'correct': 1,
    }]}]}
    branch = find_decision(tree, ['Sell now', 'Hold and keep contributing', 'Check'])
    assert branch and branch['correct'] == 1
    graph = {'steps': [{'kind': 'explorable', 'widget': 'portfolioMixer',
                        'title': 'The price of that return'}]}
    assert find_explorable(graph, ['The price of that return', 'Portfolio allocation bar.'])
    assert find_explorable(graph, ['Portfolio allocation bar. Drag the two dividers to rebalance stocks, bonds, and cash.'])
    print('self-check OK — matched quiz by content, ignored an unrelated screen')

def plan_order_swaps(current, target):
    """Swaps that turn `current` into `target`, as (i, j) index pairs.

    OrderSteps reorders by TAPPING TWO ROWS TO SWAP (its own docstring), so the driver needs
    pairs, not a drag. Selection sort is the right shape here: it makes at most n-1 swaps and
    never moves a row that is already correct, which keeps the tap count low and each tap
    meaningful if a run has to be read back later.

    Pure and index-based so it can be self-checked without a device.
    """
    cur = list(current)
    swaps = []
    for i in range(len(target)):
        if cur[i] == target[i]:
            continue
        j = next((k for k in range(i + 1, len(cur)) if cur[k] == target[i]), None)
        if j is None:
            continue                      # target item absent; leave the row alone
        cur[i], cur[j] = cur[j], cur[i]
        swaps.append((i, j))
    return swaps


def order_rows(nodes_list):
    """On-screen rows as {position_index: item_text}, read from `Position N. <item>` labels."""
    out = {}
    for n in nodes_list:
        m = re.match(r'Position (\d+)\.\s*(.+)', n[4])
        if m:
            out[int(m.group(1)) - 1] = (norm(m.group(2)), n)
    return out


def solve_order(step, nodes_list, tap_fn):
    """Drive an order/dragSort step to its correct sequence. Returns the number of swaps made."""
    target = [norm(x) for x in (step.get('order') or [])]
    rows = order_rows(nodes_list)
    if not target or len(rows) != len(target):
        return 0
    current = [rows[i][0] for i in range(len(rows))]
    made = 0
    for i, j in plan_order_swaps(current, target):
        fresh = order_rows(nodes())
        if i not in fresh or j not in fresh:
            break
        tap_fn(fresh[i][1], 0.6)
        tap_fn(fresh[j][1], 0.6)
        made += 1
    return made


if __name__ == '__main__':
    demo()
