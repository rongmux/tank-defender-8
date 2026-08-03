(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerMovementMotionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds player movement cadence, track, and stun probes. */
  function createPlayerMovementMotionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var ICE = scope.ICE;
    var LEFT = scope.LEFT;
    var RIGHT = scope.RIGHT;
    var TILE = scope.TILE;
    var UP = scope.UP;
    var createPlayer = scope.createPlayer;
    var drawTank = scope.drawTank;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var hitTank = scope.hitTank;
    var isPlayerMovementFrame = scope.isPlayerMovementFrame;
    var isPlayerTankVisible = scope.isPlayerTankVisible;
    var makeGrid = scope.makeGrid;
    var playerShootAudio = scope.playerShootAudio;
    var setTile = scope.setTile;
    var shoot = scope.shoot;
    var stopPlayerShootAudio = scope.stopPlayerShootAudio;
    var syncMovementIceAudioNodes = scope.syncMovementIceAudioNodes;
    var syncPlayerShootAudioNodes = scope.syncPlayerShootAudioNodes;
    var tankTrackFrameName = scope.tankTrackFrameName;
    var updateEnemyMovement = scope.updateEnemyMovement;
    var updatePlayerMovement = scope.updatePlayerMovement;

    return Object.freeze({
      debugPlayerMovementCadenceProbe() {
        var previousTick = game.tick;
        try {
          var frames = [];
          for (var tick = 0; tick < 8; tick += 1) {
            game.tick = tick;
            frames.push({ tick: tick, active: isPlayerMovementFrame(tick) });
          }
          return {
            speed: gameSettings().playerMovement.speed,
            cadence: gameSettings().playerMovement.frameCadence.slice(),
            frames: frames,
            activeFrames: frames.filter(function (frame) { return frame.active; }).length,
            distanceOverEightFrames: (
              frames.filter(function (frame) { return frame.active; }).length *
              gameSettings().playerMovement.speed
            )
          };
        } finally {
          game.tick = previousTick;
        }
      },
      debugTankTrackAnimationProbe() {
        var previous = {
          tick: game.tick,
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies
        };
        try {
          game.tick = 0;
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];

          var player = createPlayer(1);
          Object.assign(player, {
            x: 32,
            y: 32,
            dir: RIGHT,
            alive: true,
            respawn: 0,
            spawnFlash: 0,
            invuln: 0,
            stun: 0,
            slide: 0,
            trackPhase: 0
          });
          game.players = [player];
          var playerInitial = {
            x: player.x,
            phase: player.trackPhase,
            frame: tankTrackFrameName(player)
          };
          updatePlayerMovement(player, RIGHT);
          var playerMoved = {
            x: player.x,
            phase: player.trackPhase,
            frame: tankTrackFrameName(player)
          };
          player.x = 0;
          player.dir = LEFT;
          updatePlayerMovement(player, LEFT);
          var playerBlocked = {
            x: player.x,
            phase: player.trackPhase,
            frame: tankTrackFrameName(player)
          };
          updatePlayerMovement(player, -1);
          var playerIdle = {
            x: player.x,
            phase: player.trackPhase,
            frame: tankTrackFrameName(player)
          };

          setTile(game.grid, 2, 2, ICE, 15);
          Object.assign(player, { x: 32, y: 32, dir: RIGHT, slide: 2, trackPhase: 0 });
          updatePlayerMovement(player, -1);
          var playerIceCoast = {
            x: player.x,
            slide: player.slide,
            phase: player.trackPhase,
            frame: tankTrackFrameName(player)
          };

          game.players = [];
          var enemy = {
            kind: "enemy",
            id: 100,
            slotIndex: 2,
            x: 32,
            y: 48,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            alternateMovement: false,
            blockedPauseTicks: 0,
            pendingTurn: false,
            trackPhase: 0,
            alive: true
          };
          game.enemies = [enemy];
          updateEnemyMovement(enemy, function () { return 1 / 256; });
          var enemyMoved = {
            x: enemy.x,
            phase: enemy.trackPhase,
            frame: tankTrackFrameName(enemy)
          };
          Object.assign(enemy, {
            x: scope.FIELD_W - enemy.w,
            dir: RIGHT,
            blockedPauseTicks: 0,
            pendingTurn: false
          });
          updateEnemyMovement(enemy, function () { return 1 / 256; });
          var enemyBlocked = {
            x: enemy.x,
            phase: enemy.trackPhase,
            frame: tankTrackFrameName(enemy),
            blockedPauseTicks: enemy.blockedPauseTicks
          };
          var renderedTank = {
            kind: "enemy",
            x: 0,
            y: 0,
            dir: UP,
            trackPhase: 1
          };
          drawTank(renderedTank, "#e3c64e", "#fff0a8");

          return {
            player: {
              initial: playerInitial,
              moved: playerMoved,
              blocked: playerBlocked,
              idle: playerIdle,
              iceCoast: playerIceCoast
            },
            enemy: { moved: enemyMoved, blocked: enemyBlocked },
            render: {
              x: scope.FIELD_X,
              y: scope.FIELD_Y,
              frame: tankTrackFrameName(renderedTank),
              primary: "#e3c64e",
              shadow: "#111111"
            },
            frames: [
              tankTrackFrameName({ dir: UP, trackPhase: 0 }),
              tankTrackFrameName({ dir: UP, trackPhase: 1 }),
              tankTrackFrameName({ dir: LEFT, trackPhase: 0 }),
              tankTrackFrameName({ dir: LEFT, trackPhase: 1 })
            ]
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugFriendlyFireDurationProbe() {
        var remaining = gameSettings().friendlyFire.stunFrames;
        var displayFrames = 0;
        while (remaining > 0 && displayFrames < 10000) {
          displayFrames += 1;
          if (isPlayerMovementFrame(displayFrames)) remaining -= 1;
        }
        return {
          stunTicks: gameSettings().friendlyFire.stunFrames,
          displayFrames: displayFrames,
          remaining: remaining,
          visibility: [0, 7, 8, 15, 16].map(function (tick) {
            return {
              tick: tick,
              visible: isPlayerTankVisible({ stun: 1 }, tick)
            };
          })
        };
      },
      debugFriendlyFireRefreshProbe() {
        var previous = {
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions
        };
        var target = {
          kind: "player",
          id: 1,
          x: 32,
          y: 32,
          w: 14,
          h: 14,
          alive: true,
          spawnFlash: 0,
          stun: 37
        };
        try {
          game.players = [target];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          var bullet = {
            x: target.x + 2,
            y: target.y + 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 2,
            ownerKey: "player:2",
            remove: false
          };
          hitTank(bullet);
          return { before: 37, after: target.stun, bulletRemoved: bullet.remove };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugPlayerStunProbe() {
        var previousPlayerShoot = {
          active: playerShootAudio.active,
          frame: playerShootAudio.frame
        };
        var player = {
          kind: "player",
          id: 1,
          x: 16,
          y: 16,
          w: 14,
          h: 14,
          dir: UP,
          speed: gameSettings().playerMovement.speed,
          stun: gameSettings().friendlyFire.stunFrames || 1,
          slide: gameSettings().playerMovement.iceSlideFrames,
          pendingSnap: false,
          alive: true,
          reload: 0,
          spawnFlash: 0,
          level: 0
        };
        var before = { x: player.x, y: player.y, dir: player.dir, slide: player.slide };
        updatePlayerMovement(player, RIGHT);
        var previousBullets = game.bullets;
        game.bullets = [];
        stopPlayerShootAudio();
        shoot(player);
        var fired = game.bullets.length === 1;
        game.bullets = previousBullets;
        var result = {
          before: before,
          after: {
            x: player.x,
            y: player.y,
            dir: player.dir,
            slide: player.slide,
            pendingSnap: player.pendingSnap
          },
          turned: player.dir === RIGHT,
          moved: player.x !== before.x || player.y !== before.y,
          fired: fired
        };
        stopPlayerShootAudio();
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        return result;
      }
    });
  }

  return Object.freeze({
    createPlayerMovementMotionDiagnostics: createPlayerMovementMotionDiagnostics
  });
});
