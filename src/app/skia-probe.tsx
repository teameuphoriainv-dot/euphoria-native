/**
 * Skia smoke probe — proves the native module RENDERS, not merely that it compiled.
 *
 * Phase 1's gate is not "the build went green". A statically-linked pod can compile, embed and
 * still fail at runtime. This route draws one shape and one SkSL shader; if both appear on
 * device, the rendering layer the character rig depends on is real.
 *
 * Deep link: euphorianative://skia-probe
 * Delete this once atlas-skia.tsx exists and renders — it has no product purpose.
 */
import { Canvas, Circle, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// A trivial SkSL runtime shader. If this compiles and paints, pixel-level control — the thing
// SVG cannot do and the art-direction layer needs — is available.
const source = Skia.RuntimeEffect.Make(`
uniform float2 size;
half4 main(float2 xy) {
  float2 uv = xy / size;
  return half4(uv.x, 0.35, uv.y, 1.0);
}`)!;

export default function SkiaProbe() {
  return (
    <View style={{ flex: 1, backgroundColor: '#09090D', paddingTop: 80, gap: 16 }}>
      <ThemedText style={{ textAlign: 'center' }} accessibilityLabel="skia probe heading">
        Skia probe
      </ThemedText>

      <Canvas style={{ width: 300, height: 160, alignSelf: 'center' }}>
        <Fill>
          <Shader source={source} uniforms={{ size: [300, 160] }} />
        </Fill>
      </Canvas>

      <Canvas style={{ width: 300, height: 160, alignSelf: 'center' }}>
        <Circle cx={150} cy={80} r={60} color="#A855F7" />
      </Canvas>
    </View>
  );
}
