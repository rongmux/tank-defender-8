(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.effectRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "drawManifestSprite",
    "drawScaledManifestSprite",
    "drawText",
    "explosionRule",
    "gameSettings"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns Canvas rendering for explosions, destruction sequences, and score popups. */
  function setupEffectRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var layout = deps.sharedState.BATTLE_PRESENTATION_LAYOUT;
    var defaultCoreColor = deps.DEFAULT_EXPLOSION_CORE_COLOR;
    var tailFrames = deps.BASE_DESTRUCTION_TAIL_FRAMES;
    var scoreTicks = deps.ENEMY_DESTRUCTION_SCORE_TICKS;
    var drawManifestSprite = callbacks.drawManifestSprite;
    var drawScaledManifestSprite = callbacks.drawScaledManifestSprite;
    var drawText = callbacks.drawText;
    var explosionRule = callbacks.explosionRule;
    var gameSettings = callbacks.gameSettings;
    var selectBaseDestructionPresentation = deps.baseDestructionPresentation;
    var selectEnemyDestructionPresentation = deps.enemyDestructionPresentation;
    var selectExplosionPresentation = deps.explosionPresentation;
    var selectPlayerDestructionPresentation = deps.playerDestructionPresentation;
    var selectScorePopupPresentation = deps.scorePopupPresentation;
    var selectTankDestructionPresentation = deps.tankDestructionPresentation;
    var isTankDestructionStyle = deps.isTankDestructionStyle;

    function renderExplosions() {
      for (var i = 0; i < game.explosions.length; i += 1) {
        var explosion = game.explosions[i];
        if (isTankDestructionStyle(explosion.style)) {
          drawTankDestructionExplosion(explosion);
          continue;
        }
        var presentation = explosionPresentation(explosion);
        drawScaledManifestSprite("explosion", "burst", presentation.x, presentation.y, presentation.size / 16, {
          primary: explosion.color,
          core: explosion.coreColor || defaultCoreColor
        });
      }
    }

    function drawTankDestructionExplosion(explosion) {
      var presentation = tankDestructionPresentation(explosion);
      drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
        primary: explosion.color,
        core: explosion.coreColor || defaultCoreColor
      });
      return presentation;
    }

    function renderPlayerDestructions() {
      var rule = explosionRule("playerDestroy");
      for (var i = 0; i < game.players.length; i += 1) {
        var player = game.players[i];
        if (!player.destroying || player.respawn <= 0) continue;
        var presentation = playerDestructionPresentation(player);
        drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
          primary: rule.color,
          core: rule.coreColor || defaultCoreColor
        });
      }
    }

    function playerDestructionPresentation(player) {
      return selectPlayerDestructionPresentation(player, {
        layout: layout,
        totalTicks: gameSettings().timings.playerRespawn,
        explosionTicks: explosionRule("playerDestroy").ttl
      });
    }

    function renderEnemyDestructions() {
      var rule = explosionRule("enemyDestroy");
      for (var i = 0; i < game.enemies.length; i += 1) {
        var enemy = game.enemies[i];
        if (!enemy.alive || !enemy.destroying) continue;
        var presentation = enemyDestructionPresentation(enemy);
        if (presentation.kind === "score") {
          drawText(presentation.text, presentation.x, presentation.y, 1, defaultCoreColor, 5);
          continue;
        }
        drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
          primary: rule.color,
          core: rule.coreColor || defaultCoreColor
        });
      }
    }

    function enemyDestructionPresentation(enemy) {
      return selectEnemyDestructionPresentation(enemy, {
        layout: layout,
        explosionTicks: explosionRule("enemyDestroy").ttl,
        scoreTicks: scoreTicks
      });
    }

    function renderBaseDestruction() {
      var presentation = baseDestructionPresentation(game.baseDestroyTimer);
      if (!presentation) return;
      var rule = explosionRule("baseDestroy");
      drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
        primary: rule.color,
        core: rule.coreColor || defaultCoreColor
      });
    }

    function baseDestructionPresentation(timer) {
      return selectBaseDestructionPresentation(timer, game.base, {
        layout: layout,
        visibleFrames: explosionRule("baseDestroy").ttl,
        tailFrames: tailFrames
      });
    }

    function tankDestructionPresentation(explosion) {
      return selectTankDestructionPresentation(explosion, layout);
    }

    function explosionPresentation(explosion) {
      return selectExplosionPresentation(explosion, layout);
    }

    function renderScorePopups() {
      for (var i = 0; i < game.scorePopups.length; i += 1) {
        var presentation = scorePopupPresentation(game.scorePopups[i]);
        drawText(presentation.text, presentation.x, presentation.y, 1, presentation.color, presentation.advance);
      }
    }

    function scorePopupPresentation(popup) {
      return selectScorePopupPresentation(popup, layout);
    }

    var api = {
      drawTankDestructionExplosion: drawTankDestructionExplosion,
      enemyDestructionPresentation: enemyDestructionPresentation,
      explosionPresentation: explosionPresentation,
      baseDestructionPresentation: baseDestructionPresentation,
      playerDestructionPresentation: playerDestructionPresentation,
      renderBaseDestruction: renderBaseDestruction,
      renderEnemyDestructions: renderEnemyDestructions,
      renderExplosions: renderExplosions,
      renderPlayerDestructions: renderPlayerDestructions,
      renderScorePopups: renderScorePopups,
      scorePopupPresentation: scorePopupPresentation,
      tankDestructionPresentation: tankDestructionPresentation
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEffectRenderRuntime: setupEffectRenderRuntime });
});
