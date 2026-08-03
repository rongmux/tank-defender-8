(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenFlowPostGameDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds high-score and full-screen Game Over probes. */
  function createScreenFlowPostGameDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var enterGameOver = scope.enterGameOver;
    var finishFullGameOverScreen = scope.finishFullGameOverScreen;
    var finishGameOverScreen = scope.finishGameOverScreen;
    var finishStageResult = scope.finishStageResult;
    var fixedFrameVoiceDuration = scope.fixedFrameVoiceDuration;
    var FREE_AUDIO_MANIFEST = scope.FREE_AUDIO_MANIFEST;
    var FULL_GAME_OVER_SCREEN_FRAMES = scope.FULL_GAME_OVER_SCREEN_FRAMES;
    var fullGameOverPresentation = scope.fullGameOverPresentation;
    var game = scope.game;
    var gameOverAudio = scope.gameOverAudio;
    var gameOverAudioPresentation = scope.gameOverAudioPresentation;
    var handleFullGameOverInput = scope.handleFullGameOverInput;
    var HIGH_SCORE_SCREEN_FRAMES = scope.HIGH_SCORE_SCREEN_FRAMES;
    var highScoreAudio = scope.highScoreAudio;
    var highScoreAudioPresentation = scope.highScoreAudioPresentation;
    var highScorePresentation = scope.highScorePresentation;
    var render = scope.render;
    var startFullGameOverScreen = scope.startFullGameOverScreen;
    var stopGameOverAudio = scope.stopGameOverAudio;
    var stopHighScoreAudio = scope.stopHighScoreAudio;
    var syncGameOverAudioNodes = scope.syncGameOverAudioNodes;
    var syncHighScoreAudioNodes = scope.syncHighScoreAudioNodes;
    var update = scope.update;

    return Object.freeze({
      debugHighScoreScreenProbe() {
        var previous = Object.assign({}, game);
        var previousGameOverAudio = {
          active: gameOverAudio.active,
          frame: gameOverAudio.frame
        };
        var previousHighScoreAudio = {
          active: highScoreAudio.active,
          frame: highScoreAudio.frame
        };
        try {
          var player = function (score) {
            return { id: 1, score: score, alive: false, respawn: 0, lives: 0 };
          };
          game.runHighScoreBaseline = 20000;
          game.highScore = 20000;
          game.players = [player(20000)];
          game.screen = "playing";
          enterGameOver();
          var tie = {
            triggered: game.newHighScoreAtGameOver,
            screen: game.screen
          };

          game.players = [player(20100)];
          game.highScore = 20100;
          game.screen = "playing";
          enterGameOver();
          var strictBeat = {
            triggered: game.newHighScoreAtGameOver,
            screen: game.screen
          };
          finishGameOverScreen();
          finishStageResult();
          finishFullGameOverScreen();
          var started = {
            screen: game.screen,
            elapsed: game.highScoreScreenElapsed,
            audioActive: highScoreAudio.active,
            audioFrame: highScoreAudio.frame
          };
          var paletteFrames = [0, 1, 2, 3, 4].map(function (frame) {
            return highScorePresentation(frame, 20100);
          });
          var sevenDigit = highScorePresentation(0, 1234567);
          game.highScoreScreenElapsed = HIGH_SCORE_SCREEN_FRAMES - 2;
          highScoreAudio.frame = HIGH_SCORE_SCREEN_FRAMES - 2;
          syncHighScoreAudioNodes();
          update();
          var beforeEnd = {
            screen: game.screen,
            elapsed: game.highScoreScreenElapsed,
            audioActive: highScoreAudio.active,
            audioFrame: highScoreAudio.frame
          };
          update();
          var afterEnd = {
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
          var belowRecord = {
            screen: game.screen,
            triggered: game.newHighScoreAtGameOver
          };
          return {
            duration: HIGH_SCORE_SCREEN_FRAMES,
            tie: tie,
            strictBeat: strictBeat,
            started: started,
            paletteFrames: paletteFrames,
            sevenDigit: sevenDigit,
            beforeEnd: beforeEnd,
            afterEnd: afterEnd,
            belowRecord: belowRecord
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
        var event = FREE_AUDIO_MANIFEST.events.highScore;
        var frames = [
          0, 4, 5, 9, 10, 129, 130, 159, 160, 174, 175, 179, 180, 209, 210, 239, 240,
          244, 245, 254, 255, 259, 260, 289, 290, 319, 320, 324, 325, 379, 380, 399,
          400, 459, 460
        ];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map(function (voice) { return voice.wave; }),
          frames: frames.map(function (frame) { return highScoreAudioPresentation(frame); })
        };
      },
      debugFullGameOverScreenProbe() {
        var previous = Object.assign({}, game);
        var previousAudio = {
          active: gameOverAudio.active,
          frame: gameOverAudio.frame
        };
        var previousHighScoreAudio = {
          active: highScoreAudio.active,
          frame: highScoreAudio.frame
        };
        try {
          game.newHighScoreAtGameOver = false;
          startFullGameOverScreen();
          var entry = {
            screen: game.screen,
            elapsed: game.fullGameOverElapsed,
            paused: game.paused,
            audioActive: gameOverAudio.active,
            audioFrame: gameOverAudio.frame
          };
          var presentation = fullGameOverPresentation(game.fullGameOverElapsed);
          game.fullGameOverElapsed = FULL_GAME_OVER_SCREEN_FRAMES - 2;
          gameOverAudio.frame = FULL_GAME_OVER_SCREEN_FRAMES - 2;
          syncGameOverAudioNodes();
          update();
          var beforeEnd = {
            screen: game.screen,
            elapsed: game.fullGameOverElapsed,
            audioActive: gameOverAudio.active,
            audioFrame: gameOverAudio.frame
          };
          update();
          var afterEnd = {
            screen: game.screen,
            elapsed: game.fullGameOverElapsed,
            audioActive: gameOverAudio.active,
            audioFrame: gameOverAudio.frame
          };

          game.newHighScoreAtGameOver = false;
          startFullGameOverScreen();
          var ignoredInput = {
            handled: handleFullGameOverInput("KeyA"),
            screen: game.screen
          };
          var startSkip = {
            handled: handleFullGameOverInput("Enter"),
            screen: game.screen,
            audioActive: gameOverAudio.active
          };

          game.newHighScoreAtGameOver = false;
          startFullGameOverScreen();
          var selectSkip = {
            handled: handleFullGameOverInput("Escape"),
            screen: game.screen,
            audioActive: gameOverAudio.active
          };

          game.newHighScoreAtGameOver = true;
          startFullGameOverScreen();
          finishFullGameOverScreen();
          var highScoreRoute = {
            screen: game.screen,
            elapsed: game.highScoreScreenElapsed,
            audioActive: gameOverAudio.active
          };
          return {
            duration: FULL_GAME_OVER_SCREEN_FRAMES,
            entry: entry,
            presentation: presentation,
            beforeEnd: beforeEnd,
            afterEnd: afterEnd,
            ignoredInput: ignoredInput,
            startSkip: startSkip,
            selectSkip: selectSkip,
            highScoreRoute: highScoreRoute
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
        var event = FREE_AUDIO_MANIFEST.events.gameOver;
        var frames = [
          0, 5, 6, 11, 12, 35, 36, 43, 44, 51, 52, 59, 60, 67, 68, 75, 76, 83, 84,
          107, 108
        ];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map(function (voice) { return voice.wave; }),
          frames: frames.map(function (frame) { return gameOverAudioPresentation(frame); })
        };
      },
      debugRenderFullGameOverFrame(frame) {
        var previous = {
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
        var previous = {
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
      }
    });
  }

  return Object.freeze({
    createScreenFlowPostGameDiagnostics: createScreenFlowPostGameDiagnostics
  });
});
