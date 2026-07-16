(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const geometry = isCommonJs
    ? require("../core/geometry")
    : (root.TankDefender8Modules || {}).geometry;
  if (!geometry) throw new Error("geometry module must load before tank-collision-rules.js");

  const api = factory(geometry);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.tankCollisionRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry) {
  "use strict";

  const { rectOverlapArea, rectsOverlap } = geometry;
  const TANK_HIT_CENTER_RANGE = 10;

  function entityRect(entity, x, y) {
    return {
      x: x === undefined ? entity.x : x,
      y: y === undefined ? entity.y : y,
      w: entity.w,
      h: entity.h
    };
  }

  function bulletHitsTankByCenter(bullet, tank) {
    const bulletCenterX = bullet.x + bullet.w / 2;
    const bulletCenterY = bullet.y + bullet.h / 2;
    const tankCenterX = tank.x + tank.w / 2;
    const tankCenterY = tank.y + tank.h / 2;
    return Math.abs(bulletCenterX - tankCenterX) < TANK_HIT_CENTER_RANGE
      && Math.abs(bulletCenterY - tankCenterY) < TANK_HIT_CENTER_RANGE;
  }

  function filterActiveTankCollisionPeers(tank, tanks) {
    return tanks.filter((other) =>
      other !== tank && other.alive && !other.destroying && !(other.respawn > 0)
    );
  }

  function totalRectOverlapArea(rect, peers) {
    return peers.reduce((total, other) => total + rectOverlapArea(rect, other), 0);
  }

  /** Allows an invalid tank to escape only when each move strictly reduces the blocking overlap. */
  function canTankOccupyRect(currentRect, nextRect, options) {
    const source = options || {};
    if (
      nextRect.x < 0
      || nextRect.y < 0
      || nextRect.x + nextRect.w > source.fieldWidth
      || nextRect.y + nextRect.h > source.fieldHeight
    ) return false;
    if (source.baseAlive && rectsOverlap(nextRect, source.base)) return false;

    const terrainOverlapArea = source.terrainOverlapArea || (() => 0);
    const nextTerrainOverlap = terrainOverlapArea(nextRect);
    if (nextTerrainOverlap > 0) {
      const currentTerrainOverlap = terrainOverlapArea(currentRect);
      if (currentTerrainOverlap <= 0 || nextTerrainOverlap >= currentTerrainOverlap) return false;
    }

    for (const other of source.peers || []) {
      const nextOverlap = rectOverlapArea(nextRect, other);
      if (nextOverlap <= 0) continue;
      const currentOverlap = rectOverlapArea(currentRect, other);
      if (currentOverlap > 0 && nextOverlap < currentOverlap) continue;
      return false;
    }
    return true;
  }

  return Object.freeze({
    TANK_HIT_CENTER_RANGE,
    bulletHitsTankByCenter,
    canTankOccupyRect,
    entityRect,
    filterActiveTankCollisionPeers,
    totalRectOverlapArea
  });
});
