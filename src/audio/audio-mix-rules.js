(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const api = factory();
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.audioMixRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function activeAudio(state, name) {
    return Boolean(state && state.active && state.active[name]);
  }

  function resolveAudioAudibility(state) {
    const source = state || {};
    const pauseActive = activeAudio(source, "pause");
    const stageStartActive = activeAudio(source, "stageStart");
    const powerUpPickupActive = activeAudio(source, "powerUpPickup");
    const powerUpAppearActive = activeAudio(source, "powerUpAppear");
    const baseHitActive = activeAudio(source, "baseHit");
    const steelHitActive = activeAudio(source, "steelHit");
    const playerDestroyActive = activeAudio(source, "playerDestroy");
    const playerShootActive = activeAudio(source, "playerShoot");
    const bonusLifePulse1Active = Boolean(source.bonusLifePulse1Active);
    const bonusLifePulse2Active = Boolean(source.bonusLifePulse2Active);

    return {
      stageStartAudibility: [true, true, !pauseActive],
      bonusLifeAudibility: [true, !pauseActive],
      powerUpPickupAudible: !pauseActive &&
        !stageStartActive &&
        !bonusLifePulse2Active,
      powerUpAppearAudible: !pauseActive &&
        !stageStartActive &&
        !bonusLifePulse2Active &&
        !powerUpPickupActive,
      brickHitAudible: !source.paused && !stageStartActive,
      baseHitAudible: !pauseActive &&
        !stageStartActive &&
        !bonusLifePulse2Active &&
        !powerUpPickupActive &&
        !powerUpAppearActive,
      steelHitAudible: !pauseActive &&
        !stageStartActive &&
        !bonusLifePulse2Active &&
        !powerUpPickupActive &&
        !powerUpAppearActive &&
        !baseHitActive,
      enemyHitAudible: !pauseActive &&
        !stageStartActive &&
        !bonusLifePulse2Active &&
        !powerUpPickupActive &&
        !powerUpAppearActive &&
        !baseHitActive &&
        !steelHitActive,
      enemyDestroyAudible: !playerDestroyActive,
      playerShootAudible: !stageStartActive && !bonusLifePulse1Active,
      movementIceAudible: !stageStartActive &&
        !bonusLifePulse1Active &&
        !playerShootActive,
      stageBonusAudible: !bonusLifePulse2Active
    };
  }

  function isMovementAudioBlocked(state) {
    const source = state || {};
    return source.screen !== "playing" ||
      Boolean(source.paused) ||
      source.clearPendingTimer > 0 ||
      activeAudio(source, "stageStart") ||
      Boolean(source.bonusLifePulse2Active) ||
      activeAudio(source, "powerUpPickup") ||
      activeAudio(source, "powerUpAppear") ||
      activeAudio(source, "baseHit") ||
      activeAudio(source, "steelHit") ||
      activeAudio(source, "enemyHit") ||
      activeAudio(source, "pause");
  }

  function resolveMovementAudioMode(state) {
    const source = state || {};
    if (isMovementAudioBlocked(source)) return "none";
    return source.baseDestroyTimer <= 0 && source.playerMovementRequested
      ? "player"
      : "enemy";
  }

  return Object.freeze({
    isMovementAudioBlocked,
    resolveAudioAudibility,
    resolveMovementAudioMode
  });
});
