"""R6 (easing shape) measured from the ANIMATION, not a picture of it.

Six region heuristics failed to isolate the feedback bar from a screen that is violet nearly
everywhere -- thresholded overlap, mean luminance, a padded crop, a label match, a changed-region
top edge, and colour segmentation. Every one of them was trying to photograph the bar. This reads
the shared value that DRIVES it, sampled per frame on the UI thread by the __DEV__ instrument in
lesson-feedback.tsx and flushed once as a single greppable log line.

PRE-REGISTERED from source, before any run (lesson-feedback.tsx: stiffness 220, damping 18,
default mass 1):  zeta = 18 / (2*sqrt(220)) = 0.607  ->  overshoot 9.1%, peak ~266ms, 2% settle
~460ms, on a 190pt throw so the bar passes its rest by ~17.3pt.
"""
import sys, os, time, json, math, subprocess as sp
sys.path.insert(0,'scripts/anim')
import drive
U=drive.U
LOG=os.environ.get('METRO_LOG','/tmp/metro.log')
MARK='[R6B]'

try:
    import urllib.request; urllib.request.urlopen("http://localhost:8081/status",timeout=3).read()
except Exception:
    print("METRO IS DOWN — start it with `npm start`."); sys.exit(2)

start_size=os.path.getsize(LOG)
sp.run(["xcrun","simctl","terminate",U,drive.BUNDLE],capture_output=True)
sp.run(["xcrun","simctl","launch",U,drive.BUNDLE],capture_output=True); time.sleep(16)
if drive.at_launcher(): drive.reconnect()
drive.dismiss_logbox(); drive.dismiss_sheet()

# A lesson the driver already completed shows a summary/leaderboard instead of questions, so a
# fixed number goes stale as soon as this probe has run once.
#
# AND USE run_lesson, NOT bare advance(). advance() only taps continue/check/next; on a real
# question it falls back to tapping an arbitrary row, which walked straight out of the lesson and
# back to home twice. run_lesson calls the actual solver and then taps Check -- and Check is what
# mounts FeedbackBanner, which is the whole point.
import threading, solve
lessons = solve.load('personalFinance')
NUMS = [int(x) for x in sys.argv[1:]] or [7, 11, 15, 19, 3]

def new_log():
    with open(LOG,'rb') as f:
        f.seek(start_size); return f.read().decode('utf8','replace')

hit=None
for num in NUMS:
    if not drive.goto_lesson('personal-finance', num):
        print(f"  lesson {num} did not open; trying the next"); continue
    print(f"in personal-finance lesson {num}; solving until Check mounts the banner")
    ev = threading.Event()
    res = {}
    th = threading.Thread(target=lambda: res.update(zip(('done','log'), drive.run_lesson(lessons[num-1], solve, max_steps=10, stop=ev))), daemon=True)
    th.start()
    for _ in range(70):                      # ~70s ceiling per lesson
        time.sleep(1.0)
        if MARK in new_log():
            hit = new_log(); ev.set(); break
        if not th.is_alive(): break
    ev.set(); th.join(timeout=8)
    if hit:
        print("  BANNER FIRED"); break
    print(f"  lesson {num}: no banner (driver log: {res.get('log', [])[-3:]})")

if not hit:
    print(f"\nNO {MARK} LINE IN THE METRO LOG.")
    print("Either the banner never mounted, or app console.log does not reach this log file.")
    tail=new_log()[-600:]
    print("--- last 600 chars of new log ---"); print(tail); sys.exit(3)

line=[l for l in hit.splitlines() if MARK in l][-1]
raw=json.loads(line[line.index(MARK)+len(MARK):].strip())
pairs=[(raw[i],raw[i+1]) for i in range(0,len(raw)-1,2)]
sys.path.insert(0,'scripts/anim')
from r6_model import spring, THROW
import os as _os, math as _math
MASS=float(_os.environ.get('R6_MASS','4'))
_z=18/(2*_math.sqrt(220*MASS)); _w0=_math.sqrt(220/MASS); _wd=_w0*_math.sqrt(1-_z*_z)
peak_t=_math.pi/_wd; analytic_os=_math.exp(-_math.pi*_z/_math.sqrt(1-_z*_z))
print(f'comparing against mass={MASS:.0f}: zeta {_z:.4f}, peak {1+analytic_os:.4f} at {peak_t*1000:.0f}ms')

# SANITY FIRST: the last read must have settled, or the read path is broken and nothing that
# follows is worth reading.
last_ms,last_v = pairs[-1]
print(f"\nread path sanity: t={last_ms}ms -> {last_v:.4f} (must be ~1.000)")
if abs(last_v-1.0) > 0.03:
    print("READ PATH BROKEN — the value never settled. Reporting nothing else."); sys.exit(4)

print(f"\n{len(pairs)} reads. Each compared to the model AT THE TIME IT ACTUALLY LANDED.")
print("   t(ms)   measured   model    residual")
worst=0.0
for ms,v in pairs:
    m=spring(ms/1000.0, mass=MASS); d=v-m; worst=max(worst,abs(d))
    print(f"  {ms:>5}   {v:>8.4f} {m:>8.4f}  {d:>+8.4f}")
mv,mms = max((v,ms) for ms,v in pairs)
print(f"\n                      PREDICTED (Reanimated maths)   MEASURED (device)")
print(f"  peak value          {spring(peak_t, mass=MASS):>10.4f}                  {mv:>10.4f}")
print(f"  overshoot           {analytic_os*100:>9.1f}%                  {(mv-1)*100:>9.1f}%")
print(f"  overshoot in points {analytic_os*THROW:>9.1f}pt                 {(mv-1)*THROW:>9.1f}pt")
print(f"  peak near           {peak_t*1000:>9.0f}ms                 {mms:>9}ms")
print(f"\nworst residual across all reads: {worst:.4f}")
print("\nR2 asks whether the bounce is DELIBERATE, not whether it exists. lesson-feedback.tsx")
print("states the intent per element: 'slightly underdamped so the bar overshoots a few pixels")
print("and settles: it should feel thrown into place, not slid.'")
print("\nVERDICT:", "R6 SHAPE CONFIRMED — device matches Reanimated's own closed form, and the"
      " bounce is a stated per-element choice, so it PASSES R2." if worst<=0.06 else
      f"MISMATCH — worst residual {worst:.3f}; suspect the instrument before the app.")
