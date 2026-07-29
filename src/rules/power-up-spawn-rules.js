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

  // The original routine maps two random bytes independently to four screen axes.
  // These are local field coordinates: the renderer adds the 16px field origin
  // and centers the 12px replacement icon inside its 16px sprite cell.
  const ORIGINAL_POWER_UP_POSITION_AXIS = Object.freeze([34, 82, 130, 178]);
  const ORIGINAL_POWER_UP_SPAWN_SPOTS = Object.freeze(
    ORIGINAL_POWER_UP_POSITION_AXIS.flatMap((x) =>
      ORIGINAL_POWER_UP_POSITION_AXIS.map((y) => Object.freeze({ x, y }))
    )
  );

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

  function isOriginalPowerUpSpawnList(spots) {
    return Array.isArray(spots) && spots.length === ORIGINAL_POWER_UP_SPAWN_SPOTS.length &&
      spots.every((spot, index) => {
        const original = ORIGINAL_POWER_UP_SPAWN_SPOTS[index];
        return spot && spot.x === original.x && spot.y === original.y;
      });
  }

  /** Selects the original 4-by-4 position from the two independent random bytes. */
  function selectOriginalPowerUpSpawnSpot(spots, randomXByte, randomYByte) {
    if (!Array.isArray(spots) || !spots.length) return null;
    const xIndex = Math.floor(Number(randomXByte) || 0) & 3;
    const yIndex = Math.floor(Number(randomYByte) || 0) & 3;
    const originalIndex = (xIndex << 2) | yIndex;
    if (spots.length === ORIGINAL_POWER_UP_SPAWN_SPOTS.length && isOriginalPowerUpSpawnList(spots)) {
      return spots[originalIndex];
    }
    const fallbackIndex = Math.min(spots.length - 1, Math.floor((originalIndex * spots.length) / 16));
    return spots[fallbackIndex];
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
    ORIGINAL_POWER_UP_POSITION_AXIS,
    ORIGINAL_POWER_UP_RANDOM_TABLE,
    ORIGINAL_POWER_UP_SPAWN_SPOTS,
    dedupePowerUpSpots,
    isOriginalPowerUpSpawnList,
    powerUpSpawnKey,
    powerUpTypeForRandomByte,
    selectOriginalPowerUpSpawnSpot,
    selectPowerUpSpawnSpot
  });
});
