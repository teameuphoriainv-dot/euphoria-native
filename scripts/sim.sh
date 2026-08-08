#!/usr/bin/env bash
#
# sim.sh — drive and INSPECT the iOS simulator without paying for screenshots.
#
# The expensive habit this replaces: reading a screenshot to find out what is on screen or
# whether something worked. Each image read costs real money and a session of them costs a lot.
# Every command here answers the same questions as TEXT or as a NUMBER.
#
#   ./scripts/sim.sh doctor              verify the toolchain
#   ./scripts/sim.sh devices             list booted simulators
#   ./scripts/sim.sh screen              what is on screen, as "label @ x,y" (POINTS)
#   ./scripts/sim.sh tap <x> <y>         tap a point
#   ./scripts/sim.sh tapon "<text>"      tap an element BY LABEL — no coordinates needed
#   ./scripts/sim.sh state [jq-filter]   the persisted zustand store, as JSON
#   ./scripts/sim.sh open <path>         deep link, e.g. open "onboarding?step=0"
#   ./scripts/sim.sh motion "<text>" [s] tap it, then measure whether the mascot TRANSLATED
#   ./scripts/sim.sh shot <file.png>     screenshot to disk (still costs to READ)
#
# Pick a device with EUPHORIA_UDID=<udid>, otherwise the first booted simulator is used.
set -euo pipefail

BUNDLE="com.euphoriainv.euphoria"
IDB="$(command -v idb || echo "$HOME/.idb-venv/bin/idb")"

udid() {
  if [[ -n "${EUPHORIA_UDID:-}" ]]; then echo "$EUPHORIA_UDID"; return; fi
  xcrun simctl list devices booted -j \
    | python3 -c 'import json,sys; d=json.load(sys.stdin)["devices"]; print(next(x["udid"] for v in d.values() for x in v))'
}

# The accessibility tree, flattened. Coordinates come back in POINTS, which is exactly what
# `idb ui tap` consumes — no retina division anywhere in this file.
tree() {
  "$IDB" ui describe-all --udid "$(udid)" 2>/dev/null
}

cmd="${1:-help}"; shift || true
case "$cmd" in

doctor)
  for t in xcrun ffmpeg python3 maestro fastlane cliclick idb_companion; do
    printf '%-14s %s\n' "$t" "$(command -v "$t" 2>/dev/null || echo 'MISSING')"
  done
  printf '%-14s %s\n' idb "$IDB"
  python3 -c 'import PIL, numpy; print("python img     PIL %s / numpy %s" % (PIL.__version__, numpy.__version__))' 2>/dev/null \
    || echo 'python img     MISSING (pip install pillow numpy)'
  ;;

devices)
  xcrun simctl list devices booted | grep -E 'Booted' || echo 'none booted'
  ;;

screen)
  tree | python3 -c '
import json,sys
# Show the DISABLED marker and do not truncate hard. Both cost real debugging time once:
# a gated Continue looks identical to a broken one without the flag, and TAP TO FLIP sits
# at the END of a long card label, so a 64-char cut hid which cards were still unflipped.
for e in json.load(sys.stdin):
    l=" ".join((e.get("AXLabel") or "").split())
    if not l or l=="euphoria-native": continue
    f=e["frame"]
    state="" if e.get("enabled", True) else "[DISABLED] "
    print(f'"'"'{state}{l[:150]:<80} @ {int(f["x"]+f["width"]/2)},{int(f["y"]+f["height"]/2)}'"'"')'
  ;;

tap)
  "$IDB" ui tap --udid "$(udid)" "$1" "$2"
  ;;

# Semantic tap: match a label substring, tap its centre. This is the one that stops coordinate
# drift from silently tapping the wrong row after a layout change.
tapon)
  read -r X Y < <(tree | python3 -c '
import json,sys
want=sys.argv[1].lower()
exact=[]; partial=[]
for e in json.load(sys.stdin):
    l=(e.get("AXLabel") or "")
    if not l: continue
    f=e["frame"]
    # smallest wins WITHIN a tier: the tappable row, not its container
    hit=(f["width"]*f["height"], int(f["x"]+f["width"]/2), int(f["y"]+f["height"]/2))
    if l.strip().lower()==want: exact.append(hit)
    elif want in l.lower(): partial.append(hit)
# Exact beats substring ALWAYS. A bare word like Open also appears inside the iOS
# alert TITLE, and substring-only matching taps that label instead of the button.
# NOTE: no apostrophes in this block - it lives inside a single-quoted shell string.
pool = exact or partial
if not pool: sys.exit("no element matching: "+sys.argv[1])
best=min(pool)
print(best[1],best[2])' "$1")
  # OFF-SCREEN GUARD. The a11y tree reports elements inside a ScrollView at their CONTENT
  # coordinate, so a row scrolled below the fold is listed at e.g. y=933 on an 874pt screen.
  # `idb ui tap` accepts that happily, taps nothing, and returns success. Two sessions were
  # spent concluding a Digest row was unpressable when the row was simply below the display
  # and the pressable itself measured a perfectly good 370x91. See trap #34.
  H=$("$IDB" ui describe-all --udid "$(udid)" 2>/dev/null | python3 -c 'import json,sys; print(int(json.load(sys.stdin)[0]["frame"]["height"]))' 2>/dev/null || echo 0)
  if [ "$H" -gt 0 ] && [ "$Y" -gt "$H" ]; then
    echo "REFUSED: '$1' resolves to y=$Y but the screen is only ${H}pt tall." >&2
    echo "  It is scrolled off the bottom. Scroll to it first:" >&2
    echo "  $IDB ui swipe --udid \$UDID 200 700 200 300 --duration 0.4" >&2
    exit 1
  fi
  echo "tapping '$1' @ $X,$Y"
  "$IDB" ui tap --udid "$(udid)" "$X" "$Y"
  ;;

state)
  # AsyncStorage INLINES small values in manifest.json but SPILLS large ones to a separate file
  # named md5(key), leaving `null` inline. This command read only the manifest, so once the store
  # grew past the threshold it silently returned `null` for every field — which looks exactly like
  # "persistence is broken" and is not. Read the spill file when the inline value is null.
  C="$(xcrun simctl get_app_container "$(udid)" "$BUNDLE" data)"
  D="$C/Library/Application Support/$BUNDLE/RCTAsyncLocalStorage_V1"
  RAW="$(jq -r '.["euphoria-app-state"] // empty' "$D/manifest.json")"
  if [[ -z "$RAW" || "$RAW" == "null" ]]; then
    KEYFILE="$D/$(printf 'euphoria-app-state' | md5 -q)"
    [[ -f "$KEYFILE" ]] || { echo "no persisted state (looked in manifest.json and $KEYFILE)" >&2; exit 1; }
    jq ".state | ${1:-.}" "$KEYFILE"
  else
    printf '%s' "$RAW" | jq ".state | ${1:-.}"
  fi
  ;;

open)
  xcrun simctl openurl "$(udid)" "euphorianative://$1"
  echo 'note: iOS shows an "Open in euphoria-native?" confirm — ./scripts/sim.sh tapon Open'
  ;;

shot)
  xcrun simctl io "$(udid)" screenshot "$1" && echo "wrote $1"
  ;;

# Motion QA without watching anything.
#
# A still cannot show motion and a video costs an image read per frame. So: record a tap,
# then measure the mascot's TOP EDGE on every frame. A reaction that deforms (nod, breath,
# squash) holds the top edge perfectly still; a reaction that TRANSLATES (a hop) moves it.
# One number decides which one you shipped.
motion)
  U="$(udid)"; SECS="${2:-4}"
  D="$(mktemp -d)"; trap 'rm -rf "$D"' EXIT
  xcrun simctl io "$U" recordVideo --codec h264 "$D/m.mp4" >"$D/rec.log" 2>&1 &
  RP=$!
  sleep 1.5
  # ALWAYS stop with SIGINT. A SIGTERM (which is what `timeout` sends) leaves a 0-byte file AND
  # leaks the host recording session, after which every later record fails "Resource busy" until
  # CoreSimulatorService is restarted:  killall -9 com.apple.CoreSimulator.CoreSimulatorService
  if ! ps -p $RP >/dev/null 2>&1; then
    echo 'could not start recording:'; sed -n '1,4p' "$D/rec.log"; exit 1
  fi
  "$0" tapon "$1" >/dev/null
  sleep "$SECS"
  kill -INT $RP 2>/dev/null || true
  sleep 2
  ffmpeg -y -i "$D/m.mp4" -vf fps=30 "$D/f_%03d.png" >/dev/null 2>&1 || true
  SHEET="${PWD}/motion-$(echo "$1" | tr ' /' '__').png"
  python3 -c '
from PIL import Image, ImageDraw; import numpy as np, glob, sys
fs=sorted(glob.glob(sys.argv[1]+"/f_*.png"))
if not fs: sys.exit("no frames captured")

def mask(a):
    r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    m=(b>150)&(b>r+20)&(r>g+25)      # violet, which is the mascot AND some chrome
    # Band the mascot explicitly. The onboarding PROGRESS BAR is violet too and sits near the
    # top; a naive "top 32% of the screen" crop measures that bar — which never moves — and
    # happily reports zero drift for an animation that is actually bouncing. Measure Atlas.
    h=a.shape[0]
    m[:int(h*0.134)]=False           # above Atlas: progress bar + status bar
    m[int(h*0.343):]=False           # below Atlas: option cards, CTA gradient
    return m

tops=[]; vols=[]; boxes=[]
for f in fs:
    a=np.asarray(Image.open(f).convert("RGB")).astype(int)
    m=mask(a); rows=m.sum(1); cols=m.sum(0)
    ri=[y for y,v in enumerate(rows) if v>10]; ci=[x for x,v in enumerate(cols) if v>10]
    tops.append(min(ri) if ri else -1); vols.append(int(m.sum()))
    boxes.append((min(ci),max(ci)) if ci else (0,0))

uniq=sorted(set(t for t in tops if t>=0))
drift=(max(uniq)-min(uniq)) if uniq else -1
print(f"frames         {len(fs)}")
print(f"top edge       {uniq}")
print(f"vertical drift {drift}px  <- 0 means it DEFORMED (nod); >0 means it TRANSLATED (hop)")
print(f"volume swing   {max(vols)-min(vols)}px  <- ~0 means NO reaction fired at all")

# Contact sheet: frames spanning the reaction, cropped to the mascot, with a RED RULE at the
# baseline top edge. If the rule stays glued to his head across the strip, there is no bounce.
top0=min(t for t in tops if t>=0); x0=min(b[0] for b in boxes); x1=max(b[1] for b in boxes)
pad=40; y0=max(0,top0-pad); y1=top0+int((x1-x0)*1.15)
sel=list(range(30,min(len(fs),30+13)))          # ~0.4s before the tap through the reaction
tiles=[]
for i in sel:
    im=Image.open(fs[i]).convert("RGB").crop((max(0,x0-pad), y0, x1+pad, y1))
    d=ImageDraw.Draw(im)
    d.line([(0, top0-y0), (im.width, top0-y0)], fill=(255,64,64), width=3)
    d.text((6,6), f"f{i}", fill=(255,255,255))
    tiles.append(im)
w,h=tiles[0].size; sheet=Image.new("RGB",(w*len(tiles), h),(10,10,14))
for i,t in enumerate(tiles): sheet.paste(t,(i*w,0))
sheet.thumbnail((2400, 2400))
sheet.save(sys.argv[2])
print(f"contact sheet  {sys.argv[2]}  (red rule = baseline top edge)")
' "$D" "$SHEET"
  ;;

*)
  sed -n '3,20p' "$0" | sed 's/^# \{0,1\}//'
  ;;
esac
