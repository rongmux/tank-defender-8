const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.stageResultRules, "stage result rules module should register before game.js");
assert.equal(Object.isFrozen(modules.stageResultRules), true);

const rowsProbe = JSON.parse(JSON.stringify(
  api.debugStageClearResultRowsProbe([1, 2, 3, 4], [4, 3, 2, 1], 500, 250)
));
const expectedP1EnemyPoints = rowsProbe.rows.reduce((sum, row) => sum + row.p1Kills * row.score, 0);
const expectedP2EnemyPoints = rowsProbe.rows.reduce((sum, row) => sum + row.p2Kills * row.score, 0);
assert.equal(rowsProbe.rows[0].p1Points, rowsProbe.rows[0].score);
assert.equal(rowsProbe.rows[3].p2Points, rowsProbe.rows[3].score);
assert.equal(rowsProbe.p1EnemyPoints, expectedP1EnemyPoints);
assert.equal(rowsProbe.p2EnemyPoints, expectedP2EnemyPoints);
assert.equal(rowsProbe.p1BonusPoints, 500);
assert.equal(rowsProbe.p2BonusPoints, 250);
assert.equal(rowsProbe.p1StagePoints, expectedP1EnemyPoints + 500);
assert.equal(rowsProbe.p2StagePoints, expectedP2EnemyPoints + 250);

const atSetup = JSON.parse(JSON.stringify(api.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  31
)));
assert(atSetup.rows.every((row) => row.p1VisibleKills === 0 && row.p2VisibleKills === 0));

const firstTick = JSON.parse(JSON.stringify(api.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  32
)));
assert.equal(firstTick.rows[0].firstCountFrame, 32);
assert.equal(firstTick.rows[0].countStep, 9);
assert.equal(firstTick.rows[0].p1VisibleKills, 1);
assert.equal(firstTick.rows[0].p2VisibleKills, 1);

const firstHold = api.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0], 40);
assert.equal(firstHold.rows[0].p1VisibleKills, 1);
const secondTick = JSON.parse(JSON.stringify(api.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  41
)));
assert.equal(secondTick.rows[0].p1VisibleKills, 2);
assert.equal(secondTick.rows[0].p2VisibleKills, 1);
assert.equal(secondTick.totalsRevealFrame, 187);
assert.equal(secondTick.bonusRevealFrame, 202);
assert.equal(secondTick.endFrame, 322);
assert.equal(secondTick.duration, 322);
assert.equal(api.debugStageClearPresentationProbe([0, 0, 0, 0], [0, 0, 0, 0], 0).endFrame, 295);
assert.equal(api.debugStageClearPresentationProbe([20, 0, 0, 0], [0, 0, 0, 0], 0).endFrame, 475);
assert.equal(api.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  secondTick.totalsRevealFrame - 1
).showTotals, false);
assert.equal(api.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  secondTick.totalsRevealFrame
).showTotals, true);

assert.deepEqual(JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 3).recipients)), [1]);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 4).recipients)), []);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 3, 0, 1).recipients)), []);

console.log("stage-result-rules integration test passed");
