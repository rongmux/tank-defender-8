(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.inputCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.isEditorDirectionCode !== "function") {
      throw new Error("deps.isEditorDirectionCode must be a function");
    }
    if (!deps.dom || typeof deps.dom !== "object") throw new Error("deps.dom must be an object");
    if (!deps.dom.document || typeof deps.dom.document.querySelectorAll !== "function") {
      throw new Error("deps.dom.document must provide querySelectorAll");
    }
    if (!deps.dom.window || typeof deps.dom.window.addEventListener !== "function") {
      throw new Error("deps.dom.window must provide addEventListener");
    }
  }

  /** Owns the explicit browser-input callback wiring outside the composition root. */
  function setupInputCompositionRuntime(state, deps) {
    requireInputs(state, deps);

    var fn = state.fn;
    var inputCommandRuntime = deps.requireRuntimeModule("inputCommandRuntime");
    var inputRuntimeApi = deps.requireRuntimeModule("inputRuntime").setupInputRuntime(state, {
      dom: deps.dom,
      inputCommandRuntime: inputCommandRuntime,
      isEditorDirectionCode: deps.isEditorDirectionCode,
      sharedState: deps.sharedState
    }, {
      activateTitleMenu: fn.activateTitleMenu,
      beginStageSelect: fn.beginStageSelect,
      clearEditorStage: fn.clearEditorStage,
      cycleEditorCell: fn.cycleEditorCell,
      cycleEditorQuadrant: fn.cycleEditorQuadrant,
      endTitleDemo: fn.endTitleDemo,
      enterEditor: fn.enterEditor,
      exitEditorToTitle: fn.exitEditorToTitle,
      exportEditorStage: fn.exportEditorStage,
      handleFullGameOverInput: fn.handleFullGameOverInput,
      hiddenMessageTriggerReady: fn.hiddenMessageTriggerReady,
      importStagePackFile: fn.importStagePackFile,
      initAudio: fn.initAudio,
      loadEditorStage: fn.loadEditorStage,
      loadStagePackJsonText: fn.loadStagePackJsonText,
      moveEditorFromCode: fn.moveEditorFromCode,
      moveTitleMenu: fn.moveTitleMenu,
      nextStage: fn.nextStage,
      paintEditorCell: fn.paintEditorCell,
      paintEditorQuadrant: fn.paintEditorQuadrant,
      playSound: fn.playSound,
      recordHiddenTitleInput: fn.recordHiddenTitleInput,
      reserveTitleDirectionForHiddenInput: fn.reserveTitleDirectionForHiddenInput,
      restoreBuiltInStagePack: fn.restoreBuiltInStagePack,
      saveEditorStage: fn.saveEditorStage,
      selectEditorBrush: fn.selectEditorBrush,
      setTitleMenu: fn.setTitleMenu,
      showEditorMessage: fn.showEditorMessage,
      stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); },
      startHiddenMessage: fn.startHiddenMessage,
      startSelectedGame: fn.startSelectedGame,
      syncBaseHitAudioNodes: fn.syncBaseHitAudioNodes,
      syncBonusLifeAudioNodes: fn.syncBonusLifeAudioNodes,
      syncBrickHitAudioNodes: fn.syncBrickHitAudioNodes,
      syncEnemyDestroyAudioNodes: fn.syncEnemyDestroyAudioNodes,
      syncEnemyHitAudioNodes: fn.syncEnemyHitAudioNodes,
      syncMovementAudio: fn.syncMovementAudio,
      syncMovementIceAudioNodes: fn.syncMovementIceAudioNodes,
      syncPauseAudioNodes: fn.syncPauseAudioNodes,
      syncPlayerDestroyAudioNodes: fn.syncPlayerDestroyAudioNodes,
      syncPlayerShootAudioNodes: fn.syncPlayerShootAudioNodes,
      syncPowerUpAppearAudioNodes: fn.syncPowerUpAppearAudioNodes,
      syncPowerUpPickupAudioNodes: fn.syncPowerUpPickupAudioNodes,
      syncStageStartAudioNodes: fn.syncStageStartAudioNodes,
      syncSteelHitAudioNodes: fn.syncSteelHitAudioNodes,
      testEditorStage: fn.testEditorStage,
      useOriginalEditorButton: fn.useOriginalEditorButton
    });

    return Object.freeze({ inputRuntime: inputRuntimeApi });
  }

  return Object.freeze({
    setupInputCompositionRuntime: setupInputCompositionRuntime
  });
});
