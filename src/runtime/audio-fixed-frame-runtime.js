(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioFixedFrameRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function setupAudioFixedFrameRuntime(state, deps) {
    var fn = state.fn;

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
          // A naturally ended oscillator no longer needs to be stopped.
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
  }

  return Object.freeze({
    setupAudioFixedFrameRuntime
  });
});
