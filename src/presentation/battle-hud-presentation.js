(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const geometry = isCommonJs ? require("../core/geometry") : browserModules.geometry;
  if (!geometry) throw new Error("geometry module must load before battle-hud-presentation.js");

  const api = factory(geometry);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.battleHudPresentation = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry) {
  "use strict";

  const { clamp } = geometry;
  const GAME_OVER_TEXT_START_Y = 240;
  const GAME_OVER_TEXT_TARGET_Y = 0x71;
  const PLAYER_GAME_OVER_MESSAGE_WIDTH = 32;
  const PLAYER_GAME_OVER_MESSAGE_HEIGHT = 8;
  const PAUSE_TEXT = "PAUSE";
  const PAUSE_TEXT_X = 100;
  const PAUSE_TEXT_Y = 128;

  function nonNegativeInteger(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function panelEnemyCounterRemaining(total, spawned) {
    const countTotal = nonNegativeInteger(total);
    const spawnedCount = nonNegativeInteger(spawned);
    return clamp(countTotal - spawnedCount, 0, countTotal);
  }

  function panelLifeCount(player) {
    const lives = player ? nonNegativeInteger(player.lives) : 0;
    return Math.max(0, lives - 1);
  }

  function playerGameOverMessagePresentation(message, options) {
    if (!message || message.timer <= 0) return null;
    const source = options || {};
    return {
      playerId: message.playerId,
      timer: message.timer,
      x: message.x,
      y: message.y,
      left: message.x - 8,
      width: PLAYER_GAME_OVER_MESSAGE_WIDTH,
      height: PLAYER_GAME_OVER_MESSAGE_HEIGHT,
      visible: !source.paused && !source.demoMode
    };
  }

  /** Projects the retained field timer onto the original one-pixel-per-frame banner slide. */
  function gameOverBannerPresentation(timer, options) {
    const source = options || {};
    const slideFrames = nonNegativeInteger(source.slideFrames);
    const holdFrames = nonNegativeInteger(source.holdFrames);
    const duration = slideFrames + holdFrames;
    const startY = Number.isFinite(Number(source.startY))
      ? Number(source.startY)
      : GAME_OVER_TEXT_START_Y;
    const targetY = Number.isFinite(Number(source.targetY))
      ? Number(source.targetY)
      : GAME_OVER_TEXT_TARGET_Y;
    const remaining = clamp(nonNegativeInteger(timer), 0, duration);
    const elapsed = duration - remaining;
    const progress = slideFrames <= 0 ? 1 : clamp(elapsed / slideFrames, 0, 1);
    return {
      duration,
      remaining,
      elapsed,
      slideFrames,
      holdFrames,
      progress,
      y: Math.round(startY + (targetY - startY) * progress)
    };
  }

  function pausePresentation(frame) {
    const value = nonNegativeInteger(frame) & 0xff;
    return {
      frame: value,
      visible: (value & 0x10) !== 0,
      text: PAUSE_TEXT,
      x: PAUSE_TEXT_X,
      y: PAUSE_TEXT_Y
    };
  }

  return Object.freeze({
    GAME_OVER_TEXT_START_Y,
    GAME_OVER_TEXT_TARGET_Y,
    PAUSE_TEXT,
    PAUSE_TEXT_X,
    PAUSE_TEXT_Y,
    PLAYER_GAME_OVER_MESSAGE_HEIGHT,
    PLAYER_GAME_OVER_MESSAGE_WIDTH,
    gameOverBannerPresentation,
    panelEnemyCounterRemaining,
    panelLifeCount,
    pausePresentation,
    playerGameOverMessagePresentation
  });
});
