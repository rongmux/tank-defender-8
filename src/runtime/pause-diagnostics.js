(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.pauseDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter((entry) => typeof entry[1] === "function")
        .map((entry) => [entry[0], entry[1].bind(source)])
    );
  }

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.pendingFirePresses || typeof state.pendingFirePresses !== "object") {
      throw new Error("state.pendingFirePresses must be an object");
    }
    if (!state.audio || typeof state.audio !== "object") {
      throw new Error("state.audio must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  function createRuntimeScope(state, deps) {
    requireInputs(state, deps);
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn),
      game: state.game,
      pendingFirePresses: state.pendingFirePresses,
      pauseAudio: state.audio.pause
    };
  }

  /** Binds pause toggling, pause-safe stage completion, and pause rendering probes. */
  function createPauseDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      TILE,
      enemyTotal,
      game,
      gameSettings,
      isPauseInputCode,
      pauseAudio,
      pausePresentation,
      pendingFirePresses,
      renderPause,
      stopPauseAudio,
      syncMovementAudio,
      syncPauseAudioNodes,
      togglePause,
      update
    } = scope;

    return Object.freeze({
        debugPauseBehaviorProbe() {
          const previous = { ...game };
          const previousFirePresses = Array.from(pendingFirePresses);
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          try {
            stopPauseAudio();
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.pauseElapsed = 99;
            game.tick = 15;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [{ alive: true, lives: 1, respawn: 0 }];
            game.enemies = [];
            game.enemySpawned = 0;
            game.clearPendingTimer = 0;
            game.scorePopups = [];
            pendingFirePresses.clear();
            pendingFirePresses.add("Space");

            const entered = togglePause();
            const entry = {
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              pendingFirePresses: pendingFirePresses.size,
              pauseAudioActive: pauseAudio.active,
              pauseAudioFrame: pauseAudio.frame
            };
            update();
            const pausedUpdate = {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              pauseAudioFrame: pauseAudio.frame
            };
            const exited = togglePause();
            const exit = {
              paused: game.paused,
              pauseAudioActive: pauseAudio.active,
              pauseAudioFrame: pauseAudio.frame
            };

            game.screen = "stageIntro";
            game.paused = false;
            game.demoMode = false;
            const stageIntroAccepted = togglePause();
            game.screen = "playing";
            game.demoMode = true;
            const demoAccepted = togglePause();

            return {
              entered,
              exited,
              entry,
              exit,
              pausedUpdate,
              stageIntroAccepted,
              demoAccepted,
              inputs: ["Enter", "KeyP", "Escape"].map((code) => ({ code, accepted: isPauseInputCode(code) })),
              frames: [15, 16, 31, 32].map(pausePresentation)
            };
          } finally {
            stopPauseAudio();
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            Object.assign(game, previous);
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugPausedStageEndProbe() {
          const previous = { ...game };
          const total = enemyTotal();
          const player = { alive: true, lives: 1, respawn: 0 };
          try {
            game.screen = "playing";
            game.demoMode = false;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.enemySpawned = Math.max(0, total - 1);
            game.clearPendingTimer = 0;
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = 41;
            game.scorePopups = [];
            update();
            const incomplete = {
              screen: game.screen,
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              tick: game.tick
            };

            game.screen = "playing";
            game.enemies = [{ alive: false }];
            game.enemySpawned = total;
            game.clearPendingTimer = 0;
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = 41;
            game.scorePopups = [];
            update();
            const detected = {
              screen: game.screen,
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              tick: game.tick,
              enemyCount: game.enemies.length,
              clearPendingTimer: game.clearPendingTimer
            };
            const pauseAcceptedDuringDelay = togglePause();
            return {
              delay: gameSettings().timings.stageClearDelay,
              incomplete,
              detected,
              pauseAcceptedDuringDelay
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderPauseFrame(frame) {
          const previous = {
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          try {
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = Math.max(0, Math.floor(Number(frame) || 0));
            game.frameLow = game.tick & 0xff;
            renderPause();
            return pausePresentation(game.frameLow);
          } finally {
            Object.assign(game, previous);
          }
        },

    });
  }

  return Object.freeze({ createPauseDiagnostics });
});
