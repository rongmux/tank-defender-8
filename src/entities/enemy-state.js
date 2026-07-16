(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ENEMY_SIZE = 14;
  const ENEMY_ACCENT = "#2b2a28";
  const ENEMY_DESTRUCTION_SCORE_TICKS = 6;

  /** Creates the complete mutable state record for one successfully placed enemy. */
  function createEnemyState(options) {
    const source = options || {};
    const spawn = source.spawn;
    const type = source.type;
    const spec = source.spec;
    const settings = source.settings;
    const typeIndex = source.typeIndex;

    return {
      kind: "enemy",
      id: source.id,
      slotIndex: source.slotIndex,
      x: spawn.x,
      y: spawn.y,
      w: ENEMY_SIZE,
      h: ENEMY_SIZE,
      dir: source.direction,
      speed: type.speed,
      hp: type.hp,
      maxHp: type.hp,
      bulletSpeed: type.bullet,
      bulletPower: type.wallPower,
      reloadBase: type.reload,
      reload: settings.timings.enemyInitialReload,
      score: type.score,
      color: type.color,
      hitColors: type.hitColors ? type.hitColors.slice() : null,
      accent: ENEMY_ACCENT,
      typeIndex,
      carrier: spec.carrier,
      powerUpType: spec.powerUpType || null,
      fireChance: type.fireChance,
      alternateMovement: typeIndex !== 1 && type.speed === source.normalMoveSpeed,
      blockedPauseTicks: 0,
      pendingTurn: false,
      spawnFlash: settings.timings.enemySpawnFlash,
      alive: true,
      destroying: false,
      destroyTicks: 0,
      slide: 0,
      trackPhase: 0
    };
  }

  /** Advances one eligible enemy destruction tick and reports when its slot is released. */
  function advanceEnemyDestructionState(enemy, movementFrame, defaultExplosionTicks) {
    if (!movementFrame) return false;
    enemy.destroyTicks = Math.max(0, Math.floor(Number(enemy.destroyTicks) || 0)) + 1;
    const explosionTicks = Math.max(
      1,
      Math.floor(Number(enemy.destroyExplosionTicks) || defaultExplosionTicks)
    );
    if (enemy.destroyTicks < explosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS) return false;
    enemy.alive = false;
    enemy.destroying = false;
    return true;
  }

  return Object.freeze({
    ENEMY_ACCENT,
    ENEMY_DESTRUCTION_SCORE_TICKS,
    ENEMY_SIZE,
    advanceEnemyDestructionState,
    createEnemyState
  });
});
