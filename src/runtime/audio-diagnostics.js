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
    const playerDestroyDiagnostics = deps.audioPlayerDestroyDiagnostics.createAudioPlayerDestroyDiagnostics(scope);
    const baseHitDiagnostics = deps.audioBaseHitDiagnostics.createAudioBaseHitDiagnostics(scope);
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
      applyPowerUp,
      baseHitAudio,
      baseHitAudioAudible,
      baseHitAudioPresentation,
      bonusLifeAudio,
      bonusLifeAudioAudibility,
      bonusLifeAudioPresentation,
      BRICK,
      brickHitAudio,
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
      enemyTypeDefinitions,
      fixedFrameVoiceDuration,
      FREE_AUDIO_MANIFEST,
      game,
      gameSettings,
      hitBase,
      hitTank,
      hitTerrain,
      ICE,
      keys,
      LEFT,
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
      powerUpPickupAudio,
      resolveBullet,
      RIGHT,
      scoreCountAudio,
      scoreCountAudioPresentation,
      shoot,
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
        debugBrickHitAudioLifecycleProbe:
          brickHitLifecycleDiagnostics.debugBrickHitAudioLifecycleProbe,
        ...steelHitDiagnostics,
        debugSteelHitAudioLifecycleProbe:
          steelHitLifecycleDiagnostics.debugSteelHitAudioLifecycleProbe,
        ...enemyHitDiagnostics,
        debugEnemyHitAudioLifecycleProbe:
          enemyHitLifecycleDiagnostics.debugEnemyHitAudioLifecycleProbe,
        ...enemyDestroyDiagnostics,
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
        ...playerDestroyDiagnostics,
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
        ...baseHitDiagnostics,
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
