(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleSystemsCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.stageRuntime || typeof state.stageRuntime !== "object") {
      throw new Error("state.stageRuntime must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  /** Installs the fixed-frame combat, stage, player, enemy, and projectile systems in legacy order. */
  function setupBattleSystemsCompositionRuntime(state, deps) {
    requireInputs(state, deps);

    var fn = state.fn;
    var stageRuntime = state.stageRuntime;
    var sh = deps.sharedState;
    var gameSettings = stageRuntime.gameSettings;
    var enemyTotal = stageRuntime.enemyTotal;
    var enemyTypeDefinitions = stageRuntime.enemyTypeDefinitions;
    var enemyDataStage = stageRuntime.enemyDataStage;
    var mapDataStage = stageRuntime.mapDataStage;
    var enemySpawnPoint = stageRuntime.enemySpawnPoint;
    var getEnemySpec = stageRuntime.getEnemySpec;
    var isExtendedLoopStage = stageRuntime.isExtendedLoopStage;
    var maxActiveEnemies = stageRuntime.maxActiveEnemies;
    var stageCycleLimit = stageRuntime.stageCycleLimit;
    var stageSettings = stageRuntime.stageSettings;
    var playSound = fn.playSound;

    deps.requireRuntimeModule("tankMovementRuntime").setupTankMovementRuntime(state, deps);
    var frameCounterRuntime = deps.requireRuntimeModule("frameCounterRuntime").setupFrameCounterRuntime(state, deps);
    deps.requireRuntimeModule("playerMovementRuntime").setupPlayerMovementRuntime(state, deps, {
      advanceTankTracks: fn.advanceTankTracks,
      gameSettings: gameSettings,
      isPerpendicularTurn: fn.isPerpendicularTurn,
      isTankOnIce: fn.isTankOnIce,
      moveTank: fn.moveTank,
      playSound: playSound,
      snapForDirection: fn.snapForDirection
    });
    deps.requireRuntimeModule("transientEffectsRuntime").setupTransientEffectsRuntime(state, deps, {
      gameSettings: gameSettings
    });
    deps.requireRuntimeModule("projectileRuntime").setupProjectileRuntime(state, deps, {
      gameSettings: gameSettings,
      playSound: playSound
    });
    deps.requireRuntimeModule("battleCombatRuntime").setupBattleCombatRuntime(state, deps, {
      explosionRule: fn.explosionRule,
      gameSettings: gameSettings,
      playSound: playSound,
      resetFrameCounterLow: frameCounterRuntime.resetFrameCounterLow,
      resetPlayerPosition: fn.resetPlayerPosition,
      updateHighScore: fn.updateHighScore
    });
    deps.requireRuntimeModule("stageResultRuntime").setupStageResultRuntime(state, deps, {
      addPlayerScore: fn.addPlayerScore,
      enemyDataStage: enemyDataStage,
      enemyTypeDefinitions: enemyTypeDefinitions,
      gameSettings: gameSettings,
      mapDataStage: mapDataStage,
      playSound: playSound,
      stageCycleLimit: stageCycleLimit
    });
    deps.requireRuntimeModule("stageFlowRuntime").setupStageFlowRuntime(state, deps, {
      awardPendingStageClearBonus: fn.awardPendingStageClearBonus,
      gameSettings: gameSettings,
      resetTitleIdleTimer: fn.resetTitleIdleTimer,
      stageAdvanceResult: fn.stageAdvanceResult,
      stageClearBonusRecipients: fn.stageClearBonusRecipients,
      stageCurtainCloseFrames: function () { return deps.STAGE_CURTAIN_CLOSE_FRAMES; },
      stageResultDuration: fn.stageResultDuration,
      startFullGameOverScreen: fn.startFullGameOverScreen,
      startStage: fn.startStage,
      stopGameplayAudioBeforeResult: fn.stopGameplayAudioBeforeResult,
      stopStageResultAudio: fn.stopStageResultAudio
    });
    var gameOverEntryRuntime = deps.requireRuntimeModule("gameOverEntryRuntime").setupGameOverEntryRuntime(state, deps, {
      endTitleDemo: fn.endTitleDemo,
      extendedStageEndFrameHigh: function () { return sh.EXTENDED_STAGE_END_FRAME_HIGH; },
      gameOverFieldDuration: fn.gameOverFieldDuration,
      resetFrameCounters: frameCounterRuntime.resetFrameCounters,
      stopBonusLifeAudio: fn.stopBonusLifeAudio,
      stopBrickHitAudio: fn.stopBrickHitAudio,
      stopEnemyDestroyAudio: fn.stopEnemyDestroyAudio,
      stopEnemyHitAudio: fn.stopEnemyHitAudio,
      stopMovementAudio: fn.stopMovementAudio,
      stopMovementIceAudio: fn.stopMovementIceAudio,
      stopPauseAudio: fn.stopPauseAudio,
      stopPlayerShootAudio: fn.stopPlayerShootAudio,
      stopPowerUpAppearAudio: fn.stopPowerUpAppearAudio,
      stopPowerUpPickupAudio: fn.stopPowerUpPickupAudio,
      stopScoreCountAudio: fn.stopScoreCountAudio,
      stopStageBonusAudio: fn.stopStageBonusAudio,
      stopStageStartAudio: fn.stopStageStartAudio,
      stopSteelHitAudio: fn.stopSteelHitAudio
    });
    deps.requireRuntimeModule("battleOutcomeRuntime").setupBattleOutcomeRuntime(state, deps, {
      endTitleDemo: fn.endTitleDemo,
      enterGameOver: gameOverEntryRuntime.enterGameOver,
      enterStageClear: fn.enterStageClear,
      extendedStageEndFrameHigh: function () { return sh.EXTENDED_STAGE_END_FRAME_HIGH; },
      gameSettings: gameSettings,
      playerGameOverMessageActive: function () { return fn.playerGameOverMessageActive(); },
      playerGameOverStageEndDelay: function () { return sh.PLAYER_GAME_OVER_STAGE_END_DELAY; },
      resetFrameCounters: frameCounterRuntime.resetFrameCounters,
      stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); }
    });
    deps.requireRuntimeModule("playerUpdateRuntime").setupPlayerUpdateRuntime(state, deps, {
      directionTowardTarget: deps.directionTowardTarget,
      finishPlayerDeath: fn.finishPlayerDeath,
      gameSettings: gameSettings,
      shoot: fn.shoot,
      updatePlayerMovement: fn.updatePlayerMovement
    });
    deps.requireRuntimeModule("battleTimingRuntime").setupBattleTimingRuntime(state, deps, {
      enemyTotal: enemyTotal,
      gameSettings: gameSettings
    });
    deps.requireRuntimeModule("battleRandomRuntime").setupBattleRandomRuntime(state, deps, {
      enemyTotal: enemyTotal,
      getEnemySpec: getEnemySpec
    });
    deps.requireRuntimeModule("powerUpRuntime").setupPowerUpRuntime(state, deps, {
      addPlayerScore: fn.addPlayerScore,
      addScorePopup: fn.addScorePopup,
      buildBaseWall: deps.buildBaseWall,
      canTankOccupy: fn.canTankOccupy,
      destroyEnemy: fn.destroyEnemy,
      gameSettings: gameSettings,
      playSound: playSound,
      randomByte: fn.randomByte,
      rectHitsSolidTerrain: fn.rectHitsSolidTerrain,
      stageSettings: stageSettings
    });
    deps.requireRuntimeModule("enemySpawnRuntime").setupEnemySpawnRuntime(state, deps, {
      clearPowerUpForCarrierSpawn: function (carrier) {
        return fn.clearPowerUpForCarrierSpawn(carrier);
      },
      enemyTypeDefinitions: enemyTypeDefinitions,
      enemySpawnPoint: enemySpawnPoint,
      enemyTotal: enemyTotal,
      gameSettings: gameSettings,
      getEnemySpec: getEnemySpec,
      isExtendedLoopStage: isExtendedLoopStage,
      maxActiveEnemies: maxActiveEnemies,
      stageCycleLimit: stageCycleLimit
    });
    deps.requireRuntimeModule("enemyAiRuntime").setupEnemyAiRuntime(state, deps, {
      defaultEnemySpawnDelay: fn.defaultEnemySpawnDelay,
      directionTowardTarget: deps.directionTowardTarget,
      gameSettings: gameSettings,
      randomByte: fn.randomByte,
      scaleEnemySpawnDelayForPlayers: fn.scaleEnemySpawnDelayForPlayers,
      selectEnemyTargetPlayer: deps.selectEnemyTargetPlayer
    });
    deps.requireRuntimeModule("enemyMovementRuntime").setupEnemyMovementRuntime(state, deps, {
      advanceTankTracks: fn.advanceTankTracks,
      aiRoll: fn.aiRoll,
      canTankOccupy: fn.canTankOccupy,
      chooseEnemyDirectionByPhase: fn.chooseEnemyDirectionByPhase,
      gameSettings: gameSettings,
      isEnemyAtTurnIntersection: deps.isEnemyAtTurnIntersection,
      moveTank: fn.moveTank,
      randomByte: fn.randomByte,
      totalTankOverlapArea: fn.totalTankOverlapArea
    });
    deps.requireRuntimeModule("enemyUpdateRuntime").setupEnemyUpdateRuntime(state, deps, {
      explosionRule: fn.explosionRule,
      gameSettings: gameSettings,
      shoot: fn.shoot,
      shouldEnemyFire: fn.shouldEnemyFire,
      updateEnemyMovement: fn.updateEnemyMovement
    });
    deps.requireRuntimeModule("projectileTargetRuntime").setupProjectileTargetRuntime(state, deps, {
      addRuleExplosion: fn.addRuleExplosion,
      baseDestructionDuration: fn.baseDestructionDuration,
      destroyEnemy: fn.destroyEnemy,
      gameSettings: gameSettings,
      killPlayer: fn.killPlayer,
      playSound: playSound,
      releaseCarrierPowerUp: fn.releaseCarrierPowerUp
    });
    deps.requireRuntimeModule("projectileResolutionRuntime").setupProjectileResolutionRuntime(state, deps, {
      addRuleExplosion: fn.addRuleExplosion,
      gameSettings: gameSettings,
      hitBase: fn.hitBase,
      hitTank: fn.hitTank,
      hitTerrain: fn.hitTerrain,
      playSound: playSound
    });
    deps.requireRuntimeModule("projectileMotionRuntime").setupProjectileMotionRuntime(state, deps, {
      resolveBullet: fn.resolveBullet
    });

    return Object.freeze({
      frameCounterRuntime: frameCounterRuntime,
      gameOverEntryRuntime: gameOverEntryRuntime
    });
  }

  return Object.freeze({
    setupBattleSystemsCompositionRuntime: setupBattleSystemsCompositionRuntime
  });
});
