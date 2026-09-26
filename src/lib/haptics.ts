/**
 * expo-haptics, gated by the user's Haptics switch (Settings > Sound & haptics). Same API, so a
 * call site only changes its import. The one exception is atlas-speech.tsx, whose typing tick is
 * pinned to import expo-haptics directly (typing-haptics-pin).
 */
import * as H from 'expo-haptics';

import { useApp } from './store';

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

const on = () => useApp.getState().profile.hapticsOn !== false;

export const impactAsync = (style?: H.ImpactFeedbackStyle) => (on() ? H.impactAsync(style) : Promise.resolve());
export const notificationAsync = (type?: H.NotificationFeedbackType) => (on() ? H.notificationAsync(type) : Promise.resolve());
export const selectionAsync = () => (on() ? H.selectionAsync() : Promise.resolve());
