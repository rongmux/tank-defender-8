(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.editorLifecycleRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  /** Owns construction-mode entry, persistence, test runs, and editor feedback. */
  function setupEditorLifecycleRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var fn = state.fn;
    var shared = deps.sharedState;

    function enterEditor() {
      fn.stopMovementAudio();
      fn.stopStageStartAudio();
      fn.stopBonusLifeAudio();
      fn.stopPowerUpPickupAudio();
      fn.stopPowerUpAppearAudio();
      fn.stopPauseAudio();
      fn.stopBrickHitAudio();
      fn.stopEnemyHitAudio();
      fn.stopBaseHitAudio();
      fn.stopEnemyDestroyAudio();
      fn.stopPlayerDestroyAudio();
      fn.stopSteelHitAudio();
      fn.stopPlayerShootAudio();
      fn.stopMovementIceAudio();
      fn.stopScoreCountAudio();
      fn.stopStageBonusAudio();
      fn.initAudio();
      game.screen = "editor";
      game.paused = false;
      if (!game.editorGrid) game.editorGrid = deps.makeOriginalConstructionGrid();
      game.editorCursor = { qc: 0, qr: 0 };
      game.editorPattern = 0;
      game.editorPatternArmed = false;
      game.editorMoveHoldTimer = 0;
      game.editorTick = 0;
      game.editorBrush = deps.ORIGINAL_EDITOR_PATTERNS[0].type;
      showEditorMessage("EDIT");
    }

    function exitEditorToTitle() {
      if (game.editorGrid) game.constructedGrid = deps.cloneGrid(game.editorGrid);
      game.constructionVisits = (game.constructionVisits + 1) & 0xff;
      game.constructionUsed = game.constructionVisits > 0;
      game.hiddenInputCount = 0;
      game.customGrid = null;
      game.constructionStageActive = false;
      game.stage = 1;
      game.screen = "title";
      game.paused = false;
      game.demoMode = false;
      fn.resetTitleIdleTimer();
      game.editorMoveHoldTimer = 0;
    }

    function testEditorStage() {
      if (!game.editorGrid) return;
      var pack = deps.createEditorStagePack(game.editorGrid);
      var result = deps.tryNormalizeStagePack(pack);
      if (!result.ok) {
        showEditorMessage("BAD");
        return;
      }
      fn.startGame(1, { stage: 1, customGrid: deps.parseStageQuadrants(pack.quadrants[0]) });
    }

    function saveEditorStage() {
      if (!game.editorGrid) return;
      try {
        localStorage.setItem(shared.EDITOR_STORAGE_KEY, deps.serializeEditorStage(game.editorGrid));
        showEditorMessage("SAVED");
        fn.playSound("editorSave");
      } catch (error) {
        showEditorMessage("ERR");
      }
    }

    function loadEditorStage() {
      try {
        var raw = localStorage.getItem(shared.EDITOR_STORAGE_KEY);
        if (!raw) {
          showEditorMessage("EMPTY");
          return;
        }
        var result = deps.parseEditorStageText(raw);
        if (!result.ok) {
          showEditorMessage(result.kind === "stage" ? "BAD" : "ERR");
          return;
        }
        game.editorGrid = result.grid;
        showEditorMessage("LOADED");
        fn.playSound("editorLoad");
      } catch (error) {
        showEditorMessage("ERR");
      }
    }

    function clearEditorStage() {
      game.editorGrid = deps.makeOriginalConstructionGrid();
      game.editorCursor = { qc: 0, qr: 0 };
      game.editorPattern = 0;
      game.editorPatternArmed = false;
      game.editorMoveHoldTimer = 0;
      game.editorBrush = deps.ORIGINAL_EDITOR_PATTERNS[0].type;
      showEditorMessage("CLEAR");
      fn.playSound("editorClear");
    }

    function exportEditorStage() {
      if (!game.editorGrid) return;
      var text = deps.serializeEditorStagePack(game.editorGrid);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            // Clipboard write succeeded.
          });
          showEditorMessage("COPIED");
        } else {
          console.log(text);
          showEditorMessage("LOGGED");
        }
      } catch (error) {
        console.log(text);
        showEditorMessage("LOGGED");
      }
    }

    function importStagePackFile() {
      if (state.packFileInput) state.packFileInput.click();
      else showEditorMessage("NOFILE");
    }

    function showEditorMessage(message) {
      game.editorMessage = message;
      game.editorMessageTimer = 120;
    }

    var api = {
      clearEditorStage: clearEditorStage,
      enterEditor: enterEditor,
      exitEditorToTitle: exitEditorToTitle,
      exportEditorStage: exportEditorStage,
      importStagePackFile: importStagePackFile,
      loadEditorStage: loadEditorStage,
      saveEditorStage: saveEditorStage,
      showEditorMessage: showEditorMessage,
      testEditorStage: testEditorStage
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEditorLifecycleRuntime: setupEditorLifecycleRuntime });
});
