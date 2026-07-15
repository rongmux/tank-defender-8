(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before player-movement-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerMovementSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const DEFAULT_PLAYER_FRAME_CADENCE = Object.freeze([true, true, false, true]);
  const DEFAULT_PLAYER_MOVEMENT = Object.freeze({
    speed: 1,
    frameCadence: DEFAULT_PLAYER_FRAME_CADENCE,
    iceSlideFrames: 28,
    iceSlideSpeed: 1
  });

  function clonePlayerMovementSettings(settings) {
    const source = settings || DEFAULT_PLAYER_MOVEMENT;
    return {
      ...source,
      frameCadence: (source.frameCadence || DEFAULT_PLAYER_FRAME_CADENCE).slice()
    };
  }

  /** Normalizes fixed-loop player speed, cadence, and ice inertia settings. */
  function normalizePlayerMovement(movement) {
    const source = movement || {};
    if (typeof source !== "object") throw new Error("gameSettings.playerMovement must be an object");
    const defaultCadence = source.speed === undefined ? DEFAULT_PLAYER_FRAME_CADENCE : [true];
    return {
      speed: normalizeNumber(source.speed, DEFAULT_PLAYER_MOVEMENT.speed, 0.1, 6, false, "gameSettings.playerMovement.speed"),
      frameCadence: normalizePlayerFrameCadence(source.frameCadence, defaultCadence),
      iceSlideFrames: normalizeNumber(source.iceSlideFrames, DEFAULT_PLAYER_MOVEMENT.iceSlideFrames, 0, 3600, true, "gameSettings.playerMovement.iceSlideFrames"),
      iceSlideSpeed: normalizeNumber(source.iceSlideSpeed, DEFAULT_PLAYER_MOVEMENT.iceSlideSpeed, 0, 6, false, "gameSettings.playerMovement.iceSlideSpeed")
    };
  }

  function normalizePlayerFrameCadence(cadence, fallback) {
    const source = cadence === undefined ? fallback : cadence;
    if (!Array.isArray(source) || source.length < 1 || source.length > 16 || source.every((active) => active !== true)) {
      throw new Error("gameSettings.playerMovement.frameCadence must contain 1 to 16 booleans with at least one true value");
    }
    if (source.some((active) => typeof active !== "boolean")) {
      throw new Error("gameSettings.playerMovement.frameCadence must contain only booleans");
    }
    return source.slice();
  }

  return Object.freeze({
    DEFAULT_PLAYER_FRAME_CADENCE,
    DEFAULT_PLAYER_MOVEMENT,
    clonePlayerMovementSettings,
    normalizePlayerFrameCadence,
    normalizePlayerMovement
  });
});
