(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioBrickHitLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioBrickHitLifecycleDiagnostics(scope) {
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
      brickHitAudioAudible,
      steelHitAudioAudible,
      playerShootAudioAudible,
      gameSettings,
      hitTerrain,
      makeCell,
      makeGrid,
      startBrickHitAudio,
      startPauseAudio,
      startPlayerShootAudio,
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
      updateBrickHitAudio,
      updatePauseAudio,
      BRICK,
      RIGHT,
      STEEL,
      TILE
    } = scope;

    return Object.freeze({
      debugBrickHitAudioLifecycleProbe() {
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
          active: brickHitAudio.active,
          frame: brickHitAudio.frame,
          paused: game.paused,
          audible: brickHitAudio.active && brickHitAudioAudible(),
          movementAudioMode: movementAudio.mode,
          steelHitActive: steelHitAudio.active,
          steelHitAudible: steelHitAudio.active && steelHitAudioAudible(),
          playerShootActive: playerShootAudio.active,
          playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
          pauseActive: pauseAudio.active,
          pauseFrame: pauseAudio.frame,
          stageStartActive: stageStartAudio.active
        });
        const wallBullet = (ownerKind, power) => ({
          x: TILE,
          y: TILE,
          w: gameSettings().projectileRules.bulletSize,
          h: gameSettings().projectileRules.bulletSize,
          dir: RIGHT,
          speed: 0,
          power,
          ownerKind,
          ownerId: 1,
          ownerKey: `${ownerKind}:1`,
          remove: false
        });
        const prepareWall = (type) => {
          game.grid = makeGrid();
          game.grid[1][1] = makeCell(type, 15);
          game.explosions = [];
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
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          keys.clear();
          syncMovementAudio();

          prepareWall(BRICK);
          const playerBrickBullet = wallBullet("player", 1);
          const playerBrickHit = hitTerrain(playerBrickBullet);
          const playerBrick = {
            ...state(),
            hit: playerBrickHit,
            bulletRemoved: playerBrickBullet.remove,
            wallMask: game.grid[1][1].mask,
            wallBrickMask: game.grid[1][1].brickMask,
            explosionCount: game.explosions.length
          };
          for (let frame = 0; frame < 2; frame += 1) updateBrickHitAudio();
          const beforePause = state();
          game.paused = true;
          startPauseAudio();
          syncBrickHitAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) {
            updateBrickHitAudio();
            updatePauseAudio();
          }
          const paused = state();
          game.paused = false;
          syncBrickHitAudioNodes();
          syncMovementAudio();
          updateBrickHitAudio();
          const end = state();

          stopPauseAudio();
          stopBrickHitAudio();
          syncMovementAudio();
          prepareWall(BRICK);
          const enemyBrickBullet = wallBullet("enemy", 1);
          const enemyBrickHit = hitTerrain(enemyBrickBullet);
          const enemyBrick = {
            ...state(),
            hit: enemyBrickHit,
            bulletRemoved: enemyBrickBullet.remove,
            wallMask: game.grid[1][1].mask,
            explosionCount: game.explosions.length
          };

          prepareWall(STEEL);
          const maxPowerSteelBullet = wallBullet("player", 3);
          const maxPowerSteelHit = hitTerrain(maxPowerSteelBullet);
          const destructibleSteel = {
            ...state(),
            hit: maxPowerSteelHit,
            bulletRemoved: maxPowerSteelBullet.remove,
            wallMask: game.grid[1][1].mask,
            explosionCount: game.explosions.length
          };

          startSteelHitAudio();
          startPlayerShootAudio();
          const separateChannels = state();

          stopSteelHitAudio();
          stopPlayerShootAudio();
          stopBrickHitAudio();
          startBrickHitAudio();
          startStageStartAudio();
          const stageStartPriority = state();
          for (let frame = 0; frame < 3; frame += 1) updateBrickHitAudio();
          const stageStartSuppressedEnd = state();

          stopStageStartAudio();
          startBrickHitAudio();
          startStage(game.stage);
          const stageCleanup = state();
          return {
            playerBrick,
            beforePause,
            paused,
            end,
            enemyBrick,
            destructibleSteel,
            separateChannels,
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
    createAudioBrickHitLifecycleDiagnostics
  });
});
