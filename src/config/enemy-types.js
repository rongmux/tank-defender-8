(function (root, factory) {
  "use strict";

  const valueNormalization = typeof module === "object" && module.exports
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before enemy-types.js");

  const api = factory(valueNormalization);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyTypes = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeHexColor, normalizeNumber } = valueNormalization;
  const ENEMY_MOVE_SPEED = Object.freeze({ normal: 0.5, fast: 1.0 });
  const ENEMY_BULLET_SPEED = Object.freeze({ normal: 2.0, fast: 4.0 });
  const ENEMY_FIRE_CHANCE = 1 / 32;
  const POWER_UP_TYPES = Object.freeze(["grenade", "helmet", "shovel", "star", "timer", "tank"]);
  const DEFAULT_ENEMY_TYPES = freezeEnemyTypes([
    { name: "basic", hp: 1, speed: ENEMY_MOVE_SPEED.normal, bullet: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 100, color: "#a9a176" },
    { name: "fast", hp: 1, speed: ENEMY_MOVE_SPEED.fast, bullet: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 200, color: "#b87854" },
    { name: "power", hp: 1, speed: ENEMY_MOVE_SPEED.normal, bullet: ENEMY_BULLET_SPEED.fast, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 300, color: "#7fba72" },
    { name: "armor", hp: 4, speed: ENEMY_MOVE_SPEED.normal, bullet: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 400, color: "#7fba72", hitColors: ["#b0b5c3", "#9aa2ad", "#79a95e", "#7fba72"] }
  ]);

  function freezeEnemyTypes(types) {
    return Object.freeze(types.map((enemyType) => Object.freeze({
      ...enemyType,
      ...(enemyType.hitColors ? { hitColors: Object.freeze(enemyType.hitColors.slice()) } : {})
    })));
  }

  function cloneEnemyTypes(types) {
    return types.map((enemyType) => ({
      ...enemyType,
      hitColors: enemyType.hitColors ? enemyType.hitColors.slice() : null
    }));
  }

  /** Returns four independent enemy definitions with omitted fields filled from defaults. */
  function normalizeEnemyTypes(types) {
    if (types === undefined) return cloneEnemyTypes(DEFAULT_ENEMY_TYPES);
    if (!Array.isArray(types) || types.length !== DEFAULT_ENEMY_TYPES.length) {
      throw new Error(`enemyTypes must contain exactly ${DEFAULT_ENEMY_TYPES.length} entries`);
    }
    return types.map((enemyType, index) => normalizeEnemyType(enemyType, index));
  }

  function normalizeEnemyType(enemyType, index) {
    if (!enemyType || typeof enemyType !== "object") {
      throw new Error(`enemyTypes[${index}] must be an object`);
    }
    const fallback = DEFAULT_ENEMY_TYPES[index];
    const name = enemyType.name === undefined ? fallback.name : String(enemyType.name);
    if (!name || name.length > 24) throw new Error(`enemyTypes[${index}].name must be 1 to 24 characters`);
    const hp = normalizeNumber(enemyType.hp, fallback.hp, 1, 9, true, `enemyTypes[${index}].hp`);
    const speed = normalizeNumber(enemyType.speed, fallback.speed, 0.1, 3, false, `enemyTypes[${index}].speed`);
    const bullet = normalizeNumber(enemyType.bullet, fallback.bullet, 0.1, 6, false, `enemyTypes[${index}].bullet`);
    const wallPower = normalizeNumber(enemyType.wallPower, fallback.wallPower, 1, 3, true, `enemyTypes[${index}].wallPower`);
    const reload = normalizeNumber(enemyType.reload, fallback.reload, 1, 600, true, `enemyTypes[${index}].reload`);
    const fireChance = normalizeNumber(enemyType.fireChance, fallback.fireChance, 0, 1, false, `enemyTypes[${index}].fireChance`);
    const score = normalizeNumber(enemyType.score, fallback.score, 0, 9999, true, `enemyTypes[${index}].score`);
    const color = normalizeHexColor(enemyType.color, fallback.color, `enemyTypes[${index}].color`);
    const hitColors = normalizeHitColors(enemyType.hitColors, fallback.hitColors, `enemyTypes[${index}].hitColors`);
    return { name, hp, speed, bullet, wallPower, reload, fireChance, score, color, hitColors };
  }

  function normalizeHitColors(colors, fallback, label) {
    const source = colors === undefined ? fallback : colors;
    if (source === undefined || source === null) return null;
    if (!Array.isArray(source) || source.length < 1 || source.length > 9) {
      throw new Error(`${label} must contain 1 to 9 #rrggbb colors`);
    }
    return source.map((color, index) =>
      normalizeHexColor(color, undefined, `${label}[${index}]`)
    );
  }

  /** Normalizes one stage's authoritative enemy order and optional spawn metadata. */
  function normalizeEnemySequence(sequence, label, enemyTypeCount) {
    if (!Array.isArray(sequence) || sequence.length < 1) {
      throw new Error(`${label} must contain at least one enemy`);
    }
    return sequence.map((enemy, index) => normalizeEnemySpec(enemy, index, label, enemyTypeCount));
  }

  function normalizeEnemySpec(enemy, index, label, enemyTypeCount) {
    if (!enemy || typeof enemy !== "object") {
      throw new Error(`${label} enemy ${index + 1} must be an object`);
    }
    const typeIndex = Number(enemy.typeIndex);
    if (!Number.isInteger(typeIndex) || typeIndex < 0 || typeIndex >= enemyTypeCount) {
      throw new Error(`${label} enemy ${index + 1} has invalid typeIndex`);
    }
    const spawnIndex = enemy.spawnIndex === undefined ? (index + 1) % 3 : Number(enemy.spawnIndex);
    if (!Number.isInteger(spawnIndex) || spawnIndex < 0 || spawnIndex > 7) {
      throw new Error(`${label} enemy ${index + 1} has invalid spawnIndex`);
    }
    let powerUpType = null;
    if (enemy.powerUpType !== undefined && enemy.powerUpType !== null && enemy.powerUpType !== "") {
      if (!POWER_UP_TYPES.includes(enemy.powerUpType)) {
        throw new Error(`${label} enemy ${index + 1} has invalid powerUpType`);
      }
      powerUpType = enemy.powerUpType;
    }
    let spawnDelay = null;
    if (enemy.spawnDelay !== undefined && enemy.spawnDelay !== null && enemy.spawnDelay !== "") {
      spawnDelay = Number(enemy.spawnDelay);
      if (!Number.isInteger(spawnDelay) || spawnDelay < 0 || spawnDelay > 3600) {
        throw new Error(`${label} enemy ${index + 1} has invalid spawnDelay`);
      }
    }
    return {
      typeIndex,
      carrier: Boolean(enemy.carrier),
      spawnIndex,
      powerUpType,
      spawnDelay
    };
  }

  return Object.freeze({
    DEFAULT_ENEMY_TYPES,
    ENEMY_BULLET_SPEED,
    ENEMY_FIRE_CHANCE,
    ENEMY_MOVE_SPEED,
    POWER_UP_TYPES,
    cloneEnemyTypes,
    normalizeEnemySequence,
    normalizeEnemySpec,
    normalizeEnemyType,
    normalizeEnemyTypes,
    normalizeHitColors
  });
});
