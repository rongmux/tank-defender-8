const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/stage-result-diagnostics");

const enemyTypes = Object.freeze([
  Object.freeze({ name: "basic", color: "#e7e36c", score: 100 }),
  Object.freeze({ name: "fast", color: "#e7e36c", score: 200 }),
  Object.freeze({ name: "power", color: "#e7e36c", score: 300 }),
  Object.freeze({ name: "armor", color: "#e7e36c", score: 400 })
]);

const state = {
  settings: {
    stageClearBonus: {
      points: 1000,
      twoPlayerOnly: true,
      requireStrictLead: true
    },
    timings: { stageClear: 0 }
  },
  elapsed: 0,
  bonusAwarded: false
};

function createDiagnostics() {
  return diagnostics.createStageResultDiagnostics({
    getGameSettings: () => state.settings,
    getEnemyTypes: () => enemyTypes,
    getStageClearElapsed: () => state.elapsed,
    getStageClearBonusAwarded: () => state.bonusAwarded
  });
}

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createStageResultProbePlayer([], 1, [], 0),
  /enemyTypes must be a non-empty array/
);
assert.throws(() => diagnostics.createStageResultDiagnostics(), /options must be an object/);
assert.throws(
  () => diagnostics.createStageResultDiagnostics({
    getGameSettings: () => state.settings,
    getEnemyTypes: () => enemyTypes,
    getStageClearElapsed: () => 0
  }),
  /getStageClearBonusAwarded must be a function/
);

const player = diagnostics.createStageResultProbePlayer(
  enemyTypes,
  2,
  [1.9, -2, "3", null],
  250.8
);
assert.deepEqual(player, {
  id: 2,
  stageKills: [1, 0, 3, 0],
  stagePoints: 1250
});
player.stageKills[0] = 99;
assert.deepEqual(
  diagnostics.createStageResultProbePlayer(enemyTypes, 2, [1, 0, 3, 0], 250).stageKills,
  [1, 0, 3, 0]
);

const api = createDiagnostics();
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "debugStageClearBonusProbe",
  "debugStageClearResultRowsProbe",
  "debugStageClearRowLayoutProbe",
  "debugStageClearPresentationProbe"
]);
assert.deepEqual(api.debugStageClearBonusProbe(4, 3), {
  points: 1000,
  recipients: [1]
});
assert.deepEqual(api.debugStageClearBonusProbe(4, 4).recipients, []);
assert.deepEqual(api.debugStageClearBonusProbe(4, 3, 0, 1).recipients, []);

const rows = api.debugStageClearResultRowsProbe(
  [1, 2, 3, 4],
  [4, 3, 2, 1],
  500,
  250
);
assert.deepEqual(rows.rows.map((row) => row.p1Points), [100, 400, 900, 1600]);
assert.deepEqual(rows.rows.map((row) => row.p2Points), [400, 600, 600, 400]);
assert.deepEqual({
  p1EnemyPoints: rows.p1EnemyPoints,
  p2EnemyPoints: rows.p2EnemyPoints,
  p1BonusPoints: rows.p1BonusPoints,
  p2BonusPoints: rows.p2BonusPoints,
  p1StagePoints: rows.p1StagePoints,
  p2StagePoints: rows.p2StagePoints
}, {
  p1EnemyPoints: 3000,
  p2EnemyPoints: 2000,
  p1BonusPoints: 500,
  p2BonusPoints: 250,
  p1StagePoints: 3500,
  p2StagePoints: 2250
});

assert.deepEqual(api.debugStageClearRowLayoutProbe(), {
  p1KillsRightX: 104,
  leftArrowX: 112,
  arrowWidth: 8,
  miniTankX: 121,
  miniTankWidth: 14,
  rightArrowX: 136,
  p2KillsX: 152,
  leftGap: 1,
  rightGap: 1,
  leftOverlapsTank: false,
  tankOverlapsRight: false
});

state.elapsed = 40;
const presentation = api.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0]);
assert.equal(presentation.rows[0].firstCountFrame, 32);
assert.equal(presentation.rows[0].countStep, 9);
assert.equal(presentation.rows[0].p1VisibleKills, 1);
assert.equal(presentation.rows[0].p2VisibleKills, 1);
assert.equal(presentation.totalsRevealFrame, 187);
assert.equal(presentation.bonusRevealFrame, 202);
assert.equal(presentation.endFrame, 322);
assert.equal(presentation.duration, 322);
assert.equal(presentation.showTotals, false);
assert.equal(presentation.showBonus, false);

state.settings.timings.stageClear = 8;
state.bonusAwarded = true;
const overridden = api.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0], 0);
assert.equal(overridden.duration, 8);
assert.equal(overridden.showBonus, true);

rows.rows[0].p1Kills = 99;
assert.equal(
  api.debugStageClearResultRowsProbe([1, 0, 0, 0], [0, 0, 0, 0], 0, 0).rows[0].p1Kills,
  1
);

console.log("stage-result-diagnostics unit test passed");
