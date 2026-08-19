#!/usr/bin/env python3
"""Segment a reference recording into MOTION WINDOWS.

Pass 1 of two. Diffing 15k frames at full res to find where animation happens is
wasteful, so this downscales hard and only asks "did anything change". Pass 2
measures curves inside the windows this finds.

Per-channel max, never .convert('L') -- luminance weighting scores a blue-only
shift of +20 as 2, and these palettes are dark with saturated accents.
"""
import sys, glob, os
from PIL import Image, ImageChops

def diffs(paths, scale=4):
    out, prev = [], None
    for p in paths:
        im = Image.open(p).convert('RGB')
        im = im.resize((max(1, im.width // scale), max(1, im.height // scale)), Image.BILINEAR)
        if prev is not None:
            d = ImageChops.difference(im, prev)
            r, g, b = d.split()
            m = ImageChops.lighter(ImageChops.lighter(r, g), b)
            out.append(sum(m.histogram()[9:]))          # threshold 8/255
        prev = im
    return out

def windows(vals, total_px, on=0.004, min_len=3, join=4):
    """Contiguous runs above `on` fraction, gaps <= `join` merged."""
    hot = [i for i, v in enumerate(vals) if v > total_px * on]
    if not hot: return []
    runs, s, p = [], hot[0], hot[0]
    for i in hot[1:]:
        if i - p <= join: p = i; continue
        runs.append((s, p)); s = p = i
    runs.append((s, p))
    return [(a, b) for a, b in runs if b - a + 1 >= min_len]

def demo():
    """Self-check: a static pair scores 0; a changed pair scores > 0."""
    import tempfile
    d = tempfile.mkdtemp()
    base = Image.new('RGB', (80, 80), (8, 8, 12))
    base.save(f'{d}/a.png'); base.save(f'{d}/b.png')
    moved = base.copy()
    # BLUE-ONLY shift -- the exact case .convert('L') would hide.
    for x in range(20, 60):
        for y in range(20, 60): moved.putpixel((x, y), (8, 8, 60))
    moved.save(f'{d}/c.png')
    v = diffs([f'{d}/a.png', f'{d}/b.png', f'{d}/c.png'], scale=1)
    assert v[0] == 0, f'static pair must be 0, got {v[0]}'
    assert v[1] > 500, f'blue-only motion must register, got {v[1]}'
    assert windows([0, 0, 900, 900, 900, 0], 10000, on=0.004) == [(2, 4)], 'window detect'
    print('self-check OK', v)

if __name__ == '__main__':
    if sys.argv[1] == '--demo': demo(); sys.exit()
    d = sys.argv[1]
    fr = sorted(glob.glob(f'{d}/*.png'))
    im = Image.open(fr[0]); tot = (im.width // 4) * (im.height // 4)
    v = diffs(fr)
    w = windows(v, tot)
    print(f'{os.path.basename(d)}: {len(fr)} frames · {len(w)} motion windows')
    for a, b in w:
        print(f'  frames {a:>5}-{b:<5} {(b-a+1)/30:5.2f}s  t={a/30:7.2f}s  peak={max(v[a:b+1])}')
