import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, padded = true, elevated = false, ...rest }: ViewProps & { padded?: boolean; elevated?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? theme.cardElevated : theme.card,
          borderColor: theme.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: Radius.lg,
        },
        padded && { padding: Spacing.three },
        style,
      ]}
      {...rest}
    />
  );
}
