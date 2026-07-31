(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioBrickHitDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioBrickHitDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      brickHitAudioPresentation
    } = scope;

    return Object.freeze({
        debugBrickHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.brickHit;
          const frames = [0, 1, 2, 3];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => brickHitAudioPresentation(frame))
          };
        },
    });
  }

  return Object.freeze({
    createAudioBrickHitDiagnostics
  });
});
