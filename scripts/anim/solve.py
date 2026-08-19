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
             round(n['frame']['height']), n['AXLabel']) for n in t if n.get('AXLabel')]

def norm(s):
    # NO TRUNCATION. Truncating to 40 chars cut "Position 1. Pay off high-interest debt (credit
    # cards)" mid-word, so the substring test against the item text failed and the whole
    # drag-sort step reported "no-match". The comparison is already substring-based, so length
    # costs nothing and the truncation only ever removed the discriminating tail.
    return ''.join(ch for ch in s.lower() if ch.isalnum())

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
    x, y, w, h, _ = n
    sp.run(["idb", "ui", "tap", "--udid", U, str(x + w // 2), str(y + h // 2)], capture_output=True)
    time.sleep(settle)

def place_slider(ns, st):
    """Tap the track at the correct value.

    number-line.tsx wraps the track in `<Pressable onPress={place}>` with
    accessibilityRole='adjustable' and accessibilityLabel = the prompt, so a tap places the
    value proportionally. That is far more reliable than driving the accessibility increment,
    which idb cannot issue.
    """
    track = [n for n in ns if norm(st['question'])[:60] in norm(n[4]) and n[2] > 150]
    if not track: return False, 'slider-track-not-found'
    x, y, w, h, _ = max(track, key=lambda n: n[2])
    frac = (st['correct'] - st['min']) / (st['max'] - st['min']) if st['max'] != st['min'] else 0.5
    frac = max(0.0, min(1.0, frac))
    sp.run(["idb", "ui", "tap", "--udid", U, str(int(x + frac * w)), str(y + h // 2)], capture_output=True)
    time.sleep(1.1)
    return True, 'slider'


def answer(lesson):
    """Apply the correct answer for whatever step is on screen. → (solved, kind)"""
    ns = nodes()
    labels = [n[4] for n in ns]
    st = find_step(lesson, labels) or find_slider(lesson, labels)
    if not st: return False, 'no-match'
    if st['kind'] in ('quiz', 'fillBlank', 'visual', 'challenge'):
        want = norm(st['options'][st['correct']])
        hit = [n for n in ns if norm(n[4]) == want or want in norm(n[4])]
        if not hit: return False, f"option-not-on-screen:{st['kind']}"
        tap(hit[0]); return True, st['kind']
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
