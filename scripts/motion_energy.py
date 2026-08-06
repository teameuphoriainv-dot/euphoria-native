"""Frame-difference motion-energy pass over a screen recording.

Decodes the whole clip to small grayscale frames, computes mean |delta| between
consecutive frames, and reports contiguous "animation bursts".

Duration = frames / fps, so at 30fps every reading is +/- 33.3ms.
"""
import subprocess
import sys

import numpy as np

W, H = 74, 160  # both source resolutions divide evenly to this


def load_gray(path):
    cmd = [
        "ffmpeg", "-v", "error", "-i", path,
        "-vf", f"scale={W}:{H}", "-pix_fmt", "gray",
        "-f", "rawvideo", "-",
    ]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (W * H)
    return np.frombuffer(raw, dtype=np.uint8)[: n * W * H].reshape(n, H, W).astype(np.int16)


def bursts(diff, thresh, min_gap=3, min_len=2):
    """Contiguous runs above threshold, merging gaps shorter than min_gap."""
    hot = diff > thresh
    runs, start = [], None
    gap = 0
    for i, h in enumerate(hot):
        if h:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                runs.append((start, i - gap + 1))
                start = None
    if start is not None:
        runs.append((start, len(hot)))
    return [r for r in runs if r[1] - r[0] >= min_len]


def main(path, fps=30.0):
    g = load_gray(path)
    # diff[i] describes the transition from frame i to frame i+1
    diff = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    floor = np.percentile(diff, 40)   # compression noise floor
    thresh = max(floor * 2.5, 0.6)
    print(f"\n### {path.split('/')[-1]}")
    print(f"frames={len(g)} dur={len(g)/fps:.1f}s noise_floor(p40)={floor:.2f} thresh={thresh:.2f}")
    print(f"diff percentiles p50={np.percentile(diff,50):.2f} "
          f"p90={np.percentile(diff,90):.2f} p99={np.percentile(diff,99):.2f} max={diff.max():.2f}")

    rs = bursts(diff, thresh)
    active = sum(e - s for s, e in rs)
    print(f"bursts={len(rs)} active_frames={active}/{len(diff)} ({100*active/len(diff):.1f}% of clip animating)")
    scored = sorted(rs, key=lambda r: diff[r[0]:r[1]].sum(), reverse=True)
    print(f"{'#':>3} {'t_start':>8} {'t_end':>8} {'frames':>6} {'ms':>6} {'peak':>6} {'energy':>8}")
    for i, (s, e) in enumerate(scored[:28]):
        seg = diff[s:e]
        print(f"{i:>3} {s/fps:>8.2f} {e/fps:>8.2f} {e-s:>6} {1000*(e-s)/fps:>6.0f} "
              f"{seg.max():>6.1f} {seg.sum():>8.1f}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        main(p)
