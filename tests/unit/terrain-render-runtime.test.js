const assert = require("assert").strict;
const runtime = require("../../src/runtime/terrain-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupTerrainRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    }
  },
  game: {
    frameLow: 0,
    base: { x: 32, y: 48, alive: true }
  },
  fn: {}
};
const deps = {
  sharedState: {
    SCREEN_W: 64,
    SCREEN_H: 64,
    TILE: 16,
    HALF: 8,
    GRID: 2,
    FIELD_X: 4,
    FIELD_Y: 8,
    FIELD_W: 32,
    FIELD_H: 32
  },
  BRICK: "brick",
  STEEL: "steel",
  WATER: "water",
  FOREST: "forest",
  ICE: "ice",
  BRICK_QUARTER_FRAGMENT_MASKS: [0xff, 0xff, 0xff, 0xff],
  WALL_FRAGMENT: 4
};
const callbacks = {
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  normalizeBrickFragmentMask() {
    return 0xffff;
  },
  quarterMaskFromBrickFragments() {
    return 0xf;
  }
};
const api = runtime.setupTerrainRenderRuntime(state, deps, callbacks);

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "drawBrickCell",
  "drawForest",
  "drawIce",
  "drawIceProjectileCover",
  "drawWallCell",
  "drawWater",
  "renderBase",
  "renderGameBackdrop",
  "renderProjectileTerrainCover",
  "renderTerrain",
  "waterFrameName"
]);
assert.equal(state.fn.renderTerrain, api.renderTerrain);
assert.equal(api.waterFrameName(0), "waterA");
assert.equal(api.waterFrameName(32), "waterB");

const grid = [
  [{ type: "brick", mask: 15 }, { type: "steel", mask: 1 }],
  [{ type: "water", mask: 15 }, { type: "ice", mask: 15 }]
];
api.renderTerrain(false, grid);
assert(calls.some((call) => call[0] === "sprite" && call[1] === "wallQuarter" && call[2] === "brick"));
assert(calls.some((call) => call[0] === "sprite" && call[1] === "wallQuarter" && call[2] === "steel"));
assert(calls.some((call) => call[0] === "sprite" && call[1] === "terrain" && call[2] === "waterA"));
assert(calls.some((call) => call[0] === "sprite" && call[1] === "terrain" && call[2] === "ice"));

calls.length = 0;
api.renderTerrain(true, [
  [{ type: "forest" }, { type: "water" }],
  [{ type: "empty" }, { type: "forest" }]
]);
assert.equal(calls.filter((call) => call[0] === "sprite" && call[1] === "terrain" && call[2] === "forest").length, 2);

calls.length = 0;
api.renderGameBackdrop(grid);
assert.deepEqual(calls.slice(0, 2), [
  ["fillRect", 0, 0, 64, 64],
  ["fillRect", 4, 8, 32, 32]
]);

calls.length = 0;
api.renderProjectileTerrainCover(grid);
assert.deepEqual(calls, [
  ["fillRect", 22, 26, 10, 1],
  ["fillRect", 24, 31, 9, 1],
  ["fillRect", 21, 38, 14, 1]
]);

calls.length = 0;
api.renderBase();
assert.deepEqual(calls[0], [
  "sprite", "base", "alive", 36, 56,
  { primary: "#d8c17a", shadow: "#181818" }
]);

console.log("terrain-render-runtime unit test passed");
