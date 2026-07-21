const { getDefaultConfig } = require('expo/metro-config');

// ponytail: default Expo config + .riv as a bundled asset so require('@/assets/*.riv') works.
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('riv');

module.exports = config;
