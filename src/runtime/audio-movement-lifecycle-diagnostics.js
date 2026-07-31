(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioMovementLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioMovementLifecycleDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      game,
      keys,
      stageStartAudio,
      bonusLifeAudio,
      powerUpPickupAudio,
      powerUpAppearAudio,
      brickHitAudio,
      steelHitAudio,
      enemyHitAudio,
      playerShootAudio,
      movementIceAudio,
      pauseAudio,
      movementAudio,
      createPlayer,
      movementIceAudioAudible,
      RIGHT,
      GRID,
      ICE,
      TILE,
      makeCell,
      syncMovementAudio,
      syncMovementIceAudioNodes,
      startBonusLifeAudio,
      startMovementIceAudio,
      startStage,
      startStageStartAudio,
      stopBonusLifeAudio,
      stopBrickHitAudio,
      stopEnemyHitAudio,
      stopMovementAudio,
      stopMovementIceAudio,
      stopPauseAudio,
      stopPlayerShootAudio,
      stopPowerUpAppearAudio,
      stopPowerUpPickupAudio,
      stopStageStartAudio,
      stopSteelHitAudio,
      updateMovementIceAudio,
      updatePlayerMovement
    } = scope;

    return Object.freeze({
      debugMovementIceAudioLifecycleProbe() {
        const previous = { ...game };
        const previousKeys = Array.from(keys);
        const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
        const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
        const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
        const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
        const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
        const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
        const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
        const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
        const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
        const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
        const state = () => ({
          active: movementIceAudio.active,
          frame: movementIceAudio.frame,
          paused: game.paused,
          audible: movementIceAudio.active && movementIceAudioAudible(),
          movementAudioMode: movementAudio.mode
        });
        try {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          stopBrickHitAudio();
          stopEnemyHitAudio();
          stopSteelHitAudio();
          stopPlayerShootAudio();
          stopMovementIceAudio();
          stopPauseAudio();
          const player = createPlayer(1);
          player.x = 32;
          player.y = 32;
          player.dir = RIGHT;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.respawn = 0;
          player.slide = 0;
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.clearPendingTimer = 0;
          game.players = [player];
          game.enemies = [];
          game.grid = Array.from(
            { length: GRID },
            () => Array.from({ length: GRID }, () => makeCell(ICE, 0))
          );
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          keys.clear();
          syncMovementAudio();

          updatePlayerMovement(player, RIGHT);
          const start = state();
          for (let frame = 0; frame < 3; frame += 1) updateMovementIceAudio();
          const beforePause = state();
          game.paused = true;
          syncMovementIceAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) updateMovementIceAudio();
          const paused = state();
          game.paused = false;
          syncMovementIceAudioNodes();
          syncMovementAudio();
          updateMovementIceAudio();
          const end = state();

          player.slide = 0;
          updatePlayerMovement(player, RIGHT);
          const retriggered = state();
          startStageStartAudio();
          syncMovementIceAudioNodes();
          const stageStartPriority = state();
          for (let frame = 0; frame < 4; frame += 1) updateMovementIceAudio();
          const stageStartSuppressedEnd = state();

          stopStageStartAudio();
          startMovementIceAudio();
          startBonusLifeAudio();
          const bonusLifePriority = state();
          for (let frame = 0; frame < 4; frame += 1) updateMovementIceAudio();
          const bonusLifeSuppressedEnd = state();

          stopBonusLifeAudio();
          startMovementIceAudio();
          startStage(game.stage);
          const stageCleanup = state();
          return {
            start,
            beforePause,
            paused,
            end,
            retriggered,
            stageStartPriority,
            stageStartSuppressedEnd,
            bonusLifePriority,
            bonusLifeSuppressedEnd,
            stageCleanup
          };
        } finally {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          stopBrickHitAudio();
          stopEnemyHitAudio();
          stopSteelHitAudio();
          stopPlayerShootAudio();
          stopMovementIceAudio();
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
          brickHitAudio.active = previousBrickHit.active;
          brickHitAudio.frame = previousBrickHit.frame;
          steelHitAudio.active = previousSteelHit.active;
          steelHitAudio.frame = previousSteelHit.frame;
          enemyHitAudio.active = previousEnemyHit.active;
          enemyHitAudio.frame = previousEnemyHit.frame;
          playerShootAudio.active = previousPlayerShoot.active;
          playerShootAudio.frame = previousPlayerShoot.frame;
          movementIceAudio.active = previousMovementIce.active;
          movementIceAudio.frame = previousMovementIce.frame;
          pauseAudio.active = previousPause.active;
          pauseAudio.frame = previousPause.frame;
          syncMovementIceAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioMovementLifecycleDiagnostics
  });
});
