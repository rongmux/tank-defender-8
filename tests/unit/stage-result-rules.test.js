const assert = require("assert").strict;
const {
  STAGE_RESULT_TIMING,
  createStageResultPresentation,
  createStageResultRows,
  createStageResultSummary,
  selectStageClearBonusRecipients,
  stageKillCount,
  stageResultVisibleKillCount
} = require("../../src/rules/stage-result-rules");

const enemyTypes = [
  { name: "basic", color: "#111111", score: 100 },
  { name: "armor", color: "#222222", score: 400 }
];
const p1 = { id: 1, lives: 2, stageKills: [1.9, -2], stagePoints: 350 };
const p2 = { id: 2, lives: 1, stageKills: ["2", 1], stagePoints: 600 };

assert.equal(Object.isFrozen(STAGE_RESULT_TIMING), true);
assert.deepEqual(STAGE_RESULT_TIMING, {
  initialWait: 30,
  rowSetup: 1,
  countUpdate: 1,
  countHold: 8,
  betweenRows: 20,
  beforeTotals: 30,
  beforeBonus: 15,
  finalHold: 120
});
assert.equal(stageKillCount(p1, 0), 1);
assert.equal(stageKillCount(p1, 1), 0);
assert.equal(stageKillCount(null, 0), 0);

assert.deepEqual(createStageResultRows(p1, p2, enemyTypes), [
  {
    typeIndex: 0,
    name: "basic",
    color: "#111111",
    score: 100,
    p1Kills: 1,
    p1Points: 100,
    p2Kills: 2,
    p2Points: 200
  },
  {
    typeIndex: 1,
    name: "armor",
    color: "#222222",
    score: 400,
    p1Kills: 0,
    p1Points: 0,
    p2Kills: 1,
    p2Points: 400
  }
]);

const summary = createStageResultSummary([p1, p2], enemyTypes);
assert.equal(summary.p1EnemyPoints, 100);
assert.equal(summary.p2EnemyPoints, 600);
assert.equal(summary.p1BonusPoints, 250);
assert.equal(summary.p2BonusPoints, 0);
assert.equal(summary.p1StagePoints, 350);
assert.equal(summary.p2StagePoints, 600);

const onePlayerSummary = createStageResultSummary([p1], enemyTypes);
assert.equal(onePlayerSummary.p2.id, 2);
assert.deepEqual(onePlayerSummary.p2.stageKills, [0, 0]);
assert.equal(onePlayerSummary.p2StagePoints, 0);

const strictBonus = { points: 1000, twoPlayerOnly: true, requireStrictLead: true };
const leader = { id: 1, lives: 1, stageKills: [3, 1] };
const runnerUp = { id: 2, lives: 1, stageKills: [3, 0] };
assert.deepEqual(selectStageClearBonusRecipients([leader, runnerUp], strictBonus), [leader]);
assert.deepEqual(selectStageClearBonusRecipients([
  { ...leader, stageKills: [3, 0] },
  runnerUp
], strictBonus), []);
assert.deepEqual(selectStageClearBonusRecipients([
  { ...leader, lives: 0 },
  runnerUp
], strictBonus), []);
assert.deepEqual(selectStageClearBonusRecipients([
  { ...leader, stageKills: [0, 0] },
  { ...runnerUp, stageKills: [0, 0] }
], strictBonus), []);
assert.deepEqual(selectStageClearBonusRecipients([leader], strictBonus), []);
assert.deepEqual(selectStageClearBonusRecipients([leader], {
  ...strictBonus,
  twoPlayerOnly: false
}), [leader]);
assert.deepEqual(selectStageClearBonusRecipients([leader, runnerUp], {
  points: 0,
  twoPlayerOnly: false,
  requireStrictLead: false
}), []);

const tiedPlayers = [
  { ...leader, stageKills: [3, 0] },
  runnerUp
];
assert.deepEqual(selectStageClearBonusRecipients(tiedPlayers, {
  ...strictBonus,
  requireStrictLead: false
}), tiedPlayers);

const timelinePlayers = [
  { id: 1, stageKills: [2, 1], stagePoints: 600 },
  { id: 2, stageKills: [1, 0], stagePoints: 100 }
];
const setup = createStageResultPresentation(timelinePlayers, enemyTypes, 31, false);
assert.equal(setup.rows[0].firstCountFrame, 32);
assert.equal(setup.rows[0].p1VisibleKills, 0);
const firstTick = createStageResultPresentation(timelinePlayers, enemyTypes, 32, false);
assert.equal(firstTick.rows[0].p1VisibleKills, 1);
assert.equal(firstTick.rows[0].p2VisibleKills, 1);
const secondTick = createStageResultPresentation(timelinePlayers, enemyTypes, 41, false);
assert.equal(secondTick.rows[0].p1VisibleKills, 2);
assert.equal(secondTick.rows[0].p2VisibleKills, 1);
assert.equal(secondTick.totalsRevealFrame, 127);
assert.equal(secondTick.bonusRevealFrame, 142);
assert.equal(secondTick.endFrame, 262);
assert.equal(secondTick.showTotals, false);
assert.equal(secondTick.showBonus, false);
assert.equal(stageResultVisibleKillCount(secondTick), 3);
assert.equal(createStageResultPresentation(timelinePlayers, enemyTypes, 142, false).showBonus, true);
assert.equal(createStageResultPresentation(timelinePlayers, enemyTypes, 0, true).showBonus, true);

console.log("stage-result-rules unit test passed");
