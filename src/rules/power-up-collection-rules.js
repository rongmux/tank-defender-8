(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpCollectionRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const POWER_UP_COLLECTION_DISTANCE = 12;

  function canPlayerCollectPowerUp(player, power) {
    if (!player.alive || player.respawn > 0 || player.spawnFlash > 0) return false;
    const playerCenterX = player.x + player.w / 2;
    const playerCenterY = player.y + player.h / 2;
    const powerCenterX = power.x + power.w / 2;
    const powerCenterY = power.y + power.h / 2;
    return Math.abs(playerCenterX - powerCenterX) < POWER_UP_COLLECTION_DISTANCE &&
      Math.abs(playerCenterY - powerCenterY) < POWER_UP_COLLECTION_DISTANCE;
  }

  /** Selects the highest player slot that qualifies on the current frame. */
  function findPowerUpCollector(players, power) {
    for (let index = players.length - 1; index >= 0; index -= 1) {
      if (canPlayerCollectPowerUp(players[index], power)) return players[index];
    }
    return null;
  }

  return Object.freeze({
    POWER_UP_COLLECTION_DISTANCE,
    canPlayerCollectPowerUp,
    findPowerUpCollector
  });
});
