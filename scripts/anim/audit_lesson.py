#!/usr/bin/env python3
"""Drive a lesson while RECORDING, then score every transition against MOTION_RUBRIC.md.

This is the payoff of the rest of scripts/anim: capture.py records at ~48fps (simctl's fixed
15fps cannot resolve a 280ms spring), drive.py + solve.py get through the lesson unaided,
segment.py finds where motion happened, and oscillate.py says whether it settled once.

Scored against refs/MOTION_RUBRIC.md, measured off the reference recordings:
  R1 duration  p25 0.27s .. p75 0.67s   (outside p10 0.13 / p90 1.20 needs a reason)
  R2 settle    a short transition settles in ONE pass; 73% of sub-0.35s reference
               transitions are single-peak, so a bounce must be chosen, not inherited
"""
import subprocess as sp, sys, os, glob, json, time, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import record, real_rate
from segment import diffs, windows
from oscillate import peaks
import drive, solve

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/audit"

def audit(course, num, seconds=95):
    os.makedirs(OUT, exist_ok=True)
    lessons = solve.load(course)
    L = next((l for l in lessons if l['num'] == num), None)
    if not L: return {'error': f'no lesson {num} in {course}'}

    if drive.at_launcher(): drive.reconnect()
    slug = course.replace('_', '-')
    slug = ''.join('-' + c.lower() if c.isupper() else c for c in slug)
    sp.run(["xcrun", "simctl", "openurl", drive.U, f"euphorianative://lesson?course={slug}&num={num}"],
           capture_output=True)
    time.sleep(4); drive.dismiss_logbox()

    h264 = f"{OUT}/{course}-{num}.h264"
    result = {}
    def go():
        done, log = drive.run_lesson(L, solve)
        result['done'], result['log'] = done, log
    t = threading.Thread(target=go); t.start()
    record(h264, seconds)          # records while the driver works
    t.join(timeout=30)

    n, rate = real_rate(h264, seconds + 1.2)
    fd = f"{OUT}/fr-{course}-{num}"
    sp.run(["rm", "-rf", fd]); os.makedirs(fd)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h264, f"{fd}/%05d.png"], check=True)
    frames = sorted(glob.glob(f"{fd}/*.png"))
    if len(frames) < 10: return {'error': 'too few frames', 'frames': len(frames)}

    from PIL import Image
    im = Image.open(frames[0]); tot = (im.width // 4) * (im.height // 4)
    series = diffs(frames)
    wins = windows(series, tot)

    findings = []
    for a, b in wins:
        dur = (b - a + 1) / rate
        pk = peaks(series[a:b + 1])
        r1 = 'PASS' if 0.13 <= dur <= 1.20 else 'OUTSIDE'
        r2 = 'PASS' if (dur > 0.35 or pk == 1) else 'FAIL'
        findings.append({'a': a, 'b': b, 't': round(a / rate, 2), 'dur': round(dur, 3),
                         'peaks': pk, 'R1': r1, 'R2': r2})
    return {'course': course, 'num': num, 'fps': round(rate, 1), 'frames': len(frames),
            'steps_advanced': sum(1 for _, _, m in result.get('log', []) if m),
            'done': result.get('done'), 'windows': len(wins), 'findings': findings}

if __name__ == '__main__':
    r = audit(sys.argv[1] if len(sys.argv) > 1 else 'personalFinance',
              int(sys.argv[2]) if len(sys.argv) > 2 else 3)
    if 'error' in r: print(r); sys.exit(1)
    print(f"{r['course']} lesson {r['num']} · {r['frames']} frames @ {r['fps']}fps · "
          f"{r['steps_advanced']} steps advanced · {r['windows']} motion windows\n")
    bad = [f for f in r['findings'] if f['R1'] != 'PASS' or f['R2'] != 'PASS']
    print(f"{'t(s)':>7}{'dur':>7}{'peaks':>7}  R1      R2")
    for f in r['findings'][:40]:
        flag = '  <-- ' + ' '.join(k for k in ('R1', 'R2') if f[k] != 'PASS') if f in bad else ''
        print(f"{f['t']:>7}{f['dur']:>7}{f['peaks']:>7}  {f['R1']:<7} {f['R2']}{flag}")
    print(f"\n{len(bad)} of {len(r['findings'])} transitions fail a rubric rule")
    json.dump(r, open(f"{OUT}/{r['course']}-{r['num']}.json", 'w'), indent=1)
