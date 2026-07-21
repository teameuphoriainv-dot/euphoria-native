/**
 * Euphoria icon — renders a named SVG from the EUPHORIA_ICONS registry.
 * Same registry as the web app (euphoriaweb-current/src/components/icons), so icons
 * are pixel-identical across platforms. No emoji, no lucide, no template defaults.
 */
import { SvgXml } from 'react-native-svg';

import { getIconSvg } from '@/lib/euphoria-icons';

export type IconProps = {
  name: string;
  size?: number;
  /** Optional wrapper opacity — used for inactive tab tint (icons are multi-color). */
  opacity?: number;
};

export function Icon({ name, size = 24, opacity = 1 }: IconProps) {
  return <SvgXml xml={getIconSvg(name)} width={size} height={size} opacity={opacity} />;
}
