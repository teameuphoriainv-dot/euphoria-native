#!/usr/bin/env python3
"""
Drive one lesson to completion through every gated step type.

Why this exists: the lesson player gates Continue on six different interactive step
kinds (reveal, order, multi, line, match, build). Verifying that `completeLesson`
actually writes to the store therefore means SOLVING a lesson, not clicking through
it — and doing that by pixel coordinates is what failed repeatedly. This drives off
the accessibility tree instead, which is reliable because every one of those
components now announces its own state.

Answer keys are keyed by a distinctive substring of the ON-SCREEN text and come from
the authored curriculum, not from reasoning about the content. Getting this wrong
once already cost a long debugging detour: the drag-sort key has System 1 firing
BEFORE loss aversion, which is not the order causal intuition suggests.

Usage:  python3 scripts/solve-lesson.py <UDID> [max_rounds]
"""
import json
import subprocess
import sys
import time

IDB = "/Users/siddarthakodithyala/.idb-venv/bin/idb"
UDID = sys.argv[1]
MAX_ROUNDS = int(sys.argv[2]) if len(sys.argv) > 2 else 60

# --- authored answer keys, by distinctive on-screen substring ----------------------
CHOICE_ANSWERS = [
    "System 1, and this 15% loss feels about 2.5x worse",
    "He missed about $17,000 in recovery",
    "Do nothing, close the brokerage app",
    "Explain that her panic is a System 1 amygdala response",
]
EXACT_ANSWERS = ["2.5"]                      # fill-in-the-blank tiles
MULTI_TRUE = ["Loss aversion means losses feel", "underperforms the S&P 500", "Automating investments"]
ORDER_KEY = [                                # ds() order — from source, NOT from intuition
    "Market drops 15",
    "System 1 activates",
    "Loss aversion makes",
    "sells at or near",
    "Market recovers",
    "misses the recovery",
]
MATCH_PAIRS = {                              # m() pairs — left term -> right definition
    "System 1": "Fast, automatic, emotional thinking",
    "System 2": "Slow, deliberate, analytical thinking",
    "Loss Aversion": "Losses feel 2.5x more painful",
    "DALBAR Gap": "4-5% annual underperformance",
}
# sl() spec: min 1, max 12, answer 5  ->  fraction along the track
SLIDER_FRACTION = (5 - 1) / (12 - 1)


def tree():
    out = subprocess.run([IDB, "ui", "describe-all", "--udid", UDID],
                         capture_output=True, text=True).stdout
    try:
        return json.load(__import__("io").StringIO(out))
    except Exception:
        return []


# The pinned footer starts around here. Anything below it loses hit-testing to the footer,
# so a target in this band has to be scrolled up before it can be tapped.
FOOTER_TOP = 735


def scroll_up(amount=200):
    """Scroll the step body. NOTE the --duration: an instant swipe is not interpreted as a
    scroll gesture at all, it just lands as a tap. That single missing flag made an earlier
    run conclude the content was unscrollable when it was not."""
    subprocess.run([IDB, "ui", "swipe", "--udid", UDID, "--duration", "0.6",
                    "201", "620", "201", str(620 - amount)], capture_output=True)
    time.sleep(1.5)


def tap(x, y, pause=1.8):
    subprocess.run([IDB, "ui", "tap", "--udid", UDID, str(int(x)), str(int(y))],
                   capture_output=True)
    time.sleep(pause)


def tap_safe(e, pause=1.8):
    """Tap an element, scrolling it clear of the footer first if it is underneath it."""
    x, y = centre(e)
    if y > FOOTER_TOP:
        scroll_up()
        for f in tree():
            if label(f) == label(e):
                x, y = centre(f)
                break
    tap(x, y, pause)


def label(e):
    return " ".join((e.get("AXLabel") or "").split())


def centre(e):
    f = e["frame"]
    return f["x"] + f["width"] / 2, f["y"] + f["height"] / 2


def step(d):
    """Return (action_name, callable) for the current screen, or None when finished."""
    # 1. flip cards BOTTOM-UP: expanding a card only pushes what is below it, so working
    #    upward keeps the remaining targets valid. Top-down invalidates them every tap.
    cards = [e for e in d if "Not revealed yet" in label(e)]
    if cards:
        e = max(cards, key=lambda e: e["frame"]["y"])
        return "card", lambda: tap_safe(e)

    # 2. production dragSort: each round shows one adjacent pair. Pick the item that appears
    #    earlier in the authored order; the component owns Next round and the final reveal.
    def rank(l):
        for i, key in enumerate(ORDER_KEY):
            if key.lower() in l.lower():
                return i
        return 99
    pair = [e for e in d if e.get("enabled") is not False and rank(label(e)) < 99]
    if len(pair) == 2 and any("Which one comes first" in label(e) for e in d):
        answer = min(pair, key=lambda e: rank(label(e)))
        return "pair", lambda answer=answer: tap_safe(answer, pause=1.3)

    # 3. multi-select: drive the set to exactly the correct one, using the announced state
    boxes = [e for e in d if "checkbox" in str(e.get("AXValue") or "")]
    if boxes:
        for e in boxes:
            should = any(k.lower() in label(e).lower() for k in MULTI_TRUE)
            is_on = "unchecked" not in str(e.get("AXValue"))
            if should != is_on:
                return "toggle", lambda e=e: tap_safe(e)

    # 4. matching pairs: tap a left term, then its definition
    lefts = [e for e in d if label(e) in MATCH_PAIRS and e.get("enabled")]
    if lefts:
        l = lefts[0]
        want = MATCH_PAIRS[label(l)]
        rights = [e for e in d if want.lower() in label(e).lower() and e.get("enabled")]
        if rights:
            r = rights[0]
            return "match", lambda: (tap_safe(l, pause=0.9), tap_safe(r, pause=1.6))

    # 5. any enabled CTA
    for name in ("Next round", "See the full order", "Continue", "Check", "Check answer", "Check your answer"):
        cta = [e for e in d if label(e) == name and e.get("enabled")]
        if cta:
            return "cta:" + name, lambda e=cta[0]: tap_safe(e)

    # 6. number line / slider: tap the computed fraction along the track. Identified by the
    #    adjustable row being the SHORT duplicate of the prompt (the tall one is the text).
    adj = [e for e in d if label(e) and e["frame"]["height"] < 70 and e["frame"]["width"] > 300
           and ("DALBAR" in label(e) or "approximately" in label(e))]
    if adj:
        e = adj[0]; f = e["frame"]
        return "slider", lambda: tap(f["x"] + SLIDER_FRACTION * f["width"], f["y"] + f["height"] / 2)

    # 7. exact-match tiles, then keyword choices
    for e in d:
        if label(e) in EXACT_ANSWERS:
            return "exact", lambda e=e: tap_safe(e)
    for e in sorted([x for x in d if x["frame"]["width"] > 300], key=lambda x: x["frame"]["y"]):
        if any(k.lower() in label(e).lower() for k in CHOICE_ANSWERS):
            return "choice", lambda e=e: tap_safe(e)
    return None


def main():
    seen_done = 0
    for r in range(1, MAX_ROUNDS + 1):
        d = tree()
        if any("problem loading" in label(e).lower() for e in d):
            print("\nERROR OVERLAY — stopping"); return 2
        s = step(d)
        if s is None:
            seen_done += 1
            print("[idle]", end=" ", flush=True)
            if seen_done >= 3:
                print("\nno actionable element three times — stopping"); return 1
            time.sleep(2); continue
        seen_done = 0
        name, act = s
        print(name, end=" ", flush=True)
        act()
    print("\nreached max rounds"); return 1


sys.exit(main())
