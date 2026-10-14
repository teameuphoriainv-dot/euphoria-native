# Note to Sriyan — main moved, please pull before pushing

Hey Sriyan, main moved twice today. Please `git pull` before your next push or 1.0.1 build.

## 1. `01dec75`: Sid's branch merged with your 1.0.1
Your merge of `streak-motion-today-card` used an older copy. 25 of Sid's commits (Sep 24–28) never got in. They're in now:
- **Fix for tabs loading blank:** tabs used to sit empty for up to 7s+ (Trade was the worst). They now load within 0.7s.
- **Streak safety net:** starter freeze, freezes earned at 7 and 30 days, and a 48h earn-back. Includes a **v7 store migration** that gives existing users their starter freeze and never changes `streak` or `lastActiveDay`.
- **Streak reminders:** 7 one-time reminders that say what's at stake, replacing the single repeating daily one.
- **Design pilot:** cards with a solid edge, 13pt captions, Nunito display font, `SlabButton` everywhere.
- **Feedback module:** sound and haptics for every event, plus Sound and Haptics switches in Settings.
- **Screen polish:** Home (league card), Learn, Trade (accurate totals), Games (featured game), Digest.
- **Home-screen widget rework.**

It merged with no conflicts. TypeScript and the full `npm run check` suite pass.

## 2. `3c7cbdd`: fixes from a full lesson playthrough
- **Inflation step:** the guess is now scored at the question's own setting (30 years), not wherever the slider ends up. A correct "3 tickets" was being shown as wrong.
- **Overlapping SVG labels:** in react-native-svg, `<SvgText>${x}</SvgText>` becomes two text pieces that draw on top of each other ("2.0$M", "500$K"). Fixed 9 labels; the compound chart's value chip now stays inside the chart.
- **Streak on Home:** `streakNow` now treats an empty `lastActiveDay` as alive only when the streak is 0, matching `resolveStreak`. Seeded or dev data could show a 12-day streak that the next lesson reset to 1. Real users can't get into that state.

## Still open
- **Lesson completion may not be saved:** after "Perfect lesson!", Home still showed "Lesson 1 of 25 · Part 3". It might be a test artifact from tapping the dev menu, so please replay one lesson to check.
- **Unlock conditions aren't explained:** steps 2 and 6 only unlock past certain slider values (28+ years, return moved 2+ points), and nothing tells the user.
- **Confetti:** none showed up in screenshots after correct answers. Worth a quick look.
