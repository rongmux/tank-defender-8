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
    const playerShootLifecycleDiagnostics = deps.audioPlayerShootLifecycleDiagnostics.createAudioPlayerShootLifecycleDiagnostics(scope);
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
    const { cloneAudioManifest } = scope;

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
         debugPlayerShootAudioLifecycleProbe:
           playerShootLifecycleDiagnostics.debugPlayerShootAudioLifecycleProbe,
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
