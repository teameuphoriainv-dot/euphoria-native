"""Does a horizontal rail COME TO REST ON ITS CARD GRID? (A/B against the app itself.)

Cross-correlating two screenshots is the wrong tool and is retired: a hard flick moves a rail
further than the 402pt frame is wide, and no correlation between two 402pt frames can express a
shift larger than 402pt. Total displacement is not the claim anyway. With snapToAlignment="start"
the claim is that EVERY resting position puts a card's left edge on the content inset -- one number
per flick, needing no frame-to-frame matching at all.

INSTRUMENT: phase-match a square wave (period = the snap interval, duty = the card width) against
the rail band's column brightness profile, sampled on card-body rows only and built from
PER-CHANNEL MAX (never .convert('L') -- luminance weights blue at 0.114 and this palette is violet
on near-black). The phase that maximises correlation IS the resting offset.

RUN IT AS AN A/B. Arm A is the shipping build; arm B patches the snap props out and lets Fast
Refresh apply them, restoring the file in a finally block. If both arms rest on the grid, the
instrument cannot tell them apart and NEITHER arm proves anything.

  python3 scripts/anim/snap_rest.py home AB
  python3 scripts/anim/snap_rest.py news AB

Three guards, each of which has already caught a false verdict here:

  * METRO MUST BE UP. With the dev server down the arm-B patch never reaches the device, so arm B
    silently measures the shipping build. at_launcher() returns False on the connect-error screen,
    so the existing check does NOT catch this and reconnect() cannot repair it.
  * MOVEMENT IS DETECTED ON THE ICON/IMAGE ROWS, NOT THE ROWS THE PHASE USES. Card-body rows are
    the same uniform fill on every card -- that is what makes them a clean square wave, and it is
    also why they cannot see movement: if the rail rests on an exact multiple of the interval, a
    shift of one whole card leaves that profile IDENTICAL. Sampled there, the guard reports "did
    not move" precisely when the snap is working perfectly. Observed: 5/5 flicks read NO while the
    template correlation alternated 0.936/0.337 as the selected card entered and left the band.
  * FLICK DIRECTIONS ALTERNATE. Five flicks the same way run the rail out of content and the last
    three rests are the same frozen frame. Observed: 3 of 5 unmoved.
"""
import sys, time, subprocess as sp, os
sys.path.insert(0, 'scripts/anim')
import drive
from PIL import Image, ImageChops, ImageDraw

U = drive.U
OUT = os.environ.get('SNAPOUT', '/tmp/snaprest')
os.makedirs(OUT, exist_ok=True)

RAILS = {
    # home course rail: home.tsx:519, RAIL_CARD_WIDTH(132) + Spacing.two(8) + 4
    'home': dict(
        route='euphorianative://home',
        present='/25',                       # a course card reads "<Course>, 0/25"
        marker='/25', wmin=120, wmax=145,
        interval=144.0, card=132.0, inset=16.0,
        prows=(0.34, 0.42),   # between icon and title: uniform card fill
        file='src/app/(tabs)/home.tsx',
        strip='          snapToInterval={RAIL_CARD_WIDTH + Spacing.two + 4}\n'
              '          snapToAlignment="start"\n'
              '          decelerationRate="fast"\n',
    ),
    # market-news rail: news-gallery.tsx:142, CARD_W(236) + Spacing.two(8)
    'news': dict(
        route='euphorianative://trade',
        present='opens in your browser',
        marker='opens in your browser', wmin=225, wmax=248,
        interval=244.0, card=236.0, inset=16.0,
        # The top ~54% of a news card is the article PHOTOGRAPH -- bright and arbitrary, so a
        # template of uniform cards cannot match there. Every correlation came back
        # 0.15-0.36, under the 0.60 floor, and nothing scored even though arm A sat at
        # 16.0pt on all five flicks. The clean fill is the strip between the image and the
        # publisher line.
        prows=(0.56, 0.63),
        file='src/components/news-gallery.tsx',
        strip='        snapToInterval={CARD_W + Spacing.two}\n'
              '        snapToAlignment="start"\n'
              '        decelerationRate="fast"\n',
    ),
}

WHICH = sys.argv[1] if len(sys.argv) > 1 else 'home'
ARMS = sys.argv[2] if len(sys.argv) > 2 else 'AB'
R = RAILS[WHICH]
INTERVAL_PT, CARD_PT, INSET_PT = R['interval'], R['card'], R['inset']
FLICKS = [("0.06", 340, 40), ("0.10", 60, 360), ("0.18", 330, 110), ("0.08", 50, 350), ("0.14", 345, 70)]


def metro_up():
    """A run with Metro down is WORSE than no run: the arm-B patch cannot reach the device, so
    arm B silently measures the shipping build and the A/B compares a thing against itself."""
    try:
        import urllib.request
        urllib.request.urlopen("http://localhost:8081/status", timeout=3).read()
        return True
    except Exception:
        return False


def boot():
    sp.run(["xcrun", "simctl", "terminate", U, drive.BUNDLE], capture_output=True)
    sp.run(["xcrun", "simctl", "launch", U, drive.BUNDLE], capture_output=True)
    time.sleep(16)
    if drive.at_launcher():
        drive.reconnect()
    drive.dismiss_logbox()
    drive.dismiss_sheet()
    for attempt in range(3):
        sp.run(["xcrun", "simctl", "openurl", U, R['route']], capture_output=True)
        time.sleep(3.5)
        drive.dismiss_logbox()
        # VERIFY BY CONTENT, never by change: a "did the labels differ" test reports failure
        # exactly when navigation was unnecessary.
        if any(R['present'] in (l or '').lower() for l in drive.labels()):
            return True
        print(f"   not on {WHICH} yet (attempt {attempt + 1}); retrying")
        time.sleep(3)
    return False


def rail_band():
    cs = [n for n in drive.nodes()
          if R['marker'] in n[4].lower() and R['wmin'] <= n[2] <= R['wmax']]
    if not cs:
        return None
    c = sorted(cs, key=lambda z: z[1])[0]
    return c[1], c[1] + c[3]


def bring_on_screen():
    """A rail partially below the fold cannot be flicked: a swipe at its midpoint lands in the
    home-indicator area and never reaches the app. Scroll the PAGE, then re-read the band -- its
    y will have changed."""
    got = rail_band()
    if not got:
        return None
    y0, y1 = got
    for _ in range(7):
        if y1 <= 834:
            break
        sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", "0.25",
                "200", "640", "200", "380"], capture_output=True)
        time.sleep(1.8)
        got = rail_band()
        if not got:
            return None
        y0, y1 = got
    return (y0, y1) if y1 <= 834 else None


def shot(tag):
    p = f"{OUT}/{tag}.png"
    sp.run(["xcrun", "simctl", "io", U, "screenshot", p], capture_output=True)
    return p


def _cols(path, band, lo, hi):
    im = Image.open(path).convert('RGB').crop(band)
    r, g, b = im.split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), b)
    W, H = m.size
    px = m.load()
    ys = list(range(int(H * lo), int(H * hi)))
    return [sum(px[x, y] for y in ys) / len(ys) for x in range(W)]


def motion_profile(path, band):
    """Movement is read from the ICON/IMAGE rows, which differ per card -- NOT from the body rows
    the phase uses, which are identical on every card and therefore blind to a whole-card shift."""
    return _cols(path, band, 0.10, 0.30)


def phase_profile(path, band):
    """Card body only -- a strip of uniform fill, so glyph strokes and photographs cannot forge an
    edge. Which strip that is depends on the card, hence per-rail `prows`."""
    return _cols(path, band, *R['prows'])


def phase(col, sx):
    per, duty, W = INTERVAL_PT * sx, CARD_PT * sx, len(col)
    mc = sum(col) / W
    dc = (sum((v - mc) ** 2 for v in col)) ** 0.5
    best = (None, -2.0)
    for ph in range(int(per)):
        t = [1.0 if ((x - ph) % per) < duty else 0.0 for x in range(W)]
        mt = sum(t) / W
        dt = (sum((v - mt) ** 2 for v in t)) ** 0.5
        if dt == 0 or dc == 0:
            continue
        r = sum((col[x] - mc) * (t[x] - mt) for x in range(W)) / (dc * dt)
        if r > best[1]:
            best = (ph, r)
    return best[0] / sx, best[1]


def run_arm(name):
    if not boot():
        print(f"[{name}] never reached {WHICH}")
        return None
    bb = bring_on_screen()
    if not bb:
        print(f"[{name}] rail never came on screen")
        return None
    y0, y1 = bb
    p0 = shot(f"{name}_rest0")
    im = Image.open(p0)
    sx = im.width / 402.0
    band = (0, int(y0 * sx), im.width, int(y1 * sx))
    d = Image.open(p0)
    ImageDraw.Draw(d).rectangle(list(band), outline=(255, 0, 0), width=6)
    d.save(f"{OUT}/{name}_band.png")
    print(f"[{name}] rail band y={y0}..{y1} from a11y; band drawn -> {OUT}/{name}_band.png")
    prev = motion_profile(p0, band)
    out = []
    for i, (dur, x0, x1) in enumerate(FLICKS, 1):
        ym = int(y0 + (y1 - y0) * 0.4)
        sp.run(["idb", "ui", "swipe", "--udid", U, "--duration", dur,
                str(x0), str(ym), str(x1), str(ym)], capture_output=True)
        time.sleep(2.6)
        p = shot(f"{name}_rest{i}")
        ic = motion_profile(p, band)
        moved = sum(abs(a - b) for a, b in zip(ic, prev)) / len(ic) > 3.0
        prev = ic
        ph, r = phase(phase_profile(p, band), sx)
        off = abs(ph - INSET_PT) % INTERVAL_PT
        off = min(off, INTERVAL_PT - off)
        out.append((i, dur, moved, ph, r, off))
    return out


def report(name, rows):
    print(f"\n=== ARM {name} ===")
    print(" flick  dur    moved?  rest phase   template corr   offset from grid")
    scored = []
    for i, dur, moved, ph, r, off in rows:
        print(f"  {i}    {dur}s   {'YES' if moved else 'NO '}     {ph:6.1f}pt      {r:5.3f}          {off:5.1f}pt")
        if moved and r >= 0.60:
            scored.append(off)
    if not scored:
        print("  no trustworthy moved rests")
        return None
    print(f"  scored rests: {len(scored)}/{len(rows)}   worst offset {max(scored):.1f}pt")
    return scored


if not metro_up():
    print("METRO IS DOWN (http://localhost:8081 unreachable). Start it with `npm start`.")
    print("Refusing to run: with Metro down the arm-B patch cannot reach the device and the")
    print("A/B would silently compare the shipping build against itself.")
    sys.exit(2)

print(f"rail: {WHICH}   interval {INTERVAL_PT:.0f}pt   card {CARD_PT:.0f}pt   arms {ARMS}")
orig = open(R['file']).read()
A = B = None
try:
    if 'A' in ARMS:
        A = run_arm("A_snapped")
    if 'B' in ARMS:
        patched = orig.replace(R['strip'], '')
        assert patched != orig, "counterfactual patch did not apply"
        open(R['file'], 'w').write(patched)
        print("\n[counterfactual] snap props REMOVED; waiting for Fast Refresh")
        time.sleep(12)
        B = run_arm("B_free")
finally:
    open(R['file'], 'w').write(orig)
    print("\n[restore] file restored")
    sp.run(["git", "diff", "--stat", "--", R['file']])

sa = report(f"A (shipping: snapToInterval={INTERVAL_PT:.0f}pt)", A) if A else None
sb = report("B (counterfactual: no snap)", B) if B else None
print(f"\nPRE-REGISTERED: arm A rests at the {INSET_PT}pt inset every time; "
      f"arm B scatters across 0..{INTERVAL_PT:.0f}pt.")
if sa is None or sb is None:
    print("VERDICT: INCONCLUSIVE — an arm produced no trustworthy moved rests.")
elif max(sa) <= 6.0 and max(sb) > 6.0:
    print(f"VERDICT: SNAP CONFIRMED — A worst {max(sa):.1f}pt on-grid; B worst {max(sb):.1f}pt off-grid.")
elif max(sa) <= 6.0 and max(sb) <= 6.0:
    print("VERDICT: INSTRUMENT CANNOT DISTINGUISH — both arms on-grid. A proves nothing.")
else:
    print(f"VERDICT: NOT SNAPPED — arm A worst offset {max(sa):.1f}pt.")
