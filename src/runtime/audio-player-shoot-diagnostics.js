(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPlayerShootDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPlayerShootDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      playerShootAudioPresentation
    } = scope;

    return Object.freeze({
      debugPlayerShootAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.playerShoot;
        const frames = [0, 14, 15];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => playerShootAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioPlayerShootDiagnostics
  });
});
