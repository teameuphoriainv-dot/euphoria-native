"""Is the animation GOOD — not just present?

motion_window.py answers "does this screen move". It cannot tell a well-timed spring from a
linear lurch, and both look identical in a frames-animating percentage.

WHY THIS IS NOT JUST "LOOK AT IT": an LLM reads images, not video. Stills carry composition
and pose; they do not carry timing. So the parts of animation quality that are computable are
computed here, and only what genuinely needs eyes is left to eyes. Three findings from the
video-evaluation literature shape this file:

  1. VBench decomposes "video quality" into human-aligned dimensions with automatic metrics.
     Motion smoothness is defined as 1 - normalized mean L1 frame difference. Jitter is
     arithmetic, not opinion.
  2. Uniform-FPS frame sampling beats every other strategy for temporal reasoning, because
     evenly spaced frames preserve event order and do not miss brief repeated motions. The
     companion strip is therefore uniform, and denser than a 6-frame contact sheet.
  3. Video-LLMs have documented DIRECTIONAL MOTION BLINDNESS — they routinely get the
     direction of movement wrong. So direction is measured from pixels here and never
     inferred by looking.

Metrics
-------
smoothness   VBench-style. 1 - (mean |second derivative| / mean |first derivative|),
             clamped to 0..1. Continuous motion scores high; stepping and stutter score low.
flicker      Fraction of frames where the motion signal REVERSES sign. Real animation is
             mostly monotonic within a beat; high reversal means strobing or a fight between
             two animations driving the same property.
easing       Shape of cumulative motion across the beat vs a straight line.
             ease-out (fast then settling) is the house style for entrances; `linear` is the
             classic tell of an un-eased animation.
peak_pos     Where in the beat the motion peaks, 0..1. ~0.2 = ease-out, ~0.8 = ease-in,
             ~0.5 = symmetric.

    python3 scripts/motion_quality.py <clip.mp4> [--strip out.png]
"""
import json
import os
import subprocess
import sys

import numpy as np

import os as _os
_sys_path = _os.path.dirname(_os.path.abspath(__file__))
if _sys_path not in sys.path:
    sys.path.insert(0, _sys_path)
from motion_energy import bursts as _bursts  # noqa: E402

FPS = 30.0
# Smoothness is a second derivative. Below this many frames there are too few samples for one,
# and grading anyway produced "JANKY" on a legitimate 233ms step transition measured over 7
# frames. beat_ms stays trustworthy at any length; the QUALITY verdict does not, so it is
# withheld rather than guessed.
MIN_FRAMES_TO_GRADE = 12
W, H = 296, 640
STRIP_FPS = 6  # uniform sampling for the companion strip


def gray(path):
    cmd = ["ffmpeg", "-v", "error", "-i", path,
           "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw) // (W * H)
    return np.frombuffer(raw[: n * W * H], dtype=np.uint8).reshape(n, H, W).astype(np.float32)


def _easing(sig):
    """Classify the beat's timing from its cumulative motion curve.

    A perfectly linear ramp means no easing was applied at all. Real UI motion front-loads
    (ease-out) or back-loads (ease-in) its distance.
    """
    if sig.sum() <= 0 or len(sig) < 4:
        return "flat", 0.5, 0.0
    # Prepend 0: cumsum starts at the first sample, which shifts the whole curve up by one
    # step and biases every signal toward "ease-out". A constant ramp must read as linear.
    cum = np.concatenate([[0.0], np.cumsum(sig)]) / sig.sum()
    t = np.linspace(0, 1, len(cum))
    dev = float(np.mean(cum - t))          # >0 front-loaded, <0 back-loaded
    peak = float(np.argmax(sig) / max(1, len(sig) - 1))
    if abs(dev) < 0.04:
        shape = "linear"                   # no easing curve applied
    elif dev > 0:
        shape = "ease-out"                 # fast start, settles — entrances
    else:
        shape = "ease-in"                  # slow start, accelerates — exits
    return shape, peak, round(dev, 3)


def analyse(path, strip=None, after_s=1.0):
    """after_s: ignore everything before the deep link fires.

    Without this the strongest beat is often the PREVIOUS route's exit transition still
    playing at t=0.7s. Four routes graded identically (267ms, flicker 0.167, linear) because
    they were all being scored on the same leftover animation rather than their own.
    """
    g = gray(path)
    if len(g) < 8:
        return {"clip": os.path.basename(path), "error": "too few frames"}

    d1 = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))     # motion per frame
    skip = int(after_s * FPS)
    d1[:skip] = 0.0                                       # see after_s
    if d1.max() <= 0:
        return {"clip": os.path.basename(path), "verdict": "no motion"}

    # Isolate the strongest contiguous beat: quality is a property of a beat, not of a clip
    # that is mostly still. Averaging over the still part would flatter every animation.
    thresh = max(np.percentile(d1, 40) * 2.5, 0.6)
    # Reuse motion_energy's burst detector rather than re-implementing it. The hand-rolled loop
    # that used to live here had NO GAP MERGING, so a single-frame dip inside a real burst split
    # it into fragments and the "longest beat" came back as one frame. Measured on the same clip:
    # motion_energy reported a 233ms burst while this file reported 33ms. Two implementations of
    # one idea will always drift; one is the fix.
    runs = _bursts(d1, thresh)
    if not runs:
        return {"clip": os.path.basename(path), "verdict": "no motion"}
    s, e = max(runs, key=lambda r: r[1] - r[0])
    if e - s < 4:
        return {"clip": os.path.basename(path), "verdict": "beat too short to grade",
                "beat_ms": round(1000 * (e - s) / FPS)}

    beat = d1[s:e]
    if len(beat) < MIN_FRAMES_TO_GRADE:
        return {"clip": os.path.basename(path), "beat_start_s": round(s / FPS, 2),
                "beat_ms": round(1000 * (e - s) / FPS), "grade": "TOO_SHORT_TO_GRADE",
                "note": f"{len(beat)} frames — under {MIN_FRAMES_TO_GRADE}, smoothness needs more samples"}
    d2 = np.diff(beat)

    # VBench-style smoothness: jerk relative to speed. Smooth motion changes gradually.
    smoothness = float(np.clip(1 - (np.abs(d2).mean() / (beat.mean() + 1e-6)), 0, 1))
    # Sign reversals in acceleration — strobing, or two animations fighting one property.
    flicker = float((np.diff(np.sign(d2)) != 0).mean()) if len(d2) > 1 else 0.0
    shape, peak, dev = _easing(beat)

    if strip:
        # Uniform sampling: preserves event order, does not miss brief repeated motion.
        subprocess.run(
            ["ffmpeg", "-y", "-i", path, "-vf",
             f"fps={STRIP_FPS},scale=150:-1,tile={int(STRIP_FPS*2)}x3", "-frames:v", "1", strip],
            capture_output=True)

    return {
        "clip": os.path.basename(path),
        "beat_start_s": round(s / FPS, 2),
        "beat_ms": round(1000 * (e - s) / FPS),
        "smoothness": round(smoothness, 3),
        "flicker_UNVALIDATED": round(flicker, 3),
        "easing": shape,
        "peak_pos": round(peak, 2),
        "curve_dev": dev,
        "grade": grade(smoothness, flicker, shape),
    }


def grade(smoothness, flicker, shape):
    """Bands anchored to EXTERNAL GROUND TRUTH, not to taste.

    Calibrated against refs/videos/ — the Duolingo and Brilliant recordings this project
    already measured its research from. Those score smoothness 0.82-0.88, so SMOOTH starts
    below that at 0.75. An instrument that cannot rate known-good animation as good is not
    fit to judge ours, which is the whole point of calibrating first.

    FLICKER IS DELIBERATELY NOT GRADED. It reads 0.53 on the reference clips — i.e. it does
    not separate good animation from bad, it measures frame noise in the second derivative.
    It is still reported, marked unvalidated, so a later fix has a baseline. Grading on a
    metric that fails calibration would have marked Duolingo's own motion JANKY.
    """
    if smoothness < 0.50:
        return "JANKY"        # stuttering or fighting animations
    if shape == "linear":
        return "UNEASED"      # moves, but with no timing curve — reads mechanical
    if smoothness >= 0.75:
        return "SMOOTH"       # at or near reference quality
    return "ROUGH"


def _demo():
    """Self-check on the maths — no clips, no ffmpeg."""
    # Front-loaded motion must read as ease-out and peak early.
    fast = np.array([10.0, 8, 6, 4, 3, 2, 1, 1])
    shape, peak, dev = _easing(fast)
    assert shape == "ease-out" and peak < 0.3, (shape, peak)
    # Back-loaded motion must read as ease-in.
    slow = fast[::-1].copy()
    assert _easing(slow)[0] == "ease-in", _easing(slow)
    # A constant ramp has no easing curve at all.
    assert _easing(np.ones(12))[0] == "linear"
    # Grading bands.
    assert grade(0.2, 0.1, "ease-out") == "JANKY"
    assert grade(0.9, 0.1, "linear") == "UNEASED"
    assert grade(0.9, 0.1, "ease-out") == "SMOOTH"
    assert grade(0.6, 0.1, "ease-out") == "ROUGH"
    # A 233ms beat is 7 frames — must be withheld, not graded JANKY on too few samples.
    assert int(0.233 * FPS) < MIN_FRAMES_TO_GRADE
    # A 500ms beat is 15 frames and is gradeable.
    assert int(0.5 * FPS) >= MIN_FRAMES_TO_GRADE
    # CALIBRATION: the reference clips measure 0.82-0.88 smoothness. Anything in that band
    # must not be graded below SMOOTH, or the instrument cannot recognise its own target.
    assert grade(0.82, 0.53, "ease-out") == "SMOOTH"
    assert grade(0.88, 0.53, "ease-out") == "SMOOTH"
    print("motion_quality self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        args = [a for a in sys.argv[1:] if not a.startswith("--")]
        strip = None
        if "--strip" in sys.argv:
            strip = sys.argv[sys.argv.index("--strip") + 1]
            args = [a for a in args if a != strip]
        for p in args:
            print(json.dumps(analyse(p, strip)))
