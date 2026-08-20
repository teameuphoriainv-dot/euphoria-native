#!/usr/bin/env python3
"""Per-route audit that VERIFIES each navigation before scoring anything.

The first whole-app pass is retracted: a 26-route walk was scored as if every deep link had
worked, when only 9 of 23 actually navigated. Deep links silently no-op on a pushed screen, so
half that audit described the wrong screen -- and "digest-slug has no entry animation" turned out
to be a route that never opened onto a slug that does not exist.

So every route here is confirmed by comparing the accessibility label set before and after, and a
route that does not move is reported as SKIPPED rather than silently measured. Parks on home
between routes to clear the navigation stack.
"""
import subprocess as sp, sys, os, glob, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import record, real_rate
from segment import diffs, windows
from oscillate import peaks
import drive

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/routeaudit"

def routes():
    out = []
    for line in open('scripts/routes.sh'):
        line = line.strip().strip('"')
        if ':' in line and not line.startswith(('#', 'ROUTES')):
            name, path = line.split(':', 1)
            if name and path and ' ' not in name:
                out.append((name, path.rstrip('"')))
    return out

def one(name, path, dwell=7.0):
    os.makedirs(OUT, exist_ok=True)
    if drive.at_launcher(): drive.reconnect()
    drive.dismiss_logbox(); drive.dismiss_sheet()
    # PARK SOMEWHERE THAT IS NOT THE ROUTE UNDER TEST. Parking on home unconditionally meant the
    # `home` route navigated home->home, changed 0 labels, and was correctly-but-uselessly
    # reported SKIPPED. The verification was right; the harness was asking an impossible question.
    park = 'euphorianative://(tabs)/learn' if 'home' in path else 'euphorianative://(tabs)/home'
    sp.run(["xcrun", "simctl", "openurl", drive.U, park], capture_output=True)
    time.sleep(2.5)
    drive.dismiss_logbox(); drive.dismiss_sheet()
    before = drive.labels()

    sp.run(["xcrun", "simctl", "openurl", drive.U, f"euphorianative://{path}"], capture_output=True)
    time.sleep(3.0)
    after = drive.labels()
    changed = len(after ^ before)
    if changed < 6:
        return {'route': name, 'navigated': False, 'labels_changed': changed}

    h = f"{OUT}/{name}.h264"
    record(h, dwell)
    n, rate = real_rate(h, dwell + 1.2)
    fd = f"{OUT}/fr"; sp.run(["rm", "-rf", fd]); os.makedirs(fd)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h,
            "-vf", "scale=iw/3:ih/3", f"{fd}/%05d.png"], check=True)
    fr = sorted(glob.glob(f"{fd}/*.png"))
    if len(fr) < 10:
        sp.run(["rm", "-rf", fd]); return {'route': name, 'navigated': True, 'error': 'few-frames'}
    from PIL import Image
    im = Image.open(fr[0]); tot = (im.width // 4) * (im.height // 4)
    ser = diffs(fr); ws = windows(ser, tot)
    moving = sum(1 for v in ser if v > 30)
    sp.run(["rm", "-rf", fd])
    return {'route': name, 'navigated': True, 'labels_changed': changed, 'fps': round(rate, 1),
            'idle_motion_pct': round(100 * moving / max(1, len(ser)), 1),
            'windows': len(ws),
            'longest_s': round(max(((b - a + 1) / rate for a, b in ws), default=0), 2)}

if __name__ == '__main__':
    rs = routes()
    only = sys.argv[1:]
    if only: rs = [r for r in rs if r[0] in only]
    res = []
    print(f"{len(rs)} routes, navigation verified per route\n", flush=True)
    print(f"{'route':<20}{'nav':>5}{'idle%':>8}{'wins':>6}{'longest':>9}", flush=True)
    for name, path in rs:
        r = one(name, path)
        res.append(r)
        json.dump(res, open(f"{OUT}/routes.json", 'w'), indent=1)
        if not r.get('navigated'):
            print(f"{name:<20}{'NO':>5}   (labels changed {r.get('labels_changed')}) SKIPPED", flush=True)
        else:
            print(f"{name:<20}{'yes':>5}{r.get('idle_motion_pct','?'):>8}{r.get('windows','?'):>6}{r.get('longest_s','?'):>9}", flush=True)
    nav = sum(1 for r in res if r.get('navigated'))
    print(f"\n{nav}/{len(res)} routes actually navigated and were scored", flush=True)
