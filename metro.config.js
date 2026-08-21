const { getDefaultConfig } = require('expo/metro-config');

// ponytail: default Expo config + .riv as a bundled asset so require('@/assets/*.riv') works.
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('riv');

/*
 * withNativeWind() was removed 2026-08-21. It injected react-native-css-interop's runtime into
 * the bundle, and that runtime patches View/Text/Pressable at import time via cssInterop(),
 * making CssInterop.View the app's third-largest render cost (~21,000ms of render across 8
 * IDLE seconds) for a feature src/ never used: zero className props anywhere.
 *
 * This is the DOMINANT of NativeWind's three hooks -- removing the global.css import alone
 * changed nothing, because Metro injected the runtime regardless. Measured, not assumed.
 *
 * To bring NativeWind back for a new surface, restore all three together:
 *   1. this file:        withNativeWind(config, { input: './global.css' })
 *   2. babel.config.js:  ['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'
 *   3. src/app/_layout.tsx: import '../../global.css'
 * Any one alone is enough to re-wrap the whole app, and fewer than all three is a broken setup
 * -- nativewind/doctor.js throws when jsxImportSource is missing.
 */
module.exports = config;
