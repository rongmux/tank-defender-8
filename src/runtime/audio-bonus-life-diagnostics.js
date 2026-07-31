(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioBonusLifeDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioBonusLifeDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      bonusLifeAudioPresentation
    } = scope;

    return Object.freeze({
      debugBonusLifeAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.bonusLife;
        const frames = [0, 1, 2, 5, 6, 41, 42, 53, 54, 59, 60];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => bonusLifeAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioBonusLifeDiagnostics
  });
});
