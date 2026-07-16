const assert = require("assert").strict;
const {
  normalizeStageNumber,
  resolveEnemyTotal,
  resolveMaxActiveEnemies,
  resolveStageRoute
} = require("../../src/stages/stage-routing");

const extendedAdvance = {
  loopAfterFinalStage: true,
  extendedLoopEndStage: 70,
  extendedLoopEnemyStage: 35
};

assert.equal(normalizeStageNumber(undefined, 7), 7);
assert.equal(normalizeStageNumber(0, 7), 7);
assert.equal(normalizeStageNumber(-4, 7), 1);
assert.equal(normalizeStageNumber(3.9, 7), 3);

assert.deepEqual(resolveStageRoute({
  stage: 35,
  totalStages: 35,
  stageAdvance: extendedAdvance,
  originalStageCount: 35
}), {
  stage: 35,
  stageCount: 35,
  stageCycleLimit: 70,
  isExtendedLoopStage: false,
  mapDataStage: 35,
  enemyDataStage: 35
});

assert.deepEqual(resolveStageRoute({
  stage: 36,
  totalStages: 35,
  stageAdvance: extendedAdvance,
  originalStageCount: 35
}), {
  stage: 36,
  stageCount: 35,
  stageCycleLimit: 70,
  isExtendedLoopStage: true,
  mapDataStage: 1,
  enemyDataStage: 35
});

const stage70 = resolveStageRoute({
  stage: 70,
  totalStages: 35,
  stageAdvance: extendedAdvance,
  originalStageCount: 35
});
assert.equal(stage70.mapDataStage, 35);
assert.equal(stage70.enemyDataStage, 35);
assert.equal(stage70.isExtendedLoopStage, true);

const beyondCycle = resolveStageRoute({
  stage: 71,
  totalStages: 35,
  stageAdvance: extendedAdvance,
  originalStageCount: 35
});
assert.equal(beyondCycle.isExtendedLoopStage, false);
assert.equal(beyondCycle.mapDataStage, 35);
assert.equal(beyondCycle.enemyDataStage, 35);

const finitePackRoute = resolveStageRoute({
  stage: 5,
  totalStages: 2,
  stageAdvance: { ...extendedAdvance, loopAfterFinalStage: false },
  originalStageCount: 35
});
assert.equal(finitePackRoute.stageCycleLimit, 2);
assert.equal(finitePackRoute.mapDataStage, 2);
assert.equal(finitePackRoute.enemyDataStage, 2);

const nonOriginalCount = resolveStageRoute({
  stage: 35,
  totalStages: 34,
  stageAdvance: extendedAdvance,
  originalStageCount: 35
});
assert.equal(nonOriginalCount.stageCycleLimit, 34);
assert.equal(nonOriginalCount.isExtendedLoopStage, false);

const currentStageFallback = resolveStageRoute({
  stage: 0,
  currentStage: 12,
  totalStages: 35,
  stageAdvance: extendedAdvance,
  originalStageCount: 35
});
assert.equal(currentStageFallback.stage, 12);
assert.equal(currentStageFallback.mapDataStage, 12);

const pack = {
  enemyTotal: 9,
  enemyTotals: [1, 3],
  enemies: [[{}], [{}, {}, {}]],
  stageSettings: [
    { maxActiveEnemies: 2, maxActiveEnemiesTwoPlayer: 5 },
    { maxActiveEnemies: 3, maxActiveEnemiesTwoPlayer: 6 }
  ]
};
assert.equal(resolveEnemyTotal(pack, 1, 20), 1);
assert.equal(resolveEnemyTotal(pack, 2, 20), 3);
assert.equal(resolveEnemyTotal({ enemies: [[{}, {}]] }, 1, 20), 2);
assert.equal(resolveEnemyTotal({ enemyTotal: 7 }, 1, 20), 7);
assert.equal(resolveEnemyTotal({}, 1, 20), 20);
assert.equal(resolveMaxActiveEnemies(pack, 1, 1, { onePlayer: 4, twoPlayer: 6 }), 2);
assert.equal(resolveMaxActiveEnemies(pack, 1, 2, { onePlayer: 4, twoPlayer: 6 }), 5);
assert.equal(resolveMaxActiveEnemies(pack, 2, 1, { onePlayer: 4, twoPlayer: 6 }), 3);
assert.equal(resolveMaxActiveEnemies({}, 1, 1, { onePlayer: 4, twoPlayer: 6 }), 4);
assert.equal(resolveMaxActiveEnemies({}, 1, 2, { onePlayer: 4, twoPlayer: 6 }), 6);

console.log("stage-routing unit test passed");
