/**
 * BUDGET BALANCER — pure game logic, no React, no rendering.
 *
 * A LEVER, NOT A FORM. Three budget proposals were rejected on this project in one word for being
 * "a form you fill in": if the player is CATEGORISING things, it is a quiz, and Term Match already
 * occupies the quiz slot. So the player never sorts anything here. They slide one weight along a
 * beam and fight physics.
 *
 * WHY A LEVER TEACHES THE THING. Torque is weight times DISTANCE, so where a cost sits on the arm
 * matters as much as what it costs:
 *
 *   - VARIABLE costs (coffee, takeout, a rideshare) land CLOSE to the pivot. Small torque. You can
 *     out-lean them, and holding the beam level clears them — that is what "cutting back" feels
 *     like from the inside.
 *   - FIXED costs (rent, a phone plan, insurance) land FAR OUT. Large torque for the same money,
 *     and they NEVER clear. You signed for them.
 *
 * So the arc is not difficulty ramping for its own sake: every run ends the same way, with fixed
 * commitments you cannot lift outweighing an income you can only move so far. A player feels
 * "my fixed costs are the problem, not my coffee" long before they could say it. That is the same
 * design rule money-2048.ts follows — the finance is in the mechanic's SHAPE, not in questions
 * bolted onto it.
 *
 * SEPARATED FROM THE SCREEN ON PURPOSE, like money-2048.ts and trend-game.ts. Every rule below is
 * testable without mounting anything, and the dev block at the bottom does test them.
 */

/** Same PRNG as money-2048.ts and trend-game.ts. Never Math.random: a run must be replayable. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Kind = 'fixed' | 'variable';
export type Cost = { id: number; kind: Kind; label: string; weight: number; dist: number };

export type State = {
  /** Learner difficulty retained for every spawn in this run. */
  phase: number;
  /** Beam angle in radians. Positive means the cost side has won. */
  angle: number;
  vel: number;
  /** Where the player's income sits on their arm, 0 (at the pivot, useless) to 1 (full leverage). */
  incomeDist: number;
  costs: Cost[];
  /** Milliseconds the beam has been continuously inside LEVEL_TOL. */
  holdMs: number;
  elapsedMs: number;
  nextSpawnMs: number;
  score: number;
  cleared: number;
  over: boolean;
  seq: number;
  rand: () => number;
  /** Set for one frame when a cost clears, so the screen can fly a reward off it. */
  justCleared: { label: string; points: number } | null;
};

/** The player's total income. Fixed: the only lever is WHERE you apply it. */
export const INCOME_W = 6;
/** Past this the beam has tipped and the run is over. ~24 degrees. */
export const MAX_ANGLE = 0.42;
/** Inside this the beam counts as level. ~4 degrees. */
export const LEVEL_TOL = 0.07;
/** How long you must hold level before a variable cost clears. */
export const HOLD_MS = 900;
/** Beam sluggishness. Higher is slower to respond, which is what makes timing matter. */
const INERTIA = 2.6;
/** Without damping the beam oscillates forever and the game is unplayable rather than hard. */
const DAMP = 1.9;

const FIXED_LABELS = ['Rent', 'Phone plan', 'Insurance', 'Loan payment', 'Subscription'];
const VARIABLE_LABELS = ['Coffee', 'Takeout', 'Rideshare', 'New shoes', 'Movie night', 'Snacks'];

/**
 * Difficulty changes the PRESSURE, never the rules — the same constraint trend-game.ts documents.
 * A harder start must not be a different game, so only the spawn interval and the share of fixed
 * costs move. Torque, tolerance and hold time are identical at every phase.
 */
export function tuning(phase: number): { spawnMs: number; fixedChance: number; startFixed: number } {
  const p = Math.max(0, Math.min(3, phase));
  /*
   * ONE FIXED COST AT THE START, for everybody. Two random fixed torques before the first input cut
   * perfect-controller survival almost in half for practised learners; that is a difficulty cliff,
   * not a test of balance. Later pressure still scales gradually through cadence and fixed share.
   */
  return { spawnMs: 3400 - p * 100, fixedChance: 0.16 + p * 0.015, startFixed: 1 };
}

function makeCost(seq: number, kind: Kind, rand: () => number): Cost {
  const pool = kind === 'fixed' ? FIXED_LABELS : VARIABLE_LABELS;
  const label = pool[Math.floor(rand() * pool.length)] ?? pool[0]!;
  // The whole lesson lives in these two ranges. Fixed costs sit far out and hit harder for the
  // same money; variable costs sit close in and can be leaned against.
  const dist = kind === 'fixed' ? 0.7 + rand() * 0.3 : 0.2 + rand() * 0.3;
  const weight = kind === 'fixed' ? 0.8 + rand() * 0.8 : 0.6 + rand() * 0.8;
  return { id: seq, kind, label, weight, dist };
}

export function createGame(seed: number, phase = 0): State {
  const rand = rng(seed);
  const t = tuning(phase);
  const s: State = {
    phase: Math.max(0, Math.min(3, phase)),
    angle: 0, vel: 0, incomeDist: 0.5, costs: [], holdMs: 0, elapsedMs: 0,
    nextSpawnMs: t.spawnMs, score: 0, cleared: 0, over: false, seq: 0, rand, justCleared: null,
  };
  for (let i = 0; i < t.startFixed; i++) s.costs.push(makeCost(s.seq++, 'fixed', rand));
  /*
   * START LEVEL. This began at a flat 0.5, which is 3.0 of income torque against an opening fixed
   * cost worth at most 1.6 — so the beam tipped to the INCOME side and the run was over before the
   * player could touch anything. Found by opening the game on device, not by the assertions: they
   * tested every rule except the one that says a new game is playable. There is now an assertion
   * for it below.
   */
  s.incomeDist = Math.max(0, Math.min(1, balancePoint(s.costs)));
  return s;
}

/** Total torque the costs apply. Weight TIMES distance — the point of the whole game. */
export const costTorque = (costs: Cost[]): number => costs.reduce((a, c) => a + c.weight * c.dist, 0);
/** Torque the player is applying back. */
export const incomeTorque = (s: State): number => INCOME_W * s.incomeDist;
/** Where income would have to sit to balance exactly. Above 1 means this load cannot be held. */
export const balancePoint = (costs: Cost[]): number => costTorque(costs) / INCOME_W;

/**
 * One frame. PURE: returns a new state and never mutates the one it is given, so a replay from a
 * seed plus the same inputs reproduces a run exactly.
 *
 * `inputDist` is the player's thumb, clamped here rather than at the call site so no screen can
 * hand the engine leverage the game does not have.
 */
export function step(prev: State, dtMs: number, inputDist: number): State {
  if (prev.over) return prev.justCleared ? { ...prev, justCleared: null } : prev;

  const s: State = { ...prev, costs: prev.costs.slice(), justCleared: null };
  s.incomeDist = Math.max(0, Math.min(1, inputDist));

  const dt = Math.min(dtMs, 50) / 1000; // clamp: a stalled frame must not teleport the beam
  const net = costTorque(s.costs) - incomeTorque(s);
  s.vel += (net / INERTIA) * dt;
  s.vel -= s.vel * DAMP * dt;
  s.angle += s.vel * dt;
  s.elapsedMs += dtMs;

  if (Math.abs(s.angle) <= LEVEL_TOL) {
    s.holdMs += dtMs;
    if (s.holdMs >= HOLD_MS) {
      // Only VARIABLE costs clear. A fixed cost is a commitment; being disciplined this month does
      // not cancel your rent, and a game that let it would teach the opposite of the truth.
      const i = s.costs.findIndex((c) => c.kind === 'variable');
      if (i >= 0) {
        const c = s.costs[i]!;
        const points = Math.round(c.weight * c.dist * 100);
        s.costs.splice(i, 1);
        s.score += points;
        s.cleared += 1;
        s.justCleared = { label: c.label, points };
      }
      s.holdMs = 0;
    }
  } else {
    // RESETS, not pauses. Otherwise a player could tap through tolerance repeatedly and bank hold
    // time they never actually held, which is the cheapest way to make a skill game skill-free.
    s.holdMs = 0;
  }

  if (s.elapsedMs >= s.nextSpawnMs) {
    // Difficulty belongs to the RUN. This used to call tuning(0), silently discarding the phase
    // after the initial board and making the adaptive contract false for every later spawn.
    const t = tuning(s.phase);
    const kind: Kind = s.rand() < t.fixedChance ? 'fixed' : 'variable';
    s.costs.push(makeCost(s.seq++, kind, s.rand));
    s.nextSpawnMs = s.elapsedMs + t.spawnMs;
  }

  if (Math.abs(s.angle) > MAX_ANGLE) s.over = true;
  return s;
}

if (__DEV__) {
  const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;
  const bad = (cond: boolean, msg: string) => { if (cond) console.error(`budget-balancer: ${msg}`); };

  // ── TORQUE IS WEIGHT TIMES DISTANCE ───────────────────────────────────────────────────────
  // The wrong version of this game sums weights and ignores distance, which erases the entire
  // fixed-vs-variable lesson: a $3 coffee and a $3 slice of rent would cost the same to hold.
  const far = [{ id: 0, kind: 'fixed' as Kind, label: 'Rent', weight: 1, dist: 0.9 }];
  const near_ = [{ id: 1, kind: 'variable' as Kind, label: 'Coffee', weight: 1, dist: 0.3 }];
  bad(!(costTorque(far) > costTorque(near_)), 'same weight further out must cost more torque');
  bad(!near(costTorque(far), 0.9), 'torque must be weight * distance');
  // ...and a HEAVIER cost close in can still be cheaper to hold than a light one far out.
  const heavyClose = [{ id: 2, kind: 'variable' as Kind, label: 'Shoes', weight: 2, dist: 0.3 }];
  const lightFar = [{ id: 3, kind: 'fixed' as Kind, label: 'Rent', weight: 1, dist: 0.95 }];
  bad(!(costTorque(heavyClose) < costTorque(lightFar) * 1.6), 'distance must be able to beat weight');

  // ── ONLY VARIABLE COSTS CLEAR ─────────────────────────────────────────────────────────────
  let s = createGame(7, 0);
  s = { ...s, costs: [{ id: 9, kind: 'fixed', label: 'Rent', weight: 1, dist: 0.8 }], angle: 0, vel: 0 };
  let held = step(s, HOLD_MS, balancePoint(s.costs));
  bad(held.costs.length !== 1, 'a fixed cost must never clear');
  bad(held.cleared !== 0, 'clearing a fixed cost must not score');

  s = createGame(7, 0);
  s = { ...s, costs: [{ id: 10, kind: 'variable', label: 'Coffee', weight: 1, dist: 0.4 }], angle: 0, vel: 0 };
  held = step(s, HOLD_MS, balancePoint(s.costs));
  bad(held.costs.length !== 0, 'a variable cost must clear after a full hold');
  bad(held.score <= 0, 'clearing must score');
  bad(held.justCleared === null, 'clearing must be announced for one frame');

  // ── A PARTIAL HOLD MUST NOT CLEAR, AND MUST NOT BANK ──────────────────────────────────────
  s = createGame(7, 0);
  s = { ...s, costs: [{ id: 11, kind: 'variable', label: 'Coffee', weight: 1, dist: 0.4 }], angle: 0, vel: 0 };
  const halfA = step(s, HOLD_MS / 2, balancePoint(s.costs));
  bad(halfA.costs.length !== 1, 'half a hold must not clear');
  const away = step({ ...halfA, angle: MAX_ANGLE / 2, vel: 0 }, 16, 0.5);
  bad(away.holdMs !== 0, 'leaving tolerance must RESET the hold, not pause it');

  // ── GAME OVER IS ABSORBING ────────────────────────────────────────────────────────────────
  const dead = step({ ...createGame(3, 0), angle: MAX_ANGLE + 0.1, over: true, score: 42 }, 16, 1);
  bad(dead.score !== 42, 'a finished run must not keep scoring');
  bad(!dead.over, 'game over must not un-set itself');

  // ── A NEW GAME MUST START LEVEL ───────────────────────────────────────────────────────────
  // The run must not be decided before the first frame. This is the assertion that was missing:
  // every rule was tested except "is it playable at t=0", and the game shipped unplayable to a
  // device because of it.
  for (let seed = 1; seed <= 120; seed++) {
    for (let ph = 0; ph <= 3; ph++) {
      const g0 = createGame(seed, ph);
      bad(g0.phase !== ph, `seed ${seed} forgot phase ${ph}`);
      bad(Math.abs(costTorque(g0.costs) - incomeTorque(g0)) > 1e-9,
        `seed ${seed} phase ${ph} does not start level`);
      const first = step(g0, 16, g0.incomeDist);
      bad(first.over, `seed ${seed} phase ${ph} is over on the first frame`);
    }
  }

  // ── SKILL MUST BEAT NOISE: a fresh load has to be holdable ────────────────────────────────
  // trend-game.ts shipped a version where the random term outvoted the signal, and a correct read
  // still lost. The equivalent here is a start the player cannot balance at any thumb position.
  for (let seed = 1; seed <= 200; seed++) {
    const g = createGame(seed, 3);
    bad(balancePoint(g.costs) > 1, `seed ${seed} phase 3 starts unbalanceable`);
  }

  // ── DETERMINISM ───────────────────────────────────────────────────────────────────────────
  const runOnce = (): number => {
    let g = createGame(99, 1);
    for (let i = 0; i < 400; i++) g = step(g, 16, (i % 40) / 40);
    return g.score * 1000 + g.costs.length;
  };
  bad(runOnce() !== runOnce(), 'same seed and same inputs must reproduce a run exactly');

  // ── INPUT IS CLAMPED IN THE ENGINE ────────────────────────────────────────────────────────
  const cheat = step(createGame(5, 0), 16, 99);
  bad(cheat.incomeDist !== 1, 'the engine must clamp leverage, not trust the screen');
}
