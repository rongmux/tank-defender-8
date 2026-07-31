(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPauseLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPauseLifecycleDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      game,
      keys,
      stageStartAudio,
      bonusLifeAudio,
      powerUpPickupAudio,
      powerUpAppearAudio,
      pauseAudio,
      movementAudio,
      createPlayer,
      togglePause,
      update,
      stageStartAudioAudibility,
      bonusLifeAudioAudibility,
      powerUpPickupAudioAudible,
      powerUpAppearAudioAudible,
      startBonusLifeAudio,
      startPauseAudio,
      startPowerUpAppearAudio,
      startPowerUpPickupAudio,
      startStageStartAudio,
      stopBonusLifeAudio,
      stopMovementAudio,
      stopPauseAudio,
      stopPowerUpAppearAudio,
      stopPowerUpPickupAudio,
      stopStageStartAudio,
      syncBonusLifeAudioNodes,
      syncEnemyHitAudioNodes,
      syncMovementAudio,
      syncPauseAudioNodes,
      syncPowerUpAppearAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncStageStartAudioNodes,
      TILE
    } = scope;

    return Object.freeze({
      debugPauseAudioLifecycleProbe() {
        const previous = { ...game };
        const previousKeys = Array.from(keys);
        const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
        const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
        const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
        const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
        const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
        const state = () => ({
          paused: game.paused,
          pauseElapsed: game.pauseElapsed,
          tick: game.tick,
          active: pauseAudio.active,
          frame: pauseAudio.frame,
          stageStartFrame: stageStartAudio.frame,
          bonusLifeFrame: bonusLifeAudio.frame,
          powerUpPickupFrame: powerUpPickupAudio.frame,
          powerUpAppearFrame: powerUpAppearAudio.frame,
          stageStartAudibility: stageStartAudioAudibility(),
          bonusLifeAudibility: bonusLifeAudioAudibility(),
          powerUpPickupAudible: powerUpPickupAudioAudible(),
          powerUpAppearAudible: powerUpAppearAudioAudible(),
          movementAudioMode: movementAudio.mode
        });
        try {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          stopPauseAudio();
          const player = createPlayer(1);
          player.spawnFlash = 0;
          player.respawn = 0;
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.pauseElapsed = 0;
          game.tick = 25;
          game.clearPendingTimer = 0;
          game.players = [player];
          game.enemies = [];
          game.enemySpawned = 0;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          keys.clear();

          startStageStartAudio();
          startBonusLifeAudio();
          startPowerUpPickupAudio();
          startPowerUpAppearAudio();
          const entered = togglePause();
          const entry = state();
          for (let frame = 0; frame < 10; frame += 1) update();
          const paused = state();
          const exitedEarly = togglePause();
          const earlyResume = state();
          const reentered = togglePause();
          const restart = state();

          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          for (let frame = 0; frame < 35; frame += 1) update();
          const finalPausedFrame = state();
          const exitedBeforeEnd = togglePause();
          const finalActiveFrame = state();
          update();
          const ended = state();

          return {
            entered,
            exitedEarly,
            reentered,
            exitedBeforeEnd,
            entry,
            paused,
            earlyResume,
            restart,
            finalPausedFrame,
            finalActiveFrame,
            ended
          };
        } finally {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          stopPauseAudio();
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
          pauseAudio.active = previousPause.active;
          pauseAudio.frame = previousPause.frame;
          syncStageStartAudioNodes();
          syncBonusLifeAudioNodes();
          syncPowerUpPickupAudioNodes();
          syncPowerUpAppearAudioNodes();
          syncEnemyHitAudioNodes();
          syncPauseAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioPauseLifecycleDiagnostics
  });
});
