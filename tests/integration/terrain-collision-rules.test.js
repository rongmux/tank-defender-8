const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.terrainCollisionRules, "terrain collision rules module should register before game.js");
assert.equal(Object.isFrozen(modules.terrainCollisionRules), true);

const terrain = JSON.parse(JSON.stringify(api.debugTerrainCollisionProbe()));
assert.equal(terrain.water.tankCanOccupy, false);
assert.equal(terrain.water.bulletRemoved, false);
assert.equal(terrain.forest.tankCanOccupy, true);
assert.equal(terrain.forest.bulletRemoved, false);
assert.equal(terrain.ice.tankCanOccupy, true);
assert.equal(terrain.ice.bulletRemoved, false);

const brick = JSON.parse(JSON.stringify(api.debugBrickWallPowerProbe()));
assert.equal(brick.removedStripHit, 0);
assert.notEqual(brick.remainingStripHit, 0);
assert.equal(brick.removedStripSolid, false);
assert.equal(brick.remainingStripSolid, true);

const recovery = JSON.parse(JSON.stringify(api.debugPlayerBrickRecoveryProbe()));
assert.equal(recovery.blockedTurnSnap.before.overlap, 0);
assert.deepEqual(recovery.blockedTurnSnap.after, {
  x: 69,
  y: 71,
  dir: 2,
  overlap: 0
});
assert.deepEqual(recovery.restoredWallEscape.overlapHistory, [84, 70, 56, 42, 28, 14, 0]);
assert.equal(recovery.restoredWallEscape.x, 96);
assert.equal(recovery.restoredWallEscape.y, 177);

console.log("terrain-collision-rules integration test passed");
