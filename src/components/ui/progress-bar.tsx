import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function ProgressBar({ value, height = 6, tone }: { value: number; height?: number; tone?: string }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: theme.muted, overflow: 'hidden', flex: 1 }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: tone ?? theme.primary }} />
    </View>
  );
}
