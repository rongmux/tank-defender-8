const assert = require("assert").strict;
const {
  DEFAULT_STAGE_ADVANCE,
  DEFAULT_STAGE_CLEAR_BONUS,
  normalizeStageAdvance,
  normalizeStageClearBonus
} = require("../../src/config/stage-flow-settings");

assert.deepEqual(DEFAULT_STAGE_ADVANCE, {
  loopAfterFinalStage: true,
  extendedLoopEndStage: 70,
  extendedLoopEnemyStage: 35
});
assert.deepEqual(DEFAULT_STAGE_CLEAR_BONUS, {
  points: 1000,
  twoPlayerOnly: true,
  requireStrictLead: true
});
assert(Object.isFrozen(DEFAULT_STAGE_ADVANCE));
assert(Object.isFrozen(DEFAULT_STAGE_CLEAR_BONUS));
assert.deepEqual(normalizeStageAdvance(), DEFAULT_STAGE_ADVANCE);
assert.deepEqual(normalizeStageClearBonus(), DEFAULT_STAGE_CLEAR_BONUS);
assert.deepEqual(normalizeStageAdvance({
  loopAfterFinalStage: false,
  extendedLoopEndStage: "80",
  extendedLoopEnemyStage: "34"
}), {
  loopAfterFinalStage: false,
  extendedLoopEndStage: 80,
  extendedLoopEnemyStage: 34
});
assert.deepEqual(normalizeStageClearBonus({
  points: "777",
  twoPlayerOnly: false,
  requireStrictLead: false
}), {
  points: 777,
  twoPlayerOnly: false,
  requireStrictLead: false
});

assert.throws(() => normalizeStageAdvance(true), /stageAdvance must be an object/);
assert.throws(() => normalizeStageClearBonus(true), /stageClearBonus must be an object/);
assert.throws(() => normalizeStageAdvance({ loopAfterFinalStage: "yes" }), /loopAfterFinalStage must be a boolean/);
for (const key of ["extendedLoopEndStage", "extendedLoopEnemyStage"]) {
  for (const value of [0, 1.5, 1000]) {
    assert.throws(() => normalizeStageAdvance({ [key]: value }), new RegExp(`stageAdvance\\.${key}`));
  }
}
for (const points of [-1, 1.5, 1000000]) {
  assert.throws(() => normalizeStageClearBonus({ points }), /stageClearBonus\.points/);
}
assert.throws(() => normalizeStageClearBonus({ twoPlayerOnly: "no" }), /twoPlayerOnly must be a boolean/);
assert.throws(() => normalizeStageClearBonus({ requireStrictLead: 1 }), /requireStrictLead must be a boolean/);

console.log("stage-flow-settings unit test passed");
