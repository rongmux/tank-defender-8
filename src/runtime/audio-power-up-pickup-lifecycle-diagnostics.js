(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPowerUpPickupLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPowerUpPickupLifecycleDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      game,
      keys,
      stageStartAudio,
      bonusLifeAudio,
      powerUpPickupAudio,
      powerUpAppearAudio,
      movementAudio,
      createPlayer,
      powerUpPickupAudioAudible,
      startBonusLifeAudio,
      startPowerUpPickupAudio,
      stopBonusLifeAudio,
      stopMovementAudio,
      stopPowerUpAppearAudio,
      stopPowerUpPickupAudio,
      stopStageStartAudio,
      syncBonusLifeAudioNodes,
      syncEnemyHitAudioNodes,
      syncMovementAudio,
      syncPowerUpAppearAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncStageStartAudioNodes,
      updateBonusLifeAudio,
      updatePowerUpPickupAudio
    } = scope;

    return Object.freeze({
      debugPowerUpPickupAudioLifecycleProbe() {
        const previous = { ...game };
        const previousKeys = Array.from(keys);
        const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
        const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
        const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
        const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
        const state = () => ({
          active: powerUpPickupAudio.active,
          frame: powerUpPickupAudio.frame,
          paused: game.paused,
          audible: powerUpPickupAudioAudible(),
          movementAudioMode: movementAudio.mode
        });
        try {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          const player = createPlayer(1);
          player.spawnFlash = 0;
          player.respawn = 0;
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.clearPendingTimer = 0;
          game.players = [player];
          game.enemies = [];
          keys.clear();

          startPowerUpPickupAudio();
          const start = state();
          for (let frame = 0; frame < 38; frame += 1) updatePowerUpPickupAudio();
          const beforePause = state();
          game.paused = true;
          syncPowerUpPickupAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) updatePowerUpPickupAudio();
          const paused = state();
          game.paused = false;
          syncPowerUpPickupAudioNodes();
          syncMovementAudio();
          updatePowerUpPickupAudio();
          const end = state();

          startPowerUpPickupAudio();
          startBonusLifeAudio();
          const suppressedStart = state();
          for (let frame = 0; frame < 39; frame += 1) {
            updateBonusLifeAudio();
            updatePowerUpPickupAudio();
          }
          const suppressedEnd = {
            ...state(),
            bonusLifeActive: bonusLifeAudio.active,
            bonusLifeFrame: bonusLifeAudio.frame
          };
          return { start, beforePause, paused, end, suppressedStart, suppressedEnd };
        } finally {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          Object.assign(game, previous);
          keys.clear();
          for (const code of previousKeys) keys.add(code);
          stageStartAudio.active = previousStageStart.active;
          stageStartAudio.frame = previousStageStart.frame;
          bonusLifeAudio.active = previousBonusLife.active;
          bonusLifeAudio.frame = previousBonusLife.frame;
          powerUpPickupAudio.active = previousPowerUpPickup.active;
          powerUpPickupAudio.frame = previousPowerUpPickup.frame;
          powerUpAppearAudio.active = previousPowerUpAppear.active;
          powerUpAppearAudio.frame = previousPowerUpAppear.frame;
          syncStageStartAudioNodes();
          syncBonusLifeAudioNodes();
          syncPowerUpPickupAudioNodes();
          syncPowerUpAppearAudioNodes();
          syncEnemyHitAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioPowerUpPickupLifecycleDiagnostics
  });
});
