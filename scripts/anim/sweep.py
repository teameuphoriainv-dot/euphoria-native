#!/usr/bin/env python3
"""Record and score 5 lessons on every pathway — the audit's breadth pass.

12 courses x 5 lessons. Each lesson is recorded on its OWN stream at ~48fps while the driver
works through it, then segmented into motion windows and scored against refs/MOTION_RUBRIC.md.

Per lesson rather than one long take, deliberately: 60 lessons in a single stream would be a
multi-GB file where one decode failure loses everything, and a per-lesson file can be re-run
alone when a lesson stalls.

COVERAGE IS REPORTED HONESTLY. A lesson the driver could not finish is recorded as PARTIAL with
the step it stalled on and the kind that beat it. A sweep that quietly drops the hard lessons
would report the easy ones as if they were the whole app -- and a clean number read off partial
coverage is worse than no number.

  python3 scripts/anim/sweep.py [--lessons 5] [--courses a,b] [--secs 150]
"""
import subprocess as sp, sys, os, glob, json, time, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import record, real_rate
from segment import diffs, windows
from oscillate import peaks
import drive, solve

OUT = "/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/sweep"

def slug(course):
    return ''.join('-' + c.lower() if c.isupper() else c for c in course)

def one(course, num, secs, scale=3):
    L = next((l for l in solve.load(course) if l['num'] == num), None)
    if not L: return {'course': course, 'num': num, 'error': 'no-such-lesson'}
    if drive.at_launcher(): drive.reconnect()
    sp.run(["xcrun", "simctl", "openurl", drive.U,
            f"euphorianative://lesson?course={slug(course)}&num={num}"], capture_output=True)
    time.sleep(3.5); drive.dismiss_logbox()

    h264 = f"{OUT}/{course}-{num}.h264"
    res = {}
    def go():
        res['done'], res['log'] = drive.run_lesson(L, solve, max_steps=60)
    t = threading.Thread(target=go); t.start()
    record(h264, secs)
    t.join(timeout=45)

    n, rate = real_rate(h264, secs + 1.2)
    fd = f"{OUT}/fr-{course}-{num}"
    sp.run(["rm", "-rf", fd]); os.makedirs(fd, exist_ok=True)
    sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", h264,
            "-vf", f"scale=iw/{scale}:ih/{scale}", f"{fd}/%05d.png"], check=True)
    frames = sorted(glob.glob(f"{fd}/*.png"))
    out = {'course': course, 'num': num, 'title': L.get('title'), 'fps': round(rate, 1),
           'frames': len(frames), 'done': res.get('done'),
           'steps': sum(1 for _, _, m in res.get('log', []) if m),
           'stalled_on': next((h for _, h, m in reversed(res.get('log', [])) if not m), None)}
    if len(frames) < 10:
        out['error'] = 'too-few-frames'; return out
    from PIL import Image
    im = Image.open(frames[0]); tot = (im.width // 4) * (im.height // 4)
    series = diffs(frames)
    f_out = []
    for a, b in windows(series, tot):
        dur = (b - a + 1) / rate; pk = peaks(series[a:b + 1])
        f_out.append({'t': round(a / rate, 2), 'dur': round(dur, 3), 'peaks': pk,
                      'R1': 'PASS' if 0.13 <= dur <= 1.20 else 'OUTSIDE',
                      'R2': 'PASS' if (dur > 0.35 or pk == 1) else 'FAIL'})
    out['transitions'] = f_out
    out['R1_out'] = sum(1 for f in f_out if f['R1'] != 'PASS')
    out['R2_fail'] = sum(1 for f in f_out if f['R2'] != 'PASS')
    sp.run(["rm", "-rf", fd])          # frames are large; the h264 and the scores are kept
    return out

def main():
    os.makedirs(OUT, exist_ok=True)
    args = sys.argv[1:]
    def opt(flag, default):
        return args[args.index(flag) + 1] if flag in args else default
    per = int(opt('--lessons', '5')); secs = float(opt('--secs', '150'))
    courses = opt('--courses', '')
    all_c = sorted(solve.load().keys())
    todo = [c for c in all_c if c in courses.split(',')] if courses else all_c
    print(f"{len(todo)} courses x {per} lessons = {len(todo)*per} lessons · {secs}s each "
          f"(~{len(todo)*per*(secs+35)/3600:.1f}h)", flush=True)
    results = []
    for ci, c in enumerate(todo):
        for num in range(1, per + 1):
            r = one(c, num, secs)
            results.append(r)
            json.dump(results, open(f"{OUT}/sweep.json", 'w'), indent=1)   # checkpoint every lesson
            print(f"  [{len(results):>2}/{len(todo)*per}] {c}-{num} · {r.get('steps','?')} steps · "
                  f"done={r.get('done')} · {len(r.get('transitions',[]))} transitions · "
                  f"R1out={r.get('R1_out','?')} R2fail={r.get('R2_fail','?')} "
                  f"{'· STALLED:'+str(r.get('stalled_on')) if not r.get('done') else ''}", flush=True)
    return results

if __name__ == '__main__':
    rs = main()
    ok = [r for r in rs if r.get('done')]
    print(f"\n{len(ok)}/{len(rs)} lessons completed by the driver")
    print(f"transitions scored: {sum(len(r.get('transitions',[])) for r in rs)}")
    print(f"R1 outside: {sum(r.get('R1_out',0) for r in rs)} · R2 fail: {sum(r.get('R2_fail',0) for r in rs)}")
