#!/usr/bin/env python3
"""Answer an on-screen lesson step using the extracted curriculum answers.

MATCHING IS BY CONTENT, NOT BY INDEX. `lesson-steps.ts` normalises raw curriculum steps into
render steps, and the two are not 1:1 -- a counter walking both in parallel drifts, and the
drift is silent because a wrong answer looks like a hard step. So instead: read what is on
screen, find the lesson step whose options all appear there, and use ITS answer. Index-free,
so it cannot desynchronise.
"""
import json, subprocess as sp, time, os

U = "755B55D9-8E4B-431C-9D1D-A635F38CFF5F"
ANSWERS = "/tmp/lesson-answers.json"

def load(course=None):
    with open(ANSWERS) as f: d = json.load(f)
    return d if course is None else d.get(course, [])

def nodes():
    r = sp.run(["idb", "ui", "describe-all", "--udid", U], capture_output=True, text=True)
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
    """A true/false multi-select matches on its STATEMENT TEXT.

    `tf` originally captured only the booleans, so there was nothing to match against the screen
    and the step reported 'no-match' -- the same omission that made sliders unmatchable. The
    answer is useless without the thing it is an answer TO.
    """
    keys = [norm(l) for l in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'trueFalse' or not st.get('statements'): continue
        hits = sum(1 for s in st['statements'] if any(norm(s['text'])[:50] in k for k in keys))
        if hits >= max(2, len(st['statements']) - 1): return st
    return None


def find_slider(lesson, screen_labels):
    """A slider has no options to match on, so it matches on its PROMPT."""
    keys = [norm(l) for l in screen_labels]
    for st in lesson.get('steps', []) or []:
        if st.get('kind') != 'slider' or not st.get('question'): continue
        if any(norm(st['question'])[:60] in k for k in keys): return st
    return None


def find_step(lesson, screen_labels):
    """The lesson step whose options/items are all present on screen."""
    keys = {norm(l) for l in screen_labels}
    best = None
    for st in lesson.get('steps', []) or []:
        opts = st.get('options') or st.get('order')
        if not opts or len(opts) < 2: continue
        present = sum(1 for o in opts if any(norm(o) and norm(o) in k or k in norm(o) for k in keys))
        if present == len(opts):
            best = st; break
    return best

def tap(n, settle=1.1):
    x, y, w, h = n[0], n[1], n[2], n[3]
    sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)], capture_output=True)
    time.sleep(settle)

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
    track = [n for n in ns if n[5] == 'AXSlider']
    if not track:
        track = [n for n in ns if norm(st['question'])[:60] in norm(n[4]) and n[5] != 'AXStaticText']
    if not track: return False, 'slider-track-not-found'
    x, y, w, h, _, _, _ = track[0]
    lo, hi, want = st['min'], st['max'], st['correct']
    span = (hi - lo) or 1

    def read():
        for n in nodes():
            if n[5] == 'AXSlider':
                try: return float(''.join(c for c in n[6] if c.isdigit() or c == '.' or c == '-'))
                except ValueError: return None
        return None

    prev = read()
    for _ in range(3):
        frac = max(0.0, min(1.0, (want - lo) / span))
        sp.run(["idb", "ui", "tap", "--udid", U, str(int(x + frac * w)), str(y + h // 2)], capture_output=True)
        time.sleep(0.9)
        got = read()
        if got is None: return True, 'slider(unverified)'
        if abs(got - st['correct']) <= max(1.0, span * 0.03):
            return True, f'slider({got:g})'
        # A NO-OP IS NOT A MISS. place() early-returns once the step is solved, so the value stops
        # responding entirely. Chasing that drives `want` out of range until frac clamps to 0 and
        # the reading is the MINIMUM -- which looks exactly like a tap landing at the far left.
        # That cost a debugging round: single taps were always exact (0.75 -> 70%), and only this
        # loop was wrong.
        if prev is not None and got == prev:
            return True, f'slider(no-op at {got:g} — already solved?)'
        prev = got
        want = want + (st['correct'] - got)   # correct the aim in value-space
    return True, f'slider(off:{read()})'


def answer(lesson):
    """Apply the correct answer for whatever step is on screen. → (solved, kind)"""
    ns = nodes()
    labels = [n[4] for n in ns]
    st = (find_step(lesson, labels) or find_match(lesson, labels)
          or find_truefalse(lesson, labels) or find_slider(lesson, labels))
    if not st: return False, 'no-match'
    if st['kind'] in ('quiz', 'fillBlank', 'visual', 'challenge'):
        want = norm(st['options'][st['correct']])
        hit = [n for n in ns if norm(n[4]) == want or want in norm(n[4])]
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
    if st['kind'] == 'dragSort':
        # swap into place: for each target position, find the row holding that item and swap
        for i, want in enumerate(st['order']):
            rows = sorted([n for n in nodes() if n[4].lower().startswith('position ')], key=lambda z: z[1])
            if i >= len(rows): break
            cur = [j for j, r in enumerate(rows) if norm(want) in norm(r[4])]
            if not cur or cur[0] == i: continue
            tap(rows[i], 0.7); tap(rows[cur[0]], 0.7)
        return True, 'dragSort'
    return False, f"unhandled:{st['kind']}"

def demo():
    """Self-check: content matching, with no device involved."""
    lesson = {'steps': [
        {'kind': 'quiz', 'options': ['25% more', '50% more', '75% more'], 'correct': 2},
        {'kind': 'dragSort', 'order': ['alpha', 'beta']},
    ]}
    st = find_step(lesson, ['25% more', '50% more', '75% more', 'Check'])
    assert st and st['kind'] == 'quiz', st
    assert st['options'][st['correct']] == '75% more'
    assert find_step(lesson, ['Continue', 'Something else']) is None
    print('self-check OK — matched quiz by content, ignored an unrelated screen')

if __name__ == '__main__':
    demo()
