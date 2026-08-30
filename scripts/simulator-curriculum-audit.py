#!/usr/bin/env python3
"""Open every native lesson on a booted iOS simulator and verify its intro contract.

The semantic audits prove that the generated data matches the canonical web course objects.
This audit covers the other half of the promise: every one of those objects resolves through the
real Expo route and produces an accessible, tappable first screen on iOS. Results checkpoint after
every lesson so an interrupted 300-route run never masquerades as complete coverage.
"""

import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "anim"))
import drive  # noqa: E402
import solve  # noqa: E402


OUT = os.environ.get("EUPHORIA_SIM_AUDIT_OUT", "/tmp/euphoria-simulator-curriculum-audit.json")


def visible(node):
    _, y, _, height, *_ = node
    return height > 0 and y < 874 and y + height > 0


def audit_lesson(course, lesson):
    started = time.time()
    title = lesson["title"]
    number = lesson["num"]
    navigated = drive.goto_lesson(course, number, title=title)
    nodes = drive.nodes()
    labels = [node[4] for node in nodes]
    joined = " ".join(labels).lower()
    title_visible = any(title.lower() in label.lower() and visible(node) for node, label in zip(nodes, labels))
    continue_nodes = [node for node in nodes if node[4].strip().lower() == "continue" and visible(node)]
    failure_screen = "that lesson isn't available" in joined or "pick another lesson" in joined
    logbox = any("[iap]" in label.lower() for label in labels)
    ok = navigated and title_visible and bool(continue_nodes) and not failure_screen and not logbox
    return {
        "course": course,
        "num": number,
        "title": title,
        "ok": ok,
        "navigated": navigated,
        "titleVisible": title_visible,
        "continueVisible": bool(continue_nodes),
        "failureScreen": failure_screen,
        "logboxVisible": logbox,
        "seconds": round(time.time() - started, 2),
    }


def main():
    corpus = solve.load()
    expected = sum(len(lessons) for lessons in corpus.values())
    results = []
    print(f"Simulator curriculum route audit: {len(corpus)} courses / {expected} lessons", flush=True)
    if os.path.exists(OUT):
        try:
            with open(OUT, "r", encoding="utf-8") as handle:
                checkpoint = json.load(handle)
            prior = checkpoint.get("results", [])
            if checkpoint.get("expected") == expected and prior and all(row.get("ok") for row in prior):
                results = prior
                print(f"Resuming from {len(results)} verified lesson routes in {OUT}", flush=True)
        except (OSError, ValueError, TypeError):
            # A partial/corrupt checkpoint is not evidence. Start clean and overwrite it below.
            results = []

    completed = {(row["course"], row["num"]) for row in results}
    for course, lessons in corpus.items():
        for lesson in lessons:
            if (course, lesson["num"]) in completed:
                continue
            result = audit_lesson(course, lesson)
            results.append(result)
            with open(OUT, "w", encoding="utf-8") as handle:
                json.dump({"expected": expected, "results": results}, handle, indent=2)
            status = "PASS" if result["ok"] else "FAIL"
            print(
                f"[{len(results):>3}/{expected}] {status} {course}-{lesson['num']:02d} "
                f"{lesson['title']} ({result['seconds']}s)",
                flush=True,
            )

    failed = [result for result in results if not result["ok"]]
    print(f"\n{len(results) - len(failed)}/{expected} lesson routes passed", flush=True)
    if failed:
        print(json.dumps(failed, indent=2), flush=True)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
