/**
 * The App Group bridge (§15.3 consequence 2).
 *
 * The widget runs in a SEPARATE PROCESS. It cannot read zustand and it cannot read AsyncStorage,
 * so anything it renders has to be mirrored into a shared `UserDefaults(suiteName:)` container
 * that both sides can reach.
 *
 * Deliberately the same shape as the trial reminder in `lib/notifications.ts`: one module-scope
 * subscription with a transition guard, imported for its side effect by `_layout.tsx`. The guard
 * is not a micro-optimisation — WidgetKit RATE-LIMITS reload requests, and a widget that asks on
 * every XP tick and every trade gets its budget spent and then stops refreshing at all. Writing
 * only on a real change is what keeps the reloads meaningful.
 */
import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import { dayKey, useApp } from './store';

/**
 * Declared ONCE in `app.json` under `ios.entitlements`; `targets/widget/expo-target.config.js`
 * mirrors it from there, so the app side and the widget side cannot drift apart. If this string
 * stops matching, `UserDefaults(suiteName:)` returns nil in the widget and it silently renders
 * zeros — there is no error to see.
 */
export const APP_GROUP = 'group.com.euphoria.native';

const storage = Platform.OS === 'ios' ? new ExtensionStorage(APP_GROUP) : null;

let last = '';

/**
 * Mirror the widget's inputs. Exported so a test or a dev screen can force a write; the normal
 * path is the subscription below.
 */
export function syncWidget(s = useApp.getState()) {
  if (!storage) return;

  const today = dayKey();
  const key = `${String(s.streak)}:${String(s.xp)}:${today}`;
  if (key === last) return;
  last = key;

  storage.set('streak', s.streak);
  storage.set('xp', s.xp);
  storage.set('dayKey', today);
  ExtensionStorage.reloadWidget();
}

useApp.subscribe((s) => {
  syncWidget(s);
});

/*
 * Hydrate on cold start. Without this, a user who adds the widget and then does not complete a
 * lesson sees zeros until their next store write — the widget would be lying about a streak they
 * actually have. The guard above makes the repeat call free.
 */
syncWidget();
