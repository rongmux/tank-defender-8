(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.gameSessionRuntime = api;
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
    if (typeof deps.cloneGrid !== "function") throw new Error("deps.cloneGrid must be a function");
  }

  /** Owns game-session setup plus title-demo entry and exit orchestration. */
  function setupGameSessionRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var fn = state.fn;
    var sh = deps.sharedState;

    function startGame(players, options) {
      var opts = options || {};
      if (!opts.demo) {
        fn.initAudio();
        game.constructionUsed = false;
        game.constructionVisits = 0;
        game.hiddenInputCount = 0;
        game.runHighScoreBaseline = game.highScore;
        game.newHighScoreAtGameOver = false;
        game.fullGameOverElapsed = 0;
        game.highScoreScreenElapsed = 0;
      }
      game.demoMode = Boolean(opts.demo);
      game.playerCount = players;
      game.paused = false;
      game.pauseElapsed = 0;
      game.stage = opts.stage || game.stage || 1;
      game.customGrid = opts.customGrid ? deps.cloneGrid(opts.customGrid) : null;
      game.constructionStageActive = Boolean(
        !game.customGrid &&
        opts.useConstruction !== false &&
        game.stage === 1 &&
        game.constructedGrid
      );
      game.players = [];
      for (var i = 1; i <= players; i += 1) {
        game.players.push(fn.createPlayer(i));
      }
      fn.startStage(game.stage);
    }

    function startTitleDemo() {
      fn.startGame(2, { stage: sh.DEMO_DISPLAY_STAGE, useConstruction: false, demo: true });
      game.screen = "playing";
      game.transitionTimer = 0;
      game.titleIdleFrames = 0;
      fn.resetFrameCounters();
      game.frameLow = sh.DEMO_INITIAL_FRAME_LOW;
      fn.syncMovementAudio();
    }

    function endTitleDemo() {
      fn.stopMovementAudio();
      fn.stopBrickHitAudio();
      fn.stopEnemyHitAudio();
      fn.stopBaseHitAudio();
      fn.stopEnemyDestroyAudio();
      fn.stopPlayerDestroyAudio();
      fn.stopSteelHitAudio();
      fn.stopPlayerShootAudio();
      fn.stopMovementIceAudio();
      fn.stopScoreCountAudio();
      fn.stopStageBonusAudio();
      game.demoMode = false;
      game.stage = 1;
      game.screen = "title";
      game.paused = false;
      fn.resetTitleIdleTimer();
      fn.clearTransientBattleState();
    }

    var api = {
      startGame: startGame,
      startTitleDemo: startTitleDemo,
      endTitleDemo: endTitleDemo
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupGameSessionRuntime: setupGameSessionRuntime });
});
