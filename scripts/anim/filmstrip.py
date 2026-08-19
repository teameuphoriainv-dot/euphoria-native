#!/usr/bin/env python3
"""Pass 3 — measure WHERE and HOW BIG the moving thing is, then render it to look at.

A reference recording has no accessibility tree, so there is no element to query.
But the diff between two frames is only non-zero where something moved, and the
bounding box of that region IS the moving element's footprint. Tracking the box
across a window gives a growth curve, which answers the questions whole-frame
differencing cannot:

  scale origin  -- a box that starts tiny and grows was scaled up from ~0
  exit          -- a full-width box on frame 1 means the outgoing view moved too
  locality      -- a small box is one card; a full-frame box is a navigation

Renders the window as a labelled contact strip so the numbers can be checked by eye.
"""
import sys, glob, os, json
from PIL import Image, ImageChops, ImageDraw

def diff_bbox(a, b, thresh=8):
    """Bounding box of pixels that changed between two frames, or None."""
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    d = ImageChops.difference(ia, ib)
    r, g, bl = d.split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), bl)
    # point() to a hard mask first: getbbox() ignores 0 only, so noise would inflate the box.
    return m.point(lambda v: 255 if v > thresh else 0).getbbox(), ia.size

def track(frames):
    """→ [(i, x0, y0, w, h)] for each consecutive pair in the window."""
    out = []
    for i in range(len(frames) - 1):
        bb, size = diff_bbox(frames[i], frames[i + 1])
        if bb:
            out.append((i, bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]))
        else:
            out.append((i, 0, 0, 0, 0))
    return out, size

def strip(frames, path, cols=12, scale=2, boxes=None):
    """Contact strip, one cell per frame, index labelled, diff box drawn."""
    ims = [Image.open(f).convert('RGB') for f in frames]
    w, h = ims[0].width // scale, ims[0].height // scale
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * (h + 14)), (18, 18, 22))
    d = ImageDraw.Draw(sheet)
    for i, im in enumerate(ims):
        c, r = i % cols, i // cols
        x, y = c * w, r * (h + 14)
        sheet.paste(im.resize((w, h), Image.BILINEAR), (x, y + 14))
        d.text((x + 3, y + 2), f'{i}', fill=(200, 200, 210))
        if boxes and i < len(boxes) and boxes[i][3] > 0:
            _, bx, by, bw, bh = boxes[i]
            d.rectangle([x + bx // scale, y + 14 + by // scale,
                         x + (bx + bw) // scale, y + 14 + (by + bh) // scale],
                        outline=(255, 90, 90))
    sheet.save(path)
    return sheet.size

def demo():
    """Self-check: a shrinking square must produce a shrinking tracked box."""
    import tempfile
    t = tempfile.mkdtemp()
    fs = []
    for i, s in enumerate([40, 30, 20, 10]):
        im = Image.new('RGB', (100, 100), (0, 0, 0))
        ImageDraw.Draw(im).rectangle([50 - s, 50 - s, 50 + s, 50 + s], fill=(0, 0, 200))
        p = f'{t}/{i}.png'; im.save(p); fs.append(p)
    tr, _ = track(fs)
    ws = [b[3] for b in tr]
    assert all(w > 0 for w in ws), f'motion must be detected, got {ws}'
    assert ws[0] >= ws[-1], f'shrinking square must not grow: {ws}'
    print('self-check OK  tracked widths', ws)

if __name__ == '__main__':
    if sys.argv[1] == '--demo': demo(); sys.exit()
    d, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    fr = sorted(glob.glob(f'{d}/*.png'))[a:b + 1]
    tr, size = track(fr)
    out = f'{d}_w{a}.png'
    strip(fr, out, boxes=tr)
    print(f'{os.path.basename(d)} frames {a}-{b}  screen {size[0]}x{size[1]}  -> {out}')
    print('  i   x    y     w     h')
    for i, x, y, w, h in tr:
        print(f'  {i:>2} {x:>4} {y:>4}  {w:>4}  {h:>4}  {"#"*min(40, w//8)}')
