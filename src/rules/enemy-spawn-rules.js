(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const geometry = isCommonJs
    ? require("../core/geometry")
    : (root.TankDefender8Modules || {}).geometry;
  if (!geometry) throw new Error("geometry module must load before enemy-spawn-rules.js");

  const api = factory(geometry);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemySpawnRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry) {
  "use strict";

  const { rectsOverlap } = geometry;
  const ENEMY_SPAWN_TANK_SIZE = 14;

  function activeEnemyCount(enemies) {
    return enemies.filter((enemy) => enemy.alive).length;
  }

  /** Selects the highest free enemy slot while alive destruction states retain capacity. */
  function findAvailableEnemySlot(enemies, maxActiveEnemies) {
    const highestSlot = maxActiveEnemies + 1;
    const used = new Set(enemies.filter((enemy) => enemy.alive).map((enemy) => enemy.slotIndex));
    for (let slot = highestSlot; slot >= 2; slot -= 1) {
      if (!used.has(slot)) return slot;
    }
    return null;
  }

  function isEnemySpawnPointOccupied(point, players, enemies) {
    const spawnRect = {
      x: point.x,
      y: point.y,
      w: ENEMY_SPAWN_TANK_SIZE,
      h: ENEMY_SPAWN_TANK_SIZE
    };
    return players.concat(enemies).some((tank) =>
      tank.alive && !tank.destroying && !(tank.respawn > 0) && rectsOverlap(spawnRect, tank)
    );
  }

  function selectEnemySpawnIndex(enemySpec, spawnedCount) {
    return enemySpec.spawnIndex === undefined ? (spawnedCount + 1) % 3 : enemySpec.spawnIndex;
  }

  return Object.freeze({
    ENEMY_SPAWN_TANK_SIZE,
    activeEnemyCount,
    findAvailableEnemySlot,
    isEnemySpawnPointOccupied,
    selectEnemySpawnIndex
  });
});
