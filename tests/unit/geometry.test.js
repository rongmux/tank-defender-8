const assert = require("assert").strict;
const { clamp, rectOverlapArea, rectsOverlap } = require("../../src/core/geometry");

assert.equal(clamp(-2, 0, 10), 0);
assert.equal(clamp(5, 0, 10), 5);
assert.equal(clamp(12, 0, 10), 10);

const origin = { x: 0, y: 0, w: 14, h: 14 };
const partial = { x: 8, y: 7, w: 14, h: 14 };
const contained = { x: 2, y: 3, w: 4, h: 5 };
const touching = { x: 14, y: 0, w: 14, h: 14 };
const separate = { x: -20, y: -20, w: 4, h: 4 };

assert.equal(rectsOverlap(origin, partial), true);
assert.equal(rectOverlapArea(origin, partial), 42);
assert.equal(rectsOverlap(origin, contained), true);
assert.equal(rectOverlapArea(origin, contained), 20);
assert.equal(rectsOverlap(origin, touching), false, "edge contact must not count as tank overlap");
assert.equal(rectOverlapArea(origin, touching), 0);
assert.equal(rectsOverlap(origin, separate), false);
assert.equal(rectOverlapArea(origin, separate), 0);

console.log("geometry unit test passed");
