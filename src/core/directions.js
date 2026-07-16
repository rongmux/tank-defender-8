(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.directions = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const UP = 0;
  const RIGHT = 1;
  const DOWN = 2;
  const LEFT = 3;
  const DIR_X = Object.freeze([0, 1, 0, -1]);
  const DIR_Y = Object.freeze([-1, 0, 1, 0]);

  return Object.freeze({
    DIR_X,
    DIR_Y,
    DOWN,
    LEFT,
    RIGHT,
    UP
  });
});
