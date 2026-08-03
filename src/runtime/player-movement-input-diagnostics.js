(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerMovementInputDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds WASD input, turn alignment, and brick recovery probes. */
  function createPlayerMovementInputDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var BRICK = scope.BRICK;
    var DOWN = scope.DOWN;
    var HALF = scope.HALF;
    var LEFT = scope.LEFT;
    var RIGHT = scope.RIGHT;
    var TILE = scope.TILE;
    var UP = scope.UP;
    var createPlayer = scope.createPlayer;
    var entityRect = scope.entityRect;
    var game = scope.game;
    var keys = scope.keys;
    var makeCell = scope.makeCell;
    var makeGrid = scope.makeGrid;
    var quarterMaskFromBrickFragments = scope.quarterMaskFromBrickFragments;
    var setTile = scope.setTile;
    var solidTerrainOverlapArea = scope.solidTerrainOverlapArea;
    var updatePlayerMovement = scope.updatePlayerMovement;
    var updatePlayers = scope.updatePlayers;

    return Object.freeze({
      debugWasdDirectionProbe() {
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
        var previousKeys = Array.from(keys);
        var makeReadyPlayer = function (id, x, y) {
          var player = createPlayer(id);
          player.x = x;
          player.y = y;
          player.spawnX = x;
          player.spawnY = y;
          player.dir = UP;
          player.alive = true;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.stun = 0;
          player.reload = 0;
          player.slide = 0;
          player.pendingSnap = false;
          return player;
        };

        try {
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];
          game.bullets = [];
          game.powerUp = null;
          game.tick = 1;

          keys.clear();
          game.playerCount = 1;
          var singlePlayer = makeReadyPlayer(1, 32, 32);
          game.players = [singlePlayer];
          var singleBefore = { x: singlePlayer.x, y: singlePlayer.y, dir: singlePlayer.dir };
          keys.add("KeyD");
          updatePlayers();
          var singleAfter = { x: singlePlayer.x, y: singlePlayer.y, dir: singlePlayer.dir };

          keys.clear();
          game.playerCount = 2;
          var p1 = makeReadyPlayer(1, 32, 32);
          var p2 = makeReadyPlayer(2, 80, 32);
          game.players = [p1, p2];
          var twoBefore = {
            p1: { x: p1.x, y: p1.y, dir: p1.dir },
            p2: { x: p2.x, y: p2.y, dir: p2.dir }
          };
          keys.add("KeyD");
          updatePlayers();
          var twoAfter = {
            p1: { x: p1.x, y: p1.y, dir: p1.dir },
            p2: { x: p2.x, y: p2.y, dir: p2.dir }
          };

          return {
            singleBefore: singleBefore,
            singleAfter: singleAfter,
            twoBefore: twoBefore,
            twoAfter: twoAfter
          };
        } finally {
          keys.clear();
          for (var keyIndex = 0; keyIndex < previousKeys.length; keyIndex += 1) {
            keys.add(previousKeys[keyIndex]);
          }
          Object.assign(game, previous);
        }
      },
      debugPlayerTurnAlignmentProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies
        };
        var makePlayer = function (dir) {
          var player = createPlayer(1);
          player.x = 67;
          player.y = 70;
          player.dir = dir;
          player.alive = true;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.stun = 0;
          player.slide = 0;
          player.pendingSnap = false;
          return player;
        };
        var run = function (fromDir, toDir) {
          var player = makePlayer(fromDir);
          game.players = [player];
          updatePlayerMovement(player, toDir);
          return { x: player.x, y: player.y, dir: player.dir, pendingSnap: player.pendingSnap };
        };

        try {
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];
          return {
            perpendicular: run(RIGHT, DOWN),
            reverse: run(RIGHT, LEFT),
            same: run(RIGHT, RIGHT),
            gridSize: HALF
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugPlayerBrickRecoveryProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies
        };
        var makePlayer = function (x, y, dir) {
          var player = createPlayer(1);
          player.x = x;
          player.y = y;
          player.dir = dir;
          player.alive = true;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.stun = 0;
          player.slide = 0;
          player.pendingSnap = false;
          return player;
        };

        try {
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];

          game.grid = makeGrid();
          var turnCell = makeCell(BRICK, 1);
          turnCell.brickMask = 1 << 1;
          turnCell.mask = quarterMaskFromBrickFragments(turnCell.brickMask);
          game.grid[5][5] = turnCell;
          var turningPlayer = makePlayer(69, 70, RIGHT);
          game.players = [turningPlayer];
          var turnBefore = {
            x: turningPlayer.x,
            y: turningPlayer.y,
            overlap: solidTerrainOverlapArea(entityRect(turningPlayer))
          };
          updatePlayerMovement(turningPlayer, DOWN);
          var turnAfter = {
            x: turningPlayer.x,
            y: turningPlayer.y,
            dir: turningPlayer.dir,
            overlap: solidTerrainOverlapArea(entityRect(turningPlayer))
          };

          game.grid = makeGrid();
          setTile(game.grid, 5, 11, BRICK, 15);
          var coveredPlayer = makePlayer(90, 177, RIGHT);
          game.players = [coveredPlayer];
          var overlapHistory = [solidTerrainOverlapArea(entityRect(coveredPlayer))];
          for (var step = 0; step < 6; step += 1) {
            updatePlayerMovement(coveredPlayer, RIGHT);
            overlapHistory.push(solidTerrainOverlapArea(entityRect(coveredPlayer)));
          }

          return {
            blockedTurnSnap: { before: turnBefore, after: turnAfter },
            restoredWallEscape: {
              x: coveredPlayer.x,
              y: coveredPlayer.y,
              overlapHistory: overlapHistory
            }
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createPlayerMovementInputDiagnostics: createPlayerMovementInputDiagnostics
  });
});
