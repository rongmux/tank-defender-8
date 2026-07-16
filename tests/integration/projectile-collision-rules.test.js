const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.projectileCollisionRules, "projectile collision rules module should register before game.js");
assert.equal(Object.isFrozen(modules.projectileCollisionRules), true);
assert.equal(modules.projectileCollisionRules.DEFAULT_PROJECTILE_COLLISION_THRESHOLD, 6);

const crossing = JSON.parse(JSON.stringify(api.debugCrossingBulletCancelProbe()));
assert.equal(crossing.speed, 6);
assert.equal(crossing.remainingBullets, 2);
assert.deepEqual(crossing.crossingPositions, [{ x: 46, y: 80 }, { x: 40, y: 80 }]);
assert.equal(crossing.thresholdFiveCanceled, true);
assert.equal(crossing.thresholdSixCanceled, false);
assert.equal(crossing.sameOwnerCanceled, false);
assert.equal(crossing.explosionCount, 0);

console.log("projectile-collision-rules integration test passed");
