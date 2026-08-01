(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioBridge = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function setupAudioBridge(state, deps) {
    var fn = state.fn;

    // ── Create fixed-frame audio states ──────────────────────────────────────
    if (!state.audio) {
      state.audio = {
        movementIce: deps.createFixedFrameAudioState(),
        playerShoot: deps.createFixedFrameAudioState(),
        steelHit: deps.createFixedFrameAudioState(),
        enemyHit: deps.createFixedFrameAudioState(),
        enemyDestroy: deps.createFixedFrameAudioState(),
        playerDestroy: deps.createFixedFrameAudioState(),
        baseHit: deps.createFixedFrameAudioState(),
        brickHit: deps.createFixedFrameAudioState(),
        stageStart: deps.createFixedFrameAudioState(),
        bonusLife: deps.createFixedFrameAudioState(),
        powerUpPickup: deps.createFixedFrameAudioState(),
        powerUpAppear: deps.createFixedFrameAudioState(),
        pause: deps.createFixedFrameAudioState(),
        scoreCount: deps.createFixedFrameAudioState(),
        stageBonus: deps.createFixedFrameAudioState(),
        gameOver: deps.createFixedFrameAudioState(),
        highScore: deps.createFixedFrameAudioState()
      };
    }

    deps.requireRuntimeModule("audioFixedFrameRuntime").setupAudioFixedFrameRuntime(state, deps);

    // ── Fixed-frame audio infrastructure ─────────────────────────────────────
    // ── Audio mix state ──────────────────────────────────────────────────────
    fn.currentAudioMixState = function () {
      return {
        screen: state.game.screen, paused: state.game.paused,
        clearPendingTimer: state.game.clearPendingTimer, baseDestroyTimer: state.game.baseDestroyTimer,
        bonusLifePulse1Active: fn.bonusLifePulse1Active(), bonusLifePulse2Active: fn.bonusLifePulse2Active(),
        active: {
          pause: state.audio.pause.active, stageStart: state.audio.stageStart.active,
          powerUpPickup: state.audio.powerUpPickup.active, powerUpAppear: state.audio.powerUpAppear.active,
          baseHit: state.audio.baseHit.active, steelHit: state.audio.steelHit.active, enemyHit: state.audio.enemyHit.active,
          playerDestroy: state.audio.playerDestroy.active, playerShoot: state.audio.playerShoot.active
        }
      };
    };

    fn.currentAudioAudibility = function () {
      return deps.resolveAudioAudibility(fn.currentAudioMixState());
    };

    deps.requireRuntimeModule("audioChannelRuntime").setupAudioChannelRuntime(state, deps);
    deps.requireRuntimeModule("audioMovementRuntime").setupAudioMovementRuntime(state, deps);
    deps.requireRuntimeModule("audioVoiceRuntime").setupAudioVoiceRuntime(state, deps);

    var AUDIO_UPDATE_METHODS = Object.freeze([
      "updateStageStartAudio",
      "updateBonusLifeAudio",
      "updatePowerUpPickupAudio",
      "updatePowerUpAppearAudio",
      "updateBrickHitAudio",
      "updateBaseHitAudio",
      "updateSteelHitAudio",
      "updateEnemyHitAudio",
      "updateEnemyDestroyAudio",
      "updatePlayerDestroyAudio",
      "updatePlayerShootAudio",
      "updateMovementIceAudio",
      "updatePauseAudio",
      "updateScoreCountAudio",
      "updateStageBonusAudio",
      "updateGameOverAudio",
      "updateHighScoreAudio"
    ]);
    var GAMEPLAY_STOP_METHODS = Object.freeze([
      "stopMovementAudio",
      "stopStageStartAudio",
      "stopBonusLifeAudio",
      "stopPowerUpPickupAudio",
      "stopPowerUpAppearAudio",
      "stopPauseAudio",
      "stopBrickHitAudio",
      "stopEnemyHitAudio",
      "stopBaseHitAudio",
      "stopEnemyDestroyAudio",
      "stopPlayerDestroyAudio",
      "stopSteelHitAudio",
      "stopPlayerShootAudio",
      "stopMovementIceAudio",
      "stopScoreCountAudio",
      "stopStageBonusAudio"
    ]);
    var ALL_STOP_METHODS = Object.freeze(GAMEPLAY_STOP_METHODS.concat([
      "stopGameOverAudio",
      "stopHighScoreAudio"
    ]));

    function callAudioMethods(methods) {
      for (var index = 0; index < methods.length; index += 1) {
        fn[methods[index]]();
      }
    }

    fn.updateAllAudio = function () {
      callAudioMethods(AUDIO_UPDATE_METHODS);
    };

    fn.stopGameplayAudioBeforeResult = function () {
      callAudioMethods(GAMEPLAY_STOP_METHODS);
    };

    fn.stopStageResultAudio = function () {
      fn.stopScoreCountAudio();
      fn.stopStageBonusAudio();
    };

    fn.stopAllAudio = function () {
      callAudioMethods(ALL_STOP_METHODS);
    };
  }

  return { setupAudioBridge: setupAudioBridge };
});
