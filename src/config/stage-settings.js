(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const stageGrid = isCommonJs
    ? require("../stages/stage-grid")
    : (root.TankDefender8Modules || {}).stageGrid;
  const powerUpSpawnRules = isCommonJs
    ? require("../rules/power-up-spawn-rules")
    : (root.TankDefender8Modules || {}).powerUpSpawnRules;
  if (!stageGrid) throw new Error("stageGrid module must load before stage-settings.js");
  if (!powerUpSpawnRules) throw new Error("powerUpSpawnRules module must load before stage-settings.js");

  const api = factory(stageGrid, powerUpSpawnRules);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (stageGrid, powerUpSpawnRules) {
  "use strict";

  const { GRID } = stageGrid;
  const { ORIGINAL_POWER_UP_SPAWN_SPOTS } = powerUpSpawnRules;
  const TILE_SIZE = 16;
  const DEFAULT_MAX_ACTIVE_ENEMIES = 4;
  const DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER = 6;
  const DEFAULT_PLAYER_SPAWNS = freezePoints([
    { x: 4 * TILE_SIZE + 1, y: 12 * TILE_SIZE + 1 },
    { x: 8 * TILE_SIZE + 1, y: 12 * TILE_SIZE + 1 }
  ]);
  const DEFAULT_ENEMY_SPAWNS = freezePoints([
    { x: 0 * TILE_SIZE + 1, y: 0 * TILE_SIZE + 1 },
    { x: 6 * TILE_SIZE + 1, y: 0 * TILE_SIZE + 1 },
    { x: 12 * TILE_SIZE + 1, y: 0 * TILE_SIZE + 1 }
  ]);
  const DEFAULT_POWERUP_SPAWNS = freezePoints(ORIGINAL_POWER_UP_SPAWN_SPOTS);

  function freezePoints(points) {
    return Object.freeze(points.map((point) => Object.freeze({ ...point })));
  }

  /** Normalizes per-stage capacity and spawn coordinates into runtime pixels. */
  function normalizeStageSettings(settings, totalStages) {
    const source = Array.isArray(settings) ? settings : [];
    if (source.length > totalStages) {
      throw new Error(`stageSettings must not contain more than ${totalStages} stages`);
    }
    return Array.from({ length: totalStages }, (_, index) => {
      const entry = source[index] || {};
      if (!entry || typeof entry !== "object") {
        throw new Error(`stageSettings[${index}] must be an object`);
      }
      const maxActiveEnemies = entry.maxActiveEnemies === undefined
        ? DEFAULT_MAX_ACTIVE_ENEMIES
        : Number(entry.maxActiveEnemies);
      if (!Number.isInteger(maxActiveEnemies) || maxActiveEnemies < 1 || maxActiveEnemies > 8) {
        throw new Error(`stageSettings[${index}].maxActiveEnemies must be an integer from 1 to 8`);
      }
      const maxActiveEnemiesTwoPlayer = entry.maxActiveEnemiesTwoPlayer === undefined
        ? (entry.maxActiveEnemies === undefined ? DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER : maxActiveEnemies)
        : Number(entry.maxActiveEnemiesTwoPlayer);
      if (!Number.isInteger(maxActiveEnemiesTwoPlayer) || maxActiveEnemiesTwoPlayer < 1 || maxActiveEnemiesTwoPlayer > 8) {
        throw new Error(`stageSettings[${index}].maxActiveEnemiesTwoPlayer must be an integer from 1 to 8`);
      }
      return {
        maxActiveEnemies,
        maxActiveEnemiesTwoPlayer,
        playerSpawns: normalizeSpawnList(entry.playerSpawns, 2, DEFAULT_PLAYER_SPAWNS, `stageSettings[${index}].playerSpawns`),
        enemySpawns: normalizeSpawnList(entry.enemySpawns, 3, DEFAULT_ENEMY_SPAWNS, `stageSettings[${index}].enemySpawns`),
        powerUpSpawns: normalizePowerUpSpawnList(entry.powerUpSpawns, `stageSettings[${index}].powerUpSpawns`)
      };
    });
  }

  function normalizeSpawnList(spawns, minLength, defaults, label) {
    if (spawns === undefined) return defaults.map((point) => ({ x: point.x, y: point.y }));
    if (!Array.isArray(spawns) || spawns.length < minLength) {
      throw new Error(`${label} must contain at least ${minLength} spawn points`);
    }
    return spawns.map((spawn, index) => normalizeSpawnPoint(spawn, `${label}[${index}]`));
  }

  function normalizeSpawnPoint(spawn, label) {
    return normalizeTilePoint(spawn, label, 1);
  }

  function normalizePowerUpSpawnList(spawns, label) {
    if (spawns === undefined) return DEFAULT_POWERUP_SPAWNS.map((point) => ({ x: point.x, y: point.y }));
    if (!Array.isArray(spawns) || spawns.length < 1) {
      throw new Error(`${label} must contain at least one spawn point`);
    }
    return spawns.map((spawn, index) => normalizePowerUpSpawnPoint(spawn, `${label}[${index}]`));
  }

  function normalizePowerUpSpawnPoint(spawn, label) {
    return normalizeTilePoint(spawn, label, 2);
  }

  function normalizeTilePoint(spawn, label, offset) {
    if (!spawn || typeof spawn !== "object") throw new Error(`${label} must be an object`);
    const tileX = Number(spawn.x);
    const tileY = Number(spawn.y);
    if (!Number.isInteger(tileX) || tileX < 0 || tileX >= GRID) {
      throw new Error(`${label}.x must be an integer from 0 to ${GRID - 1}`);
    }
    if (!Number.isInteger(tileY) || tileY < 0 || tileY >= GRID) {
      throw new Error(`${label}.y must be an integer from 0 to ${GRID - 1}`);
    }
    return { x: tileX * TILE_SIZE + offset, y: tileY * TILE_SIZE + offset };
  }

  function pixelToTilePoint(point) {
    return {
      x: Math.floor((point.x - 1) / TILE_SIZE),
      y: Math.floor((point.y - 1) / TILE_SIZE)
    };
  }

  function powerUpPixelToTilePoint(point) {
    return {
      x: Math.floor((point.x - 2) / TILE_SIZE),
      y: Math.floor((point.y - 2) / TILE_SIZE)
    };
  }

  return Object.freeze({
    DEFAULT_ENEMY_SPAWNS,
    DEFAULT_MAX_ACTIVE_ENEMIES,
    DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
    DEFAULT_PLAYER_SPAWNS,
    DEFAULT_POWERUP_SPAWNS,
    TILE_SIZE,
    normalizePowerUpSpawnList,
    normalizePowerUpSpawnPoint,
    normalizeSpawnList,
    normalizeSpawnPoint,
    normalizeStageSettings,
    pixelToTilePoint,
    powerUpPixelToTilePoint
  });
});
