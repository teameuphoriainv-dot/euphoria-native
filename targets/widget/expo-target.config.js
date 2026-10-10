/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'EuphoriaWidget',
  displayName: 'Euphoria',

  /*
   * iOS 17, NOT the plugin's default.
   *
   * @bacons/apple-targets v5 sets DEFAULT_DEPLOYMENT_TARGET = "18.0" (build/with-widget.js:22).
   * Leaving it unset meant the widget target was built iOS 18+, so every iOS 17 user could not
   * add the widget AT ALL — silently, with no error anywhere, because a widget that will not
   * install just does not appear in the gallery.
   *
   * 17.0 and not lower: `.containerBackground(_:for:)` below is iOS 17+, and interactive widgets
   * (Button(intent:)) are iOS 17+. 17.0 is the real floor for this widget's feature set, so it is
   * the honest value rather than an arbitrarily generous one.
   */
  deploymentTarget: '17.0',

  // Mirror the app's group so the widget and the RN side read one container.
  entitlements: {
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },

  /*
   * EVERY VALUE HERE MUST EXIST IN src/constants/theme.ts. scripts/widget-token-pin.mjs enforces
   * it, because the previous comment claimed these were "theme.ts tokens, duplicated here" and
   * two of them were not:
   *
   *   brandPrimary / $accent  were #A855EB, which appears ZERO times in theme.ts. The app's
   *                           violet is #A148E9 (primary). The widget was rendering a brand
   *                           colour the app has never used.
   *   brandFlame              was #F5B33F, which IS in theme.ts — as `warning`. The app draws
   *                           every streak flame in `streak` (#F97316). The most important
   *                           colour in a streak widget was the warning colour.
   *
   * Neither was visible without opening both files side by side, which is exactly why the pin
   * exists now. The target cannot import TypeScript, so duplication is unavoidable — drift is not.
   */
  colors: {
    $widgetBackground: '#09090D', // theme.dark.background
    $accent: '#A148E9',           // theme.dark.primary
    brandBackground: '#09090D',   // theme.dark.background — OPAQUE by design (C60): a translucent
                                  // tint took the colour of the system tray behind it and rendered
                                  // pale lavender instead of our dark brand.
    brandPrimary: '#A148E9',      // theme.dark.primary
    brandFlame: '#F97316',        // theme.dark.streak — the SAME flame the app draws, not `warning`
    textPrimary: '#FFFFFF',       // theme.dark.primaryForeground
    textSecondary: '#C3BAD0',     // theme.dark.textSecondary
  },
});
