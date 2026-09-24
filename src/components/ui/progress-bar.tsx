import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ProgressFill } from '@/shared/motion/progress-fill';

export function ProgressBar({ value, height = 6, tone }: { value: number; height?: number; tone?: string }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: theme.muted, overflow: 'hidden', flex: 1 }}>
      {/* Eases to each new value instead of snapping (transform only, see ProgressFill). */}
      <ProgressFill ratio={pct} color={tone ?? theme.primary} style={{ height, borderRadius: height }} />
    </View>
  );
}
