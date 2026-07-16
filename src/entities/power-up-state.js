(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const POWER_UP_SIZE = 12;

  /** Creates a collectible power-up record at an already validated field position. */
  function createPowerUpState(options) {
    const source = options || {};
    return {
      type: source.type,
      x: source.position.x,
      y: source.position.y,
      w: POWER_UP_SIZE,
      h: POWER_UP_SIZE,
      ttl: source.ttl
    };
  }

  return Object.freeze({
    POWER_UP_SIZE,
    createPowerUpState
  });
});
