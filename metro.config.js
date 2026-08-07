const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// ponytail: default Expo config + .riv as a bundled asset so require('@/assets/*.riv') works.
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('riv');

// NativeWind wraps LAST so it sees the .riv resolver change above.
module.exports = withNativeWind(config, { input: './global.css' });
