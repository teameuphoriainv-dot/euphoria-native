/**
 * Story art: the pictures a native lesson's story, toggle and term cards draw, set in the lesson's
 * own world (the night orchard of the IF opener).
 *
 * NATIVE-OWNED, AND NOT IN scenes/. Nothing in src/lib/pixel/stories is synced from the web repo
 * (CONSTITUTION 5.5), and scripts/sync-curriculum.sh never touches it. It is a sibling of scenes/
 * rather than a file inside it because scenes/ is the lesson art slot set (opener, backdrop,
 * keepsake), counted by lesson-scenes-pin's orphan check: a story module there would read as a
 * lesson set with no entry.
 *
 * THREE KINDS OF PICTURE, one shape (SceneArt, so PixelSceneView draws every one of them):
 *   frames  the stage a story beat or toggle state plays on, ambient layers included. Actors are
 *           drawn over it by StoryStage, so a frame never contains anything that moves in a beat.
 *   stills  finished pictures for Idea, Term and Takeaway cards (PixelScene's `story` field), drawn
 *           at scale 2. A still is a frame with its actors stamped into the base.
 *   actors  the one-shot movers: characters, props and their ghosts. A sprite with frames plays
 *           them; `${id}-walk` is the walk cycle for a character with that id.
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from '../scenes/types';

export interface StoryArt {
  id: string;
  width: 80;
  height: 60;
  frames: Record<string, SceneArt>;
  stills: Record<string, SceneArt>;
  actors: Record<string, PixelSprite>;
  /**
   * Drawing order for actors, back to front. Unlisted actors draw after the listed ones, in the
   * order they first appear in a beat. Art decides this, not the lesson data, because only the
   * picture knows that a bill must lie over the drawer it is dropped into.
   */
  order?: string[];
}
