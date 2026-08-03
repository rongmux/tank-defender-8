(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.inputRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "activateTitleMenu",
    "beginStageSelect",
    "clearEditorStage",
    "endTitleDemo",
    "enterEditor",
    "exitEditorToTitle",
    "exportEditorStage",
    "handleFullGameOverInput",
    "hiddenMessageTriggerReady",
    "importStagePackFile",
    "initAudio",
    "loadEditorStage",
    "loadStagePackJsonText",
    "moveEditorFromCode",
    "moveTitleMenu",
    "nextStage",
    "paintEditorCell",
    "paintEditorQuadrant",
    "playSound",
    "recordHiddenTitleInput",
    "reserveTitleDirectionForHiddenInput",
    "restoreBuiltInStagePack",
    "saveEditorStage",
    "selectEditorBrush",
    "setTitleMenu",
    "showEditorMessage",
    "stageEnemiesCleared",
    "startHiddenMessage",
    "startSelectedGame",
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
    "testEditorStage",
    "cycleEditorCell",
    "cycleEditorQuadrant",
    "useOriginalEditorButton"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.canvas || typeof state.canvas.addEventListener !== "function") {
      throw new Error("state.canvas must provide addEventListener");
    }
    if (!state.keys || typeof state.keys.has !== "function" || typeof state.keys.add !== "function") {
      throw new Error("state.keys must provide has and add");
    }
    if (!state.pendingFirePresses || typeof state.pendingFirePresses.clear !== "function") {
      throw new Error("state.pendingFirePresses must provide clear");
    }
    if (!state.pendingStageSelectPresses || typeof state.pendingStageSelectPresses.add !== "function") {
      throw new Error("state.pendingStageSelectPresses must provide add");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.isEditorDirectionCode !== "function") {
      throw new Error("deps.isEditorDirectionCode must be a function");
    }
    if (!deps.inputCommandRuntime || typeof deps.inputCommandRuntime.setupInputCommandRuntime !== "function") {
      throw new Error("deps.inputCommandRuntime must provide setupInputCommandRuntime");
    }
    if (!deps.inputKeyboardRuntime || typeof deps.inputKeyboardRuntime.createInputKeyboardHandlers !== "function") {
      throw new Error("deps.inputKeyboardRuntime must provide createInputKeyboardHandlers");
    }
    if (!deps.dom || typeof deps.dom !== "object") throw new Error("deps.dom must be an object");
    if (!deps.dom.document || typeof deps.dom.document.querySelectorAll !== "function") {
      throw new Error("deps.dom.document must provide querySelectorAll");
    }
    if (!deps.dom.window || typeof deps.dom.window.addEventListener !== "function") {
      throw new Error("deps.dom.window must provide addEventListener");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns browser input routing while leaving all gameplay changes behind explicit callbacks. */
  function setupInputRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var keys = state.keys;
    var pendingFirePresses = state.pendingFirePresses;
    var pendingStageSelectPresses = state.pendingStageSelectPresses;
    var canvas = state.canvas;
    var packFileInput = state.packFileInput;
    var shared = deps.sharedState;
    var document = deps.dom.document;
    var window = deps.dom.window;
    var commandApi = deps.inputCommandRuntime.setupInputCommandRuntime(state, callbacks);
    var keyboardApi = deps.inputKeyboardRuntime.createInputKeyboardHandlers({
      callbacks: callbacks,
      commandApi: commandApi,
      game: game,
      isEditorDirectionCode: deps.isEditorDirectionCode,
      keys: keys,
      pendingFirePresses: pendingFirePresses,
      pendingStageSelectPresses: pendingStageSelectPresses
    });

    function callback(name) {
      return callbacks[name];
    }

    function canvasToGame(event) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * shared.SCREEN_W,
        y: ((event.clientY - rect.top) / rect.height) * shared.SCREEN_H
      };
    }

    function handleFileChange() {
      var file = packFileInput.files && packFileInput.files[0];
      if (!file) return;
      return Promise.resolve()
        .then(function () { return file.text(); })
        .then(function (text) {
          var result = callback("loadStagePackJsonText")(text);
          callback("showEditorMessage")(result.ok ? "IMPORTED" : "BAD");
          if (!result.ok) console.warn(result.error);
        })
        .catch(function (error) {
          callback("showEditorMessage")("ERR");
          console.warn(error);
        })
        .then(function () {
          packFileInput.value = "";
        });
    }

    function handleMouseMove(event) {
      if (game.screen !== "editor") return;
      var pos = canvasToGame(event);
      game.editorCursor = {
        qc: Math.floor((pos.x - shared.FIELD_X) / shared.HALF),
        qr: Math.floor((pos.y - shared.FIELD_Y) / shared.HALF)
      };
    }

    function handleMouseLeave() {
      game.editorCursor = { qc: -1, qr: -1 };
    }

    function handleCanvasClick(event) {
      if (game.screen !== "editor") return;
      callback("initAudio")();
      var pos = canvasToGame(event);
      if (pos.x >= shared.PANEL_X) return;
      if (event.shiftKey) {
        if (event.altKey) {
          callback("cycleEditorCell")(
            Math.floor((pos.x - shared.FIELD_X) / shared.TILE),
            Math.floor((pos.y - shared.FIELD_Y) / shared.TILE)
          );
        } else {
          callback("paintEditorCell")(
            Math.floor((pos.x - shared.FIELD_X) / shared.TILE),
            Math.floor((pos.y - shared.FIELD_Y) / shared.TILE)
          );
        }
      } else if (event.altKey) {
        callback("cycleEditorQuadrant")(
          Math.floor((pos.x - shared.FIELD_X) / shared.HALF),
          Math.floor((pos.y - shared.FIELD_Y) / shared.HALF)
        );
      } else {
        callback("paintEditorQuadrant")(
          Math.floor((pos.x - shared.FIELD_X) / shared.HALF),
          Math.floor((pos.y - shared.FIELD_Y) / shared.HALF)
        );
      }
    }

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () { commandApi.handleAction(button.dataset.action); });
    });
    if (packFileInput) packFileInput.addEventListener("change", handleFileChange);
    window.addEventListener("keydown", keyboardApi.handleKeyDown);
    window.addEventListener("keyup", keyboardApi.handleKeyUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleCanvasClick);

    var api = {
      handleAction: commandApi.handleAction,
      isPauseInputCode: commandApi.isPauseInputCode,
      togglePause: commandApi.togglePause,
      canvasToGame: canvasToGame
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupInputRuntime: setupInputRuntime });
});
