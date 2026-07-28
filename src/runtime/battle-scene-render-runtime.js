(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleSceneRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "battleDisplayFrame",
    "drawBullet",
    "drawPowerUp",
    "drawShield",
    "drawSpawn",
    "drawTank",
    "enemyColor",
    "isPlayerShieldVisible",
    "isPlayerTankVisible",
    "renderBase",
    "renderBaseDestruction",
    "renderEnemyDestructions",
    "renderExplosions",
    "renderPanel",
    "renderPlayerDestructions",
    "renderPlayerGameOverMessage",
    "renderProjectileTerrainCover",
    "renderScorePopups",
    "renderTerrain"
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

  /** Owns the fixed Canvas layer order for an active battle scene. */
  function setupBattleSceneRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var ctx = state.ctx;
    var game = state.game;
    var shared = deps.sharedState;
    var screenWidth = shared.SCREEN_W;
    var screenHeight = shared.SCREEN_H;
    var fieldX = shared.FIELD_X;
    var fieldY = shared.FIELD_Y;
    var fieldWidth = shared.FIELD_W;
    var fieldHeight = shared.FIELD_H;
    var battleDisplayFrame = callbacks.battleDisplayFrame;
    var drawBullet = callbacks.drawBullet;
    var drawPowerUp = callbacks.drawPowerUp;
    var drawShield = callbacks.drawShield;
    var drawSpawn = callbacks.drawSpawn;
    var drawTank = callbacks.drawTank;
    var enemyColor = callbacks.enemyColor;
    var isPlayerShieldVisible = callbacks.isPlayerShieldVisible;
    var isPlayerTankVisible = callbacks.isPlayerTankVisible;
    var renderBase = callbacks.renderBase;
    var renderBaseDestruction = callbacks.renderBaseDestruction;
    var renderEnemyDestructions = callbacks.renderEnemyDestructions;
    var renderExplosions = callbacks.renderExplosions;
    var renderPanel = callbacks.renderPanel;
    var renderPlayerDestructions = callbacks.renderPlayerDestructions;
    var renderPlayerGameOverMessage = callbacks.renderPlayerGameOverMessage;
    var renderProjectileTerrainCover = callbacks.renderProjectileTerrainCover;
    var renderScorePopups = callbacks.renderScorePopups;
    var renderTerrain = callbacks.renderTerrain;

    function renderGame() {
      ctx.fillStyle = "#6b6f78";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      ctx.fillStyle = "#000000";
      ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
      renderTerrain(false, game.grid);
      renderBase();

      for (var playerIndex = 0; playerIndex < game.players.length; playerIndex += 1) {
        var player = game.players[playerIndex];
        if (!player.alive || player.respawn > 0) continue;
        if (player.spawnFlash > 0) {
          drawSpawn(player);
        } else {
          if (isPlayerShieldVisible(player, game.paused)) drawShield(player);
          if (isPlayerTankVisible(player, battleDisplayFrame())) drawTank(player, player.color, player.accent);
        }
      }

      for (var enemyIndex = 0; enemyIndex < game.enemies.length; enemyIndex += 1) {
        var enemy = game.enemies[enemyIndex];
        if (!enemy.alive) continue;
        if (enemy.destroying) continue;
        if (enemy.spawnFlash > 0) drawSpawn(enemy);
        else drawTank(enemy, enemyColor(enemy), enemy.accent);
      }

      for (var bulletIndex = 0; bulletIndex < game.bullets.length; bulletIndex += 1) {
        drawBullet(game.bullets[bulletIndex]);
      }
      renderProjectileTerrainCover(game.grid);
      renderTerrain(true, game.grid);
      if (game.powerUp) drawPowerUp(game.powerUp);
      renderExplosions();
      renderPlayerDestructions();
      renderEnemyDestructions();
      renderBaseDestruction();
      renderScorePopups();
      renderPlayerGameOverMessage();
      renderPanel();
    }

    var api = { renderGame: renderGame };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleSceneRenderRuntime: setupBattleSceneRenderRuntime });
});
