/**
 * The Euphoria pixel art system, on iOS.
 *
 * Sprites are ASCII text plus a palette map, compiled to merged SVG rectangles. No binary assets,
 * no external tooling required at build or run time, and every sprite reviews as a readable diff.
 *
 * PORTED, NOT REWRITTEN. types / palette / compile / sprites / catalogue are byte-for-byte copies
 * of euphoriaweb's. Only the renderer is new, because that is the only part that touched the DOM.
 *
 * Authoring routes, in increasing order of effort:
 *   1. Edit the ASCII directly in sprites.ts — the format exists to be hand- or model-authored.
 *   2. Draw in Aseprite via the pixel-plugin MCP server (github.com/willibrandon/pixel-plugin),
 *      export a PNG, then run euphoriaweb's `scripts/pixel-import.mjs <png> <id>`.
 *
 * EDIT SPRITES ON WEB, THEN RE-COPY. Two catalogues drift; one catalogue with two renderers does
 * not. This is the same rule as the curriculum and the shop item table.
 *
 * Drawing rule that is easy to get wrong, kept from the web's own index: outline with the deep ramp
 * steps (O/E/D/I), NOT with K. K is invisible against the app's dark canvas.
 *
 * `svg.ts` is deliberately NOT ported — it produced raw SVG markup strings for the web Studio's
 * insert flow, and React Native has nothing that consumes a markup string.
 */
export { PixelSpriteView } from './PixelSprite';
export type { PixelPlayMode } from './PixelSprite';
export { compileSprite, compileFrames, PixelSpriteError } from './compile';
export { EUPHORIA_PIXEL_PALETTE, TRANSPARENT } from './palette';
export type { PixelSprite, PixelRect, CompiledSprite } from './types';
export { PIXEL_SPRITES, SPRITES_BY_ID, getSprite } from './sprites';
export * from './sprites';
