"""Windowed motion analysis for the per-route audit.

Reuses motion_energy's frame loader and burst detector so the audit and the
existing measurement agree BY CONSTRUCTION rather than by two similar
implementations drifting apart.

One clip per route holds both halves of the question:

    [0.0 .. 1.0]  recorder warm-up, discarded
    [1.0 .. 3.5]  ENTRY  — the transition on arrival
    [4.0 .. 9.0]  IDLE   — does anything move once it has settled

That split is the whole point: a screen that animates on arrival and then goes
flat is STATIC, which is a different defect from one that never moves at all
(DEAD) and needs a different fix.

Emits one JSON object per clip so the shell caller never parses prose.

    python3 scripts/motion_window.py <clip.mov> [clip2.mov ...]
"""
import json
import os
import sys

import subprocess

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from motion_energy import bursts, load_gray  # noqa: E402

FPS = 30.0
ENTRY = (1.0, 3.5)
IDLE = (4.0, 9.0)

# --- why there is a SECOND, localized metric -------------------------------
# motion_energy.py averages |delta| over the WHOLE FRAME. That is right for the job it was
# built for (a 132px mascot reacting, filling a large share of the frame) and badly wrong for
# idle motion, because a whole-frame mean dilutes anything localized.
#
# Measured on this repo's own clips: `welcome` idles with 107 pixels changing at intensity 196
# — unmistakable motion — yet its whole-frame mean is 0.003, indistinguishable from a dead
# screen. Judging idle on the global mean alone reports every route as motionless and would
# have made the entire audit wrong in the same direction.
#
# So idle is judged on PIXELS CHANGED, which does not dilute, and the global burst metric is
# kept for entry transitions where it is the correct instrument.
LOCAL_W, LOCAL_H = 296, 640
PIXEL_DELTA = 6     # per-pixel intensity change that counts as real, above encoder noise
LIVE_PIXELS = 20    # frames with more changed pixels than this are genuinely moving


def _gray(path, w, h):
    cmd = ["ffmpeg", "-v", "error", "-i", path,
           "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw) // (w * h)
    return np.frombuffer(raw[: n * w * h], dtype=np.uint8).reshape(n, h, w).astype(np.float32)


def local_idle(path):
    """Localized idle motion: how much of the idle window has real pixel change.

    Returns (pct_of_idle_frames_moving, peak_pixels_changed).
    """
    g = _gray(path, LOCAL_W, LOCAL_H)
    lo, hi = int(IDLE[0] * FPS), min(int(IDLE[1] * FPS), len(g))
    if hi - lo < 2:
        return 0.0, 0
    d = np.abs(np.diff(g[lo:hi], axis=0))
    changed = (d > PIXEL_DELTA).sum(axis=(1, 2))
    return round(100.0 * (changed > LIVE_PIXELS).mean(), 1), int(changed.max())

# A burst longer than this is a real payoff beat. 400ms is the documented
# structural ceiling in src/shared/motion/tokens.ts — nothing in the app
# currently exceeds it, and that is the gap the program exists to close.
EARNED_MS = 400
# Below this the screen is inert. 100ms is tokens.ts's `instant`: anything
# shorter reads as a cut, not a transition.
ALIVE_MS = 100


def _overlap(run, window):
    """Does a (start_frame, end_frame) burst intersect a (t0, t1) second window?"""
    s, e = run[0] / FPS, run[1] / FPS
    return s < window[1] and e > window[0]


def _active_pct(runs, window, total_frames):
    lo, hi = int(window[0] * FPS), min(int(window[1] * FPS), total_frames)
    if hi <= lo:
        return 0.0
    active = 0
    for s, e in runs:
        active += max(0, min(e, hi) - max(s, lo))
    return 100.0 * active / (hi - lo)


def analyse(path):
    g = load_gray(path)
    if len(g) < 2:
        return {"clip": os.path.basename(path), "error": "too few frames"}

    diff = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    floor = float(np.percentile(diff, 40))
    thresh = max(floor * 2.5, 0.6)
    runs = bursts(diff, thresh)

    entry_runs = [r for r in runs if _overlap(r, ENTRY)]
    longest_ms = max((1000 * (e - s) / FPS for s, e in runs), default=0.0)

    # Idle is judged localized, entry globally — see the note above the constants.
    idle_pct, idle_peak_px = local_idle(path)

    # Entry transitions run ~460ms (Duration.screen), so a long burst during ENTRY is
    # navigation, not a payoff. Only a long burst OUTSIDE the entry window is EARNED.
    payoff_ms = max(
        (1000 * (e - s) / FPS for s, e in runs if not _overlap((s, e), ENTRY)), default=0.0
    )

    # Ordered most-severe-first: the first band that matches wins.
    if payoff_ms > EARNED_MS:
        verdict = "GOOD"
    elif idle_pct >= 10.0:
        verdict = "OK"
    elif entry_runs or idle_pct > 0:
        verdict = "STATIC"
    else:
        verdict = "DEAD"

    return {
        "clip": os.path.basename(path),
        "frames": int(len(g)),
        "dur_s": round(len(g) / FPS, 1),
        "thresh": round(thresh, 2),
        "bursts": len(runs),
        "entry_bursts": len(entry_runs),
        "idle_pct": idle_pct,
        "idle_peak_px": idle_peak_px,
        "overall_pct": round(100.0 * sum(e - s for s, e in runs) / len(diff), 1),
        "longest_ms": round(longest_ms),
        "payoff_ms": round(payoff_ms),
        "verdict": verdict,
    }


def _demo():
    """Self-check on the windowing maths — no clips, no ffmpeg, no simulator."""
    # A burst from frame 30..60 is t=1.0..2.0s, i.e. inside ENTRY only.
    assert _overlap((30, 60), ENTRY) and not _overlap((30, 60), IDLE)
    # frame 150..180 is t=5.0..6.0s, inside IDLE only.
    assert _overlap((150, 180), IDLE) and not _overlap((150, 180), ENTRY)
    # A burst wholly before the windows touches neither.
    assert not _overlap((0, 15), ENTRY) and not _overlap((0, 15), IDLE)
    # IDLE spans 4.0-9.0s = 150 frames; a 75-frame burst inside it is 50%.
    assert abs(_active_pct([(150, 225)], IDLE, 270) - 50.0) < 0.1
    # A burst outside the window contributes nothing.
    assert _active_pct([(30, 60)], IDLE, 270) == 0.0
    print("motion_window self-check OK")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        _demo()
    else:
        for p in sys.argv[1:]:
            print(json.dumps(analyse(p)))
