const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupBattleCompositionRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupBattleCompositionRuntime({ game: {}, fn: {}, stageRuntime: {} }, {}, {}),
  /deps.requireRuntimeModule must be a function/
);

const setupOrder = [];
const moduleResults = {
  frameCounterRuntime: {
    advanceFrameCounters() {},
    resetFrameCounterHigh() {},
    resetFrameCounterLow() {},
    resetFrameCounters() {}
  },
  gameOverEntryRuntime: { enterGameOver() {} },
  frameLoopRuntime: { start() {} },
  screenUpdateRuntime: { updateFrame() { return "updated"; } }
};
function fakeRuntimeModule(name) {
  return new Proxy({}, {
    get(target, property) {
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
const deps = {
  sharedState: {
    STEP_MS: 1000 / 60,
    EXTENDED_STAGE_END_FRAME_HIGH: 0xfe,
    PLAYER_GAME_OVER_STAGE_END_DELAY: 0x100
  },
  STAGE_CURTAIN_CLOSE_FRAMES: 22,
  buildBaseWall() {},
  directionTowardTarget() {},
  isEnemyAtTurnIntersection() {},
  selectEnemyTargetPlayer() {},
  stageResultVisibleKillCount() {},
  requireRuntimeModule(name) {
    return fakeRuntimeModule(name);
  },
  advanceFrameCounter() {},
  resetFrameCounter() {}
};
const api = runtime.setupBattleCompositionRuntime(
  { game: {}, fn, stageRuntime },
  deps,
  { render() {}, shouldSpawnEnemies() { return true; }, update() {} }
);

assert.equal(Object.isFrozen(api), true);
assert.equal(api.screenUpdateRuntime.updateFrame(), "updated");
assert.equal(typeof api.frameLoopRuntime.start, "function");
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
  "projectileMotionRuntime",
  "battleLoopRuntime",
  "frameLoopRuntime",
  "screenUpdateRuntime"
]);

console.log("battle-composition-runtime unit test passed");
