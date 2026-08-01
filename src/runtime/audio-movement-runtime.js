(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioMovementRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function setupAudioMovementRuntime(state, deps) {
    var fn = state.fn;

    fn.movementAudioPresentation = function (mode, tick) {
      return deps.movementAudioPresentation(mode, tick, deps.FREE_AUDIO_MANIFEST.events);
    };

    fn.stopMovementAudioNode = function () {
      if (state.movementAudio.oscillator) {
        try {
          state.movementAudio.oscillator.stop(state.audioCtx ? state.audioCtx.currentTime : 0);
        } catch (_error) {
          // A stopped oscillator cannot be reused; the next active mode creates a new one.
        }
      }
      state.movementAudio.oscillator = null;
      state.movementAudio.gain = null;
      state.movementAudio.phase = -1;
    };

    fn.startMovementAudioNode = function () {
      if (!state.audioCtx || state.movementAudio.mode === "none") return;
      var presentation = fn.movementAudioPresentation(state.movementAudio.mode, state.game.tick);
      if (!presentation) return;
      var oscillator = state.audioCtx.createOscillator();
      var gain = state.audioCtx.createGain();
      oscillator.type = presentation.wave || "square";
      oscillator.frequency.value = presentation.frequency;
      gain.gain.value = presentation.gain || 0.01;
      oscillator.connect(gain);
      gain.connect(state.audioCtx.destination);
      state.movementAudio.oscillator = oscillator;
      state.movementAudio.gain = gain;
      state.movementAudio.phase = presentation.phase;
      oscillator.start();
    };

    fn.setMovementAudioMode = function (mode) {
      var nextMode = mode === "player" || mode === "enemy" ? mode : "none";
      if (state.movementAudio.mode !== nextMode) {
        fn.stopMovementAudioNode();
        state.movementAudio.mode = nextMode;
      }
      if (nextMode === "none") {
        fn.stopMovementAudioNode();
        return;
      }
      if (!state.movementAudio.oscillator) fn.startMovementAudioNode();
      var presentation = fn.movementAudioPresentation(nextMode, state.game.tick);
      if (!presentation || !state.movementAudio.oscillator || state.movementAudio.phase === presentation.phase) return;
      state.movementAudio.phase = presentation.phase;
      state.movementAudio.oscillator.frequency.value = presentation.frequency;
    };

    fn.stopMovementAudio = function () {
      fn.setMovementAudioMode("none");
    };

    fn.playerHasMovementSoundState = function (player) {
      return Boolean(player && (player.alive || player.respawn > 0));
    };

    fn.playerMovementAudioRequested = function () {
      for (var i = 0; i < state.game.players.length; i += 1) {
        var player = state.game.players[i];
        if (!fn.playerHasMovementSoundState(player)) continue;
        if (state.game.demoMode) {
          if (fn.demoControlForPlayer(player).direction !== -1) return true;
          continue;
        }
        var control = fn.getPlayerControl(player.id);
        if ([control.up, control.right, control.down, control.left].some(function (binding) { return fn.hasControlKey(binding); })) {
          return true;
        }
      }
      return false;
    };

    fn.movementAudioModeForState = function () {
      var mixState = fn.currentAudioMixState();
      if (deps.isMovementAudioBlocked(mixState)) return "none";
      return deps.resolveMovementAudioMode({
        screen: mixState.screen, paused: mixState.paused,
        clearPendingTimer: mixState.clearPendingTimer, baseDestroyTimer: mixState.baseDestroyTimer,
        bonusLifePulse1Active: mixState.bonusLifePulse1Active, bonusLifePulse2Active: mixState.bonusLifePulse2Active,
        active: mixState.active,
        playerMovementRequested: fn.playerMovementAudioRequested()
      });
    };

    fn.syncMovementAudio = function () {
      fn.setMovementAudioMode(fn.movementAudioModeForState());
    };
  }

  return Object.freeze({ setupAudioMovementRuntime: setupAudioMovementRuntime });
});
