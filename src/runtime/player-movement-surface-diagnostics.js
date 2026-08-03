(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerMovementSurfaceDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds ice movement and terrain-layer rendering probes. */
  function createPlayerMovementSurfaceDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var DOWN = scope.DOWN;
    var FOREST = scope.FOREST;
    var GRID = scope.GRID;
    var ICE = scope.ICE;
    var LEFT = scope.LEFT;
    var POWERUP_SIZE = scope.POWERUP_SIZE;
    var RIGHT = scope.RIGHT;
    var STEEL = scope.STEEL;
    var TILE = scope.TILE;
    var createPlayer = scope.createPlayer;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var makeCell = scope.makeCell;
    var makeGrid = scope.makeGrid;
    var movementIceAudio = scope.movementIceAudio;
    var powerUpVisualRect = scope.powerUpVisualRect;
    var renderGame = scope.renderGame;
    var setTile = scope.setTile;
    var stopMovementIceAudio = scope.stopMovementIceAudio;
    var syncMovementIceAudioNodes = scope.syncMovementIceAudioNodes;
    var updatePlayerMovement = scope.updatePlayerMovement;

    return Object.freeze({
      debugIceMovementProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          powerUp: game.powerUp,
          playerCount: game.playerCount
        };
        var previousMovementIce = {
          active: movementIceAudio.active,
          frame: movementIceAudio.frame
        };
        var makePlayer = function (x, y, dir, slide) {
          var player = createPlayer(1);
          player.x = x;
          player.y = y;
          player.spawnX = x;
          player.spawnY = y;
          player.dir = dir;
          player.alive = true;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.stun = 0;
          player.reload = 0;
          player.slide = slide;
          player.pendingSnap = false;
          return player;
        };
        var iceGrid = function () {
          return Array.from(
            { length: GRID },
            function () { return Array.from({ length: GRID }, function () { return makeCell(ICE, 0); }); }
          );
        };

        try {
          stopMovementIceAudio();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];
          game.bullets = [];
          game.powerUp = null;
          game.playerCount = 1;

          game.grid = iceGrid();
          var entry = makePlayer(32, 32, RIGHT, 0);
          game.players = [entry];
          updatePlayerMovement(entry, RIGHT);
          var afterEntry = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
          for (var tick = 0; tick < 13; tick += 1) updatePlayerMovement(entry, LEFT);
          var afterForcedWindow = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
          updatePlayerMovement(entry, DOWN);
          var afterControlReturns = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };

          var tail = makePlayer(64, 64, RIGHT, 15);
          game.players = [tail];
          var tailStartX = tail.x;
          for (var tailTick = 0; tailTick < 15; tailTick += 1) updatePlayerMovement(tail, -1);
          var tailResult = { distance: tail.x - tailStartX, slide: tail.slide };

          game.grid = makeGrid();
          var offIce = makePlayer(64, 64, RIGHT, 10);
          game.players = [offIce];
          updatePlayerMovement(offIce, -1);
          var offIceResult = { x: offIce.x, slide: offIce.slide };
          setTile(game.grid, 4, 4, ICE, 0);
          updatePlayerMovement(offIce, -1);
          var reentered = { x: offIce.x, slide: offIce.slide };

          game.grid = makeGrid();
          setTile(game.grid, 2, 2, ICE, 0);
          setTile(game.grid, 3, 2, STEEL, 15);
          var blocked = makePlayer(34, 32, RIGHT, 5);
          game.players = [blocked];
          updatePlayerMovement(blocked, -1);
          var blockedResult = { x: blocked.x, slide: blocked.slide };

          game.grid = iceGrid();
          var stunned = makePlayer(32, 32, RIGHT, 3);
          stunned.stun = 5;
          game.players = [stunned];
          updatePlayerMovement(stunned, -1, true);
          var stunnedResult = { x: stunned.x, dir: stunned.dir, slide: stunned.slide };

          return {
            configuredTicks: gameSettings().playerMovement.iceSlideFrames,
            configuredSpeed: gameSettings().playerMovement.iceSlideSpeed,
            afterEntry: afterEntry,
            afterForcedWindow: afterForcedWindow,
            afterControlReturns: afterControlReturns,
            tailResult: tailResult,
            offIceResult: offIceResult,
            reentered: reentered,
            blockedResult: blockedResult,
            stunnedResult: stunnedResult
          };
        } finally {
          stopMovementIceAudio();
          Object.assign(game, previous);
          movementIceAudio.active = previousMovementIce.active;
          movementIceAudio.frame = previousMovementIce.frame;
          syncMovementIceAudioNodes();
        }
      },
      debugIceCoverRenderProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          powerUp: game.powerUp,
          playerCount: game.playerCount
        };
        var grid = makeGrid();
        setTile(grid, 6, 6, ICE, 0);
        game.grid = grid;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [];
        game.enemies = [];
        game.bullets = [{ x: 6 * TILE + 6, y: 6 * TILE + 6, w: 4, h: 4, ownerKind: "player" }];
        game.powerUp = null;
        game.playerCount = 1;
        renderGame();
        Object.assign(game, previous);
        return {
          bulletColor: "#f8e08b",
          iceCoverColor: "rgba(241, 248, 255, 0.72)"
        };
      },
      debugForestPowerUpLayerProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          powerUp: game.powerUp,
          playerCount: game.playerCount,
          tick: game.tick
        };
        var grid = makeGrid();
        setTile(grid, 6, 6, FOREST, 0);
        var power = {
          type: "star",
          x: 6 * TILE + 2,
          y: 6 * TILE + 2,
          w: POWERUP_SIZE,
          h: POWERUP_SIZE,
          ttl: 0
        };
        try {
          game.grid = grid;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [];
          game.enemies = [];
          game.bullets = [{ x: 6 * TILE + 6, y: 6 * TILE + 6, w: 4, h: 4, ownerKind: "player" }];
          game.powerUp = power;
          game.playerCount = 1;
          game.tick = 8;
          renderGame();
          return {
            forestColor: "#315b34",
            bulletColor: "#f8e08b",
            powerFrameColor: "#102748",
            powerRect: powerUpVisualRect(power)
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createPlayerMovementSurfaceDiagnostics: createPlayerMovementSurfaceDiagnostics
  });
});
