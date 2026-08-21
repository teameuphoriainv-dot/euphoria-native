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
MARK='[R6-FEEDBACK]'

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
print(f"\n{len(pairs)} frames captured, {pairs[0][0]}ms .. {pairs[-1][0]}ms")

# THE CONTROL. The instrument runs identically for the whole window, so if the frame interval is
# coarse while the banner mounts and fine once it settles, the drop belongs to the APP, not to the
# measurement. If it is coarse throughout, the instrument is the throttle and every number here is
# an artifact.
iv=[pairs[i+1][0]-pairs[i][0] for i in range(len(pairs)-1)]
early=[d for (ms,_),d in zip(pairs,iv) if ms<600]
late =[d for (ms,_),d in zip(pairs,iv) if ms>=1200]
print("  frame intervals ms:", iv)
if early: print(f"  during mount (<600ms):  n={len(early)} mean {sum(early)/len(early):.0f}ms  -> {1000/(sum(early)/len(early)):.0f}fps")
if late:  print(f"  after settle (>1200ms): n={len(late)} mean {sum(late)/len(late):.0f}ms  -> {1000/(sum(late)/len(late)):.0f}fps")
if early and late:
    e,l = sum(early)/len(early), sum(late)/len(late)
    print("  CONTROL:", "the drop is the APP's — the same instrument runs fine once the mount settles"
          if l < e*0.5 else "coarse THROUGHOUT — the instrument is the throttle and these numbers are artifacts")

vals=[v for _,v in pairs]
peak=max(vals); peak_ms=pairs[vals.index(peak)][0]
overshoot=(peak-1.0)*100
THROW=190.0
# 2% settle: last frame outside +/-2% of 1.0
out=[ms for ms,v in pairs if abs(v-1.0)>0.02]
settle=max(out) if out else 0
zeta=18/(2*math.sqrt(220))
pred_os=math.exp(-math.pi*zeta/math.sqrt(1-zeta*zeta))*100
print(f"\n                       PREDICTED (from source)   MEASURED (on device)")
print(f"  overshoot            {pred_os:>6.1f}%                 {overshoot:>6.1f}%")
print(f"  overshoot in points  {pred_os/100*THROW:>6.1f}pt                {overshoot/100*THROW:>6.1f}pt")
print(f"  peak at              {266:>6}ms                {peak_ms:>6}ms")
print(f"  2% settle at         {460:>6}ms                {settle:>6}ms")
print(f"  zeta                 {zeta:>6.3f}")
print("\nR2 asks whether the bounce is DELIBERATE, not whether it exists. The author's comment at")
print("lesson-feedback.tsx says 'slightly underdamped so the bar overshoots a few pixels and")
print("settles: it should feel thrown into place, not slid' -- chosen and stated per element.")
err=abs(overshoot-pred_os)/pred_os*100 if pred_os else 999
print(f"\novershoot prediction error: {err:.0f}%")
print("VERDICT:", "shape CONFIRMED — device matches source" if err<20 else
      "MISMATCH — suspect the instrument before the app")
