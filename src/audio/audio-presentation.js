(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const api = factory();
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.audioPresentation = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function nonNegativeInteger(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function positiveInteger(value) {
    return Math.max(1, Math.floor(Number(value) || 1));
  }

  function fixedFrameVoiceDuration(voice) {
    const segments = voice && Array.isArray(voice.segments) ? voice.segments : [];
    return segments.reduce((total, segment) => {
      const frequencies = Array.isArray(segment.frequencies) ? segment.frequencies : [];
      return total + frequencies.length * positiveInteger(segment.noteFrames) * positiveInteger(segment.repeat);
    }, 0);
  }

  function fixedFrameVoicePresentation(voice, frame) {
    const targetFrame = nonNegativeInteger(frame);
    const segments = voice && Array.isArray(voice.segments) ? voice.segments : [];
    let cursor = 0;
    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      const segment = segments[segmentIndex];
      const frequencies = Array.isArray(segment.frequencies) ? segment.frequencies : [];
      const noteFrames = positiveInteger(segment.noteFrames);
      const repeat = positiveInteger(segment.repeat);
      for (let repeatIndex = 0; repeatIndex < repeat; repeatIndex += 1) {
        for (let noteIndex = 0; noteIndex < frequencies.length; noteIndex += 1) {
          if (targetFrame < cursor + noteFrames) {
            const frequency = Number(frequencies[noteIndex]);
            const configuredGain = Number(segment.gain ?? voice.gain);
            const gain = Number.isFinite(configuredGain) ? Math.max(0, configuredGain) : 0.01;
            if (!(frequency > 0) || gain === 0) return null;
            return {
              frequency,
              gain,
              wave: segment.wave || voice.wave || "square",
              segmentIndex,
              repeatIndex,
              noteIndex,
              frameInNote: targetFrame - cursor
            };
          }
          cursor += noteFrames;
        }
      }
    }
    return null;
  }

  function fixedFrameAudioPresentation(event, frame) {
    const voices = event && Array.isArray(event.voices) ? event.voices : [];
    const targetFrame = nonNegativeInteger(frame);
    const computedDuration = voices.reduce(
      (longest, voice) => Math.max(longest, fixedFrameVoiceDuration(voice)),
      0
    );
    return {
      frame: targetFrame,
      durationFrames: Math.max(
        1,
        Math.floor(Number(event && event.durationFrames) || computedDuration || 1)
      ),
      voices: voices.map((voice) => fixedFrameVoicePresentation(voice, targetFrame))
    };
  }

  function fixedFrameVoiceIsAudible(audible, voiceIndex) {
    if (Array.isArray(audible)) return audible[voiceIndex] !== false;
    return audible !== false;
  }

  function movementAudioPresentation(mode, tick, events) {
    const eventName = mode === "player" ? "movementPlayer" : "movementEnemy";
    const event = events && events[eventName];
    const frequencies = event && Array.isArray(event.frequencies) ? event.frequencies : [];
    if (!frequencies.length) return null;
    const stepFrames = positiveInteger(event.stepFrames);
    const frame = nonNegativeInteger(tick);
    const phase = Math.floor(frame / stepFrames) % frequencies.length;
    return {
      mode,
      eventName,
      phase,
      frequency: frequencies[phase],
      stepFrames,
      gain: event.gain,
      wave: event.wave
    };
  }

  return Object.freeze({
    fixedFrameAudioPresentation,
    fixedFrameVoiceDuration,
    fixedFrameVoiceIsAudible,
    fixedFrameVoicePresentation,
    movementAudioPresentation
  });
});
