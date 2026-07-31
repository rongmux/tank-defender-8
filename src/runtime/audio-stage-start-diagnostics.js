(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioStageStartDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioStageStartDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      stageStartAudioPresentation
    } = scope;

    return Object.freeze({
      debugStageStartAudioProbe() {
        const event = FREE_AUDIO_MANIFEST.events.stageStart;
        const frames = [0, 7, 8, 47, 48, 94, 95, 263, 264];
        return {
          durationFrames: event.durationFrames,
          voiceDurations: event.voices.map(fixedFrameVoiceDuration),
          waves: event.voices.map((voice) => voice.wave),
          frames: frames.map((frame) => stageStartAudioPresentation(frame))
        };
      }
    });
  }

  return Object.freeze({
    createAudioStageStartDiagnostics
  });
});
