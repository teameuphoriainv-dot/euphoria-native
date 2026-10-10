/**
 * Renders every Atlas expression into the WidgetKit asset catalog.
 *
 * WHY THIS EXISTS: WidgetKit is SwiftUI. It cannot run React Native, so the Atlas in
 * src/components/atlas.tsx — 64 SVG elements, nine expressions, all the acting in the pupils —
 * is unreachable from the widget. The widget has shipped with no mascot at all: its asset
 * catalog contains seven colorsets and zero images.
 *
 * WHY IT PARSES atlas.tsx RATHER THAN HARDCODING: the expressions are the product. If a brow
 * curve is tuned in the app and the widget keeps the old one, Atlas is two different characters
 * on one phone — and nobody would notice until a user did. The brow paths and pupil geometry are
 * read straight out of the component, so the widget cannot drift from the app by construction.
 *
 * GEOMETRY, and WHICH PLATE — this was wrong on the first pass and it showed.
 *
 * The body was originally taken from goldie/decor/atlas-watching.png because 600x624 is exactly
 * 6x the 100x104 viewBox, which made the mapping trivial. But that render is NOT the Atlas the
 * app draws: its eyes sit wider apart and its rings are arranged differently. Every expression
 * inherited a body the product does not use, and it was obvious the moment it was put beside a
 * screenshot of the running app.
 *
 * The canonical mark is assets/euphoria.icon/Assets/euphoria-mark.png. Measuring the eye outlines
 * in it and converting to viewBox units gives L(35.7, 26.4) r13.1 and R(59.1, 24.5) r12.3 against
 * atlas.tsx's declared L(34.8, 26.5) r13 and R(61.2, 25) r11.8 — within one or two units, so it
 * is a render of the same component and the same coordinates apply.
 *
 * It is 1024x1024 with the 100x104 viewBox stretched to fill, so the composite below sets
 * preserveAspectRatio="none" to reproduce exactly that mapping. Without it the plate letterboxes
 * and the redrawn eyes land off the face.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { Buffer } from 'node:buffer';

const SRC = readFileSync("src/components/atlas.tsx", "utf8");
const OUT = "targets/widget/Assets.xcassets";
const BODY_SVG = "refs/atlas-mark-source.svg";   // pure vector, no raster plate
const SCALE = 6;
const VB_W = 100, VB_H = 104;
const INK = "#1A1523";
/** Plate is clipped below this y so its own brows never reach the frame. */
const BROW_FLOOR = 20;
/*
 * THE BODY MOVES, NOT JUST THE EYES.
 *
 * Every expression was rendering on an identical, perfectly upright mark — same rings, same
 * orientation, same posture, nine times. That is why the set read as static next to Duolingo's,
 * whose ~25 illustrations are each a distinct POSE. The difference there is art, not technology:
 * a widget cannot loop an animation, but it can ship a body that is genuinely drawn differently
 * per state.
 *
 * TILT is not invented here — it is lifted from EXPRESSION_TILT in atlas.tsx, so the widget poses
 * the way the running app already poses, around the same origin (50, 62) with the eyes carried
 * along inside the same group.
 *
 * SCALE goes further than the app can. EXPRESSION_TILT carries two comments admitting defeat:
 * whoa is "pulled back, not sideways — not expressible here" and proud is "chin up, not sideways".
 * Those are true of a single rotation on a live component. A still render has no such limit, so
 * whoa pulls back and proud lifts, which is what those poses always wanted.
 */
/*
 * SCENES, NOT JUST POSES.
 *
 * Duolingo's 25 widget illustrations are not 25 expressions — they are 25 SITUATIONS. Duo in a
 * bush, in a spotlight, standing in fire, as a gravestone, as a skeleton in a desert. Each tile
 * tells you where he is, not only how he feels, and that environmental storytelling is most of
 * why their set reads as rich and ours reads as a logo with moods.
 *
 * We cannot draw 25 bespoke illustrations. We CAN build a vocabulary of environments from SVG
 * primitives and compose them behind and in front of the mark — which is a different thing from
 * illustration and worth being honest about, but it closes a real part of the gap for zero
 * commission cost.
 *
 * Rendered BEHIND the mark unless the key ends in "Fg".
 */
const SCENE = {
  night: `<g opacity="0.85">
    ${[[14,16,0.9],[31,9,0.6],[68,13,0.8],[86,21,0.5],[24,30,0.45],[78,34,0.6],[54,7,0.7],[92,9,0.4]]
      .map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#CFE0FF" opacity="0.9"/>`).join("")}
    <path d="M9 24 q2.4 -3 4.8 0 q-2.4 3 -4.8 0" fill="#CFE0FF" opacity="0.5"/>
  </g>`,
  lateFg: `<g>
    ${[[8,1.0],[20,1.35],[33,0.85],[46,1.5],[59,0.95],[72,1.3],[85,1.05],[96,0.8]]
      .map(([x,k]) => `<path d="M${x} 104 q${-5*k} ${-13*k} 0 ${-20*k} q${2.6*k} ${5.5*k} ${4.2*k} ${2.6*k} q${1.4*k} ${7*k} ${-4.2*k} ${17.4*k} z" fill="#FF8A2B" opacity="0.92"/>`).join("")}
    ${[[13,0.75],[27,0.95],[40,0.7],[53,1.0],[66,0.8],[79,0.9],[91,0.7]]
      .map(([x,k]) => `<path d="M${x} 104 q${-3.4*k} ${-8.4*k} 0 ${-13*k} q${1.7*k} ${3.4*k} ${2.8*k} ${1.7*k} q${0.9*k} ${4.5*k} ${-2.8*k} ${11.3*k} z" fill="#FFD23F" opacity="0.95"/>`).join("")}
  </g>`,
  spotlight: `<defs><radialGradient id="spot" cx="0.5" cy="0.28" r="0.62">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>
    <path d="M50 -6 L86 104 L14 104 Z" fill="url(#spot)"/>`,
  sparkle: `<g fill="#FFE9A8">
    ${[[18,22,2.6],[82,18,2.1],[74,38,1.6],[26,40,1.8],[50,10,2.3]]
      .map(([x,y,r]) => `<path d="M${x} ${y-r} L${x+r*0.32} ${y-r*0.32} L${x+r} ${y} L${x+r*0.32} ${y+r*0.32} L${x} ${y+r} L${x-r*0.32} ${y+r*0.32} L${x-r} ${y} L${x-r*0.32} ${y-r*0.32} Z" opacity="0.92"/>`).join("")}
  </g>`,
  sweatFg: `<g fill="#9AD8FF" opacity="0.95">
    <path d="M70 30 q3.2 5 0 7.4 q-3.2 -2.4 0 -7.4 z"/>
    <path d="M25 34 q2.6 4.2 0 6.2 q-2.6 -2 0 -6.2 z"/>
  </g>`,
};

/** Which scene layers each expression wears. */
const SCENE_FOR = {
  default:  [], watching: [], happy: ["sparkle"],
  whoa:     ["sweatFg"], silly: [], sad: [],
  thinking: [], proud: ["sparkle"], oops: ["sweatFg"],
};

const POSE = {
  default:  { tilt: 0,  scale: 1.00, dy: 0 },
  watching: { tilt: 0,  scale: 1.00, dy: 0 },
  happy:    { tilt: 0,  scale: 1.02, dy: -0.5 },  // a touch forward, pleased
  whoa:     { tilt: 0,  scale: 0.92, dy: 1.5 },   // PULLED BACK — the app could not do this
  silly:    { tilt: 6,  scale: 1.00, dy: 0 },
  sad:      { tilt: 3,  scale: 0.97, dy: 2.0 },   // slumped, smaller, lower
  thinking: { tilt: -7, scale: 1.00, dy: 0 },     // the cocked head
  proud:    { tilt: 0,  scale: 1.04, dy: -2.0 },  // CHIN UP — the app could not do this
  oops:     { tilt: -3, scale: 0.98, dy: 1.0 },
};
/** Same rotation origin the app uses for its head group. */
const POSE_ORIGIN = { x: 50, y: 62 };

const EYES = [{ cx: 34.8, cy: 26.5, r: 13 }, { cx: 61.2, cy: 25, r: 11.8 }];

/** Pull the body of a `case 'name':` arm out of a switch, up to the next case/default. */
/**
 * Slice one switch out of atlas.tsx, bounded by the symbol that follows it.
 *
 * Pattern-based bounds failed twice here and both failures were silent, which is why this uses
 * explicit end anchors. Searching for "\n};" ran past brows() AND pupils() because both close
 * with an indented "  };" — the regex then matched pupils' arms second and overwrote brows' arms
 * of the same name, so both functions returned byte-identical geometry. Tightening to the next
 * `const` declaration then truncated brows() at its own internal `const st`. An explicit END map
 * cannot drift silently: if a name moves, the assert below throws instead of quietly returning
 * the wrong function's body.
 */
const END = { brows: "const closedEyes", pupils: "const closedEyes" };

function caseArms(fnName) {
  const start = SRC.indexOf(`const ${fnName} = () => {`);
  if (start < 0) throw new Error(`${fnName}() not found — atlas.tsx was restructured`);
  let end = SRC.indexOf(END[fnName], start + 10);
  if (end < 0) end = SRC.length;
  // pupils() sits AFTER closedEyes, so its forward search misses; fall back to end-of-file.
  const body = end > start ? SRC.slice(start, end) : SRC.slice(start);
  const arms = {};
  for (const m of body.matchAll(/case '([a-z]+)':([\s\S]*?)(?=\n\s*case '|\n\s*default:|$)/g)) arms[m[1]] = m[2];
  if (!Object.keys(arms).length) throw new Error(`${fnName}() parsed zero cases — the switch format changed`);
  return arms;
}


/** JSX <Path .../> and <Circle .../> -> plain SVG. Only the static attrs; animated arms return null. */
function jsxToSvg(arm) {
  if (!arm || /Animated/.test(arm)) return null;   // animated expressions handled by fallback
  const out = [];
  for (const m of arm.matchAll(/<Path\s+d="([^"]+)"[^/]*\/>/g)) {
    out.push(`<path d="${m[1]}" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`);
  }
  for (const m of arm.matchAll(/<Circle\s+cx=\{([\d.]+)\}\s+cy=\{([\d.]+)\}\s+r=\{([\d.]+)\}\s+fill=\{?"?(#fff|INK)"?\}?/g)) {
    out.push(`<circle cx="${m[1]}" cy="${m[2]}" r="${m[3]}" fill="${m[4] === "INK" ? INK : "#fff"}"/>`);
  }
  return out.length ? out.join("") : null;
}

const brows = caseArms("brows");
const pupils = caseArms("pupils");
const NAMES = ["default", "watching", "happy", "whoa", "silly", "sad", "thinking", "proud", "oops"];

// `happy` draws its pupils as animated arcs; the static equivalent is the same smile curve.
const PUPIL_FALLBACK = {
  happy: `<path d="M28 24 Q34.8 31 41.6 24" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"/>` +
         `<path d="M55 22.5 Q61.2 29 67.4 22.5" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`,
  default: `<circle cx="34.8" cy="27.5" r="5.4" fill="${INK}"/><circle cx="32.9" cy="25.6" r="1.7" fill="#fff"/>` +
           `<circle cx="61.2" cy="26" r="5" fill="${INK}"/><circle cx="59.4" cy="24.2" r="1.6" fill="#fff"/>`,
};

mkdirSync(OUT, { recursive: true });
if (!existsSync(BODY_SVG)) throw new Error(`body source missing: ${BODY_SVG}`);
/*
 * The body arrives as VECTOR, not as a raster plate.
 *
 * Earlier passes composited drawn eyes over a PNG render and then clipped the plate above the
 * brow line to hide the eyes it already had. That is what made the result look irregular: a
 * resampled raster underneath crisp vector eyes, with a hard clip edge between them.
 *
 * refs/atlas-mark-source.svg is the real source — its own header says the geometry was "MEASURED
 * off the original artwork by parameter sweep against its alpha mask (IoU 0.951)", it shares the
 * 100x104 viewBox, and it explicitly excludes the face: "Eyes, expressions and blink live in
 * src/components/atlas.tsx and are drawn above this mark." So the body's defs and paint order are
 * inlined verbatim and the face is drawn on top, which is exactly the composition it documents.
 *
 * Nothing is clipped now, because nothing needs hiding.
 */
const bodySrc = readFileSync(BODY_SVG, "utf8");
const bodyDefs = bodySrc.slice(bodySrc.indexOf("<defs>"), bodySrc.indexOf("</defs>") + 7);
const bodyPaint = bodySrc.slice(bodySrc.indexOf("</defs>") + 7, bodySrc.lastIndexOf("</svg>"));

const made = [];
for (const name of NAMES) {
  const brow = jsxToSvg(brows[name]) ?? "";
  const pupil = jsxToSvg(pupils[name]) ?? PUPIL_FALLBACK[name] ?? PUPIL_FALLBACK.default;
  const eyes = EYES.map((e) => `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="#fff" stroke="${INK}" stroke-width="2.2"/>`).join("");
  const pose = POSE[name] ?? POSE.default;
  const layers = SCENE_FOR[name] ?? [];
  const sceneBack = layers.filter((k) => !k.endsWith("Fg")).map((k) => SCENE[k]).join("");
  const sceneFore = layers.filter((k) => k.endsWith("Fg")).map((k) => SCENE[k]).join("");
  // One transform wraps body AND face, because in atlas.tsx they share the head group — posing
  // them separately would slide the eyes off the mark.
  const t = `translate(${POSE_ORIGIN.x} ${POSE_ORIGIN.y + pose.dy}) rotate(${pose.tilt}) scale(${pose.scale}) translate(${-POSE_ORIGIN.x} ${-POSE_ORIGIN.y})`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W * SCALE}" height="${VB_H * SCALE}">
${bodyDefs}
${sceneBack}
<g transform="${t}">
${bodyPaint}
${eyes}${pupil}${brow}
</g>
${sceneFore}</svg>`;

  const dir = join(OUT, `atlas-${name}.imageset`);
  mkdirSync(dir, { recursive: true });
  const buf = Buffer.from(svg);
  for (const s of [1, 2, 3]) {
    await sharp(buf, { density: 72 * s }).resize(120 * s, 125 * s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 }).toFile(join(dir, `atlas-${name}@${s}x.png`));
  }
  writeFileSync(join(dir, "Contents.json"), JSON.stringify({
    images: [1, 2, 3].map((s) => ({ idiom: "universal", filename: `atlas-${name}@${s}x.png`, scale: `${s}x` })),
    info: { author: "xcode", version: 1 },
  }, null, 2));
  made.push(name);
}
console.log(`atlas-widget-assets: ${made.length} expressions -> ${OUT}\n  ${made.join(", ")}`);
