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
    fn.fixedFrameAudioPresentation = function (eventName, frame) {
      return deps.fixedFrameAudioPresentation(deps.FREE_AUDIO_MANIFEST.events[eventName], frame);
    };

    fn.shortNoiseBuffer = function (clockRate) {
      if (!state.audioCtx || typeof state.audioCtx.createBuffer !== "function") return null;
      var sampleRate = Math.max(8000, Math.floor(Number(state.audioCtx.sampleRate) || 44100));
      var normalizedClockRate = Math.max(1, Math.floor(Number(clockRate) || 27965));
      var cache = state.noiseBufferCache;
      if (
        cache.shortBuffer &&
        cache.shortSampleRate === sampleRate &&
        cache.shortClockRate === normalizedClockRate
      ) return cache.shortBuffer;

      var lfsrPeriod = 93;
      var sampleCount = Math.max(2, Math.round(sampleRate * lfsrPeriod / normalizedClockRate));
      var buffer = state.audioCtx.createBuffer(1, sampleCount, sampleRate);
      var samples = buffer.getChannelData(0);
      var lfsr = 1;
      var currentStep = -1;
      for (var index = 0; index < sampleCount; index += 1) {
        var targetStep = Math.floor(index * normalizedClockRate / sampleRate);
        while (currentStep < targetStep) {
          var feedback = (lfsr & 1) ^ ((lfsr >> 6) & 1);
          lfsr = (lfsr >> 1) | (feedback << 14);
          currentStep += 1;
        }
        samples[index] = (lfsr & 1) ? 1 : -1;
      }
      cache.shortBuffer = buffer;
      cache.shortSampleRate = sampleRate;
      cache.shortClockRate = normalizedClockRate;
      return buffer;
    };

    fn.longNoiseBuffer = function (clockRate) {
      if (!state.audioCtx || typeof state.audioCtx.createBuffer !== "function") return null;
      var sampleRate = Math.max(8000, Math.floor(Number(state.audioCtx.sampleRate) || 44100));
      var normalizedClockRate = Math.max(1, Math.floor(Number(clockRate) || 3523));
      var cache = state.noiseBufferCache;
      if (
        cache.longBuffer &&
        cache.longSampleRate === sampleRate &&
        cache.longClockRate === normalizedClockRate
      ) return cache.longBuffer;

      var lfsrPeriod = 32767;
      var sampleCount = Math.max(2, Math.round(sampleRate * lfsrPeriod / normalizedClockRate));
      var buffer = state.audioCtx.createBuffer(1, sampleCount, sampleRate);
      var samples = buffer.getChannelData(0);
      var lfsr = 1;
      var currentStep = -1;
      for (var index = 0; index < sampleCount; index += 1) {
        var targetStep = Math.floor(index * normalizedClockRate / sampleRate);
        while (currentStep < targetStep) {
          var feedback = (lfsr & 1) ^ ((lfsr >> 1) & 1);
          lfsr = (lfsr >> 1) | (feedback << 14);
          currentStep += 1;
        }
        samples[index] = (lfsr & 1) ? 1 : -1;
      }
      cache.longBuffer = buffer;
      cache.longSampleRate = sampleRate;
      cache.longClockRate = normalizedClockRate;
      return buffer;
    };

    fn.createFixedFrameAudioSource = function (voice) {
      if (
        (voice.wave === "noise-short" || voice.wave === "noise-long") &&
        state.audioCtx &&
        typeof state.audioCtx.createBufferSource === "function"
      ) {
        var buffer = voice.wave === "noise-short"
          ? fn.shortNoiseBuffer(voice.frequency)
          : fn.longNoiseBuffer(voice.frequency);
        if (buffer) {
          var source = state.audioCtx.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          return source;
        }
      }
      var oscillator = state.audioCtx.createOscillator();
      oscillator.type = voice.wave === "noise-short" || voice.wave === "noise-long" ? "square" : voice.wave;
      oscillator.frequency.value = voice.frequency;
      return oscillator;
    };

    fn.stopFixedFrameAudioNodes = function (audioState) {
      for (var i = 0; i < audioState.nodes.length; i += 1) {
        var node = audioState.nodes[i];
        if (!node) continue;
        try {
          node.source.stop(state.audioCtx ? state.audioCtx.currentTime : 0);
        } catch (_error) {
          // Pausing or leaving a screen discards these nodes; resume creates fresh ones.
        }
      }
      audioState.nodes = [];
    };

    fn.syncFixedFrameAudioNodes = function (audioState, eventName, audible, runsWhilePaused) {
      if (!state.audioCtx || !audioState.active || (state.game.paused && !runsWhilePaused)) {
        fn.stopFixedFrameAudioNodes(audioState);
        return;
      }
      var presentation = fn.fixedFrameAudioPresentation(eventName, audioState.frame);
      if (audioState.nodes.length !== presentation.voices.length) {
        fn.stopFixedFrameAudioNodes(audioState);
        audioState.nodes = Array(presentation.voices.length).fill(null);
      }
      presentation.voices.forEach(function (presentedVoice, index) {
        var voice = deps.fixedFrameVoiceIsAudible(audible, index) ? presentedVoice : null;
        var node = audioState.nodes[index];
        if (!voice) {
          if (node) {
            try {
              node.source.stop(state.audioCtx.currentTime);
            } catch (_error) {
              // A voice that ended on the previous frame is already silent.
            }
            audioState.nodes[index] = null;
          }
          return;
        }
        if (!node) {
          var newSource = fn.createFixedFrameAudioSource(voice);
          var gain = state.audioCtx.createGain();
          gain.gain.value = voice.gain;
          newSource.connect(gain);
          gain.connect(state.audioCtx.destination);
          newSource.start();
          node = { source: newSource, gain: gain };
          audioState.nodes[index] = node;
        }
        if (node.source.frequency) node.source.frequency.value = voice.frequency;
        node.gain.gain.value = voice.gain;
      });
    };

    fn.startFixedFrameAudio = function (audioState, eventName, audible, runsWhilePaused) {
      fn.stopFixedFrameAudioNodes(audioState);
      deps.beginFixedFrameAudioState(audioState);
      fn.syncMovementAudio();
      fn.syncFixedFrameAudioNodes(audioState, eventName, audible, runsWhilePaused);
    };

    fn.stopFixedFrameAudio = function (audioState) {
      deps.resetFixedFrameAudioState(audioState);
      fn.stopFixedFrameAudioNodes(audioState);
    };

    fn.updateFixedFrameAudio = function (audioState, eventName, audible, runsWhilePaused) {
      var updateMode = deps.fixedFrameAudioUpdateMode(audioState, state.game.paused, runsWhilePaused);
      if (updateMode === deps.FIXED_FRAME_AUDIO_UPDATE_MODE.INACTIVE) return;
      if (updateMode === deps.FIXED_FRAME_AUDIO_UPDATE_MODE.HELD) {
        fn.syncFixedFrameAudioNodes(audioState, eventName, audible, runsWhilePaused);
        return;
      }
      var durationFrames = fn.fixedFrameAudioPresentation(eventName, audioState.frame).durationFrames;
      if (deps.advanceFixedFrameAudioState(audioState, durationFrames)) {
        fn.stopFixedFrameAudioNodes(audioState);
        fn.syncMovementAudio();
        return;
      }
      fn.syncFixedFrameAudioNodes(audioState, eventName, audible, runsWhilePaused);
      fn.syncMovementAudio();
    };

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

    // ── Per-event audio helpers (generated pattern) ──────────────────────────

    // stageStart
    fn.stageStartAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("stageStart", frame); };
    fn.stageStartAudioAudibility = function () { return fn.currentAudioAudibility().stageStartAudibility; };
    fn.syncStageStartAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.stageStart, "stageStart", fn.stageStartAudioAudibility()); };
    fn.startStageStartAudio = function () { fn.startFixedFrameAudio(state.audio.stageStart, "stageStart"); fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };
    fn.stopStageStartAudio = function () { fn.stopFixedFrameAudio(state.audio.stageStart); fn.syncBaseHitAudioNodes(); };
    fn.updateStageStartAudio = function () { fn.updateFixedFrameAudio(state.audio.stageStart, "stageStart"); fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };

    // bonusLife
    fn.bonusLifeAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("bonusLife", frame); };
    fn.bonusLifeAudioAudibility = function () { return fn.currentAudioAudibility().bonusLifeAudibility; };
    fn.syncBonusLifeAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.bonusLife, "bonusLife", fn.bonusLifeAudioAudibility()); };
    fn.startBonusLifeAudio = function () { fn.startFixedFrameAudio(state.audio.bonusLife, "bonusLife"); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes(); fn.syncStageBonusAudioNodes(); };
    fn.stopBonusLifeAudio = function () { fn.stopFixedFrameAudio(state.audio.bonusLife); fn.syncBaseHitAudioNodes(); fn.syncStageBonusAudioNodes(); };
    fn.updateBonusLifeAudio = function () { fn.updateFixedFrameAudio(state.audio.bonusLife, "bonusLife"); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes(); fn.syncStageBonusAudioNodes(); };
    fn.bonusLifePulse1Active = function () { return state.audio.bonusLife.active && Boolean(fn.bonusLifeAudioPresentation(state.audio.bonusLife.frame).voices[0]); };
    fn.bonusLifePulse2Active = function () { return state.audio.bonusLife.active && Boolean(fn.bonusLifeAudioPresentation(state.audio.bonusLife.frame).voices[1]); };

    // powerUpPickup
    fn.powerUpPickupAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("powerUp", frame); };
    fn.powerUpPickupAudioAudible = function () { return fn.currentAudioAudibility().powerUpPickupAudible; };
    fn.syncPowerUpPickupAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.powerUpPickup, "powerUp", fn.powerUpPickupAudioAudible()); };
    fn.startPowerUpPickupAudio = function () { fn.startFixedFrameAudio(state.audio.powerUpPickup, "powerUp", fn.powerUpPickupAudioAudible()); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };
    fn.stopPowerUpPickupAudio = function () { fn.stopFixedFrameAudio(state.audio.powerUpPickup); fn.syncBaseHitAudioNodes(); };
    fn.updatePowerUpPickupAudio = function () { fn.updateFixedFrameAudio(state.audio.powerUpPickup, "powerUp", fn.powerUpPickupAudioAudible()); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };

    // powerUpAppear
    fn.powerUpAppearAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("powerUpAppear", frame); };
    fn.powerUpAppearAudioAudible = function () { return fn.currentAudioAudibility().powerUpAppearAudible; };
    fn.syncPowerUpAppearAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.powerUpAppear, "powerUpAppear", fn.powerUpAppearAudioAudible()); };
    fn.startPowerUpAppearAudio = function () { fn.startFixedFrameAudio(state.audio.powerUpAppear, "powerUpAppear", fn.powerUpAppearAudioAudible()); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };
    fn.stopPowerUpAppearAudio = function () { fn.stopFixedFrameAudio(state.audio.powerUpAppear); fn.syncBaseHitAudioNodes(); };
    fn.updatePowerUpAppearAudio = function () { fn.updateFixedFrameAudio(state.audio.powerUpAppear, "powerUpAppear", fn.powerUpAppearAudioAudible()); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };

    // brickHit
    fn.brickHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("brickHit", frame); };
    fn.brickHitAudioAudible = function () { return fn.currentAudioAudibility().brickHitAudible; };
    fn.syncBrickHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.brickHit, "brickHit", fn.brickHitAudioAudible()); };
    fn.startBrickHitAudio = function () { fn.startFixedFrameAudio(state.audio.brickHit, "brickHit", fn.brickHitAudioAudible()); };
    fn.stopBrickHitAudio = function () { fn.stopFixedFrameAudio(state.audio.brickHit); };
    fn.updateBrickHitAudio = function () { fn.updateFixedFrameAudio(state.audio.brickHit, "brickHit", fn.brickHitAudioAudible()); };

    // baseHit
    fn.baseHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("baseHit", frame); };
    fn.baseHitAudioAudible = function () { return fn.currentAudioAudibility().baseHitAudible; };
    fn.syncBaseHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.baseHit, "baseHit", fn.baseHitAudioAudible()); };
    fn.syncLowerPriorityPulse2AudioNodes = function () { fn.syncStageBonusAudioNodes(); };
    fn.startBaseHitAudio = function () { fn.startFixedFrameAudio(state.audio.baseHit, "baseHit", fn.baseHitAudioAudible()); fn.syncStageBonusAudioNodes(); };
    fn.stopBaseHitAudio = function () { fn.stopFixedFrameAudio(state.audio.baseHit); fn.syncStageBonusAudioNodes(); };
    fn.updateBaseHitAudio = function () { fn.updateFixedFrameAudio(state.audio.baseHit, "baseHit", fn.baseHitAudioAudible()); fn.syncStageBonusAudioNodes(); };

    // steelHit
    fn.steelHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("steelHit", frame); };
    fn.steelHitAudioAudible = function () { return fn.currentAudioAudibility().steelHitAudible; };
    fn.syncSteelHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.steelHit, "steelHit", fn.steelHitAudioAudible()); };
    fn.startSteelHitAudio = function () { fn.startFixedFrameAudio(state.audio.steelHit, "steelHit", fn.steelHitAudioAudible()); };
    fn.stopSteelHitAudio = function () { fn.stopFixedFrameAudio(state.audio.steelHit); };
    fn.updateSteelHitAudio = function () { fn.updateFixedFrameAudio(state.audio.steelHit, "steelHit", fn.steelHitAudioAudible()); };

    // enemyHit
    fn.enemyHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("enemyHit", frame); };
    fn.enemyHitAudioAudible = function () { return fn.currentAudioAudibility().enemyHitAudible; };
    fn.syncEnemyHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.enemyHit, "enemyHit", fn.enemyHitAudioAudible()); };
    fn.startEnemyHitAudio = function () { fn.startFixedFrameAudio(state.audio.enemyHit, "enemyHit", fn.enemyHitAudioAudible()); };
    fn.stopEnemyHitAudio = function () { fn.stopFixedFrameAudio(state.audio.enemyHit); };
    fn.updateEnemyHitAudio = function () { fn.updateFixedFrameAudio(state.audio.enemyHit, "enemyHit", fn.enemyHitAudioAudible()); };

    // enemyDestroy
    fn.enemyDestroyAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("enemyDestroy", frame); };
    fn.enemyDestroyAudioAudible = function () { return fn.currentAudioAudibility().enemyDestroyAudible; };
    fn.syncEnemyDestroyAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.enemyDestroy, "enemyDestroy", fn.enemyDestroyAudioAudible()); };
    fn.startEnemyDestroyAudio = function () { fn.startFixedFrameAudio(state.audio.enemyDestroy, "enemyDestroy", fn.enemyDestroyAudioAudible()); };
    fn.stopEnemyDestroyAudio = function () { fn.stopFixedFrameAudio(state.audio.enemyDestroy); };
    fn.updateEnemyDestroyAudio = function () { fn.updateFixedFrameAudio(state.audio.enemyDestroy, "enemyDestroy", fn.enemyDestroyAudioAudible()); };

    // playerDestroy
    fn.playerDestroyAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("playerDestroy", frame); };
    fn.syncPlayerDestroyAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.playerDestroy, "playerDestroy", true); };
    fn.startPlayerDestroyAudio = function () { fn.startFixedFrameAudio(state.audio.playerDestroy, "playerDestroy", true); fn.syncEnemyDestroyAudioNodes(); };
    fn.stopPlayerDestroyAudio = function () { fn.stopFixedFrameAudio(state.audio.playerDestroy); fn.syncEnemyDestroyAudioNodes(); };
    fn.updatePlayerDestroyAudio = function () { fn.updateFixedFrameAudio(state.audio.playerDestroy, "playerDestroy", true); fn.syncEnemyDestroyAudioNodes(); };

    // playerShoot
    fn.playerShootAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("playerShoot", frame); };
    fn.playerShootAudioAudible = function () { return fn.currentAudioAudibility().playerShootAudible; };
    fn.syncPlayerShootAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.playerShoot, "playerShoot", fn.playerShootAudioAudible()); };
    fn.startPlayerShootAudio = function () { fn.startFixedFrameAudio(state.audio.playerShoot, "playerShoot", fn.playerShootAudioAudible()); fn.syncMovementIceAudioNodes(); };
    fn.stopPlayerShootAudio = function () { fn.stopFixedFrameAudio(state.audio.playerShoot); };
    fn.updatePlayerShootAudio = function () { fn.updateFixedFrameAudio(state.audio.playerShoot, "playerShoot", fn.playerShootAudioAudible()); fn.syncMovementIceAudioNodes(); };

    // movementIce
    fn.movementIceAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("movementIce", frame); };
    fn.movementIceAudioAudible = function () { return fn.currentAudioAudibility().movementIceAudible; };
    fn.syncMovementIceAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.movementIce, "movementIce", fn.movementIceAudioAudible()); };
    fn.startMovementIceAudio = function () { fn.startFixedFrameAudio(state.audio.movementIce, "movementIce", fn.movementIceAudioAudible()); };
    fn.stopMovementIceAudio = function () { fn.stopFixedFrameAudio(state.audio.movementIce); };
    fn.updateMovementIceAudio = function () { fn.updateFixedFrameAudio(state.audio.movementIce, "movementIce", fn.movementIceAudioAudible()); };

    // pause
    fn.pauseAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("pause", frame); };
    fn.syncPauseAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.pause, "pause", true, true); };
    fn.startPauseAudio = function () {
      fn.startFixedFrameAudio(state.audio.pause, "pause", true, true);
      fn.syncStageStartAudioNodes(); fn.syncBonusLifeAudioNodes(); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes();
      fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes();
      fn.syncEnemyDestroyAudioNodes(); fn.syncPlayerDestroyAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes();
    };
    fn.stopPauseAudio = function () { fn.stopFixedFrameAudio(state.audio.pause); };
    fn.updatePauseAudio = function () {
      var wasActive = state.audio.pause.active;
      fn.updateFixedFrameAudio(state.audio.pause, "pause", true, true);
      if (!wasActive || state.audio.pause.active) return;
      fn.syncStageStartAudioNodes(); fn.syncBonusLifeAudioNodes(); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes();
      fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes();
      fn.syncEnemyDestroyAudioNodes(); fn.syncPlayerDestroyAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes();
      fn.syncMovementAudio();
    };

    // scoreCount
    fn.scoreCountAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("scoreCount", frame); };
    fn.syncScoreCountAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.scoreCount, "scoreCount", true); };
    fn.startScoreCountAudio = function () { fn.startFixedFrameAudio(state.audio.scoreCount, "scoreCount", true); };
    fn.stopScoreCountAudio = function () { fn.stopFixedFrameAudio(state.audio.scoreCount); };
    fn.updateScoreCountAudio = function () { fn.updateFixedFrameAudio(state.audio.scoreCount, "scoreCount", true); };

    // stageBonus
    fn.stageBonusAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("stageBonus", frame); };
    fn.stageBonusAudioAudible = function () { return fn.currentAudioAudibility().stageBonusAudible; };
    fn.syncStageBonusAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.stageBonus, "stageBonus", fn.stageBonusAudioAudible()); };
    fn.startStageBonusAudio = function () { fn.startFixedFrameAudio(state.audio.stageBonus, "stageBonus", fn.stageBonusAudioAudible()); };
    fn.stopStageBonusAudio = function () { fn.stopFixedFrameAudio(state.audio.stageBonus); };
    fn.updateStageBonusAudio = function () { fn.updateFixedFrameAudio(state.audio.stageBonus, "stageBonus", fn.stageBonusAudioAudible()); };

    // gameOver
    fn.gameOverAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("gameOver", frame); };
    fn.syncGameOverAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.gameOver, "gameOver", true); };
    fn.startGameOverAudio = function () { fn.startFixedFrameAudio(state.audio.gameOver, "gameOver", true); };
    fn.stopGameOverAudio = function () { fn.stopFixedFrameAudio(state.audio.gameOver); };
    fn.updateGameOverAudio = function () { fn.updateFixedFrameAudio(state.audio.gameOver, "gameOver", true); };

    // highScore
    fn.highScoreAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("highScore", frame); };
    fn.syncHighScoreAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.highScore, "highScore", true); };
    fn.startHighScoreAudio = function () { fn.startFixedFrameAudio(state.audio.highScore, "highScore", true); };
    fn.stopHighScoreAudio = function () { fn.stopFixedFrameAudio(state.audio.highScore); };
    fn.updateHighScoreAudio = function () { fn.updateFixedFrameAudio(state.audio.highScore, "highScore", true); };

    // ── Movement audio ───────────────────────────────────────────────────────
    fn.movementAudioPresentation = function (mode, tick) {
      return deps.movementAudioPresentation(mode, tick, deps.FREE_AUDIO_MANIFEST.events);
    };

    fn.stopMovementAudioNode = function () {
      if (state.movementAudio.oscillator) {
        try {
          state.movementAudio.oscillator.stop(state.audioCtx ? state.audioCtx.currentTime : 0);
        } catch (_error) {
          // A stopped oscillator cannot be reused; the next active mode creates a new one.
        }
      }
      state.movementAudio.oscillator = null;
      state.movementAudio.gain = null;
      state.movementAudio.phase = -1;
    };

    fn.startMovementAudioNode = function () {
      if (!state.audioCtx || state.movementAudio.mode === "none") return;
      var presentation = fn.movementAudioPresentation(state.movementAudio.mode, state.game.tick);
      if (!presentation) return;
      var oscillator = state.audioCtx.createOscillator();
      var gain = state.audioCtx.createGain();
      oscillator.type = presentation.wave || "square";
      oscillator.frequency.value = presentation.frequency;
      gain.gain.value = presentation.gain || 0.01;
      oscillator.connect(gain);
      gain.connect(state.audioCtx.destination);
      state.movementAudio.oscillator = oscillator;
      state.movementAudio.gain = gain;
      state.movementAudio.phase = presentation.phase;
      oscillator.start();
    };

    fn.setMovementAudioMode = function (mode) {
      var nextMode = mode === "player" || mode === "enemy" ? mode : "none";
      if (state.movementAudio.mode !== nextMode) {
        fn.stopMovementAudioNode();
        state.movementAudio.mode = nextMode;
      }
      if (nextMode === "none") {
        fn.stopMovementAudioNode();
        return;
      }
      if (!state.movementAudio.oscillator) fn.startMovementAudioNode();
      var presentation = fn.movementAudioPresentation(nextMode, state.game.tick);
      if (!presentation || !state.movementAudio.oscillator || state.movementAudio.phase === presentation.phase) return;
      state.movementAudio.phase = presentation.phase;
      state.movementAudio.oscillator.frequency.value = presentation.frequency;
    };

    fn.stopMovementAudio = function () {
      fn.setMovementAudioMode("none");
    };

    fn.playerHasMovementSoundState = function (player) {
      return Boolean(player && (player.alive || player.respawn > 0));
    };

    fn.playerMovementAudioRequested = function () {
      for (var i = 0; i < state.game.players.length; i += 1) {
        var player = state.game.players[i];
        if (!fn.playerHasMovementSoundState(player)) continue;
        if (state.game.demoMode) {
          if (fn.demoControlForPlayer(player).direction !== -1) return true;
          continue;
        }
        var control = fn.getPlayerControl(player.id);
        if ([control.up, control.right, control.down, control.left].some(function (binding) { return fn.hasControlKey(binding); })) {
          return true;
        }
      }
      return false;
    };

    fn.movementAudioModeForState = function () {
      var mixState = fn.currentAudioMixState();
      if (deps.isMovementAudioBlocked(mixState)) return "none";
      return deps.resolveMovementAudioMode({
        screen: mixState.screen, paused: mixState.paused,
        clearPendingTimer: mixState.clearPendingTimer, baseDestroyTimer: mixState.baseDestroyTimer,
        bonusLifePulse1Active: mixState.bonusLifePulse1Active, bonusLifePulse2Active: mixState.bonusLifePulse2Active,
        active: mixState.active,
        playerMovementRequested: fn.playerMovementAudioRequested()
      });
    };

    fn.syncMovementAudio = function () {
      fn.setMovementAudioMode(fn.movementAudioModeForState());
    };

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
  }

  return { setupAudioBridge: setupAudioBridge };
});
