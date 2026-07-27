const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-result-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupStageResultRuntime({}, {}, {}),
  /state\.game must be an object/
);

const presentationCalls = [];
const events = [];
const players = [
  { id: 1, score: 10, stagePoints: 0 },
  { id: 2, score: 20, stagePoints: 0 }
];
const state = {
  game: {
    players,
    stage: 2,
    stageClearBonusAwarded: false,
    stageClearBonusPlayerIds: [2],
    stageClearElapsed: 5
  },
  fn: {}
};
const settings = {
  stageAdvance: { loopAfterFinalStage: true },
  stageClearBonus: { points: 100 },
  timings: { stageClear: 0 }
};
const api = runtime.setupStageResultRuntime(state, {
  createStageResultPresentation(resultPlayers, enemyTypes, frame, awarded) {
    presentationCalls.push({ resultPlayers, enemyTypes, frame, awarded });
    return { endFrame: 77, frame };
  },
  selectStageClearBonusRecipients(resultPlayers, bonus) {
    assert.equal(bonus.points, 100);
    return [resultPlayers[1]];
  }
}, {
  addPlayerScore(player, points) {
    events.push(["score", player.id, points]);
    player.score += points;
  },
  enemyDataStage(stage) {
    return `enemy-${stage}`;
  },
  enemyTypeDefinitions() {
    return ["light", "heavy"];
  },
  gameSettings() {
    return settings;
  },
  mapDataStage(stage) {
    return `map-${stage}`;
  },
  playSound(name) {
    events.push(["sound", name]);
  },
  stageCycleLimit() {
    return 3;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "stageAdvanceResult",
  "awardPendingStageClearBonus",
  "stageClearPresentation",
  "stageResultDuration",
  "stageClearBonusRecipients"
]);
assert.equal(state.fn.stageAdvanceResult, api.stageAdvanceResult);

assert.deepEqual(api.stageAdvanceResult(2), {
  stage: 3,
  wraps: false,
  stops: false,
  stageCycleLimit: 3,
  mapDataStage: "map-3",
  enemyDataStage: "enemy-3"
});
assert.deepEqual(api.stageAdvanceResult(3), {
  stage: 1,
  wraps: true,
  stops: false,
  stageCycleLimit: 3,
  mapDataStage: "map-1",
  enemyDataStage: "enemy-1"
});
settings.stageAdvance.loopAfterFinalStage = false;
assert.equal(api.stageAdvanceResult(3).stops, true);
settings.stageAdvance.loopAfterFinalStage = true;

assert.deepEqual(api.stageClearPresentation(undefined, -4), { endFrame: 77, frame: 0 });
assert.deepEqual(presentationCalls[0], {
  resultPlayers: players,
  enemyTypes: ["light", "heavy"],
  frame: 0,
  awarded: false
});
assert.equal(api.stageResultDuration(players), 77);
settings.timings.stageClear = 123;
assert.equal(api.stageResultDuration(players), 123);
assert.deepEqual(api.stageClearBonusRecipients(players), [players[1]]);

state.game.stageClearBonusAwarded = false;
api.awardPendingStageClearBonus();
assert.equal(players[1].score, 120);
assert.equal(players[1].stagePoints, 100);
assert.equal(state.game.stageClearBonusAwarded, true);
assert.deepEqual(events, [["score", 2, 100], ["sound", "stageBonus"]]);
api.awardPendingStageClearBonus();
assert.deepEqual(events, [["score", 2, 100], ["sound", "stageBonus"]]);

console.log("stage-result-runtime unit test passed");
