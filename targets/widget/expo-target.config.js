/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'EuphoriaWidget',
  displayName: 'Euphoria',
  // Mirror the app's group so the widget and the RN side read one container.
  // 15b writes nothing yet — 15c is where real data crosses this boundary.
  entitlements: {
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
  colors: {
    // Referenced by the generated Info.plist / asset catalog build settings.
    $widgetBackground: '#09090D',
    $accent: '#A855EB',
    // theme.ts tokens, duplicated here because the target cannot import TS.
    // brandBackground is the OPAQUE surface the widget paints (C60): a translucent tint took the
    // colour of the system tray behind it and rendered pale lavender instead of our dark brand.
    brandBackground: '#09090D',
    brandPrimary: '#A855EB',
    brandFlame: '#F5B33F',
    textPrimary: '#FFFFFF',
    textSecondary: '#C3BAD0',
  },
});
