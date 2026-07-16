(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpSpawnRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ORIGINAL_POWER_UP_RANDOM_TABLE = Object.freeze([
    "helmet",
    "timer",
    "shovel",
    "star",
    "grenade",
    "tank",
    "grenade",
    "star"
  ]);

  function powerUpSpawnKey(point) {
    return `${point.x},${point.y}`;
  }

  function dedupePowerUpSpots(spots) {
    const seen = new Set();
    const result = [];
    for (const spot of spots) {
      const key = powerUpSpawnKey(spot);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(spot);
    }
    return result;
  }

  function powerUpTypeForRandomByte(randomByte) {
    return ORIGINAL_POWER_UP_RANDOM_TABLE[randomByte & 7];
  }

  /** Selects uniformly from a 16-bit sample while excluding the previous spot when alternatives exist. */
  function selectPowerUpSpawnSpot(spots, positionSample, lastSpawnKey) {
    if (!spots.length) return null;
    const source = spots;
    const withoutPrevious = source.length > 1 && lastSpawnKey
      ? source.filter((spot) => powerUpSpawnKey(spot) !== lastSpawnKey)
      : source;
    const pool = withoutPrevious.length ? withoutPrevious : source;
    const sample = Math.max(0, Math.min(0xffff, Math.floor(Number(positionSample) || 0)));
    return pool[Math.floor((sample * pool.length) / 0x10000)];
  }

  return Object.freeze({
    ORIGINAL_POWER_UP_RANDOM_TABLE,
    dedupePowerUpSpots,
    powerUpSpawnKey,
    powerUpTypeForRandomByte,
    selectPowerUpSpawnSpot
  });
});
