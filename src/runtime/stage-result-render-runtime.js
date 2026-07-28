(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageResultRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "drawMiniTank",
    "drawText",
    "drawTextRight",
    "gameSettings",
    "renderCurtain",
    "stageClearPresentation",
    "stageSelectCurtainState"
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

  /** Owns the stage-clear result table, its layout helpers, and closing curtain. */
  function setupStageResultRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var ctx = state.ctx;
    var game = state.game;
    var shared = deps.sharedState;
    var screenWidth = shared.SCREEN_W;
    var screenHeight = shared.SCREEN_H;
    var rowLayout = shared.STAGE_RESULT_ROW_LAYOUT;
    var drawMiniTank = callbacks.drawMiniTank;
    var drawText = callbacks.drawText;
    var drawTextRight = callbacks.drawTextRight;
    var gameSettings = callbacks.gameSettings;
    var renderCurtain = callbacks.renderCurtain;
    var stageClearPresentation = callbacks.stageClearPresentation;
    var stageSelectCurtainState = callbacks.stageSelectCurtainState;

    function drawSmallScore(score, x, y, color) {
      drawText(formatScore5(score), x, y, 1, color);
    }

    function formatScore5(score) {
      return String(Math.min(99999, Math.max(0, Math.floor(score || 0)))).padStart(5, "0");
    }

    function renderStageClear() {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      var presentation = stageClearPresentation();
      var result = presentation.result;
      var p1 = result.p1;
      var p2 = result.p2;

      drawText("HI-SCORE", 64, 24, 1, "#f05a42");
      drawText(formatScore5(game.highScore), 152, 24, 1, "#f05a42");
      drawText("STAGE", 96, 40, 1, "#f3f0d4");
      drawText(String(game.stage), 152, 40, 1, "#f3f0d4");
      drawText("I-PLAYER", 24, 56, 1, "#f05a42");
      drawTextRight(String(p1.score || 0), 88, 72, 1, "#d08b52");
      if (game.playerCount > 1) {
        drawText("II-PLAYER", 168, 56, 1, "#f05a42");
        drawTextRight(String(p2.score || 0), 232, 72, 1, "#d08b52");
      }

      for (var i = 0; i < presentation.rows.length; i += 1) {
        var row = presentation.rows[i];
        var y = 96 + row.typeIndex * 24;
        drawTextRight(String(row.p1VisiblePoints), 56, y, 1, "#f3f0d4");
        drawText("PTS", 64, y, 1, "#f3f0d4");
        drawTextRight(String(row.p1VisibleKills), rowLayout.p1KillsRightX, y, 1, "#f3f0d4");
        drawResultArrow(rowLayout.leftArrowX, y + 2, -1);
        drawMiniTank(rowLayout.miniTankX, y - 3, row.color);
        if (game.playerCount > 1) {
          drawResultArrow(rowLayout.rightArrowX, y + 2, 1);
          drawText(String(row.p2VisibleKills), rowLayout.p2KillsX, y, 1, "#f3f0d4");
          drawTextRight(String(row.p2VisiblePoints), 200, y, 1, "#f3f0d4");
          drawText("PTS", 208, y, 1, "#f3f0d4");
        }
      }

      ctx.fillStyle = "#f3f0d4";
      ctx.fillRect(96, 180, 64, 1);
      drawText("TOTAL", 48, 184, 1, "#f3f0d4");
      if (presentation.showTotals) {
        drawTextRight(String(totalStageKills(p1)), 104, 184, 1, "#f3f0d4");
        if (game.playerCount > 1) drawText(String(totalStageKills(p2)), 152, 184, 1, "#f3f0d4");
      }

      if (presentation.showBonus && game.stageClearBonusPlayerIds.includes(1)) {
        drawText("BONUS!", 24, 200, 1, "#f05a42");
        drawTextRight(String(gameSettings().stageClearBonus.points), 56, 208, 1, "#f3f0d4");
        drawText("PTS", 64, 208, 1, "#f3f0d4");
      }
      if (presentation.showBonus && game.stageClearBonusPlayerIds.includes(2)) {
        drawText("BONUS!", 176, 200, 1, "#f05a42");
        drawTextRight(String(gameSettings().stageClearBonus.points), 200, 208, 1, "#f3f0d4");
        drawText("PTS", 216, 208, 1, "#f3f0d4");
      }
    }

    function renderStageClearClosing() {
      renderStageClear();
      renderCurtain(stageSelectCurtainState());
    }

    function totalStageKills(player) {
      return player && Array.isArray(player.stageKills)
        ? player.stageKills.reduce(function (sum, value) {
          return sum + Math.max(0, Math.floor(Number(value) || 0));
        }, 0)
        : 0;
    }

    function drawResultArrow(x, y, direction) {
      ctx.fillStyle = "#f3f0d4";
      if (direction < 0) {
        ctx.fillRect(x, y + 2, 8, 1);
        ctx.fillRect(x, y + 1, 2, 3);
        ctx.fillRect(x + 2, y, 2, 5);
      } else {
        ctx.fillRect(x, y + 2, 8, 1);
        ctx.fillRect(x + 6, y + 1, 2, 3);
        ctx.fillRect(x + 4, y, 2, 5);
      }
    }

    var api = {
      drawResultArrow: drawResultArrow,
      drawSmallScore: drawSmallScore,
      formatScore5: formatScore5,
      renderStageClear: renderStageClear,
      renderStageClearClosing: renderStageClearClosing,
      totalStageKills: totalStageKills
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStageResultRenderRuntime: setupStageResultRenderRuntime });
});
