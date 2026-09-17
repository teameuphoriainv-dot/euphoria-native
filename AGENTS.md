# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Design work uses primary visual references

Do not use ScreensDesign. For inspiration-led design work, inspect the actual Pinterest or social
video rather than its title or summary, measure the relevant transition, and state which mechanism
transfers to Euphoria before changing code.

Preserve the existing design system in `src/constants/theme.ts` and the regression pins. Do not
"establish" a replacement design system. Prefer one action-driven, orchestrated moment over
scattered ambient effects, and provide a reduced-motion outcome for every new animation.

For financial visualizations, motion must not imply nonexistent prices or causes. Use monotonic
easing for data geometry; overshoot is reserved for expressive characters and earned rewards.
