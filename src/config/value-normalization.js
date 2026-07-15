(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.valueNormalization = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Applies a fallback, coerces numeric input, and enforces one documented range. */
  function normalizeNumber(value, fallback, min, max, integer, label) {
    const normalized = value === undefined ? fallback : Number(value);
    if (!Number.isFinite(normalized) || normalized < min || normalized > max || (integer && !Number.isInteger(normalized))) {
      throw new Error(`${label} must be ${integer ? "an integer" : "a number"} from ${min} to ${max}`);
    }
    return normalized;
  }

  /** Normalizes one optional color without changing its caller-provided letter case. */
  function normalizeHexColor(value, fallback, label) {
    const color = value === undefined ? fallback : String(value);
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`${label} must be a #rrggbb color`);
    return color;
  }

  return Object.freeze({
    normalizeHexColor,
    normalizeNumber
  });
});
