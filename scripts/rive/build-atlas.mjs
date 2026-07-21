/**
 * Headless Atlas .riv pipeline — drives the rivemcp/Polymation binary over stdio MCP.
 * Builds the Atlas scene from a spec, validates it in the REAL Rive runtime, and only
 * writes assets/atlas.riv when run with --export (to conserve free-trial exports).
 *
 *   node scripts/rive/build-atlas.mjs           # build + validate in-memory (no file written)
 *   node scripts/rive/build-atlas.mjs --export  # also export_riv -> assets/atlas.riv
 *
 * ponytail: one script = the whole pipeline. Grow SPEC to add reactions; re-run to regenerate.
 */
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BIN = path.join(ROOT, 'node_modules/rivemcp/bin/rivemcp');
const BODY_PNG = path.join(ROOT, 'assets/images/atlas-logo.png');
const OUT = path.join(ROOT, 'assets/atlas.riv');
const DO_EXPORT = process.argv.includes('--export');

// ---- minimal MCP stdio client ----
const child = spawn(BIN, [], { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '', nextId = 100;
const pending = new Map();
child.stdout.on('data', (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  }
});
child.stderr.on('data', (d) => process.stderr.write('  [srv] ' + d));
const rpc = (method, params) => new Promise((res) => { const id = ++nextId; pending.set(id, res); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
async function call(tool, args = {}) {
  const m = await rpc('tools/call', { name: tool, arguments: args });
  const txt = m.result?.content?.[0]?.text ?? JSON.stringify(m.result ?? m.error);
  const isErr = m.error || m.result?.isError;
  console.log(`${isErr ? '✗' : '✓'} ${tool}${args.name ? ' ' + args.name : ''}: ${String(txt).slice(0, 120).replace(/\n/g, ' ')}`);
  return { ok: !isErr, txt };
}

const AB = 'Atlas';
// eye geometry (artboard 500x500) — centers + radii from the working rig
const EYES = [
  { n: 'EyeWhiteL', x: 204.4, y: 173.5, r: 39, fill: '#FFFFFF', stroke: '#1A1523', sw: 6.6 },
  { n: 'EyeWhiteR', x: 283.6, y: 169, r: 35.4, fill: '#FFFFFF', stroke: '#1A1523', sw: 6.6 },
  { n: 'PupilL', x: 209.5, y: 168.4, r: 19.8, fill: '#1A1523' },
  { n: 'PupilR', x: 278.5, y: 164.8, r: 18, fill: '#1A1523' },
  { n: 'HighlightL', x: 202, y: 160.6, r: 6.6, fill: '#FFFFFF' },
  { n: 'HighlightR', x: 271.6, y: 158.2, r: 6, fill: '#FFFFFF' },
];
const BLINKERS = ['EyeWhiteL', 'EyeWhiteR', 'PupilL', 'PupilR', 'HighlightL', 'HighlightR'];

async function main() {
  await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'euphoria-atlas', version: '1' } });
  await rpc('notifications/initialized', {});

  await call('create_project');
  await call('create_artboard', { name: AB, width: 500, height: 500 });

  // body (embedded PNG)
  await call('add_image_asset', { name: 'body', filePath: BODY_PNG });
  await call('add_image', { artboard: AB, name: 'Body', assetName: 'body', x: 250, y: 250, originX: 0.5, originY: 0.5, scaleX: 1.2146, scaleY: 1.2146 });

  // eyes (whites -> pupils -> highlights draw on top of body)
  for (const e of EYES) {
    await call('add_ellipse', { artboard: AB, name: e.n, x: e.x, y: e.y, width: e.r * 2, height: e.r * 2 });
    await call('set_fill', { artboard: AB, shape: e.n, color: e.fill });
    if (e.stroke) await call('set_stroke', { artboard: AB, shape: e.n, color: e.stroke, thickness: e.sw });
  }

  // Idle: breathing (body) + blink (eyes), looping
  await call('create_animation', { artboard: AB, name: 'Idle', fps: 60, duration: 144, loop: 1 });
  for (const p of ['scaleX', 'scaleY']) {
    await call('add_keyframe', { animation: 'Idle', artboard: AB, objectName: 'Body', propertyName: p, keyframes: [{ frame: 0, value: 1.2146 }, { frame: 72, value: 1.251 }, { frame: 144, value: 1.2146 }] });
  }
  for (const n of BLINKERS) {
    await call('add_keyframe', { animation: 'Idle', artboard: AB, objectName: n, propertyName: 'scaleY', keyframes: [{ frame: 108, value: 1 }, { frame: 112, value: 0.08 }, { frame: 116, value: 1 }] });
  }

  // Celebrate: elastic scale pop, one-shot
  await call('create_animation', { artboard: AB, name: 'Celebrate', fps: 60, duration: 42, loop: 0 });
  for (const p of ['scaleX', 'scaleY']) {
    await call('add_keyframe', { animation: 'Celebrate', artboard: AB, objectName: 'Body', propertyName: p, keyframes: [{ frame: 0, value: 1.2146 }, { frame: 6, value: 1.55 }, { frame: 42, value: 1.2146 }] });
  }

  // State machine: Idle <-> Celebrate on classic trigger
  const SM = 'State Machine 1';
  await call('create_state_machine', { artboard: AB, name: SM });
  await call('add_trigger', { stateMachine: SM, artboard: AB, name: 'celebrate' });
  await call('add_state', { stateMachine: SM, artboard: AB, animationName: 'Idle' });
  await call('add_state', { stateMachine: SM, artboard: AB, animationName: 'Celebrate' });
  await call('add_transition', { stateMachine: SM, artboard: AB, from: 'entry', to: 'Idle' });
  await call('add_transition', { stateMachine: SM, artboard: AB, from: 'Idle', to: 'Celebrate', when: 'onCondition', conditionInputName: 'celebrate' });
  await call('add_transition', { stateMachine: SM, artboard: AB, from: 'Celebrate', to: 'Idle', when: 'atEnd' });

  // ---- validate in-memory (no trial export consumed) ----
  console.log('\n--- validation ---');
  await call('list_objects', {});
  await call('validate_riv_structural', {});
  await call('lint_animations', {});
  await call('simulate_state_machine', { stateMachine: SM, steps: [{ fire: 'celebrate' }, { advanceSeconds: 0.8 }] });
  await call('export_riv', { path: OUT, dryRun: true });

  if (DO_EXPORT) {
    console.log('\n--- REAL EXPORT ---');
    await call('export_riv', { path: OUT });
  } else {
    console.log('\n(dry run only — pass --export to write ' + OUT + ')');
  }

  child.kill();
  process.exit(0);
}
main().catch((e) => { console.error(e); child.kill(); process.exit(1); });
setTimeout(() => { console.error('TIMEOUT'); child.kill(); process.exit(1); }, 120000);
