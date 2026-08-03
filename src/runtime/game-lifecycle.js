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
    deps.titleMenuRuntime.setupTitleMenuRuntime(state, deps);

    deps.stagePackLifecycleRuntime.setupStagePackLifecycleRuntime(state, deps, {
      clearTransientBattleState: fn.clearTransientBattleState,
      resetBattleRandom: function () { fn.resetBattleRandom(); },
      resetTitleIdleTimer: fn.resetTitleIdleTimer
    });

  }

  return { setupGameLifecycle: setupGameLifecycle };
});
