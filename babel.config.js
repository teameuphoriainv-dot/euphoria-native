/**
 * This file did not exist before NativeWind — Expo SDK 57 needs no babel config by default.
 * It exists ONLY for the nativewind/babel preset, which compiles Tailwind classes.
 *
 * jsxImportSource is deliberately absent. Setting it globally wraps EVERY JSX element in
 * the app in NativeWind's interop component, and src/ uses className nowhere — so ~50
 * screens were paying for a feature with no users. Per-file opt-in keeps decision 6
 * (tailwind.config.js: NEW SURFACES ONLY) intact.
 *
 * Keep babel-preset-expo first. reactCompiler stays on via app.json experiments.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource deliberately NOT set globally: it routes EVERY JSX element in
      // the app through NativeWind's interop wrapper, and src/ has zero className usage.
      // A new surface that wants Tailwind opts in per-file with:
      //   /** @jsxImportSource nativewind */
      'babel-preset-expo',
      'nativewind/babel',
    ],
  };
};
