/**
 * Dev smoke-test route for the Rive pipeline. Deep-link: exp://127.0.0.1:8082/--/atlas-test
 * Renders the bundled .riv + a button to fire the `celebrate` ViewModel trigger.
 */
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AtlasRive, AtlasRiveHandle } from '@/components/atlas-rive';
import { FontSize } from '@/constants/theme';

export default function AtlasTest() {
  const atlas = useRef<AtlasRiveHandle>(null);
  if (!__DEV__) return null; // dev-only Rive smoke test — unreachable in production builds
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E0A14', gap: 36 }}>
      <AtlasRive ref={atlas} size={300} />
      <Pressable
        onPress={() => atlas.current?.fire('celebrate')}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#7C3AED' : '#8B5CF6',
          paddingHorizontal: 36,
          paddingVertical: 15,
          borderRadius: 999,
        })}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: FontSize.body }}>Celebrate 🎉</Text>
      </Pressable>
      <Text style={{ color: '#8B5CF6', fontSize: FontSize.caption, letterSpacing: 1 }}>RIVE SMOKE TEST</Text>
    </View>
  );
}
