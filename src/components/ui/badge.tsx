import { View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tone = 'primary' | 'success' | 'warning' | 'neutral';

export function Badge({ label, tone = 'primary', style }: { label: string; tone?: Tone; style?: ViewStyle }) {
  const theme = useTheme();
  const color = { primary: theme.primary, success: theme.success, warning: theme.warning, neutral: theme.mutedForeground }[tone];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: color + '22',
          borderRadius: Radius.pill,
          paddingHorizontal: Spacing.two + 2,
          paddingVertical: Spacing.half + 1,
        },
        style,
      ]}>
      <ThemedText type="smallBold" style={{ color }}>{label}</ThemedText>
    </View>
  );
}
