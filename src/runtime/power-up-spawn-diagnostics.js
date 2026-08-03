(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpSpawnDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds power-up terrain mutation, spawn, and carrier-clear probes. */
  function createPowerUpSpawnDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var BRICK = scope.BRICK;
    var buildBaseWall = scope.buildBaseWall;
    var canPowerUpSpawnAt = scope.canPowerUpSpawnAt;
    var clearPowerUpForCarrierSpawn = scope.clearPowerUpForCarrierSpawn;
    var clearTile = scope.clearTile;
    var cloneGrid = scope.cloneGrid;
    var collectPowerUp = scope.collectPowerUp;
    var createPlayer = scope.createPlayer;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var GRID = scope.GRID;
    var ICE = scope.ICE;
    var makeCell = scope.makeCell;
    var makeGrid = scope.makeGrid;
    var pickPowerUpSpawnSpot = scope.pickPowerUpSpawnSpot;
    var powerTypes = scope.powerTypes;
    var POWERUP_SIZE = scope.POWERUP_SIZE;
    var powerUpPixelToTilePoint = scope.powerUpPixelToTilePoint;
    var powerUpSpawnCandidates = scope.powerUpSpawnCandidates;
    var powerUpSpawnKey = scope.powerUpSpawnKey;
    var resetPowerUpSpawnBag = scope.resetPowerUpSpawnBag;
    var setTile = scope.setTile;
    var STEEL = scope.STEEL;
    var TILE = scope.TILE;
    var tileTypeName = scope.tileTypeName;
    var updateShovelTimer = scope.updateShovelTimer;
    var WATER = scope.WATER;

    return Object.freeze({
      debugPowerUpTerrainMutationProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          explosions: game.explosions,
          scorePopups: game.scorePopups,
          powerUp: game.powerUp,
          freezeTimer: game.freezeTimer,
          shovelTimer: game.shovelTimer,
          highScore: game.highScore,
          tick: game.tick,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh
        };
        var baseline = makeGrid();
        buildBaseWall(baseline, BRICK);
        setTile(baseline, 2, 8, ICE, 0);
        setTile(baseline, 10, 9, ICE, 0);
        var countIce = function (grid) {
          return grid.reduce(function (total, row) {
            return total + row.filter(function (cell) { return cell.type === ICE; }).length;
          }, 0);
        };
        var changesFrom = function (before, after) {
          var changes = [];
          for (var r = 0; r < GRID; r += 1) {
            for (var c = 0; c < GRID; c += 1) {
              var a = before[r][c];
              var b = after[r][c];
              if (a.type === b.type && a.mask === b.mask) continue;
              changes.push({ c: c, r: r, before: tileTypeName(a.type), after: tileTypeName(b.type) });
            }
          }
          return changes;
        };

        try {
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];
          game.explosions = [];
          game.scorePopups = [];
          game.freezeTimer = 0;
          game.shovelTimer = 0;
          return powerTypes.map(function (type) {
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            var before = cloneGrid(baseline);
            var player = createPlayer(1);
            player.spawnFlash = 0;
            player.invuln = 0;
            player.score = 0;
            player.stagePoints = 0;
            game.grid = cloneGrid(before);
            game.players = [player];
            game.powerUp = { type: type, x: player.x, y: player.y, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
            collectPowerUp(player, game.powerUp);
            var changes = changesFrom(before, game.grid);
            var afterIce = countIce(game.grid);
            var expiredIce = afterIce;
            var expiryChanges = changes;
            if (type === "shovel") {
              var guard = 0;
              while (game.shovelTimer > 0 && guard < 1000) {
                game.tick += 16;
                game.frameLow = (game.frameLow + 16) & 0xff;
                guard += 1;
                updateShovelTimer();
              }
              expiredIce = countIce(game.grid);
              expiryChanges = changesFrom(before, game.grid);
            }
            return {
              type: type,
              beforeIce: countIce(before),
              afterIce: afterIce,
              expiredIce: expiredIce,
              addedIce: changes.filter(function (change) { return change.after === "ice"; }),
              changes: changes,
              expiryChanges: expiryChanges
            };
          });
        } finally {
          Object.assign(game, previous);
        }
      },
      debugPowerUpSpawnTerrainProbe() {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          powerUp: game.powerUp,
          lastPowerUpSpawn: game.lastPowerUpSpawn,
          powerUpSpawnBag: game.powerUpSpawnBag.slice(),
          powerUpSpawnBagKey: game.powerUpSpawnBagKey
        };
        var steelSpot = { x: TILE + 2, y: TILE + 2 };
        var waterSpot = { x: 5 * TILE + 2, y: 5 * TILE + 2 };
        var brickSpot = { x: 9 * TILE + 2, y: 9 * TILE + 2 };
        var openSpot = { x: 2 * TILE + 2, y: TILE + 2 };

        try {
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [];
          game.enemies = [];
          game.powerUp = null;
          setTile(game.grid, 1, 1, STEEL);
          setTile(game.grid, 5, 5, WATER);
          setTile(game.grid, 9, 9, BRICK);

          var candidates = [steelSpot, waterSpot, brickSpot, openSpot];
          var openTiles = candidates.filter(canPowerUpSpawnAt).map(powerUpPixelToTilePoint);
          var candidateTiles = powerUpSpawnCandidates(candidates).map(powerUpPixelToTilePoint);
          game.lastPowerUpSpawn = powerUpSpawnKey(openSpot);
          var nonRepeatPick = pickPowerUpSpawnSpot(candidates);

          game.grid = Array.from({ length: GRID }, function () {
            return Array.from({ length: GRID }, function () { return makeCell(STEEL, 15); });
          });
          clearTile(game.grid, 3, 3);
          var fallback = pickPowerUpSpawnSpot([steelSpot]);

          return {
            openTiles: openTiles,
            candidateTiles: candidateTiles,
            nonRepeatTile: nonRepeatPick ? powerUpPixelToTilePoint(nonRepeatPick) : null,
            fallbackTile: fallback ? powerUpPixelToTilePoint(fallback) : null
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugPowerUpSpawnRandomProbe(count) {
        var previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          powerUp: game.powerUp,
          lastPowerUpSpawn: game.lastPowerUpSpawn,
          powerUpSpawnBag: game.powerUpSpawnBag.slice(),
          powerUpSpawnBagKey: game.powerUpSpawnBagKey
        };
        var spots = [
          { x: 2 * TILE + 2, y: 2 * TILE + 2 },
          { x: 4 * TILE + 2, y: 2 * TILE + 2 },
          { x: 8 * TILE + 2, y: 2 * TILE + 2 },
          { x: 10 * TILE + 2, y: 2 * TILE + 2 }
        ];

        try {
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [];
          game.enemies = [];
          game.powerUp = null;
          game.lastPowerUpSpawn = null;
          resetPowerUpSpawnBag();
          var candidateTiles = powerUpSpawnCandidates(spots).map(powerUpPixelToTilePoint);
          var pickCount = Math.max(1, Math.floor(Number(count) || spots.length * 2));
          var picks = [];
          for (var i = 0; i < pickCount; i += 1) {
            var picked = pickPowerUpSpawnSpot(spots, function () { return 0; });
            if (picked) picks.push(powerUpPixelToTilePoint(picked));
          }

          return {
            candidateTiles: candidateTiles,
            picks: picks,
            candidateCount: candidateTiles.length,
            pickedFromCandidates: picks.every(function (tile) {
              return candidateTiles.some(function (candidate) {
                return candidate.x === tile.x && candidate.y === tile.y;
              });
            }),
            uniquePickCount: new Set(picks.map(function (tile) { return tile.x + "," + tile.y; })).size,
            immediateRepeats: picks.some(function (tile, index) {
              return index > 0 && tile.x === picks[index - 1].x && tile.y === picks[index - 1].y;
            })
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugPowerUpSpawnRotationProbe(count) {
        return this.debugPowerUpSpawnRandomProbe(count);
      },
      debugCarrierSpawnClearsPowerUpProbe(carrier) {
        var previousPowerUp = game.powerUp;
        game.powerUp = { type: "helmet", x: 0, y: 0, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
        var cleared = clearPowerUpForCarrierSpawn(carrier !== false);
        var result = {
          cleared: cleared,
          hasPowerUp: Boolean(game.powerUp),
          rule: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn
        };
        game.powerUp = previousPowerUp;
        return result;
      }
    });
  }

  return Object.freeze({
    createPowerUpSpawnDiagnostics: createPowerUpSpawnDiagnostics
  });
});
