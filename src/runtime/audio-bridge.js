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

    // ── Audio init ───────────────────────────────────────────────────────────
    fn.initAudio = function () {
      if (!state.audioCtx && window.AudioContext) {
        state.audioCtx = new window.AudioContext();
      }
      if (state.audioCtx && state.audioCtx.state === "suspended") {
        state.audioCtx.resume();
      }
      fn.syncStageStartAudioNodes();
      fn.syncBonusLifeAudioNodes();
      fn.syncPowerUpPickupAudioNodes();
      fn.syncPowerUpAppearAudioNodes();
      fn.syncBrickHitAudioNodes();
      fn.syncBaseHitAudioNodes();
      fn.syncSteelHitAudioNodes();
      fn.syncEnemyHitAudioNodes();
      fn.syncEnemyDestroyAudioNodes();
      fn.syncPlayerDestroyAudioNodes();
      fn.syncPlayerShootAudioNodes();
      fn.syncMovementIceAudioNodes();
      fn.syncPauseAudioNodes();
      fn.syncScoreCountAudioNodes();
      fn.syncStageBonusAudioNodes();
      fn.syncGameOverAudioNodes();
      fn.syncHighScoreAudioNodes();
      fn.syncMovementAudio();
    };

    // ── Sequenced sound helpers ──────────────────────────────────────────────
    fn.trackSequencedSound = function (name, oscillator) {
      if (!name) return;
      var nodes = state.activeSequencedSounds.get(name);
      if (!nodes) {
        nodes = new Set();
        state.activeSequencedSounds.set(name, nodes);
      }
      nodes.add(oscillator);
      oscillator.onended = function () {
        nodes.delete(oscillator);
        if (nodes.size === 0 && state.activeSequencedSounds.get(name) === nodes) {
          state.activeSequencedSounds.delete(name);
        }
      };
    };

    fn.stopSound = function (name) {
      var nodes = state.activeSequencedSounds.get(name);
      if (!nodes) return;
      state.activeSequencedSounds.delete(name);
      nodes.forEach(function (oscillator) {
        try {
          oscillator.stop(state.audioCtx ? state.audioCtx.currentTime : 0);
        } catch (_error) {
          // A naturally ended oscillator no longer needs to be stopped.
        }
      });
    };

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

    // ── Beep / playSound ─────────────────────────────────────────────────────
    fn.beep = function (freq, duration, gain, type, delay, sequenceName) {
      if (!state.audioCtx) return;
      var now = state.audioCtx.currentTime + Math.max(0, Number(delay) || 0);
      var osc = state.audioCtx.createOscillator();
      var vol = state.audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = type || "square";
      vol.gain.setValueAtTime(gain || 0.025, now);
      vol.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(vol).connect(state.audioCtx.destination);
      fn.trackSequencedSound(sequenceName, osc);
      osc.start(now);
      osc.stop(now + duration);
    };

    fn.playSoundVoice = function (name, voice, defaults) {
      var notes = Array.isArray(voice.notes) ? voice.notes : [];
      var repeat = Math.max(1, Math.floor(Number(voice.repeat != null ? voice.repeat : defaults.repeat) || 1));
      var noteFrames = Array.isArray(voice.noteFrames) && voice.noteFrames.length === notes.length
        ? voice.noteFrames.map(function (frames) { return Math.max(1, Math.floor(Number(frames) || 1)); })
        : null;
      var step = Math.max(0.01, Number(voice.step != null ? voice.step : defaults.step) || 0.2);
      var noteDuration = Number(voice.noteDuration != null ? voice.noteDuration : defaults.noteDuration) || step * 0.7;
      var gain = Number(voice.gain != null ? voice.gain : defaults.gain) || 0.025;
      var wave = voice.wave || defaults.wave;
      if (noteFrames) {
        var phraseDuration = noteFrames.reduce(function (sum, frames) { return sum + frames; }, 0) / 60;
        for (var loop = 0; loop < repeat; loop += 1) {
          var offset = loop * phraseDuration;
          for (var index = 0; index < notes.length; index += 1) {
            var frequency = Number(notes[index]);
            var duration = noteFrames[index] / 60;
            if (frequency > 0) fn.beep(frequency, duration, gain, wave, offset, name);
            offset += duration;
          }
        }
        return;
      }
      for (var loop2 = 0; loop2 < repeat; loop2 += 1) {
        for (var index2 = 0; index2 < notes.length; index2 += 1) {
          var frequency2 = Number(notes[index2]);
          if (!(frequency2 > 0)) continue;
          var offset2 = (loop2 * notes.length + index2) * step;
          fn.beep(frequency2, noteDuration, gain, wave, offset2, name);
        }
      }
    };

    fn.playSound = function (name, options) {
      var event = deps.FREE_AUDIO_MANIFEST.events[name];
      if (!event) return;
      // Fixed-frame event redirects
      var redirects = {
        brickHit: fn.startBrickHitAudio,
        steelHit: fn.startSteelHitAudio,
        enemyHit: fn.startEnemyHitAudio,
        enemyDestroy: fn.startEnemyDestroyAudio,
        baseHit: fn.startBaseHitAudio,
        playerDestroy: fn.startPlayerDestroyAudio,
        playerShoot: fn.startPlayerShootAudio,
        movementIce: fn.startMovementIceAudio,
        bonusLife: fn.startBonusLifeAudio,
        powerUp: fn.startPowerUpPickupAudio,
        powerUpAppear: fn.startPowerUpAppearAudio,
        pause: fn.startPauseAudio,
        scoreCount: fn.startScoreCountAudio,
        stageBonus: fn.startStageBonusAudio,
        gameOver: fn.startGameOverAudio,
        highScore: fn.startHighScoreAudio
      };
      if (redirects[name]) {
        redirects[name]();
        return;
      }
      var opts = options || {};
      if (Array.isArray(event.voices) && event.voices.length) {
        fn.stopSound(name);
        for (var i = 0; i < event.voices.length; i += 1) fn.playSoundVoice(name, event.voices[i], event);
        return;
      }
      if (Array.isArray(event.notes) && event.notes.length) {
        fn.stopSound(name);
        fn.playSoundVoice(name, event, event);
        return;
      }
      var pitch = opts.brush === undefined ? 0 : Number(opts.brush) * (event.brushPitch || 0);
      fn.beep(event.freq + pitch, event.duration, event.gain, event.wave);
    };

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
