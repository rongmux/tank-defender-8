(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPlayerShootLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPlayerShootLifecycleDiagnostics(scope) {
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
      playerShootAudioAudible,
      movementIceAudioAudible,
      createPlayer,
      enemyTypeDefinitions,
      makeGrid,
      shoot,
      startMovementIceAudio,
      startStageStartAudio,
      startBonusLifeAudio,
      startStage,
      stopMovementAudio,
      stopStageStartAudio,
      stopBonusLifeAudio,
      stopPowerUpPickupAudio,
      stopPowerUpAppearAudio,
      stopBrickHitAudio,
      stopEnemyHitAudio,
      stopSteelHitAudio,
      stopPlayerShootAudio,
      stopMovementIceAudio,
      stopPauseAudio,
      updatePlayerShootAudio,
      updateMovementIceAudio,
      syncStageStartAudioNodes,
      syncBonusLifeAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncPowerUpAppearAudioNodes,
      syncBrickHitAudioNodes,
      syncSteelHitAudioNodes,
      syncEnemyHitAudioNodes,
      syncPlayerShootAudioNodes,
      syncMovementIceAudioNodes,
      syncPauseAudioNodes,
      syncMovementAudio,
      RIGHT,
      LEFT,
      TILE
    } = scope;

    return Object.freeze({
      debugPlayerShootAudioLifecycleProbe() {
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
          active: playerShootAudio.active,
          frame: playerShootAudio.frame,
          paused: game.paused,
          audible: playerShootAudio.active && playerShootAudioAudible(),
          iceActive: movementIceAudio.active,
          iceFrame: movementIceAudio.frame,
          iceAudible: movementIceAudio.active && movementIceAudioAudible()
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
          player.reload = 0;
          const enemyType = enemyTypeDefinitions()[0];
          const enemy = {
            kind: "enemy",
            id: 100,
            x: 64,
            y: 32,
            w: 14,
            h: 14,
            dir: LEFT,
            alive: true,
            spawnFlash: 0,
            reload: 0,
            reloadBase: enemyType.reload,
            bulletSpeed: enemyType.bullet,
            bulletPower: enemyType.wallPower
          };
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.clearPendingTimer = 0;
          game.players = [player];
          game.enemies = [enemy];
          game.bullets = [];
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          keys.clear();

          shoot(player);
          const playerStart = { ...state(), bulletCount: game.bullets.length };
          for (let frame = 0; frame < 5; frame += 1) updatePlayerShootAudio();
          player.reload = 0;
          shoot(player);
          const failedRetrigger = { ...state(), bulletCount: game.bullets.length };
          for (let frame = 0; frame < 9; frame += 1) updatePlayerShootAudio();
          const beforePause = state();
          game.paused = true;
          syncPlayerShootAudioNodes();
          for (let frame = 0; frame < 10; frame += 1) updatePlayerShootAudio();
          const paused = state();
          game.paused = false;
          syncPlayerShootAudioNodes();
          updatePlayerShootAudio();
          const end = state();

          stopPlayerShootAudio();
          game.bullets = [];
          shoot(enemy);
          const enemyShot = { ...state(), bulletCount: game.bullets.length };

          game.bullets = [];
          player.reload = 0;
          shoot(player);
          startMovementIceAudio();
          const shotPriority = state();
          for (let frame = 0; frame < 4; frame += 1) {
            updatePlayerShootAudio();
            updateMovementIceAudio();
          }
          const iceSuppressedEnd = state();

          stopPlayerShootAudio();
          player.reload = 0;
          game.bullets = [];
          shoot(player);
          startStageStartAudio();
          syncPlayerShootAudioNodes();
          const stageStartPriority = state();
          for (let frame = 0; frame < 15; frame += 1) updatePlayerShootAudio();
          const stageStartSuppressedEnd = state();

          stopStageStartAudio();
          player.reload = 0;
          game.bullets = [];
          shoot(player);
          startBonusLifeAudio();
          const bonusLifePriority = state();
          for (let frame = 0; frame < 15; frame += 1) updatePlayerShootAudio();
          const bonusLifeSuppressedEnd = state();

          stopBonusLifeAudio();
          player.reload = 0;
          game.bullets = [];
          shoot(player);
          startStage(game.stage);
          const stageCleanup = state();
          return {
            playerStart,
            failedRetrigger,
            beforePause,
            paused,
            end,
            enemyShot,
            shotPriority,
            iceSuppressedEnd,
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
    createAudioPlayerShootLifecycleDiagnostics
  });
});
