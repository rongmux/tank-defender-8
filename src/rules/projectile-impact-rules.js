(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const geometry = isCommonJs
    ? require("../core/geometry")
    : (root.TankDefender8Modules || {}).geometry;
  if (!geometry) throw new Error("geometry module must load before projectile-impact-rules.js");

  const api = factory(geometry);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileImpactRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry) {
  "use strict";

  const { clamp } = geometry;

  function projectileOutsideField(projectile, fieldWidth, fieldHeight, padding) {
    return projectile.x < -padding || projectile.x > fieldWidth + padding ||
      projectile.y < -padding || projectile.y > fieldHeight + padding;
  }

  function projectileBoundaryImpactPoint(projectile, fieldWidth, fieldHeight) {
    return {
      x: clamp(projectile.x + projectile.w / 2, 0, fieldWidth),
      y: clamp(projectile.y + projectile.h / 2, 0, fieldHeight)
    };
  }

  function wallHitSoundName(projectile, wasSteel, damaged) {
    if (projectile.ownerKind !== "player") return null;
    if (wasSteel && damaged) return "brickHit";
    return wasSteel ? "steelHit" : "brickHit";
  }

  return Object.freeze({
    projectileBoundaryImpactPoint,
    projectileOutsideField,
    wallHitSoundName
  });
});
