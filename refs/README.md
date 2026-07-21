# Euphoria — Reference Material (user-provided)

This folder is the **durable home for all reference assets the user shared** (videos + images), so
future sessions/contexts have them. The user provided **~3-4 screen recordings + ~30-40 images**,
almost all **Brilliant app** captures used as the design/motion benchmark.

## ⚠️ How to actually get the raw files in here (one-time, needs YOU)
The raw files live in `~/Library/Messages/Attachments/…` and `/var/folders/…` temp dirs, which are
**macOS TCC-protected** — Claude Code **cannot copy them autonomously** (`Operation not permitted`).
To persist the raw assets, do ONE of:
- **Grant Full Disk Access** to the terminal/Claude Code app (System Settings → Privacy & Security →
  Full Disk Access), then tell me and I'll copy them into `refs/videos` + `refs/images`; OR
- **Drag them here yourself** into `refs/videos/` and `refs/images/`.

The *analysis* of this material is already captured durably (see the docs below), so the knowledge
persists even before the raw files land.

## Inventory (from analysis this project already did)
### Videos (`refs/videos/`) — Brilliant motion references
- `ScreenRecording … 14-17-49` — Brilliant onboarding flow / character motion (~108s). Analyzed in `ATLAS_ANIM_SPEC.md` (V2 green-bot mascot: idle breathing, eye pan, hop-on-select, wave entrance).
- `ScreenRecording … 13-12-29` — Brilliant app lesson walkthrough (~122s). Analyzed in `ATLAS_ANIM_SPEC.md` (V1: 3D character gestures, streak unlock cascade, correct/incorrect beats).
- `ScreenRecording … 10-50-24` — Brilliant onboarding capture (Koji mascot + step flow).
- (Duolingo onboarding video, ~4.5min — analyzed in `ONBOARDING_ANIM_SPEC.md`.)

### Images (`refs/images/`) — Brilliant screenshots (~25-40) + Koji mascot
Brilliant onboarding + app screens: "A world-class tutor for every home" landing, "Hi, I'm Koji!" /
"Hey, it's Koji!" mascot intros (green diamond blob, single morphing square eye), sign-up, "What are
your learning goals?", "What level of math…", "What school level…", "What's your daily learning goal?"
(10/20/30/60-min dials), "How will learning fit into your day?", "Built by the best minds" (MIT/Harvard
experts), "How do you want me to sound?" (voice), factoring tile-builder, Home ("Solving Equations
Level 1"), Courses (Math Foundations pathway), notifications, topic constellation. Plus the Koji
comet-tunnel dive moment. (IMG_9043–9063 = 21 of these stills.)

## Where the KNOWLEDGE already lives (persisted regardless of raw files)
- `BRILLIANT_REFERENCE.md` — 25-screenshot analysis → Euphoria build spec (violet-not-green, Atlas-not-Koji, finance-not-math).
- `ATLAS_ANIM_SPEC.md` — the 2 character videos analyzed → Atlas expression + motion spec.
- `ONBOARDING_ANIM_SPEC.md` — Duolingo onboarding video analyzed.
- `AI_CONTEXT.md` — master reference; `RIVE_STATUS.md` — Rive pipeline status.

## North star (why these refs matter)
Build **above Duolingo + Brilliant**: violet brand, Atlas mascot alive on every screen, finance/investing
education, heavy tasteful motion. Brilliant's Koji (single expressive eye, organic blob, comet-dive
transitions) is the aliveness bar; Atlas must beat it.
