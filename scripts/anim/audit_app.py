#!/usr/bin/env python3
"""Record the WHOLE app in one continuous pass, then score every transition.

One recording, not 26. A per-route recording restarts the encoder each time and loses the
transition INTO the route, which is the most animated moment there is. So the stream runs
unbroken and each route's open time is logged, letting every motion window be attributed back
to the screen that produced it.

Capture is idb video-stream at ~48fps -- simctl's fixed 15fps cannot resolve a 280ms spring
(see refs/MOTION_RUBRIC.md). Frames extract at 1/3 scale: enough for segmentation and
filmstrips, and it keeps a ten-minute pass in the low GB rather than tens of them.

Scored against refs/MOTION_RUBRIC.md R1 (duration) and R2 (single-pass settle).
"""
import subprocess as sp, sys, os, glob, json, time, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import record, real_rate
from segment import diffs, windows
from oscillate import peaks
import drive

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/appaudit"
U = drive.U

def routes():
    out, txt = [], open('scripts/routes.sh').read()
    for line in txt.splitlines():
        line = line.strip().strip('"')
        if ':' in line and not line.startswith('#') and not line.startswith('ROUTES'):
            name, path = line.split(':', 1)
            if name and path and ' ' not in name:
                out.append((name, path.rstrip('"')))
    return out

def walk(marks, dwell, t0):
    """Open each route, let it settle, scroll it, scroll back. Log when each opened."""
    for name, path in routes():
        marks.append((round(time.time() - t0, 2), name))
        sp.run(["xcrun", "simctl", "openurl", U, f"euphorianative://{path}"], capture_output=True)
        time.sleep(dwell * 0.45)
        drive.dismiss_logbox()
        # scrolling is where most of an app's motion actually lives
        for _ in range(2):
            sp.run(["idb", "ui", "swipe", "--udid", U, "200", "700", "200", "300", "--duration", "0.25"],
                   capture_output=True)
            time.sleep(dwell * 0.14)
        sp.run(["idb", "ui", "swipe", "--udid", U, "200", "300", "200", "700", "--duration", "0.25"],
               capture_output=True)
        time.sleep(dwell * 0.27)
    marks.append((round(time.time() - t0, 2), '__end__'))

def main(dwell=9.0, scale=3):
    os.makedirs(OUT, exist_ok=True)
    if drive.at_launcher(): drive.reconnect()
    drive.dismiss_logbox()
    rs = routes()
    secs = len(rs) * dwell + 6
    print(f"{len(rs)} routes · dwell {dwell}s · ~{secs/60:.1f} min recording", flush=True)

    h264 = f"{OUT}/app.h264"
    marks, t0 = [], time.time()
    t = threading.Thread(target=walk, args=(marks, dwell, t0)); t.start()
    record(h264, secs)
    t.join(timeout=60)

    n, rate = real_rate(h264, secs + 1.2)
    print(f"recorded {n} frames @ {rate:.1f} fps ({os.path.getsize(h264)//1024//1024} MB)", flush=True)

    fd = f"{OUT}/frames"; sp.run(["rm", "-rf", fd]); os.makedirs(fd)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h264,
            "-vf", f"scale=iw/{scale}:ih/{scale}", f"{fd}/%06d.png"], check=True)
    frames = sorted(glob.glob(f"{fd}/*.png"))
    print(f"extracted {len(frames)} frames at 1/{scale} scale", flush=True)

    from PIL import Image
    im = Image.open(frames[0]); tot = (im.width // 4) * (im.height // 4)
    series = diffs(frames)
    wins = windows(series, tot)
    print(f"{len(wins)} motion windows", flush=True)

    def route_at(sec):
        cur = '?'
        for ms, nm in marks:
            if ms <= sec and nm != '__end__': cur = nm
        return cur

    findings = []
    for a, b in wins:
        dur, t_s = (b - a + 1) / rate, a / rate
        pk = peaks(series[a:b + 1])
        findings.append({'route': route_at(t_s), 't': round(t_s, 2), 'dur': round(dur, 3),
                         'peaks': pk,
                         'R1': 'PASS' if 0.13 <= dur <= 1.20 else 'OUTSIDE',
                         'R2': 'PASS' if (dur > 0.35 or pk == 1) else 'FAIL'})
    json.dump({'fps': rate, 'frames': len(frames), 'marks': marks, 'findings': findings},
              open(f"{OUT}/report.json", 'w'), indent=1)
    return findings, marks, rate

if __name__ == '__main__':
    d = float(sys.argv[1]) if len(sys.argv) > 1 else 9.0
    findings, marks, rate = main(d)
    import collections
    per = collections.defaultdict(list)
    for f in findings: per[f['route']].append(f)
    print(f"\n{'route':<20}{'wins':>6}{'R1 out':>8}{'R2 fail':>9}{'longest':>9}")
    for name, _ in routes():
        g = per.get(name, [])
        if not g: print(f"{name:<20}{0:>6}{'-':>8}{'-':>9}{'-':>9}"); continue
        r1 = sum(1 for x in g if x['R1'] != 'PASS'); r2 = sum(1 for x in g if x['R2'] != 'PASS')
        print(f"{name:<20}{len(g):>6}{r1:>8}{r2:>9}{max(x['dur'] for x in g):>9.2f}")
    tot = len(findings)
    print(f"\ntotal {tot} transitions · R1 outside {sum(1 for f in findings if f['R1']!='PASS')}"
          f" · R2 fail {sum(1 for f in findings if f['R2']!='PASS')}")
