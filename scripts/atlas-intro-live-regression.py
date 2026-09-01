#!/usr/bin/env python3
"""Live iOS regression for the first-ever Atlas lesson introduction.

The production web inserts Atlas's origin sequence between the warmup and the first authored
slide. This test uses the native dev-only ``fresh=1`` contract to make that state reproducible,
then asserts the overlay is actually present after the learner starts the lesson. It intentionally
tests the rendered accessibility tree instead of source strings or a mocked component.
"""

import subprocess as sp
import sys
import time

sys.path.insert(0, "scripts/anim")
import drive  # noqa: E402


COURSE = "investing-fundamentals"
LESSON = 1
TITLE = "Introduction to Investing"


def tap_exact(label):
    matches = [node for node in drive.nodes() if node[4] == label]
    if not matches:
        raise AssertionError(f"Could not find rendered control {label!r}")
    node = matches[0]
    sp.run(
        [
            "idb", "ui", "tap", "--udid", drive.U, "--duration", "0.2",
            str(node[0] + node[2] // 2), str(node[1] + node[3] // 2),
        ],
        check=True,
        capture_output=True,
    )


def wait_for_label(label, timeout):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if label in drive.labels():
            return True
        time.sleep(0.2)
    return False


def main():
    sp.run(["xcrun", "simctl", "openurl", drive.U, "euphorianative://home"], check=True)
    time.sleep(0.7)
    sp.run(
        [
            "xcrun", "simctl", "openurl", drive.U,
            f"euphorianative://lesson?course={COURSE}&num={LESSON}&fresh=1",
        ],
        check=True,
    )
    if not wait_for_label(TITLE, 8):
        raise AssertionError("Fresh lesson did not render its warmup title")
    if not wait_for_label("Start lesson", 4):
        raise AssertionError("Fresh lesson did not render its Start lesson control")

    tap_exact("Start lesson")
    if not wait_for_label("Atlas introduction", 2):
        visible = sorted(drive.labels())
        raise AssertionError(
            "Native skipped the first-ever Atlas introduction after Start lesson. "
            f"Rendered labels: {visible}"
        )

    print("atlas intro live regression passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
