# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# ScreensDesign is MANDATORY for design work

Use the ScreensDesign MCP for **every** design audit, design question, and design change.
Not optional, not "when unsure", not only for big redesigns. Every one.

## And use it properly — the failure mode is real

On 2026-08-06 a whole paywall redesign was built, shipped, and reverted because a flow
DESCRIPTION was treated as evidence:

> "A two-part paywall. First, a timeline explains the 7-day free trial. Second, a screen
> offers Yearly and Weekly subscription plans."

The second screen does not exist on the main path. Facetune's timeline screen carries the
price AND the CTA; the next screen is the App Store modal. Pulling the actual screen
(`app_screens` app_id 972, offset 2) took one call and contradicted the summary.

Rules that follow from that:

1. **Read the SCREEN, never only the flow/app description.** Summaries are lossy and
   sometimes wrong. `screen_detail` with `include_image: true` shows what actually shipped.
2. **Use `neighbor_count`.** The screen before or after usually carries the mechanism —
   Bend's dismissal offer is preceded by a gift-box modal that the offer screen alone
   never reveals.
3. **Count convergence across ≥4 apps.** Report the hit rate (4/4, 3/4). A 1/4 pattern is
   not evidence; exclude it and say so.
4. **State transferability.** These are mostly not finance-education apps. Say which
   MECHANISM transfers and why, or mark it UNVERIFIED.
5. **`search_screens` is currently BROKEN** — it returns a pydantic `extra_forbidden`
   error on `app_id`. The error payload leaks the matched app ids; feed those to
   `app_screens`, or route via `search_apps` + `detected_patterns` (e.g.
   `HasTrialTimeline`, `SpecialOfferPaywall`).
6. If a screen genuinely has no match in the dataset, **say "no strong match"** and spec
   from Apple HIG + the token system, labelled as such. Do not bend an off-topic pull to
   fit — ScreensDesign's own guidance says to validate descriptions before using them.

Zogo, Stash, Greenlight and NGPF are NOT in the dataset. For direct competitors use
`search_store_screens` for App Store creative instead.
