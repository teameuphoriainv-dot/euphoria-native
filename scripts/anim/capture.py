import threading
#!/usr/bin/env python3
"""Screen capture for the animation audit — at a frame rate that can actually see a spring.

WHY NOT `simctl io recordVideo`: it records at a FIXED 15 fps. Measured 2026-08-19 --
`r_frame_rate=15/1`, 138 frames across 9.2s. A 280ms transition therefore gets ~4 samples,
which is not enough to distinguish a clean settle from an overshoot. Extracting such a file
at `fps=30` does NOT recover anything: ffmpeg simply duplicates every frame, and the
resulting "50% of frames identical" reads exactly like an app rendering at half rate. That
misreading happened during this audit before the container was checked.

`idb video-stream --fps 60` measured 481 frames in 10.1s = 47.7 fps on the same machine.
3.2x the temporal resolution, and enough to resolve a 280ms curve into ~13 real samples.

GOTCHA, measured: passing `--scale-factor` makes the stream write a ZERO-BYTE file and exit
without an error. Do not "optimise" the capture with it.

Output is a raw h264 elementary stream with no container timing, so ffprobe reports a
nonsense `r_frame_rate`. Count frames by decoding, never by trusting the header.
"""
import subprocess as sp, time, os, re, sys

UDID = "755B55D9-8E4B-431C-9D1D-A635F38CFF5F"

def record(path, seconds, fps=60, during=None, quality=None):
    """Record the screen. `during` is called once the stream is warm.

    `quality` maps to idb's --compression-quality (0..1.0). Leave it None for timing work: the
    default is fine for asking WHEN pixels changed, and a raised quality costs frames, because
    the stream is bandwidth-limited near 100 KB/s (measured: bytes-per-second held at 90-113
    across three takes while bytes-per-FRAME varied 1.6-11.5).

    Pass 1.0 for PER-ELEMENT PIXEL work. At the default quality, inter-frame reconstruction
    drops a region for runs of about three frames at a time -- measured 8 such runs in 132
    frames -- and an element's pixel overlap collapses to ~0.08 and recovers, which is
    indistinguishable from the element leaving and coming back. That artifact defeated an
    R5 exit measurement twice before it was traced.
    """
    if os.path.exists(path): os.remove(path)
    cmd = ["idb", "video-stream", "--fps", str(fps), "--format", "h264", "--udid", UDID]
    if quality is not None:
        cmd += ["--compression-quality", str(quality)]
    cmd.append(path)
    p = sp.Popen(cmd, stdout=sp.DEVNULL, stderr=sp.DEVNULL)
    time.sleep(1.2)                       # let the stream warm up before acting
    if during: during()
    time.sleep(seconds)
    p.terminate()
    try: p.wait(timeout=10)
    except Exception: p.kill()
    return path

def frames(path, out_dir, fps=60):
    """Decode to PNGs. Returns the real decoded frame count."""
    sp.run(["rm", "-rf", out_dir]); os.makedirs(out_dir)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-r", str(fps), "-i", path,
            f"{out_dir}/%04d.png"], check=True)
    return len([f for f in os.listdir(out_dir) if f.endswith('.png')])

def real_rate(path, wall_seconds):
    """Decoded frame count / wall time. The header cannot be trusted for raw h264."""
    r = sp.run(["ffmpeg", "-nostdin", "-i", path, "-f", "null", "-"], capture_output=True, text=True)
    m = re.findall(r'frame=\s*(\d+)', r.stderr)
    n = int(m[-1]) if m else 0
    return n, n / wall_seconds if wall_seconds else 0

def demo():
    """Self-check: no device needed — verify the frame-count parser on ffmpeg's own output."""
    sample = "frame=  12 fps=0.0 q=-0.0 size=N/A time=00:00:00.20\nframe=  481 fps=47 q=-0.0 Lsize=N/A"
    m = re.findall(r'frame=\s*(\d+)', sample)
    assert m and int(m[-1]) == 481, m
    assert int(m[0]) == 12, m
    print("self-check OK  parsed frame counts", m)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--demo': demo(); sys.exit()
    secs = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
    p = record(sys.argv[1], secs)
    n, rate = real_rate(p, secs + 1.2)
    print(f"{p}: {n} frames, {rate:.1f} fps effective, {os.path.getsize(p)//1024} KB")

def record_transition(path, seconds, trigger, *, reset=None, expect_change=20, settle=3.0, **kw):
    """Record a transition, REFUSING to film unless the trigger actually navigated.

    THIS EXISTS BECAUSE THE SAME MISTAKE HAPPENED THREE TIMES IN ONE SESSION, and every time it
    produced a confident, plausible, wrong number:

      * 249 frames scored as "digest cards render fine" -- it was the HOME screen; the deep link
        had silently no-opped.
      * A stock screen reported as showing "no prices" -- the link was fired from a pushed screen,
        where deep links do nothing.
      * Two multi-peak windows reported as possible BOUNCING -- filmed with nav unverified. With
        navigation checked, the same transition had zero.

    Whole-frame differencing cannot tell you which screen it is looking at. The accessibility
    label set can, and it costs one call. So the check is no longer something a caller remembers
    to do -- it is the only way in.

    `trigger` is called TWICE — once to prove it navigates, once to be filmed — so the caller must
    say how to get back to the starting state in between. That is what `reset` is for.

    THIS WAS WRONG IN THE FIRST VERSION AND THE BUG WAS SILENT. Without a reset, the verify pass
    navigates to the destination and the film pass taps the same control again, which for a tab
    switch is a no-op: the recording captures a screen already at rest. Measured 2026-08-21,
    Home->Learn reported ZERO motion windows, which reads exactly like "this screen has no
    entrance animation" and is instead "nothing happened while filming". A guard that produces a
    confident empty result is the same failure it was written to prevent, one level up.

    So `reset` is REQUIRED for any trigger whose second invocation would be a no-op — which is
    every navigation. Pass the action that returns to the origin.

    Anything not idempotent at all (a one-shot reward, a lesson step that consumes state) still
    belongs in plain `record` with its own verification.
    """
    import drive  # local import: capture.py must stay importable without a live device

    before = set(drive.labels())
    trigger()
    time.sleep(settle)
    after = set(drive.labels())
    changed = len(after ^ before)
    if changed < expect_change:
        raise RuntimeError(
            f"refusing to record: trigger changed only {changed} labels (need {expect_change}). "
            f"the screen probably did not navigate, and a capture of the wrong screen is worse "
            f"than no capture. on screen: {sorted(x for x in after if x)[:6]}"
        )

    # Re-arm: without this the film pass triggers a no-op and records a resting screen.
    if reset is not None:
        reset()
        time.sleep(settle)
        if set(drive.labels()) == after:
            raise RuntimeError(
                "refusing to record: reset() did not return to the starting state, so the film "
                "pass would capture a no-op. the recording would look like 'no animation'."
            )

    th = threading.Thread(target=trigger)
    th.start()
    try:
        return record(path, seconds, **kw), changed
    finally:
        th.join(timeout=seconds + 5)

