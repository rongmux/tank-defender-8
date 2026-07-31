(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPowerUpAppearDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPowerUpAppearDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      powerUpAppearAudioPresentation
    } = scope;

    return Object.freeze({
      debugPowerUpAppearAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.powerUpAppear;
        const frames = [0, 3, 4, 7, 8, 27, 28, 31, 32];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => powerUpAppearAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioPowerUpAppearDiagnostics
  });
});
