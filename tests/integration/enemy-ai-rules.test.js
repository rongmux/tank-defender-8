const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.enemyAiRules, "enemy AI rules module should register before game.js");
assert.equal(Object.isFrozen(modules.enemyAiRules), true);
assert.equal(modules.enemyAiRules.enemyAiPhaseForInterval(186, 24), "player");

const eligibility = JSON.parse(JSON.stringify(api.debugEnemyTargetEligibilityProbe()));
assert.deepEqual(eligibility.targetableIds, [1, 2]);
assert.equal(eligibility.targetableIds.includes(eligibility.spawningId), true);
assert.equal(eligibility.targetableIds.includes(eligibility.respawningId), false);

const stage1 = JSON.parse(JSON.stringify(api.debugEnemyAiPhaseProbe(1, 1)));
const stage35 = JSON.parse(JSON.stringify(api.debugEnemyAiPhaseProbe(35, 1)));
const twoPlayer = JSON.parse(JSON.stringify(api.debugEnemyAiPhaseProbe(1, 2)));
assert.deepEqual({ interval: stage1.interval, randomEnd: stage1.randomEnd, playerEnd: stage1.playerEnd }, {
  interval: 186,
  randomEnd: 23,
  playerEnd: 46
});
assert.deepEqual({ interval: stage35.interval, randomEnd: stage35.randomEnd, playerEnd: stage35.playerEnd }, {
  interval: 50,
  randomEnd: 6,
  playerEnd: 12
});
assert.deepEqual({ interval: twoPlayer.interval, randomEnd: twoPlayer.randomEnd, playerEnd: twoPlayer.playerEnd }, {
  interval: 166,
  randomEnd: 20,
  playerEnd: 41
});
assert.deepEqual(stage1.phases.map((entry) => entry.phase), ["random", "player", "hq"]);
assert.deepEqual(stage1.phases.map((entry) => entry.displayFrames), [1472, 1536, 3008]);

const targeting = JSON.parse(JSON.stringify(api.debugEnemyTargetingProbe()));
assert.deepEqual({
  oddSlotTargetId: targeting.oddSlotTargetId,
  evenSlotTargetId: targeting.evenSlotTargetId,
  fallbackTargetId: targeting.fallbackTargetId
}, {
  oddSlotTargetId: 2,
  evenSlotTargetId: 1,
  fallbackTargetId: 1
});
assert.equal(targeting.upperLeftVerticalFirst, "up");
assert.equal(targeting.upperLeftHorizontalFirst, "left");
assert.equal(targeting.lowerRightVerticalFirst, "down");
assert.equal(targeting.lowerRightHorizontalFirst, "right");

const cadence = JSON.parse(JSON.stringify(api.debugEnemyMovementCadenceProbe()));
assert.deepEqual(cadence.map((entry) => entry.normal), [true, false, true, false]);
assert.equal(cadence.every((entry) => entry.fast), true);

console.log("enemy-ai-rules integration test passed");
