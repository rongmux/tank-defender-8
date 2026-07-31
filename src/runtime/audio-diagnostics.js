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
    const {
      applyPowerUp,
      baseHitAudio,
      baseHitAudioAudible,
      baseHitAudioPresentation,
      bonusLifeAudio,
      bonusLifeAudioAudibility,
      bonusLifeAudioPresentation,
      bonusLifePulse2Active,
      BRICK,
      brickHitAudio,
      brickHitAudioAudible,
      brickHitAudioPresentation,
      cloneAudioManifest,
      createPlayer,
      createStageResultProbePlayer,
      DOWN,
      enemyDestroyAudio,
      enemyDestroyAudioAudible,
      enemyDestroyAudioPresentation,
      enemyHitAudio,
      enemyHitAudioAudible,
      enemyHitAudioPresentation,
      enemyTypeDefinitions,
      FIELD_H,
      fixedFrameVoiceDuration,
      FREE_AUDIO_MANIFEST,
      game,
      gameSettings,
      GRID,
      hitBase,
      hitTank,
      hitTerrain,
      ICE,
      keys,
      LEFT,
      makeCell,
      makeGrid,
      movementAudio,
      movementAudioModeForState,
      movementAudioPresentation,
      movementIceAudio,
      movementIceAudioAudible,
      movementIceAudioPresentation,
      pauseAudio,
      pauseAudioPresentation,
      playerDestroyAudio,
      playerDestroyAudioPresentation,
      playerShootAudio,
      playerShootAudioAudible,
      playerShootAudioPresentation,
      powerUpAppearAudio,
      powerUpAppearAudioAudible,
      powerUpAppearAudioPresentation,
      powerUpPickupAudio,
      powerUpPickupAudioAudible,
      powerUpPickupAudioPresentation,
      releaseCarrierPowerUp,
      resolveBullet,
      RIGHT,
      scoreCountAudio,
      scoreCountAudioPresentation,
      setTile,
      shoot,
      spawnPowerUp,
      stageBonusAudio,
      stageBonusAudioAudible,
      stageBonusAudioPresentation,
      stageClearBonusRecipients,
      stageClearPresentation,
      stageResultVisibleKillCount,
      stageStartAudio,
      stageStartAudioAudibility,
      stageStartAudioPresentation,
      startBaseHitAudio,
      startBonusLifeAudio,
      startBrickHitAudio,
      startEnemyDestroyAudio,
      startEnemyHitAudio,
      startMovementIceAudio,
      startPauseAudio,
      startPlayerDestroyAudio,
      startPlayerShootAudio,
      startPowerUpAppearAudio,
      startPowerUpPickupAudio,
      startScoreCountAudio,
      startStage,
      startStageBonusAudio,
      startStageStartAudio,
      startSteelHitAudio,
      STEEL,
      steelHitAudio,
      steelHitAudioAudible,
      steelHitAudioPresentation,
      stopBaseHitAudio,
      stopBonusLifeAudio,
      stopBrickHitAudio,
      stopEnemyDestroyAudio,
      stopEnemyHitAudio,
      stopFixedFrameAudio,
      stopMovementAudio,
      stopMovementIceAudio,
      stopPauseAudio,
      stopPlayerDestroyAudio,
      stopPlayerShootAudio,
      stopPowerUpAppearAudio,
      stopPowerUpPickupAudio,
      stopScoreCountAudio,
      stopStageBonusAudio,
      stopStageStartAudio,
      stopSteelHitAudio,
      syncBaseHitAudioNodes,
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
      syncScoreCountAudioNodes,
      syncStageBonusAudioNodes,
      syncStageStartAudioNodes,
      syncSteelHitAudioNodes,
      TILE,
      togglePause,
      update,
      updateBaseHitAudio,
      updateBonusLifeAudio,
      updateBrickHitAudio,
      updateEnemyDestroyAudio,
      updateEnemyHitAudio,
      updateMovementIceAudio,
      updatePauseAudio,
      updatePlayerDestroyAudio,
      updatePlayerMovement,
      updatePlayerShootAudio,
      updatePowerUpAppearAudio,
      updatePowerUpPickupAudio,
      updateSteelHitAudio
    } = scope;

    return Object.freeze({
        audioManifest() {
          return cloneAudioManifest();
        },
        ...scoreDiagnostics,
        ...stageBonusDiagnostics,
        ...movementDiagnostics,
        ...brickHitDiagnostics,
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
        },
        debugSteelHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.steelHit;
          const frames = [0, 1, 2, 3, 4];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => steelHitAudioPresentation(frame))
          };
        },
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
        },
        debugEnemyHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.enemyHit;
          const frames = [0, 1, 2, 3, 4, 5];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => enemyHitAudioPresentation(frame))
          };
        },
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
            game.clearPendingTimer = 0;
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
        },
        debugEnemyDestroyAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.enemyDestroy;
          const frames = [0, 1, 2, 3, 4, 13, 14];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => enemyDestroyAudioPresentation(frame))
          };
        },
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
        },
        debugPlayerDestroyAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.playerDestroy;
          const frames = [0, 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => playerDestroyAudioPresentation(frame))
          };
        },
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
        },
        debugBaseHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.baseHit;
          const frames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => baseHitAudioPresentation(frame))
          };
        },
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
        },
        debugPlayerShootAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.playerShoot;
          const frames = [0, 14, 15];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => playerShootAudioPresentation(frame))
          };
        },
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
        debugStageStartAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.stageStart;
          const frames = [0, 7, 8, 47, 48, 94, 95, 263, 264];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => stageStartAudioPresentation(frame))
          };
        },
        debugBonusLifeAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.bonusLife;
          const frames = [0, 1, 2, 5, 6, 41, 42, 53, 54, 59, 60];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => bonusLifeAudioPresentation(frame))
          };
        },
        debugPowerUpPickupAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.powerUp;
          const frames = [0, 2, 3, 35, 36, 38, 39];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => powerUpPickupAudioPresentation(frame))
          };
        },
        debugPowerUpAppearAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.powerUpAppear;
          const frames = [0, 3, 4, 7, 8, 27, 28, 31, 32];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => powerUpAppearAudioPresentation(frame))
          };
        },
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
        },
        debugPauseAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.pause;
          const frames = [0, 3, 4, 7, 8, 23, 24, 35, 36];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => pauseAudioPresentation(frame))
          };
        },
        debugPauseAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            tick: game.tick,
            active: pauseAudio.active,
            frame: pauseAudio.frame,
            stageStartFrame: stageStartAudio.frame,
            bonusLifeFrame: bonusLifeAudio.frame,
            powerUpPickupFrame: powerUpPickupAudio.frame,
            powerUpAppearFrame: powerUpAppearAudio.frame,
            stageStartAudibility: stageStartAudioAudibility(),
            bonusLifeAudibility: bonusLifeAudioAudibility(),
            powerUpPickupAudible: powerUpPickupAudioAudible(),
            powerUpAppearAudible: powerUpAppearAudioAudible(),
            movementAudioMode: movementAudio.mode
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
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();

            startStageStartAudio();
            startBonusLifeAudio();
            startPowerUpPickupAudio();
            startPowerUpAppearAudio();
            const entered = togglePause();
            const entry = state();
            for (let frame = 0; frame < 10; frame += 1) update();
            const paused = state();
            const exitedEarly = togglePause();
            const earlyResume = state();
            const reentered = togglePause();
            const restart = state();

            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            for (let frame = 0; frame < 35; frame += 1) update();
            const finalPausedFrame = state();
            const exitedBeforeEnd = togglePause();
            const finalActiveFrame = state();
            update();
            const ended = state();

            return {
              entered,
              exitedEarly,
              reentered,
              exitedBeforeEnd,
              entry,
              paused,
              earlyResume,
              restart,
              finalPausedFrame,
              finalActiveFrame,
              ended
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
        },
        debugPowerUpPickupAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const state = () => ({
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame,
            paused: game.paused,
            audible: powerUpPickupAudioAudible(),
            movementAudioMode: movementAudio.mode
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.respawn = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            keys.clear();

            startPowerUpPickupAudio();
            const start = state();
            for (let frame = 0; frame < 38; frame += 1) updatePowerUpPickupAudio();
            const beforePause = state();
            game.paused = true;
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) updatePowerUpPickupAudio();
            const paused = state();
            game.paused = false;
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            updatePowerUpPickupAudio();
            const end = state();

            startPowerUpPickupAudio();
            startBonusLifeAudio();
            const suppressedStart = state();
            for (let frame = 0; frame < 39; frame += 1) {
              updateBonusLifeAudio();
              updatePowerUpPickupAudio();
            }
            const suppressedEnd = {
              ...state(),
              bonusLifeActive: bonusLifeAudio.active,
              bonusLifeFrame: bonusLifeAudio.frame
            };
            return { start, beforePause, paused, end, suppressedStart, suppressedEnd };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
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
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncEnemyHitAudioNodes();
            syncMovementAudio();
          }
        },
        debugBonusLifeAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const state = () => ({
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame,
            paused: game.paused,
            pulse2Active: bonusLifePulse2Active(),
            movementAudioMode: movementAudio.mode
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpAppearAudio();
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.respawn = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            keys.clear();

            startBonusLifeAudio();
            const start = state();
            for (let frame = 0; frame < 53; frame += 1) updateBonusLifeAudio();
            const beforePulse2End = state();
            updateBonusLifeAudio();
            const pulse2End = state();

            game.paused = true;
            syncBonusLifeAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) updateBonusLifeAudio();
            const paused = state();

            game.paused = false;
            syncBonusLifeAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 5; frame += 1) updateBonusLifeAudio();
            const beforeEnd = state();
            updateBonusLifeAudio();
            const end = state();
            return { start, beforePulse2End, pulse2End, paused, beforeEnd, end };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpAppearAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncEnemyHitAudioNodes();
            syncMovementAudio();
          }
        },
    });
  }

  return Object.freeze({
    createAudioDiagnostics
  });
});
