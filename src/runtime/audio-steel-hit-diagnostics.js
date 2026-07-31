(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioSteelHitDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioSteelHitDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      steelHitAudioPresentation
    } = scope;

    return Object.freeze({
      debugSteelHitAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.steelHit;
        const frames = [0, 1, 2, 3, 4];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => steelHitAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioSteelHitDiagnostics
  });
});
