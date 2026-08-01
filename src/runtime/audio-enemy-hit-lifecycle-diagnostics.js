(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioEnemyHitLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioEnemyHitLifecycleDiagnostics(scope) {
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
      enemyDestroyAudio,
      playerDestroyAudio,
      playerShootAudio,
      movementIceAudio,
      pauseAudio,
      movementAudio,
      brickHitAudioAudible,
      enemyHitAudioAudible,
      enemyHitAudioPresentation,
      playerShootAudioAudible,
      enemyTypeDefinitions,
      gameSettings,
      createPlayer,
      hitTank,
      startBrickHitAudio,
      startEnemyHitAudio,
      startPauseAudio,
      startPlayerShootAudio,
      startStageStartAudio,
      startSteelHitAudio,
      startStage,
      stopBonusLifeAudio,
      stopBrickHitAudio,
      stopEnemyDestroyAudio,
      stopEnemyHitAudio,
      stopMovementAudio,
      stopMovementIceAudio,
      stopPauseAudio,
      stopPlayerDestroyAudio,
      stopPlayerShootAudio,
      stopPowerUpAppearAudio,
      stopPowerUpPickupAudio,
      stopStageStartAudio,
      stopSteelHitAudio,
      syncBonusLifeAudioNodes,
      syncBrickHitAudioNodes,
      syncEnemyDestroyAudioNodes,
      syncEnemyHitAudioNodes,
      syncMovementAudio,
      syncMovementIceAudioNodes,
      syncPauseAudioNodes,
      syncPlayerDestroyAudioNodes,
      syncPlayerShootAudioNodes,
      syncPowerUpAppearAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncStageStartAudioNodes,
      syncSteelHitAudioNodes,
      updateEnemyHitAudio,
      updatePauseAudio,
      updateSteelHitAudio,
      RIGHT,
      TILE
    } = scope;

    return Object.freeze({
      debugEnemyHitAudioLifecycleProbe() {
        const previous = { ...game };
        const previousKeys = Array.from(keys);
        const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
        const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
        const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
        const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
        const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
        const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
        const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
        const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
        const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
        const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
        const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
        const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
        const state = () => {
          const voice = enemyHitAudioPresentation(enemyHitAudio.frame).voices[0];
          const voiceActive = Boolean(voice);
          return {
            active: enemyHitAudio.active,
            frame: enemyHitAudio.frame,
            paused: game.paused,
            voiceActive,
            frequency: voice ? voice.frequency : null,
            audible: enemyHitAudio.active && voiceActive && enemyHitAudioAudible(),
            movementAudioMode: movementAudio.mode,
            brickHitActive: brickHitAudio.active,
            brickHitAudible: brickHitAudio.active && brickHitAudioAudible(),
            steelHitActive: steelHitAudio.active,
            enemyDestroyActive: enemyDestroyAudio.active,
            enemyDestroyFrame: enemyDestroyAudio.frame,
            playerDestroyActive: playerDestroyAudio.active,
            playerDestroyFrame: playerDestroyAudio.frame,
            playerShootActive: playerShootAudio.active,
            playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
            pauseActive: pauseAudio.active,
            pauseFrame: pauseAudio.frame
          };
        };
        const makeEnemy = (hp) => ({
          kind: "enemy",
          id: 100,
          x: 64,
          y: 64,
          w: 14,
          h: 14,
          alive: true,
          hp,
          spawnFlash: 0,
          carrier: false,
          typeIndex: 3,
          score: enemyTypeDefinitions()[3].score
        });
        const makeBullet = (ownerKind, ownerId) => ({
          x: 69,
          y: 69,
          w: gameSettings().projectileRules.bulletSize,
          h: gameSettings().projectileRules.bulletSize,
          dir: RIGHT,
          speed: 0,
          power: 1,
          ownerKind,
          ownerId,
          ownerKey: `${ownerKind}:${ownerId}`,
          remove: false
        });
        try {
          stopMovementAudio();
          stopStageStartAudio();
          stopBonusLifeAudio();
          stopPowerUpPickupAudio();
          stopPowerUpAppearAudio();
          stopBrickHitAudio();
          stopEnemyHitAudio();
          stopEnemyDestroyAudio();
          stopPlayerDestroyAudio();
          stopSteelHitAudio();
          stopPlayerShootAudio();
          stopMovementIceAudio();
          stopPauseAudio();
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.players = [];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          game.enemyKilled = 0;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          keys.clear();
          syncMovementAudio();

          const armoredEnemy = makeEnemy(2);
          const armoredBullet = makeBullet("player", 1);
          game.enemies = [armoredEnemy];
          const armoredHitResult = hitTank(armoredBullet);
          const armoredHit = {
            ...state(),
            hit: armoredHitResult,
            bulletRemoved: armoredBullet.remove,
            enemyAlive: armoredEnemy.alive,
            enemyHp: armoredEnemy.hp,
            explosionCount: game.explosions.length
          };
          updateEnemyHitAudio();
          const secondPitch = state();
          updateEnemyHitAudio();
          updateEnemyHitAudio();
          const silentTail = state();

          game.paused = true;
          startPauseAudio();
          syncEnemyHitAudioNodes();
          syncMovementAudio();
          for (let frame = 0; frame < 10; frame += 1) {
            updateEnemyHitAudio();
            updatePauseAudio();
          }
          const paused = state();
          game.paused = false;
          syncEnemyHitAudioNodes();
          syncMovementAudio();
          updateEnemyHitAudio();
          updateEnemyHitAudio();
          const end = state();

          stopPauseAudio();
          stopEnemyHitAudio();
          syncMovementAudio();
          game.explosions = [];
          game.enemyKilled = 0;
          const lethalEnemy = makeEnemy(1);
          const lethalBullet = makeBullet("player", 1);
          game.enemies = [lethalEnemy];
          const lethalHitResult = hitTank(lethalBullet);
          const lethalHit = {
            ...state(),
            hit: lethalHitResult,
            bulletRemoved: lethalBullet.remove,
            enemyAlive: lethalEnemy.alive,
            enemyDestroying: lethalEnemy.destroying,
            enemyHp: lethalEnemy.hp,
            enemyKilled: game.enemyKilled,
            explosionCount: game.explosions.length
          };

          stopEnemyDestroyAudio();

          game.explosions = [];
          game.enemies = [];
          const teammate = createPlayer(2);
          teammate.x = 64;
          teammate.y = 64;
          teammate.spawnFlash = 0;
          teammate.invuln = 0;
          teammate.stun = 0;
          game.players = [teammate];
          const friendlyBullet = makeBullet("player", 1);
          const friendlyHitResult = hitTank(friendlyBullet);
          const friendlyHit = {
            ...state(),
            hit: friendlyHitResult,
            bulletRemoved: friendlyBullet.remove,
            stun: teammate.stun,
            explosionCount: game.explosions.length
          };

          game.explosions = [];
          const targetPlayer = createPlayer(1);
          targetPlayer.x = 64;
          targetPlayer.y = 64;
          targetPlayer.spawnFlash = 0;
          targetPlayer.invuln = 0;
          game.players = [targetPlayer];
          const enemyBullet = makeBullet("enemy", 100);
          const playerHitResult = hitTank(enemyBullet);
          const playerHit = {
            ...state(),
            hit: playerHitResult,
            bulletRemoved: enemyBullet.remove,
            playerAlive: targetPlayer.alive,
            playerDestroying: targetPlayer.destroying,
            playerRespawn: targetPlayer.respawn,
            explosionCount: game.explosions.length
          };
          stopPlayerDestroyAudio();

          stopEnemyHitAudio();
          startEnemyHitAudio();
          startBrickHitAudio();
          startPlayerShootAudio();
          const separateChannels = state();

          stopBrickHitAudio();
          stopPlayerShootAudio();
          stopEnemyHitAudio();
          startEnemyHitAudio();
          startSteelHitAudio();
          const steelPriority = state();
          for (let frame = 0; frame < 5; frame += 1) {
            updateSteelHitAudio();
            updateEnemyHitAudio();
          }
          const steelSuppressedEnd = state();

          stopSteelHitAudio();
          startEnemyHitAudio();
          startStage(game.stage);
          const stageCleanup = state();
          return {
            armoredHit,
            secondPitch,
            silentTail,
            paused,
            end,
            lethalHit,
            friendlyHit,
            playerHit,
            separateChannels,
            steelPriority,
            steelSuppressedEnd,
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
          stopEnemyDestroyAudio();
          stopPlayerDestroyAudio();
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
          enemyDestroyAudio.active = previousEnemyDestroy.active;
          enemyDestroyAudio.frame = previousEnemyDestroy.frame;
          playerDestroyAudio.active = previousPlayerDestroy.active;
          playerDestroyAudio.frame = previousPlayerDestroy.frame;
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
          syncEnemyDestroyAudioNodes();
          syncPlayerDestroyAudioNodes();
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
          syncPauseAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioEnemyHitLifecycleDiagnostics
  });
});
