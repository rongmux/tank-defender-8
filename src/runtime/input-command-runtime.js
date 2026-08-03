(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.inputCommandRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "beginStageSelect",
    "clearEditorStage",
    "enterEditor",
    "exportEditorStage",
    "importStagePackFile",
    "initAudio",
    "loadEditorStage",
    "nextStage",
    "playSound",
    "restoreBuiltInStagePack",
    "saveEditorStage",
    "setTitleMenu",
    "stageEnemiesCleared",
    "syncBaseHitAudioNodes",
    "syncBonusLifeAudioNodes",
    "syncBrickHitAudioNodes",
    "syncEnemyDestroyAudioNodes",
    "syncEnemyHitAudioNodes",
    "syncMovementAudio",
    "syncMovementIceAudioNodes",
    "syncPauseAudioNodes",
    "syncPlayerDestroyAudioNodes",
    "syncPlayerShootAudioNodes",
    "syncPowerUpAppearAudioNodes",
    "syncPowerUpPickupAudioNodes",
    "syncStageStartAudioNodes",
    "syncSteelHitAudioNodes",
    "testEditorStage"
  ];

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.pendingFirePresses || typeof state.pendingFirePresses.clear !== "function") {
      throw new Error("state.pendingFirePresses must provide clear");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns toolbar commands and active-battle pause audio handoff. */
  function setupInputCommandRuntime(state, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var pendingFirePresses = state.pendingFirePresses;

    function handleAction(action) {
      callbacks.initAudio();
      if (action === "one") {
        callbacks.setTitleMenu(0);
        callbacks.beginStageSelect(1);
      } else if (action === "two") {
        callbacks.setTitleMenu(1);
        callbacks.beginStageSelect(2);
      } else if (action === "prev") {
        callbacks.nextStage(-1);
      } else if (action === "next") {
        callbacks.nextStage(1);
      } else if (action === "edit") {
        callbacks.setTitleMenu(2);
        callbacks.enterEditor();
      } else if (action === "test" && game.screen === "editor") {
        callbacks.testEditorStage();
      } else if (action === "save" && game.screen === "editor") {
        callbacks.saveEditorStage();
      } else if (action === "load" && game.screen === "editor") {
        callbacks.loadEditorStage();
      } else if (action === "clear" && game.screen === "editor") {
        callbacks.clearEditorStage();
      } else if (action === "export" && game.screen === "editor") {
        callbacks.exportEditorStage();
      } else if (action === "import") {
        callbacks.importStagePackFile();
      } else if (action === "pause") {
        togglePause();
      } else if (action === "reset") {
        callbacks.restoreBuiltInStagePack();
      }
    }

    function isPauseInputCode(code) {
      return code === "Enter" || code === "KeyP";
    }

    function togglePause() {
      if (
        game.screen !== "playing" ||
        game.demoMode ||
        game.clearPendingTimer > 0 ||
        game.baseDestroyTimer > 0 ||
        callbacks.stageEnemiesCleared()
      ) return false;
      game.paused = !game.paused;
      game.pauseElapsed = 0;
      pendingFirePresses.clear();
      callbacks.syncStageStartAudioNodes();
      callbacks.syncBonusLifeAudioNodes();
      callbacks.syncPowerUpPickupAudioNodes();
      callbacks.syncPowerUpAppearAudioNodes();
      callbacks.syncBrickHitAudioNodes();
      callbacks.syncBaseHitAudioNodes();
      callbacks.syncSteelHitAudioNodes();
      callbacks.syncEnemyHitAudioNodes();
      callbacks.syncEnemyDestroyAudioNodes();
      callbacks.syncPlayerDestroyAudioNodes();
      callbacks.syncPlayerShootAudioNodes();
      callbacks.syncMovementIceAudioNodes();
      callbacks.syncPauseAudioNodes();
      callbacks.syncMovementAudio();
      if (game.paused) callbacks.playSound("pause");
      return true;
    }

    var api = {
      handleAction: handleAction,
      isPauseInputCode: isPauseInputCode,
      togglePause: togglePause
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupInputCommandRuntime: setupInputCommandRuntime });
});
