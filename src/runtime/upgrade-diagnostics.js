(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.upgradeDiagnostics = api;
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
      playerDestroyAudio: state.audio.playerDestroy
    };
  }

  /** Binds star-upgrade rules, overlay rendering, and survivability probes. */
  function createUpgradeDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      applyPowerUp,
      clamp,
      drawTank,
      enemyTypeDefinitions,
      game,
      gameSettings,
      hitTank,
      killPlayer,
      LEFT,
      PLAYER_UPGRADE_OVERLAY_COLORS,
      playerDestroyAudio,
      playerUpgradeOverlayParts,
      playerUpgradeRule,
      stopPlayerDestroyAudio,
      syncEnemyDestroyAudioNodes,
      syncPlayerDestroyAudioNodes,
      UP
    } = scope;

    return Object.freeze({
        debugStarUpgradeProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const player = {
            id: 1,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            level: 0,
            invuln: 0,
            alive: true,
            x: 16,
            y: 16
          };
          const tiers = [];

          try {
            stopPlayerDestroyAudio();
            game.explosions = [];
            game.scorePopups = [];
            for (let i = 0; i < 4; i += 1) {
              const rule = playerUpgradeRule(player.level);
              tiers.push({
                level: player.level,
                maxBullets: rule.maxBullets,
                bulletSpeed: rule.bulletSpeed,
                wallPower: rule.wallPower
              });
              applyPowerUp(player, "star");
            }
            const cappedRule = playerUpgradeRule(player.level);
            const beforeDeathLevel = player.level;
            const cappedLevel = player.level;
            killPlayer(player);
            return {
              tiers,
              capped: {
                level: cappedLevel,
                beforeDeathLevel,
                maxBullets: cappedRule.maxBullets,
                bulletSpeed: cappedRule.bulletSpeed,
                wallPower: cappedRule.wallPower
              },
              afterDeath: {
                alive: player.alive,
                destroying: player.destroying,
                lives: player.lives,
                level: player.level,
                respawn: player.respawn || 0
              },
              powerTankBulletSpeed: enemyTypeDefinitions()[2].bullet,
              pickupScore: gameSettings().powerUpRules.pickupScore
            };
          } finally {
            stopPlayerDestroyAudio();
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerUpgradeVisualProbe(level) {
          const value = clamp(Math.floor(Number(level) || 0), 0, 3);
          const tank = {
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: UP,
            level: value,
            stun: 0
          };
          const parts = playerUpgradeOverlayParts(value, UP);
          drawTank(tank, "#e3c64e", "#fff0a8");
          return {
            level: value,
            overlayParts: parts.length,
            overlaySignature: parts.map((part) => `${part.role}:${part.rect.join(",")}`).join(";"),
            maxPowerColor: PLAYER_UPGRADE_OVERLAY_COLORS.level3,
            maxPowerParts: parts.filter((part) => part.role === "level3").length
          };
        },
        debugStarSurvivabilityProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousExplosions = game.explosions;
          const player = {
            id: 1,
            kind: "player",
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            alive: true,
            invuln: 0,
            lives: 2,
            respawn: 0,
            spawnFlash: 0,
            level: 3,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0
          };
          const bullet = {
            x: 18,
            y: 18,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: LEFT,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };

          try {
            stopPlayerDestroyAudio();
            game.players = [player];
            game.explosions = [];
            hitTank(bullet);
            return {
              level: player.level,
              alive: player.alive,
              lives: player.lives,
              respawn: player.respawn || 0,
              bulletRemoved: bullet.remove
            };
          } finally {
            stopPlayerDestroyAudio();
            game.players = previousPlayers;
            game.explosions = previousExplosions;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
    });
  }

  return Object.freeze({ createUpgradeDiagnostics });
});
