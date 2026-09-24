#!/usr/bin/env node
/**
 * TYPEWRITER LEAF PIN.
 *
 * THE DEFECT. The vocab conversation typed Atlas's lines with a setState every 1000/46 ms inside
 * AtlasConversation itself, so every character re-rendered the whole screen: the ScrollView, the
 * progress bar, Atlas, the bubble and every answer option. Over the wrapped corpus
 * (src/lib/curriculum/index.ts, the loader that renders) that is 186 vocab steps, a median of
 * 1,649 typed characters per step and 2,194 at worst (wealth-management lesson 7, step 5):
 * 1,649 full-screen re-renders to read one median step. Measured 2026-09-22.
 *
 * THE FIX it holds: the interval and the per-character state live only in the memoised leaf
 * src/components/typed-message.tsx, and AtlasConversation commits a bounded number of times per
 * beat (arrival, typing done, answer picked), whatever the length of the line.
 *
 * TWO HALVES.
 *   1. Source. No setInterval and no per-character state in atlas-conversation.tsx; TypedMessage
 *      is memo()-wrapped and owns the interval. Cheap, and names the regression precisely.
 *   2. Runtime. Renders the REAL component in node with react-reconciler and a tiny host config,
 *      a fake setInterval and stubs for native modules, walks the worst corpus step beat by beat
 *      and counts AtlasConversation renders. The source half can be fooled by a rename; this half
 *      counts what React actually did.
 *
 *   node scripts/typewriter-leaf-pin.mjs                       check the working tree
 *   node scripts/typewriter-leaf-pin.mjs --conversation <file>  run the runtime half against
 *                                                              another copy (e.g. HEAD's) to
 *                                                              measure the before number
 */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(pathToFileURL(`${ROOT}/package.json`).href);
const ts = require('typescript');

const MAX_COMMITS_PER_BEAT = 3;
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

const argIndex = process.argv.indexOf('--conversation');
const conversationPath = argIndex > 0
  ? resolvePath(process.argv[argIndex + 1])
  : `${ROOT}/src/components/atlas-conversation.tsx`;
const measuringOtherCopy = argIndex > 0;

// ── 1. SOURCE ────────────────────────────────────────────────────────────────────────────────
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
if (!measuringOtherCopy) {
  const conversation = stripComments(readFileSync(`${ROOT}/src/components/atlas-conversation.tsx`, 'utf8'));
  const leafPath = `${ROOT}/src/components/typed-message.tsx`;
  const leaf = existsSync(leafPath) ? stripComments(readFileSync(leafPath, 'utf8')) : '';

  check(!/setInterval\s*\(/.test(conversation),
    'atlas-conversation.tsx calls setInterval: the typewriter is back in the conversation, which re-renders the whole screen per character');
  check(!/useConversationTypewriter|setTyping|\.slice\(0,\s*count\)/.test(conversation),
    'atlas-conversation.tsx carries per-character typewriter state again');
  check(/<TypedMessage\b/.test(conversation),
    'atlas-conversation.tsx no longer renders <TypedMessage>');
  check(/key=\{`typed-\$\{String\(index\)\}`\}/.test(conversation),
    '<TypedMessage> must be keyed by beat index; without it the count never resets between beats');
  check(/const ConversationProgress = memo\(/.test(conversation),
    'ConversationProgress lost its memo(); it re-renders on every conversation commit');
  check(!/<TypedMessage[^>]*style=\{\[/.test(conversation),
    'an inline style array on <TypedMessage> is a new identity each render and defeats its memo()');

  check(leaf !== '', 'src/components/typed-message.tsx is missing');
  check(/setInterval\s*\(/.test(leaf), 'typed-message.tsx does not own the typing interval');
  check(/export const TypedMessage = memo\(/.test(leaf),
    'TypedMessage is not memo()-wrapped, so every conversation commit re-renders the leaf too');
  check(/useReducedMotion\(\)/.test(leaf) && /if \(reduced \|\| finished \|\| !text\) return;/.test(leaf),
    'typed-message.tsx must skip the interval under Reduced Motion, on finish and for empty text');
  check(!/Haptics/.test(leaf),
    'the vocab typewriter never ticked; moving it into a leaf must not add haptics (atlas-speech.tsx owns the tick)');
}

// ── 2. RUNTIME ───────────────────────────────────────────────────────────────────────────────
const React = require('react');
const Reconciler = require('react-reconciler');
const { DefaultEventPriority } = require('react-reconciler/constants');
const { buildVocabConversation } = await import(pathToFileURL(`${ROOT}/src/lib/vocab-conversation.ts`).href);

const counters = { conversation: 0, scroll: 0 };
const flags = { reduced: false };
const h = React.createElement;
const passthrough = (type) => ({ children, ...props }) => h(type, props, children);
const chain = () => new Proxy(function preset() {}, { get: () => chain, apply: () => chain() });

const STUBS = {
  'react-native': {
    ScrollView: ({ children, ...props }) => { counters.scroll += 1; return h('ScrollView', props, children); },
    View: passthrough('View'),
    StyleSheet: { create: (s) => s, hairlineWidth: 1 },
  },
  'react-native-reanimated': {
    default: { View: passthrough('AnimatedView') },
    FadeIn: chain(), FadeInDown: chain(),
    useReducedMotion: () => flags.reduced,
    useSharedValue: (v) => React.useRef({ v, get() { return this.v; }, set(n) { this.v = n; } }).current,
    useAnimatedStyle: (fn) => fn(),
    withTiming: (v) => v,
  },
  'react-native-svg': { default: passthrough('Svg'), Path: passthrough('Path') },
  '@/components/atlas': { Atlas: passthrough('Atlas') },
  '@/components/lesson-step-session': { useLessonStepState: (_key, initial) => React.useState(initial) },
  '@/components/themed-text': { ThemedText: passthrough('Text') },
  '@/components/ui-icon': { UIcon: passthrough('UIcon') },
  '@/constants/theme': { Fonts: { black: 'black' }, Spacing: { three: 16 } },
  // Only AtlasConversation calls useTheme, so this counts exactly its renders.
  '@/hooks/use-theme': { useTheme: () => { counters.conversation += 1; return { success: '#00AA00', destructive: '#AA0000', mutedForeground: '#888888', text: '#FFFFFF', primary: '#A650E7' }; } },
  '@/shared/motion/spring-pressable': { SpringPressable: passthrough('Pressable') },
};
globalThis.__typewriterPinStubs = STUBS;

registerHooks({
  resolve(specifier, context, next) {
    if (Object.hasOwn(STUBS, specifier)) return { url: `stub:${specifier}`, shortCircuit: true };
    if (specifier.startsWith('@/')) {
      const base = `${ROOT}/src/${specifier.slice(2)}`;
      for (const cand of [`${base}.tsx`, `${base}.ts`, `${base}/index.ts`]) {
        if (existsSync(cand)) return { url: pathToFileURL(cand).href, shortCircuit: true };
      }
    }
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
      for (const cand of [`${base}.ts`, `${base}.tsx`]) {
        if (existsSync(cand)) return { url: pathToFileURL(cand).href, shortCircuit: true };
      }
    }
    // A .tsx outside the repo (the --conversation copy) still resolves react from the repo.
    if (context.parentURL?.startsWith('file:') && !fileURLToPath(context.parentURL).startsWith(ROOT)
      && !specifier.startsWith('.') && !specifier.startsWith('node:')) {
      return next(specifier, { ...context, parentURL: pathToFileURL(`${ROOT}/package.json`).href });
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith('stub:')) {
      const name = url.slice(5);
      const keys = Object.keys(STUBS[name]).filter((k) => k !== 'default');
      const ref = `globalThis.__typewriterPinStubs[${JSON.stringify(name)}]`;
      const source = keys.map((k) => `export const ${k} = ${ref}.${k};`).join('\n')
        + (STUBS[name].default ? `\nexport default ${ref}.default;` : '');
      return { format: 'module', source, shortCircuit: true };
    }
    if (url.endsWith('.tsx')) {
      const src = readFileSync(fileURLToPath(url), 'utf8');
      const out = ts.transpileModule(src, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return next(url, context);
  },
});

// Fake setInterval: the pin advances typing one character at a time, deterministically.
const intervals = new Map();
let nextId = 1;
globalThis.setInterval = (fn) => { const id = nextId++; intervals.set(id, fn); return id; };
globalThis.clearInterval = (id) => { intervals.delete(id); };

// A host config just big enough to mount React Native-shaped elements as plain objects.
let currentPriority = DefaultEventPriority;
const host = Reconciler({
  supportsMutation: true, isPrimaryRenderer: true, noTimeout: -1,
  scheduleTimeout: setTimeout, cancelTimeout: clearTimeout,
  getRootHostContext: () => ({}), getChildHostContext: (c) => c,
  prepareForCommit: () => null, resetAfterCommit() {},
  createInstance: (type, props) => ({ type, props, children: [] }),
  createTextInstance: (text) => ({ text }),
  appendInitialChild: (p, c) => { p.children.push(c); },
  appendChild: (p, c) => { p.children.push(c); },
  appendChildToContainer: (p, c) => { p.children.push(c); },
  insertBefore: (p, c, b) => { p.children.splice(p.children.indexOf(b), 0, c); },
  insertInContainerBefore: (p, c, b) => { p.children.splice(p.children.indexOf(b), 0, c); },
  removeChild: (p, c) => { p.children.splice(p.children.indexOf(c), 1); },
  removeChildFromContainer: (p, c) => { p.children.splice(p.children.indexOf(c), 1); },
  commitUpdate: (inst, _type, _old, props) => { inst.props = props; },
  commitTextUpdate: (inst, _old, text) => { inst.text = text; },
  finalizeInitialChildren: () => false, shouldSetTextContent: () => false,
  clearContainer: (c) => { c.children = []; }, getPublicInstance: (i) => i,
  detachDeletedInstance() {}, hideInstance() {}, unhideInstance() {}, hideTextInstance() {}, unhideTextInstance() {},
  setCurrentUpdatePriority: (p) => { currentPriority = p; },
  getCurrentUpdatePriority: () => currentPriority,
  resolveUpdatePriority: () => currentPriority || DefaultEventPriority,
  resolveEventType: () => null, resolveEventTimeStamp: () => -1.1, shouldAttemptEagerTransition: () => false,
  maySuspendCommit: () => false, preloadInstance: () => true, startSuspendingCommit() {}, suspendInstance() {},
  waitForCommitToBeReady: () => null, requestPostPaintCallback() {}, trackSchedulerEvent() {},
  NotPendingTransition: null, HostTransitionContext: React.createContext(null), resetFormInstance() {},
  prepareScopeUpdate() {}, getInstanceFromScope: () => null, getInstanceFromNode: () => null,
  beforeActiveInstanceBlur() {}, afterActiveInstanceBlur() {}, preparePortalMount() {},
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const act = (fn) => React.act(fn);

const all = (node, out = []) => { out.push(node); for (const c of node.children ?? []) all(c, out); return out; };
const textOf = (node) => (node.text ?? '') + (node.children ?? []).map(textOf).join('');
const pressable = (root, label) => all(root).find((n) => n.type === 'Pressable' && n.props.accessibilityLabel === label);

const { AtlasConversation } = await import(pathToFileURL(conversationPath).href);

// The worst step in the corpus, through the loader that actually renders.
const W = await import(pathToFileURL(`${ROOT}/src/lib/curriculum/index.ts`).href);
const { normalizeStep, expandSteps } = await import(pathToFileURL(`${ROOT}/src/lib/lesson-steps.ts`).href);
let worst = null;
const perStep = [];
for (const course of W.COURSES) {
  for (const lesson of await W.loadCourseLessons(course.id)) {
    expandSteps(lesson.steps).forEach((step, i) => {
      const norm = normalizeStep(step);
      if (norm.kind !== 'vocab') return;
      const beats = buildVocabConversation(norm.terms);
      const chars = beats.reduce((sum, b) => sum + (b.text ?? '').length, 0);
      perStep.push(chars);
      if (!worst || chars > worst.chars) worst = { chars, id: `${course.id}:${String(lesson.num)}:${String(i)}`, beats };
    });
  }
}
perStep.sort((a, b) => a - b);

async function walk({ reduced, tapAfter = null }) {
  flags.reduced = reduced;
  intervals.clear();
  const container = { children: [] };
  const root = host.createContainer(container, 1, null, false, null, '', console.error, console.error, console.error, () => {}, null);
  let finished = null;
  // The window for a beat opens just BEFORE the render that first shows it (the mount, or the
  // previous beat's Next press), so the arrival commit is counted against the beat it paints.
  let mark = counters.conversation;
  await act(async () => {
    host.updateContainer(h(AtlasConversation, { beats: worst.beats, onFinish: (s, a) => { finished = [s, a]; } }), root, null, null);
  });
  const perBeat = [];
  for (let i = 0; i < worst.beats.length; i += 1) {
    const beat = worst.beats[i];
    const text = beat.text ?? '';
    let ticks = 0;
    let sawCursor = false;
    while (intervals.size) {
      if (tapAfter !== null && ticks === tapAfter) {
        const bubble = all(container).find((n) => n.type === 'Pressable' && typeof n.props.accessibilityHint === 'string');
        await act(async () => { bubble.props.onPress(); });
        break;
      }
      await act(async () => { for (const fn of [...intervals.values()]) fn(); });
      ticks += 1;
      if (textOf(container).includes('▌')) sawCursor = true;
      if (ticks > text.length + 5) throw new Error(`beat ${String(i)} never finished typing`);
    }
    if (!reduced && tapAfter === null && text.length > 1) check(sawCursor, `beat ${String(i)} typed with no cursor`);
    check(!textOf(container).includes('▌'), `beat ${String(i)}: cursor still showing after typing finished`);
    check(textOf(container).split(text).length >= 3, `beat ${String(i)}: the full line is not painted after typing`);
    if (beat.kind === 'ask') {
      const option = pressable(container, beat.options[beat.correct]);
      check(Boolean(option), `beat ${String(i)}: options did not appear once typing finished`);
      if (option) await act(async () => { option.props.onPress(); });
    }
    const label = beat.kind === 'say' && beat.cta ? beat.cta : i + 1 === worst.beats.length ? 'Finish' : 'Next';
    const next = pressable(container, label);
    check(Boolean(next), `beat ${String(i)}: "${label}" did not appear once the beat was done`);
    const commits = counters.conversation - mark;
    perBeat.push({ i, kind: beat.kind, chars: text.length, commits });
    if (!next) break;
    mark = counters.conversation;
    await act(async () => { next.props.onPress(); });
  }
  check(Array.isArray(finished), 'walking every beat did not finish the conversation');
  return perBeat;
}

// Commits per beat counts from the render that FIRST shows the beat (the Next press of the one
// before) to the moment its own Next is on screen, including an answer pick for asks.
const normal = await walk({ reduced: false });
const tapped = await walk({ reduced: false, tapAfter: 5 });
const reducedRun = await walk({ reduced: true });

const worstBeat = normal.reduce((a, b) => (b.commits > a.commits ? b : a));
const longest = normal.reduce((a, b) => (b.chars > a.chars ? b : a));
for (const [name, run] of [['typing', normal], ['tap to finish', tapped], ['Reduced Motion', reducedRun]]) {
  for (const beat of run) {
    check(beat.commits <= MAX_COMMITS_PER_BEAT,
      `${name}: beat ${String(beat.i)} (${beat.kind}, ${String(beat.chars)} chars) cost ${String(beat.commits)} AtlasConversation commits; the cap is ${String(MAX_COMMITS_PER_BEAT)} whatever the line length`);
  }
}

console.log(`corpus: ${String(perStep.length)} vocab steps, median ${String(perStep[perStep.length >> 1])} typed chars per step, worst ${worst.id} at ${String(worst.chars)} over ${String(worst.beats.length)} beats`);
console.log(`typing: worst beat ${String(worstBeat.i)} = ${String(worstBeat.commits)} commits; longest line (${String(longest.chars)} chars) = ${String(longest.commits)} commits; step total ${String(normal.reduce((s, b) => s + b.commits, 0))}`);
console.log(`tap to finish: max ${String(Math.max(...tapped.map((b) => b.commits)))} commits per beat; Reduced Motion: max ${String(Math.max(...reducedRun.map((b) => b.commits)))}`);

if (failures.length) {
  const shown = [...new Set(failures)];
  console.error(`FAIL typewriter-leaf-pin, ${String(shown.length)} problem(s):\n  - ${shown.slice(0, 12).join('\n  - ')}`);
  process.exit(1);
}
console.log(`PASS typewriter-leaf-pin: the typewriter is a memoised leaf and AtlasConversation commits at most ${String(MAX_COMMITS_PER_BEAT)} times per beat, not once per character`);
