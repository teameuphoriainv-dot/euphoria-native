"""How far does the quiz-head mascot actually HOP when the answer is right?

READ THIS FIRST: THE CENTROID ROUTE IN HERE IS CONFOUNDED AND ITS NUMBERS WERE RETRACTED.

Three runs produced 4.11pt, 3.38pt and 3.12pt -- including a HIGHER gain measuring SMALLER, which
is impossible. Two confounds, either fatal on its own:

  * ATLAS CHANGES EXPRESSION ON ANSWER. The eyes and brows swap, which moves the bright-pixel
    centroid without the mascot moving at all. A centroid cannot separate "the face changed" from
    "the body hopped".
  * THE FEEDBACK BANNER RE-LAYS-OUT THE SCREEN as it mounts, shifting everything above it by a few
    points -- comparable to the ~4pt hop being measured.

The question was settled by ARITHMETIC instead, which has neither confound: the launch spring at
atlas.tsx:271 peaks at (1 + overshoot) * H, so making mass explicit moved the peak from 1.524H to
1.251H. At size 56 and gain 0.5, H = 3.36pt, so the hop went 5.12pt -> 4.20pt against a 3.33pt
shake: 1.54x -> 1.26x, still inside lesson.tsx's stated "roughly 4.2-5.0pt, clearly above the
shake". No gain change was needed and none was shipped.

WHAT IS STILL WORTH KEEPING HERE, and what a future attempt should reuse:
  * the correct-answer gate. A WRONG answer shakes the mascot HORIZONTALLY (shakeX), which a
    vertical centroid reads as nothing happening -- this probe reported a flat 44.4pt across all
    149 frames before the gate existed, and then quoted a single-frame outlier as a hop.
  * the detrending. "Resting" is not a thing this mascot does: it idles continuously, so a fixed
    baseline spreads 1.38pt and is meaningless. The idle is slow and the hop is fast, so a ~1.4s
    moving median tracks the idle and cannot follow the hop.
  * both axes, so a shake and a hop are distinguishable.
  * the region, taken from a LABELLED SIBLING because Atlas has no accessibility label when
    interactive={false}, then drawn on a screenshot and checked by eye.

THE RIGHT INSTRUMENT NEXT TIME is the one that closed R6: read `jumpY` itself with a handful of
__DEV__ JS timers, each recording its own arrival time. That measures the animation rather than a
picture of it, and neither confound above can touch it. See scripts/anim/r6_probe.py.
"""
import sys, os, time, subprocess as sp
sys.path.insert(0, 'scripts/anim')
import drive, solve, capture
from PIL import Image, ImageDraw, ImageChops

U = drive.U
OUT = os.environ.get('CELOUT', '/tmp/celebrate')
os.makedirs(OUT, exist_ok=True)
ATLAS_PT = 56.0
PAD_PT = 14.0          # pad, or a hop beyond the resting box is invisible and reads as "no change"

try:
    import urllib.request
    urllib.request.urlopen("http://localhost:8081/status", timeout=3).read()
except Exception:
    print("METRO IS DOWN — start it with `npm start`."); sys.exit(2)

NUMS = [int(x) for x in sys.argv[1:]] or [2, 4, 6, 8, 10]
sp.run(["xcrun", "simctl", "terminate", U, drive.BUNDLE], capture_output=True)
sp.run(["xcrun", "simctl", "launch", U, drive.BUNDLE], capture_output=True)
time.sleep(16)
if drive.at_launcher():
    drive.reconnect()
drive.dismiss_logbox(); drive.dismiss_sheet()

lessons = solve.load('personalFinance')
band = None
for num in NUMS:
    if not drive.goto_lesson('personal-finance', num):
        print(f"  lesson {num} did not open"); continue
    print(f"in personal-finance lesson {num}")
    # walk forward until a step the solver can answer is on screen
    for step in range(10):
        drive.dismiss_logbox()
        ok, kind = solve.answer(lessons[num - 1])
        if ok:
            print(f"  answered a {kind} step; looking for the mascot")
            break
        moved, how = drive.advance()
        if not moved and how in ('stuck', 'no-button'):
            break
    else:
        continue
    # The prompt is the mascot's labelled sibling: a title in the same row, Atlas to its LEFT and
    # TOP-ALIGNED to its first line (Atlas is top-aligned, not centred -- centring on a four-line
    # prompt once put the box 30pt low over empty space).
    cands = [n for n in drive.nodes() if n[2] > 200 and 40 < n[1] < 500 and len(n[4]) > 18]
    if not cands:
        print("  no prompt-like node"); continue
    p = sorted(cands, key=lambda z: z[1])[0]
    x1 = p[0]
    x0 = max(0.0, x1 - ATLAS_PT - 20)
    band = (x0 - PAD_PT, p[1] - PAD_PT, x1, p[1] + ATLAS_PT + PAD_PT)
    print(f"  prompt {p[4][:34]!r} at x={p[0]} y={p[1]}")
    print(f"  mascot band (pt): x {band[0]:.0f}..{band[2]:.0f}  y {band[1]:.0f}..{band[3]:.0f}")
    break

if band is None:
    print("could not locate the mascot band"); sys.exit(1)

shot = f"{OUT}/pre.png"
sp.run(["xcrun", "simctl", "io", U, "screenshot", shot], capture_output=True)
im = Image.open(shot); sx = im.width / 402.0
px_band = tuple(int(v * sx) for v in band)
d = Image.open(shot); ImageDraw.Draw(d).rectangle(list(px_band), outline=(255, 0, 0), width=6)
d.save(f"{OUT}/band.png")
Image.open(shot).crop(px_band).save(f"{OUT}/band_crop.png")
print(f"  band drawn -> {OUT}/band.png and band_crop.png  (LOOK AT THEM)")

btn = drive.button('check', 'continue')
if not btn:
    print("no Check button on screen"); sys.exit(1)
bx, by = btn[0][0] + btn[0][2] // 2, btn[0][1] + btn[0][3] // 2


def fire():
    drive.dismiss_logbox()          # the RevenueCat banner overlaps the footer and EATS taps
    sp.run(["idb", "ui", "tap", "--udid", U, str(bx), str(by)], capture_output=True)


vid = f"{OUT}/cel.h264"
capture.record(vid, 2.6, quality=1.0, during=fire)
n, rate = capture.real_rate(vid, 2.6 + 1.2)
labs = ' '.join(l or '' for l in drive.labels()).lower()
wrong = any(k in labs for k in ('not quite', 'incorrect', "that's not", 'not right'))
right = any(k in labs for k in ('correct', 'nice', 'exactly', 'well done', 'got it'))
print(f"verdict on screen after the tap: {'WRONG' if wrong else ('CORRECT' if right else 'UNKNOWN')}")
if wrong or not right:
    print("The answer was not marked correct, so no celebrate hop was ever triggered. A wrong")
    print("answer shakes the mascot HORIZONTALLY, which a vertical centroid reads as no motion.")
    print("Refusing to quote an amplitude."); sys.exit(5)
print(f"\ncaptured {n} frames at a real {rate:.1f} fps")
fdir = f"{OUT}/f"
capture.frames(vid, fdir, fps=60)
files = sorted(f for f in os.listdir(fdir) if f.endswith('.png'))


def centroid_xy(path):
    """BOTH axes. A hop is vertical (jumpY); a WRONG answer shakes the mascot horizontally
    (shakeX). A vertical-only centroid cannot tell a wrong answer from nothing happening at all --
    which is exactly how this probe first reported a flat 44.4pt across all 149 frames and then
    quoted a single-frame outlier as a hop. Track x too, and the two events separate."""
    im = Image.open(f"{fdir}/{path}").convert('RGB').crop(px_band)
    r, g, b = im.split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), b)
    W, H = m.size
    p = m.load()
    nx = ny = den = 0.0
    for y in range(H):
        for x in range(0, W, 2):
            v = p[x, y]
            if v > 60:
                nx += v * x; ny += v * y; den += v
    return None if den == 0 else (nx / den, ny / den)


def centroid(path):
    """Vertical centroid of the mascot's own bright pixels, per-channel max (never convert('L'):
    luminance weights blue at 0.114 and this palette is violet on near-black)."""
    im = Image.open(f"{fdir}/{path}").convert('RGB').crop(px_band)
    r, g, b = im.split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), b)
    W, H = m.size
    p = m.load()
    num = den = 0.0
    for y in range(H):
        for x in range(0, W, 2):                 # every other column: 2x faster, same centroid
            v = p[x, y]
            if v > 60:
                num += v * y; den += v
    return None if den == 0 else num / den


series, xseries = [], []
for f in files:
    c = centroid_xy(f)
    if c is not None:
        xseries.append(c[0] / sx); series.append(c[1] / sx)   # px -> pt

if len(series) < 20:
    print(f"only {len(series)} usable frames; nothing to report"); sys.exit(3)

# ASSERT SOMETHING MOVED before quoting any amplitude. A displacement of zero passes every
# ratio test perfectly -- that is how this audit once printed VERDICT: SNAPPED on a static rail.
#
# AND DETREND, because "resting" is not a thing this mascot does. Atlas idles continuously --
# breath, sway and a 3.9s head rock -- so the first five frames spread 1.38pt and a fixed baseline
# is meaningless. The idle is SLOW (seconds) and the hop is FAST (a few hundred ms), so subtract a
# moving median about a second wide: it tracks the idle and cannot follow the hop.
def median(xs):
    ys = sorted(xs); n = len(ys)
    return ys[n // 2] if n % 2 else (ys[n // 2 - 1] + ys[n // 2]) / 2

W = max(8, int(rate * 0.7))
dev = [v - median(series[max(0, i - W):i + W + 1]) for i, v in enumerate(series)]
peak = max(dev, key=abs)
peak_i = dev.index(peak)
# noise floor: the idle's own residual after detrending, away from the hop
quiet = [abs(d) for i, d in enumerate(dev) if abs(i - peak_i) > W]
floor = median(quiet) if quiet else 0.0
print(f"detrended with a {2*W+1}-frame moving median (~{(2*W+1)/max(rate,1):.1f}s)")
print(f"idle noise floor after detrending: {floor:.2f}pt   |   peak excursion {abs(peak):.2f}pt")
if abs(peak) < 0.6:
    print(f"NOTHING MOVED (peak {abs(peak):.2f}pt) — the tap never produced a hop. Nothing to report.")
    sys.exit(0)
if floor > 0 and abs(peak) / floor < 3.0:
    print(f"peak is only {abs(peak)/floor:.1f}x the idle floor — not separable from the idle. Not reporting.")
    sys.exit(0)

RECORDED_MASS4 = 4.57
PREDICTED = 4.57 * (1.251 / 1.524)
SHAKE = 3.33
xdev = [v - median(xseries[max(0, i - W):i + W + 1]) for i, v in enumerate(xseries)]
xpeak = max(xdev, key=abs)
print(f"peak HORIZONTAL excursion {abs(xpeak):.2f}pt (the shake axis; a hop should be vertical)")
print(f"\npeak vertical displacement {abs(peak):.2f}pt at frame {peak_i} (~{peak_i / max(rate,1) * 1000:.0f}ms)")
print(f"\n                          recorded (mass 4)   predicted (mass 1)   measured now")
print(f"  celebrate hop                 {RECORDED_MASS4:.2f}pt              {PREDICTED:.2f}pt        {abs(peak):.2f}pt")
print(f"  wrong-answer shake            {SHAKE:.2f}pt              {SHAKE:.2f}pt        {SHAKE:.2f}pt (mass-invariant)")
print(f"  correct-vs-wrong ratio        {RECORDED_MASS4/SHAKE:.2f}x               {PREDICTED/SHAKE:.2f}x         {abs(peak)/SHAKE:.2f}x")
err = abs(abs(peak) - PREDICTED) / PREDICTED * 100
print(f"\nprediction error {err:.0f}%")
print("lesson.tsx:436-442 asks for 'roughly 4.2-5.0pt, clearly above the shake'.")
if abs(peak) >= 4.2:
    print("VERDICT: still inside the author's stated range — the mass fix did NOT undo the tuning.")
elif abs(peak) / SHAKE >= 1.25:
    print("VERDICT: below the stated range but still clearly above the shake — judgement call.")
else:
    print("VERDICT: REGRESSION — the hop is back at parity with the shake, which is exactly the")
    print("         condition celebrateGain 0.5 was raised to escape. Gain needs restoring.")
