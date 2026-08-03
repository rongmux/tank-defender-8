(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Preserves each legacy adapter's receiver while building an explicit probe scope. */
  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter((entry) => typeof entry[1] === "function")
        .map((entry) => [entry[0], entry[1].bind(source)])
    );
  }

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.audio || typeof state.audio !== "object") {
      throw new Error("state.audio must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  function createRuntimeScope(state, deps) {
    requireInputs(state, deps);
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn),
      game: state.game,
      powerUpPickupAudio: state.audio.powerUpPickup,
      powerTypes: deps.POWER_UP_TYPES,
      originalPowerUpRandomTable: deps.ORIGINAL_POWER_UP_RANDOM_TABLE
    };
  }

  /** Binds power-up randomization, collection, rendering, and spawn probes. */
  function createPowerUpDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      aiRoll,
      battleDisplayFrame,
      BRICK,
      buildBaseWall,
      canPlayerCollectPowerUp,
      canPowerUpSpawnAt,
      clearPowerUpForCarrierSpawn,
      clearTile,
      cloneGrid,
      collectPowerUp,
      createPlayer,
      createPowerUpPresentationDiagnostics,
      createPowerUpSpawnDiagnostics,
      enemyTypeDefinitions,
      FIELD_X,
      FIELD_Y,
      findPowerUpCollector,
      FOREST,
      FREE_SPRITE_MANIFEST,
      game,
      gameSettings,
      GRID,
      ICE,
      isPowerUpVisible,
      makeCell,
      makeGrid,
      originalPowerUpRandomTable,
      pickPowerUpSpawnSpot,
      powerTypes,
      POWERUP_SIZE,
      powerUpPickupAudio,
      powerUpPickupAudioAudible,
      powerUpPixelToTilePoint,
      powerUpSpawnCandidates,
      powerUpSpawnKey,
      preparePausedDebugBattle,
      randomByte,
      randomPowerUpType,
      renderGame,
      resetPowerUpSpawnBag,
      scorePopupPresentation,
      selectPowerUpSpawnSpot,
      setTile,
      STEEL,
      stopPowerUpPickupAudio,
      syncMovementAudio,
      syncPowerUpPickupAudioNodes,
      TILE,
      tileTypeName,
      UP,
      update,
      updatePowerUp,
      updateScorePopups,
      updateShovelTimer,
      WATER,
      waterFrameName
    } = scope;

    return Object.freeze({
        ...createPowerUpPresentationDiagnostics(scope),
        debugPowerUpTtlProbe(ttl) {
          const previousPowerUp = game.powerUp;
          game.powerUp = { type: "helmet", x: 0, y: 0, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: Math.max(0, Math.floor(Number(ttl) || 0)) };
          updatePowerUp();
          const result = {
            survives: Boolean(game.powerUp),
            ttl: game.powerUp ? game.powerUp.ttl : 0
          };
          game.powerUp = previousPowerUp;
          return result;
        },
        debugPowerUpPickupBoundaryProbe() {
          const player = { alive: true, respawn: 0, spawnFlash: 0, stun: 0, invuln: 0, x: 63, y: 63, w: 14, h: 14 };
          const power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
          const check = (centerDx, centerDy) => canPlayerCollectPowerUp({
            ...player,
            x: power.x + power.w / 2 - player.w / 2 + centerDx,
            y: power.y + power.h / 2 - player.h / 2 + centerDy
          }, power);
          return {
            samePosition: check(0, 0),
            positiveEleven: check(11, 11),
            negativeEleven: check(-11, -11),
            positiveTwelveX: check(12, 0),
            negativeTwelveX: check(-12, 0),
            positiveTwelveY: check(0, 12),
            negativeTwelveY: check(0, -12),
            spawning: canPlayerCollectPowerUp({ ...player, spawnFlash: 1 }, power),
            respawning: canPlayerCollectPowerUp({ ...player, respawn: 1 }, power),
            dead: canPlayerCollectPowerUp({ ...player, alive: false }, power),
            stunned: canPlayerCollectPowerUp({ ...player, stun: 1 }, power),
            invulnerable: canPlayerCollectPowerUp({ ...player, invuln: 1 }, power)
          };
        },
        debugPowerUpPickupPriorityProbe() {
          const previousPlayers = game.players;
          const makePlayer = (id, spawnFlash) => ({ id, alive: true, respawn: 0, spawnFlash: spawnFlash || 0, x: 63, y: 63, w: 14, h: 14 });
          const power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
          try {
            const player1 = makePlayer(1);
            const player2 = makePlayer(2);
            game.players = [player1, player2];
            const simultaneous = findPowerUpCollector(game.players, power);
            player2.spawnFlash = 1;
            const player2Spawning = findPowerUpCollector(game.players, power);
            game.players = [player1];
            const onePlayer = findPowerUpCollector(game.players, power);
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
          const previous = {
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
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const power = { type: "star", x: 34, y: 50, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          const player = {
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
            const pickupAudio = {
              active: powerUpPickupAudio.active,
              frame: powerUpPickupAudio.frame,
              audible: powerUpPickupAudioAudible()
            };
            const popup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
            const presentation = popup ? scorePopupPresentation(popup) : null;
            const laterPresentation = popup ? scorePopupPresentation({ ...popup, ttl: Math.max(1, popup.ttl - 24) }) : null;
            renderGame();
            let visibleFrames = 0;
            while (game.scorePopups.length) {
              visibleFrames += 1;
              updateScorePopups();
            }

            return {
              powerUpType: game.powerUp ? game.powerUp.type : null,
              playerLevel: player.level,
              playerScore: player.score,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              popup,
              presentation,
              laterPresentation,
              pickupAudio,
              visibleFrames,
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
          const previous = {
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
          const power = { type: "star", x: 48, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          const player = {
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
        },
        ...createPowerUpSpawnDiagnostics(scope),
    });
  }

  return Object.freeze({ createPowerUpDiagnostics });
});
