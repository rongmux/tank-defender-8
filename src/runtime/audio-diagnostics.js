(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Preserves each legacy adapter's receiver while building an explicit probe scope. */
  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter((entry) => typeof entry[1] === "function")
        .map((entry) => [entry[0], entry[1].bind(source)])
    );
  }

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.audio || typeof state.audio !== "object") {
      throw new Error("state.audio must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  function createRuntimeScope(state, deps) {
    requireInputs(state, deps);
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn),
      game: state.game,
      audioCtx: state.audioCtx,
      canvas: state.canvas,
      ctx: state.ctx,
      builtInStagePack: state.builtInStagePack,
      keys: state.keys,
      pendingFirePresses: state.pendingFirePresses,
      pendingStageSelectPresses: state.pendingStageSelectPresses,
      movementAudio: state.movementAudio,
      packFileInput: state.packFileInput,
      activeSequencedSounds: state.activeSequencedSounds,
      noiseBufferCache: state.noiseBufferCache,
      movementIceAudio: state.audio.movementIce,
      playerShootAudio: state.audio.playerShoot,
      steelHitAudio: state.audio.steelHit,
      enemyHitAudio: state.audio.enemyHit,
      enemyDestroyAudio: state.audio.enemyDestroy,
      playerDestroyAudio: state.audio.playerDestroy,
      baseHitAudio: state.audio.baseHit,
      brickHitAudio: state.audio.brickHit,
      stageStartAudio: state.audio.stageStart,
      bonusLifeAudio: state.audio.bonusLife,
      powerUpPickupAudio: state.audio.powerUpPickup,
      powerUpAppearAudio: state.audio.powerUpAppear,
      pauseAudio: state.audio.pause,
      scoreCountAudio: state.audio.scoreCount,
      stageBonusAudio: state.audio.stageBonus,
      gameOverAudio: state.audio.gameOver,
      highScoreAudio: state.audio.highScore
    };
  }

  /** Binds the retained public audio probes without exposing mutable runtime state. */
  function createAudioDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const scoreDiagnostics = deps.audioScoreDiagnostics.createAudioScoreDiagnostics(scope);
    const stageBonusDiagnostics = deps.audioStageBonusDiagnostics.createAudioStageBonusDiagnostics(scope);
    const movementDiagnostics = deps.audioMovementDiagnostics.createAudioMovementDiagnostics(scope);
    const brickHitDiagnostics = deps.audioBrickHitDiagnostics.createAudioBrickHitDiagnostics(scope);
    const brickHitLifecycleDiagnostics = deps.audioBrickHitLifecycleDiagnostics.createAudioBrickHitLifecycleDiagnostics(scope);
    const steelHitDiagnostics = deps.audioSteelHitDiagnostics.createAudioSteelHitDiagnostics(scope);
    const steelHitLifecycleDiagnostics = deps.audioSteelHitLifecycleDiagnostics.createAudioSteelHitLifecycleDiagnostics(scope);
    const enemyHitDiagnostics = deps.audioEnemyHitDiagnostics.createAudioEnemyHitDiagnostics(scope);
    const enemyHitLifecycleDiagnostics = deps.audioEnemyHitLifecycleDiagnostics.createAudioEnemyHitLifecycleDiagnostics(scope);
    const enemyDestroyDiagnostics = deps.audioEnemyDestroyDiagnostics.createAudioEnemyDestroyDiagnostics(scope);
    const enemyDestroyLifecycleDiagnostics = deps.audioEnemyDestroyLifecycleDiagnostics.createAudioEnemyDestroyLifecycleDiagnostics(scope);
    const playerDestroyDiagnostics = deps.audioPlayerDestroyDiagnostics.createAudioPlayerDestroyDiagnostics(scope);
    const playerDestroyLifecycleDiagnostics = deps.audioPlayerDestroyLifecycleDiagnostics.createAudioPlayerDestroyLifecycleDiagnostics(scope);
    const baseHitDiagnostics = deps.audioBaseHitDiagnostics.createAudioBaseHitDiagnostics(scope);
    const baseHitLifecycleDiagnostics = deps.audioBaseHitLifecycleDiagnostics.createAudioBaseHitLifecycleDiagnostics(scope);
    const playerShootDiagnostics = deps.audioPlayerShootDiagnostics.createAudioPlayerShootDiagnostics(scope);
    const stageStartDiagnostics = deps.audioStageStartDiagnostics.createAudioStageStartDiagnostics(scope);
    const bonusLifeDiagnostics = deps.audioBonusLifeDiagnostics.createAudioBonusLifeDiagnostics(scope);
    const bonusLifeLifecycleDiagnostics = deps.audioBonusLifeLifecycleDiagnostics.createAudioBonusLifeLifecycleDiagnostics(scope);
    const powerUpPickupDiagnostics = deps.audioPowerUpPickupDiagnostics.createAudioPowerUpPickupDiagnostics(scope);
    const powerUpPickupLifecycleDiagnostics = deps.audioPowerUpPickupLifecycleDiagnostics.createAudioPowerUpPickupLifecycleDiagnostics(scope);
    const powerUpAppearDiagnostics = deps.audioPowerUpAppearDiagnostics.createAudioPowerUpAppearDiagnostics(scope);
    const powerUpAppearLifecycleDiagnostics = deps.audioPowerUpAppearLifecycleDiagnostics.createAudioPowerUpAppearLifecycleDiagnostics(scope);
    const pauseDiagnostics = deps.audioPauseDiagnostics.createAudioPauseDiagnostics(scope);
    const movementLifecycleDiagnostics = deps.audioMovementLifecycleDiagnostics.createAudioMovementLifecycleDiagnostics(scope);
    const pauseLifecycleDiagnostics = deps.audioPauseLifecycleDiagnostics.createAudioPauseLifecycleDiagnostics(scope);
    const {
      baseHitAudio,
      bonusLifeAudio,
      brickHitAudio,
      cloneAudioManifest,
      createPlayer,
      enemyDestroyAudio,
      enemyHitAudio,
      enemyTypeDefinitions,
      game,
      keys,
      LEFT,
      makeGrid,
      movementAudio,
      movementIceAudio,
      movementIceAudioAudible,
      pauseAudio,
      playerDestroyAudio,
      playerShootAudio,
      playerShootAudioAudible,
      powerUpAppearAudio,
      powerUpPickupAudio,
      RIGHT,
      scoreCountAudio,
      shoot,
      stageBonusAudio,
      stageStartAudio,
      startBonusLifeAudio,
      startMovementIceAudio,
      startStage,
      startStageStartAudio,
      steelHitAudio,
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
      TILE,
      updateMovementIceAudio,
      updatePlayerShootAudio
    } = scope;

    return Object.freeze({
        audioManifest() {
          return cloneAudioManifest();
        },
        ...scoreDiagnostics,
        ...stageBonusDiagnostics,
        ...movementDiagnostics,
        ...brickHitDiagnostics,
        debugBrickHitAudioLifecycleProbe:
          brickHitLifecycleDiagnostics.debugBrickHitAudioLifecycleProbe,
        ...steelHitDiagnostics,
        debugSteelHitAudioLifecycleProbe:
          steelHitLifecycleDiagnostics.debugSteelHitAudioLifecycleProbe,
         ...enemyHitDiagnostics,
         debugEnemyHitAudioLifecycleProbe:
           enemyHitLifecycleDiagnostics.debugEnemyHitAudioLifecycleProbe,
         ...enemyDestroyDiagnostics,
         debugEnemyDestroyAudioLifecycleProbe:
           enemyDestroyLifecycleDiagnostics.debugEnemyDestroyAudioLifecycleProbe,
         ...playerDestroyDiagnostics,
         debugPlayerDestroyAudioLifecycleProbe:
           playerDestroyLifecycleDiagnostics.debugPlayerDestroyAudioLifecycleProbe,
         ...baseHitDiagnostics,
         debugBaseHitAudioLifecycleProbe:
           baseHitLifecycleDiagnostics.debugBaseHitAudioLifecycleProbe,
        ...playerShootDiagnostics,
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
        },
        debugMovementIceAudioLifecycleProbe: movementLifecycleDiagnostics.debugMovementIceAudioLifecycleProbe,
        ...stageStartDiagnostics,
        ...bonusLifeDiagnostics,
        ...powerUpPickupDiagnostics,
        ...powerUpAppearDiagnostics,
        debugPowerUpAppearAudioLifecycleProbe:
          powerUpAppearLifecycleDiagnostics.debugPowerUpAppearAudioLifecycleProbe,
        ...pauseDiagnostics,
        debugPauseAudioLifecycleProbe: pauseLifecycleDiagnostics.debugPauseAudioLifecycleProbe,
        debugPowerUpPickupAudioLifecycleProbe:
          powerUpPickupLifecycleDiagnostics.debugPowerUpPickupAudioLifecycleProbe,
        debugBonusLifeAudioLifecycleProbe:
          bonusLifeLifecycleDiagnostics.debugBonusLifeAudioLifecycleProbe,
    });
  }

  return Object.freeze({
    createAudioDiagnostics
  });
});
