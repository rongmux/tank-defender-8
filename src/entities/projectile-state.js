(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const directions = isCommonJs
    ? require("../core/directions")
    : (root.TankDefender8Modules || {}).directions;
  if (!directions) throw new Error("directions module must load before projectile-state.js");

  const api = factory(directions);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileState = api;
})(typeof window !== "undefined" ? window : globalThis, function (directions) {
  "use strict";

  const { DIR_X, DIR_Y } = directions;

  /** Creates the shared player/enemy projectile record at the tank muzzle. */
  function createProjectileState(options) {
    const source = options || {};
    const tank = source.tank;
    const rules = source.rules;
    const upgrade = source.upgrade || null;
    const centerX = tank.x + tank.w / 2;
    const centerY = tank.y + tank.h / 2;

    return {
      x: centerX - rules.bulletSize / 2 + DIR_X[tank.dir] * rules.spawnOffset,
      y: centerY - rules.bulletSize / 2 + DIR_Y[tank.dir] * rules.spawnOffset,
      w: rules.bulletSize,
      h: rules.bulletSize,
      dir: tank.dir,
      speed: upgrade ? upgrade.bulletSpeed : tank.bulletSpeed,
      power: upgrade ? upgrade.wallPower : tank.bulletPower || 1,
      ownerKind: tank.kind,
      ownerId: tank.id,
      ownerKey: source.ownerKey,
      remove: false
    };
  }

  return Object.freeze({ createProjectileState });
});
