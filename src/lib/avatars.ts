/**
 * PROFILE AVATARS — the identity a player picks for themselves.
 *
 * Every game worth the name lets you choose your mark before it lets you buy one, and Euphoria had
 * neither: your face in the standings was the first letter of your name in a circle. This is the
 * free layer. The shop's badges, frames and themes still sit on top of it.
 *
 * ALL FREE, ALL AVAILABLE IMMEDIATELY, and that is deliberate. An avatar you cannot pick until you
 * have paid is not identity, it is a locked cosmetic wearing identity's clothes — and the item that
 * should be gated is the RARE one, which the shop already handles. Making the free set large is
 * what makes the paid set feel special rather than mandatory.
 *
 * Every sprite is already in the shared catalogue. Nothing was drawn for this.
 */
import {
  CHARACTERS, bear, bolt, book, bull, car, chartUp, compass, controller, crown, flame, gem, globe,
  graduationCap, heart, house, lightbulb, magnet, plane, rocket, seedling, shield, snowflake,
  star, stockTicker, tree, trophy, umbrella, whale, type PixelSprite,
} from './pixel';

export type Avatar = { id: string; label: string; sprite: PixelSprite };

/**
 * THE CAST comes first, and it is what "avatar" means here.
 *
 * The first version of this file offered only catalogue marks. The owner's correction was exact:
 * "actual characters, not just some random symbols". A symbol labels you; a character IS you, and
 * that is the thing a profile picture does.
 */
export const CHARACTER_AVATARS: Avatar[] = CHARACTERS.map((c) => ({
  id: c.id,
  label: c.label,
  sprite: c.sprite,
}));

/**
 * The marks are KEPT, as a second group rather than the main one. Some people would rather be a
 * whale than a person, and removing that to satisfy the note would trade one narrow set for
 * another. Ordered loosely: creatures, status, elements, things you do.
 */
export const MARK_AVATARS: Avatar[] = [
  { id: 'whale', label: 'Whale', sprite: whale },
  { id: 'bull', label: 'Bull', sprite: bull },
  { id: 'bear', label: 'Bear', sprite: bear },
  { id: 'seedling', label: 'Sprout', sprite: seedling },

  { id: 'crown', label: 'Crown', sprite: crown },
  { id: 'trophy', label: 'Trophy', sprite: trophy },
  { id: 'gem', label: 'Gem', sprite: gem },
  { id: 'star', label: 'Star', sprite: star },

  { id: 'flame', label: 'Flame', sprite: flame },
  { id: 'bolt', label: 'Bolt', sprite: bolt },
  { id: 'snowflake', label: 'Frost', sprite: snowflake },
  { id: 'heart', label: 'Heart', sprite: heart },

  { id: 'rocket', label: 'Rocket', sprite: rocket },
  { id: 'plane', label: 'Plane', sprite: plane },
  { id: 'car', label: 'Car', sprite: car },
  { id: 'globe', label: 'Globe', sprite: globe },

  { id: 'compass', label: 'Compass', sprite: compass },
  { id: 'magnet', label: 'Magnet', sprite: magnet },
  { id: 'shield', label: 'Shield', sprite: shield },
  { id: 'umbrella', label: 'Umbrella', sprite: umbrella },

  { id: 'book', label: 'Book', sprite: book },
  { id: 'graduation', label: 'Graduate', sprite: graduationCap },
  { id: 'lightbulb', label: 'Idea', sprite: lightbulb },
  { id: 'controller', label: 'Player', sprite: controller },

  { id: 'chart', label: 'Chart', sprite: chartUp },
  { id: 'ticker', label: 'Ticker', sprite: stockTicker },
  { id: 'house', label: 'House', sprite: house },
  { id: 'tree', label: 'Tree', sprite: tree },
];

/**
 * ATLAS IS THE DEFAULT, and he is a real option rather than a fallback.
 *
 * He is the brand and he is what every existing account already wears, so defaulting to a sprite
 * would silently reskin every profile in the app on update. He is also deliberately NOT in AVATARS:
 * the owner's standing decision is that Atlas stays VECTOR, so he cannot be a PixelSprite. Callers
 * check for this id and render the mascot component instead.
 */
export const ATLAS_AVATAR_ID = 'atlas';
export const DEFAULT_AVATAR_ID = ATLAS_AVATAR_ID;

/** The chosen sprite, or null when the player is wearing Atlas. Null is a real answer here, not a
 *  failure — callers render the mascot for it. An unknown id also lands here rather than drawing a
 *  hole where a face should be. */
export function avatarFor(id: string | undefined): Avatar | null {
  if (!id || id === ATLAS_AVATAR_ID) return null;
  return ALL_AVATARS.find((a) => a.id === id) ?? null;
}

/** Everything pickable, characters first. Used for lookups; the picker renders the two groups. */
export const ALL_AVATARS: Avatar[] = [...CHARACTER_AVATARS, ...MARK_AVATARS];
