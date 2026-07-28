(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.titleRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "drawManifestSprite",
    "drawMiniTank",
    "drawText",
    "fullGameOverPresentation",
    "highScorePresentation",
    "hiddenMessagePresentation",
    "pixelGlyph",
    "titleScoreLayout"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
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

  /** Owns title, hidden-message, high-score, and full GAME OVER Canvas rendering. */
  function setupTitleRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var shared = deps.sharedState;
    var ctx = state.ctx;
    var game = state.game;
    var screenWidth = shared.SCREEN_W;
    var screenHeight = shared.SCREEN_H;
    var titleMenuItems = shared.TITLE_MENU_ITEMS;
    var drawManifestSprite = callbacks.drawManifestSprite;
    var drawMiniTank = callbacks.drawMiniTank;
    var drawText = callbacks.drawText;
    var fullGameOverPresentation = callbacks.fullGameOverPresentation;
    var highScorePresentation = callbacks.highScorePresentation;
    var hiddenMessagePresentation = callbacks.hiddenMessagePresentation;
    var pixelGlyph = callbacks.pixelGlyph;
    var titleScoreLayout = callbacks.titleScoreLayout;

    function renderTitle() {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      var scoreLayout = titleScoreLayout();
      for (var index = 0; index < scoreLayout.length; index += 1) {
        var score = scoreLayout[index];
        drawText(score.text, score.x, score.y, 1, "#f05a42");
      }
      drawStripedTitleText("TANK", 68, 46, 5);
      drawStripedTitleText("DEFENDER", 56, 86, 3);
      for (var itemIndex = 0; itemIndex < titleMenuItems.length; itemIndex += 1) {
        var item = titleMenuItems[itemIndex];
        if (itemIndex === game.titleMenu) drawTitleMenuCursor(item);
        drawText(item.label, item.x, item.y, 1, item.color);
      }
      drawText("PIXEL LAB", 88, 184, 1, "#f05a42");
      drawText("2026 OPEN PIXEL LAB", 32, 200, 1, "#f3f0d4");
      drawText("ALL RIGHTS RESERVED", 48, 216, 1, "#f3f0d4");
    }

    function renderHiddenMessage() {
      var presentation = hiddenMessagePresentation(game.hiddenMessageElapsed);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      for (var index = 0; index < presentation.visibleLines.length; index += 1) {
        drawText(presentation.visibleLines[index], 64, 64 + index * 16, 1, "#f3f0d4");
      }
      if (presentation.dots > 0) drawText(".".repeat(presentation.dots), 64, 128, 1, "#f3f0d4");
      if (presentation.drop) {
        drawManifestSprite("hiddenDrop", presentation.drop.frame, presentation.drop.x, presentation.drop.y, {
          primary: "#55b96a",
          light: "#b7ffbd",
          shadow: "#245c33"
        });
      }
    }

    function renderHighScore() {
      var presentation = highScorePresentation(game.highScoreScreenElapsed, game.highScore);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      var palette = {
        dark: "#1b1512",
        primary: presentation.color,
        highlight: "#f7f1c6"
      };
      drawStripedTitleText("HISCORE", 23, 50, 5, palette);
      drawStripedTitleText(presentation.scoreText, presentation.scoreX, 100, 5, palette);
    }

    function renderFullGameOver() {
      var presentation = fullGameOverPresentation(game.fullGameOverElapsed);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      for (var index = 0; index < presentation.gameText.length; index += 1) {
        drawStripedTitleText(
          presentation.gameText[index],
          presentation.x + index * presentation.letterAdvance,
          presentation.gameY,
          presentation.scale
        );
      }
      for (var overIndex = 0; overIndex < presentation.overText.length; overIndex += 1) {
        drawStripedTitleText(
          presentation.overText[overIndex],
          presentation.x + overIndex * presentation.letterAdvance,
          presentation.overY,
          presentation.scale
        );
      }
    }

    function drawStripedTitleText(text, x, y, scale, palette) {
      var size = Math.max(2, Math.floor(scale || 2));
      var colors = palette || { dark: "#a8322c", primary: "#f05a42", highlight: "#f3f0d4" };
      var cursorX = Math.round(x);
      var top = Math.round(y);
      for (var charIndex = 0; charIndex < String(text).length; charIndex += 1) {
        var glyph = pixelGlyph(String(text)[charIndex]);
        for (var row = 0; row < glyph.length; row += 1) {
          for (var column = 0; column < glyph[row].length; column += 1) {
            if (glyph[row][column] !== "1") continue;
            var px = cursorX + column * size;
            var py = top + row * size;
            ctx.fillStyle = colors.dark;
            ctx.fillRect(px, py, size, size);
            ctx.fillStyle = colors.primary;
            ctx.fillRect(px, py, size, Math.max(1, size - 1));
            ctx.fillStyle = colors.highlight;
            ctx.fillRect(px, py + Math.floor(size / 2), size, 1);
          }
        }
        cursorX += 6 * size;
      }
    }

    function drawTitleMenuCursor(item) {
      drawMiniTank(item.x - 20, item.y - 4, "#e3c64e");
    }

    var api = {
      drawStripedTitleText: drawStripedTitleText,
      drawTitleMenuCursor: drawTitleMenuCursor,
      renderFullGameOver: renderFullGameOver,
      renderHighScore: renderHighScore,
      renderHiddenMessage: renderHiddenMessage,
      renderTitle: renderTitle
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTitleRenderRuntime: setupTitleRenderRuntime });
});
