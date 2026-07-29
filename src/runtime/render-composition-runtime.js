(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.renderCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "battleDisplayFrame",
    "createStageGrid",
    "directionName",
    "drawBrickCell",
    "drawForest",
    "drawIce",
    "drawManifestSprite",
    "drawMiniTank",
    "drawScaledManifestSprite",
    "drawText",
    "drawTextClipped",
    "drawTextRight",
    "drawWallCell",
    "drawWater",
    "enemyTotal",
    "explosionRule",
    "fullGameOverPresentation",
    "gameSettings",
    "highScorePresentation",
    "hiddenMessagePresentation",
    "normalizeBrickFragmentMask",
    "pixelGlyph",
    "playerUpgradeOverlayParts",
    "quarterMaskFromBrickFragments",
    "renderBase",
    "renderCurtain",
    "renderEditor",
    "renderFullGameOver",
    "renderGame",
    "renderGameBackdrop",
    "renderGameOver",
    "renderHighScore",
    "renderHiddenMessage",
    "renderPause",
    "renderStageClear",
    "renderStageClearClosing",
    "renderStageIntro",
    "renderStageSelect",
    "renderStageSelectClosing",
    "renderTerrain",
    "renderTitle",
    "shieldColorForTick",
    "spawnAnimationPresentation",
    "stageClearPresentation",
    "stageSelectCurtainState",
    "tankPrimaryColor",
    "tankTrackFrameName",
    "titleScoreLayout"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns the setup order for every Canvas-facing runtime boundary. */
  function setupRenderCompositionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var titleRenderRuntime = deps.requireRuntimeModule("titleRenderRuntime").setupTitleRenderRuntime(state, deps, {
      drawManifestSprite: callbacks.drawManifestSprite,
      drawMiniTank: callbacks.drawMiniTank,
      drawText: callbacks.drawText,
      fullGameOverPresentation: callbacks.fullGameOverPresentation,
      highScorePresentation: callbacks.highScorePresentation,
      hiddenMessagePresentation: callbacks.hiddenMessagePresentation,
      pixelGlyph: callbacks.pixelGlyph,
      titleScoreLayout: callbacks.titleScoreLayout
    });
    var terrainRenderRuntime = deps.requireRuntimeModule("terrainRenderRuntime").setupTerrainRenderRuntime(state, deps, {
      drawManifestSprite: callbacks.drawManifestSprite,
      normalizeBrickFragmentMask: callbacks.normalizeBrickFragmentMask,
      quarterMaskFromBrickFragments: callbacks.quarterMaskFromBrickFragments
    });
    var tankRenderRuntime = deps.requireRuntimeModule("tankRenderRuntime").setupTankRenderRuntime(state, deps, {
      battleDisplayFrame: callbacks.battleDisplayFrame,
      directionName: callbacks.directionName,
      drawManifestSprite: callbacks.drawManifestSprite,
      drawScaledManifestSprite: callbacks.drawScaledManifestSprite,
      gameSettings: callbacks.gameSettings,
      playerUpgradeOverlayParts: callbacks.playerUpgradeOverlayParts,
      shieldColorForTick: callbacks.shieldColorForTick,
      spawnAnimationPresentation: callbacks.spawnAnimationPresentation,
      tankPrimaryColor: callbacks.tankPrimaryColor,
      tankTrackFrameName: callbacks.tankTrackFrameName
    });
    var powerUpRenderRuntime = deps.requireRuntimeModule("powerUpRenderRuntime").setupPowerUpRenderRuntime(state, deps, {
      battleDisplayFrame: callbacks.battleDisplayFrame,
      drawManifestSprite: callbacks.drawManifestSprite
    });
    var projectileRenderRuntime = deps.requireRuntimeModule("projectileRenderRuntime").setupProjectileRenderRuntime(state, deps, {
      drawScaledManifestSprite: callbacks.drawScaledManifestSprite
    });
    var effectRenderRuntime = deps.requireRuntimeModule("effectRenderRuntime").setupEffectRenderRuntime(state, deps, {
      drawManifestSprite: callbacks.drawManifestSprite,
      drawScaledManifestSprite: callbacks.drawScaledManifestSprite,
      drawText: callbacks.drawText,
      explosionRule: callbacks.explosionRule,
      gameSettings: callbacks.gameSettings
    });
    var stageResultRenderRuntime = deps.requireRuntimeModule("stageResultRenderRuntime").setupStageResultRenderRuntime(state, deps, {
      drawMiniTank: callbacks.drawMiniTank,
      drawText: callbacks.drawText,
      drawTextRight: callbacks.drawTextRight,
      gameSettings: callbacks.gameSettings,
      renderCurtain: callbacks.renderCurtain,
      stageClearPresentation: callbacks.stageClearPresentation,
      stageSelectCurtainState: callbacks.stageSelectCurtainState
    });
    var battleHudRenderRuntime = deps.requireRuntimeModule("battleHudRenderRuntime").setupBattleHudRenderRuntime(state, deps, {
      battleDisplayFrame: callbacks.battleDisplayFrame,
      drawManifestSprite: callbacks.drawManifestSprite,
      drawScaledManifestSprite: callbacks.drawScaledManifestSprite,
      drawText: callbacks.drawText,
      enemyTotal: callbacks.enemyTotal,
      gameSettings: callbacks.gameSettings
    });
    var editorRenderRuntime = deps.requireRuntimeModule("editorRenderRuntime").setupEditorRenderRuntime(state, deps, {
      createStageGrid: callbacks.createStageGrid,
      drawBrickCell: callbacks.drawBrickCell,
      drawForest: callbacks.drawForest,
      drawIce: callbacks.drawIce,
      drawManifestSprite: callbacks.drawManifestSprite,
      drawWallCell: callbacks.drawWallCell,
      drawWater: callbacks.drawWater,
      renderBase: callbacks.renderBase,
      renderTerrain: callbacks.renderTerrain
    });
    var screenTransitionRenderRuntime = deps.requireRuntimeModule("screenTransitionRenderRuntime").setupScreenTransitionRenderRuntime(state, deps, {
      drawText: callbacks.drawText,
      drawTextClipped: callbacks.drawTextClipped,
      gameSettings: callbacks.gameSettings,
      renderBase: callbacks.renderBase,
      renderGameBackdrop: callbacks.renderGameBackdrop,
      renderTitle: callbacks.renderTitle
    });
    var screenRenderRuntime = deps.requireRuntimeModule("screenRenderRuntime").setupScreenRenderRuntime(state, deps, {
      renderEditor: callbacks.renderEditor,
      renderFullGameOver: callbacks.renderFullGameOver,
      renderGame: callbacks.renderGame,
      renderGameOver: callbacks.renderGameOver,
      renderHighScore: callbacks.renderHighScore,
      renderHiddenMessage: callbacks.renderHiddenMessage,
      renderPause: callbacks.renderPause,
      renderStageClear: callbacks.renderStageClear,
      renderStageClearClosing: callbacks.renderStageClearClosing,
      renderStageIntro: callbacks.renderStageIntro,
      renderStageSelect: callbacks.renderStageSelect,
      renderStageSelectClosing: callbacks.renderStageSelectClosing,
      renderTitle: callbacks.renderTitle
    });

    return Object.freeze({
      battleHudRenderRuntime: battleHudRenderRuntime,
      editorRenderRuntime: editorRenderRuntime,
      effectRenderRuntime: effectRenderRuntime,
      powerUpRenderRuntime: powerUpRenderRuntime,
      projectileRenderRuntime: projectileRenderRuntime,
      screenRenderRuntime: screenRenderRuntime,
      screenTransitionRenderRuntime: screenTransitionRenderRuntime,
      stageResultRenderRuntime: stageResultRenderRuntime,
      tankRenderRuntime: tankRenderRuntime,
      terrainRenderRuntime: terrainRenderRuntime,
      titleRenderRuntime: titleRenderRuntime
    });
  }

  return Object.freeze({ setupRenderCompositionRuntime: setupRenderCompositionRuntime });
});
