/**
 * PERF HUD — a JS-thread frame monitor you can read on a real device.
 *
 * WHY THIS EXISTS. Every performance number in this repo was measured in the SIMULATOR, and
 * refs/NEXT_SESSION.md §4.1 says the dev-build confound was never closed. The owner reports the app
 * still feels laggy on TestFlight, where there is no profiler, no React DevTools and no console:
 * `console.log` does not reach the iOS syslog in this setup. So the number has to be rendered on
 * screen and screenshotted, which is exactly the technique §4.1 used to get its own six-build table.
 *
 * WHAT IT MEASURES, and what it does not. requestAnimationFrame fires from the JS thread, so the
 * gap between callbacks IS JS-thread responsiveness. That is what "laggy" means here: a blocked JS
 * thread cannot answer a touch. It does NOT measure the native/UI thread, so a Reanimated animation
 * running entirely on the UI thread will look fine to this and still be smooth — which is correct.
 *
 * ACCOUNT FOR THE OBSERVER. This sets state once per second, so it adds exactly 1 React commit per
 * second to whatever it is measuring. That is stated on screen rather than quietly subtracted.
 *
 * THE BUILD MARKER IS NOT DECORATION. §3.4 exists because "stale bundle" and "second code path"
 * are indistinguishable from the outside. If the marker below is not the one you shipped, the
 * number on screen is from an older bundle and means nothing.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/lib/store';

/** Bump on every OTA that changes this file. If the screenshot does not show it, it is stale. */
export const HUD_BUILD = 'HUD-1';
/** A frame slower than this is a stall a person can feel, not jitter. */
const SPIKE_MS = 50;

export function PerfHud() {
  const on = useApp((s) => s.perfHud);
  const [line, setLine] = useState('measuring…');

  useEffect(() => {
    if (!on) return undefined;
    let raf = 0;
    let last = 0;
    let windowStart = 0;
    let frames = 0;
    let worst = 0;
    let spikes = 0;

    const tick = (t: number) => {
      if (last) {
        const d = t - last;
        frames += 1;
        if (d > worst) worst = d;
        if (d > SPIKE_MS) spikes += 1;
      }
      last = t;
      if (!windowStart) windowStart = t;
      if (t - windowStart >= 1000) {
        const fps = Math.round((frames * 1000) / (t - windowStart));
        setLine(`${HUD_BUILD}  ${String(fps)} fps  worst ${String(Math.round(worst))}ms  stalls ${String(spikes)}`);
        frames = 0; worst = 0; spikes = 0; windowStart = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); };
  }, [on]);

  if (!on) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {/* Fixed hex, deliberately. A diagnostic overlay has to stay legible in both themes and over
          whatever screen it is floating on, so it does not follow the theme. */}
      <Text style={styles.text}>{line}</Text>
      <Text style={styles.sub}>HUD costs 1 commit/sec of what it measures</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 54, left: 8, zIndex: 9999, backgroundColor: '#000000CC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#39FF88' },
  text: { color: '#39FF88', fontSize: 11, fontVariant: ['tabular-nums'] },
  sub: { color: '#8FB79E', fontSize: 9 },
});
