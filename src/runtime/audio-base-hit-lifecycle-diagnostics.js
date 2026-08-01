(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioBaseHitLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioBaseHitLifecycleDiagnostics(scope) {
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
      baseHitAudioPresentation,
      baseHitAudioAudible,
      steelHitAudioAudible,
      enemyHitAudioAudible,
      movementAudio,
      createPlayer,
      gameSettings,
      makeGrid,
      hitBase,
      startBaseHitAudio,
      startSteelHitAudio,
      startEnemyHitAudio,
      startPowerUpAppearAudio,
      startStage,
      stopMovementAudio,
      stopFixedFrameAudio,
      stopBaseHitAudio,
      stopPlayerDestroyAudio,
      stopSteelHitAudio,
      stopEnemyHitAudio,
      stopPowerUpAppearAudio,
      update,
      updateBaseHitAudio,
      updateSteelHitAudio,
      updateEnemyHitAudio,
      updatePowerUpAppearAudio,
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
      DOWN,
      TILE
    } = scope;

    return Object.freeze({
      debugBaseHitAudioLifecycleProbe() {
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
          const voice = baseHitAudioPresentation(baseHitAudio.frame).voices[0];
          return {
            active: baseHitAudio.active,
            frame: baseHitAudio.frame,
            frequency: voice ? voice.frequency : null,
            audible: baseHitAudio.active && Boolean(voice) && baseHitAudioAudible() && !game.paused,
            paused: game.paused,
            playerDestroyActive: playerDestroyAudio.active,
            playerDestroyFrame: playerDestroyAudio.frame,
            powerUpAppearActive: powerUpAppearAudio.active,
            powerUpAppearFrame: powerUpAppearAudio.frame,
            steelHitActive: steelHitAudio.active,
            steelHitFrame: steelHitAudio.frame,
            steelHitAudible: steelHitAudio.active && steelHitAudioAudible(),
            enemyHitActive: enemyHitAudio.active,
            enemyHitFrame: enemyHitAudio.frame,
            enemyHitAudible: enemyHitAudio.active && enemyHitAudioAudible(),
            movementAudioMode: movementAudio.mode,
            baseDestroyTimer: game.baseDestroyTimer,
            screen: game.screen
          };
        };
        const makePlayer = () => {
          const player = createPlayer(1);
          player.spawnFlash = 0;
          player.invuln = 0;
          return player;
        };
        const makeBaseBullet = () => ({
          x: 6 * TILE + 5,
          y: 12 * TILE + 5,
          w: gameSettings().projectileRules.bulletSize,
          h: gameSettings().projectileRules.bulletSize,
          dir: DOWN,
          speed: 0,
          power: 1,
          ownerKind: "enemy",
          ownerId: 100,
          ownerKey: "enemy:100",
          remove: false
        });
        try {
          stopMovementAudio();
          for (const audioState of audioStates) stopFixedFrameAudio(audioState);
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.clearPendingTimer = 0;
          game.baseDestroyTimer = 0;
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [makePlayer()];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          const baseBullet = makeBaseBullet();
          const baseHitResult = hitBase(baseBullet);
          const triggered = {
            ...state(),
            hit: baseHitResult,
            baseAlive: game.base.alive,
            bulletRemoved: baseBullet.remove,
            explosionCount: game.explosions.length
          };
          update();
          const gameOverContinuation = state();
          for (let frame = 0; frame < 25; frame += 1) update();
          const finalFrame = state();
          update();
          const end = state();

          stopBaseHitAudio();
          stopPlayerDestroyAudio();
          stopSteelHitAudio();
          stopEnemyHitAudio();
          game.screen = "playing";
          game.paused = false;
          startSteelHitAudio();
          startEnemyHitAudio();
          startBaseHitAudio();
          const lowerPriority = state();
          for (let frame = 0; frame < 4; frame += 1) {
            updateBaseHitAudio();
            updateSteelHitAudio();
            updateEnemyHitAudio();
          }
          const lowerPriorityProgress = state();
          updateBaseHitAudio();
          updateEnemyHitAudio();
          const lowerPriorityEnd = state();

          stopBaseHitAudio();
          game.paused = false;
          startBaseHitAudio();
          game.paused = true;
          syncBaseHitAudioNodes();
          for (let frame = 0; frame < 10; frame += 1) updateBaseHitAudio();
          const paused = state();
          game.paused = false;
          syncBaseHitAudioNodes();
          const resumed = state();

          stopBaseHitAudio();
          stopPowerUpAppearAudio();
          startBaseHitAudio();
          startPowerUpAppearAudio();
          const appearancePriority = state();
          for (let frame = 0; frame < 26; frame += 1) {
            updateBaseHitAudio();
            updatePowerUpAppearAudio();
          }
          const appearanceMaskedFinalFrame = state();
          updateBaseHitAudio();
          updatePowerUpAppearAudio();
          const appearanceMaskedEnd = state();

          stopPowerUpAppearAudio();
          startBaseHitAudio();
          startStage(game.stage);
          const stageCleanup = state();

          return {
            triggered,
            gameOverContinuation,
            finalFrame,
            end,
            lowerPriority,
            lowerPriorityProgress,
            lowerPriorityEnd,
            paused,
            resumed,
            appearancePriority,
            appearanceMaskedFinalFrame,
            appearanceMaskedEnd,
            stageCleanup
          };
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
    createAudioBaseHitLifecycleDiagnostics
  });
});
