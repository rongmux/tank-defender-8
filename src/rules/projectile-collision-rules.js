(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileCollisionRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEFAULT_PROJECTILE_COLLISION_THRESHOLD = 6;

  function bulletCentersWithin(a, b, threshold) {
    const limit = threshold === undefined ? DEFAULT_PROJECTILE_COLLISION_THRESHOLD : threshold;
    return Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)) < limit &&
      Math.abs((a.y + a.h / 2) - (b.y + b.h / 2)) < limit;
  }

  /** Cancels at most one opposing projectile per outer-loop projectile, matching runtime pair order. */
  function resolveBulletCollisions(bullets, threshold) {
    const limit = threshold === undefined ? DEFAULT_PROJECTILE_COLLISION_THRESHOLD : threshold;
    let canceledPairs = 0;
    for (let i = 0; i < bullets.length; i += 1) {
      const a = bullets[i];
      if (a.remove) continue;
      for (let j = i + 1; j < bullets.length; j += 1) {
        const b = bullets[j];
        if (b.remove) continue;
        if (a.ownerKey !== b.ownerKey && bulletCentersWithin(a, b, limit)) {
          a.remove = true;
          b.remove = true;
          canceledPairs += 1;
          break;
        }
      }
    }
    return canceledPairs;
  }

  return Object.freeze({
    DEFAULT_PROJECTILE_COLLISION_THRESHOLD,
    bulletCentersWithin,
    resolveBulletCollisions
  });
});
