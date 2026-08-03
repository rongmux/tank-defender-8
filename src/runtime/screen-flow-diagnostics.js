(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenFlowDiagnostics = api;
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
      keys: state.keys,
      pendingStageSelectPresses: state.pendingStageSelectPresses,
      gameOverAudio: state.audio.gameOver,
      highScoreAudio: state.audio.highScore
    };
  }

  /** Binds title, stage-select, high-score, and full-screen game-over probes. */
  function createScreenFlowDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      advanceFrameCounters,
      applyPowerUp,
      clearTransientBattleState,
      DEMO_DISPLAY_STAGE,
      demoControlForPlayer,
      destroyEnemy,
      endTitleDemo,
      enemyTypeDefinitions,
      enterGameOver,
      exitEditorToTitle,
      EXTENDED_STAGE_END_FRAME_HIGH,
      finishFullGameOverScreen,
      finishGameOverScreen,
      finishStageResult,
      fixedFrameVoiceDuration,
      FREE_AUDIO_MANIFEST,
      FULL_GAME_OVER_SCREEN_FRAMES,
      fullGameOverPresentation,
      game,
      gameOverAudio,
      gameOverAudioPresentation,
      handleFullGameOverInput,
      hiddenMessagePresentation,
      HIDDEN_MESSAGE_A_PRESSES,
      HIDDEN_MESSAGE_B_PRESSES,
      HIDDEN_MESSAGE_END_FRAME,
      HIDDEN_MESSAGE_REQUIRED_VISITS,
      hiddenMessageTriggerReady,
      HIGH_SCORE_SCREEN_FRAMES,
      highScoreAudio,
      highScoreAudioPresentation,
      highScorePresentation,
      keys,
      makeOriginalConstructionGrid,
      maxActiveEnemies,
      pendingStageSelectPresses,
      PLAYER_GAME_OVER_STAGE_END_DELAY,
      POWERUP_SIZE,
      recordHiddenTitleInput,
      render,
      resetFrameCounterHigh,
      resetFrameCounterLow,
      resetFrameCounters,
      resetTitleIdleHighByte,
      createScreenFlowNavigationDiagnostics,
      createScreenFlowTitleDemoDiagnostics,
      stageSelectLimit,
      startFullGameOverScreen,
      startHiddenMessage,
      stopGameOverAudio,
      stopHighScoreAudio,
      syncGameOverAudioNodes,
      syncHighScoreAudioNodes,
      syncMovementAudio,
      TILE,
      TITLE_DEMO_IDLE_FRAMES,
      titleScoreLayout,
      update,
      updateStageSelectControls
    } = scope;

    return Object.freeze({
        ...createScreenFlowNavigationDiagnostics(scope),
        ...createScreenFlowTitleDemoDiagnostics(scope),
        debugHighScoreScreenProbe() {
          const previous = { ...game };
          const previousGameOverAudio = {
            active: gameOverAudio.active,
            frame: gameOverAudio.frame
          };
          const previousHighScoreAudio = {
            active: highScoreAudio.active,
            frame: highScoreAudio.frame
          };
          try {
            const player = (score) => ({ id: 1, score, alive: false, respawn: 0, lives: 0 });
            game.runHighScoreBaseline = 20000;
            game.highScore = 20000;
            game.players = [player(20000)];
            game.screen = "playing";
            enterGameOver();
            const tie = {
              triggered: game.newHighScoreAtGameOver,
              screen: game.screen
            };

            game.players = [player(20100)];
            game.highScore = 20100;
            game.screen = "playing";
            enterGameOver();
            const strictBeat = {
              triggered: game.newHighScoreAtGameOver,
              screen: game.screen
            };
            finishGameOverScreen();
            finishStageResult();
            finishFullGameOverScreen();
            const started = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              audioActive: highScoreAudio.active,
              audioFrame: highScoreAudio.frame
            };
            const paletteFrames = [0, 1, 2, 3, 4].map((frame) => highScorePresentation(frame, 20100));
            const sevenDigit = highScorePresentation(0, 1234567);
            game.highScoreScreenElapsed = HIGH_SCORE_SCREEN_FRAMES - 2;
            highScoreAudio.frame = HIGH_SCORE_SCREEN_FRAMES - 2;
            syncHighScoreAudioNodes();
            update();
            const beforeEnd = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              audioActive: highScoreAudio.active,
              audioFrame: highScoreAudio.frame
            };
            update();
            const afterEnd = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              triggered: game.newHighScoreAtGameOver,
              audioActive: highScoreAudio.active
            };

            game.players = [player(19900)];
            game.runHighScoreBaseline = 20000;
            game.screen = "playing";
            enterGameOver();
            finishGameOverScreen();
            finishStageResult();
            finishFullGameOverScreen();
            const belowRecord = {
              screen: game.screen,
              triggered: game.newHighScoreAtGameOver
            };
            return {
              duration: HIGH_SCORE_SCREEN_FRAMES,
              tie,
              strictBeat,
              started,
              paletteFrames,
              sevenDigit,
              beforeEnd,
              afterEnd,
              belowRecord
            };
          } finally {
            stopGameOverAudio();
            stopHighScoreAudio();
            Object.assign(game, previous);
            gameOverAudio.active = previousGameOverAudio.active;
            gameOverAudio.frame = previousGameOverAudio.frame;
            highScoreAudio.active = previousHighScoreAudio.active;
            highScoreAudio.frame = previousHighScoreAudio.frame;
            syncGameOverAudioNodes();
            syncHighScoreAudioNodes();
          }
        },
        debugHighScoreAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.highScore;
          const frames = [
            0, 4, 5, 9, 10, 129, 130, 159, 160, 174, 175, 179, 180, 209, 210, 239, 240,
            244, 245, 254, 255, 259, 260, 289, 290, 319, 320, 324, 325, 379, 380, 399,
            400, 459, 460
          ];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => highScoreAudioPresentation(frame))
          };
        },
        debugFullGameOverScreenProbe() {
          const previous = { ...game };
          const previousAudio = {
            active: gameOverAudio.active,
            frame: gameOverAudio.frame
          };
          const previousHighScoreAudio = {
            active: highScoreAudio.active,
            frame: highScoreAudio.frame
          };
          try {
            game.newHighScoreAtGameOver = false;
            startFullGameOverScreen();
            const entry = {
              screen: game.screen,
              elapsed: game.fullGameOverElapsed,
              paused: game.paused,
              audioActive: gameOverAudio.active,
              audioFrame: gameOverAudio.frame
            };
            const presentation = fullGameOverPresentation(game.fullGameOverElapsed);
            game.fullGameOverElapsed = FULL_GAME_OVER_SCREEN_FRAMES - 2;
            gameOverAudio.frame = FULL_GAME_OVER_SCREEN_FRAMES - 2;
            syncGameOverAudioNodes();
            update();
            const beforeEnd = {
              screen: game.screen,
              elapsed: game.fullGameOverElapsed,
              audioActive: gameOverAudio.active,
              audioFrame: gameOverAudio.frame
            };
            update();
            const afterEnd = {
              screen: game.screen,
              elapsed: game.fullGameOverElapsed,
              audioActive: gameOverAudio.active,
              audioFrame: gameOverAudio.frame
            };

            game.newHighScoreAtGameOver = false;
            startFullGameOverScreen();
            const ignoredInput = {
              handled: handleFullGameOverInput("KeyA"),
              screen: game.screen
            };
            const startSkip = {
              handled: handleFullGameOverInput("Enter"),
              screen: game.screen,
              audioActive: gameOverAudio.active
            };

            game.newHighScoreAtGameOver = false;
            startFullGameOverScreen();
            const selectSkip = {
              handled: handleFullGameOverInput("Escape"),
              screen: game.screen,
              audioActive: gameOverAudio.active
            };

            game.newHighScoreAtGameOver = true;
            startFullGameOverScreen();
            finishFullGameOverScreen();
            const highScoreRoute = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              audioActive: gameOverAudio.active
            };
            return {
              duration: FULL_GAME_OVER_SCREEN_FRAMES,
              entry,
              presentation,
              beforeEnd,
              afterEnd,
              ignoredInput,
              startSkip,
              selectSkip,
              highScoreRoute
            };
          } finally {
            stopGameOverAudio();
            stopHighScoreAudio();
            Object.assign(game, previous);
            gameOverAudio.active = previousAudio.active;
            gameOverAudio.frame = previousAudio.frame;
            highScoreAudio.active = previousHighScoreAudio.active;
            highScoreAudio.frame = previousHighScoreAudio.frame;
            syncGameOverAudioNodes();
            syncHighScoreAudioNodes();
          }
        },
        debugGameOverAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.gameOver;
          const frames = [0, 5, 6, 11, 12, 35, 36, 43, 44, 51, 52, 59, 60, 67, 68, 75, 76, 83, 84, 107, 108];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => gameOverAudioPresentation(frame))
          };
        },
        debugRenderFullGameOverFrame(frame) {
          const previous = {
            screen: game.screen,
            fullGameOverElapsed: game.fullGameOverElapsed
          };
          try {
            game.screen = "fullGameOver";
            game.fullGameOverElapsed = Math.max(0, Math.floor(Number(frame) || 0));
            render();
            return fullGameOverPresentation(game.fullGameOverElapsed);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderHighScoreFrame(frame, score) {
          const previous = {
            screen: game.screen,
            highScore: game.highScore,
            highScoreScreenElapsed: game.highScoreScreenElapsed
          };
          try {
            game.screen = "highScore";
            game.highScore = Math.max(0, Math.floor(Number(score) || 0));
            game.highScoreScreenElapsed = Math.max(0, Math.floor(Number(frame) || 0));
            render();
            return highScorePresentation(game.highScoreScreenElapsed, game.highScore);
          } finally {
            Object.assign(game, previous);
          }
        },
      });
  }

  return Object.freeze({ createScreenFlowDiagnostics });
});
