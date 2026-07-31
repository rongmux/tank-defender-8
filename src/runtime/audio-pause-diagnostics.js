(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPauseDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPauseDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      pauseAudioPresentation
    } = scope;

    return Object.freeze({
      debugPauseAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.pause;
        const frames = [0, 3, 4, 7, 8, 23, 24, 35, 36];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => pauseAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioPauseDiagnostics
  });
});
