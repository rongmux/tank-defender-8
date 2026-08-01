(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.highScoreRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  /** Owns high-score storage loading, persistence, and monotonic score promotion. */
  function setupHighScoreRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var fn = state.fn;
    var shared = deps.sharedState;

    function loadHighScore() {
      try {
        var value = Number(localStorage.getItem(shared.HIGH_SCORE_STORAGE_KEY));
        game.highScore = Number.isFinite(value) && value > 0
          ? Math.max(shared.DEFAULT_HIGH_SCORE, Math.floor(value))
          : shared.DEFAULT_HIGH_SCORE;
      } catch (error) {
        game.highScore = shared.DEFAULT_HIGH_SCORE;
      }
      game.runHighScoreBaseline = game.highScore;
    }

    function saveHighScore() {
      try {
        localStorage.setItem(shared.HIGH_SCORE_STORAGE_KEY, String(game.highScore));
      } catch (error) {
        // localStorage can be unavailable in restricted browser contexts.
      }
    }

    function updateHighScore(score) {
      if (score > game.highScore) {
        game.highScore = score;
        saveHighScore();
      }
    }

    var api = {
      loadHighScore: loadHighScore,
      saveHighScore: saveHighScore,
      updateHighScore: updateHighScore
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupHighScoreRuntime: setupHighScoreRuntime });
});
