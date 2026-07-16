const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.wallDamageRules, "wall damage rules module should register before game.js");
assert.equal(Object.isFrozen(modules.wallDamageRules), true);

const steel = JSON.parse(JSON.stringify(api.debugSteelRuleProbe()));
assert.equal(steel.blocked, false);
assert.equal(steel.blockedMask, 15);
assert.equal(steel.first, true);
assert.equal(steel.afterFirst.mask, 11);
assert.deepEqual(steel.afterFirst.steelHits, [0, 0, 0, 0]);
assert.equal(steel.second, true);
assert.equal(steel.afterSecond.mask, 3);

const brick = JSON.parse(JSON.stringify(api.debugBrickWallPowerProbe()));
assert.equal(brick.rules.brickSameSideHits, 4);
assert.equal(brick.rules.poweredBrickSameSideHits, 2);
assert.deepEqual(brick.normalMasks, [15, 14, 14, 12]);
assert.deepEqual(brick.normalBrickMasks, [65518, 65484, 65416, 65280]);
assert.equal(brick.normalTypeAfterFour, "brick");
assert.equal(brick.powerMask, 14);
assert.equal(brick.powerBrickMask, 65484);
assert.equal(brick.powerTwoMask, brick.powerMask);
assert.equal(brick.powerTwoBrickMask, brick.powerBrickMask);
assert.equal(brick.powerRemoved, 1);
assert.equal(brick.directionMasks.up.firstRemovedFragments, 0x3000);
assert.equal(brick.directionMasks.up.second, 11);
assert.equal(brick.directionMasks.down.firstRemovedFragments, 0x0003);
assert.equal(brick.directionMasks.down.second, 14);
assert.equal(brick.directionMasks.left.firstRemovedFragments, 0x0088);
assert.equal(brick.directionMasks.left.second, 13);
assert.equal(brick.directionMasks.right.firstRemovedFragments, 0x0011);
assert.equal(brick.directionMasks.right.second, 14);

console.log("wall-damage-rules integration test passed");
