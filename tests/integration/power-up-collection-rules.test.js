const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.powerUpCollectionRules, "power-up collection rules module should register before game.js");
assert.equal(Object.isFrozen(modules.powerUpCollectionRules), true);

const boundary = JSON.parse(JSON.stringify(api.debugPowerUpPickupBoundaryProbe()));
assert.equal(boundary.samePosition, true);
assert.equal(boundary.positiveEleven, true);
assert.equal(boundary.negativeEleven, true);
assert.equal(boundary.positiveTwelveX, false);
assert.equal(boundary.negativeTwelveX, false);
assert.equal(boundary.positiveTwelveY, false);
assert.equal(boundary.negativeTwelveY, false);
assert.equal(boundary.spawning, false);
assert.equal(boundary.respawning, false);
assert.equal(boundary.dead, false);
assert.equal(boundary.stunned, true);
assert.equal(boundary.invulnerable, true);

const priority = JSON.parse(JSON.stringify(api.debugPowerUpPickupPriorityProbe()));
assert.equal(priority.simultaneousPlayerId, 2);
assert.equal(priority.player2SpawningPlayerId, 1);
assert.equal(priority.onePlayerId, 1);

console.log("power-up-collection-rules integration test passed");
