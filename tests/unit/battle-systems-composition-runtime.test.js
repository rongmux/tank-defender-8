const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-systems-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupBattleSystemsCompositionRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupBattleSystemsCompositionRuntime({ game: {}, fn: {}, stageRuntime: {} }, {}),
  /deps\.requireRuntimeModule must be a function/
);

const setupOrder = [];
const moduleResults = {
  frameCounterRuntime: {
    resetFrameCounterLow() {},
    resetFrameCounters() {}
  },
  gameOverEntryRuntime: {
    enterGameOver() {}
  }
};
function fakeRuntimeModule(name) {
  return new Proxy({}, {
    get() {
      return function () {
        setupOrder.push(name);
        return moduleResults[name] || {};
      };
    }
  });
}

const fn = new Proxy({}, {
  get() {
    return function () {};
  }
});
const stageRuntime = new Proxy({}, {
  get() {
    return function () {};
  }
});
const api = runtime.setupBattleSystemsCompositionRuntime(
  { game: {}, fn, stageRuntime },
  {
    STAGE_CURTAIN_CLOSE_FRAMES: 22,
    buildBaseWall() {},
    directionTowardTarget() {},
    isEnemyAtTurnIntersection() {},
    requireRuntimeModule(name) {
      return fakeRuntimeModule(name);
    },
    selectEnemyTargetPlayer() {},
    sharedState: {
      EXTENDED_STAGE_END_FRAME_HIGH: 0xfe,
      PLAYER_GAME_OVER_STAGE_END_DELAY: 0x100
    }
  }
);

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["frameCounterRuntime", "gameOverEntryRuntime"]);
assert.equal(api.frameCounterRuntime, moduleResults.frameCounterRuntime);
assert.equal(api.gameOverEntryRuntime, moduleResults.gameOverEntryRuntime);
assert.deepEqual(setupOrder, [
  "tankMovementRuntime",
  "frameCounterRuntime",
  "playerMovementRuntime",
  "transientEffectsRuntime",
  "projectileRuntime",
  "battleCombatRuntime",
  "stageResultRuntime",
  "stageFlowRuntime",
  "gameOverEntryRuntime",
  "battleOutcomeRuntime",
  "playerUpdateRuntime",
  "battleTimingRuntime",
  "battleRandomRuntime",
  "powerUpRuntime",
  "enemySpawnRuntime",
  "enemyAiRuntime",
  "enemyMovementRuntime",
  "enemyUpdateRuntime",
  "projectileTargetRuntime",
  "projectileResolutionRuntime",
  "projectileMotionRuntime"
]);

console.log("battle-systems-composition-runtime unit test passed");
