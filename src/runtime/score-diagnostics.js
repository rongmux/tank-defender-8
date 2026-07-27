(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.scoreDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

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
      enemyDestroyAudio: state.audio.enemyDestroy,
      game: state.game
    };
  }

  /** Binds grenade score, spawn protection, score-popup, and paused-popup probes. */
  function createScoreDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      ENEMY_DESTRUCTION_SCORE_TICKS,
      applyPowerUp,
      destroyEnemy,
      enemyDestroyAudio,
      enemyDestructionPresentation,
      enemyTypeDefinitions,
      explosionRule,
      game,
      gameSettings,
      preparePausedDebugBattle,
      stopEnemyDestroyAudio,
      syncEnemyDestroyAudioNodes,
      update,
      updateEnemies,
      updateScorePopups
    } = scope;

    return Object.freeze({
        debugGrenadeScoreProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const previousEnemyKilled = game.enemyKilled;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const types = enemyTypeDefinitions();
          const player = {
            id: 1,
            score: 1000,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2
          };

          game.players = [player];
          game.enemies = [0, Math.min(2, types.length - 1)].map((typeIndex, index) => ({
            alive: true,
            hp: 1,
            typeIndex,
            score: types[typeIndex].score,
            x: 32 + index * 16,
            y: 32
          }));
          game.enemyKilled = 0;
          game.explosions = [];
          game.scorePopups = [];
          stopEnemyDestroyAudio();

          try {
            applyPowerUp(player, "grenade");
            const beforeRelease = {
              enemyKilled: game.enemyKilled,
              aliveEnemies: game.enemies.filter((enemy) => enemy.alive).length,
              destroyingEnemies: game.enemies.filter((enemy) => enemy.destroying).length
            };
            for (let tick = 0; tick < explosionRule("enemyDestroy").ttl + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            return {
              scoreGain: player.score - 1000,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice(),
              beforeRelease,
              enemyKilled: game.enemyKilled,
              aliveEnemies: game.enemies.filter((enemy) => enemy.alive).length
            };
          } finally {
            game.players = previousPlayers;
            game.enemies = previousEnemies;
            game.enemyKilled = previousEnemyKilled;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugGrenadeSpawnProtectionProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previous = {
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            highScore: game.highScore
          };
          const types = enemyTypeDefinitions();
          const player = {
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            score: 0,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2
          };
          const makeEnemy = (id, spawnFlash) => ({
            id,
            alive: true,
            hp: 1,
            spawnFlash,
            typeIndex: 0,
            score: types[0].score,
            x: 32 + id * 16,
            y: 32,
            w: 14,
            h: 14
          });
          const active = makeEnemy(0, 0);
          const spawning = makeEnemy(1, 12);
          try {
            stopEnemyDestroyAudio();
            game.players = [player];
            game.enemies = [active, spawning];
            game.enemyKilled = 0;
            game.explosions = [];
            game.scorePopups = [];
            applyPowerUp(player, "grenade");
            const beforeRelease = {
              activeAlive: active.alive,
              activeDestroying: active.destroying,
              spawningAlive: spawning.alive,
              spawningHp: spawning.hp,
              spawningFlash: spawning.spawnFlash,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
            for (let tick = 0; tick < explosionRule("enemyDestroy").ttl + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            return {
              activeAlive: active.alive,
              activeDestroying: active.destroying,
              spawningAlive: beforeRelease.spawningAlive,
              spawningHp: beforeRelease.spawningHp,
              spawningFlash: beforeRelease.spawningFlash,
              spawningFlashAfterLifecycle: spawning.spawnFlash,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length,
              beforeRelease,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice()
            };
          } finally {
            Object.assign(game, previous);
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugScorePopupProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const previousEnemyKilled = game.enemyKilled;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const types = enemyTypeDefinitions();
          const armorIndex = Math.min(3, types.length - 1);
          const player = {
            id: 1,
            kind: "player",
            x: 72,
            y: 72,
            w: 14,
            h: 14,
            score: 0,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            level: 0,
            invuln: 0,
            alive: true
          };
          const enemy = {
            alive: true,
            hp: 1,
            typeIndex: armorIndex,
            score: types[armorIndex].score,
            x: 64,
            y: 64,
            w: 14,
            h: 14
          };

          try {
            stopEnemyDestroyAudio();
            game.players = [player];
            game.enemies = [enemy];
            game.enemyKilled = 0;
            game.explosions = [];
            game.scorePopups = [];
            destroyEnemy(enemy, player.id);
            const enemyScoreAward = {
              score: player.score,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice()
            };
            enemy.destroyTicks = enemy.destroyExplosionTicks;
            const enemyPresentation = enemyDestructionPresentation(enemy);
            const enemyPopup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;

            game.scorePopups = [];
            applyPowerUp(player, "star");
            const pickupPopup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;

            game.scorePopups = [];
            game.enemies = [0, Math.min(2, types.length - 1)].map((typeIndex, index) => ({
              alive: true,
              hp: 1,
              typeIndex,
              score: types[typeIndex].score,
              x: 32 + index * 16,
              y: 32,
              w: 14,
              h: 14
            }));
            applyPowerUp(player, "grenade");
            const grenadePopups = game.scorePopups.map((popup) => ({ ...popup }));

            updateScorePopups();
            const afterUpdate = game.scorePopups.map((popup) => ({ ...popup }));

            return {
              enemyPopup,
              enemyScoreAward,
              enemyPresentation,
              pickupPopup,
              grenadePopups,
              afterUpdate,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              armorScore: types[armorIndex].score
            };
          } finally {
            game.players = previousPlayers;
            game.enemies = previousEnemies;
            game.enemyKilled = previousEnemyKilled;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPausedScorePopupProbe() {
          const previous = { ...game };
          try {
            preparePausedDebugBattle(27);
            game.scorePopups = [{ value: 500, x: 64, y: 64, ttl: 2, max: 2, style: "powerUp" }];
            update();
            const afterOneFrame = { tick: game.tick, ttl: game.scorePopups[0] ? game.scorePopups[0].ttl : 0 };
            update();
            return {
              afterOneFrame,
              afterTwoFrames: { tick: game.tick, popupCount: game.scorePopups.length }
            };
          } finally {
            Object.assign(game, previous);
          }
        },

    });
  }

  return Object.freeze({ createScoreDiagnostics });
});
