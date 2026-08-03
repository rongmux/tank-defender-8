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
        debugTitleDemoLifecycleProbe() {
          const previous = { ...game };
          try {
            game.screen = "title";
            game.stage = 1;
            game.titleIdleFrames = 0;
            resetFrameCounters();
            game.demoMode = false;
            game.constructionUsed = false;
            clearTransientBattleState();
            game.screen = "title";

            game.frameLow = 0xab;
            game.frameHigh = 0x05;
            game.titleIdleFrames = 0x05ab;
            resetTitleIdleHighByte();
            const selectionReset = {
              idleFrames: game.titleIdleFrames,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh
            };
            resetFrameCounters();
            game.titleIdleFrames = 0;

            for (let frame = 0; frame < TITLE_DEMO_IDLE_FRAMES - 1; frame += 1) update();
            const beforeTimeout = {
              screen: game.screen,
              idleFrames: game.titleIdleFrames,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              demoMode: game.demoMode
            };
            update();
            const afterTimeout = {
              screen: game.screen,
              stage: game.stage,
              playerCount: game.playerCount,
              playerIds: game.players.map((player) => player.id),
              maxActiveEnemies: maxActiveEnemies(),
              transitionTimer: game.transitionTimer,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              demoMode: game.demoMode
            };

            const player1 = game.players[0];
            const player2 = game.players[1];
            player1.spawnFlash = 0;
            player2.spawnFlash = 0;
            player1.x = 80;
            player1.y = 160;
            player2.x = 112;
            player2.y = 160;
            game.enemies = [
              { id: 202, slotIndex: 2, alive: true, spawnFlash: 0, x: 32, y: 32, w: 14, h: 14 },
              { id: 203, slotIndex: 3, alive: true, spawnFlash: 0, x: 160, y: 32, w: 14, h: 14 },
              { id: 204, slotIndex: 4, alive: true, spawnFlash: 0, x: 96, y: 48, w: 14, h: 14 }
            ];
            game.powerUp = null;
            const enemyTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
            game.frameHigh = 2;
            const axisPhaseTwoTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
            game.powerUp = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
            const powerUpTarget = demoControlForPlayer(player1);

            player1.score = 0;
            player1.stagePoints = 0;
            player1.level = 0;
            player1.stageKills = Array(enemyTypeDefinitions().length).fill(0);
            game.scorePopups = [];
            applyPowerUp(player1, "star");
            const scoredEnemy = {
              id: 299,
              alive: true,
              score: 400,
              typeIndex: 3,
              x: 80,
              y: 80,
              w: 14,
              h: 14
            };
            destroyEnemy(scoredEnemy, player1.id);
            const scoreIsolation = {
              score: player1.score,
              stagePoints: player1.stagePoints,
              stageKills: player1.stageKills.slice(),
              level: player1.level,
              scorePopupCount: game.scorePopups.length
            };

            endTitleDemo();
            const afterExit = {
              screen: game.screen,
              stage: game.stage,
              demoMode: game.demoMode,
              playerCount: game.players.length,
              idleFrames: game.titleIdleFrames
            };

            game.constructionUsed = true;
            game.frameLow = 0x3f;
            game.frameHigh = 0x09;
            game.titleIdleFrames = TITLE_DEMO_IDLE_FRAMES - 1;
            update();
            const afterConstruction = {
              screen: game.screen,
              idleFrames: game.titleIdleFrames,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              demoMode: game.demoMode
            };
            return {
              timeoutFrames: TITLE_DEMO_IDLE_FRAMES,
              displayStage: DEMO_DISPLAY_STAGE,
              selectionReset,
              beforeTimeout,
              afterTimeout,
              enemyTargets,
              axisPhaseTwoTargets,
              powerUpTarget,
              scoreIsolation,
              afterExit,
              afterConstruction
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugHiddenMessageLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = new Set(keys);
          try {
            game.screen = "editor";
            game.titleMenu = 2;
            game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS - 1;
            game.constructionUsed = true;
            game.hiddenInputCount = 0;
            if (!game.editorGrid) game.editorGrid = makeOriginalConstructionGrid();
            exitEditorToTitle();
            const afterSeventhExit = {
              screen: game.screen,
              visits: game.constructionVisits,
              constructionUsed: game.constructionUsed,
              inputCount: game.hiddenInputCount
            };

            keys.clear();
            keys.add("ArrowDown");
            for (let press = 0; press < HIDDEN_MESSAGE_A_PRESSES; press += 1) recordHiddenTitleInput("KeyF");
            const afterA = game.hiddenInputCount;
            keys.delete("ArrowDown");
            keys.add("ArrowRight");
            for (let press = 0; press < HIDDEN_MESSAGE_B_PRESSES; press += 1) recordHiddenTitleInput("KeyG");
            const afterB = game.hiddenInputCount;
            const triggerReady = hiddenMessageTriggerReady();

            startHiddenMessage();
            const presentations = [127, 128, 320, 383, 384, 640, 641, 668, 669, 886]
              .map((frame) => hiddenMessagePresentation(frame));
            game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
            update();
            const afterCutscene = {
              screen: game.screen,
              visits: game.constructionVisits,
              elapsed: game.hiddenMessageElapsed,
              inputCount: game.hiddenInputCount
            };
            game.constructionVisits = 0xff;
            exitEditorToTitle();
            const wrappedVisits = game.constructionVisits;
            game.titleMenu = 0;
            game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS;
            game.hiddenInputCount = 0x74;
            startHiddenMessage();
            game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
            update();
            const alternateSelection = {
              screen: game.screen,
              players: game.stageSelectPlayers
            };
            return {
              requiredVisits: HIDDEN_MESSAGE_REQUIRED_VISITS,
              requiredAPresses: HIDDEN_MESSAGE_A_PRESSES,
              requiredBPresses: HIDDEN_MESSAGE_B_PRESSES,
              expectedInputCount: 0x74,
              endFrame: HIDDEN_MESSAGE_END_FRAME,
              afterSeventhExit,
              afterA,
              afterB,
              triggerReady,
              presentations,
              afterCutscene,
              wrappedVisits,
              alternateSelection
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
          }
        },
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
