(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PLAYER_SIZE = 14;
  const PLAYER_PALETTES = Object.freeze({
    1: Object.freeze({ color: "#e3c64e", accent: "#fff0a8" }),
    2: Object.freeze({ color: "#55b96a", accent: "#b7ffbd" })
  });

  function protectionState(settings) {
    const spawnFlash = settings.timings.playerSpawnFlash;
    return {
      spawnFlash,
      invuln: spawnFlash > 0 ? 0 : settings.timings.playerInvulnerability
    };
  }

  /** Creates the complete mutable state record for a player entering a run. */
  function createPlayerState(options) {
    const source = options || {};
    const id = source.id;
    const spawn = source.spawn;
    const settings = source.settings;
    const enemyTypeCount = Math.max(0, Math.floor(Number(source.enemyTypeCount) || 0));
    const direction = source.direction === undefined ? 0 : source.direction;
    const protection = protectionState(settings);
    const palette = id === 1 ? PLAYER_PALETTES[1] : PLAYER_PALETTES[2];

    return {
      kind: "player",
      id,
      x: spawn.x,
      y: spawn.y,
      spawnX: spawn.x,
      spawnY: spawn.y,
      w: PLAYER_SIZE,
      h: PLAYER_SIZE,
      dir: direction,
      speed: settings.playerMovement.speed,
      alive: true,
      lives: settings.initialLives,
      nextBonusLifeIndex: 0,
      respawn: 0,
      destroying: false,
      destroyTotalTicks: 0,
      destroyExplosionTicks: 0,
      spawnFlash: protection.spawnFlash,
      invuln: protection.invuln,
      stun: 0,
      pendingSnap: false,
      level: 0,
      reload: 0,
      score: 0,
      stagePoints: 0,
      stageKills: Array(enemyTypeCount).fill(0),
      totalKills: Array(enemyTypeCount).fill(0),
      slide: 0,
      trackPhase: 0,
      color: palette.color,
      accent: palette.accent
    };
  }

  /** Restores transient player state at a stage start or after a completed death. */
  function resetPlayerState(player, options) {
    const source = options || {};
    const settings = source.settings;
    const direction = source.direction === undefined ? 0 : source.direction;
    const protection = protectionState(settings);

    player.x = player.spawnX;
    player.y = player.spawnY;
    player.dir = direction;
    player.alive = player.lives > 0;
    player.respawn = 0;
    player.destroying = false;
    player.destroyTotalTicks = 0;
    player.destroyExplosionTicks = 0;
    player.spawnFlash = protection.spawnFlash;
    player.invuln = protection.invuln;
    player.stun = 0;
    player.pendingSnap = false;
    player.reload = 0;
    player.slide = 0;
    player.trackPhase = 0;
    return player;
  }

  return Object.freeze({
    PLAYER_PALETTES,
    PLAYER_SIZE,
    createPlayerState,
    resetPlayerState
  });
});
