#!/usr/bin/env node
/**
 * Games cards must either navigate or explain their unavailable state when pressed.
 *
 * A card with normal styling and no route looks like a broken tap target. App Review sees that as
 * unfinished UI, and users see it as the app ignoring them.
 */
import { readFileSync } from 'node:fs';

const fail = (msg) => {
  console.error(`[game-card-readiness-pin] ${msg}`);
  process.exit(1);
};

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function gamesArray(code) {
  const src = stripComments(code);
  const start = src.indexOf('const GAMES');
  if (start === -1) return '';
  const equals = src.indexOf('=', start);
  if (equals === -1) return '';
  const open = src.indexOf('[', equals);
  if (open === -1) return '';
  let depth = 0;
  let quote = null;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const prev = src[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  return '';
}

function entries(arrayText) {
  return [...arrayText.matchAll(/\{[^{}]*name:\s*['"]([^'"]+)['"][^{}]*\}/g)].map((m) => ({
    name: m[1],
    body: m[0],
  }));
}

function findings(src) {
  const code = stripComments(src);
  const games = entries(gamesArray(src));
  const dead = games
    .filter((g) => !/\broute\s*:/.test(g.body))
    .filter((g) => !/\bpro\s*:\s*true\b/.test(g.body))
    .filter((g) => !/\bcomingSoon\s*:\s*true\b/.test(g.body))
    .map((g) => g.name);

  return {
    gamesFound: games.length,
    dead,
    disablesComingSoon: /disabled=\{\s*!!g\.pro\s*\|\|\s*!!g\.comingSoon\s*\}/.test(code),
    explainsInactiveTap: /Alert\.alert\s*\(/.test(code),
    rendersSoon: /g\.comingSoon[\s\S]*Soon/.test(code),
  };
}

function selftest() {
  const good = `
    const GAMES = [
      { name: 'Playable', sprite: lightbulb, route: '/games/playable' },
      { name: 'Locked', sprite: lightbulb, pro: true },
      { name: 'Soon Tile', sprite: lightbulb, comingSoon: true },
    ];
    <SpringPressable onPress={() => Alert.alert(g.name, 'Not playable yet')}>{g.comingSoon && <Text>Soon</Text>}</SpringPressable>
  `;
  const ok = findings(good);
  if (ok.gamesFound !== 3 || ok.dead.length || ok.disablesComingSoon || !ok.explainsInactiveTap || !ok.rendersSoon) {
    throw new Error('selftest: good fixture did not pass');
  }

  const bad = findings(good.replace("{ name: 'Soon Tile', sprite: lightbulb, comingSoon: true }", "{ name: 'Soon Tile', sprite: lightbulb }"));
  if (!bad.dead.includes('Soon Tile')) throw new Error('selftest: dead route-less card slipped through');
}

selftest();

const result = findings(readFileSync('src/app/(tabs)/games.tsx', 'utf8'));
if (result.gamesFound < 6) fail(`only found ${String(result.gamesFound)} game entries; parser likely drifted`);
if (result.dead.length > 0) fail(`route-less cards need pro: true or comingSoon: true: ${result.dead.join(', ')}`);
if (result.disablesComingSoon) fail('comingSoon cards must answer taps instead of silently disabling them');
if (!result.explainsInactiveTap) fail('route-less cards must explain their state when tapped');
if (!result.rendersSoon) fail('comingSoon cards must render visible "Soon" copy');

console.log('[game-card-readiness-pin] ok');
