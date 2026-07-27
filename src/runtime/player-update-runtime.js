(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerUpdateRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "directionTowardTarget",
    "finishPlayerDeath",
    "gameSettings",
    "shoot",
    "updatePlayerMovement"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!Array.isArray(state.game.players)) {
      throw new Error("state.game.players must be an array");
    }
    if (!Array.isArray(state.game.enemies)) {
      throw new Error("state.game.enemies must be an array");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.keys || typeof state.keys.has !== "function") {
      throw new Error("state.keys must provide has");
    }
    if (!state.pendingFirePresses || typeof state.pendingFirePresses.clear !== "function") {
      throw new Error("state.pendingFirePresses must provide clear");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!deps.DEFAULT_PLAYER_MOVEMENT || !Array.isArray(deps.DEFAULT_PLAYER_MOVEMENT.frameCadence)) {
      throw new Error("deps.DEFAULT_PLAYER_MOVEMENT.frameCadence must be an array");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Registers fixed-frame player input, Demo control, movement cadence, and respawn updates. */
  function setupPlayerUpdateRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var keys = state.keys;
    var pendingFirePresses = state.pendingFirePresses;
    var shared = deps.sharedState;
    var defaultPlayerMovement = deps.DEFAULT_PLAYER_MOVEMENT;
    var directionTowardTarget = callbacks.directionTowardTarget;
    var finishPlayerDeath = callbacks.finishPlayerDeath;
    var gameSettings = callbacks.gameSettings;
    var shoot = callbacks.shoot;
    var updatePlayerMovement = callbacks.updatePlayerMovement;

    function isPlayerMovementFrame(tick) {
      var cadence = gameSettings().playerMovement.frameCadence || defaultPlayerMovement.frameCadence;
      var frame = Math.max(0, Math.floor(Number(tick) || 0));
      return cadence[frame % cadence.length];
    }

    function updatePlayers(inputEnabled) {
      if (game.demoMode) {
        updateDemoPlayers();
        return;
      }
      var controlsEnabled = inputEnabled !== false;
      var firePresses = controlsEnabled ? new Set(pendingFirePresses) : new Set();
      var movementFrame = isPlayerMovementFrame(game.frameLow);
      pendingFirePresses.clear();
      for (var i = 0; i < game.players.length; i += 1) {
        var player = game.players[i];
        var control = getPlayerControl(player.id);
        var firePressed = controlsEnabled && hasControlKey(control.fire, firePresses);
        if (player.respawn > 0) {
          if (deps.advancePlayerDestructionState(player, movementFrame)) finishPlayerDeath(player);
          continue;
        }
        if (!player.alive) continue;

        if (player.reload > 0) player.reload -= 1;
        if (player.spawnFlash > 0) {
          player.spawnFlash -= 1;
          if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
          continue;
        }
        if (movementFrame) {
          if (player.stun > 0) {
            player.stun -= 1;
            updatePlayerMovement(player, -1, true);
          } else {
            var desiredDir = -1;
            if (controlsEnabled && hasControlKey(control.up)) desiredDir = deps.UP;
            else if (controlsEnabled && hasControlKey(control.right)) desiredDir = deps.RIGHT;
            else if (controlsEnabled && hasControlKey(control.down)) desiredDir = deps.DOWN;
            else if (controlsEnabled && hasControlKey(control.left)) desiredDir = deps.LEFT;
            updatePlayerMovement(player, desiredDir);
          }
        }

        if (firePressed) shoot(player);
      }
    }

    function updateDemoPlayers() {
      pendingFirePresses.clear();
      for (var i = 0; i < game.players.length; i += 1) {
        var player = game.players[i];
        var movementFrame = isPlayerMovementFrame(game.frameLow);
        if (player.respawn > 0) {
          if (deps.advancePlayerDestructionState(player, movementFrame)) finishPlayerDeath(player);
          continue;
        }
        if (!player.alive) continue;
        if (player.reload > 0) player.reload -= 1;
        if (player.spawnFlash > 0) {
          player.spawnFlash -= 1;
          if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
          continue;
        }

        var control = demoControlForPlayer(player);
        if (movementFrame) {
          if (player.stun > 0) {
            player.stun -= 1;
            updatePlayerMovement(player, -1, true);
          } else {
            updatePlayerMovement(player, control.direction);
          }
        }
        if (control.fire) shoot(player);
      }
    }

    function demoControlForPlayer(player) {
      var target = demoTargetForPlayer(player);
      if (!target) return { direction: -1, fire: false, targetKind: "none", targetId: null };
      var horizontalFirst = ((((player.id - 1) << 1) ^ game.frameHigh) & 2) !== 0;
      return {
        direction: directionTowardTarget(player, target, horizontalFirst),
        fire: player.y < shared.FIELD_H - 32,
        targetKind: target.kind,
        targetId: target.id === undefined ? null : target.id
      };
    }

    function demoTargetForPlayer(player) {
      if (game.powerUp) {
        return {
          kind: "powerUp",
          id: game.powerUp.type,
          x: game.powerUp.x + game.powerUp.w / 2,
          y: game.powerUp.y + game.powerUp.h / 2
        };
      }
      var slotOrder = player.id === 2 ? [3, 5, 4] : [2, 4, 3];
      for (var i = 0; i < slotOrder.length; i += 1) {
        var slotIndex = slotOrder[i];
        var enemy = game.enemies.find(function (candidate) {
          return candidate.alive && !candidate.destroying && candidate.spawnFlash <= 0 && candidate.slotIndex === slotIndex;
        });
        if (enemy) {
          return {
            kind: "enemy",
            id: enemy.id,
            x: enemy.x + enemy.w / 2,
            y: enemy.y + enemy.h / 2
          };
        }
      }
      return null;
    }

    function getPlayerControl(id) {
      if (id === 1) {
        var control = { up: "ArrowUp", right: "ArrowRight", down: "ArrowDown", left: "ArrowLeft", fire: "Space" };
        if (game.playerCount < 2) {
          control.up = ["ArrowUp", "KeyW"];
          control.right = ["ArrowRight", "KeyD"];
          control.down = ["ArrowDown", "KeyS"];
          control.left = ["ArrowLeft", "KeyA"];
        }
        return control;
      }
      return { up: "KeyW", right: "KeyD", down: "KeyS", left: "KeyA", fire: "KeyF" };
    }

    function hasControlKey(binding, source) {
      var pressed = source || keys;
      if (Array.isArray(binding)) return binding.some(function (key) { return pressed.has(key); });
      return pressed.has(binding);
    }

    var api = {
      updatePlayers: updatePlayers,
      updateDemoPlayers: updateDemoPlayers,
      demoControlForPlayer: demoControlForPlayer,
      demoTargetForPlayer: demoTargetForPlayer,
      isPlayerMovementFrame: isPlayerMovementFrame,
      getPlayerControl: getPlayerControl,
      hasControlKey: hasControlKey
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupPlayerUpdateRuntime: setupPlayerUpdateRuntime });
});
