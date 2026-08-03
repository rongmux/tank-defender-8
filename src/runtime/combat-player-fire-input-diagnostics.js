(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatPlayerFireInputDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds the fresh player fire-input diagnostic probe. */
  function createCombatPlayerFireInputDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var TILE = scope.TILE;
    var createPlayer = scope.createPlayer;
    var game = scope.game;
    var keys = scope.keys;
    var makeGrid = scope.makeGrid;
    var pendingFirePresses = scope.pendingFirePresses;
    var playerShootAudio = scope.playerShootAudio;
    var stopPlayerShootAudio = scope.stopPlayerShootAudio;
    var syncMovementIceAudioNodes = scope.syncMovementIceAudioNodes;
    var syncPlayerShootAudioNodes = scope.syncPlayerShootAudioNodes;
    var updatePlayers = scope.updatePlayers;

    return Object.freeze({
      debugPlayerFireInputProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions,
          powerUp: game.powerUp,
          playerCount: game.playerCount,
          tick: game.tick
        };
        var previousKeys = Array.from(keys);
        var previousFirePresses = Array.from(pendingFirePresses);
        var previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
        var player = createPlayer(1);
        var bulletCount = function () {
          return game.bullets.filter(function (bullet) { return bullet.ownerKey === "player:1"; }).length;
        };
        var updateWithPress = function () {
          pendingFirePresses.add("Space");
          game.tick += 1;
          updatePlayers();
          return bulletCount();
        };
        var updateWithoutPress = function () {
          game.tick += 1;
          updatePlayers();
          return bulletCount();
        };

        try {
          stopPlayerShootAudio();
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [player];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.powerUp = null;
          game.playerCount = 1;
          game.tick = 0;
          keys.clear();
          keys.add("Space");
          pendingFirePresses.clear();
          player.x = 64;
          player.y = 64;
          player.spawnX = 64;
          player.spawnY = 64;
          player.alive = true;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.reload = 0;
          player.stun = 0;
          player.level = 0;

          var firstPress = updateWithPress();
          game.bullets = [];
          player.reload = 0;
          var heldAfterBulletClears = updateWithoutPress();
          var repressAfterRelease = updateWithPress();

          player.reload = 0;
          var fullSlotPress = updateWithPress();
          game.bullets = [];
          player.reload = 0;
          var fullSlotPressAfterClear = updateWithoutPress();
          var fullSlotRepress = updateWithPress();

          game.bullets = [];
          player.level = 2;
          player.reload = 0;
          var doubleShotCounts = [updateWithPress(), updateWithPress(), updateWithPress()];

          game.bullets = [];
          player.level = 0;
          player.reload = 0;
          player.spawnFlash = 2;
          var spawnPress = updateWithPress();
          player.spawnFlash = 0;
          var spawnPressAfterUnlock = updateWithoutPress();

          player.stun = 10;
          player.reload = 0;
          var stunnedPress = updateWithPress();

          return {
            firstPress: firstPress,
            heldAfterBulletClears: heldAfterBulletClears,
            repressAfterRelease: repressAfterRelease,
            fullSlotPress: fullSlotPress,
            fullSlotPressAfterClear: fullSlotPressAfterClear,
            fullSlotRepress: fullSlotRepress,
            doubleShotCounts: doubleShotCounts,
            spawnPress: spawnPress,
            spawnPressAfterUnlock: spawnPressAfterUnlock,
            stunnedPress: stunnedPress
          };
        } finally {
          stopPlayerShootAudio();
          keys.clear();
          for (var i = 0; i < previousKeys.length; i += 1) keys.add(previousKeys[i]);
          pendingFirePresses.clear();
          for (var j = 0; j < previousFirePresses.length; j += 1) pendingFirePresses.add(previousFirePresses[j]);
          Object.assign(game, previous);
          playerShootAudio.active = previousPlayerShoot.active;
          playerShootAudio.frame = previousPlayerShoot.frame;
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
        }
      }
    });
  }

  return Object.freeze({
    createCombatPlayerFireInputDiagnostics: createCombatPlayerFireInputDiagnostics
  });
});
