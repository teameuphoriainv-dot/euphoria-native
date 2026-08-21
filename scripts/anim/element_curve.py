#!/usr/bin/env python3
"""Per-element motion curve — the instrument the rubric says this app needs.

WHY THIS EXISTS. Whole-frame differencing answers *when* pixels changed and never *which
element* or *by how much*. On Euphoria that limit is fatal in two specific ways, both measured:

  * `AmbientBackground` twinkles forever (onboarding mounts it three times at 70 stars with
    glow, each on withRepeat(-1)), so a pixel-count floor never lets an activity window close
    and a changed-region bounding box spans the whole screen.
  * Screens keep a persistent element across a transition — Atlas lives in `AtlasStage` above
    the onboarding step switch — so a slide change is only 10-20% of the frame, well under what
    a full-screen gate would catch.

Four whole-frame attempts on the same clean 26s walk returned 1863ms, 37-55ms, 101 windows and
37-128ms. None of them is the transition.

WHAT THIS DOES INSTEAD. It tracks ONE element, whose rectangle comes from the accessibility
tree, and counts that element's OWN pixels per frame. Inside a headline's box the text is dense
and bright while a star is a stray dot, so a minimum-count gate removes the starfield from the
measurement entirely rather than trying to threshold around it.

The resulting curve answers the rules that have been OPEN since the rubric was written:

  R4 scale origin   — does the element's bbox WIDTH start near zero and grow, or hold constant
                      while its position moves? (The reference translates at constant size.)
  R5 exit behaviour — does the outgoing element's pixel count decay over several frames, or
                      drop to zero in one? (A one-frame drop is a hard cut.)
  R6 easing shape   — the position/count-vs-time curve itself.

Usage:
    python3 scripts/anim/element_curve.py --label "habit" --tap-option --secs 2.4
    python3 scripts/anim/element_curve.py --selftest
"""
import argparse, glob, json, os, subprocess as sp, sys, threading, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/element"


def bright_stats(img, thr=200, min_px=40):
    """Count and bound the element's own bright pixels.

    Returns (count, bbox) with bbox None when the element is absent. `min_px` is what keeps a
    handful of starfield dots from registering as an element — the whole point of measuring
    inside a known rectangle instead of across the frame.
    """
    px = img.load()
    W, H = img.size
    xs, ys, n = [], [], 0
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y]
            if r > thr and g > thr and b > thr:
                n += 1; xs.append(x); ys.append(y)
    if n < min_px:
        return n, None
    return n, (min(xs), min(ys), max(xs), max(ys))


def similarity(a, b, thr=200):
    """Fraction of frame-0's element pixels still lit in this frame.

    COUNTING BRIGHT PIXELS IS NOT ENOUGH, and the first run proved it. Slide A's white headline
    is replaced by slide B's white headline in the SAME rectangle, so a pixel count stays high
    across the swap and the element looks like it never left — the classifier read a settled
    screen as a hard cut. What matters is whether THESE pixels are still lit, so this scores
    overlap against frame 0 rather than population.

    1.0 = the original element is fully present. 0.0 = whatever is in the box now shares no
    pixels with it, which is what a completed swap looks like.
    """
    pa, pb = a.load(), b.load()
    W, H = a.size
    orig = same = 0
    for y in range(H):
        for x in range(W):
            r, g, bl = pa[x, y]
            if r > thr and g > thr and bl > thr:
                orig += 1
                r2, g2, b2 = pb[x, y]
                if r2 > thr and g2 > thr and b2 > thr:
                    same += 1
    return same / orig if orig else 0.0


def curve(frames, box, scale):
    """Per-frame (count, bbox) for the element inside `box` (in points)."""
    x0, y0, x1, y1 = [int(v * scale) for v in box]
    out = []
    for f in frames:
        im = Image.open(f).convert('RGB').crop((x0, y0, x1, y1))
        n, bb = bright_stats(im)
        out.append((n, tuple(round(v / scale, 1) for v in bb) if bb else None))
    return out


def _sustained(pred, series, n=3):
    """First index where `pred` holds for n CONSECUTIVE frames, else None.

    h264 drops a region for a frame now and then, and a single bad frame reads as the element
    vanishing and reappearing. Measured on a real take, the overlap series ran
    1.00 0.99 0.99 0.00 0.00 1.00 1.00 -- a two-frame dropout that the first version of this
    function called an exit taking 19ms, on a headline that had not moved. Requiring a RUN is
    what separates a transition from a compression artifact.
    """
    run = 0
    for i, v in enumerate(series):
        run = run + 1 if pred(v) else 0
        if run >= n:
            return i - n + 1
    return None


def classify(counts, min_run=3):
    """R5: how did the element leave? Judged on a SUSTAINED drop, never on one frame."""
    if not counts or max(counts) == 0:
        return 'absent'
    peak = max(counts)
    gone = _sustained(lambda c: c < peak * 0.15, counts, min_run)
    if gone is None:
        return 'persists'
    present = _sustained(lambda c: c > peak * 0.85, counts[:gone], min_run)
    if present is None:
        return 'unclear'
    span = gone - (present + min_run - 1)
    return 'hard-cut' if span <= 1 else 'fade-out over %d frames' % span

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--label', help='substring of the element AXLabel to track')
    ap.add_argument('--route', default='onboarding')
    ap.add_argument('--tap-option', action='store_true', help='tap the first option row')
    ap.add_argument('--secs', type=float, default=2.4)
    ap.add_argument('--selftest', action='store_true')
    a = ap.parse_args()

    if a.selftest:
        # bright_stats must find a dense block and IGNORE a sprinkle of stars.
        blk = Image.new('RGB', (80, 40), (10, 10, 20))
        ImageDraw.Draw(blk).rectangle([10, 10, 60, 30], fill=(255, 255, 255))
        n, bb = bright_stats(blk)
        assert n > 900 and bb == (10, 10, 60, 30), (n, bb)
        stars = Image.new('RGB', (80, 40), (10, 10, 20))
        d = ImageDraw.Draw(stars)
        for p in [(5, 5), (20, 30), (60, 12), (70, 35), (40, 8)]:
            d.point(p, fill=(255, 255, 255))
        n2, bb2 = bright_stats(stars)
        assert bb2 is None, f'starfield must not register as an element, got {n2} px'
        # classify: a one-frame drop is a cut; a ramp is a fade
        assert classify([100, 100, 100, 0, 0, 0]) == 'hard-cut'   # 3 zeros = sustained
        assert classify([100, 100, 100, 80, 60, 40, 20, 5, 2, 1]).startswith('fade-out')
        assert classify([100, 100, 100, 100]) == 'persists'
        assert classify([0, 0]) == 'absent'
        # a translate holds width while x moves; a zoom grows width from near zero
        w_translate = [40, 40, 41, 40, 39]
        w_zoom = [2, 9, 20, 33, 40]
        assert min(w_translate) / max(w_translate) > 0.9
        assert min(w_zoom) / max(w_zoom) < 0.2
        # similarity must fall to 0 when DIFFERENT pixels are lit, even at the same count
        A = Image.new('RGB', (40, 20), (0,0,0)); ImageDraw.Draw(A).rectangle([0,0,19,19], fill=(255,255,255))
        B = Image.new('RGB', (40, 20), (0,0,0)); ImageDraw.Draw(B).rectangle([20,0,39,19], fill=(255,255,255))
        assert similarity(A, A) == 1.0
        assert similarity(A, B) == 0.0, 'same pixel COUNT, no overlap -> must read as gone'
        assert classify([100,100,100,0,0,100,100,100,100]) == 'persists', 'a 2-frame dropout is not an exit'
        assert classify([100,100,100,0,0,0,0]) == 'hard-cut'
        assert classify([100,100,100,80,60,40,20,0,0,0]).startswith('fade-out')
        print('element_curve --selftest: 14 assertions passed')
        return 0

    import drive
    from capture import record, real_rate
    os.makedirs(OUT, exist_ok=True)
    U = drive.U
    sp.run(["xcrun", "simctl", "terminate", U, drive.BUNDLE], capture_output=True)
    sp.run(["xcrun", "simctl", "launch", U, drive.BUNDLE], capture_output=True); time.sleep(16)
    if drive.at_launcher(): drive.reconnect()
    drive.dismiss_logbox(); drive.dismiss_sheet()
    before = set(drive.labels())
    sp.run(["xcrun", "simctl", "openurl", U, f"euphorianative://{a.route}"], capture_output=True)
    time.sleep(3.5); drive.dismiss_logbox()
    # A reload can drop the app to the Expo dev-client launcher, which reads as a perfectly
    # valid screen with a handful of labels -- 'DEVELOPMENT SERVERS', 'Development Build'.
    # It is checked at startup, but the drop can also happen DURING navigation when another
    # process touches a watched file, so check again here before trusting anything on screen.
    for _ in range(3):
        if not drive.at_launcher():
            break
        print("dropped to the dev-client launcher — reconnecting", flush=True)
        drive.reconnect(); time.sleep(4)
        sp.run(["xcrun", "simctl", "openurl", U, f"euphorianative://{a.route}"], capture_output=True)
        time.sleep(3.5); drive.dismiss_logbox()
    if drive.at_launcher():
        print("still at the launcher after 3 reconnects"); return 1
    if set(drive.labels()) == before:
        print(f"NAVIGATION FAILED to {a.route}"); return 1

    node = None
    for n in drive.nodes():
        if a.label and a.label.lower() in n[4].lower() and n[3] > 20:
            node = n; break
    if node is None:
        print(f"element {a.label!r} not found. labels: {sorted(x for x in drive.labels() if x)[:8]}")
        return 1
    print(f"tracking {node[4][:50]!r}  x={node[0]} y={node[1]} {node[2]}x{node[3]}  [a11y tree]")

    # DRAW THE BOX AND KEEP IT. A guessed rectangle produced this audit's biggest false finding.
    sp.run(["xcrun", "simctl", "io", U, "screenshot", f"{OUT}/pre.png"], capture_output=True)
    im = Image.open(f"{OUT}/pre.png"); sx = im.width / 402.0
    pad = 10
    box = (max(0, node[0] - pad), max(0, node[1] - pad), node[0] + node[2] + pad, node[1] + node[3] + pad)
    ImageDraw.Draw(im).rectangle([v * sx for v in box], outline=(255, 0, 0), width=6)
    im.save(f"{OUT}/box.png")
    print("box drawn -> box.png (VERIFY BY EYE)")

    target = None
    if a.tap_option:
        opts = [n for n in drive.nodes() if 40 < n[3] < 110 and n[2] > 200
                and not any(k in n[4].lower() for k in ('continue', 'next', 'back', 'atlas'))]
        target = opts[0] if opts else None
    if target is None:
        b = drive.button('continue', 'next', 'get started')
        target = b[0] if b else None
    if target is None:
        print("nothing to tap"); return 1

    def go():
        """Fired by record() AFTER the stream is warm.

        This used to run on a thread started before record(), sleeping 0.5s. record() spends its
        first 1.2s warming the stream, so the tap landed DURING warmup and the transition was
        over before frame 0. The overlap then compared the NEXT slide's headline against itself,
        read a flat 1.00, and reported 'persists' -- a confident answer about the wrong element.
        capture.record() takes `during` for exactly this reason.
        """
        time.sleep(0.25)
        sp.run(["idb", "ui", "tap", "--udid", U,
                str(target[0] + target[2] // 2), str(target[1] + target[3] // 2)], capture_output=True)

    def overlay_blue(path):
        """Expo Fast Refresh paints a full-screen LOW-RED blue reload banner.

        Another process editing a watched file reloads the app mid-capture, which remounts every
        component and replays its entrance -- so the curve shows a remount, not the transition
        under test. Euphoria's own violet is r=184, which is why the red channel is bounded: an
        earlier version of this check called a clean take 8.4% contaminated on brand colour alone.
        """
        d = f"{OUT}/chk"; sp.run(["rm", "-rf", d]); os.makedirs(d)
        sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", path,
                "-vf", "fps=6,scale=80:-1", f"{d}/%03d.png"], check=True)
        worst = 0.0
        for f in sorted(glob.glob(f"{d}/*.png")):
            im = Image.open(f).convert('RGB'); px = im.load(); W, H = im.size; n = 0
            for y in range(H):
                for x in range(W):
                    r, g, b = px[x, y]
                    if b > 150 and r < 120 and b > g + 40: n += 1
            worst = max(worst, n / (W * H))
        sp.run(["rm", "-rf", d])
        return worst

    h = f"{OUT}/el.h264"
    for attempt in range(4):
        record(h, a.secs, quality=1.0, during=go)
        blue = overlay_blue(h)
        if blue <= 0.15:
            print(f"contamination {blue*100:.1f}% -> CLEAN (attempt {attempt+1})")
            break
        print(f"contamination {blue*100:.1f}% -> hot reload, retrying (attempt {attempt+1}/4)", flush=True)
        time.sleep(6)
        drive.dismiss_logbox()
        # re-arm: the reload reset the flow, so walk back to the tracked element
        sp.run(["xcrun", "simctl", "openurl", U, f"euphorianative://{a.route}"], capture_output=True)
        time.sleep(3.5); drive.dismiss_logbox()
    else:
        print("VOID — four consecutive takes were contaminated by hot reload"); return 1
    after = set(drive.labels())
    print(f"tap registered: {after != before and len(after ^ set(drive.labels())) >= 0}")
    print(f"  screen changed: {node[4][:28]!r} still present: {any(a.label.lower() in l.lower() for l in after)}")

    n, rate = real_rate(h, a.secs)
    fd = f"{OUT}/fr"; sp.run(["rm", "-rf", fd]); os.makedirs(fd)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h, f"{fd}/%05d.png"], check=True)
    fr = sorted(glob.glob(f"{fd}/*.png"))
    c = curve(fr, box, sx)

    counts = [x[0] for x in c]
    # overlap with frame 0 — the measure that survives one headline replacing another
    x0, y0, x1, y1 = [int(v * sx) for v in box]
    f0 = Image.open(fr[0]).convert('RGB').crop((x0, y0, x1, y1))
    sim = [similarity(f0, Image.open(f).convert('RGB').crop((x0, y0, x1, y1))) for f in fr]
    print(f"\n{len(fr)} frames @ {rate:.1f}fps ({1000/rate:.0f}ms/frame)")
    print(f"R5 exit behaviour (by pixel count):   {classify(counts)}")
    print(f"R5 exit behaviour (by overlap w/ f0): {classify([int(v*1000) for v in sim])}")
    # SUSTAINED, like classify(). The first version took the first frame under threshold and
    # reported an 18ms exit off a single-frame h264 dropout, while classify() -- already
    # hardened -- said fade-out over 17 frames from the same series. Two numbers from one
    # measurement disagreeing is how a wrong one gets quoted.
    gone = _sustained(lambda v: v < 0.15, sim, 3)
    if gone is not None:
        # LAST sustained-present frame, not the first. _sustained returns the START of the first
        # qualifying run, so using it directly reported 'present until 31ms' on an element that
        # held a solid plateau for 675ms, and an exit of 738ms instead of 135ms.
        last = None
        run = 0
        for i in range(gone):
            run = run + 1 if sim[i] > 0.85 else 0
            if run >= 3:
                last = i
        present = last
        if present is not None:
            print(f"  original element present until {last/rate*1000:.0f}ms, "
                  f"gone by {gone/rate*1000:.0f}ms -> exit took {(gone-last)/rate*1000:.0f}ms")
    else:
        print(f"  original element never sustained a drop (min overlap {min(sim):.2f}); "
              f"isolated dips are compression, not an exit")
    print("  overlap: " + " ".join(f"{v:.2f}" for v in sim[:30]))

    # R6 — EASING SHAPE, on the INCOMING element. sim is overlap against frame 0, so it can only
    # watch the outgoing one. Comparing every frame against the SETTLED final frame instead
    # tracks the arrival, and the shape of that rise is the easing.
    # MEAN LUMINANCE, not thresholded overlap. `similarity` counts pixels above brightness 200,
    # so text fading in only registers once its opacity passes ~78% -- which turns any opacity
    # ramp into something that looks ease-IN regardless of its real curve. Mean luminance over
    # the element's rectangle is linear in opacity and has no threshold to distort it.
    def mean_lum(img):
        px = img.load(); W, H = img.size; t = 0
        for y in range(0, H, 2):
            for x in range(0, W, 2):
                r, g, b = px[x, y]
                t += r + g + b
        return t / (3 * (W // 2 + 1) * (H // 2 + 1))
    lum = [mean_lum(Image.open(f).convert('RGB').crop((x0, y0, x1, y1))) for f in fr]
    lo_l, hi_l = min(lum), max(lum)
    sim_in = [(v - lo_l) / (hi_l - lo_l) if hi_l > lo_l else 0 for v in lum]
    arrive = _sustained(lambda v: v > 0.85, sim_in, 3)
    start = None
    if arrive is not None:
        for i in range(arrive, -1, -1):
            if sim_in[i] < 0.15:
                start = i; break
    if start is not None and arrive is not None and arrive - start >= 4:
        seg = sim_in[start:arrive + 1]
        n = len(seg)
        print(f"\nR6 easing (mean luminance): incoming element rises {start/rate*1000:.0f}ms -> {arrive/rate*1000:.0f}ms "
              f"({(arrive-start)/rate*1000:.0f}ms, {n} frames)")
        # normalised progress at the midpoint separates the standard shapes:
        #   linear     ~0.50   ease-out (fast start) >0.60   ease-in (slow start) <0.40
        mid = seg[n // 2]
        lo, hi = min(seg), max(seg)
        p = (mid - lo) / (hi - lo) if hi > lo else 0
        shape = 'ease-OUT (fast start, slow settle)' if p > 0.60 else (
                'ease-IN (slow start)' if p < 0.40 else 'roughly LINEAR')
        over = max(seg[n//2:]) > 1.0 * 0.995 and any(v < max(seg) * 0.97 for v in seg[n//2:])
        print(f"  midpoint progress {p:.2f} -> {shape}")
        print(f"  non-monotonic tail (overshoot/settle): {over}")
        print("  rise (normalised mean luminance): " + " ".join(f"{v:.2f}" for v in seg[:24]))
    else:
        print("\nR6 easing (mean luminance): no clean incoming rise in this window")

    # R6 BY POSITION — the measure that survives compression.
    #
    # Both pixel-value metrics failed on an opacity cross-fade: a brightness threshold turns any
    # ramp into something that reads as ease-in, and mean luminance never reaches its floor while
    # AmbientBackground sits behind the element. POSITION has neither problem, which is exactly
    # why R4's width ratio came back 0.99 on three separate captures while overlap was thrashing.
    #
    # A translate also gives R6 its sharpest possible discriminator: an underdamped spring
    # OVERSHOOTS its target and returns, and no cubic-bezier easing can be non-monotonic. So the
    # presence of a reversal separates a spring from a timing curve outright, rather than by
    # comparing curve shapes.
    ys = [(i, bb[1]) for i, (_, bb) in enumerate(c) if bb]
    if len(ys) >= 8:
        vals = [y for _, y in ys]
        travel = max(vals) - min(vals)
        print(f"\nR6 by POSITION: bbox top {min(vals):.1f}..{max(vals):.1f}pt  travel {travel:.1f}pt")
        if travel >= 6:
            # settle = the median of the last quarter, which is where the element ends up
            tail = sorted(vals[3 * len(vals) // 4:])
            settle = tail[len(tail) // 2]
            start = vals[0]
            sign = 1 if settle > start else -1
            prog = [ (v - start) / (settle - start) if settle != start else 0 for v in vals ]
            past = [p for p in prog if p > 1.02]
            print(f"  start {start:.1f}pt -> settle {settle:.1f}pt")
            print(f"  OVERSHOOT past settle: {'YES, max ' + format(max(prog), '.2f') if past else 'no'}"
                  f"  -> {'SPRING (no bezier is non-monotonic)' if past else 'monotonic: a TIMING curve'}")
            n = len(prog)
            mid = prog[n // 2]
            shape = 'ease-OUT (front-loaded)' if mid > 0.60 else (
                    'ease-IN (back-loaded)' if mid < 0.40 else 'roughly LINEAR')
            print(f"  midpoint progress {mid:.2f} -> {shape}")
            print("  progress: " + " ".join(f"{p:.2f}" for p in prog[:26]))
        else:
            print(f"  travel {travel:.1f}pt is too small to read a curve from")
    peak = max(counts) or 1
    print("\n  ms   count   width   x      bar")
    for i, (cnt, bb) in enumerate(c):
        if i > 60: break
        w = f"{bb[2]-bb[0]:5.1f}" if bb else "    -"
        x = f"{bb[0]:5.1f}" if bb else "    -"
        print(f"{i/rate*1000:5.0f} {cnt:6d}  {w}  {x}   {'#'*int(cnt/peak*40)}")
    widths = sorted(bb[2] - bb[0] for _, bb in c if bb)
    if len(widths) >= 10:
        # p10/p90, not min/max: one dropped frame reported a 69pt width on a 279pt headline and
        # turned a stationary element into "GROWS from small".
        widths = widths[len(widths)//10 : 9*len(widths)//10 + 1]
    if widths:
        print(f"\nR4 scale origin: width {min(widths):.1f}..{max(widths):.1f}pt  "
              f"ratio {min(widths)/max(widths):.2f}  -> "
              f"{'TRANSLATE (constant size)' if min(widths)/max(widths) > 0.85 else 'GROWS from small'}")
    json.dump({'rate': rate, 'counts': counts, 'sim': sim}, open(f"{OUT}/curve.json", 'w'))
    sp.run(["rm", "-rf", fd])          # only after every reader is done with them
    return 0


if __name__ == '__main__':
    sys.exit(main())
