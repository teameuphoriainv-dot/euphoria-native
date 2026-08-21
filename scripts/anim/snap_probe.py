"""Verify the course-rail snap in SCREEN SPACE.

Both easier routes are closed: a11y frames are content-space (cards read x=16..1600, past the
402pt screen) so they cannot express scroll offset, and the capture path cannot measure scroll.

THIS MEASURES PIXELS. Take a screenshot before and after a flick, crop the rail band, and
cross-correlate the two strips horizontally. The shift that maximises correlation IS the scroll
displacement in screen pixels.

PRE-REGISTERED: snapToInterval = RAIL_CARD_WIDTH (132) + Spacing.two + 4 (12) = 144pt = 432px at
3x. A snapped rail comes to rest on a multiple of 432px; a free-scrolling one lands anywhere.

AND THE RULE THAT THE LAST ATTEMPT BROKE: assert the displacement is NON-ZERO before testing
whether it is on-grid. Zero divided by any interval passes perfectly, which is how the previous
probe printed VERDICT: SNAPPED on a rail that had not moved.
"""
import sys, time, subprocess as sp
sys.path.insert(0,'scripts/anim')
import drive
from PIL import Image, ImageChops
U=drive.U
OUT="/private/tmp/claude-501/-Users-siddarthakodithyala/3c0f7888-16d4-4c65-b1fa-67076f930cd2/scratchpad/snap"
import os; os.makedirs(OUT, exist_ok=True)
INTERVAL_PT=144

sp.run(["xcrun","simctl","terminate",U,drive.BUNDLE],capture_output=True)
sp.run(["xcrun","simctl","launch",U,drive.BUNDLE],capture_output=True); time.sleep(16)
if drive.at_launcher(): drive.reconnect()
drive.dismiss_logbox(); drive.dismiss_sheet()
sp.run(["xcrun","simctl","openurl",U,"euphorianative://home"],capture_output=True); time.sleep(3.5)
drive.dismiss_logbox()
labs=[l for l in drive.labels() if l]
if not any('/25' in l for l in labs):
    print("not on home:", sorted(labs)[:8]); sys.exit(1)

# BRING THE RAIL FULLY ON SCREEN FIRST. It sits at y 804..954 on an 874pt screen, so it is
# partially below the fold, and a swipe at its midpoint lands in the home-indicator area and
# never reaches the app. Scroll the PAGE down, then re-read the band -- its y will have changed.
def rail_band():
    cs=[n for n in drive.nodes() if '/25' in n[4] and 120<=n[2]<=145]
    if not cs: return None
    c=sorted(cs,key=lambda z:z[1])[0]
    return c, c[1], c[1]+c[3]
got=rail_band()
if not got: print("no course cards"); sys.exit(1)
c,y0,y1 = got
SCREEN_H=874
for _ in range(4):
    if y1 <= SCREEN_H - 40: break
    print(f"rail bottom at y={y1} exceeds {SCREEN_H-40}; scrolling the page down", flush=True)
    sp.run(["idb","ui","swipe","--udid",U,"--duration","0.25","200","640","200","380"],capture_output=True)
    time.sleep(1.4)
    got=rail_band()
    if not got: print("rail left the tree after scrolling"); sys.exit(1)
    c,y0,y1 = got
if y1 > SCREEN_H - 40:
    print(f"could not bring the rail on screen (y1={y1})"); sys.exit(1)
print(f"rail band from a11y: y={y0}..{y1}  (card {c[4][:28]!r}, w={c[2]}pt)")

sp.run(["xcrun","simctl","io",U,"screenshot",f"{OUT}/before.png"],capture_output=True)
im=Image.open(f"{OUT}/before.png"); sx=im.width/402.0
band=(0, int(y0*sx), im.width, int(y1*sx))
# draw the band we are about to measure, per the binding lesson
from PIL import ImageDraw
dbg=Image.open(f"{OUT}/before.png"); ImageDraw.Draw(dbg).rectangle(list(band), outline=(255,0,0), width=6)
dbg.save(f"{OUT}/band.png"); print("band drawn -> band.png (VERIFY BY EYE)")

sp.run(["idb","ui","swipe","--udid",U,"--duration","0.10","340","%d"%int(y0+(y1-y0)*0.4),"60","%d"%int(y0+(y1-y0)*0.4)],capture_output=True)
time.sleep(2.5)
sp.run(["xcrun","simctl","io",U,"screenshot",f"{OUT}/after.png"],capture_output=True)

def strip(path):
    # PER-CHANNEL MAX, never .convert('L'). Luminance weights blue at 0.114, and this palette is
    # violet on near-black, so an L-strip throws away most of the rail's own contrast. That is
    # what held the first run's correlation to 0.695, under its own 0.75 trust floor.
    im=Image.open(path).crop(band).convert('RGB')
    r,g,b=im.split()
    m=ImageChops.lighter(ImageChops.lighter(r,g), b)
    m=m.resize((m.width, 1))                    # collapse to one row: a horizontal signature
    return list(m.getdata())

a, b = strip(f"{OUT}/before.png"), strip(f"{OUT}/after.png")
W=len(a)
best=(None, -1)
for shift in range(0, min(1400, W-60)):         # rail scrolls LEFT, so `after` matches `before` shifted
    n=W-shift
    if n < 400: break
    sa=a[shift:]; sb=b[:n]
    ma=sum(sa)/n; mb=sum(sb)/n
    num=sum((sa[i]-ma)*(sb[i]-mb) for i in range(n))
    da=sum((sa[i]-ma)**2 for i in range(n))**0.5
    db=sum((sb[i]-mb)**2 for i in range(n))**0.5
    if da*db==0: continue
    r=num/(da*db)
    if r>best[1]: best=(shift, r)
shift_px, corr = best
shift_pt = shift_px/sx
print(f"\nbest horizontal match: shift {shift_px}px = {shift_pt:.1f}pt   correlation {corr:.3f}")
if shift_px < 20:
    print("THE RAIL DID NOT MOVE — nothing to test. (This is the check the last probe lacked.)")
    sys.exit(0)
if corr < 0.75:
    print(f"correlation {corr:.2f} too low to trust the shift"); sys.exit(0)
off = min(shift_pt % INTERVAL_PT, INTERVAL_PT - shift_pt % INTERVAL_PT)
print(f"nearest multiple of {INTERVAL_PT}pt: {round(shift_pt/INTERVAL_PT)} x {INTERVAL_PT} = {round(shift_pt/INTERVAL_PT)*INTERVAL_PT}pt")
print(f"distance from the grid: {off:.1f}pt")
print(f"PRE-REGISTERED: a snapped rail rests on a multiple of {INTERVAL_PT}pt")
print("VERDICT:", "SNAPPED — rests on the card grid" if off <= 10
      else f"NOT SNAPPED — {off:.1f}pt off the grid")
