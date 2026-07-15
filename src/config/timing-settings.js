(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.timingSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const SPAWN_ANIMATION_FRAMES = 28;
  const DEFAULT_TIMINGS = Object.freeze({
    stageIntro: 95,
    stageClearDelay: 128,
    stageClear: 0,
    gameOverSlide: 127,
    gameOverHold: 129,
    playerRespawn: 24,
    playerSpawnFlash: SPAWN_ANIMATION_FRAMES,
    playerInvulnerability: 3,
    enemySpawnFlash: SPAWN_ANIMATION_FRAMES,
    enemyInitialReload: 0,
    enemySpawnRetry: 25,
    powerUpTtl: 0
  });

  /** Normalizes all configurable durations measured by the fixed 60 Hz logic loop. */
  function normalizeTimings(timings) {
    const source = timings || {};
    if (typeof source !== "object") throw new Error("gameSettings.timings must be an object");
    return Object.fromEntries(Object.entries(DEFAULT_TIMINGS).map(([key, defaultValue]) => {
      const value = source[key] === undefined ? defaultValue : Number(source[key]);
      if (!Number.isInteger(value) || value < 0 || value > 3600) {
        throw new Error(`gameSettings.timings.${key} must be an integer from 0 to 3600`);
      }
      return [key, value];
    }));
  }

  return Object.freeze({
    DEFAULT_TIMINGS,
    SPAWN_ANIMATION_FRAMES,
    normalizeTimings
  });
});
