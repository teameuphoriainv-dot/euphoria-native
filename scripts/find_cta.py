"""Find a route's primary CTA structurally, not by vocabulary.

The first version of the interaction pass matched a hardcoded verb list —
Continue|Check|Start|Next|Got it|Begin. It found nothing on welcome or auth, because an app's
button wording is not something an audit can enumerate in advance: this one alone ships "See
Euphoria Pro", "Show me the offer", "Sign up", "Restore purchases", "Upgrade to Pro". Any list
is a list of the labels I happened to think of.

A primary CTA has a SHAPE instead: it is the widest enabled button sitting in the lower part of
the screen. That definition survives rewording, translation, and screens I have never seen.

    EUPHORIA_UDID=... python3 scripts/find_cta.py   ->  prints the label, or nothing
"""
import json
import os
import subprocess
import sys

LOWER_FRACTION = 0.55   # CTAs live below this share of screen height
MIN_WIDTH_PT = 120.0    # narrower than this is a chip or an icon, not a primary action
# The tab bar occupies the last slice of the screen. Tapping a tab NAVIGATES AWAY, so any motion
# it produced would be a route change contaminating a measurement meant to be about THIS route.
TAB_BAR_FRACTION = 0.90
TAB_LABELS = {"Home", "Learn", "Trade", "Digest", "You"}


def main():
    udid = os.environ.get("EUPHORIA_UDID", "")
    if not udid:
        return
    idb = subprocess.run(["which", "idb"], capture_output=True, text=True).stdout.strip() \
        or os.path.expanduser("~/.idb-venv/bin/idb")
    out = subprocess.run([idb, "ui", "describe-all", "--udid", udid],
                         capture_output=True, text=True).stdout
    try:
        nodes = json.loads(out)
    except Exception:
        return
    screen_h = max((float((n.get("frame") or {}).get("height", 0)) for n in nodes), default=0)
    if screen_h <= 0:
        return
    best = None
    for n in nodes:
        if n.get("type") != "Button" or not n.get("enabled", True):
            continue
        f = n.get("frame") or {}
        w, y = float(f.get("width", 0)), float(f.get("y", 0))
        label = (n.get("AXLabel") or "").strip()
        if not label or w < MIN_WIDTH_PT or y < screen_h * LOWER_FRACTION:
            continue
        if y >= screen_h * TAB_BAR_FRACTION:
            continue
        if label.split(",")[0].strip() in TAB_LABELS:
            continue
        if best is None or w > best[0]:
            best = (w, label)
    if best:
        print(best[1])


if __name__ == "__main__":
    main()
