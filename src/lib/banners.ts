/**
 * PROFILE BANNERS — the wide strip behind your avatar, and something you EARN.
 *
 * The owner picked "both, earnable" over "both, plus buy some": a banner should say what you did,
 * not what you spent. So every banner but the default is gated on an achievement id from
 * achievements.ts, which means the unlock condition is already derived from real state and needs no
 * new persistence and no new predicate. `unlockedBanners` is a lookup against earned achievements,
 * nothing more.
 *
 * NO NEW ART. A banner is a flat colour band with one sprite from the EXISTING catalogue repeated
 * across it. That is rung two of the ladder: authoring ten wide sprites would be a second art
 * library for one screen, and the catalogue already holds the exact motifs these want — the flame
 * for a streak, the trophy for a league, the crest for a tier. Flat bands also keep the standing
 * "no gradients, no vibe-coded glow" rule intact without having to think about it.
 *
 * `band` and `ink` are literal hex rather than theme tokens ON PURPOSE. A banner is a chosen
 * decoration, not a themed surface: it must look the same in light and dark, the way a chosen
 * avatar does. The ink is picked to clear 4.5:1 on its own band, checked per row.
 */
import { ACHIEVEMENTS, earnedAchievements, type AchievementState } from './achievements';
import {
  bolt, book, crown, diamondRing, flame, gem, rocket, star, target, trophy,
  type PixelSprite,
} from './pixel';

export type Banner = {
  id: string;
  label: string;
  /** Achievement that unlocks it, or null for the one everybody starts with. */
  requires: string | null;
  /** Flat band colour. */
  band: string;
  /** Name/ink colour, chosen to clear 4.5:1 against `band`. */
  ink: string;
  /** Repeated motif, drawn faintly across the band. From the shared catalogue, never authored. */
  motif: PixelSprite;
};

export const DEFAULT_BANNER_ID = 'slate';

export const BANNERS: Banner[] = [
  { id: 'slate',     label: 'Slate',     requires: null,               band: '#1B1A24', ink: '#EDE6FA', motif: star },
  { id: 'first',     label: 'First Step', requires: 'first-lesson',    band: '#123026', ink: '#8FE3C0', motif: rocket },
  { id: 'scholar',   label: 'Scholar',   requires: 'ten-lessons',      band: '#152B4A', ink: '#9EC9FF', motif: book },
  { id: 'marksman',  label: 'Marksman',  requires: 'course-done',      band: '#3A0F2A', ink: '#FFA8D0', motif: target },
  { id: 'brilliant', label: 'Brilliant', requires: 'hundred-lessons',  band: '#0E2E38', ink: '#96E3F5', motif: diamondRing },
  { id: 'ember',     label: 'Ember',     requires: 'streak-7',         band: '#3A1A0E', ink: '#FFB27A', motif: flame },
  { id: 'furnace',   label: 'Furnace',   requires: 'streak-30',        band: '#4A1206', ink: '#FFC49A', motif: flame },
  { id: 'centurion', label: 'Centurion', requires: 'streak-100',       band: '#2B0E38', ink: '#E5B8FF', motif: crown },
  { id: 'podium',    label: 'Podium',    requires: 'xp-5000',          band: '#3B2E08', ink: '#FFDD8A', motif: trophy },
  { id: 'circuit',   label: 'Circuit',   requires: 'first-option',     band: '#221640', ink: '#CBA8FF', motif: bolt },
  { id: 'whale',     label: 'Whale',     requires: 'whale',            band: '#2A2410', ink: '#F0D98A', motif: gem },
];

export const bannerById = (id: string): Banner =>
  BANNERS.find((b) => b.id === id) ?? BANNERS[0];

/** Every banner this person may wear. The default is always in it. */
export function unlockedBanners(s: AchievementState): Banner[] {
  const earned = new Set(earnedAchievements(s).map((a) => a.id));
  return BANNERS.filter((b) => b.requires === null || earned.has(b.requires));
}

export const bannerUnlocked = (id: string, s: AchievementState): boolean =>
  unlockedBanners(s).some((b) => b.id === id);

if (__DEV__) {
  const ids = new Set<string>();
  for (const b of BANNERS) {
    if (ids.has(b.id)) console.error(`[banners] duplicate id "${b.id}"`);
    ids.add(b.id);
  }
  if (!BANNERS.some((b) => b.id === DEFAULT_BANNER_ID)) console.error('[banners] the default id is not in the list');
  if (BANNERS.filter((b) => b.requires === null).length !== 1) {
    console.error('[banners] exactly one banner must be free, or a new account has nothing or too much');
  }
  // An unknown id must resolve rather than crash — a banner deleted in a later version is otherwise
  // a blank profile for anyone who was wearing it.
  if (bannerById('nope-not-real').id !== BANNERS[0].id) console.error('[banners] unknown id must fall back');

  /*
   * EVERY REQUIREMENT MUST NAME A REAL ACHIEVEMENT. A typo here is silent and permanent: the banner
   * simply never unlocks for anybody, and nothing in the UI can tell that apart from "not earned
   * yet". This check is the only thing standing between a typo and a cosmetic nobody can ever get.
   */
  // Read off ACHIEVEMENTS itself, so RENAMING an achievement fails here rather than silently
  // orphaning a banner. This check earned its place immediately: the first draft of this list
  // invented six ids — league-top3, saver, game-win, perfect-lesson, league-legend, all-courses —
  // none of which exist. tsc cannot see that; a string is a string.
  const known = new Set(ACHIEVEMENTS.map((a) => a.id));
  for (const b of BANNERS) {
    if (b.requires !== null && !known.has(b.requires)) {
      console.error(`[banners] "${b.id}" requires "${b.requires}", which is not an achievement id`);
    }
  }
}
