(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.transientEffectState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createExplosionState(options) {
    const source = options || {};
    return {
      x: source.x,
      y: source.y,
      ttl: source.ttl,
      max: source.ttl,
      color: source.color,
      coreColor: source.coreColor || source.defaultCoreColor,
      style: source.style || "default"
    };
  }

  function createScorePopupState(points, x, y, options) {
    const value = Math.max(0, Math.floor(Number(points) || 0));
    if (!value) return null;
    const source = options || {};
    const px = Number.isFinite(Number(x)) ? Number(x) : source.defaultX;
    const py = Number.isFinite(Number(y)) ? Number(y) : source.defaultY;
    const ttl = Math.max(1, Math.floor(Number(source.ttl) || 54));
    return {
      value,
      x: px,
      y: py,
      ttl,
      max: ttl,
      style: source.style || "float"
    };
  }

  /** Advances and removes expired records while preserving the surviving object identities. */
  function advanceTimedStates(states) {
    for (const state of states) state.ttl -= 1;
    return states.filter((state) => state.ttl > 0);
  }

  return Object.freeze({
    advanceTimedStates,
    createExplosionState,
    createScorePopupState
  });
});
