import assert from "node:assert/strict";

import { chartCoordinates, coordinatePath } from "../src/lib/chart-motion.ts";

const short = [
  { t: 1, c: 100 },
  { t: 2, c: 112 },
  { t: 3, c: 104 },
];
const long = Array.from({ length: 137 }, (_, index) => ({
  t: index,
  c: 90 + Math.sin(index / 9) * 8 + index * 0.08,
}));

const shortCoordinates = chartCoordinates(short, 320, 120);
const longCoordinates = chartCoordinates(long, 320, 120);

assert.equal(
  shortCoordinates.length,
  64,
  "short provider series is resampled to the motion contract",
);
assert.equal(
  longCoordinates.length,
  64,
  "long provider series is resampled to the same motion contract",
);
assert.equal(shortCoordinates[0].x, 0, "path starts at the left edge");
assert.equal(shortCoordinates.at(-1)?.x, 320, "path ends at the right edge");
assert.ok(
  shortCoordinates.every(
    ({ x, y }) => Number.isFinite(x) && Number.isFinite(y),
  ),
  "coordinates stay finite",
);
assert.equal(
  coordinatePath(shortCoordinates).split("L").length,
  coordinatePath(longCoordinates).split("L").length,
  "every range emits an interpolatable command structure",
);

const flat = chartCoordinates(
  [
    { t: 1, c: 42 },
    { t: 2, c: 42 },
  ],
  320,
  120,
);
assert.ok(
  flat.every(({ y }) => y === 60),
  "flat markets render at the vertical midpoint",
);
assert.match(
  coordinatePath(shortCoordinates, 120),
  /L320\.00 120 L0 120 Z$/,
  "area closes against the baseline",
);

console.log("chart-motion regression passed");
