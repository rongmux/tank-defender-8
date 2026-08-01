(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioBonusLifeLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioBonusLifeLifecycleDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      game,
      keys,
      stageStartAudio,
      bonusLifeAudio,
      powerUpAppearAudio,
      movementAudio,
      createPlayer,
      bonusLifePulse2Active,
      startBonusLifeAudio,
      stopBonusLifeAudio,
      stopMovementAudio,
      stopPowerUpAppearAudio,
      stopStageStartAudio,
      syncBonusLifeAudioNodes,
      syncEnemyHitAudioNodes,
      syncMovementAudio,
      syncPowerUpAppearAudioNodes,
      syncStageStartAudioNodes,
      updateBonusLifeAudio
    } = scope;

    return Object.freeze({
      debugBonusLifeAudioLifecycleProbe() {
        const previous = { ...game };
        const previousKeys = Array.from(keys);
        const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
        const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
        const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
        const state = () => ({
          active: bonusLifeAudio.active,
          frame: bonusLifeAudio.frame,
          paused: game.paused,
          pulse2Active: bonusLifePulse2Active(),
          movementAudioMode: movementAudio.mode
        });
        try {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
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

          startBonusLifeAudio();
          const start = state();
          for (let frame = 0; frame < 53; frame += 1) updateBonusLifeAudio();
          const beforePulse2End = state();
          updateBonusLifeAudio();
          const pulse2End = state();

          game.paused = true;
          syncBonusLifeAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) updateBonusLifeAudio();
          const paused = state();

          game.paused = false;
          syncBonusLifeAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 5; frame += 1) updateBonusLifeAudio();
          const beforeEnd = state();
          updateBonusLifeAudio();
          const end = state();
          return { start, beforePulse2End, pulse2End, paused, beforeEnd, end };
        } finally {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpAppearAudio();
          Object.assign(game, previous);
          keys.clear();
          for (const code of previousKeys) keys.add(code);
          stageStartAudio.active = previousStageStart.active;
          stageStartAudio.frame = previousStageStart.frame;
          bonusLifeAudio.active = previousBonusLife.active;
          bonusLifeAudio.frame = previousBonusLife.frame;
          powerUpAppearAudio.active = previousPowerUpAppear.active;
          powerUpAppearAudio.frame = previousPowerUpAppear.frame;
          syncStageStartAudioNodes();
          syncBonusLifeAudioNodes();
          syncPowerUpAppearAudioNodes();
          syncEnemyHitAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioBonusLifeLifecycleDiagnostics
  });
});
