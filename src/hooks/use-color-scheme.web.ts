// ponytail: web is not a shipping target — re-export the native hook; worst case is a
// one-frame theme flicker on web hydration, which we accept over SSR state juggling.
export { useColorScheme } from 'react-native';
