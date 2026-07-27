(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerLifecycleDiagnostics = api;
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
    if (!state.keys || typeof state.keys !== "object") {
      throw new Error("state.keys must be an object");
    }
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
      keys: state.keys,
      bonusLifeAudio: state.audio.bonusLife,
      playerDestroyAudio: state.audio.playerDestroy,
      powerUpPickupAudio: state.audio.powerUpPickup
    };
  }

  /** Binds player death, Game Over messaging, and bonus-life probes. */
  function createPlayerLifecycleDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD,
      PLAYER_GAME_OVER_MESSAGE_TIMER,
      PLAYER_GAME_OVER_MESSAGE_Y,
      PLAYER_GAME_OVER_STAGE_END_DELAY,
      POWERUP_SIZE,
      TILE,
      addPlayerScore,
      bonusLifeAudio,
      checkEndState,
      clamp,
      collectPowerUp,
      createPlayer,
      enemyTotal,
      enemyTypeDefinitions,
      enterGameOver,
      finishPlayerDeath,
      game,
      gameSettings,
      killPlayer,
      keys,
      makeGrid,
      playerDestroyAudio,
      playerDestructionPresentation,
      playerGameOverMessage,
      playerGameOverMessagePresentation,
      powerUpPickupAudio,
      powerUpPickupAudioAudible,
      renderPlayerGameOverMessage,
      stopBonusLifeAudio,
      stopPlayerDestroyAudio,
      stopPowerUpPickupAudio,
      syncBonusLifeAudioNodes,
      syncEnemyDestroyAudioNodes,
      syncMovementAudio,
      syncPlayerDestroyAudioNodes,
      syncPowerUpPickupAudioNodes,
      update,
      updatePlayerGameOverMessage,
      updatePlayers
    } = scope;

    return Object.freeze({
        debugPlayerDeathRespawnProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          const previousKeys = Array.from(keys);
          const makePlayer = (lives) => {
            const player = createPlayer(1);
            player.lives = lives;
            player.level = 3;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.reload = 0;
            player.slide = 0;
            return player;
          };

          try {
            stopPlayerDestroyAudio();
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.playerCount = 1;
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            keys.clear();

            const player = makePlayer(2);
            game.players = [player];
            killPlayer(player);
            const afterHit = {
              alive: player.alive,
              destroying: player.destroying,
              lives: player.lives,
              level: player.level,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };

            let deathDisplayFrames = 0;
            const deathPresentations = [];
            while (!player.alive && player.respawn > 0 && deathDisplayFrames < 1000) {
              deathPresentations.push(playerDestructionPresentation(player));
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              deathDisplayFrames += 1;
              updatePlayers();
            }
            const deathResolved = {
              tick: game.tick,
              alive: player.alive,
              destroying: player.destroying,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };

            let spawnDisplayFrames = 0;
            while (player.spawnFlash > 0 && spawnDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              spawnDisplayFrames += 1;
              updatePlayers();
            }
            const activated = {
              tick: game.tick,
              alive: player.alive,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };

            const lastLifePlayer = makePlayer(1);
            game.players = [lastLifePlayer];
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            killPlayer(lastLifePlayer);
            let lastLifeDisplayFrames = 0;
            while (lastLifePlayer.respawn > 0 && lastLifeDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              lastLifeDisplayFrames += 1;
              updatePlayers();
            }

            return {
              deathTicks: gameSettings().timings.playerRespawn,
              spawnTicks: gameSettings().timings.playerSpawnFlash,
              afterHit,
              deathDisplayFrames,
              destructionExplosionFrames: deathPresentations.filter((presentation) => presentation.kind === "explosion").length,
              destructionFinalFrames: deathPresentations.filter((presentation) => presentation.kind === "final").length,
              destructionPhases: deathPresentations
                .map((presentation) => presentation.phase)
                .filter((phase, index, phases) => index === 0 || phase !== phases[index - 1]),
              deathResolved,
              spawnDisplayFrames,
              totalDisplayFrames: deathDisplayFrames + spawnDisplayFrames,
              activated,
              lastLife: {
                displayFrames: lastLifeDisplayFrames,
                alive: lastLifePlayer.alive,
                destroying: lastLifePlayer.destroying,
                lives: lastLifePlayer.lives,
                respawn: lastLifePlayer.respawn
              }
            };
          } finally {
            stopPlayerDestroyAudio();
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerGameOverMessageProbe() {
          const previous = {
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
          const state = () => {
            const message = game.playerGameOverMessage;
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
          const setup = (eliminatedId, partnerLives) => {
            const p1 = createPlayer(1);
            const p2 = createPlayer(2);
            for (const player of [p1, p2]) {
              player.spawnFlash = 0;
              player.invuln = 0;
              player.respawn = 0;
              player.destroying = false;
            }
            const eliminated = eliminatedId === 2 ? p2 : p1;
            const partner = eliminatedId === 2 ? p1 : p2;
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
            return { eliminated, partner, baseTick: game.tick, baseFrameHigh: game.frameHigh };
          };
          const run = (playerId) => {
            const context = setup(playerId, 2);
            const initial = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
            const frames = [];
            const sampleFrames = new Set([0, 15, 16, 31, 32, 47, 48, 191, 192]);
            for (let frame = 0; frame <= 192; frame += 1) {
              game.tick = context.baseTick + frame;
              game.frameLow = frame & 0xff;
              updatePlayerGameOverMessage();
              if (sampleFrames.has(frame)) frames.push({ frame, ...state() });
            }
            return {
              initial,
              frames,
              eliminatedLives: context.eliminated.lives,
              partnerAlive: context.partner.alive
            };
          };

          try {
            const p1 = run(1);
            const p2 = run(2);

            setup(1, 2);
            game.paused = true;
            const pausedBefore = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
            update();
            const pausedAfter = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };

            setup(1, 2);
            game.enemySpawned = enemyTotal();
            checkEndState();
            const clearDelay = {
              screen: game.screen,
              timer: game.clearPendingTimer,
              tick: game.tick,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              message: state()
            };

            setup(1, 0);
            const noSurvivingPartner = state();

            game.players = [game.players[0]];
            game.playerGameOverMessage = null;
            const solo = game.players[0];
            solo.lives = 1;
            solo.alive = false;
            solo.destroying = true;
            finishPlayerDeath(solo);
            const onePlayer = state();

            setup(1, 2);
            enterGameOver();
            const commonGameOver = {
              screen: game.screen,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              message: state()
            };

            return {
              initialTimer: PLAYER_GAME_OVER_MESSAGE_TIMER,
              moveThreshold: PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD,
              stageEndDelay: PLAYER_GAME_OVER_STAGE_END_DELAY,
              p1,
              p2,
              pausedBefore,
              pausedAfter,
              clearDelay,
              noSurvivingPartner,
              onePlayer,
              commonGameOver
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderPlayerGameOverMessage(playerId, elapsed) {
          const previous = {
            paused: game.paused,
            demoMode: game.demoMode,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            playerGameOverMessage: game.playerGameOverMessage
          };
          const id = playerId === 2 ? 2 : 1;
          const frame = clamp(Math.floor(Number(elapsed) || 0), 0, 191);
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
            for (let current = 0; current <= frame; current += 1) {
              game.tick = current;
              game.frameLow = current & 0xff;
              updatePlayerGameOverMessage();
            }
            const presentation = playerGameOverMessagePresentation();
            renderPlayerGameOverMessage();
            return presentation;
          } finally {
            Object.assign(game, previous);
          }
        },
        debugLifeAwardProbe() {
          const previousHighScore = game.highScore;
          const previousScorePopups = game.scorePopups;
          const previousDemoMode = game.demoMode;
          const previousPowerUp = game.powerUp;
          const previousBonusLife = {
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame
          };
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const threshold = gameSettings().bonusLifeScores[0];
          const player = {
            id: 1,
            score: Math.max(0, threshold - 1),
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 1,
            level: 0,
            invuln: 0,
            alive: true
          };
          const tankPlayer = {
            ...player,
            score: 0,
            lives: 1,
            nextBonusLifeIndex: 0
          };

          try {
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            game.demoMode = false;
            game.scorePopups = [];
            addPlayerScore(player, 0);
            const beforeCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            addPlayerScore(player, 1);
            const afterCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            const thresholdAudio = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
            addPlayerScore(player, 1);
            const afterRepeat = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            stopBonusLifeAudio();
            const tankPowerUp = { type: "tank", x: 32, y: 48, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
            game.powerUp = tankPowerUp;
            collectPowerUp(tankPlayer, tankPowerUp);
            const tankAudio = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
            const tankPickupAudio = {
              active: powerUpPickupAudio.active,
              frame: powerUpPickupAudio.frame,
              audible: powerUpPickupAudioAudible()
            };
            return {
              threshold,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              beforeCrossing,
              afterCrossing,
              afterRepeat,
              thresholdAudio,
              tankAudio,
              tankPickupAudio,
              tank: {
                score: tankPlayer.score,
                lives: tankPlayer.lives
              }
            };
          } finally {
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            game.demoMode = previousDemoMode;
            game.powerUp = previousPowerUp;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            game.highScore = previousHighScore;
            game.scorePopups = previousScorePopups;
          }
        },
    });
  }

  return Object.freeze({ createPlayerLifecycleDiagnostics });
});
