#!/usr/bin/env python3
"""Measure a route's ENTRY transition — recording starts BEFORE the deep link fires.

WHY THIS EXISTS. Every earlier attempt at entry timing was invalid: sweep.one() navigated, waited
3.5s, and only then started recording, so the entrance was over before the camera rolled. The
tell was that every lesson's "first transition" read t=0.0 with dur~0.06s, identical across all
15 -- recording-start artefacts, not entries. An entry-duration table was being built on them.

So here the order is reversed: arm the recorder, let it settle, THEN navigate, and locate the
entry as the first substantial motion window after the link fires.

Also parks the app on a NEUTRAL route first, because a deep link silently no-ops when the app is
already on the target -- measured across a 26-route walk where only 9 of 23 actually navigated.
"""
import subprocess as sp, sys, os, glob, time, json, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import record, real_rate
from segment import diffs, windows
from oscillate import peaks
import drive

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/entry"

def probe(route, park='(tabs)/home', secs=6.0, lead=1.8):
    os.makedirs(OUT, exist_ok=True)
    if drive.at_launcher(): drive.reconnect()
    drive.dismiss_logbox(); drive.dismiss_sheet()
    sp.run(["xcrun", "simctl", "openurl", drive.U, f"euphorianative://{park}"], capture_output=True)
    time.sleep(3.0)
    drive.dismiss_logbox(); drive.dismiss_sheet()

    h264 = f"{OUT}/{route.replace('/','_')}.h264"
    fired = {}
    def go():
        time.sleep(lead)                       # let the recorder reach steady state
        fired['at'] = time.time()
        sp.run(["xcrun", "simctl", "openurl", drive.U, f"euphorianative://{route}"], capture_output=True)
    t0 = time.time()
    th = threading.Thread(target=go); th.start()
    record(h264, secs)
    th.join(timeout=10)

    n, rate = real_rate(h264, secs + 1.2)
    fd = f"{OUT}/fr"; sp.run(["rm", "-rf", fd]); os.makedirs(fd)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h264, f"{fd}/%05d.png"], check=True)
    fr = sorted(glob.glob(f"{fd}/*.png"))
    if len(fr) < 20: return {'route': route, 'error': 'too-few-frames'}

    from PIL import Image
    im = Image.open(fr[0]); tot = (im.width // 4) * (im.height // 4)
    ser = diffs(fr)
    wins = windows(ser, tot)
    # THE ENTRY IS THE BIGGEST WINDOW AFTER THE LINK, NOT THE FIRST.
    # Taking the first one reported search's entry as 0.18s / 2,036px, because a small artefact
    # window landed 0.08s after the link while the actual entrance -- 0.80s and 90,511px -- began
    # 0.47s later. That produced a "search has essentially no entrance animation" finding that was
    # entirely an artefact of which window got picked.
    link_frame = int((fired.get('at', t0) - t0 + 1.2) * rate)   # +1.2 for record()'s own warm-up
    after = [(a, b) for a, b in wins if b >= link_frame and (b - a + 1) / rate >= 0.08]
    cand = sorted(after, key=lambda ab: -max(ser[ab[0]:ab[1] + 1]))
    sp.run(["rm", "-rf", fd])
    if not cand:
        return {'route': route, 'fps': round(rate, 1), 'entry': None,
                'note': 'no substantial window after the link — route may not have navigated'}
    a, b = cand[0]
    return {'route': route, 'fps': round(rate, 1), 'link_frame': link_frame,
            'entry_start_s': round(a / rate, 2), 'dur': round((b - a + 1) / rate, 3),
            'peaks': peaks(ser[a:b + 1]), 'peak_px': max(ser[a:b + 1]),
            'windows_after_link': len(after)}

if __name__ == '__main__':
    routes = sys.argv[1:] or ['courses', 'search', 'league', 'you']
    res = []
    for r in routes:
        out = probe(r)
        res.append(out)
        print(json.dumps(out), flush=True)
    json.dump(res, open(f"{OUT}/entries.json", 'w'), indent=1)
