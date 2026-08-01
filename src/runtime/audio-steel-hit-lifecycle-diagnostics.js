(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioSteelHitLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioSteelHitLifecycleDiagnostics(scope) {
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
      steelHitAudioAudible,
      playerShootAudioAudible,
      gameSettings,
      makeGrid,
      resolveBullet,
      startPauseAudio,
      startPlayerShootAudio,
      startPowerUpAppearAudio,
      startStageStartAudio,
      startSteelHitAudio,
      startStage,
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
      syncBonusLifeAudioNodes,
      syncBrickHitAudioNodes,
      syncEnemyHitAudioNodes,
      syncMovementAudio,
      syncMovementIceAudioNodes,
      syncPauseAudioNodes,
      syncPlayerShootAudioNodes,
      syncPowerUpAppearAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncStageStartAudioNodes,
      syncSteelHitAudioNodes,
      updatePauseAudio,
      updateSteelHitAudio,
      FIELD_H,
      LEFT,
      TILE
    } = scope;

    return Object.freeze({
      debugSteelHitAudioLifecycleProbe() {
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
          active: steelHitAudio.active,
          frame: steelHitAudio.frame,
          paused: game.paused,
          audible: steelHitAudio.active && steelHitAudioAudible(),
          movementAudioMode: movementAudio.mode,
          powerUpAppearActive: powerUpAppearAudio.active,
          playerShootActive: playerShootAudio.active,
          playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
          pauseActive: pauseAudio.active,
          pauseFrame: pauseAudio.frame
        });
        const boundaryBullet = (ownerKind) => {
          const rules = gameSettings().projectileRules;
          return {
            x: -rules.boundsPadding - 1,
            y: FIELD_H / 2,
            w: rules.bulletSize,
            h: rules.bulletSize,
            dir: LEFT,
            speed: 0,
            power: 1,
            ownerKind,
            ownerId: 1,
            ownerKey: `${ownerKind}:1`,
            remove: false
          };
        };
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
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.clearPendingTimer = 0;
          game.players = [];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          keys.clear();
          syncMovementAudio();

          const playerBullet = boundaryBullet("player");
          resolveBullet(playerBullet);
          const playerBoundary = {
            ...state(),
            bulletRemoved: playerBullet.remove,
            explosionCount: game.explosions.length
          };
          for (let frame = 0; frame < 3; frame += 1) updateSteelHitAudio();
          const beforePause = state();
          game.paused = true;
          startPauseAudio();
          syncSteelHitAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) {
            updateSteelHitAudio();
            updatePauseAudio();
          }
          const paused = state();
          game.paused = false;
          syncSteelHitAudioNodes();
          syncMovementAudio();
          updateSteelHitAudio();
          const end = state();

          stopPauseAudio();
          stopSteelHitAudio();
          syncMovementAudio();
          game.explosions = [];
          const enemyBullet = boundaryBullet("enemy");
          resolveBullet(enemyBullet);
          const enemyBoundary = {
            ...state(),
            bulletRemoved: enemyBullet.remove,
            explosionCount: game.explosions.length
          };

          startSteelHitAudio();
          startPlayerShootAudio();
          const separatePulseChannels = state();

          stopPlayerShootAudio();
          stopSteelHitAudio();
          startSteelHitAudio();
          startPowerUpAppearAudio();
          const appearancePriority = state();
          for (let frame = 0; frame < 4; frame += 1) updateSteelHitAudio();
          const appearanceSuppressedEnd = state();

          stopPowerUpAppearAudio();
          startSteelHitAudio();
          startStageStartAudio();
          syncSteelHitAudioNodes();
          const stageStartPriority = state();
          for (let frame = 0; frame < 4; frame += 1) updateSteelHitAudio();
          const stageStartSuppressedEnd = state();

          stopStageStartAudio();
          startSteelHitAudio();
          startStage(game.stage);
          const stageCleanup = state();
          return {
            playerBoundary,
            beforePause,
            paused,
            end,
            enemyBoundary,
            separatePulseChannels,
            appearancePriority,
            appearanceSuppressedEnd,
            stageStartPriority,
            stageStartSuppressedEnd,
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
          syncStageStartAudioNodes();
          syncBonusLifeAudioNodes();
          syncPowerUpPickupAudioNodes();
          syncPowerUpAppearAudioNodes();
          syncBrickHitAudioNodes();
          syncSteelHitAudioNodes();
          syncEnemyHitAudioNodes();
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
          syncPauseAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioSteelHitLifecycleDiagnostics
  });
});
