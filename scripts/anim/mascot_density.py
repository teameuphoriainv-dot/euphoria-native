#!/usr/bin/env python3
"""Measure how much the mascot actually MOVES on a screen — the before/after harness.

The audit's headline finding is that Atlas's idle amplitude (1-3% of a 100-unit viewBox, so
0.5-2pt at shipping sizes) is at or below what a person can see. Any fix for that has to be
PROVEN, not asserted: raise the constants, re-run this, compare.

Two things make the number trustworthy:

  * The mascot box comes from the ACCESSIBILITY TREE, not a guess, so it tracks the real element.
  * A CONTROL region on the same frames, containing no mascot, is measured alongside. Nearly
    every screen carries an animated starfield, so an uncontrolled "mascot moves in 90% of
    frames" can be entirely background. On welcome the control (69%) beat the mascot (38%) --
    without it, that screen would have looked lively.

  python3 scripts/anim/mascot_density.py <route> [seconds]
"""
import subprocess as sp, sys, os, glob, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import record, real_rate
import drive
from PIL import Image, ImageChops

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/density"

def mascot_box():
    """Atlas's own frame, in points, from the a11y tree. None if it is not on screen."""
    for n in drive.nodes():
        if 'mascot' in n[4].lower():
            return (n[0], n[1], n[2], n[3])
    return None

def measure(route, secs=10.0, label=''):
    os.makedirs(OUT, exist_ok=True)
    if drive.at_launcher(): drive.reconnect()
    drive.dismiss_logbox(); drive.dismiss_sheet()
    sp.run(["xcrun", "simctl", "openurl", drive.U, f"euphorianative://{route}"], capture_output=True)
    time.sleep(4.0)
    drive.dismiss_logbox(); drive.dismiss_sheet()
    box = mascot_box()
    if not box: return {'route': route, 'error': 'no-mascot-on-screen'}

    h264 = f"{OUT}/{route.replace('/','_')}{label}.h264"
    record(h264, secs)
    n, rate = real_rate(h264, secs + 1.2)
    fd = f"{OUT}/fr"; sp.run(["rm", "-rf", fd]); os.makedirs(fd)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h264, f"{fd}/%05d.png"], check=True)
    frames = sorted(glob.glob(f"{fd}/*.png"))
    if len(frames) < 10: return {'route': route, 'error': 'too-few-frames'}

    im = Image.open(frames[0]); sx = im.width / 402.0
    x, y, w, h = box
    M = [int(x*sx), int(y*sx), int((x+w)*sx), int((y+h)*sx)]
    # control: same area, same frames, placed away from the mascot
    cy = int((y + h + 40) * sx); ch = int(h * sx)
    if cy + ch > im.height: cy = max(0, int((y - h - 40) * sx))
    C = [M[0], cy, M[2], cy + ch]

    def dens(region):
        prev = None; moved = 0; tot = 0; cnt = 0
        for f in frames:
            c = Image.open(f).convert('RGB').crop(region)
            if prev is not None:
                d = ImageChops.difference(c, prev); r, g, b = d.split()
                v = sum(ImageChops.lighter(ImageChops.lighter(r, g), b).histogram()[9:])
                tot += v; cnt += 1
                if v > 30: moved += 1
            prev = c
        return (100*moved/cnt if cnt else 0), (tot//cnt if cnt else 0)

    md, mm = dens(M); cd, cm = dens(C)
    sp.run(["rm", "-rf", fd])
    return {'route': route, 'label': label, 'fps': round(rate, 1), 'frames': len(frames),
            'box': box, 'mascot_pct': round(md, 1), 'mascot_mean': mm,
            'control_pct': round(cd, 1), 'control_mean': cm,
            'lift': round(md - cd, 1)}

def demo():
    """Self-check with no device: the control geometry must never overlap the mascot box."""
    x, y, w, h, sx = 141, 205, 120, 124, 3.0
    M = [int(x*sx), int(y*sx), int((x+w)*sx), int((y+h)*sx)]
    cy = int((y + h + 40) * sx)
    assert cy >= M[3], f'control top {cy} must sit below mascot bottom {M[3]}'
    print('self-check OK — control region does not overlap the mascot box')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--demo': demo(); sys.exit()
    route = sys.argv[1] if len(sys.argv) > 1 else 'welcome'
    secs = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
    lab = sys.argv[3] if len(sys.argv) > 3 else ''
    r = measure(route, secs, lab)
    print(json.dumps(r, indent=1))
    if 'error' not in r:
        print(f"\n{route}: mascot {r['mascot_pct']}% vs control {r['control_pct']}%  "
              f"-> LIFT {r['lift']:+.1f} points")
