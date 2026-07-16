const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.tankCollisionRules, "tank collision rules module should register before game.js");
assert.equal(Object.isFrozen(modules.tankCollisionRules), true);

const tank = JSON.parse(JSON.stringify(api.debugTankCollisionProbe()));
assert.equal(tank.enemyBlocks, true);
assert.equal(tank.teammateBlocks, true);
assert.equal(tank.movingAwayFromEnemyAllowed, true);
assert.equal(tank.finalX, 32);

const recovery = JSON.parse(JSON.stringify(api.debugEnemyOverlapRecoveryProbe()));
assert.equal(recovery.startOverlapArea, 84);
assert.equal(recovery.firstTick.overlapArea, 70);
assert.equal(recovery.finalOverlapArea, 0);
assert.equal(recovery.contactMoveBlocked, true);

const enemyBullet = JSON.parse(JSON.stringify(api.debugEnemyBulletPlayerCollisionProbe()));
assert.equal(enemyBullet.positiveNine.bulletRemoved, true);
assert.equal(enemyBullet.negativeNine.bulletRemoved, true);
assert.equal(enemyBullet.positiveTen.bulletRemoved, false);
assert.equal(enemyBullet.negativeTen.bulletRemoved, false);

const playerBullet = JSON.parse(JSON.stringify(api.debugPlayerBulletEnemyCollisionProbe()));
assert.equal(playerBullet.positiveNine.bulletRemoved, true);
assert.equal(playerBullet.negativeNine.bulletRemoved, true);
assert.equal(playerBullet.positiveTen.bulletRemoved, false);
assert.equal(playerBullet.negativeTen.bulletRemoved, false);

const friendly = JSON.parse(JSON.stringify(api.debugFriendlyFireProtectionProbe()));
assert.equal(friendly.positiveNine.bulletRemoved, true);
assert.equal(friendly.negativeNine.bulletRemoved, true);
assert.equal(friendly.positiveTen.bulletRemoved, false);
assert.equal(friendly.negativeTen.bulletRemoved, false);

console.log("tank-collision-rules integration test passed");
