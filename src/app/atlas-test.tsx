/**
 * Dev smoke-test route for the Rive pipeline. Deep-link: exp://127.0.0.1:8082/--/atlas-test
 * Renders the bundled .riv + a button to fire the `celebrate` ViewModel trigger.
 */
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AtlasRive, AtlasRiveHandle } from '@/components/atlas-rive';

export default function AtlasTest() {
  const atlas = useRef<AtlasRiveHandle>(null);
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
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Celebrate 🎉</Text>
      </Pressable>
      <Text style={{ color: '#8B5CF6', fontSize: 12, letterSpacing: 1 }}>RIVE SMOKE TEST</Text>
    </View>
  );
}
