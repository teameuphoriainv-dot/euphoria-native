/**
 * This file did not exist before NativeWind — Expo SDK 57 needs no babel config by default.
 * It exists ONLY to give NativeWind its two required hooks:
 *   - jsxImportSource: routes JSX through NativeWind so `className` is understood
 *   - nativewind/babel preset: compiles the classes
 * Keep babel-preset-expo first. reactCompiler stays on via app.json experiments.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
