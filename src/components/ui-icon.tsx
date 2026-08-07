/**
 * UIcon — Euphoria's UI line-icon set. Hand-drawn 24×24 paths, single consistent
 * stroke weight (2.2), single color. Matches the design mockups' iconography.
 * EUPHORIA_ICONS (multicolor, decorative) stays for large illustration moments;
 * UIcon is for chrome: tab bar, option bubbles, list rows, inline glyphs.
 */
import Svg, { Circle, Path } from 'react-native-svg';

// `satisfies` rather than a `Record<string, …>` ANNOTATION. The annotation widened the key type to
// `string`, which silently collapsed `UIconName = keyof typeof P` into `string` too — so the
// "deliberately NOT `| string`" guard below type-checked every unknown name and rendered it as a
// sparkle. `arrowUp`, `refresh` and `x` all shipped that way. `satisfies` keeps the value check
// while preserving the literal keys.
const P = {
  home: (
    <>
      <Path d="M4 11.5 12 4.5l8 7" />
      <Path d="M6.5 10v9h11v-9" />
      <Path d="M10 19v-5h4v5" />
    </>
  ),
  learn: (
    <>
      <Path d="M12 5.5C10 4 7.5 3.5 4.5 3.8v14.4c3-.3 5.5.2 7.5 1.8 2-1.6 4.5-2.1 7.5-1.8V3.8C16.5 3.5 14 4 12 5.5Z" />
      <Path d="M12 5.5V20" />
    </>
  ),
  trade: (
    <>
      <Path d="M3.5 17.5 9 12l3.5 3.5L20.5 7" />
      <Path d="M15.5 7h5v5" />
    </>
  ),
  feed: (
    <>
      <Path d="M4.5 6.5h15" />
      <Path d="M4.5 12h15" />
      <Path d="M4.5 17.5h9" />
    </>
  ),
  you: (
    <>
      <Circle cx={12} cy={8.2} r={3.7} />
      <Path d="M5 20c1.2-3.4 3.7-5 7-5s5.8 1.6 7 5" />
    </>
  ),
  wallet: (
    <>
      <Path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11v3" />
      <Path d="M4 7.5V17a2.5 2.5 0 0 0 2.5 2.5H20V8H6.5A2.5 2.5 0 0 1 4 7.5Z" />
      <Circle cx={16.2} cy={13.8} r={1.1} fill="currentColor" strokeWidth={0} />
    </>
  ),
  gradCap: (
    <>
      <Path d="m12 4.5 9.5 4.7L12 13.9 2.5 9.2 12 4.5Z" />
      <Path d="M6.5 11.5v4.3c3.7 2.7 7.3 2.7 11 0v-4.3" />
      <Path d="M21.5 9.2v5" />
    </>
  ),
  bolt: <Path d="M13 3 5.5 13.5h5L11 21l7.5-10.5h-5L13 3Z" />,
  globe: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M3.5 12h17" />
      <Path d="M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5s1.3-6.1 3.9-8.5Z" />
    </>
  ),
  seedling: (
    <>
      <Path d="M12 20v-7" />
      <Path d="M12 13C12 9 9.5 6.5 4.5 6.5 4.5 10.5 7 13 12 13Z" />
      <Path d="M12 11c0-3.2 2-5.2 6-5.2 0 3.2-2 5.2-6 5.2Z" />
    </>
  ),
  bookOpen: (
    <>
      <Path d="M12 6.5C10.3 5 8 4.4 4.5 4.6v13c3.5-.2 5.8.4 7.5 1.9 1.7-1.5 4-2.1 7.5-1.9v-13C16 4.4 13.7 5 12 6.5Z" />
      <Path d="M12 6.5v13" />
    </>
  ),
  rocket: (
    <>
      <Path d="M12 15.5c4.5-3.5 6.5-7.5 6-11.5-4 -.5-8 1.5-11.5 6" />
      <Path d="M6.5 10 4 12.5l3 1 4.5 4.5 1-3 2.5-2.5" />
      <Path d="M5 16.5c-.8.8-1.3 2.2-1.5 4 1.8-.2 3.2-.7 4-1.5" />
      <Circle cx={14.5} cy={9.5} r={1.3} />
    </>
  ),
  flame: (
    <Path d="M12 21c3.9 0 6.5-2.4 6.5-6 0-2.5-1.4-4.8-3.3-6.6.2 1.7-.3 3-1.4 3.6.3-2.8-1-5.8-3.8-8-.3 3-1.6 4.9-3 6.6-1.2 1.5-1.5 2.9-1.5 4.4 0 3.6 2.6 6 6.5 6Z" />
  ),
  target: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.8} />
      <Circle cx={12} cy={12} r={1.4} fill="currentColor" strokeWidth={0} />
    </>
  ),
  arrowRight: (
    <>
      <Path d="M4.5 12h14" />
      <Path d="m13 6.5 5.5 5.5L13 17.5" />
    </>
  ),
  sparkle: (
    <>
      <Path d="M12 4.5c.7 3.6 2.9 5.8 6.5 6.5-3.6.7-5.8 2.9-6.5 6.5-.7-3.6-2.9-5.8-6.5-6.5 3.6-.7 5.8-2.9 6.5-6.5Z" />
      <Path d="M18.5 15.5c.3 1.5 1.2 2.4 2.7 2.7-1.5.3-2.4 1.2-2.7 2.7-.3-1.5-1.2-2.4-2.7-2.7 1.5-.3 2.4-1.2 2.7-2.7Z" />
    </>
  ),
  chevronLeft: <Path d="M14.5 5 8 12l6.5 7" />,
  chevronRight: <Path d="M9.5 5 16 12l-6.5 7" />,
  trophy: (
    <>
      <Path d="M7 5h10v3.5a5 5 0 0 1-10 0V5Z" />
      <Path d="M7 6.5H5a2 2 0 0 0 2 2M17 6.5h2a2 2 0 0 1-2 2" />
      <Path d="M12 13.5V17M9 20h6" />
    </>
  ),
  check: <Path d="m5.5 12.5 4.2 4.2 8.8-9.4" />,
  close: (
    <>
      <Path d="M6.5 6.5 17.5 17.5" />
      <Path d="M17.5 6.5 6.5 17.5" />
    </>
  ),
  lock: (
    <>
      <Path d="M7 11V8.5a5 5 0 0 1 10 0V11" />
      <Path d="M5.5 11h13v6.5a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3V11Z" />
    </>
  ),
  chat: (
    <>
      <Path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16H9.5L5 19.5l-.5-3V6.5Z" />
    </>
  ),
  bell: (
    <>
      <Path d="M6.5 10.5a5.5 5.5 0 0 1 11 0c0 4 1.6 5 1.6 5H4.9s1.6-1 1.6-5Z" />
      <Path d="M10 18.5a2 2 0 0 0 4 0" />
    </>
  ),
  settings: (
    <>
      <Path d="M4 7.5h8M17 7.5h3" />
      <Circle cx={14.5} cy={7.5} r={2.3} />
      <Path d="M4 16.5h4M12.5 16.5h7.5" />
      <Circle cx={9.5} cy={16.5} r={2.3} />
    </>
  ),
  search: (
    <>
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="M16 16l4 4" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

export type UIconName = keyof typeof P;

export function UIcon({
  name,
  size = 24,
  color = '#BB83F1',
  strokeWidth = 2.2,
}: {
  // deliberately NOT `| string`: the `?? P.sparkle` fallback below is a rendering safety net, not a
  // licence to pass unknown names. `close` shipped as a silent sparkle for exactly that reason.
  name: UIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke={color}
      color={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none">
      {P[name] ?? P.sparkle}
    </Svg>
  );
}
