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

  var HANDLED_CODES = Object.freeze([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "Enter",
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyF",
    "KeyG",
    "KeyZ",
    "Digit1",
    "Digit2",
    "KeyC",
    "KeyE",
    "KeyL",
    "KeyP",
    "KeyR",
    "KeyX",
    "Digit0",
    "Digit3",
    "Digit4",
    "Digit5",
    "Escape"
  ]);

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

    function handleKeyDown(event) {
      var wasHeld = keys.has(event.code);
      keys.add(event.code);
      if (HANDLED_CODES.indexOf(event.code) >= 0 && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      if (event.repeat || wasHeld) return;

      if (game.demoMode && (event.code === "Enter" || event.code === "Space" || event.code === "Escape")) {
        keys.delete(event.code);
        callback("endTitleDemo")();
        return;
      }
      callback("initAudio")();

      if (game.screen === "playing" && !game.paused) pendingFirePresses.add(event.code);

      if (game.screen === "title") {
        if (callback("recordHiddenTitleInput")(event.code)) return;
        if (event.code === "Enter" && callback("hiddenMessageTriggerReady")()) callback("startHiddenMessage")();
        else if (event.code === "Enter" || event.code === "Space") callback("activateTitleMenu")();
        else if (event.code === "Digit1") {
          callback("setTitleMenu")(0);
          callback("beginStageSelect")(1);
        } else if (event.code === "Digit2") {
          callback("setTitleMenu")(1);
          callback("beginStageSelect")(2);
        } else if (event.code === "ArrowUp" || event.code === "KeyW") {
          callback("moveTitleMenu")(-1);
        } else if (event.code === "ArrowDown" || event.code === "KeyS") {
          if (!callback("reserveTitleDirectionForHiddenInput")(event.code)) callback("moveTitleMenu")(1);
        } else if (event.code === "KeyC" || event.code === "KeyE") {
          callback("setTitleMenu")(2);
          callback("enterEditor")();
        }
      } else if (game.screen === "stageSelect") {
        if (event.code === "Enter") callback("startSelectedGame")();
        else if (event.code === "Space" || event.code === "KeyZ") pendingStageSelectPresses.add(event.code);
        else if (event.code === "KeyF" || event.code === "KeyX") pendingStageSelectPresses.add(event.code);
        else if (event.code === "Escape") {
          pendingStageSelectPresses.clear();
          game.screen = "title";
          game.stage = 1;
        }
      } else if (game.screen === "editor") {
        if (event.ctrlKey && event.code === "KeyS") {
          keys.delete(event.code);
          callback("saveEditorStage")();
        } else if (event.ctrlKey && event.code === "KeyX") {
          keys.delete(event.code);
          callback("exportEditorStage")();
        } else if (deps.isEditorDirectionCode(event.code)) {
          callback("moveEditorFromCode")(event.code);
        } else if (event.code === "Space" || event.code === "KeyZ") {
          callback("useOriginalEditorButton")(1);
        } else if (event.code === "KeyF" || event.code === "KeyX") {
          callback("useOriginalEditorButton")(-1);
        } else if (event.code === "Enter") {
          callback("exitEditorToTitle")();
        } else if (event.code === "KeyE") {
          callback("testEditorStage")();
        } else if (event.code === "KeyL") {
          callback("loadEditorStage")();
        } else if (event.code === "KeyR") {
          callback("clearEditorStage")();
        } else if (/^Digit[0-5]$/.test(event.code)) {
          callback("selectEditorBrush")(Number(event.code.slice(-1)));
        } else if (event.code === "Escape") {
          callback("exitEditorToTitle")();
        }
      } else if (game.screen === "gameOver") {
        return;
      } else if (game.screen === "fullGameOver") {
        callback("handleFullGameOverInput")(event.code);
      } else if (game.screen === "highScore" || game.screen === "hiddenMessage") {
        return;
      } else if (game.screen === "stageClear" || game.screen === "stageClearClosing") {
        return;
      } else if (commandApi.isPauseInputCode(event.code)) {
        commandApi.togglePause();
      }
    }

    function handleKeyUp(event) {
      keys.delete(event.code);
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
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
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
