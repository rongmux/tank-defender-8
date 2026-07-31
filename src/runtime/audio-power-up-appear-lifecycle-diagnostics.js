(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPowerUpAppearLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPowerUpAppearLifecycleDiagnostics(scope) {
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
      powerUpAppearAudioAudible,
      releaseCarrierPowerUp,
      spawnPowerUp,
      makeGrid,
      setTile,
      updatePowerUpAppearAudio,
      updatePowerUpPickupAudio,
      startPowerUpPickupAudio,
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
      GRID,
      STEEL,
      TILE
    } = scope;

    return Object.freeze({
      debugPowerUpAppearAudioLifecycleProbe() {
        const previous = { ...game };
        const previousKeys = Array.from(keys);
        const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
        const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
        const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
        const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
        const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
        const state = () => ({
          active: powerUpAppearAudio.active,
          frame: powerUpAppearAudio.frame,
          paused: game.paused,
          audible: powerUpAppearAudioAudible(),
          movementAudioMode: movementAudio.mode,
          powerUpType: game.powerUp ? game.powerUp.type : null,
          powerUp: game.powerUp ? { ...game.powerUp } : null
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
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.powerUp = null;
          game.lastPowerUpSpawn = null;
          keys.clear();

          const carrier = { carrier: true, powerUpType: "star" };
          releaseCarrierPowerUp(carrier);
          const spawned = !carrier.carrier && Boolean(game.powerUp) && game.powerUp.type === "star";
          const start = state();
          for (let frame = 0; frame < 15; frame += 1) updatePowerUpAppearAudio();
          const beforePause = state();
          game.paused = true;
          syncPowerUpAppearAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) updatePowerUpAppearAudio();
          const paused = state();
          game.paused = false;
          syncPowerUpAppearAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 16; frame += 1) updatePowerUpAppearAudio();
          const beforeEnd = state();
          updatePowerUpAppearAudio();
          const end = state();

          spawnPowerUp("helmet");
          stageStartAudio.active = true;
          const stageStartPriority = state();
          stageStartAudio.active = false;
          bonusLifeAudio.active = true;
          bonusLifeAudio.frame = 0;
          const bonusLifePriority = state();
          bonusLifeAudio.active = false;
          startPowerUpPickupAudio();
          const pickupPriority = state();
          for (let frame = 0; frame < 32; frame += 1) {
            updatePowerUpPickupAudio();
            updatePowerUpAppearAudio();
          }
          const suppressedEnd = {
            ...state(),
            pickupActive: powerUpPickupAudio.active,
            pickupFrame: powerUpPickupAudio.frame
          };

          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          game.powerUp = null;
          game.base.alive = false;
          for (let r = 0; r < GRID; r += 1) {
            for (let c = 0; c < GRID; c += 1) setTile(game.grid, c, r, STEEL, 15);
          }
          const noSpotSpawned = spawnPowerUp("timer");
          const noSpot = state();

          return {
            spawned,
            start,
            beforePause,
            paused,
            beforeEnd,
            end,
            stageStartPriority,
            bonusLifePriority,
            pickupPriority,
            suppressedEnd,
            noSpotSpawned,
            noSpot
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
    createAudioPowerUpAppearLifecycleDiagnostics
  });
});
