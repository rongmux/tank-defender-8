(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPowerUpPickupDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPowerUpPickupDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      powerUpPickupAudioPresentation
    } = scope;

    return Object.freeze({
      debugPowerUpPickupAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.powerUp;
        const frames = [0, 2, 3, 35, 36, 38, 39];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => powerUpPickupAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioPowerUpPickupDiagnostics
  });
});
