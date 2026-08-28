#!/usr/bin/env bash
# Capture every route in the app as a PNG, for the ScreensDesign audit.
#
# WHY A SCRIPT AND NOT A HAND CRAWL: the route table changes. Driving routes one at a time through an
# assistant costs several tool calls each and cannot be repeated after a design change without
# paying the whole cost again. This makes the capture cheap, repeatable, and diffable — run it
# before and after a change and you have a visual regression set.
#
# WHAT IT DOES NOT DO: it captures the DEFAULT state of each route. Empty states, error states,
# loading states and gated states need their own store seed (see §1.7 and C70) and are not
# reachable by deep link alone. Those are listed at the bottom as UNCAPTURED so the gap is visible
# rather than silently missing — inferring "no screenshot means no screen" is trap #6.
#
# Requires: a booted simulator with the app installed and Metro running.
#   EUPHORIA_UDID=... ./scripts/capture-screens.sh [outdir]
set -euo pipefail

UDID="${EUPHORIA_UDID:?set EUPHORIA_UDID}"
BUNDLE="com.euphoriainv.euphoria"
OUT="${1:-refs/audit/$(date +%Y%m%d)}"
SCHEME="euphorianative"
SETTLE="${SETTLE:-6}"

mkdir -p "$OUT"

# Route -> deep link. Dynamic routes get a representative param, named so the choice is visible.
source "$(dirname "${BASH_SOURCE[0]}")/routes.sh"

echo "capturing ${#ROUTES[@]} routes -> $OUT"
for entry in "${ROUTES[@]}"; do
  name="${entry%%:*}"
  path="${entry#*:}"
  xcrun simctl openurl "$UDID" "${SCHEME}://${path}" >/dev/null 2>&1 || {
    echo "  SKIP  $name (openurl failed)"; continue;
  }
  sleep "$SETTLE"
  if xcrun simctl io "$UDID" screenshot "$OUT/$name.png" >/dev/null 2>&1; then
    printf "  ok    %-20s %s\n" "$name" "$(du -h "$OUT/$name.png" | cut -f1)"
  else
    echo "  FAIL  $name (screenshot)"
  fi
done

cat > "$OUT/UNCAPTURED.md" <<'EOF'
# States this run did NOT capture

Deep links reach a route's DEFAULT state only. These need a seeded store and are missing here —
listed so the gap is explicit. A route with no screenshot is an uncaptured state, not a
non-existent one (trap #6).

- every EMPTY state (needs an empty store; §1.7 requires capturing baseline first)
- every LOADING and ERROR state
- the GATE SHEET and the 17d dismissal offer (need an expired trial: 4 distinct activeDays)
- the billing-issue banner (needs `billingIssue: true` seeded)
- the streak commitment ask (needs `streakGoal: null` AND `streak >= 1`)
- paywall / plan picker (reached through onboarding?step=paywall)
- reward card reveal (needs pendingRewards)
EOF

echo "done. $(ls "$OUT"/*.png 2>/dev/null | wc -l | tr -d ' ') screens in $OUT"
echo "uncaptured states listed in $OUT/UNCAPTURED.md"
