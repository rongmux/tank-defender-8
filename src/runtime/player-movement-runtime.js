(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerMovementRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "advanceTankTracks",
    "gameSettings",
    "isPerpendicularTurn",
    "isTankOnIce",
    "moveTank",
    "playSound",
    "snapForDirection"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!Array.isArray(deps.DIR_X) || !Array.isArray(deps.DIR_Y)) {
      throw new Error("deps.DIR_X and deps.DIR_Y must be arrays");
    }
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns fixed-frame player movement, ice sliding, turn snapping, and track animation. */
  function setupPlayerMovementRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var fn = state.fn;
    var dirX = deps.DIR_X;
    var dirY = deps.DIR_Y;
    var advanceTankTracks = callbacks.advanceTankTracks;
    var gameSettings = callbacks.gameSettings;
    var isPerpendicularTurn = callbacks.isPerpendicularTurn;
    var isTankOnIce = callbacks.isTankOnIce;
    var moveTank = callbacks.moveTank;
    var playSound = callbacks.playSound;
    var snapForDirection = callbacks.snapForDirection;

    function updatePlayerMovement(player, desiredDir, stunned) {
      if (player.stun > 0 && !stunned) return;
      var onIce = isTankOnIce(player);
      var inputDir = stunned || (onIce && (player.slide & 16) !== 0) ? -1 : desiredDir;
      if (inputDir !== -1) {
        if (onIce && (player.slide & 31) === 0) {
          player.slide = gameSettings().playerMovement.iceSlideFrames;
          playSound("movementIce");
        }
        if (player.dir !== inputDir) {
          player.pendingSnap = isPerpendicularTurn(player.dir, inputDir);
          player.dir = inputDir;
        }
        if (player.pendingSnap) {
          snapForDirection(player);
          player.pendingSnap = false;
        }
        moveTank(player, dirX[player.dir] * player.speed, dirY[player.dir] * player.speed);
        advanceTankTracks(player);
      } else if (player.slide > 0 && onIce) {
        player.slide -= 1;
        moveTank(
          player,
          dirX[player.dir] * gameSettings().playerMovement.iceSlideSpeed,
          dirY[player.dir] * gameSettings().playerMovement.iceSlideSpeed
        );
        advanceTankTracks(player);
      }
    }

    var api = { updatePlayerMovement: updatePlayerMovement };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupPlayerMovementRuntime: setupPlayerMovementRuntime });
});
