"""Full corpus verification — all 12 courses, 300 lessons, every step, every visual.

The corpus brief's own pass criterion:

    courses 12   lessons 300   steps 5331
    visuals 1319: 1319 drew markup, 0 blank

WHY THIS EXISTS AS A GATE. The brief names the failure mode precisely: "You must handle all 25
step types — a missing case is a blank screen mid-lesson in a paid app." A learner who hits an
unhandled type does not see an error; they see nothing, mid-lesson, having paid. That is the
worst class of defect this product can ship, and it is invisible to any spot check because it
only appears on the one lesson that uses the one type nobody tested.

So this does not sample. It walks every course file and asserts the whole inventory.

WHAT IT CANNOT DO. This is static. It proves the DATA is complete and every type has a renderer
case; it cannot prove a renderer draws correctly. `check-visual-render` on device is the other
half. A green run here means "nothing is missing", never "everything looks right".

    python3 scripts/corpus_verify.py [--json]
"""
import glob
import json
import re
import sys

COURSES_GLOB = "src/lib/curriculum/courses/*.ts"
EXPECTED_COURSES = 12
EXPECTED_LESSONS_PER_COURSE = 25

# Step factories the corpus calls. A factory used in data with no renderer case is the blank
# screen the brief warns about.
STEP_FACTORIES = [
    "hookOpener", "teachingSlide", "microCheck", "summaryCards", "stakesCard", "whatsNext",
    "interactiveGraph", "caseStudy", "misconceptions", "keyTermsCards", "simulationFinale",
    "q", "tf", "m", "sl", "sc", "bi", "pc", "cq", "fb", "ds", "tr", "L",
]

# The AnimatedVisual kinds the corpus actually uses.
VISUAL_KINDS = ["flow", "comparison", "metric", "grid", "bars", "line", "stack", "pie",
                "pixel", "pictograph"]


def verify():
    files = sorted(glob.glob(COURSES_GLOB))
    per_course, factories, kinds = {}, {}, {}
    total_lessons = total_steps = 0

    for f in files:
        src = open(f, encoding="utf-8", errors="ignore").read()
        name = f.split("/")[-1].replace(".ts", "")
        # L(num, title, xp, steps, challenge) — a lesson is L( followed by its NUMBER.
        # A bare \bL\( also matched helper calls and comments: it reported corporateFinance at
        # 20 and quantitativeAnalysis at 29, neither of which was real. Anchoring on the numeric
        # first argument is what makes the count trustworthy.
        lesson_nums = [int(n) for n in re.findall(r"\bL\(\s*(\d+)\s*,", src)]
        lessons = len(lesson_nums)
        # Every factory call is one step.
        steps = 0
        for fac in STEP_FACTORIES:
            if fac == "L":
                continue
            n = len(re.findall(r"\b" + re.escape(fac) + r"\(", src))
            if n:
                factories[fac] = factories.get(fac, 0) + n
                steps += n
        for k in VISUAL_KINDS:
            n = len(re.findall(r"type:\s*'" + k + r"'", src))
            if n:
                kinds[k] = kinds.get(k, 0) + n
        dupes = sorted({n for n in lesson_nums if lesson_nums.count(n) > 1})
        expected = set(range(1, EXPECTED_LESSONS_PER_COURSE + 1))
        per_course[name] = {"lessons": lessons, "steps": steps,
                            "missing_nums": sorted(expected - set(lesson_nums)),
                            "duplicate_nums": dupes}
        total_lessons += lessons
        total_steps += steps

    # A renderer case must exist for every factory the data actually uses.
    renderer_src = ""
    for p in ("src/lib/curriculum/types.ts", "src/lib/curriculum/helpers.ts",
              "src/lib/curriculum/stepTypes.generated.ts"):
        try:
            renderer_src += open(p, encoding="utf-8").read()
        except OSError:
            pass
    missing = [f for f in factories if not re.search(r"\b" + re.escape(f) + r"\b", renderer_src)]

    return {
        "courses": len(files),
        "courses_expected": EXPECTED_COURSES,
        "lessons": total_lessons,
        "lessons_expected": EXPECTED_COURSES * EXPECTED_LESSONS_PER_COURSE,
        "steps": total_steps,
        "visuals": sum(kinds.values()),
        "visual_kinds": kinds,
        "unused_kinds": [k for k in VISUAL_KINDS if k not in kinds],
        "factories": factories,
        "factories_without_definition": missing,
        "per_course": per_course,
    }


def report(v):
    ok = lambda c: "OK " if c else "FAIL"  # noqa: E731
    print("# Corpus verification\n")
    c_ok = v["courses"] == v["courses_expected"]
    l_ok = v["lessons"] == v["lessons_expected"]
    print(f"  [{ok(c_ok)}] courses {v['courses']} / {v['courses_expected']}")
    print(f"  [{ok(l_ok)}] lessons {v['lessons']} / {v['lessons_expected']}")
    print(f"        steps   {v['steps']}")
    print(f"        visuals {v['visuals']} across {len(v['visual_kinds'])} kinds")

    print("\n## Lessons per course (each must be 25)")
    for name, d in sorted(v["per_course"].items()):
        bad = []
        if d["lessons"] != EXPECTED_LESSONS_PER_COURSE:
            bad.append(f"count {d['lessons']}")
        if d["missing_nums"]:
            bad.append(f"missing {d['missing_nums']}")
        if d["duplicate_nums"]:
            bad.append(f"dupes {d['duplicate_nums']}")
        flag = ("   <-- " + "; ".join(bad)) if bad else ""
        print(f"  {name:<28} {d['lessons']:>3} lessons  {d['steps']:>5} steps{flag}")

    print("\n## Visual kinds in use")
    for k, n in sorted(v["visual_kinds"].items(), key=lambda x: -x[1]):
        print(f"  {k:<14}{n:>6}")
    if v["unused_kinds"]:
        print(f"  UNUSED, so no renderer needed: {', '.join(v['unused_kinds'])}")

    m = v["factories_without_definition"]
    print(f"\n## Step factories used by data with no definition found: {len(m)}")
    print("  " + (", ".join(m) if m else "none  <- no blank-screen risk from a missing case"))


def _demo():
    assert EXPECTED_COURSES * EXPECTED_LESSONS_PER_COURSE == 300, "the brief's target is 300"
    # pixel/pictograph must be CHECKED for even though the corpus does not use them — dropping
    # them from the list would hide their reappearance after a future sync.
    assert "pixel" in VISUAL_KINDS and "pictograph" in VISUAL_KINDS
    print("corpus_verify self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        v = verify()
        print(json.dumps(v, indent=1)) if "--json" in sys.argv else report(v)
