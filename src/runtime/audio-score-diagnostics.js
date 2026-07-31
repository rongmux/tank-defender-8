(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioScoreDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioScoreDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      scoreCountAudioPresentation,
      game,
      stageStartAudio,
      bonusLifeAudio,
      powerUpPickupAudio,
      powerUpAppearAudio,
      brickHitAudio,
      baseHitAudio,
      steelHitAudio,
      enemyHitAudio,
      enemyDestroyAudio,
      playerDestroyAudio,
      playerShootAudio,
      movementIceAudio,
      pauseAudio,
      scoreCountAudio,
      stageBonusAudio,
      stopMovementAudio,
      stopFixedFrameAudio,
      createStageResultProbePlayer,
      enemyTypeDefinitions,
      update,
      stageClearPresentation,
      stageResultVisibleKillCount,
      stopScoreCountAudio,
      createPlayer,
      startScoreCountAudio,
      startStage,
      syncStageStartAudioNodes,
      syncBonusLifeAudioNodes,
      syncPowerUpPickupAudioNodes,
      syncPowerUpAppearAudioNodes,
      syncBrickHitAudioNodes,
      syncBaseHitAudioNodes,
      syncSteelHitAudioNodes,
      syncEnemyHitAudioNodes,
      syncEnemyDestroyAudioNodes,
      syncPlayerDestroyAudioNodes,
      syncPlayerShootAudioNodes,
      syncMovementIceAudioNodes,
      syncPauseAudioNodes,
      syncScoreCountAudioNodes,
      syncStageBonusAudioNodes,
      syncMovementAudio,
    } = scope;

    return Object.freeze({
        debugScoreCountAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.scoreCount;
          const frames = [0, 1];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map((voice) => fixedFrameVoiceDuration(voice)),
            frames: frames.map((frame) => {
              const presentation = scoreCountAudioPresentation(frame);
              return {
                frame,
                voices: presentation.voices.map((voice) => voice
                  ? { frequency: voice.frequency, gain: voice.gain, wave: voice.wave }
                  : null)
              };
            })
          };
        },
        debugScoreCountAudioLifecycleProbe() {
          const previous = { ...game };
          const audioStates = [
            stageStartAudio,
            bonusLifeAudio,
            powerUpPickupAudio,
            powerUpAppearAudio,
            brickHitAudio,
            baseHitAudio,
            steelHitAudio,
            enemyHitAudio,
            enemyDestroyAudio,
            playerDestroyAudio,
            playerShootAudio,
            movementIceAudio,
            pauseAudio,
            scoreCountAudio,
            stageBonusAudio
          ];
          const previousAudio = audioStates.map((state) => ({ active: state.active, frame: state.frame }));
          const state = () => {
            const presentation = scoreCountAudioPresentation(scoreCountAudio.frame);
            return {
              active: scoreCountAudio.active,
              frame: scoreCountAudio.frame,
              voices: presentation.voices.map((voice) => voice
                ? { frequency: voice.frequency, wave: voice.wave }
                : null)
            };
          };
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "stageClear";
            game.paused = false;
            game.stageResultReason = "clear";
            game.stageClearBonusAwarded = true;
            game.stageClearBonusPlayerIds = [];
            game.stageClearElapsed = 31;
            game.transitionTimer = 999;
            game.players = [
              createStageResultProbePlayer(enemyTypeDefinitions(), 1, [2, 0, 0, 0], 0),
              createStageResultProbePlayer(enemyTypeDefinitions(), 2, [1, 0, 0, 0], 0)
            ];

            update();
            const firstPresentation = stageClearPresentation();
            const simultaneous = {
              ...state(),
              elapsed: game.stageClearElapsed,
              visibleKills: stageResultVisibleKillCount(firstPresentation)
            };
            update();
            const afterOneFrame = state();

            game.stageClearElapsed = 40;
            update();
            const nextCadence = {
              ...state(),
              elapsed: game.stageClearElapsed,
              visibleKills: stageResultVisibleKillCount(stageClearPresentation())
            };

            stopScoreCountAudio();
            game.players = [
              createStageResultProbePlayer(enemyTypeDefinitions(), 1, [0, 0, 0, 0], 0),
              createStageResultProbePlayer(enemyTypeDefinitions(), 2, [0, 0, 0, 0], 0)
            ];
            game.stageClearElapsed = 31;
            update();
            const zeroKills = state();

            game.players = [createPlayer(1)];
            startScoreCountAudio();
            startStage(game.stage);
            const stageCleanup = state();

            return { simultaneous, afterOneFrame, nextCadence, zeroKills, stageCleanup };
          } finally {
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            Object.assign(game, previous);
            audioStates.forEach((audioState, index) => {
              audioState.active = previousAudio[index].active;
              audioState.frame = previousAudio[index].frame;
            });
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncScoreCountAudioNodes();
            syncStageBonusAudioNodes();
            syncMovementAudio();
          }
        },
    });
  }

  return Object.freeze({
    createAudioScoreDiagnostics
  });
});
