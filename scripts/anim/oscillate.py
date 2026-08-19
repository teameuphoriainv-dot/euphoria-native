#!/usr/bin/env python3
"""Pass 2 — does the reference BOUNCE?

A spring that overshoots its target crosses it and comes back, so the frame-diff
curve rises, falls, and rises AGAIN before settling. A critically-damped move
produces ONE peak that decays. Counting significant local maxima inside a motion
window therefore detects overshoot without knowing which element moved -- which
matters, because a reference recording has no accessibility tree to query.
"""
import sys, glob, json, os
from PIL import Image, ImageChops

def series(paths, scale=4):
    out, prev = [], None
    for p in paths:
        im = Image.open(p).convert('RGB')
        im = im.resize((max(1,im.width//scale), max(1,im.height//scale)), Image.BILINEAR)
        if prev is not None:
            d = ImageChops.difference(im, prev); r,g,b = d.split()
            m = ImageChops.lighter(ImageChops.lighter(r,g),b)
            out.append(sum(m.histogram()[9:]))
        prev = im
    return out

def peaks(seg, rel=0.22):
    """Significant local maxima: above rel*max, and a genuine turning point."""
    if len(seg) < 5: return 1
    hi = max(seg)
    if hi == 0: return 0
    n = 0
    for i in range(1, len(seg)-1):
        if seg[i] >= seg[i-1] and seg[i] > seg[i+1] and seg[i] > hi*rel:
            n += 1
    return max(n, 1)

def demo():
    single = [1,5,20,60,100,70,40,20,8,2]          # one clean decay
    bounce = [1,5,20,60,100,60,15,3,45,38,10,2]    # settle, bounce, settle
    assert peaks(single) == 1, peaks(single)
    assert peaks(bounce) == 2, peaks(bounce)
    print("self-check OK  single=1  bounce=2")

if __name__ == '__main__':
    if sys.argv[1] == '--demo': demo(); sys.exit()
    for d in sys.argv[1:]:
        fr = sorted(glob.glob(f'{d}/*.png'))
        v = series(fr)
        json.dump(v, open(f'{d}.diff.json','w'))
        print(f'{os.path.basename(d)}: saved {len(v)} diffs')
