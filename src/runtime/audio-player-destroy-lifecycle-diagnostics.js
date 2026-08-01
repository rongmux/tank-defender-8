(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPlayerDestroyLifecycleDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPlayerDestroyLifecycleDiagnostics(scope) {
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
      playerDestroyAudioPresentation,
      enemyDestroyAudioPresentation,
      baseHitAudioAudible,
      enemyDestroyAudioAudible,
      createPlayer,
      gameSettings,
      makeGrid,
      hitTank,
      resolveBullet,
      update,
      startPauseAudio,
      startEnemyDestroyAudio,
      startPlayerDestroyAudio,
      startStage,
      stopMovementAudio,
      stopFixedFrameAudio,
      stopPauseAudio,
      stopPlayerDestroyAudio,
      stopBaseHitAudio,
      stopEnemyDestroyAudio,
      updatePlayerDestroyAudio,
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
      DOWN,
      TILE
    } = scope;

    return Object.freeze({
      debugPlayerDestroyAudioLifecycleProbe() {
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
          const voice = playerDestroyAudioPresentation(playerDestroyAudio.frame).voices[0];
          const enemyVoice = enemyDestroyAudioPresentation(enemyDestroyAudio.frame).voices[0];
          return {
            active: playerDestroyAudio.active,
            frame: playerDestroyAudio.frame,
            frequency: voice ? voice.frequency : null,
            gain: voice ? voice.gain : null,
            wave: voice ? voice.wave : null,
            audible: playerDestroyAudio.active && Boolean(voice) && !game.paused,
            paused: game.paused,
            baseHitActive: baseHitAudio.active,
            baseHitFrame: baseHitAudio.frame,
            baseHitAudible: baseHitAudio.active && baseHitAudioAudible() && !game.paused,
            enemyDestroyActive: enemyDestroyAudio.active,
            enemyDestroyFrame: enemyDestroyAudio.frame,
            enemyDestroyAudible: enemyDestroyAudio.active && Boolean(enemyVoice) && enemyDestroyAudioAudible() && !game.paused,
            baseDestroyTimer: game.baseDestroyTimer,
            screen: game.screen
          };
        };
        const makePlayer = (invuln) => {
          const player = createPlayer(1);
          player.x = 64;
          player.y = 64;
          player.alive = true;
          player.lives = 2;
          player.level = 3;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.invuln = Math.max(0, Math.floor(Number(invuln) || 0));
          return player;
        };
        const makeEnemyBullet = (x, y) => ({
          x,
          y,
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
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          const player = makePlayer(0);
          game.players = [player];
          const lethalBullet = makeEnemyBullet(player.x + 5, player.y + 5);
          const lethalHitResult = hitTank(lethalBullet);
          const playerHit = {
            ...state(),
            hit: lethalHitResult,
            bulletRemoved: lethalBullet.remove,
            playerAlive: player.alive,
            playerDestroying: player.destroying,
            playerRespawn: player.respawn,
            playerLevel: player.level,
            explosionCount: game.explosions.length
          };

          for (let frame = 0; frame < 4; frame += 1) updatePlayerDestroyAudio();
          const volume14 = state();
          for (let frame = 0; frame < 4; frame += 1) updatePlayerDestroyAudio();
          const volume13 = state();

          game.paused = true;
          startPauseAudio();
          syncPlayerDestroyAudioNodes();
          for (let frame = 0; frame < 10; frame += 1) {
            updatePlayerDestroyAudio();
            updatePauseAudio();
          }
          const paused = state();
          game.paused = false;
          syncPlayerDestroyAudioNodes();
          for (let frame = 0; frame < 17; frame += 1) updatePlayerDestroyAudio();
          const finalFrame = state();
          updatePlayerDestroyAudio();
          const end = state();

          stopPauseAudio();
          stopPlayerDestroyAudio();
          game.players = [makePlayer(1)];
          game.explosions = [];
          const shieldedBullet = makeEnemyBullet(game.players[0].x + 5, game.players[0].y + 5);
          const shieldedHitResult = hitTank(shieldedBullet);
          const shielded = {
            ...state(),
            hit: shieldedHitResult,
            bulletRemoved: shieldedBullet.remove,
            playerAlive: game.players[0].alive,
            explosionCount: game.explosions.length
          };

          stopPlayerDestroyAudio();
          game.screen = "playing";
          game.players = [makePlayer(0)];
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.explosions = [];
          const baseBullet = makeEnemyBullet(game.base.x + 5, game.base.y + 5);
          resolveBullet(baseBullet);
          const baseHit = {
            ...state(),
            baseAlive: game.base.alive,
            bulletRemoved: baseBullet.remove,
            explosionCount: game.explosions.length
          };
          update();
          const gameOverContinuation = state();
          stopBaseHitAudio();

          stopPlayerDestroyAudio();
          stopEnemyDestroyAudio();
          game.screen = "playing";
          game.paused = false;
          startEnemyDestroyAudio();
          for (let frame = 0; frame < 3; frame += 1) updateEnemyDestroyAudio();
          const enemyBeforePriority = state();
          startPlayerDestroyAudio();
          const playerPriority = state();
          for (let frame = 0; frame < 10; frame += 1) {
            updateEnemyDestroyAudio();
            updatePlayerDestroyAudio();
          }
          const simultaneousProgress = state();
          updateEnemyDestroyAudio();
          updatePlayerDestroyAudio();
          const enemySuppressedEnd = state();

          startPlayerDestroyAudio();
          startStage(game.stage);
          const stageCleanup = state();

          return {
            playerHit,
            volume14,
            volume13,
            paused,
            finalFrame,
            end,
            shielded,
            baseHit,
            gameOverContinuation,
            enemyBeforePriority,
            playerPriority,
            simultaneousProgress,
            enemySuppressedEnd,
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
    createAudioPlayerDestroyLifecycleDiagnostics
  });
});
