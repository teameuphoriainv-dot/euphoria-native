/**
 * The Euphoria pixel sprite format.
 *
 * A sprite is ASCII art plus a character-to-colour map. That choice is the whole
 * point of the system: sprites are plain text, so they diff in git, review in a
 * PR, get authored by hand or by a model, and never introduce a binary asset or
 * a licence question. It is the same shape as an indexed-colour Aseprite export,
 * which is what makes the Aseprite bridge a straight translation.
 *
 * Width and height are DERIVED from `rows`, never declared, so the dimensions
 * cannot drift out of sync with the art.
 */
export interface PixelSprite {
  id: string;
  name: string;
  tags: string[];
  /** One string per row, one character per pixel. `.` is transparent. */
  rows: string[];
  /**
   * Character -> hex. Omit to use the shared Euphoria palette; supply only when
   * a sprite needs a colour outside it (imported art, retro palettes).
   */
  palette?: Record<string, string>;
  /** Optional short note about what the sprite is for. */
  blurb?: string;
  /**
   * Optional animation. `rows` stays the canonical still frame, used for SSR, for
   * reduced-motion, and any non-animated render; `frames` is the full sequence
   * (including its own first frame). Keeping the still separate means a sprite
   * always has something correct to show without a client-side tick.
   *
   * Every frame must match `rows` in width and height.
   */
  frames?: string[][];
  /** Milliseconds per frame. Defaults to 120. */
  frameMs?: number;
}

/** A merged run of same-coloured pixels, emitted by the compiler. */
export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

export interface CompiledSprite {
  width: number;
  height: number;
  rects: PixelRect[];
}
