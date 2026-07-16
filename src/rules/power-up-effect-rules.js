(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpEffectRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function emptyEffectResult() {
    return {
      destroyActiveEnemies: false,
      rebuildBaseWall: false,
      soundName: null
    };
  }

  /**
   * Applies the synchronous player and battle-state part of one power-up effect.
   * Runtime-owned enemy destruction, terrain writes, and audio are returned as actions.
   */
  function applyPowerUpEffect(player, battleState, type, options) {
    const opts = options || {};
    const durations = opts.durations || {};
    const result = emptyEffectResult();

    if (type === "grenade") {
      result.destroyActiveEnemies = true;
      result.soundName = "enemyDestroy";
    } else if (type === "helmet") {
      player.invuln = Math.max(player.invuln, durations.helmet);
    } else if (type === "shovel" && opts.baseAlive) {
      battleState.shovelTimer = durations.shovel;
      result.rebuildBaseWall = true;
    } else if (type === "star") {
      player.level = Math.min(opts.maxPlayerLevel, player.level + 1);
    } else if (type === "timer") {
      battleState.freezeTimer = durations.timer;
    } else if (type === "tank") {
      player.lives += 1;
      result.soundName = "bonusLife";
    }

    return result;
  }

  return Object.freeze({
    applyPowerUpEffect
  });
});
