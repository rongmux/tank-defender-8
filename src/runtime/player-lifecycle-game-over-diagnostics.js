(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerLifecycleGameOverDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds player-specific Game Over message and rendering probes. */
  function createPlayerLifecycleGameOverDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD = scope.PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD;
    var PLAYER_GAME_OVER_MESSAGE_TIMER = scope.PLAYER_GAME_OVER_MESSAGE_TIMER;
    var PLAYER_GAME_OVER_MESSAGE_Y = scope.PLAYER_GAME_OVER_MESSAGE_Y;
    var PLAYER_GAME_OVER_STAGE_END_DELAY = scope.PLAYER_GAME_OVER_STAGE_END_DELAY;
    var TILE = scope.TILE;
    var checkEndState = scope.checkEndState;
    var clamp = scope.clamp;
    var createPlayer = scope.createPlayer;
    var enemyTotal = scope.enemyTotal;
    var enterGameOver = scope.enterGameOver;
    var finishPlayerDeath = scope.finishPlayerDeath;
    var game = scope.game;
    var playerGameOverMessagePresentation = scope.playerGameOverMessagePresentation;
    var renderPlayerGameOverMessage = scope.renderPlayerGameOverMessage;
    var update = scope.update;
    var updatePlayerGameOverMessage = scope.updatePlayerGameOverMessage;

    return Object.freeze({
      debugPlayerGameOverMessageProbe() {
        var previous = {
          screen: game.screen,
          paused: game.paused,
          pauseElapsed: game.pauseElapsed,
          demoMode: game.demoMode,
          tick: game.tick,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh,
          playerCount: game.playerCount,
          players: game.players,
          enemies: game.enemies,
          enemySpawned: game.enemySpawned,
          enemyKilled: game.enemyKilled,
          base: game.base,
          clearPendingTimer: game.clearPendingTimer,
          playerGameOverMessage: game.playerGameOverMessage
        };
        var state = function () {
          var message = game.playerGameOverMessage;
          return message
            ? {
              playerId: message.playerId,
              timer: message.timer,
              x: message.x,
              y: message.y,
              dx: message.dx,
              presentation: playerGameOverMessagePresentation()
            }
            : null;
        };
        var setup = function (eliminatedId, partnerLives) {
          var p1 = createPlayer(1);
          var p2 = createPlayer(2);
          for (var playerIndex = 0; playerIndex < 2; playerIndex += 1) {
            var player = [p1, p2][playerIndex];
            player.spawnFlash = 0;
            player.invuln = 0;
            player.respawn = 0;
            player.destroying = false;
          }
          var eliminated = eliminatedId === 2 ? p2 : p1;
          var partner = eliminatedId === 2 ? p1 : p2;
          eliminated.alive = false;
          eliminated.destroying = true;
          eliminated.lives = 1;
          partner.lives = Math.max(0, Math.floor(Number(partnerLives) || 0));
          partner.alive = partner.lives > 0;
          game.screen = "playing";
          game.paused = false;
          game.pauseElapsed = 0;
          game.demoMode = false;
          game.tick = 0x123;
          game.frameLow = 0x23;
          game.frameHigh = 0x45;
          game.playerCount = 2;
          game.players = [p1, p2];
          game.enemies = [];
          game.enemySpawned = 0;
          game.enemyKilled = 0;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.clearPendingTimer = 0;
          game.playerGameOverMessage = null;
          finishPlayerDeath(eliminated);
          return { eliminated: eliminated, partner: partner, baseTick: game.tick, baseFrameHigh: game.frameHigh };
        };
        var run = function (playerId) {
          var context = setup(playerId, 2);
          var initial = Object.assign({}, state(), {
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          });
          var frames = [];
          var sampleFrames = new Set([0, 15, 16, 31, 32, 47, 48, 191, 192]);
          for (var frame = 0; frame <= 192; frame += 1) {
            game.tick = context.baseTick + frame;
            game.frameLow = frame & 0xff;
            updatePlayerGameOverMessage();
            if (sampleFrames.has(frame)) {
              frames.push(Object.assign({ frame: frame }, state()));
            }
          }
          return {
            initial: initial,
            frames: frames,
            eliminatedLives: context.eliminated.lives,
            partnerAlive: context.partner.alive
          };
        };

        try {
          var p1 = run(1);
          var p2 = run(2);

          setup(1, 2);
          game.paused = true;
          var pausedBefore = Object.assign({}, state(), {
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          });
          update();
          var pausedAfter = Object.assign({}, state(), {
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          });

          setup(1, 2);
          game.enemySpawned = enemyTotal();
          checkEndState();
          var clearDelay = {
            screen: game.screen,
            timer: game.clearPendingTimer,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            message: state()
          };

          setup(1, 0);
          var noSurvivingPartner = state();

          game.players = [game.players[0]];
          game.playerGameOverMessage = null;
          var solo = game.players[0];
          solo.lives = 1;
          solo.alive = false;
          solo.destroying = true;
          finishPlayerDeath(solo);
          var onePlayer = state();

          setup(1, 2);
          enterGameOver();
          var commonGameOver = {
            screen: game.screen,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            message: state()
          };

          return {
            initialTimer: PLAYER_GAME_OVER_MESSAGE_TIMER,
            moveThreshold: PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD,
            stageEndDelay: PLAYER_GAME_OVER_STAGE_END_DELAY,
            p1: p1,
            p2: p2,
            pausedBefore: pausedBefore,
            pausedAfter: pausedAfter,
            clearDelay: clearDelay,
            noSurvivingPartner: noSurvivingPartner,
            onePlayer: onePlayer,
            commonGameOver: commonGameOver
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugRenderPlayerGameOverMessage(playerId, elapsed) {
        var previous = {
          paused: game.paused,
          demoMode: game.demoMode,
          tick: game.tick,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh,
          playerGameOverMessage: game.playerGameOverMessage
        };
        var id = playerId === 2 ? 2 : 1;
        var frame = clamp(Math.floor(Number(elapsed) || 0), 0, 191);
        try {
          game.paused = false;
          game.demoMode = false;
          game.playerGameOverMessage = {
            playerId: id,
            timer: PLAYER_GAME_OVER_MESSAGE_TIMER,
            x: id === 2 ? 0xc0 : 0x20,
            y: PLAYER_GAME_OVER_MESSAGE_Y,
            dx: id === 2 ? -1 : 1
          };
          for (var current = 0; current <= frame; current += 1) {
            game.tick = current;
            game.frameLow = current & 0xff;
            updatePlayerGameOverMessage();
          }
          var presentation = playerGameOverMessagePresentation();
          renderPlayerGameOverMessage();
          return presentation;
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createPlayerLifecycleGameOverDiagnostics: createPlayerLifecycleGameOverDiagnostics
  });
});
