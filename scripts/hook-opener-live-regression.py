#!/usr/bin/env python3
"""Rendered small-iPhone regression for the canonical lesson hook opener.

The exact 49e web slide keeps its complete learning outcome and Begin control inside a 402x874
viewport. Native previously used a double-padded chart card with a 280pt floor, which pushed Begin
below the physical screen and let the floating Atlas cover the outcome.
"""

import subprocess as sp
import sys
import time

sys.path.insert(0, "scripts/anim")
import drive  # noqa: E402


# Atlas's proactive tutor bubble occupies the lower-right teaching affordance from roughly y=760.
# Keep the primary CTA fully above that lane; merely being inside the physical screen is not enough.
CTA_SAFE_BOTTOM = 748


def wait_nodes(timeout=8):
    deadline = time.time() + timeout
    while time.time() < deadline:
        nodes = drive.nodes()
        if any(node[4] == "Start lesson" for node in nodes):
            return nodes
        time.sleep(0.2)
    raise AssertionError("Lesson warmup did not render")


def tap_node(node):
    drive.tap(node)


def main():
    sp.run(["xcrun", "simctl", "openurl", drive.U, "euphorianative://home"], check=True)
    time.sleep(0.5)
    sp.run(
        ["xcrun", "simctl", "openurl", drive.U,
         "euphorianative://lesson?course=investing-fundamentals&num=1"],
        check=True,
    )
    nodes = wait_nodes()
    tap_node(next(node for node in nodes if node[4] == "Start lesson"))

    deadline = time.time() + 4
    begin = None
    while time.time() < deadline:
        begin = next((node for node in drive.nodes() if node[4] == "Begin"), None)
        if begin:
            break
        time.sleep(0.2)
    if not begin:
        raise AssertionError("Hook opener did not render its Begin control")

    bottom = begin[1] + begin[3]
    if bottom > CTA_SAFE_BOTTOM:
        raise AssertionError(
            f"Hook opener Begin control ends at y={bottom}, below the y={CTA_SAFE_BOTTOM} Atlas-safe lane"
        )

    print(f"hook opener live regression passed (Begin bottom={bottom})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
