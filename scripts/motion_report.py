"""Turn motion.jsonl into MOTION.md (the table) and RANKED.md (the worklist).

The verdict BANDS live in motion_window.py and are committed to git before any audit runs, so
they cannot be softened after seeing results. This file only formats and orders.

    python3 scripts/motion_report.py <motion.jsonl> <outdir>
"""
import json
import os
import sys

# Worst first. This ordering IS the worklist.
SEVERITY = {"UNREACHABLE": 0, "CONTAMINATED": 0, "DEAD": 1, "STATIC": 2,
            "REACTIVE": 3, "OK": 3, "GOOD": 4}

# A screen that holds still while you READ it and then responds well when you touch it is not
# a dead screen — it is a correctly designed one. motion_window only sees the idle window, so
# it cannot know that; act_ms can. Without this, every reading screen in a learning app reads
# as a defect, which is how an audit ends up arguing for motion in exactly the wrong places.
REACTIVE_MS = 400


def derive_verdict(r):
    """Promote STATIC/DEAD to REACTIVE when the route answers a tap."""
    v = r.get("verdict")
    if v in ("STATIC", "DEAD") and (r.get("act_ms") or 0) >= REACTIVE_MS:
        return "REACTIVE"
    return v

BANDS = """\
| verdict | meaning |
|---|---|
| **DEAD** | No burst anywhere. Nothing moves on arrival or at rest. |
| **STATIC** | Animates on entry, then flat. Idle is inert. |
| **OK** | Sustained motion at rest, but longest burst < 400ms — under the structural ceiling. |
| **GOOD** | A burst over 400ms exists: a real payoff beat. |
| **UNREACHABLE** | The harness could not reach or record the route. A tooling defect, **not** a motion finding. |\n| **CONTAMINATED** | Navigation, a dialog or a refresh landed inside the idle window. No number is reported — a plausible wrong one is worse than none. |\n| **REACTIVE** | Still at rest, but answers a tap with a beat of 400ms or more. A reading screen that holds still and then responds is correct, not dead. |
"""


def load(path):
    rows = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def rank_key(r):
    r = dict(r, verdict=derive_verdict(r))
    # Within a verdict, order by idle_peak_px — the pixel count that actually changes at rest.
    # It discriminates 20-40x where idle_pct barely moves (welcome 107px / learn 209px vs
    # home 7px, all of which score under 1% by frame-share). Peak pixels is what separates a
    # screen with a living mascot from one with a frozen one.
    return (
        SEVERITY.get(r.get("verdict", "DEAD"), 1),
        r.get("idle_peak_px", 0),
        r.get("idle_pct", 0.0),
    )


def name_of(r):
    return r.get("clip", "?").replace(".mp4", "")


def write_table(rows, out):
    lines = [
        "# Per-route motion audit",
        "",
        f"{len(rows)} routes. One 9s recording each: entry window 1.0-3.5s, idle window 4.0-9.0s.",
        "All clips re-encoded to CFR 30fps before measurement (VFR inflates the ratio).",
        "",
        "## Verdict bands",
        "",
        BANDS,
        "## Results",
        "",
        "`idle px` is the peak pixel count changing at rest — the metric that actually",
        "discriminates. `payoff ms` excludes the entry transition, so it counts only",
        "earned beats, not navigation.",
        "",
        "`act ms` is the longest burst after tapping the primary CTA — the half the idle",
        "columns cannot see. A route can be STATIC at rest and still animate well on touch.",
        "",
        "| route | verdict | idle px | idle % | overall % | entry ms | payoff ms | act ms |",
        "|---|---|---:|---:|---:|---:|---:|---:|",
    ]
    for r in sorted(rows, key=rank_key):
        if r.get("verdict") == "UNREACHABLE":
            lines.append(
                f"| `{name_of(r)}` | UNREACHABLE | — | — | — | — | — | {r.get('note','')} |"
            )
            continue
        lines.append(
            f"| `{name_of(r)}` | **{derive_verdict(r)}** | {r.get('idle_peak_px',0)} | "
            f"{r.get('idle_pct',0)} | {r.get('overall_pct',0)} | "
            f"{r.get('longest_ms',0)} | {r.get('payoff_ms',0)} | {r.get('act_ms','—')} |"
        )

    counts = {}
    for r in rows:
        v = derive_verdict(r) or "?"
        counts[v] = counts.get(v, 0) + 1
    lines += ["", "## Summary", ""]
    for v in sorted(counts, key=lambda k: SEVERITY.get(k, 9)):
        lines.append(f"- **{v}** — {counts[v]}")

    measured = [r for r in rows if r.get("verdict") != "UNREACHABLE"]
    if measured:
        avg = sum(r.get("overall_pct", 0) for r in measured) / len(measured)
        lines += [
            "",
            f"Mean frames-animating across measured routes: **{avg:.1f}%**.",
            "",
            "> Program target is >=15% on a release build. Competitor figures "
            "(Duolingo 31.8%, Brilliant 34.7-39.3%) are scroll-inflated and are NOT the target.",
        ]
    open(os.path.join(out, "MOTION.md"), "w").write("\n".join(lines) + "\n")


def write_ranked(rows, out):
    lines = [
        "# Motion worklist — deadest first",
        "",
        "Ordered by severity, then by how little moves at rest. Work the top of this list.",
        "UNREACHABLE rows are tooling defects to fix before their motion can be judged at all.",
        "",
    ]
    for i, r in enumerate(sorted(rows, key=rank_key), 1):
        v = r.get("verdict", "?")
        if v == "UNREACHABLE":
            lines.append(f"{i}. **`{name_of(r)}`** — UNREACHABLE ({r.get('note','')}) — fix the harness")
        else:
            lines.append(
                f"{i}. **`{name_of(r)}`** — {v} · idle {r.get('idle_pct',0)}% · "
                f"longest burst {r.get('longest_ms',0)}ms"
            )
    open(os.path.join(out, "RANKED.md"), "w").write("\n".join(lines) + "\n")


def _demo():
    rows = [
        {"clip": "a.mp4", "verdict": "GOOD", "idle_pct": 20.0, "overall_pct": 30.0, "longest_ms": 3200},
        {"clip": "b.mp4", "verdict": "DEAD", "idle_pct": 0.0, "overall_pct": 0.0, "longest_ms": 0},
        {"clip": "c.mp4", "verdict": "STATIC", "idle_pct": 0.2, "overall_pct": 5.0, "longest_ms": 260},
        {"clip": "d.mp4", "verdict": "UNREACHABLE", "note": "openurl failed"},
    ]
    order = [name_of(r) for r in sorted(rows, key=rank_key)]
    assert order == ["d", "b", "c", "a"], order  # tooling defect first, then worst motion
    # A deader idle sorts above a livelier one within the same verdict.
    same = [
        {"clip": "x.mp4", "verdict": "STATIC", "idle_pct": 0.9},
        {"clip": "y.mp4", "verdict": "STATIC", "idle_pct": 0.1},
    ]
    assert [name_of(r) for r in sorted(same, key=rank_key)] == ["y", "x"]
    # A STATIC route that answers a tap is REACTIVE, and must outrank a truly static one.
    assert derive_verdict({"verdict": "STATIC", "act_ms": 867}) == "REACTIVE"
    assert derive_verdict({"verdict": "STATIC", "act_ms": 100}) == "STATIC"
    assert derive_verdict({"verdict": "DEAD", "act_ms": 433}) == "REACTIVE"
    # A route with no interaction data must not be promoted on a missing key.
    assert derive_verdict({"verdict": "STATIC"}) == "STATIC"
    # GOOD must never be demoted by this.
    assert derive_verdict({"verdict": "GOOD", "act_ms": 0}) == "GOOD"
    print("motion_report self-check OK")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        _demo()
    else:
        jsonl, outdir = sys.argv[1], sys.argv[2]
        data = load(jsonl)
        write_table(data, outdir)
        write_ranked(data, outdir)
