/**
 * RetryNotice — the way out of a failed request.
 *
 * WHY THIS DID NOT EXIST AND SHOULD HAVE. Audited 2026-08-18: of six data-fetching screens,
 * ZERO offered a retry. Three caught an error and none gave the user anywhere to go. The only
 * `retry` strings anywhere in the app were in number-line.tsx and tile-builder.tsx — lesson
 * interactives using "try again" in a LEARNING sense, not a network one.
 *
 * That is not a cosmetic gap. Polygon's free tier allows five requests per minute, and a user
 * tapping through a few stocks will hit it. Without this component the failure is terminal from
 * their side: no button, no gesture, close the app and reopen. A transient throttle reads as a
 * broken product.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It never renders the raw error. This repo has already
 * shipped a raw RevenueCat string to users once (fixed in Unit 13), and the market API already
 * distinguishes `rate_limited` from `plan_required` from `upstream_*` precisely so the UI can
 * say something true and human instead of forwarding a stack trace. The caller passes the
 * human sentence; the technical detail belongs in the log.
 */
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Maps the market API's error codes to a sentence a person can act on. */
export function retryMessage(code?: string): string {
  switch (code) {
    case 'rate_limited':
      // TRUE and actionable. "Something went wrong" would be neither — the user has done
      // nothing wrong and waiting genuinely fixes it.
      return 'Too many requests just now. Give it a moment and try again.';
    case 'plan_required':
      return 'This data is not included on the current plan.';
    case 'not_configured':
      return 'This is not switched on yet.';
    default:
      return 'That did not load.';
  }
}

export function RetryNotice({
  code,
  message,
  onRetry,
}: {
  /** Error code from the API, used to pick a true sentence. */
  code?: string;
  /** Overrides the code-derived sentence when the caller knows better. */
  message?: string;
  onRetry: () => void;
}) {
  const theme = useTheme();
  const text = message ?? retryMessage(code);
  const canRetry = code !== 'plan_required'; // retrying a plan limit just fails again

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <UIcon name="target" size={22} color={theme.mutedForeground} strokeWidth={2} />
      <ThemedText style={styles.text} themeColor="mutedForeground">
        {text}
      </ThemedText>
      {canRetry && (
        <SpringPressable
          onPress={onRetry}
          accessibilityLabel="Try again"
          style={[styles.button, { borderColor: theme.border }]}
        >
          <ThemedText style={[styles.buttonText, { color: theme.accent }]}>Try again</ThemedText>
        </SpringPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  text: { textAlign: 'center', fontSize: FontSize.bodySm, lineHeight: FontSize.bodySm * 1.45 },
  // 44pt minimum height — Apple HIG, and the touch lane already caught this app shipping a
  // 41pt tab bar and an 18pt link.
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  buttonText: { fontSize: FontSize.bodySm },
});
