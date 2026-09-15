#!/usr/bin/env python3
"""
Walk lessons on a booted simulator and report every screen that does not fit.

WHY THIS EXISTS. Character counts are a proxy. They found the stakes card and the hook opener, and
they were wrong about the vocabulary conversation, which looks enormous by character count and is
fine because it shows one beat at a time. The only thing that settles whether a screen fits is the
screen, so this reads the accessibility tree off a real device and compares the lowest element
against the viewport.

It reports two different failures, and they are not the same problem:

  BELOW THE FOLD   an element sits past the bottom of the window. On a screen that scrolls this is
                   survivable; on one that does not, the learner cannot reach it. The stakes card
                   had its Continue button 400pt down with a countdown ticking out of sight.

  DEAD BAND        the lowest content ends far above the bottom, leaving a large empty gap. Nothing
                   is broken, but it reads as a missing element. The onboarding growth chart had
                   177pt of it and the vocabulary conversation had 365pt.

Usage:  python3 scripts/lesson-layout-sweep.py <UDID> <course> <lessonNum> [max_steps]
"""
import json
import subprocess
import sys
import time

# iPhone 17 point size. Read from the device rather than assumed where possible.
DEFAULT_H = 874
# A gap larger than this below the last element is reported as a dead band.
DEAD_BAND = 140
# Chrome at the top of a lesson: the close button, the progress bar and the step counter.
HEADER_H = 110


def describe(udid):
    out = subprocess.run(
        ['idb', 'ui', 'describe-all', '--udid', udid],
        capture_output=True, text=True, timeout=45,
    )
    if out.returncode != 0:
        return []
    # `describe-all` prints ONE JSON ARRAY, not a JSON object per line. Parsing it line by line
    # silently returned nothing, and a sweep that reads nothing reports zero problems, which is
    # indistinguishable from a pass. That is what the coverage check at the end is for.
    try:
        return json.loads(out.stdout)
    except json.JSONDecodeError:
        return []


def rows(items):
    """(label, top, bottom) for everything with a label and a frame."""
    out = []
    for it in items:
        label = it.get('AXLabel') or it.get('AXValue') or ''
        frame = it.get('frame') or {}
        if not label or 'y' not in frame:
            continue
        out.append((label, float(frame['y']), float(frame['y']) + float(frame.get('height', 0))))
    return out


def tap(udid, label):
    subprocess.run(['idb', 'ui', 'tap', '--udid', udid, '0', '0'], capture_output=True)  # focus
    items = describe(udid)
    for it in items:
        if (it.get('AXLabel') or '') == label:
            f = it['frame']
            x = int(f['x'] + f['width'] / 2)
            y = int(f['y'] + f['height'] / 2)
            subprocess.run(['idb', 'ui', 'tap', '--udid', udid, str(x), str(y)], capture_output=True)
            return True
    return False


ADVANCE = ('Continue', 'Got it', 'Begin', 'Start lesson', 'Next', "Let's go", 'Teach me', 'Show me another')


def classify(lowest, label='x'):
    """The two detectors, pulled out so they can be tested without a device."""
    if lowest > DEFAULT_H:
        return 'below'
    if DEFAULT_H - lowest > DEAD_BAND:
        return 'dead'
    return None


def selftest():
    """A GREEN RUN MEANS NOTHING UNLESS THE LANE CAN GO RED.

    Each detector is seeded with the real measurement that motivated it and with a shape it must
    ignore, so a refactor that quietly stops detecting shows up here rather than as a silent pass.
    """
    checks = [
        # The stakes card, measured before the fix: content ran to 1253 in an 874pt window.
        (1253, 'below', 'the stakes card overflow must be caught'),
        # The onboarding growth chart: content ended at 585, leaving 177pt empty below it.
        (585, 'dead', 'a 289pt dead band must be caught'),
        # The vocabulary conversation before centring: Next at 428.
        (446, 'dead', 'the vocabulary dead band must be caught'),
        # A healthy screen: the explanation page, Continue ending near the bottom.
        (806, None, 'a screen that fits must NOT be reported'),
        (874, None, 'content ending exactly at the fold must NOT be reported'),
    ]
    for lowest, want, why in checks:
        got = classify(lowest)
        if got != want:
            print(f'selftest FAILED: {why} (lowest={lowest} gave {got!r}, wanted {want!r})')
            return 1
    print('selftest passed: both detectors go red on the shapes they exist for')
    return 0


def main():
    if '--selftest' in sys.argv:
        return selftest()
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    udid, course, num = sys.argv[1], sys.argv[2], sys.argv[3]
    max_steps = int(sys.argv[4]) if len(sys.argv) > 4 else 24

    subprocess.run(
        ['xcrun', 'simctl', 'openurl', udid, f'euphorianative://lesson?course={course}&num={num}'],
        capture_output=True,
    )
    time.sleep(4)

    problems = []
    seen = set()
    for _ in range(max_steps):
        items = describe(udid)
        r = rows(items)
        if not r:
            break
        step = next((lab for lab, _, _ in r if '/' in lab and lab.replace('/', '').isdigit()), '?')
        lowest = max(b for _, _, b in r)
        gap = DEFAULT_H - lowest

        key = (step, round(lowest))
        if key not in seen:
            seen.add(key)
            verdict = classify(lowest)
            if verdict == 'below':
                problems.append(f'BELOW THE FOLD  step {step}: lowest element ends at {lowest:.0f}, window is {DEFAULT_H}')
            elif verdict == 'dead':
                lab = max(r, key=lambda x: x[2])[0][:44]
                problems.append(f'DEAD BAND       step {step}: {gap:.0f}pt of empty screen below "{lab}"')

        if not any(tap(udid, a) for a in ADVANCE):
            # Not an advance screen: it is a question. Tap the first option under the prompt.
            body = [x for x in r if x[1] > HEADER_H + 120]
            if len(body) > 1 and tap(udid, body[1][0]):
                time.sleep(1.5)
                continue
            break
        time.sleep(1.8)

    # A SWEEP THAT VISITED NOTHING MUST NOT READ AS A PASS. Silence and success look identical
    # otherwise, and this walker stops the moment it meets a screen it cannot advance.
    visited = sorted({k[0] for k in seen})
    print(f'{course} lesson {num}: visited {len(seen)} screen(s) across steps {",".join(visited)}')
    if len(seen) < 3:
        print('  INCONCLUSIVE: the walker could not get through the lesson, so this is not a pass')
        return 2
    print(f'  {len(problems)} layout problem(s)')
    for p in problems:
        print('  ' + p)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
