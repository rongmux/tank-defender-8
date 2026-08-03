(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = ["render", "shouldSpawnEnemies", "update"];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.stageRuntime || typeof state.stageRuntime !== "object") {
      throw new Error("state.stageRuntime must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (!deps.sharedState || typeof deps.sharedState.STEP_MS !== "number") {
      throw new Error("deps.sharedState.STEP_MS must be a number");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    CALLBACK_NAMES.forEach(function (name) {
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    });
  }

  /** Owns the fixed-frame gameplay module setup order and returns loop handles. */
  function setupBattleCompositionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var fn = state.fn;
    var sh = deps.sharedState;
    var syncMovementAudio = fn.syncMovementAudio;
    var battleSystemsRuntime = deps.requireRuntimeModule("battleSystemsCompositionRuntime")
      .setupBattleSystemsCompositionRuntime(state, deps);
    var frameCounterRuntime = battleSystemsRuntime.frameCounterRuntime;
    deps.requireRuntimeModule("battleLoopRuntime").setupBattleLoopRuntime(state, deps, {
      checkEndState: fn.checkEndState,
      spawnEnemies: fn.spawnEnemies,
      shouldSpawnEnemies: callbacks.shouldSpawnEnemies,
      syncMovementAudio: syncMovementAudio,
      updateBaseDestructionTimer: fn.updateBaseDestructionTimer,
      updateBullets: fn.updateBullets,
      updateEnemies: fn.updateEnemies,
      updateExplosions: fn.updateExplosions,
      updateFreezeTimer: fn.updateFreezeTimer,
      updatePlayerGameOverMessage: fn.updatePlayerGameOverMessage,
      updatePlayerInvulnerabilityTimers: fn.updatePlayerInvulnerabilityTimers,
      updatePlayers: fn.updatePlayers,
      updatePowerUp: fn.updatePowerUp,
      updateScorePopups: fn.updateScorePopups,
      updateShovelTimer: fn.updateShovelTimer
    });
    var frameLoopRuntime = deps.requireRuntimeModule("frameLoopRuntime").setupFrameLoopRuntime(state, deps, {
      now: function () { return performance.now(); },
      render: callbacks.render,
      requestAnimationFrame: function (callback) { return requestAnimationFrame(callback); },
      stepMs: function () { return sh.STEP_MS; },
      update: callbacks.update
    });
    var screenUpdateRuntime = deps.requireRuntimeModule("screenUpdateRuntime").setupScreenUpdateRuntime(state, deps, {
      advanceFrameCounters: frameCounterRuntime.advanceFrameCounters,
      awardPendingStageClearBonus: fn.awardPendingStageClearBonus,
      checkEndState: fn.checkEndState,
      finishGameOverScreen: fn.finishGameOverScreen,
      finishStageClearClosing: fn.finishStageClearClosing,
      finishStageResult: fn.finishStageResult,
      playSound: fn.playSound,
      resetFrameCounterHigh: frameCounterRuntime.resetFrameCounterHigh,
      stageClearPresentation: fn.stageClearPresentation,
      stageResultVisibleKillCount: deps.stageResultVisibleKillCount,
      syncMovementAudio: syncMovementAudio,
      updateAudio: fn.updateAllAudio,
      updateBattle: fn.updateBattle,
      updateEditorControls: fn.updateEditorControls,
      updateExplosions: fn.updateExplosions,
      updateFullGameOverScreen: fn.updateFullGameOverScreen,
      updateHighScoreScreen: fn.updateHighScoreScreen,
      updateHiddenMessage: fn.updateHiddenMessage,
      updateScorePopups: fn.updateScorePopups,
      updateStageSelectControls: fn.updateStageSelectControls,
      updateTitleIdle: fn.updateTitleIdle
    });

    return Object.freeze({
      frameLoopRuntime: frameLoopRuntime,
      screenUpdateRuntime: screenUpdateRuntime
    });
  }

  return Object.freeze({ setupBattleCompositionRuntime: setupBattleCompositionRuntime });
});
