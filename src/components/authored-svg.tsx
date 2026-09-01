import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

function authoredAspectRatio(xml: string): number {
  const match = /viewBox\s*=\s*["']\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i.exec(xml);
  const width = Number(match?.[3]);
  const height = Number(match?.[4]);
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
    ? width / height
    : 16 / 9;
}

/** Render trusted, repository-authored lesson SVG without flattening it into prose. */
export function AuthoredSvg({ xml, label }: { xml: string; label: string }) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[styles.frame, { aspectRatio: authoredAspectRatio(xml) }]}>
      <View
        style={StyleSheet.absoluteFill}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <SvgXml xml={xml} width="100%" height="100%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden' },
});
