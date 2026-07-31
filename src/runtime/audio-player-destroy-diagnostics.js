(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioPlayerDestroyDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioPlayerDestroyDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      playerDestroyAudioPresentation
    } = scope;

    return Object.freeze({
      debugPlayerDestroyAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.playerDestroy;
        const frames = [0, 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => playerDestroyAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioPlayerDestroyDiagnostics
  });
});
