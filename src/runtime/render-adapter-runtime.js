(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.renderAdapterRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState.SCREEN_W !== "number") {
      throw new Error("deps.sharedState.SCREEN_W must be a number");
    }
    ["fullGameOverPresentation", "highScorePresentation", "titleScoreLayout"].forEach(function (name) {
      if (typeof deps[name] !== "function") throw new Error("deps." + name + " must be a function");
    });
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    ["textRenderRuntime", "spriteRenderRuntime"].forEach(function (name) {
      if (!callbacks[name] || typeof callbacks[name] !== "object") {
        throw new Error("callbacks." + name + " must be an object");
      }
    });
  }

  function setupRenderAdapterRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var screenWidth = deps.sharedState.SCREEN_W;
    var renderCompositionRuntime = null;

    function callRuntime(runtimeName, methodName, args) {
      var runtime = renderCompositionRuntime && renderCompositionRuntime[runtimeName];
      if (!runtime || typeof runtime[methodName] !== "function") {
        throw new Error("render composition runtime must provide " + runtimeName + "." + methodName);
      }
      return runtime[methodName].apply(runtime, args);
    }

    function forward(runtimeName, methodName) {
      return function () {
        return callRuntime(runtimeName, methodName, Array.prototype.slice.call(arguments));
      };
    }

    function forwardExternal(runtime, methodName) {
      return function () {
        if (typeof runtime[methodName] !== "function") {
          throw new Error("render callback must provide " + methodName);
        }
        return runtime[methodName].apply(runtime, arguments);
      };
    }

    function connectRenderCompositionRuntime(runtime, battleSceneRuntime) {
      if (!runtime || typeof runtime !== "object") {
        throw new Error("renderCompositionRuntime must be an object");
      }
      if (!battleSceneRuntime || typeof battleSceneRuntime !== "object") {
        throw new Error("battleSceneRuntime must be an object");
      }
      renderCompositionRuntime = Object.assign({}, runtime, {
        battleSceneRenderRuntime: battleSceneRuntime
      });
    }

    var api = {
      connectRenderCompositionRuntime: connectRenderCompositionRuntime,
      renderTitle: forward("titleRenderRuntime", "renderTitle"),
      renderHiddenMessage: forward("titleRenderRuntime", "renderHiddenMessage"),
      renderHighScore: forward("titleRenderRuntime", "renderHighScore"),
      renderFullGameOver: forward("titleRenderRuntime", "renderFullGameOver"),
      fullGameOverPresentation: function (elapsed) {
        return deps.fullGameOverPresentation(elapsed);
      },
      highScorePresentation: function (elapsed, score) {
        return deps.highScorePresentation(elapsed, score, { screenWidth: screenWidth });
      },
      titleScoreLayout: function (menuIndex) {
        var selected = menuIndex === undefined ? game.titleMenu : menuIndex;
        return deps.titleScoreLayout(selected, game.highScore);
      },
      drawStripedTitleText: forward("titleRenderRuntime", "drawStripedTitleText"),
      drawTitleMenuCursor: forward("titleRenderRuntime", "drawTitleMenuCursor"),
      renderStageSelect: forward("screenTransitionRenderRuntime", "renderStageSelect"),
      renderStageSelectClosing: forward("screenTransitionRenderRuntime", "renderStageSelectClosing"),
      renderGame: forward("battleSceneRenderRuntime", "renderGame"),
      renderGameBackdrop: forward("terrainRenderRuntime", "renderGameBackdrop"),
      renderTerrain: forward("terrainRenderRuntime", "renderTerrain"),
      drawWallCell: forward("terrainRenderRuntime", "drawWallCell"),
      drawBrickCell: forward("terrainRenderRuntime", "drawBrickCell"),
      drawWater: forward("terrainRenderRuntime", "drawWater"),
      waterFrameName: forward("terrainRenderRuntime", "waterFrameName"),
      drawIce: forward("terrainRenderRuntime", "drawIce"),
      renderProjectileTerrainCover: forward("terrainRenderRuntime", "renderProjectileTerrainCover"),
      drawIceProjectileCover: forward("terrainRenderRuntime", "drawIceProjectileCover"),
      drawForest: forward("terrainRenderRuntime", "drawForest"),
      renderBase: forward("terrainRenderRuntime", "renderBase"),
      drawTank: forward("tankRenderRuntime", "drawTank"),
      drawTankForestOutline: forward("tankRenderRuntime", "drawTankForestOutline"),
      drawPlayerUpgradeOverlay: forward("tankRenderRuntime", "drawPlayerUpgradeOverlay"),
      drawShield: forward("tankRenderRuntime", "drawShield"),
      drawSpawn: forward("tankRenderRuntime", "drawSpawn"),
      drawBullet: forward("projectileRenderRuntime", "drawBullet"),
      drawPowerUp: forward("powerUpRenderRuntime", "drawPowerUp"),
      isPowerUpVisible: forward("powerUpRenderRuntime", "isPowerUpVisible"),
      battleDisplayFrame: function () {
        return game.frameLow;
      },
      powerUpVisualRect: forward("powerUpRenderRuntime", "powerUpVisualRect"),
      drawManifestSprite: forwardExternal(callbacks.spriteRenderRuntime, "drawManifestSprite"),
      drawScaledManifestSprite: forwardExternal(callbacks.spriteRenderRuntime, "drawScaledManifestSprite"),
      renderExplosions: forward("effectRenderRuntime", "renderExplosions"),
      drawTankDestructionExplosion: forward("effectRenderRuntime", "drawTankDestructionExplosion"),
      renderPlayerDestructions: forward("effectRenderRuntime", "renderPlayerDestructions"),
      playerDestructionPresentation: forward("effectRenderRuntime", "playerDestructionPresentation"),
      renderEnemyDestructions: forward("effectRenderRuntime", "renderEnemyDestructions"),
      enemyDestructionPresentation: forward("effectRenderRuntime", "enemyDestructionPresentation"),
      renderBaseDestruction: forward("effectRenderRuntime", "renderBaseDestruction"),
      baseDestructionPresentation: forward("effectRenderRuntime", "baseDestructionPresentation"),
      tankDestructionPresentation: forward("effectRenderRuntime", "tankDestructionPresentation"),
      explosionPresentation: forward("effectRenderRuntime", "explosionPresentation"),
      renderScorePopups: forward("effectRenderRuntime", "renderScorePopups"),
      scorePopupPresentation: forward("effectRenderRuntime", "scorePopupPresentation"),
      renderPanel: forward("battleHudRenderRuntime", "renderPanel"),
      drawStageFlag: forward("battleHudRenderRuntime", "drawStageFlag"),
      panelEnemyCounterRemaining: forward("battleHudRenderRuntime", "panelEnemyCounterRemaining"),
      panelLifeCount: forward("battleHudRenderRuntime", "panelLifeCount"),
      drawSmallScore: forward("stageResultRenderRuntime", "drawSmallScore"),
      formatScore5: forward("stageResultRenderRuntime", "formatScore5"),
      renderStageIntro: forward("screenTransitionRenderRuntime", "renderStageIntro"),
      renderCurtain: forward("screenTransitionRenderRuntime", "renderCurtain"),
      stageSelectCurtainState: forward("screenTransitionRenderRuntime", "stageSelectCurtainState"),
      stageIntroCurtainState: forward("screenTransitionRenderRuntime", "stageIntroCurtainState"),
      renderStageClear: forward("stageResultRenderRuntime", "renderStageClear"),
      renderStageClearClosing: forward("stageResultRenderRuntime", "renderStageClearClosing"),
      totalStageKills: forward("stageResultRenderRuntime", "totalStageKills"),
      drawResultArrow: forward("stageResultRenderRuntime", "drawResultArrow"),
      renderGameOver: forward("battleHudRenderRuntime", "renderGameOver"),
      renderPlayerGameOverMessage: forward("battleHudRenderRuntime", "renderPlayerGameOverMessage"),
      playerGameOverMessagePresentation: forward("battleHudRenderRuntime", "playerGameOverMessagePresentation"),
      drawCompactGameOverWord: forward("battleHudRenderRuntime", "drawCompactGameOverWord"),
      gameOverBannerY: forward("battleHudRenderRuntime", "gameOverBannerY"),
      renderPause: forward("battleHudRenderRuntime", "renderPause"),
      pausePresentation: forward("battleHudRenderRuntime", "pausePresentation"),
      renderEditor: forward("editorRenderRuntime", "renderEditor"),
      drawTileLegend: forward("editorRenderRuntime", "drawTileLegend"),
      drawText: forwardExternal(callbacks.textRenderRuntime, "drawText"),
      drawTextClipped: forwardExternal(callbacks.textRenderRuntime, "drawTextClipped"),
      drawTextRight: forwardExternal(callbacks.textRenderRuntime, "drawTextRight"),
      pad2: function (value) {
        return String(value).padStart(2, "0");
      }
    };

    return Object.freeze(api);
  }

  return Object.freeze({ setupRenderAdapterRuntime: setupRenderAdapterRuntime });
});
