#!/usr/bin/env bash
# The route table, shared by every audit script.
#
# WHY THIS FILE EXISTS: capture-screens.sh (stills) and motion-audit.sh (video) must walk the
# SAME routes or their outputs cannot be compared, and a route added to one and not the other
# silently drops out of half the audit. One list, sourced twice.
#
# Format is "name:deeplink-path". Dynamic routes carry a representative param so the choice is
# visible rather than hidden inside the script.

ROUTES=(
  "welcome:welcome"
  "auth:auth"
  "onboarding:onboarding"
  "start:start"
  "home:(tabs)/home"
  "learn:(tabs)/learn"
  "trade:(tabs)/trade"
  "digest:(tabs)/digest"
  "you:(tabs)/you"
  "lesson:lesson?course=investing-fundamentals&num=1"
  "courses:courses"
  "league:league"
  "friends:friends"
  "chat:chat"
  "news:news"
  "options:options"
  "search:search"
  "reward:reward"
  "games:games"
  "games-term-match:games/term-match"
  "explore-compound:explore/compound"
  # the-rule-of-72 does not exist in digest-content.ts, so this route rendered
  # "Article not found" in every audit that walked it. Use a real slug.
  "digest-slug:digest/avalanche-vs-snowball"
  "stock-sym:stock/NVDA"
  "settings-account:settings/account"
  "why-not-free:why-not-free"
  "widget-tutorial:widget-tutorial"
)
