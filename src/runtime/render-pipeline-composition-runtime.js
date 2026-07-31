(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.renderPipelineCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    if (!callbacks.stageRuntime || typeof callbacks.stageRuntime !== "object") {
      throw new Error("callbacks.stageRuntime must be an object");
    }
  }

  /** Owns Canvas runtime assembly while preserving the existing setup phases. */
  function setupRenderPipelineCompositionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var fn = state.fn;
    var stages = callbacks.stageRuntime;
    var textRenderRuntime = deps.requireRuntimeModule("textRenderRuntime").setupTextRenderRuntime(state, deps);
    var spriteRenderRuntime = deps.requireRuntimeModule("spriteRenderRuntime").setupSpriteRenderRuntime(state, deps);
    var renderAdapterRuntime = deps.requireRuntimeModule("renderAdapterRuntime").setupRenderAdapterRuntime(state, deps, {
      textRenderRuntime: textRenderRuntime,
      spriteRenderRuntime: spriteRenderRuntime
    });
    var battleSceneRenderRuntime = deps.requireRuntimeModule("battleSceneRenderRuntime").setupBattleSceneRenderRuntime(state, deps,
      Object.assign({}, renderAdapterRuntime, {
        enemyColor: deps.enemyColor,
        isPlayerShieldVisible: deps.isPlayerShieldVisible,
        isPlayerTankVisible: deps.isPlayerTankVisible
      })
    );
    var completed = null;

    function finishRenderCompositionRuntime() {
      if (completed) return completed;

      var renderCompositionRuntime = deps.requireRuntimeModule("renderCompositionRuntime").setupRenderCompositionRuntime(state, deps,
        Object.assign({}, renderAdapterRuntime, {
          createStageGrid: stages.createStageGrid,
          directionName: deps.directionName,
          drawMiniTank: spriteRenderRuntime.drawMiniTank,
          enemyTotal: stages.enemyTotal,
          explosionRule: fn.explosionRule,
          gameSettings: stages.gameSettings,
          hiddenMessagePresentation: fn.hiddenMessagePresentation,
          normalizeBrickFragmentMask: deps.normalizeBrickFragmentMask,
          pixelGlyph: deps.pixelGlyph,
          playerUpgradeOverlayParts: deps.playerUpgradeOverlayParts,
          quarterMaskFromBrickFragments: deps.quarterMaskFromBrickFragments,
          shieldColorForTick: deps.shieldColorForTick,
          spawnAnimationPresentation: deps.spawnAnimationPresentation,
          stageClearPresentation: fn.stageClearPresentation,
          tankPrimaryColor: deps.tankPrimaryColor,
          tankTrackFrameName: deps.tankTrackFrameName
        })
      );
      renderAdapterRuntime.connectRenderCompositionRuntime(renderCompositionRuntime, battleSceneRenderRuntime);
      completed = Object.freeze({
        renderCompositionRuntime: renderCompositionRuntime,
        screenRenderRuntime: renderCompositionRuntime.screenRenderRuntime
      });
      return completed;
    }

    return Object.freeze({
      battleSceneRenderRuntime: battleSceneRenderRuntime,
      finishRenderCompositionRuntime: finishRenderCompositionRuntime,
      renderAdapterRuntime: renderAdapterRuntime
    });
  }

  return Object.freeze({
    setupRenderPipelineCompositionRuntime: setupRenderPipelineCompositionRuntime
  });
});
