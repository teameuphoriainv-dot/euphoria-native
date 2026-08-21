"""Does the welcome drop SPRING PAST its resting position? Read from the driving value, A/B.

welcome.tsx:24-27 carries the author's own account of the defect:

    "damping 13 was underdamped: the drop sprang PAST its resting position and pushed Atlas down
     into the headline before settling back. That overshoot is what read as the mascot falling
     into the text. 19 lands it with weight but without the dip."

The fix never worked. Reanimated 4 defaults mass to 4 and this is an INLINE spring, so at damping
19 the real damping ratio was 19 / (2*sqrt(90*4)) = 0.501, not the 1.001 the author computed --
16.2% overshoot rather than none. Raising damping 13 -> 19 took the dip from 33.1% to 16.2% and was
read as having removed it. `mass: 1` is what actually removes it.

FIRST ATTEMPT, AND WHY IT IS NOT THIS: tracking the lowest bright pixel row in a band over the top
70% of the screen. It reported 34.7pt of travel on a ~367pt drop, because that band's lowest bright
row is the static HEADLINE TEXT, not Atlas -- the measurement never followed the mascot at all.
Region heuristics keep losing on this screen for the same reason they lost six times on R6.

SO READ THE VALUE. `drop` is a shared value that runs from -(height * 0.42) to 0, and overshoot is
not a judgement call on it: an overshoot is `drop` going POSITIVE, past its own target. Ten plain
__DEV__ JS timers read it, each recording its OWN arrival time so scheduler jitter costs nothing.
No worklet, no frame callback, no pixels, no confound.

PRE-REGISTERED before the run (height 874 -> throw 367pt):
  arm A (shipping, mass: 1)   zeta 1.0013  peak drop <= 0      -- never crosses, no dip
  arm B (mass removed -> 4)   zeta 0.5007  peak drop ~ +59.5pt at ~765ms, then settles back
"""
import sys, os, time, json, subprocess as sp
sys.path.insert(0, 'scripts/anim')
import drive

U = drive.U
LOG = os.environ.get('METRO_LOG', '/tmp/metro.log')
MARK = '[DROP]'
FILE = 'src/app/welcome.tsx'
SHIPPED = "withSpring(0, { stiffness: 90, damping: 19, mass: 1 })"
NO_MASS = "withSpring(0, { stiffness: 90, damping: 19 })"

INSTRUMENT = """
  // TEMPORARY __DEV__ instrument (drop_probe.py). Reverted in the same session.
  useEffect(() => {
    if (!__DEV__ || reduced) return;
    const t0 = Date.now();
    const out: number[] = [];
    const ids = [80, 200, 320, 440, 560, 680, 780, 900, 1100, 1500, 2200].map((ms) =>
      setTimeout(() => {
        out.push(Date.now() - t0, drop.get());
        if (out.length === 22) console.log('[DROP]' + JSON.stringify(out));
      }, ms),
    );
    return () => ids.forEach(clearTimeout);
  }, [reduced, drop]);
"""
ANCHOR = "  const atlasStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drop.get() }] }));"

try:
    import urllib.request
    urllib.request.urlopen("http://localhost:8081/status", timeout=3).read()
except Exception:
    print("METRO IS DOWN — start it with `npm start`."); sys.exit(2)


def new_log(start):
    with open(LOG, 'rb') as f:
        f.seek(start)
        return f.read().decode('utf8', 'replace')


def run_arm(name):
    start = os.path.getsize(LOG)
    sp.run(["xcrun", "simctl", "terminate", U, drive.BUNDLE], capture_output=True)
    sp.run(["xcrun", "simctl", "launch", U, drive.BUNDLE], capture_output=True)
    time.sleep(18)
    if drive.at_launcher():
        drive.reconnect()
    drive.dismiss_logbox(); drive.dismiss_sheet()
    for attempt in range(4):
        sp.run(["xcrun", "simctl", "openurl", U, "euphorianative://welcome"], capture_output=True)
        time.sleep(3.5)
        drive.dismiss_logbox()
        txt = new_log(start)
        if MARK in txt:
            line = [l for l in txt.splitlines() if MARK in l][-1]
            raw = json.loads(line[line.index(MARK) + len(MARK):].strip())
            return [(raw[i], raw[i + 1]) for i in range(0, len(raw) - 1, 2)]
        # bounce off another route so the next openurl is a real mount, not a no-op
        sp.run(["xcrun", "simctl", "openurl", U, "euphorianative://home"], capture_output=True)
        time.sleep(2.0)
    print(f"[{name}] no {MARK} line — welcome never mounted with the instrument live")
    return None


def score(name, pairs):
    if not pairs:
        return None
    lo = min(v for _, v in pairs)          # most negative = the top of the drop
    hi = max(v for _, v in pairs)          # most positive = how far PAST rest it went
    rest = pairs[-1][1]
    travel = abs(lo)
    print(f"\n=== ARM {name} ===")
    print("     t(ms)   drop(pt)")
    for ms, v in pairs:
        print(f"   {ms:>6}   {v:>8.2f}")
    print(f"  travel from       {lo:8.1f}pt")
    print(f"  settles at        {rest:8.2f}pt")
    print(f"  furthest PAST 0   {max(0.0, hi):8.2f}pt")
    if travel < 100:
        print("  the drop never played — NOT SCORING"); return None
    print(f"  overshoot         {max(0.0, hi) / travel * 100:7.1f}% of travel")
    return max(0.0, hi), travel


orig = open(FILE).read()
assert ANCHOR in orig, "anchor line moved; re-read welcome.tsx"
assert SHIPPED in orig, "shipping source no longer carries mass: 1"
A = B = None
try:
    open(FILE, 'w').write(orig.replace(ANCHOR, INSTRUMENT + ANCHOR, 1))
    time.sleep(8)
    A = run_arm("A_mass1")
    instrumented_no_mass = orig.replace(ANCHOR, INSTRUMENT + ANCHOR, 1).replace(SHIPPED, NO_MASS, 1)
    open(FILE, 'w').write(instrumented_no_mass)
    print("\n[counterfactual] mass: 1 REMOVED (falls back to Reanimated's default 4)")
    time.sleep(10)
    B = run_arm("B_mass4")
finally:
    open(FILE, 'w').write(orig)
    print("\n[restore] welcome.tsx restored")
    sp.run(["git", "diff", "--stat", "--", FILE])

sa = score("A (shipping: mass 1, zeta 1.001)", A)
sb = score("B (counterfactual: mass 4, zeta 0.501)", B)
print("\nPRE-REGISTERED: A never crosses 0; B peaks near +59.5pt (16.2% of a ~367pt throw) at ~765ms.")
if sa is None or sb is None:
    print("VERDICT: INCONCLUSIVE — an arm did not produce a scorable drop.")
elif sa[0] <= 4.0 and sb[0] > 20.0:
    print(f"VERDICT: DIP REMOVED — A goes {sa[0]:.1f}pt past rest, B goes {sb[0]:.1f}pt. The author's")
    print("         stated intent holds for the first time; damping 19 alone never delivered it.")
elif sa[0] <= 4.0 and sb[0] <= 4.0:
    print("VERDICT: INSTRUMENT CANNOT DISTINGUISH — neither arm dips. A proves nothing.")
else:
    print(f"VERDICT: A STILL DIPS {sa[0]:.1f}pt past rest.")
