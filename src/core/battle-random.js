(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleRandom = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Reproduces the arithmetic and carry flow of the original D44D random routine. */
  function advanceBattleRandom(value, index, frameHigh, zeroPageByte) {
    const previous = Math.floor(Number(value) || 0) & 0xff;
    const nextIndex = (Math.floor(Number(index) || 0) + 1) & 0xff;
    let accumulator = (previous << 3) & 0xff;
    accumulator = (accumulator - previous) & 0xff;

    let sum = accumulator + (Math.floor(Number(frameHigh) || 0) & 0xff);
    const carry = sum > 0xff ? 1 : 0;
    accumulator = sum & 0xff;
    sum = accumulator + (Math.floor(Number(zeroPageByte) || 0) & 0xff) + carry;
    return { value: sum & 0xff, index: nextIndex };
  }

  return Object.freeze({ advanceBattleRandom });
});
