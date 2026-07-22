import { Redirect } from 'expo-router';

// ponytail: new users see welcome; persisted-login gating can come later.
export default function Index() {
  return <Redirect href="/welcome" />;
}
