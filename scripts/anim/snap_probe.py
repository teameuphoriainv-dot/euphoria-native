"""Course-rail snap, measured by 2-D crop correlation.

WHY THIS REPLACES snap2_probe.py
--------------------------------
snap2 collapsed the rail band to a SINGLE ROW (`im.resize((w, 1))`) before
correlating. That throws away every vertical feature -- card art, the title
baseline, the progress pip -- and leaves a 1-D signature dominated by column
means. It scored 0.695 on a real flick, under the 0.75 floor I pre-registered,
so the run produced no verdict.

Here the FULL 2-D band is correlated, and a small vertical offset is searched
too (+/- VSEARCH px) so that a few pixels of page drift between the two
screenshots cannot depress the score.

PRE-REGISTERED, unchanged from snap2 so the comparison is honest:
  snapToInterval = RAIL_CARD_WIDTH(132) + Spacing.two(8) + 4 = 144pt = 432px @3x
  A snapped rail rests on a multiple of 144pt. Grid tolerance 10pt.
  Correlation floor 0.75. Non-zero-movement guard 20px.

THE GUARD THAT MATTERS: assert the rail actually MOVED before testing whether
the displacement is on-grid. Zero is an exact multiple of everything, which is
how an earlier probe printed "SNAPPED" on a stationary rail.

Run `python3 /tmp/snap3_probe.py --selftest` to exercise the matcher alone.
"""
import sys, time, os, subprocess as sp
import numpy as np
from PIL import Image

INTERVAL_PT = 144
CORR_FLOOR  = 0.75
GRID_TOL_PT = 10.0
MIN_MOVE_PX = 20
VSEARCH     = 6      # vertical drift absorbed, px
ROW_STEP    = 4      # row subsample for speed


def ncc2d(before, after, max_shift, want_peaks=1):
    """Best (dx, dy, r) aligning `after` onto `before` shifted left by dx.

    The rail scrolls LEFT, so content at before[x + dx] lands at after[x].

    The vertical offset is applied at FULL resolution and the rows are
    subsampled only afterwards. Doing it the other way round makes `dy` a
    multiple of ROW_STEP, so sub-ROW_STEP drift stays uncorrected -- the
    selftest caught exactly that and the matcher locked onto a harmonic.
    """
    A = before.astype(np.float64)
    B = after.astype(np.float64)
    H, W = A.shape
    curve = {}
    for dy in range(-VSEARCH, VSEARCH + 1):
        if dy >= 0:
            av, bv = A[dy:], (B[:H - dy] if dy else B)
        else:
            av, bv = A[:H + dy], B[-dy:]
        if av.shape[0] < 8:
            continue
        av = av[::ROW_STEP]          # subsample AFTER aligning vertically
        bv = bv[::ROW_STEP]
        for dx in range(0, max_shift):
            n = W - dx
            if n < 200:
                break
            sa = av[:, dx:]
            sb = bv[:, :n]
            sa = sa - sa.mean()
            sb = sb - sb.mean()
            den = np.sqrt((sa * sa).sum() * (sb * sb).sum())
            if den == 0:
                continue
            r = float((sa * sb).sum() / den)
            if r > curve.get(dx, (-2, 0))[0]:
                curve[dx] = (r, dy)
    if not curve:
        return (0, 0, -1.0) if want_peaks == 1 else []
    ranked = sorted(((r, dx, dy) for dx, (r, dy) in curve.items()), reverse=True)
    if want_peaks == 1:
        r, dx, dy = ranked[0]
        return dx, dy, r
    # distinct peaks: at least 60px apart, so one broad lobe is not counted twice
    peaks = []
    for r, dx, dy in ranked:
        if all(abs(dx - q[0]) >= 60 for q in peaks):
            peaks.append((dx, dy, r))
        if len(peaks) == want_peaks:
            break
    return peaks


def selftest():
    rng = np.random.default_rng(7)
    base = rng.integers(0, 255, size=(160, 1200)).astype(np.uint8)
    # give it card-like vertical structure so a 1-D collapse would be weaker
    for c in range(0, 1200, 144):
        base[20:140, c:c + 8] = 250
    ok = 0

    for truth in (432, 864, 200):
        after = np.zeros_like(base)
        after[:, :1200 - truth] = base[:, truth:]
        dx, dy, r = ncc2d(base, after, 1000)
        assert dx == truth, f"shift {dx} != {truth}"
        assert dy == 0, f"dy {dy} != 0"
        assert r > 0.99, f"corr {r} too low on an exact shift"
        ok += 3

    # vertical drift of 3px must still recover the horizontal shift
    truth = 432
    after = np.zeros((160, 1200), dtype=np.uint8)
    after[:157, :1200 - truth] = base[3:, truth:]
    dx, dy, r = ncc2d(base, after, 1000)
    assert dx == truth, f"drifted shift {dx} != {truth}"
    assert r > 0.95, f"drifted corr {r} too low"
    ok += 2

    # a stationary rail must report dx == 0, so the movement guard can catch it
    dx, dy, r = ncc2d(base, base.copy(), 1000)
    assert dx == 0, f"stationary reported {dx}"
    assert r > 0.999
    ok += 2

    # pure noise must NOT produce a confident match
    noise = rng.integers(0, 255, size=(160, 1200)).astype(np.uint8)
    dx, dy, r = ncc2d(base, noise, 600)
    assert r < 0.5, f"noise scored {r}, matcher is not discriminating"
    ok += 1

    print(f"snap3 matcher --selftest: {ok} assertions passed")


if '--selftest' in sys.argv:
    selftest()
    sys.exit(0)

# ---------------------------------------------------------------- device run
sys.path.insert(0, 'scripts/anim')
import drive
U = drive.U
OUT = ("/private/tmp/claude-501/-Users-siddarthakodithyala/"
       "3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/snap3")
os.makedirs(OUT, exist_ok=True)

sp.run(["xcrun", "simctl", "terminate", U, drive.BUNDLE], capture_output=True)
sp.run(["xcrun", "simctl", "launch", U, drive.BUNDLE], capture_output=True)
time.sleep(16)
if drive.at_launcher():
    drive.reconnect()
drive.dismiss_logbox(); drive.dismiss_sheet()
# The deep link euphorianative://home does not reliably land on Home -- the app
# restores its last tab (observed landing on Trade). Tap the Home tab instead;
# the tab bar is fixed at y=790..840 and is the only reliable route.
sp.run(["xcrun", "simctl", "openurl", U, "euphorianative://home"], capture_output=True)
time.sleep(2.5)
drive.dismiss_logbox()
for attempt in range(3):
    labs = [l for l in drive.labels() if l]
    if any('/25' in l for l in labs):
        break
    home = [n for n in drive.nodes() if n[4] == 'Home' and n[1] > 780]
    if not home:
        print("no Home tab in the tree:", sorted(labs)[:8]); sys.exit(1)
    h = home[0]
    sp.run(["idb", "ui", "tap", "--udid", U,
            str(h[0] + h[2] // 2), str(h[1] + h[3] // 2)], capture_output=True)
    time.sleep(2.0)
    drive.dismiss_logbox()
else:
    print("not on home after 3 taps:", sorted(drive.labels())[:8]); sys.exit(1)
print("on Home")


def rail_band():
    cs = [n for n in drive.nodes() if '/25' in n[4] and 120 <= n[2] <= 145]
    if not cs:
        return None
    c = sorted(cs, key=lambda z: z[1])[0]
    return c, c[1], c[1] + c[3]


got = rail_band()
if not got:
    print("no course cards"); sys.exit(1)
c, y0, y1 = got
SCREEN_H = 874
for _ in range(4):
    if y1 <= SCREEN_H - 40:
        break
    print(f"rail bottom y={y1} > {SCREEN_H-40}; scrolling page down", flush=True)
    sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.25",
            "200", "640", "200", "380"], capture_output=True)
    time.sleep(1.4)
    got = rail_band()
    if not got:
        print("rail left the tree after scrolling"); sys.exit(1)
    c, y0, y1 = got
if y1 > SCREEN_H - 40:
    print(f"could not bring the rail on screen (y1={y1})"); sys.exit(1)
print(f"rail band from a11y: y={y0}..{y1}  (card {c[4][:28]!r}, w={c[2]}pt)")

sp.run(["xcrun", "simctl", "io", U, "screenshot", f"{OUT}/before.png"], capture_output=True)
im = Image.open(f"{OUT}/before.png")
sx = im.width / 402.0
band = (0, int(y0 * sx), im.width, int(y1 * sx))
from PIL import ImageDraw
dbg = Image.open(f"{OUT}/before.png")
ImageDraw.Draw(dbg).rectangle(list(band), outline=(255, 0, 0), width=6)
dbg.save(f"{OUT}/band.png")
print("band drawn -> band.png (VERIFY BY EYE)")

# SHORTER FLICK than snap2. snap2 swiped 340->60 (280pt) in 0.10s and threw the
# rail 292.7pt = ~2 cards. 150pt over 0.15s should land about one card over,
# which keeps far more shared content in frame and lifts the correlation.
my = int(y0 + (y1 - y0) * 0.4)
sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.15",
        "300", str(my), "150", str(my)], capture_output=True)
time.sleep(2.5)
sp.run(["xcrun", "simctl", "io", U, "screenshot", f"{OUT}/after.png"], capture_output=True)


def band_arr(path):
    return np.asarray(Image.open(path).convert('L').crop(band), dtype=np.uint8)


a, b = band_arr(f"{OUT}/before.png"), band_arr(f"{OUT}/after.png")
print(f"band {a.shape[1]}x{a.shape[0]}px, rows subsampled by {ROW_STEP}, "
      f"vertical search +/-{VSEARCH}px")

peaks = ncc2d(a, b, min(1000, a.shape[1] - 200), want_peaks=3)
if not peaks:
    print("matcher produced no peaks"); sys.exit(1)
print("\ntop distinct peaks (>=60px apart):")
for i, (pdx, pdy, pr) in enumerate(peaks):
    print(f"  {i+1}. dx {pdx:4d}px = {pdx/sx:6.1f}pt   dy {pdy:+d}px   r {pr:.3f}"
          f"   ({pdx/sx/INTERVAL_PT:.2f} x card pitch)")
dx, dy, corr = peaks[0]
shift_pt = dx / sx

# A card rail is periodic at the card pitch, so a harmonic can masquerade as the
# true shift. Say so out loud when the runner-up is close.
if len(peaks) > 1 and peaks[1][2] > corr - 0.05:
    print(f"  !! runner-up is within 0.05 of the winner — the shift is AMBIGUOUS, "
          f"periodic card art. Treat the verdict as weak.")

print(f"\nbest 2-D match: dx {dx}px = {shift_pt:.1f}pt, dy {dy}px, correlation {corr:.3f}")

if dx < MIN_MOVE_PX:
    print(f"THE RAIL DID NOT MOVE (dx {dx}px < {MIN_MOVE_PX}px) — nothing to test.")
    sys.exit(0)
if corr < CORR_FLOOR:
    print(f"correlation {corr:.3f} below the pre-registered floor {CORR_FLOOR} "
          f"— no verdict, the measurement is not trustworthy.")
    sys.exit(0)

mult = shift_pt / INTERVAL_PT
off = min(shift_pt % INTERVAL_PT, INTERVAL_PT - shift_pt % INTERVAL_PT)
print(f"nearest multiple of {INTERVAL_PT}pt: {round(mult)} x {INTERVAL_PT} "
      f"= {round(mult)*INTERVAL_PT}pt   (measured {mult:.3f} x)")
print(f"distance from the grid: {off:.1f}pt   (tolerance {GRID_TOL_PT}pt)")
print("VERDICT:", "SNAPPED — rests on the card grid" if off <= GRID_TOL_PT
      else f"NOT SNAPPED — {off:.1f}pt off the grid")
