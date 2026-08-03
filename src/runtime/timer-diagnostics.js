(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.timerDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Preserves each legacy adapter's receiver while building an explicit probe scope. */
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
      game: state.game
    };
  }

  /** Binds global-timer, shield-cadence, and enemy-freeze probes. */
  function createTimerDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      createTimerFreezeDiagnostics,
      game,
      gameSettings,
      isEnemyTimeFrozen,
      isGlobalTimerTick,
      isPlayerShieldVisible,
      preparePausedDebugBattle,
      shieldColorForTick,
      shouldSpawnEnemies,
      update
    } = scope;

    return Object.freeze({
        debugTimerRuleProbe() {
          const previousFreezeTimer = game.freezeTimer;
          game.freezeTimer = 1;
          const frozen = isEnemyTimeFrozen();
          const canSpawn = shouldSpawnEnemies();
          game.freezeTimer = previousFreezeTimer;
          return { frozen, canSpawn };
        },
        debugGlobalTimerCadenceProbe() {
          const countdownFrames = (units, startTick) => {
            let remaining = units;
            let tick = startTick;
            let frames = 0;
            while (remaining > 0 && frames < 100000) {
              tick += 1;
              frames += 1;
              if (isGlobalTimerTick(tick)) remaining -= 1;
            }
            return frames;
          };
          return {
            unitFrames: 64,
            boundaries: [62, 63, 64, 65, 127, 128].map((tick) => ({ tick, active: isGlobalTimerTick(tick) })),
            durations: { ...gameSettings().powerUpDurations },
            spawnShieldUnits: gameSettings().timings.playerInvulnerability,
            timerDisplayFrames: {
              phase0: countdownFrames(gameSettings().powerUpDurations.timer, 0),
              phase63: countdownFrames(gameSettings().powerUpDurations.timer, 63)
            },
            spawnShieldDisplayFrames: {
              phase0: countdownFrames(gameSettings().timings.playerInvulnerability, 0),
              phase63: countdownFrames(gameSettings().timings.playerInvulnerability, 63)
            }
          };
        },
        debugShieldCadenceProbe() {
          return Array.from({ length: 8 }, (_, tick) => ({ tick, color: shieldColorForTick(tick), visible: true }));
        },
        debugPausedShieldProbe() {
          const previous = { ...game };
          const player = { alive: true, lives: 1, respawn: 0, invuln: 2 };
          try {
            preparePausedDebugBattle(63);
            game.paused = false;
            game.players = [player];

            const activeVisible = isPlayerShieldVisible(player, game.paused);
            game.paused = true;
            const pausedVisible = isPlayerShieldVisible(player, game.paused);
            const beforePausedUpdate = { tick: game.tick, invuln: player.invuln };
            update();
            const afterPausedUpdate = {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              invuln: player.invuln
            };
            game.paused = false;
            const resumedVisible = isPlayerShieldVisible(player, game.paused);
            player.invuln = 0;
            const expiredVisible = isPlayerShieldVisible(player, game.paused);
            return { activeVisible, pausedVisible, resumedVisible, expiredVisible, beforePausedUpdate, afterPausedUpdate };
          } finally {
            Object.assign(game, previous);
          }
        },
        ...createTimerFreezeDiagnostics(scope)
    });
  }

  return Object.freeze({ createTimerDiagnostics });
});
