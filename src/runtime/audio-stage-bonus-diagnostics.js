(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioStageBonusDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioStageBonusDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      stageBonusAudioPresentation,
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
      createPlayer,
      createStageResultProbePlayer,
      enemyTypeDefinitions,
      stageBonusAudioAudible,
      stopMovementAudio,
      stopFixedFrameAudio,
      stageClearBonusRecipients,
      stageClearPresentation,
      update,
      stopStageBonusAudio,
      stopBonusLifeAudio,
      startStageBonusAudio,
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
        debugStageBonusAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.stageBonus;
          const frames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 27, 28];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map((voice) => fixedFrameVoiceDuration(voice)),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => {
              const presentation = stageBonusAudioPresentation(frame);
              return {
                frame,
                voices: presentation.voices.map((voice) => voice
                  ? { frequency: voice.frequency, gain: voice.gain, wave: voice.wave }
                  : null)
              };
            })
          };
        },
        debugStageBonusAudioLifecycleProbe() {
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
          const makeResultPlayer = (id, kills) => {
            const player = createPlayer(id);
            return Object.assign(
              player,
              createStageResultProbePlayer(enemyTypeDefinitions(), id, kills, 0)
            );
          };
          const state = () => {
            const presentation = stageBonusAudioPresentation(stageBonusAudio.frame);
            return {
              active: stageBonusAudio.active,
              frame: stageBonusAudio.frame,
              frequency: presentation.voices[0] ? presentation.voices[0].frequency : null,
              audible: stageBonusAudio.active && Boolean(presentation.voices[0]) && stageBonusAudioAudible()
            };
          };
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "stageClear";
            game.paused = false;
            game.stageResultReason = "clear";
            game.stageClearBonusAwarded = false;
            game.transitionTimer = 999;
            game.players = [
              makeResultPlayer(1, [4, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
            const bonusRevealFrame = stageClearPresentation(game.players, 0).bonusRevealFrame;
            game.stageClearElapsed = bonusRevealFrame - 1;
            const scoreBefore = game.players[0].score;

            update();
            const awarded = {
              ...state(),
              elapsed: game.stageClearElapsed,
              recipients: game.stageClearBonusPlayerIds.slice(),
              scoreDelta: game.players[0].score - scoreBefore,
              bonusAwarded: game.stageClearBonusAwarded
            };
            for (let frame = 0; frame < 27; frame += 1) update();
            const finalFrame = state();
            update();
            const end = {
              ...state(),
              scoreDelta: game.players[0].score - scoreBefore
            };

            stopStageBonusAudio();
            stopBonusLifeAudio();
            game.players = [
              makeResultPlayer(1, [4, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.players[0].score = 19000;
            game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
            game.stageClearBonusAwarded = false;
            game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
            const thresholdScoreBefore = game.players[0].score;
            const thresholdLivesBefore = game.players[0].lives;
            update();
            const bonusLifePriority = {
              ...state(),
              bonusLifeActive: bonusLifeAudio.active,
              bonusLifeFrame: bonusLifeAudio.frame,
              scoreDelta: game.players[0].score - thresholdScoreBefore,
              livesDelta: game.players[0].lives - thresholdLivesBefore
            };

            stopStageBonusAudio();
            stopBonusLifeAudio();
            game.players = [
              makeResultPlayer(1, [3, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
            game.stageClearBonusAwarded = false;
            game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
            update();
            const tied = {
              ...state(),
              recipients: game.stageClearBonusPlayerIds.slice(),
              score: game.players[0].score + game.players[1].score
            };

            stopStageBonusAudio();
            game.players = [
              makeResultPlayer(1, [4, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.stageResultReason = "gameOver";
            game.stageClearBonusPlayerIds = [];
            game.stageClearBonusAwarded = false;
            game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
            update();
            const gameOver = {
              ...state(),
              bonusAwarded: game.stageClearBonusAwarded,
              score: game.players[0].score + game.players[1].score
            };

            game.players = [createPlayer(1)];
            startStageBonusAudio();
            startStage(game.stage);
            const stageCleanup = state();

            return { bonusRevealFrame, awarded, finalFrame, end, bonusLifePriority, tied, gameOver, stageCleanup };
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
    createAudioStageBonusDiagnostics
  });
});
