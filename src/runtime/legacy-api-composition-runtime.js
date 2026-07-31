(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.legacyApiCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var LOCAL_CALLBACK_NAMES = [
    "update",
    "render",
    "tileTypeName",
    "shouldSpawnEnemies",
    "preparePausedDebugBattle"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < LOCAL_CALLBACK_NAMES.length; i += 1) {
      var name = LOCAL_CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
    if (!callbacks.renderAdapterRuntime || typeof callbacks.renderAdapterRuntime !== "object") {
      throw new Error("callbacks.renderAdapterRuntime must be an object");
    }
    if (!callbacks.stageRuntime || typeof callbacks.stageRuntime !== "object") {
      throw new Error("callbacks.stageRuntime must be an object");
    }
  }

  /** Owns retained debug/public API registration without growing the composition root. */
  function setupLegacyApiCompositionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var render = callbacks.renderAdapterRuntime;
    var stages = callbacks.stageRuntime;
    return deps.requireRuntimeModule("legacyApiRuntime").setupLegacyApiRuntime(state, {
      update: callbacks.update,
      render: callbacks.render,
      tileTypeName: callbacks.tileTypeName,
      shouldSpawnEnemies: callbacks.shouldSpawnEnemies,
      renderTitle: render.renderTitle,
      renderHiddenMessage: render.renderHiddenMessage,
      renderHighScore: render.renderHighScore,
      renderFullGameOver: render.renderFullGameOver,
      fullGameOverPresentation: render.fullGameOverPresentation,
      highScorePresentation: render.highScorePresentation,
      titleScoreLayout: render.titleScoreLayout,
      drawStripedTitleText: render.drawStripedTitleText,
      drawTitleMenuCursor: render.drawTitleMenuCursor,
      renderStageSelect: render.renderStageSelect,
      renderStageSelectClosing: render.renderStageSelectClosing,
      renderGame: render.renderGame,
      renderGameBackdrop: render.renderGameBackdrop,
      renderTerrain: render.renderTerrain,
      drawWallCell: render.drawWallCell,
      drawBrickCell: render.drawBrickCell,
      drawWater: render.drawWater,
      waterFrameName: render.waterFrameName,
      drawIce: render.drawIce,
      renderProjectileTerrainCover: render.renderProjectileTerrainCover,
      drawIceProjectileCover: render.drawIceProjectileCover,
      drawForest: render.drawForest,
      renderBase: render.renderBase,
      drawTank: render.drawTank,
      drawPlayerUpgradeOverlay: render.drawPlayerUpgradeOverlay,
      drawShield: render.drawShield,
      drawSpawn: render.drawSpawn,
      drawBullet: render.drawBullet,
      drawPowerUp: render.drawPowerUp,
      isPowerUpVisible: render.isPowerUpVisible,
      battleDisplayFrame: render.battleDisplayFrame,
      powerUpVisualRect: render.powerUpVisualRect,
      drawManifestSprite: render.drawManifestSprite,
      drawScaledManifestSprite: render.drawScaledManifestSprite,
      renderExplosions: render.renderExplosions,
      drawTankDestructionExplosion: render.drawTankDestructionExplosion,
      renderPlayerDestructions: render.renderPlayerDestructions,
      playerDestructionPresentation: render.playerDestructionPresentation,
      renderEnemyDestructions: render.renderEnemyDestructions,
      enemyDestructionPresentation: render.enemyDestructionPresentation,
      renderBaseDestruction: render.renderBaseDestruction,
      baseDestructionPresentation: render.baseDestructionPresentation,
      tankDestructionPresentation: render.tankDestructionPresentation,
      explosionPresentation: render.explosionPresentation,
      renderScorePopups: render.renderScorePopups,
      scorePopupPresentation: render.scorePopupPresentation,
      renderPanel: render.renderPanel,
      drawStageFlag: render.drawStageFlag,
      panelEnemyCounterRemaining: render.panelEnemyCounterRemaining,
      panelLifeCount: render.panelLifeCount,
      drawSmallScore: render.drawSmallScore,
      formatScore5: render.formatScore5,
      renderStageIntro: render.renderStageIntro,
      renderCurtain: render.renderCurtain,
      stageSelectCurtainState: render.stageSelectCurtainState,
      stageIntroCurtainState: render.stageIntroCurtainState,
      renderStageClear: render.renderStageClear,
      renderStageClearClosing: render.renderStageClearClosing,
      totalStageKills: render.totalStageKills,
      drawResultArrow: render.drawResultArrow,
      renderGameOver: render.renderGameOver,
      renderPlayerGameOverMessage: render.renderPlayerGameOverMessage,
      playerGameOverMessagePresentation: render.playerGameOverMessagePresentation,
      drawCompactGameOverWord: render.drawCompactGameOverWord,
      gameOverBannerY: render.gameOverBannerY,
      renderPause: render.renderPause,
      pausePresentation: render.pausePresentation,
      renderEditor: render.renderEditor,
      drawTileLegend: render.drawTileLegend,
      drawText: render.drawText,
      drawTextClipped: render.drawTextClipped,
      drawTextRight: render.drawTextRight,
      pad2: render.pad2,
      preparePausedDebugBattle: callbacks.preparePausedDebugBattle,
      gameSettings: stages.gameSettings,
      enemyTypeDefinitions: stages.enemyTypeDefinitions,
      stageCount: stages.stageCount,
      stageCycleLimit: stages.stageCycleLimit,
      stageRoute: stages.stageRoute,
      enemySequenceForStage: stages.enemySequenceForStage,
      enemyTotal: stages.enemyTotal,
      enemySpawnPoint: stages.enemySpawnPoint,
      maxActiveEnemies: stages.maxActiveEnemies,
      getEnemySpec: stages.getEnemySpec,
      currentEnemySpawns: stages.currentEnemySpawns,
      currentPlayerSpawns: stages.currentPlayerSpawns,
      currentPowerUpSpawns: stages.currentPowerUpSpawns,
      enemyDataStage: stages.enemyDataStage,
      mapDataStage: stages.mapDataStage,
      playerSpawnPoint: stages.playerSpawnPoint,
      isExtendedLoopStage: stages.isExtendedLoopStage,
      stageSettings: stages.stageSettings,
      createStageGrid: stages.createStageGrid
    });
  }

  return Object.freeze({
    setupLegacyApiCompositionRuntime: setupLegacyApiCompositionRuntime
  });
});
