CORRECTED CARRYOVER — supersedes the previous file, which was WRONG about Atlas.

WHAT THE OLD CARRYOVER GOT WRONG. It claimed "It is vector now... a real head carrying the
face, with the pinwheel as a slowly-turning chest emblem." That redesign was reverted in
e2302ed ("restore the original character") and f69d0ed ("drop the pear body", co-founder's
call). It also listed landing squash/stretch and emblem follow-through as STILL OPEN; both
had already shipped. Read atlas.tsx before trusting any doc, including this one.

STATE. branch main, nothing pushed. Modified: src/components/atlas.tsx, src/app/lesson.tsx.
New untracked: src/components/atlas-mark.tsx. tsc clean.

THE MARK IS NOW VECTOR (this session, for real).
- src/components/atlas-mark.tsx draws the pinwheel as FOUR INDEPENDENT RINGS. atlas-logo.png
  is no longer rendered; the require is gone. Verified on device.
- Geometry was MEASURED off the PNG, not eyeballed: centre (126,125.5) in a 247x243 asset,
  orbit 54.25, annulus r 20.25..56.75, tilt 82.5 + k*90. Fitted by parameter sweep against the
  PNG's own alpha mask to IoU 0.951. Design-space constants (viewBox 100x104) are in the file.
- TWO THINGS THAT SURPRISED ME AND WILL SURPRISE YOU:
  (a) The fit was against a mask that INCLUDED the white rim, so r_in/r_out are the artwork's
      full extent. Draw the rim across the whole band and INSET the violet inside it. Drawing
      violet across the full band and adding rim outside made the mark 2*RIM too big and every
      hole 15% too small. That shipped once and had to be fixed on device.
  (b) The mark is WOVEN, not stacked. z-order 3,2,1,0 buys three of the four crossings free;
      the cycle means "ring3 over ring0" cannot be expressed by z-order and needs a ClipPath.
      Clip to ring0's OUTER DISC, not its annulus — where ring3 crosses ring0's hole it is
      already visible, so redrawing there is a no-op. A ring rotating about its own centre has
      an unchanged silhouette, so that clip survives any per-ring ROTATION. Translation or
      scale would break it.
- CONFIRMED WORKING in react-native-svg on device: LinearGradient in objectBoundingBox units
  applied to a STROKE, and ClipPath. Both were real risks; neither bit.
- Colours are the asset's own measured tones. Gradient LIT #DEA5F5 -> DARK #A855EB averages to
  #C37DE7, the PNG's measured median. An earlier pair averaged to #B78BD1 and read visibly pale.

CELEBRATE AMPLITUDE. The hop fired on EVERY onboarding option tap at 12%-of-size with a 13%
squash. User: "hardly noticeable" is what it should be. CELEBRATE_GAIN = 0.32 scales amplitude
only, timings untouched. It is also a PER-CALL PROP (celebrateGain) because a global constant
correctly quieted the per-tap reaction and wrongly flattened lesson.tsx's once-per-lesson
payoff, which now passes celebrateGain={1}. STILL NEVER WATCHED IN MOTION — verify it.

NEW CHARACTER — designed, not built. Concept art on the user's Desktop:
atlas-concepts.png (4 rejected directions) and atlas-v4-character.png (the real one).
Scripts: scratchpad atlas_v4.py. The four first directions all failed the same way — a rounded
body plus two eyes reads as generic. What carries the accepted design: BROWS (largest
expressiveness lever, and the thing the pinwheel could never have), a merged white EYE PATCH
Duo-style over a body that STAYS brand violet, ARMS WITH HANDS so it can point and cheer, a
tapered EGG body rather than a ball, and a tilted HALO RING lifted from the mark — which is
both the identity cue and a second actor that can lag, tilt and wobble against the body.
Legible at 24pt. NOT YET AN RN COMPONENT — that is the next build.

ENVIRONMENT. Dev-client build IS installed on sim F448825D-AF20-48D2-890A-516C12012CA7.
Metro :8082, but the app defaults to :8081 — redirect with
  xcrun simctl openurl $U "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"
idb at ~/.idb-venv/bin/idb. Coords are POINTS (screenshot px / 3).
RIVE MCP: Rive.app listens on 9791 but MCP binds at SESSION START — restart Claude Code or the
tools are unreachable. It has NO EXPORT TOOL regardless; .riv export is a manual click.

THE LESSON WORTH CARRYING. I spent this session perfecting a static mark to IoU 0.951 and never
once watched the app move. The user had to tell me the button animation felt wrong. Verify
MOTION, not just pixels.
