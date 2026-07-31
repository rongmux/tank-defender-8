(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioMovementDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createAudioMovementDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    const {
      game,
      keys,
      stageStartAudio,
      bonusLifeAudio,
      powerUpPickupAudio,
      powerUpAppearAudio,
      baseHitAudio,
      movementIceAudio,
      playerShootAudio,
      steelHitAudio,
      enemyHitAudio,
      pauseAudio,
      createPlayer,
      movementAudioModeForState,
      movementAudioPresentation,
      FREE_AUDIO_MANIFEST,
      fixedFrameVoiceDuration,
      movementIceAudioPresentation,
    } = scope;

    return Object.freeze({
        debugMovementAudioProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = {
            active: stageStartAudio.active,
            frame: stageStartAudio.frame
          };
          const previousBonusLife = {
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame
          };
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const previousPowerUpAppear = {
            active: powerUpAppearAudio.active,
            frame: powerUpAppearAudio.frame
          };
          const previousBaseHit = {
            active: baseHitAudio.active,
            frame: baseHitAudio.frame
          };
          const previousMovementIce = {
            active: movementIceAudio.active,
            frame: movementIceAudio.frame
          };
          const previousPlayerShoot = {
            active: playerShootAudio.active,
            frame: playerShootAudio.frame
          };
          const previousSteelHit = {
            active: steelHitAudio.active,
            frame: steelHitAudio.frame
          };
          const previousEnemyHit = {
            active: enemyHitAudio.active,
            frame: enemyHitAudio.frame
          };
          const previousPause = {
            active: pauseAudio.active,
            frame: pauseAudio.frame
          };
          try {
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.invuln = 0;
            player.respawn = 0;
            game.playerCount = 1;
            game.players = [player];
            game.enemies = [];
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.screen = "title";
            stageStartAudio.active = false;
            bonusLifeAudio.active = false;
            powerUpPickupAudio.active = false;
            powerUpAppearAudio.active = false;
            baseHitAudio.active = false;
            movementIceAudio.active = false;
            playerShootAudio.active = false;
            steelHitAudio.active = false;
            enemyHitAudio.active = false;
            pauseAudio.active = false;
            keys.clear();
            const title = movementAudioModeForState();

            game.screen = "playing";
            const idleBattle = movementAudioModeForState();
            stageStartAudio.active = true;
            const stageStart = movementAudioModeForState();
            stageStartAudio.active = false;
            bonusLifeAudio.active = true;
            bonusLifeAudio.frame = 0;
            const bonusLifePulse2 = movementAudioModeForState();
            bonusLifeAudio.frame = 54;
            const bonusLifePulse1Tail = movementAudioModeForState();
            bonusLifeAudio.active = false;
            powerUpPickupAudio.active = true;
            powerUpPickupAudio.frame = 0;
            const powerUpPickup = movementAudioModeForState();
            powerUpPickupAudio.active = false;
            powerUpAppearAudio.active = true;
            const powerUpAppear = movementAudioModeForState();
            powerUpAppearAudio.active = false;
            baseHitAudio.active = true;
            const baseHit = movementAudioModeForState();
            baseHitAudio.active = false;
            enemyHitAudio.active = true;
            const enemyHit = movementAudioModeForState();
            enemyHitAudio.active = false;
            pauseAudio.active = true;
            const pauseCue = movementAudioModeForState();
            pauseAudio.active = false;
            keys.add("ArrowUp");
            const heldDirection = movementAudioModeForState();
            player.alive = false;
            player.respawn = 12;
            const heldDuringDeathState = movementAudioModeForState();
            player.respawn = 0;
            const heldAfterTankRemoved = movementAudioModeForState();
            player.alive = true;
            game.paused = true;
            const paused = movementAudioModeForState();
            game.paused = false;
            game.clearPendingTimer = 128;
            const clearDelay = movementAudioModeForState();
            game.clearPendingTimer = 0;
            game.screen = "gameOver";
            const gameOver = movementAudioModeForState();

            return {
              modes: {
                title,
                idleBattle,
                stageStart,
                bonusLifePulse2,
                bonusLifePulse1Tail,
                powerUpPickup,
                powerUpAppear,
                baseHit,
                enemyHit,
                pauseCue,
                heldDirection,
                heldDuringDeathState,
                heldAfterTankRemoved,
                paused,
                clearDelay,
                gameOver
              },
              enemyFrames: [0, 3, 4, 7, 8].map((tick) => movementAudioPresentation("enemy", tick)),
              playerFrames: [0, 15, 16, 31, 32].map((tick) => movementAudioPresentation("player", tick)),
              ice: { ...FREE_AUDIO_MANIFEST.events.movementIce }
            };
          } finally {
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            Object.assign(game, previous);
          }
        },
        debugMovementIceAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.movementIce;
          const frames = [0, 1, 2, 3, 4];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => movementIceAudioPresentation(frame))
          };
        },
    });
  }

  return Object.freeze({
    createAudioMovementDiagnostics
  });
});
