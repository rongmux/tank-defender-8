(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleHudRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "battleDisplayFrame",
    "drawManifestSprite",
    "drawScaledManifestSprite",
    "drawText",
    "enemyTotal",
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

  /** Owns the in-battle side panel, pause label, and field GAME OVER overlays. */
  function setupBattleHudRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var ctx = state.ctx;
    var game = state.game;
    var shared = deps.sharedState;
    var panelX = shared.PANEL_X;
    var screenWidth = shared.SCREEN_W;
    var gameOverText = shared.GAME_OVER_TEXT;
    var drawManifestSprite = callbacks.drawManifestSprite;
    var drawScaledManifestSprite = callbacks.drawScaledManifestSprite;
    var drawText = callbacks.drawText;
    var enemyTotal = callbacks.enemyTotal;
    var gameSettings = callbacks.gameSettings;
    var battleDisplayFrame = callbacks.battleDisplayFrame;
    var selectGameOverBannerPresentation = deps.gameOverBannerPresentation;
    var selectPanelEnemyCounterRemaining = deps.panelEnemyCounterRemaining;
    var selectPanelLifeCount = deps.panelLifeCount;
    var selectPausePresentation = deps.pausePresentation;
    var selectPlayerGameOverMessagePresentation = deps.playerGameOverMessagePresentation;
    var compactGameOverGlyph = deps.compactGameOverGlyph;

    function renderPanel() {
      var count = panelEnemyCounterRemaining();
      for (var i = 0; i < enemyTotal(); i += 1) {
        var x = panelX + 8 + (i % 2) * 8;
        var y = 24 + Math.floor(i / 2) * 8;
        drawManifestSprite("enemyCounter", i < count ? "remaining" : "cleared", x, y, {
          primary: i < count ? "#15161a" : "#686c75"
        });
      }
      drawText("1P", panelX + 8, 112, 1, "#15161a");
      drawScaledManifestSprite("miniTank", "up", panelX + 8, 124, 0.57, {
        primary: "#15161a",
        shadow: "#6b6f78"
      });
      drawText(String(panelLifeCount(game.players[0])), panelX + 20, 125, 1, "#15161a");
      if (game.playerCount > 1) {
        drawText("2P", panelX + 8, 144, 1, "#15161a");
        drawScaledManifestSprite("miniTank", "up", panelX + 8, 156, 0.57, {
          primary: "#15161a",
          shadow: "#6b6f78"
        });
        drawText(String(panelLifeCount(game.players[1])), panelX + 20, 157, 1, "#15161a");
      }
      drawStageFlag(panelX + 8, 192);
      drawText(pad2(game.stage), panelX + 10, 211, 1, "#15161a");
      if (game.freezeTimer > 0) drawText("TM", panelX + 8, 176, 1, "#173b67");
    }

    function drawStageFlag(x, y) {
      ctx.fillStyle = "#15161a";
      ctx.fillRect(x, y, 2, 15);
      ctx.fillRect(x + 2, y + 1, 10, 7);
      ctx.fillStyle = "#6b6f78";
      ctx.fillRect(x + 4, y + 3, 6, 3);
    }

    function panelEnemyCounterRemaining(total, spawned) {
      var countTotal = total === undefined ? enemyTotal() : Math.max(0, Math.floor(Number(total) || 0));
      var spawnedCount = spawned === undefined ? game.enemySpawned : Math.max(0, Math.floor(Number(spawned) || 0));
      return selectPanelEnemyCounterRemaining(countTotal, spawnedCount);
    }

    function panelLifeCount(player) {
      return selectPanelLifeCount(player);
    }

    function renderGameOver() {
      var y = gameOverBannerY(game.gameOverTimer);
      var width = gameOverText.length * 6 - 1;
      drawText(gameOverText, Math.round((screenWidth - width) / 2), y, 1, "#f05a42");
    }

    function renderPlayerGameOverMessage() {
      var presentation = playerGameOverMessagePresentation();
      if (!presentation || !presentation.visible) return;
      drawCompactGameOverWord("GAME", presentation.left, presentation.y + 1);
      drawCompactGameOverWord("OVER", presentation.left + 16, presentation.y + 1);
    }

    function playerGameOverMessagePresentation() {
      return selectPlayerGameOverMessagePresentation(game.playerGameOverMessage, {
        paused: game.paused,
        demoMode: game.demoMode
      });
    }

    function drawCompactGameOverWord(word, x, y) {
      ctx.fillStyle = "#f05a42";
      var cursorX = Math.round(x);
      var top = Math.round(y);
      for (var charIndex = 0; charIndex < word.length; charIndex += 1) {
        var glyph = compactGameOverGlyph(word[charIndex]);
        for (var row = 0; row < glyph.length; row += 1) {
          for (var column = 0; column < glyph[row].length; column += 1) {
            if (glyph[row][column] === "1") ctx.fillRect(cursorX + column, top + row, 1, 1);
          }
        }
        cursorX += 4;
      }
    }

    function gameOverBannerY(timer) {
      var timings = gameSettings().timings;
      return selectGameOverBannerPresentation(timer, {
        slideFrames: timings.gameOverSlide,
        holdFrames: timings.gameOverHold
      }).y;
    }

    function renderPause() {
      var presentation = pausePresentation(battleDisplayFrame());
      if (!presentation.visible) return;
      drawText(presentation.text, presentation.x, presentation.y, 1, "#f3f0d4");
    }

    function pausePresentation(frame) {
      return selectPausePresentation(frame);
    }

    function pad2(value) {
      return String(value).padStart(2, "0");
    }

    var api = {
      drawCompactGameOverWord: drawCompactGameOverWord,
      drawStageFlag: drawStageFlag,
      gameOverBannerY: gameOverBannerY,
      panelEnemyCounterRemaining: panelEnemyCounterRemaining,
      panelLifeCount: panelLifeCount,
      pausePresentation: pausePresentation,
      playerGameOverMessagePresentation: playerGameOverMessagePresentation,
      renderGameOver: renderGameOver,
      renderPanel: renderPanel,
      renderPlayerGameOverMessage: renderPlayerGameOverMessage,
      renderPause: renderPause
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleHudRenderRuntime: setupBattleHudRenderRuntime });
});
