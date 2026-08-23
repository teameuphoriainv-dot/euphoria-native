# How the pixel art is made — and why iOS can have all of it
Read from `euphoriaweb@origin/master:src/lib/pixel/*` on 2026-08-23.

## The format is ASCII art in a text file
```ts
export interface PixelSprite {
  id: string; name: string; tags: string[];
  rows: string[];                     // one string per row, one CHARACTER per pixel, '.' = transparent
  palette?: Record<string, string>;   // character -> hex; omit to use the shared Euphoria palette
  blurb?: string;
  frames?: string[][];                // optional animation; `rows` stays the canonical still
  frameMs?: number;                   // default 120
}
```

The file says why, and the reasoning is worth keeping:

> "A sprite is ASCII art plus a character-to-colour map. That choice is the whole point of the
> system: sprites are plain text, so they diff in git, review in a PR, get authored by hand or by a
> model, and never introduce a binary asset or a licence question."

Width and height are DERIVED from `rows`, never declared, so dimensions cannot drift from the art.

## The house style
All **16×16**, all against one shared orchid palette. The character key:

`K/k` ink · `P/p/q/Q` orchid · `G/g/y` gold · `N/n/m` green · `R/r/s` red · `w/W/x/X` neutral ·
`T/t` teal · `F/f` pink · `B/b` blue · `.` transparent

> "16×16 is the working size because it is the smallest grid that still carries a readable
> silhouette, and because these render beside 16–24px UI text. Draw the silhouette first: if the
> shape does not read as a black blob, no amount of shading rescues it."

## The pipeline
| file | job | size |
|---|---|---|
| `types.ts` | the format above | 1.8K |
| `palette.ts` | the shared character→hex map | 2.6K |
| `sprites.ts` | **the library — 84 sprites** | 60K |
| `catalogue.ts` | category, allowed slots, usage notes per sprite; validator-enforced | 22K |
| `compile.ts` | merges same-colour runs into RECTS | 4.7K |
| `svg.ts` | rects → `<rect>` markup, `shape-rendering="crispEdges"` | 0.9K |
| `PixelSprite.tsx` | the React renderer | — |
| `scripts/pixel-import.mjs` | importer (indexed-colour Aseprite exports translate straight in) | — |
| `src/pages/DevPixelStudio.tsx` | an in-app authoring Studio | — |

`catalogue.ts` is enforced: his commit says "all 84 sprites carry a category, allowed slots and
usage notes, enforced by the validator. Cosmetics can no longer reach lesson art."

## PORTING TO iOS IS CHEAP — this is the headline
`compile.ts` emits plain rectangles. `react-native-svg` has `<Rect>`. So:

- `types.ts`, `palette.ts`, `sprites.ts`, `catalogue.ts`, `compile.ts` port **unchanged** — they are
  pure TypeScript with no DOM dependency.
- Only the RENDERER needs rewriting, and it is small: map `rects` to `<Rect x y width height fill>`
  inside an `<Svg viewBox>`. Roughly twenty lines.
- **No binary assets to move, no image pipeline, no licence question, no bundle-size cost** beyond
  ~85KB of text that gzips hard.
- Animation comes free: `frames[]` is just more row arrays. `rows` stays the still, which is exactly
  what Reduced Motion should render — the format already made the accessible choice for us.

**Recommendation: import the four data/logic files verbatim as the single source of truth, write the
RN renderer, and let the web repo stay the place sprites are authored.** Two renderers over one
catalogue, rather than two catalogues.

Do NOT hand-copy sprites into iOS. That creates a second art library that drifts, which is exactly
the failure the curriculum re-sync exists to avoid.
