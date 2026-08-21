"""Does the course rail COME TO REST ON THE CARD GRID? (A/B against itself.)

Cross-correlating two screenshots is the wrong tool: a hard flick moves the rail further than the
402pt frame is wide, and no correlation can express a shift larger than the image. Total
displacement is not the claim anyway. With snapToAlignment="start" the claim is that EVERY resting
position puts a card's left edge on the content inset -- one number per flick.

INSTRUMENT: phase-match a square wave (period 144pt, duty 132pt = the card) against the rail
band's column brightness profile, sampled on card-body rows only and built from PER-CHANNEL MAX
(never .convert('L') -- luminance weights blue at 0.114 and this palette is violet on near-black).
The phase that maximises correlation IS the resting offset.

An earlier edge-detector reported NOT SNAPPED by finding zero edges on a frame that was already
known by hand to have a clean edge at 48px. That verdict was the filter failing, not the app, and
it is why this runs an A/B: arm A is the shipping build, arm B has snapToInterval/snapToAlignment/
decelerationRate stripped by patch. If both arms rest on the grid, the instrument cannot tell them
apart and NEITHER arm proves anything.

Also asserts each flick actually MOVED the rail before scoring its rest. A rail that never moved
rests on the grid trivially -- the false positive this audit already published once.
"""
import sys, time, subprocess as sp, os
sys.path.insert(0,'scripts/anim')
import drive
from PIL import Image, ImageChops, ImageDraw
U=drive.U
OUT=os.environ.get('SNAPOUT','/tmp/snaprest'); os.makedirs(OUT,exist_ok=True)
INTERVAL_PT=144.0; CARD_PT=132.0; INSET_PT=16.0
# ALTERNATING directions: a rail flicked the same way five times runs out of content and the
# last three rests are the same frozen frame. Arm B showed exactly that (3/5 unmoved).
FLICKS=[("0.06",340,40),("0.10",60,360),("0.18",330,110),("0.08",50,350),("0.14",345,70)]

def metro_up():
    """A run with Metro down is WORSE than no run: the arm-B patch cannot reach the device, so
    arm B silently measures the shipping build and the A/B compares a thing against itself.
    at_launcher() does NOT catch this -- the connect-error screen is not the launcher -- and
    reconnect() cannot fix it, so it has to be checked directly."""
    try:
        import urllib.request
        urllib.request.urlopen("http://localhost:8081/status", timeout=3).read()
        return True
    except Exception:
        return False

def boot():
    sp.run(["xcrun","simctl","terminate",U,drive.BUNDLE],capture_output=True)
    sp.run(["xcrun","simctl","launch",U,drive.BUNDLE],capture_output=True); time.sleep(16)
    if drive.at_launcher(): drive.reconnect()
    drive.dismiss_logbox(); drive.dismiss_sheet()
    for attempt in range(3):
        sp.run(["xcrun","simctl","openurl",U,"euphorianative://home"],capture_output=True); time.sleep(3.5)
        drive.dismiss_logbox()
        if any('/25' in (l or '') for l in drive.labels()): return True
        print(f"   not on home yet (attempt {attempt+1}); retrying")
        time.sleep(3)
    return False

def rail_band():
    cs=[n for n in drive.nodes() if '/25' in n[4] and 120<=n[2]<=145]
    if not cs: return None
    c=sorted(cs,key=lambda z:z[1])[0]; return c[1], c[1]+c[3]

def bring_on_screen():
    got=rail_band()
    if not got: return None
    y0,y1=got
    for _ in range(4):
        if y1<=834: break
        sp.run(["idb","ui","swipe","--udid",U,"--duration","0.25","200","640","200","380"],capture_output=True)
        time.sleep(1.4); got=rail_band()
        if not got: return None
        y0,y1=got
    return (y0,y1) if y1<=834 else None

def shot(tag):
    p=f"{OUT}/{tag}.png"; sp.run(["xcrun","simctl","io",U,"screenshot",p],capture_output=True); return p

def profile(path, band):
    im=Image.open(path).convert('RGB').crop(band)
    r,g,b=im.split(); m=ImageChops.lighter(ImageChops.lighter(r,g),b)
    W,H=m.size; px=m.load()
    ys=list(range(int(H*0.34),int(H*0.42)))   # between icon and title: pure card body
    return [sum(px[x,y] for y in ys)/len(ys) for x in range(W)]

def phase(col, sx):
    per=INTERVAL_PT*sx; duty=CARD_PT*sx; W=len(col)
    mc=sum(col)/W; dc=(sum((v-mc)**2 for v in col))**0.5
    best=(None,-2.0)
    for ph in range(int(per)):
        t=[1.0 if ((x-ph)%per)<duty else 0.0 for x in range(W)]
        mt=sum(t)/W; dt=(sum((v-mt)**2 for v in t))**0.5
        if dt==0 or dc==0: continue
        r=sum((col[x]-mc)*(t[x]-mt) for x in range(W))/(dc*dt)
        if r>best[1]: best=(ph,r)
    return best[0]/sx, best[1]

def run_arm(name):
    if not boot(): print(f"[{name}] NOT ON HOME"); return None
    bb=bring_on_screen()
    if not bb: print(f"[{name}] rail never came on screen"); return None
    y0,y1=bb
    p0=shot(f"{name}_rest0"); im=Image.open(p0); sx=im.width/402.0
    band=(0,int(y0*sx),im.width,int(y1*sx))
    d=Image.open(p0); ImageDraw.Draw(d).rectangle(list(band),outline=(255,0,0),width=6)
    d.save(f"{OUT}/{name}_band.png")
    print(f"[{name}] rail band y={y0}..{y1} from a11y; band drawn -> {OUT}/{name}_band.png")
    prev=profile(p0,band); out=[]
    for i,(dur,x0,x1) in enumerate(FLICKS,1):
        ym=int(y0+(y1-y0)*0.4)
        sp.run(["idb","ui","swipe","--udid",U,"--duration",dur,str(x0),str(ym),str(x1),str(ym)],capture_output=True)
        time.sleep(2.6)
        p=shot(f"{name}_rest{i}"); col=profile(p,band)
        moved=sum(abs(a-b) for a,b in zip(col,prev))/len(col) > 3.0
        prev=col
        ph,r=phase(col,sx)
        off=min(abs(ph-INSET_PT)%INTERVAL_PT, INTERVAL_PT-(abs(ph-INSET_PT)%INTERVAL_PT))
        out.append((i,dur,moved,ph,r,off))
    return out

def report(name,rows):
    print(f"\n=== ARM {name} ===")
    print(" flick  dur    moved?  rest phase   template corr   offset from grid")
    scored=[];
    for i,dur,moved,ph,r,off in rows:
        print(f"  {i}    {dur}s   {'YES' if moved else 'NO '}     {ph:6.1f}pt      {r:5.3f}          {off:5.1f}pt")
        if moved and r>=0.60: scored.append(off)
    if not scored: print("  no trustworthy moved rests"); return None
    worst=max(scored)
    print(f"  scored rests: {len(scored)}/{len(rows)}   worst offset {worst:.1f}pt")
    return scored

if not metro_up():
    print("METRO IS DOWN (http://localhost:8081 unreachable). Start it with `npm start`.")
    print("Refusing to run: with Metro down the arm-B patch cannot reach the device and the")
    print("A/B would silently compare the shipping build against itself.")
    sys.exit(2)

HOME='src/app/(tabs)/home.tsx'
ARMS=sys.argv[1] if len(sys.argv)>1 else 'AB'
orig=open(HOME).read()
A=B=None
try:
    if 'A' in ARMS:
        A=run_arm("A_snapped")
    if 'B' in ARMS:
        patched=orig.replace(
            '          snapToInterval={RAIL_CARD_WIDTH + Spacing.two + 4}\n'
            '          snapToAlignment="start"\n'
            '          decelerationRate="fast"\n', '')
        assert patched!=orig, "counterfactual patch did not apply"
        open(HOME,'w').write(patched)
        print("\n[counterfactual] snap props REMOVED; waiting for Fast Refresh")
        time.sleep(8)
        B=run_arm("B_free")
finally:
    open(HOME,'w').write(orig)
    print("\n[restore] home.tsx restored")
    sp.run(["git","diff","--stat","--",HOME])

sa=report("A (shipping: snapToInterval=144pt)",A) if A else None
sb=report("B (counterfactual: no snap)",B) if B else None
print("\nPRE-REGISTERED: arm A rests at the 16.0pt inset every time; arm B scatters across 0..144pt.")
if sa is None or sb is None:
    print("VERDICT: INCONCLUSIVE — an arm produced no trustworthy moved rests.")
elif max(sa)<=6.0 and max(sb)>6.0:
    print(f"VERDICT: SNAP CONFIRMED — A worst {max(sa):.1f}pt on-grid; B worst {max(sb):.1f}pt off-grid.")
elif max(sa)<=6.0 and max(sb)<=6.0:
    print("VERDICT: INSTRUMENT CANNOT DISTINGUISH — both arms on-grid. A proves nothing.")
else:
    print(f"VERDICT: NOT SNAPPED — arm A worst offset {max(sa):.1f}pt.")
