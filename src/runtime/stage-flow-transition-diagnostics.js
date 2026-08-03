(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowTransitionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds curtain-state, transition-advance, and stage-start-audio probes. */
  function createStageFlowTransitionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var clamp = scope.clamp;
    var createPlayer = scope.createPlayer;
    var FREE_AUDIO_MANIFEST = scope.FREE_AUDIO_MANIFEST;
    var game = scope.game;
    var movementAudio = scope.movementAudio;
    var pauseAudio = scope.pauseAudio;
    var render = scope.render;
    var stageIntroCurtainState = scope.stageIntroCurtainState;
    var stageResultDuration = scope.stageResultDuration;
    var stageSelectCurtainState = scope.stageSelectCurtainState;
    var stageStartAudio = scope.stageStartAudio;
    var STAGE_CURTAIN_CLOSE_FRAMES = scope.STAGE_CURTAIN_CLOSE_FRAMES;
    var update = scope.update;
    var updatePauseAudio = scope.updatePauseAudio;
    var updateStageStartAudio = scope.updateStageStartAudio;

    return Object.freeze({
      debugStageIntroCurtainProbe(timer) {
        return stageIntroCurtainState(timer);
      },
      debugStageSelectCurtainProbe(timer) {
        return stageSelectCurtainState(timer);
      },
      debugRenderStageClearClosingFrame(timer) {
        var previous = {
          screen: game.screen,
          stage: game.stage,
          playerCount: game.playerCount,
          transitionTimer: game.transitionTimer,
          players: game.players,
          stageResultReason: game.stageResultReason,
          stageClearElapsed: game.stageClearElapsed,
          stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
          stageClearBonusAwarded: game.stageClearBonusAwarded
        };
        try {
          var player = createPlayer(1);
          player.score = 12300;
          player.stageKills = [1, 2, 3, 4];
          game.screen = "stageClearClosing";
          game.stage = 1;
          game.playerCount = 1;
          game.transitionTimer = clamp(Math.floor(Number(timer) || 0), 0, STAGE_CURTAIN_CLOSE_FRAMES);
          game.players = [player];
          game.stageResultReason = "clear";
          game.stageClearElapsed = stageResultDuration(game.players);
          game.stageClearBonusPlayerIds = [];
          game.stageClearBonusAwarded = true;
          render();
          return stageSelectCurtainState();
        } finally {
          Object.assign(game, previous);
        }
      },
      debugAdvanceStageTransition(frames) {
        var count = Math.max(0, Math.floor(Number(frames) || 0));
        for (var index = 0; index < count; index += 1) {
          if (game.screen !== "stageSelectClosing" && game.screen !== "stageIntro") break;
          update();
        }
        return {
          screen: game.screen,
          transitionTimer: game.transitionTimer,
          stage: game.stage,
          players: game.players.length
        };
      },
      debugAdvanceStageSelect(frames) {
        var count = Math.max(0, Math.floor(Number(frames) || 0));
        for (var index = 0; index < count; index += 1) {
          if (game.screen !== "stageSelect") break;
          update();
        }
        return {
          screen: game.screen,
          stage: game.stage,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh
        };
      },
      debugAdvanceStageStartAudio(frames) {
        var count = Math.max(0, Math.floor(Number(frames) || 0));
        for (var index = 0; index < count; index += 1) {
          updateStageStartAudio();
          updatePauseAudio();
        }
        return {
          active: stageStartAudio.active,
          frame: stageStartAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.stageStart.durationFrames,
          movementAudioMode: movementAudio.mode,
          paused: game.paused,
          pauseAudioActive: pauseAudio.active,
          pauseAudioFrame: pauseAudio.frame
        };
      }
    });
  }

  return Object.freeze({
    createStageFlowTransitionDiagnostics: createStageFlowTransitionDiagnostics
  });
});
