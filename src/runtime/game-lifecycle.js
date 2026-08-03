(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.gameLifecycle = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /**
   * Register all game-lifecycle functions on `state.fn`.
   * `deps` is the module-deps barrel (requireRuntimeModule("moduleDeps")).
   */
  function setupGameLifecycle(state, deps) {
    var sh = deps.sharedState;
    var fn = state.fn;

    // ── High score ─────────────────────────────────────────────────────────
    deps.highScoreRuntime.setupHighScoreRuntime(state, deps);

    // ── Player helpers ────────────────────────────────────────────────────
    deps.playerSessionRuntime.setupPlayerSessionRuntime(state, deps);

    // ── Game start / Title demo ───────────────────────────────────────────
    deps.gameSessionRuntime.setupGameSessionRuntime(state, deps);

    // ── Title flow ────────────────────────────────────────────────────────
    deps.titleFlowRuntime.setupTitleFlowRuntime(state, deps);

    // ── Stage start ───────────────────────────────────────────────────────
    deps.stageLifecycleRuntime.setupStageLifecycleRuntime(state, deps);

    deps.editorLifecycleRuntime.setupEditorLifecycleRuntime(state, deps);

    // ── Title menu ────────────────────────────────────────────────────────
    fn.moveTitleMenu = function (delta) {
      fn.resetTitleIdleHighByte();
      state.game.titleMenu = (state.game.titleMenu + delta + sh.TITLE_MENU_ITEMS.length) % sh.TITLE_MENU_ITEMS.length;
    };

    fn.setTitleMenu = function (index) {
      fn.resetTitleIdleHighByte();
      state.game.titleMenu = deps.clamp(Math.floor(Number(index) || 0), 0, sh.TITLE_MENU_ITEMS.length - 1);
    };

    fn.activateTitleMenu = function () {
      var item = sh.TITLE_MENU_ITEMS[state.game.titleMenu] || sh.TITLE_MENU_ITEMS[0];
      if (item.action === "one") fn.beginStageSelect(1);
      else if (item.action === "two") fn.beginStageSelect(2);
      else if (item.action === "construction") fn.enterEditor();
    };

    deps.stagePackLifecycleRuntime.setupStagePackLifecycleRuntime(state, deps, {
      clearTransientBattleState: fn.clearTransientBattleState,
      resetBattleRandom: function () { fn.resetBattleRandom(); },
      resetTitleIdleTimer: fn.resetTitleIdleTimer
    });

  }

  return { setupGameLifecycle: setupGameLifecycle };
});
