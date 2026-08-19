"""Empty / loading / error state audit.

The QA research names this the single most commonly skipped audit row, and the reason is
structural: the POPULATED state is the one that gets designed, reviewed and demoed. The other
three only appear when something is slow, absent or broken — which is to say, when the user is
already having a bad time and can least afford a blank screen.

WHAT EACH STATE HAS TO BE, per the research:

  loading   a skeleton, not a blank flash and not a bare spinner. A spinner says "wait"; a
            skeleton says "here is the shape of what is coming", which measurably reduces
            perceived wait.
  empty     helpful copy AND a call to action. "No data" is a dead end; an empty state is the
            one screen guaranteed to be a user's FIRST experience of a feature.
  error     a retry affordance and an actionable message. Never a raw error dump — this repo has
            already shipped a raw RevenueCat string to users once, fixed in Unit 13.

WHAT THIS CANNOT DO, stated plainly because the touch lane taught it: static analysis finds
whether a BRANCH EXISTS, never whether it renders correctly or is reachable. A screen can have
all four branches and still flash blank for 200ms before the skeleton mounts. This lane produces
the worklist; the simulator with a seeded empty store settles it.

    python3 scripts/states_audit.py [--json]
"""
import glob
import json
import re
import sys

# A screen only needs these states if it FETCHES. A static screen with no async data has no
# loading state to get wrong, and flagging it would be noise.
# Direct `fetch` is not how this app fetches. Screens call helpers in src/lib/market, so a
# marker list of fetch/await only ever matched the REAL fetching screens by accident — via
# `/api/` appearing in a comment. Stripping comments removed the accident and stock/[sym]
# silently dropped out of the audit despite calling getQuote.
#
# Importing from the market lib IS the structural signal, so that is what is matched.
# The market-lib import is the structural fetch signal. BOTH QUOTE STYLES AND SUBPATHS are
# matched, because this repo genuinely mixes them — 19 files use double-quoted imports, and a
# matcher that knew only `from '@/lib/market'` would silently drop a fetching screen the day
# someone wrote it the other way. That is the false-negative class iteration 60 found in
# locale_audit, which reported ZERO currency defects while two existed. No screen is hidden
# TODAY (all 9 market imports happen to be single-quoted); this closes the door before it is.
FETCH_MARKERS = (r"from ['\"]@/lib/market['\"/]", r"await fetch", r"\bisLoading\b", r"\brefetch\b")

SIGNALS = {
    # Ordered most-specific first: a skeleton is the correct loading state, a bare spinner is the
    # weaker one the research calls out, so they are counted separately rather than lumped.
    "skeleton": (r"[Ss]keleton", ),
    "spinner": (r"ActivityIndicator", ),
    "empty": (r"[Ee]mptyState", r"length === 0", r"length == 0", r"\.length\s*\?", r"[Nn]o results",
              r"[Nn]othing here", r"[Nn]o .{0,18} yet"),
    "error": (r"\berror\b", r"[Cc]atch\s*\(", r"onRetry", r"[Tt]ry again", r"[Rr]etry"),
    "retry": (r"onRetry", r"[Tt]ry again", r"[Rr]etry"),
}


def strip_comments(text):
    """Drop // and /* */ comments before matching.

    trade.tsx was flagged as a data-fetching screen on the strength of `/api/market` appearing
    in a COMMENT — it has zero .then, .catch or await. Auditing prose as if it were code is the
    same error as the 30pt "touch target" that turned out to be a non-interactive status pill:
    the lane was right that the string was there and wrong about what it meant.
    """
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return re.sub(r"//[^\n]*", "", text)


def fetches(text):
    return any(re.search(p, strip_comments(text)) for p in FETCH_MARKERS)


def has(text, key):
    return any(re.search(p, text) for p in SIGNALS[key])


def audit():
    rows = []
    for f in sorted(glob.glob("src/app/**/*.tsx", recursive=True)):
        raw = open(f, encoding="utf-8", errors="ignore").read()
        if not fetches(raw):
            continue
        t = strip_comments(raw)  # signals must come from code, not from prose about code
        rows.append({
            "file": f,
            "skeleton": has(t, "skeleton"),
            "spinner": has(t, "spinner"),
            "empty": has(t, "empty"),
            "error": has(t, "error"),
            "retry": has(t, "retry"),
        })
    return {"screens": rows}


def report(a):
    rows = a["screens"]
    print(f"# Empty / loading / error states\n\n{len(rows)} data-fetching screens\n")
    print(f"  {'screen':<34}{'loading':>9}{'empty':>7}{'error':>7}{'retry':>7}")
    for r in rows:
        load = "skeleton" if r["skeleton"] else ("spinner" if r["spinner"] else "NONE")
        print(f"  {r['file'].replace('src/app/',''):<34}{load:>9}"
              f"{'yes' if r['empty'] else 'NO':>7}{'yes' if r['error'] else 'NO':>7}"
              f"{'yes' if r['retry'] else 'NO':>7}")

    # NOT a gap by itself. stock/[sym] has no loading state and does not need one: it renders
    # priceOf(sym) from the static table IMMEDIATELY and swaps in the live quote when it lands,
    # so there is no blank period to fill. A skeleton there would HIDE content that already
    # exists and make the screen feel slower. "No loading state" is only a defect when the
    # screen is actually blank while waiting — which static analysis cannot see.
    gaps = {
        "no loading state (VERIFY: only a defect if the screen is blank while waiting)":
            [r["file"] for r in rows if not r["skeleton"] and not r["spinner"]],
        "bare spinner, no skeleton": [r["file"] for r in rows if r["spinner"] and not r["skeleton"]],
        "no empty state": [r["file"] for r in rows if not r["empty"]],
        "error handled but NO retry": [r["file"] for r in rows if r["error"] and not r["retry"]],
        "no error handling": [r["file"] for r in rows if not r["error"]],
    }
    print("\n## Gaps")
    for label, files in gaps.items():
        print(f"  {label}: {len(files)}")
        for f in files[:6]:
            print(f"      {f.replace('src/app/','')}")
    print("\n> A branch EXISTING is not a branch RENDERING. Settle these on a seeded empty store.")


def _demo():
    # A screen that does not fetch must never be audited — it has no loading state to lack.
    assert not fetches("export default function Static() { return <View/> }")
    assert fetches("const r = await fetch('/api/market')")
    assert fetches("const [isLoading, setLoading] = useState(false)")
    # A marker inside a COMMENT must not make a screen count as fetching — this is exactly how
    # trade.tsx got flagged, on the string /api/market sitting in an explanatory comment.
    assert not fetches("// invisible only because /api/market 503s")
    assert not fetches("/* we used to await fetch here */")
    # The app fetches through its own helpers, so the IMPORT is the signal — not a bare `fetch`.
    assert fetches("import { getQuote } from '@/lib/market';")
    # Both quote styles and subpaths — the blind spot this lane shared with locale_audit.
    assert fetches('import { getQuote } from "@/lib/market";')
    assert fetches("import { q } from '@/lib/market/quotes';")
    # ...and a LOOKALIKE package must still not count, or the fix trades a false negative for a
    # false positive. The trailing ['\"/] is what makes `market` end where it should.
    assert not fetches("import { x } from '@/lib/marketing';")
    # A dynamic import of a bundled chunk is NOT a network fetch and must not be audited as one:
    # it cannot be rate-limited, and learn.tsx's fall-through-to-empty catch is correct for it.
    assert not fetches("import('./courses/x').then(m => m.default)")
    # ...but the same marker in real code still counts.
    assert fetches("const r = await fetch('/api/market')")
    # Skeleton and spinner are distinct: a bare spinner is the weaker state, not an equal one.
    assert has("<Skeleton/>", "skeleton") and not has("<Skeleton/>", "spinner")
    assert has("<ActivityIndicator/>", "spinner") and not has("<ActivityIndicator/>", "skeleton")
    # Retry is a stricter signal than error — handling an error without offering a way out is a gap.
    assert has("catch (e) {}", "error") and not has("catch (e) {}", "retry")
    assert has("<Button onRetry={go}/>", "retry")
    print("states_audit self-check OK")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        _demo()
    else:
        a = audit()
        print(json.dumps(a, indent=1)) if "--json" in sys.argv else report(a)
