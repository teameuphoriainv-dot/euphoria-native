#!/usr/bin/env python3
"""Frame-differencing over a burst of screenshots.

Answers ONE question objectively: did anything on screen move between frames?
Used to verify reduced-motion on device — a guarded animation must produce
IDENTICAL consecutive frames, and an unguarded one must not.

Reports changed-pixel COUNT per consecutive pair, not a boolean, because a
count distinguishes "nothing moved" from "a caret blinked" from "the whole
background is breathing".
"""
import sys
from PIL import Image, ImageChops


def burst_diffs(paths, crop=None):
    """→ [(a, b, changed_px, total_px)] for each consecutive pair."""
    out = []
    for a, b in zip(paths, paths[1:]):
        ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
        if crop:
            ia, ib = ia.crop(crop), ib.crop(crop)
        diff = ImageChops.difference(ia, ib)
        # PER-CHANNEL MAX, never .convert('L'). The L conversion is luminance-
        # weighted (blue counts 0.114), so a blue-only shift of +20 lands at 2 and
        # falls under the threshold. This palette is violet on near-black, so that
        # is precisely the motion being measured. Caught by the demo below.
        ch_r, ch_g, ch_b = diff.split()
        m = ImageChops.lighter(ImageChops.lighter(ch_r, ch_g), ch_b)
        # threshold 8/255 — below that is encoder noise, not motion
        changed = sum(m.histogram()[9:])
        out.append((a.split('/')[-1], b.split('/')[-1], changed, ia.width * ia.height))
    return out


def demo():
    """Self-check: identical frames → 0 changed; a drawn rect → >0."""
    import tempfile, os
    d = tempfile.mkdtemp()
    base = Image.new('RGB', (40, 40), (10, 10, 10))
    p1, p2, p3 = (os.path.join(d, f'{i}.png') for i in (1, 2, 3))
    base.save(p1)
    base.save(p2)                       # byte-identical twin
    moved = base.copy()
    moved.paste((200, 200, 200), (5, 5, 15, 15))
    moved.save(p3)
    r = burst_diffs([p1, p2, p3])
    assert r[0][2] == 0, f'identical frames must report 0 changed, got {r[0][2]}'
    assert r[1][2] == 100, f'a 10x10 rect must report 100 changed, got {r[1][2]}'
    # and the threshold must not swallow a real but subtle change
    faint = base.copy()
    faint.paste((10, 10, 30), (0, 0, 40, 40))   # +20 on blue, above threshold 8
    pf = os.path.join(d, 'f.png'); faint.save(pf)
    assert burst_diffs([p1, pf])[0][2] == 1600, 'a +20 channel shift must not be filtered out'
    print('frame_diff demo OK')


if __name__ == '__main__':
    if sys.argv[1:2] == ['--demo']:
        demo()
    else:
        for a, b, ch, tot in burst_diffs(sys.argv[1:]):
            print(f'{a} -> {b}: {ch:>8} px changed  ({100*ch/tot:.3f}%)')
