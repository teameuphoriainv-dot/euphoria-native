"""Per-window animation measurement with automatic curve classification.

For a time window it reports:
  d_prev   mean |frame - prev|              -> animation energy per frame
  cy/cx    centroid of |frame - first|      -> translation trajectory
  bbox     extent of changed pixels         -> displacement
  luma     mean frame brightness            -> flash / wash detection

Curve classification:
  overshoot = the trajectory passes its settled value and comes back
              -> spring. Monotonic approach -> tween / ease-out.

Duration = frames / fps. Source is 30fps => every reading is +/- 33.3ms.
Point conversion is an ASSUMPTION (source device unknown); px is authoritative.
"""
import subprocess
import sys

import numpy as np

NOISE = 18.0      # per-pixel delta below this is compression noise
ACTIVE = 0.8      # mean |delta| above this counts as "animating"


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0:s=,", path],
        capture_output=True, text=True, check=True).stdout.strip()
    w, h = out.split(",")[:2]
    return int(w), int(h)


def load(path, start, end):
    w, h = probe(path)
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{start}", "-to", f"{end}", "-i", path,
         "-pix_fmt", "gray", "-f", "rawvideo", "-"],
        capture_output=True, check=True).stdout
    n = len(raw) // (w * h)
    return np.frombuffer(raw, dtype=np.uint8)[: n * w * h].reshape(n, h, w).astype(np.float32), w, h


def fmt(a, p=0):
    return "[" + " ".join(f"{v:.{p}f}" for v in a) + "]"


def classify(traj, tol=0.8):
    """Overshoot if the trajectory passes its settled value and returns."""
    t = np.asarray(traj, dtype=float)
    ok = ~np.isnan(t)
    if ok.sum() < 4:
        return "insufficient", 0.0
    t = t[ok]
    settle, start = t[-1], t[0]
    if abs(settle - start) < tol:                 # no net travel: pulse/deform
        amp = t.max() - t.min()
        return ("pulse/return" if amp > tol else "static"), amp
    over = (t.max() - settle) if settle > start else (settle - t.min())
    return ("OVERSHOOT (spring)" if over > tol else "monotonic (tween/ease)"), over


def analyse(path, start, end, label, fps=30.0):
    g, w, h = load(path, start, end)
    if len(g) < 3:
        print(f"!! {label}: {len(g)} frames")
        return
    first = g[0]
    d_prev = np.array([0.0] + [np.abs(g[i] - g[i - 1]).mean() for i in range(1, len(g))])
    luma = g.mean(axis=(1, 2))

    cy, y0s, y1s = [], [], []
    for f in g:
        d = np.abs(f - first)
        m = d > NOISE
        if m.any():
            tot = d.sum()
            cy.append((d.sum(axis=1) * np.arange(h)).sum() / tot)
            ys = np.where(m.any(axis=1))[0]
            y0s.append(ys.min()); y1s.append(ys.max())
        else:
            cy.append(np.nan); y0s.append(np.nan); y1s.append(np.nan)

    hot = np.where(d_prev > ACTIVE)[0]
    pxpt = w / 390.0  # assumed iPhone logical width 390pt; px is authoritative
    print(f"\n### {label}   [{path.split('/')[-1].split('_')[1]} {start:.2f}-{end:.2f}s] {w}x{h} {len(g)}f")
    if len(hot):
        a, b = hot[0], hot[-1]
        print(f"motion  frames {a}..{b}  = {1000*(b-a+1)/fps:.0f} ms   (settle tail may extend past detection)")
    else:
        print("motion  none above threshold")
    print(f"d_prev  {fmt(d_prev,1)}")
    print(f"cy      {fmt(cy,1)}")
    verdict, amt = classify(cy)
    print(f"curve   {verdict}   magnitude={amt:.1f}px (~{amt/pxpt:.1f}pt @ assumed {pxpt:.2f}px/pt)")
    v2, a2 = classify(y0s)
    print(f"top-edge {v2}  travel={a2:.1f}px   y0 {np.nanmin(y0s):.0f}->{np.nanmax(y0s):.0f}")
    print(f"luma    first={luma[0]:.1f} max={luma.max():.1f} (f{luma.argmax()}) last={luma[-1]:.1f} "
          f"delta={luma.max()-luma[0]:.1f}")


if __name__ == "__main__":
    for spec in sys.argv[1:]:
        p, s, e, lab = spec.split("|")
        analyse(p, float(s), float(e), lab)
