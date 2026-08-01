(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioEnemyDestroyLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioEnemyDestroyLifecycleDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      game,
      stageStartAudio,
      bonusLifeAudio,
      powerUpPickupAudio,
      powerUpAppearAudio,
      brickHitAudio,
      baseHitAudio,
      steelHitAudio,
      enemyHitAudio,
      enemyDestroyAudio,
      playerDestroyAudio,
      playerShootAudio,
      movementIceAudio,
      pauseAudio,
      scoreCountAudio,
      stageBonusAudio,
      enemyDestroyAudioPresentation,
      enemyTypeDefinitions,
      gameSettings,
      createPlayer,
      hitTank,
      applyPowerUp,
      startEnemyDestroyAudio,
      startPauseAudio,
      startStage,
      stopMovementAudio,
      stopFixedFrameAudio,
      stopEnemyDestroyAudio,
      stopPauseAudio,
      updateEnemyDestroyAudio,
      updatePauseAudio,
      syncStageStartAudioNodes,
      syncBonusLifeAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncPowerUpAppearAudioNodes,
      syncBrickHitAudioNodes,
      syncBaseHitAudioNodes,
      syncSteelHitAudioNodes,
      syncEnemyHitAudioNodes,
      syncEnemyDestroyAudioNodes,
      syncPlayerDestroyAudioNodes,
      syncPlayerShootAudioNodes,
      syncMovementIceAudioNodes,
      syncPauseAudioNodes,
      syncScoreCountAudioNodes,
      syncStageBonusAudioNodes,
      syncMovementAudio,
      RIGHT,
      TILE
    } = scope;

    return Object.freeze({
      debugEnemyDestroyAudioLifecycleProbe() {
        const previous = { ...game };
        const audioStates = [
          stageStartAudio,
          bonusLifeAudio,
          powerUpPickupAudio,
          powerUpAppearAudio,
          brickHitAudio,
          baseHitAudio,
          steelHitAudio,
          enemyHitAudio,
          enemyDestroyAudio,
          playerDestroyAudio,
          playerShootAudio,
          movementIceAudio,
          pauseAudio,
          scoreCountAudio,
          stageBonusAudio
        ];
        const previousAudio = audioStates.map((audioState) => ({
          active: audioState.active,
          frame: audioState.frame
        }));
        const state = () => {
          const voice = enemyDestroyAudioPresentation(enemyDestroyAudio.frame).voices[0];
          return {
            active: enemyDestroyAudio.active,
            frame: enemyDestroyAudio.frame,
            frequency: voice ? voice.frequency : null,
            gain: voice ? voice.gain : null,
            wave: voice ? voice.wave : null,
            audible: enemyDestroyAudio.active && Boolean(voice) && !game.paused,
            paused: game.paused,
            enemyHitActive: enemyHitAudio.active
          };
        };
        const makeEnemy = (id, spawnFlash) => ({
          kind: "enemy",
          id,
          x: 64 + id * 16,
          y: 64,
          w: 14,
          h: 14,
          alive: true,
          hp: 1,
          spawnFlash: Math.max(0, Math.floor(Number(spawnFlash) || 0)),
          carrier: false,
          typeIndex: 0,
          score: enemyTypeDefinitions()[0].score
        });
        const makeBullet = () => ({
          x: 85,
          y: 69,
          w: gameSettings().projectileRules.bulletSize,
          h: gameSettings().projectileRules.bulletSize,
          dir: RIGHT,
          speed: 0,
          power: 1,
          ownerKind: "player",
          ownerId: 1,
          ownerKey: "player:1",
          remove: false
        });
        try {
          stopMovementAudio();
          for (const audioState of audioStates) stopFixedFrameAudio(audioState);
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.clearPendingTimer = 0;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [createPlayer(1)];
          game.enemies = [makeEnemy(1, 0)];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          game.enemyKilled = 0;
          const lethalBullet = makeBullet();
          const lethalHitResult = hitTank(lethalBullet);
          const lethalHit = {
            ...state(),
            hit: lethalHitResult,
            bulletRemoved: lethalBullet.remove,
            enemyAlive: game.enemies[0].alive,
            enemyDestroying: game.enemies[0].destroying,
            enemyKilled: game.enemyKilled,
            explosionCount: game.explosions.length
          };

          updateEnemyDestroyAudio();
          updateEnemyDestroyAudio();
          const secondEnvelope = state();
          updateEnemyDestroyAudio();
          updateEnemyDestroyAudio();
          const tailEnvelope = state();

          game.paused = true;
          startPauseAudio();
          syncEnemyDestroyAudioNodes();
          for (let frame = 0; frame < 10; frame += 1) {
            updateEnemyDestroyAudio();
            updatePauseAudio();
          }
          const paused = state();
          game.paused = false;
          syncEnemyDestroyAudioNodes();
          for (let frame = 0; frame < 9; frame += 1) updateEnemyDestroyAudio();
          const finalFrame = state();
          updateEnemyDestroyAudio();
          const end = state();

          stopPauseAudio();
          stopEnemyDestroyAudio();
          game.players = [createPlayer(1)];
          const grenadeTargets = [makeEnemy(1, 0), makeEnemy(2, 0), makeEnemy(3, 12)];
          game.enemies = grenadeTargets;
          game.enemyKilled = 0;
          game.explosions = [];
          applyPowerUp(game.players[0], "grenade");
          const grenade = {
            ...state(),
            activeEnemies: grenadeTargets.filter((enemy) => enemy.alive && !enemy.destroying && enemy.spawnFlash <= 0).length,
            destroyingEnemies: grenadeTargets.filter((enemy) => enemy.destroying).length,
            spawningAlive: grenadeTargets[2].alive,
            enemyKilled: game.enemyKilled,
            explosionCount: game.explosions.length
          };

          stopEnemyDestroyAudio();
          game.enemies = [makeEnemy(1, 12)];
          game.enemyKilled = 0;
          game.explosions = [];
          applyPowerUp(game.players[0], "grenade");
          const noActiveTargets = {
            ...state(),
            spawningAlive: game.enemies[0].alive,
            enemyKilled: game.enemyKilled,
            explosionCount: game.explosions.length
          };

          startEnemyDestroyAudio();
          startStage(game.stage);
          const stageCleanup = state();

          return { lethalHit, secondEnvelope, tailEnvelope, paused, finalFrame, end, grenade, noActiveTargets, stageCleanup };
        } finally {
          for (const audioState of audioStates) stopFixedFrameAudio(audioState);
          Object.assign(game, previous);
          audioStates.forEach((audioState, index) => {
            audioState.active = previousAudio[index].active;
            audioState.frame = previousAudio[index].frame;
          });
          syncStageStartAudioNodes();
          syncBonusLifeAudioNodes();
          syncPowerUpPickupAudioNodes();
          syncPowerUpAppearAudioNodes();
          syncBrickHitAudioNodes();
          syncBaseHitAudioNodes();
          syncSteelHitAudioNodes();
          syncEnemyHitAudioNodes();
          syncEnemyDestroyAudioNodes();
          syncPlayerDestroyAudioNodes();
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
          syncPauseAudioNodes();
          syncScoreCountAudioNodes();
          syncStageBonusAudioNodes();
          syncMovementAudio();
        }
      }
    });
  }

  return Object.freeze({
    createAudioEnemyDestroyLifecycleDiagnostics
  });
});
