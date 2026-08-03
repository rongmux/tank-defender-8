(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpCollectionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds power-up TTL, collection, rendering, and footprint probes. */
  function createPowerUpCollectionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var BRICK = scope.BRICK;
    var buildBaseWall = scope.buildBaseWall;
    var canPlayerCollectPowerUp = scope.canPlayerCollectPowerUp;
    var enemyTypeDefinitions = scope.enemyTypeDefinitions;
    var FIELD_X = scope.FIELD_X;
    var FIELD_Y = scope.FIELD_Y;
    var findPowerUpCollector = scope.findPowerUpCollector;
    var FOREST = scope.FOREST;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var makeCell = scope.makeCell;
    var makeGrid = scope.makeGrid;
    var POWERUP_SIZE = scope.POWERUP_SIZE;
    var powerUpPickupAudio = scope.powerUpPickupAudio;
    var powerUpPickupAudioAudible = scope.powerUpPickupAudioAudible;
    var renderGame = scope.renderGame;
    var scorePopupPresentation = scope.scorePopupPresentation;
    var stopPowerUpPickupAudio = scope.stopPowerUpPickupAudio;
    var syncMovementAudio = scope.syncMovementAudio;
    var syncPowerUpPickupAudioNodes = scope.syncPowerUpPickupAudioNodes;
    var TILE = scope.TILE;
    var UP = scope.UP;
    var updatePowerUp = scope.updatePowerUp;
    var updateScorePopups = scope.updateScorePopups;

    return Object.freeze({
      debugPowerUpTtlProbe(ttl) {
        var previousPowerUp = game.powerUp;
        game.powerUp = {
          type: "helmet",
          x: 0,
          y: 0,
          w: POWERUP_SIZE,
          h: POWERUP_SIZE,
          ttl: Math.max(0, Math.floor(Number(ttl) || 0))
        };
        updatePowerUp();
        var result = {
          survives: Boolean(game.powerUp),
          ttl: game.powerUp ? game.powerUp.ttl : 0
        };
        game.powerUp = previousPowerUp;
        return result;
      },
      debugPowerUpPickupBoundaryProbe() {
        var player = {
          alive: true,
          respawn: 0,
          spawnFlash: 0,
          stun: 0,
          invuln: 0,
          x: 63,
          y: 63,
          w: 14,
          h: 14
        };
        var power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
        var check = function (centerDx, centerDy) {
          return canPlayerCollectPowerUp(Object.assign({}, player, {
            x: power.x + power.w / 2 - player.w / 2 + centerDx,
            y: power.y + power.h / 2 - player.h / 2 + centerDy
          }), power);
        };
        return {
          samePosition: check(0, 0),
          positiveEleven: check(11, 11),
          negativeEleven: check(-11, -11),
          positiveTwelveX: check(12, 0),
          negativeTwelveX: check(-12, 0),
          positiveTwelveY: check(0, 12),
          negativeTwelveY: check(0, -12),
          spawning: canPlayerCollectPowerUp(Object.assign({}, player, { spawnFlash: 1 }), power),
          respawning: canPlayerCollectPowerUp(Object.assign({}, player, { respawn: 1 }), power),
          dead: canPlayerCollectPowerUp(Object.assign({}, player, { alive: false }), power),
          stunned: canPlayerCollectPowerUp(Object.assign({}, player, { stun: 1 }), power),
          invulnerable: canPlayerCollectPowerUp(Object.assign({}, player, { invuln: 1 }), power)
        };
      },
      debugPowerUpPickupPriorityProbe() {
        var previousPlayers = game.players;
        var makePlayer = function (id, spawnFlash) {
          return {
            id: id,
            alive: true,
            respawn: 0,
            spawnFlash: spawnFlash || 0,
            x: 63,
            y: 63,
            w: 14,
            h: 14
          };
        };
        var power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
        try {
          var player1 = makePlayer(1);
          var player2 = makePlayer(2);
          game.players = [player1, player2];
          var simultaneous = findPowerUpCollector(game.players, power);
          player2.spawnFlash = 1;
          var player2Spawning = findPowerUpCollector(game.players, power);
          game.players = [player1];
          var onePlayer = findPowerUpCollector(game.players, power);
          return {
            simultaneousPlayerId: simultaneous ? simultaneous.id : null,
            player2SpawningPlayerId: player2Spawning ? player2Spawning.id : null,
            onePlayerId: onePlayer ? onePlayer.id : null
          };
        } finally {
          game.players = previousPlayers;
        }
      },
      debugPowerUpPickupRenderProbe() {
        var previous = {
          screen: game.screen,
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions,
          scorePopups: game.scorePopups,
          powerUp: game.powerUp,
          highScore: game.highScore,
          tick: game.tick,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh
        };
        var previousPowerUpPickup = {
          active: powerUpPickupAudio.active,
          frame: powerUpPickupAudio.frame
        };
        var power = { type: "star", x: 34, y: 50, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
        var player = {
          kind: "player",
          id: 1,
          x: power.x,
          y: power.y,
          w: 14,
          h: 14,
          dir: UP,
          speed: gameSettings().playerMovement.speed,
          alive: true,
          lives: 3,
          nextBonusLifeIndex: 0,
          respawn: 0,
          invuln: 0,
          stun: 0,
          pendingSnap: false,
          level: 0,
          reload: 0,
          score: 0,
          stagePoints: 0,
          stageKills: Array(enemyTypeDefinitions().length).fill(0),
          totalKills: Array(enemyTypeDefinitions().length).fill(0),
          slide: 0,
          color: "#e3c64e",
          accent: "#fff0a8"
        };

        try {
          stopPowerUpPickupAudio();
          game.screen = "playing";
          game.grid = makeGrid();
          buildBaseWall(game.grid, BRICK);
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [player];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          game.powerUp = power;

          updatePowerUp();
          var pickupAudio = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame,
            audible: powerUpPickupAudioAudible()
          };
          var popup = game.scorePopups[0] ? Object.assign({}, game.scorePopups[0]) : null;
          var presentation = popup ? scorePopupPresentation(popup) : null;
          var laterPresentation = popup
            ? scorePopupPresentation(Object.assign({}, popup, { ttl: Math.max(1, popup.ttl - 24) }))
            : null;
          renderGame();
          var visibleFrames = 0;
          while (game.scorePopups.length) {
            visibleFrames += 1;
            updateScorePopups();
          }

          return {
            powerUpType: game.powerUp ? game.powerUp.type : null,
            playerLevel: player.level,
            playerScore: player.score,
            pickupScore: gameSettings().powerUpRules.pickupScore,
            popup: popup,
            presentation: presentation,
            laterPresentation: laterPresentation,
            pickupAudio: pickupAudio,
            visibleFrames: visibleFrames,
            powerCenter: { x: power.x + power.w / 2, y: power.y + power.h / 2 },
            drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
          };
        } finally {
          stopPowerUpPickupAudio();
          Object.assign(game, previous);
          powerUpPickupAudio.active = previousPowerUpPickup.active;
          powerUpPickupAudio.frame = previousPowerUpPickup.frame;
          syncPowerUpPickupAudioNodes();
          syncMovementAudio();
        }
      },
      debugPowerUpFootprintClearProbe() {
        var previous = {
          screen: game.screen,
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions,
          scorePopups: game.scorePopups,
          powerUp: game.powerUp,
          highScore: game.highScore
        };
        var power = { type: "star", x: 48, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
        var player = {
          kind: "player",
          id: 1,
          x: power.x,
          y: power.y,
          w: 14,
          h: 14,
          dir: UP,
          speed: gameSettings().playerMovement.speed,
          alive: true,
          lives: 3,
          nextBonusLifeIndex: 0,
          respawn: 0,
          spawnFlash: 0,
          invuln: 0,
          stun: 0,
          pendingSnap: false,
          level: 0,
          reload: 0,
          score: 0,
          stagePoints: 0,
          stageKills: Array(enemyTypeDefinitions().length).fill(0),
          totalKills: Array(enemyTypeDefinitions().length).fill(0),
          slide: 0,
          color: "#e3c64e",
          accent: "#fff0a8"
        };

        try {
          game.screen = "playing";
          game.grid = makeGrid();
          game.grid[4][3] = makeCell(FOREST);
          buildBaseWall(game.grid, BRICK);
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [player];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          game.powerUp = power;

          renderGame();
          updatePowerUp();
          player.x = 160;
          player.y = 160;
          renderGame();

          return {
            powerUpType: game.powerUp ? game.powerUp.type : null,
            playerLevel: player.level,
            playerScore: player.score,
            pickupScore: gameSettings().powerUpRules.pickupScore,
            drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createPowerUpCollectionDiagnostics: createPowerUpCollectionDiagnostics
  });
});
