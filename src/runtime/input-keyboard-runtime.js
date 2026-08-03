(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.inputKeyboardRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

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

  /** Builds browser keyboard handlers while leaving screen transitions behind callbacks. */
  function createInputKeyboardHandlers(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var callbacks = scope.callbacks;
    var commandApi = scope.commandApi;
    var game = scope.game;
    var isEditorDirectionCode = scope.isEditorDirectionCode;
    var keys = scope.keys;
    var pendingFirePresses = scope.pendingFirePresses;
    var pendingStageSelectPresses = scope.pendingStageSelectPresses;

    function callback(name) {
      return callbacks[name];
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
        } else if (isEditorDirectionCode(event.code)) {
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

    return Object.freeze({ handleKeyDown: handleKeyDown, handleKeyUp: handleKeyUp });
  }

  return Object.freeze({ createInputKeyboardHandlers: createInputKeyboardHandlers });
});
