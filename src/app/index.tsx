import { Redirect } from 'expo-router';

// ponytail: first-launch always shows onboarding; wire a persisted "completed" flag in Phase 2 (auth).
export default function Index() {
  return <Redirect href="/onboarding" />;
}
