const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const api = context.window.TankDefender8;

const terrain = api.debugTerrainCollisionProbe();
assert.equal(terrain.water.tankCanOccupy, false, "water should block tanks");
assert.equal(terrain.water.bulletRemoved, false, "water should not block bullets");
assert.equal(terrain.forest.tankCanOccupy, true, "forest should not block tanks");
assert.equal(terrain.forest.bulletRemoved, false, "forest should not block bullets");
assert.equal(terrain.ice.tankCanOccupy, true, "ice should not block tanks");
assert.equal(terrain.ice.bulletRemoved, false, "ice should not block bullets");

const tank = api.debugTankCollisionProbe();
assert.equal(tank.enemyBlocks, true, "enemy tanks should physically block player movement");
assert.equal(tank.teammateBlocks, true, "teammate tanks should physically block player movement");
assert.equal(tank.movingAwayFromEnemyAllowed, true, "blocked tanks should still be able to move away from the collision");

const recovery = api.debugEnemyOverlapRecoveryProbe();
assert.equal(recovery.startOverlapArea, 84, "enemy overlap recovery should begin with intersecting boxes");
assert.equal(recovery.firstTick.x, 41);
assert.equal(recovery.firstTick.overlapArea, 70, "the first recovery movement should reduce overlap immediately");
assert.equal(recovery.firstTick.blockedPauseTicks, 0);
assert.equal(recovery.firstTick.pendingTurn, false, "overlap recovery should clear stale blocked movement state");
assert.equal(recovery.finalX, 46);
assert.equal(recovery.finalOverlapArea, 0, "overlapping enemies should fully separate");
assert.equal(recovery.contactMoveBlocked, true, "separated enemies should not be allowed to overlap again");

console.log("collision integration test passed");
