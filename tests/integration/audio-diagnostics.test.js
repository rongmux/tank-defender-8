const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const AUDIO_DIAGNOSTIC_METHODS = [
  "audioManifest",
  "debugScoreCountAudioProbe",
  "debugScoreCountAudioLifecycleProbe",
  "debugStageBonusAudioProbe",
  "debugStageBonusAudioLifecycleProbe",
  "debugMovementAudioProbe",
  "debugMovementIceAudioProbe",
  "debugBrickHitAudioProbe",
  "debugBrickHitAudioLifecycleProbe",
  "debugSteelHitAudioProbe",
  "debugSteelHitAudioLifecycleProbe",
  "debugEnemyHitAudioProbe",
  "debugEnemyHitAudioLifecycleProbe",
  "debugEnemyDestroyAudioProbe",
  "debugEnemyDestroyAudioLifecycleProbe",
  "debugPlayerDestroyAudioProbe",
  "debugPlayerDestroyAudioLifecycleProbe",
  "debugBaseHitAudioProbe",
  "debugBaseHitAudioLifecycleProbe",
  "debugPlayerShootAudioProbe",
  "debugPlayerShootAudioLifecycleProbe",
  "debugMovementIceAudioLifecycleProbe",
  "debugStageStartAudioProbe",
  "debugBonusLifeAudioProbe",
  "debugPowerUpPickupAudioProbe",
  "debugPowerUpAppearAudioProbe",
  "debugPowerUpAppearAudioLifecycleProbe",
  "debugPauseAudioProbe",
  "debugPauseAudioLifecycleProbe",
  "debugPowerUpPickupAudioLifecycleProbe",
  "debugBonusLifeAudioLifecycleProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.audioDiagnostics, "audio diagnostics module should register before game.js");
assert.equal(Object.isFrozen(modules.audioDiagnostics), true);
assert(modules.audioScoreDiagnostics, "score audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioScoreDiagnostics), true);
assert(modules.audioStageBonusDiagnostics, "stage-bonus audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioStageBonusDiagnostics), true);
assert(modules.audioMovementDiagnostics, "movement audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioMovementDiagnostics), true);
assert(modules.audioMovementLifecycleDiagnostics, "movement lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioMovementLifecycleDiagnostics), true);
assert(modules.audioBrickHitDiagnostics, "brick-hit audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioBrickHitDiagnostics), true);
assert(modules.audioBrickHitLifecycleDiagnostics, "brick-hit lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioBrickHitLifecycleDiagnostics), true);
assert(modules.audioSteelHitDiagnostics, "steel-hit audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioSteelHitDiagnostics), true);
assert(modules.audioSteelHitLifecycleDiagnostics, "steel-hit lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioSteelHitLifecycleDiagnostics), true);
assert(modules.audioEnemyHitDiagnostics, "enemy-hit audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioEnemyHitDiagnostics), true);
assert(modules.audioEnemyHitLifecycleDiagnostics, "enemy-hit lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioEnemyHitLifecycleDiagnostics), true);
  assert(modules.audioEnemyDestroyDiagnostics, "enemy-destroy audio diagnostics module should register before audio-diagnostics.js");
  assert.equal(Object.isFrozen(modules.audioEnemyDestroyDiagnostics), true);
  assert(modules.audioEnemyDestroyLifecycleDiagnostics, "enemy-destroy lifecycle audio diagnostics module should register before audio-diagnostics.js");
  assert.equal(Object.isFrozen(modules.audioEnemyDestroyLifecycleDiagnostics), true);
assert(modules.audioPlayerDestroyDiagnostics, "player-destroy audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPlayerDestroyDiagnostics), true);
assert(modules.audioPlayerDestroyLifecycleDiagnostics, "player-destroy lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPlayerDestroyLifecycleDiagnostics), true);
assert(modules.audioBaseHitDiagnostics, "base-hit audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioBaseHitDiagnostics), true);
assert(modules.audioBaseHitLifecycleDiagnostics, "base-hit lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioBaseHitLifecycleDiagnostics), true);
assert(modules.audioPlayerShootDiagnostics, "player-shoot audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPlayerShootDiagnostics), true);
assert(modules.audioStageStartDiagnostics, "stage-start audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioStageStartDiagnostics), true);
assert(modules.audioBonusLifeDiagnostics, "bonus-life audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioBonusLifeDiagnostics), true);
assert(modules.audioBonusLifeLifecycleDiagnostics, "bonus-life lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioBonusLifeLifecycleDiagnostics), true);
assert(modules.audioPowerUpPickupDiagnostics, "power-up-pickup audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPowerUpPickupDiagnostics), true);
assert(modules.audioPowerUpPickupLifecycleDiagnostics, "power-up-pickup lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPowerUpPickupLifecycleDiagnostics), true);
assert(modules.audioPowerUpAppearDiagnostics, "power-up-appear audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPowerUpAppearDiagnostics), true);
assert(modules.audioPowerUpAppearLifecycleDiagnostics, "power-up-appear lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPowerUpAppearLifecycleDiagnostics), true);
assert(modules.audioPauseDiagnostics, "pause audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPauseDiagnostics), true);
assert(modules.audioPauseLifecycleDiagnostics, "pause lifecycle audio diagnostics module should register before audio-diagnostics.js");
assert.equal(Object.isFrozen(modules.audioPauseLifecycleDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(3, 34))),
  AUDIO_DIAGNOSTIC_METHODS
);

const outputs = {};
for (const name of AUDIO_DIAGNOSTIC_METHODS) outputs[name] = api[name]();
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 61974);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "47c2c19c71776240ede8021c8e98db5e4b50e23c059f1e0dbeb441e728557154"
);

const firstManifest = api.audioManifest();
const scoreCountAudioLifecycleProbe = api.debugScoreCountAudioLifecycleProbe();
assert(scoreCountAudioLifecycleProbe.simultaneous.active && scoreCountAudioLifecycleProbe.simultaneous.frame === 0 && scoreCountAudioLifecycleProbe.simultaneous.elapsed === 32, "the first result count should start its paired cue on result frame 32");
assert(scoreCountAudioLifecycleProbe.simultaneous.visibleKills === 2 && scoreCountAudioLifecycleProbe.simultaneous.voices.filter(Boolean).length === 2, "both players counting on the same frame should produce one simultaneous two-voice event");
assert(scoreCountAudioLifecycleProbe.nextCadence.active && scoreCountAudioLifecycleProbe.nextCadence.frame === 0 && scoreCountAudioLifecycleProbe.nextCadence.elapsed === 41 && scoreCountAudioLifecycleProbe.nextCadence.visibleKills === 3, "the next visible result count should retrigger once after the original nine-frame cadence");
assert(!scoreCountAudioLifecycleProbe.zeroKills.active && scoreCountAudioLifecycleProbe.zeroKills.frame === 0, "a zero-kill result should not start count audio");
const stageBonusAudioProbe = api.debugStageBonusAudioProbe();
assert(stageBonusAudioProbe.durationFrames === 28 && stageBonusAudioProbe.voiceDurations.join(",") === "28", "the result leader bonus should contain one twenty-eight-frame voice");
assert(stageBonusAudioProbe.waves.join(",") === "square", "the result leader bonus should retain its pulse-two replacement voice");
assert(stageBonusAudioProbe.frames.filter((frame) => [0, 3, 6, 9, 12, 15, 18].includes(frame.frame)).map((frame) => frame.voices[0].frequency).join(",") === "988,659,659,784,784,988,988", "the result leader bonus should preserve the original seven-note pitch order");
assert(stageBonusAudioProbe.frames.find((frame) => frame.frame === 27).voices[0].frequency === 988, "the final result bonus note should remain active through frame twenty-seven");
assert(stageBonusAudioProbe.frames.find((frame) => frame.frame === 28).voices[0] === null, "the result bonus voice should stop on frame twenty-eight");
const stageBonusAudioLifecycleProbe = api.debugStageBonusAudioLifecycleProbe();
assert(stageBonusAudioLifecycleProbe.awarded.active && stageBonusAudioLifecycleProbe.awarded.frame === 0 && stageBonusAudioLifecycleProbe.awarded.frequency === 988 && stageBonusAudioLifecycleProbe.awarded.audible, "revealing a strict two-player leader should start the audible result bonus cue at frame zero");
assert(stageBonusAudioLifecycleProbe.awarded.elapsed === stageBonusAudioLifecycleProbe.bonusRevealFrame && stageBonusAudioLifecycleProbe.awarded.recipients.join(",") === "1", "the result bonus cue should start exactly on the leader bonus reveal frame");
assert(stageBonusAudioLifecycleProbe.awarded.scoreDelta === 1000 && stageBonusAudioLifecycleProbe.awarded.bonusAwarded, "the cue should accompany the original one-thousand-point leader award");
assert(stageBonusAudioLifecycleProbe.finalFrame.active && stageBonusAudioLifecycleProbe.finalFrame.frame === 27 && stageBonusAudioLifecycleProbe.finalFrame.frequency === 988 && stageBonusAudioLifecycleProbe.finalFrame.audible, "the result bonus cue should stay audible through its final frame");
assert(!stageBonusAudioLifecycleProbe.end.active && stageBonusAudioLifecycleProbe.end.frame === 28 && stageBonusAudioLifecycleProbe.end.scoreDelta === 1000, "the result bonus cue should end once without awarding the score twice");
assert(stageBonusAudioLifecycleProbe.bonusLifePriority.scoreDelta === 1000 && stageBonusAudioLifecycleProbe.bonusLifePriority.livesDelta === 1, "crossing the 20000-point threshold with the result bonus should still award both points and one reserve life");
assert(!stageBonusAudioLifecycleProbe.tied.active && stageBonusAudioLifecycleProbe.tied.recipients.length === 0 && stageBonusAudioLifecycleProbe.tied.score === 0, "a tied two-player result should neither award nor play the leader bonus");
assert(!stageBonusAudioLifecycleProbe.gameOver.active && !stageBonusAudioLifecycleProbe.gameOver.bonusAwarded && stageBonusAudioLifecycleProbe.gameOver.score === 0, "a game-over result should not award or play the leader bonus");
assert(!stageBonusAudioLifecycleProbe.stageCleanup.active && stageBonusAudioLifecycleProbe.stageCleanup.frame === 0, "starting the next stage should clear any pending result bonus cue");
const brickHitAudioProbe = api.debugBrickHitAudioProbe();
assert(brickHitAudioProbe.durationFrames === 3 && brickHitAudioProbe.voiceDurations.join(",") === "3", "destructive wall impact audio should contain one three-frame voice");
assert(brickHitAudioProbe.waves.join(",") === "triangle", "destructive wall impact audio should retain its triangle replacement voice");
assert(brickHitAudioProbe.frames.slice(0, 3).map((frame) => frame.voices[0].frequency).join(",") === "165,246,139", "destructive wall impact audio should follow the original three one-frame pitches");
assert(brickHitAudioProbe.frames[3].voices[0] === null, "destructive wall impact audio should stop on frame three");
const brickHitAudioLifecycleProbe = api.debugBrickHitAudioLifecycleProbe();
assert(brickHitAudioLifecycleProbe.playerBrick.active && brickHitAudioLifecycleProbe.playerBrick.frame === 0 && brickHitAudioLifecycleProbe.playerBrick.audible, "a player brick impact should start destructive wall audio at frame zero");
assert(brickHitAudioLifecycleProbe.playerBrick.hit && brickHitAudioLifecycleProbe.playerBrick.bulletRemoved && brickHitAudioLifecycleProbe.playerBrick.wallBrickMask !== 0xffff && brickHitAudioLifecycleProbe.playerBrick.explosionCount === 1, "a player brick impact should remove the bullet, damage brick fragments, and create one impact");
assert(brickHitAudioLifecycleProbe.playerBrick.movementAudioMode === "enemy" && brickHitAudioLifecycleProbe.beforePause.active && brickHitAudioLifecycleProbe.beforePause.frame === 2, "the independent triangle cue should leave movement audio running through frame two");
assert(brickHitAudioLifecycleProbe.paused.paused && brickHitAudioLifecycleProbe.paused.frame === 2 && !brickHitAudioLifecycleProbe.paused.audible && brickHitAudioLifecycleProbe.paused.pauseFrame === 10, "pause should mute and freeze destructive wall audio while its pause cue advances");
assert(!brickHitAudioLifecycleProbe.end.active && brickHitAudioLifecycleProbe.end.frame === 3 && brickHitAudioLifecycleProbe.end.pauseActive && brickHitAudioLifecycleProbe.end.movementAudioMode === "none", "resuming should finish destructive wall audio on frame three while the pause cue retains pulse-two priority");
assert(!brickHitAudioLifecycleProbe.enemyBrick.active && brickHitAudioLifecycleProbe.enemyBrick.frame === 0 && brickHitAudioLifecycleProbe.enemyBrick.hit && brickHitAudioLifecycleProbe.enemyBrick.bulletRemoved && brickHitAudioLifecycleProbe.enemyBrick.wallMask === 15 && brickHitAudioLifecycleProbe.enemyBrick.explosionCount === 1, "an ordinary enemy brick impact should remain silent while retaining wall damage and collision feedback");
assert(brickHitAudioLifecycleProbe.destructibleSteel.active && brickHitAudioLifecycleProbe.destructibleSteel.audible && brickHitAudioLifecycleProbe.destructibleSteel.hit && brickHitAudioLifecycleProbe.destructibleSteel.bulletRemoved && brickHitAudioLifecycleProbe.destructibleSteel.wallMask === 14, "a max-power player shot destroying steel should use destructive wall audio");
assert(!brickHitAudioLifecycleProbe.stageStartSuppressedEnd.active && brickHitAudioLifecycleProbe.stageStartSuppressedEnd.frame === 3, "a stage-start-masked destructive wall impact should still consume its complete three-frame lifetime");
assert(!brickHitAudioLifecycleProbe.stageCleanup.active && brickHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear any pending destructive wall cue");
const steelHitAudioProbe = api.debugSteelHitAudioProbe();
assert(steelHitAudioProbe.durationFrames === 4 && steelHitAudioProbe.voiceDurations.join(",") === "4", "steel-hit audio should contain one four-frame voice");
assert(steelHitAudioProbe.waves.join(",") === "square", "steel-hit audio should retain its pulse-like replacement voice");
assert(steelHitAudioProbe.frames[0].voices[0].frequency === 1045 && steelHitAudioProbe.frames[1].voices[0].frequency === 1045, "the first steel-hit pitch should hold through frame one");
assert(steelHitAudioProbe.frames[2].voices[0].frequency === 2072 && steelHitAudioProbe.frames[3].voices[0].frequency === 2072, "the second steel-hit pitch should span frames two and three");
assert(steelHitAudioProbe.frames[4].voices[0] === null, "steel-hit audio should stop on frame four");
const steelHitAudioLifecycleProbe = api.debugSteelHitAudioLifecycleProbe();
assert(steelHitAudioLifecycleProbe.playerBoundary.active && steelHitAudioLifecycleProbe.playerBoundary.frame === 0 && steelHitAudioLifecycleProbe.playerBoundary.audible, "a player boundary impact should start steel-hit audio at frame zero");
assert(steelHitAudioLifecycleProbe.playerBoundary.bulletRemoved && steelHitAudioLifecycleProbe.playerBoundary.explosionCount === 1 && steelHitAudioLifecycleProbe.playerBoundary.movementAudioMode === "none", "a player boundary impact should remove the bullet, create one impact, and reserve the movement pulse channel");
assert(steelHitAudioLifecycleProbe.beforePause.active && steelHitAudioLifecycleProbe.beforePause.frame === 3, "steel-hit audio should remain active through frame three");
assert(steelHitAudioLifecycleProbe.paused.paused && steelHitAudioLifecycleProbe.paused.frame === 3 && !steelHitAudioLifecycleProbe.paused.audible && steelHitAudioLifecycleProbe.paused.pauseFrame === 10, "pause should mute and freeze steel-hit audio while its pause cue advances");
assert(!steelHitAudioLifecycleProbe.end.active && steelHitAudioLifecycleProbe.end.frame === 4 && steelHitAudioLifecycleProbe.end.pauseActive && steelHitAudioLifecycleProbe.end.movementAudioMode === "none", "resuming should finish the masked final steel-hit frame while the unfinished pause cue keeps pulse-two priority");
assert(!steelHitAudioLifecycleProbe.enemyBoundary.active && steelHitAudioLifecycleProbe.enemyBoundary.frame === 0 && steelHitAudioLifecycleProbe.enemyBoundary.bulletRemoved && steelHitAudioLifecycleProbe.enemyBoundary.explosionCount === 1, "an enemy boundary impact should remain silent while retaining collision feedback");
assert(!steelHitAudioLifecycleProbe.appearanceSuppressedEnd.active && steelHitAudioLifecycleProbe.appearanceSuppressedEnd.frame === 4, "an appearance-masked steel hit should still consume its complete four-frame lifetime");
assert(!steelHitAudioLifecycleProbe.stageStartSuppressedEnd.active && steelHitAudioLifecycleProbe.stageStartSuppressedEnd.frame === 4, "a stage-start-masked steel hit should still consume its complete four-frame lifetime");
assert(!steelHitAudioLifecycleProbe.stageCleanup.active && steelHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear any pending steel-hit cue");
const enemyHitAudioProbe = api.debugEnemyHitAudioProbe();
assert(enemyHitAudioProbe.durationFrames === 5 && enemyHitAudioProbe.voiceDurations.join(",") === "3", "surviving armored-enemy hit audio should retain a five-frame event with three audible frames");
assert(enemyHitAudioProbe.waves.join(",") === "square", "surviving armored-enemy hit audio should retain its pulse-like replacement voice");
assert(enemyHitAudioProbe.frames[0].voices[0].frequency === 2601, "the first armored-hit pitch should last one frame");
assert(enemyHitAudioProbe.frames[1].voices[0].frequency === 2728 && enemyHitAudioProbe.frames[2].voices[0].frequency === 2728, "the second armored-hit pitch should last two frames");
assert(enemyHitAudioProbe.frames[3].voices[0] === null && enemyHitAudioProbe.frames[4].voices[0] === null && enemyHitAudioProbe.frames[5].voices[0] === null, "armored-hit audio should preserve its two silent tail frames and stop on frame five");
const enemyHitAudioLifecycleProbe = api.debugEnemyHitAudioLifecycleProbe();
assert(enemyHitAudioLifecycleProbe.armoredHit.active && enemyHitAudioLifecycleProbe.armoredHit.frame === 0 && enemyHitAudioLifecycleProbe.armoredHit.audible && enemyHitAudioLifecycleProbe.armoredHit.frequency === 2601, "a surviving armored-enemy hit should start its first pulse pitch at frame zero");
assert(enemyHitAudioLifecycleProbe.armoredHit.hit && enemyHitAudioLifecycleProbe.armoredHit.bulletRemoved && enemyHitAudioLifecycleProbe.armoredHit.enemyAlive && enemyHitAudioLifecycleProbe.armoredHit.enemyHp === 1 && enemyHitAudioLifecycleProbe.armoredHit.explosionCount === 1, "the real armored collision should remove the bullet, reduce one hit point, and retain the enemy");
assert(enemyHitAudioLifecycleProbe.armoredHit.movementAudioMode === "none" && enemyHitAudioLifecycleProbe.secondPitch.active && enemyHitAudioLifecycleProbe.secondPitch.frame === 1 && enemyHitAudioLifecycleProbe.secondPitch.frequency === 2728, "the second pulse channel should suppress movement and switch pitch on frame one");
assert(enemyHitAudioLifecycleProbe.silentTail.active && enemyHitAudioLifecycleProbe.silentTail.frame === 3 && !enemyHitAudioLifecycleProbe.silentTail.voiceActive && !enemyHitAudioLifecycleProbe.silentTail.audible && enemyHitAudioLifecycleProbe.silentTail.movementAudioMode === "none", "the two-frame muted tail should retain pulse-two ownership without producing a tone");
assert(enemyHitAudioLifecycleProbe.paused.paused && enemyHitAudioLifecycleProbe.paused.frame === 3 && enemyHitAudioLifecycleProbe.paused.pauseFrame === 10 && enemyHitAudioLifecycleProbe.paused.movementAudioMode === "none", "pause should freeze the armored-hit silent tail while the pause cue advances");
assert(!enemyHitAudioLifecycleProbe.end.active && enemyHitAudioLifecycleProbe.end.frame === 5 && enemyHitAudioLifecycleProbe.end.pauseActive && enemyHitAudioLifecycleProbe.end.movementAudioMode === "none", "resuming should finish the five-frame armored-hit event while the pause cue keeps pulse-two priority");
assert(!enemyHitAudioLifecycleProbe.lethalHit.active && enemyHitAudioLifecycleProbe.lethalHit.enemyDestroyActive && enemyHitAudioLifecycleProbe.lethalHit.enemyDestroyFrame === 0 && enemyHitAudioLifecycleProbe.lethalHit.hit && enemyHitAudioLifecycleProbe.lethalHit.bulletRemoved && enemyHitAudioLifecycleProbe.lethalHit.enemyAlive && enemyHitAudioLifecycleProbe.lethalHit.enemyDestroying && enemyHitAudioLifecycleProbe.lethalHit.enemyHp === 0 && enemyHitAudioLifecycleProbe.lethalHit.enemyKilled === 0 && enemyHitAudioLifecycleProbe.lethalHit.explosionCount === 1, "a lethal enemy hit should start the retained destruction lifecycle instead of armored-hit audio");
assert(!enemyHitAudioLifecycleProbe.friendlyHit.active && enemyHitAudioLifecycleProbe.friendlyHit.hit && enemyHitAudioLifecycleProbe.friendlyHit.bulletRemoved && enemyHitAudioLifecycleProbe.friendlyHit.stun === 200 && enemyHitAudioLifecycleProbe.friendlyHit.explosionCount === 1, "friendly-fire stun should remain silent for the armored-hit event");
assert(!enemyHitAudioLifecycleProbe.playerHit.active && enemyHitAudioLifecycleProbe.playerHit.playerDestroyActive && enemyHitAudioLifecycleProbe.playerHit.playerDestroyFrame === 0 && enemyHitAudioLifecycleProbe.playerHit.hit && enemyHitAudioLifecycleProbe.playerHit.bulletRemoved && !enemyHitAudioLifecycleProbe.playerHit.playerAlive && enemyHitAudioLifecycleProbe.playerHit.playerDestroying && enemyHitAudioLifecycleProbe.playerHit.playerRespawn === 24 && enemyHitAudioLifecycleProbe.playerHit.explosionCount === 1, "an enemy bullet destroying a player should retain the player death state and start its noise without triggering armored-hit audio");
assert(!enemyHitAudioLifecycleProbe.steelSuppressedEnd.active && enemyHitAudioLifecycleProbe.steelSuppressedEnd.frame === 5, "a steel-masked armored hit should still consume its complete five-frame lifetime");
assert(!enemyHitAudioLifecycleProbe.stageCleanup.active && enemyHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending armored-hit audio");
const enemyDestroyAudioProbe = api.debugEnemyDestroyAudioProbe();
assert(enemyDestroyAudioProbe.durationFrames === 14 && enemyDestroyAudioProbe.voiceDurations.join(",") === "14", "enemy destruction audio should contain one fourteen-frame noise voice");
assert(enemyDestroyAudioProbe.waves.join(",") === "noise-long", "enemy destruction audio should retain its long-period noise replacement voice");
assert(enemyDestroyAudioProbe.frames.slice(0, 6).every((frame) => frame.voices[0].frequency === 3523), "enemy destruction should retain the original noise timer rate throughout all audible frames");
assert(enemyDestroyAudioProbe.frames[0].voices[0].gain === 0.05 && enemyDestroyAudioProbe.frames[1].voices[0].gain === 0.05, "the first enemy destruction envelope should span frames zero and one");
assert(enemyDestroyAudioProbe.frames[2].voices[0].gain === 0.045 && enemyDestroyAudioProbe.frames[3].voices[0].gain === 0.045, "the second enemy destruction envelope should span frames two and three");
assert(enemyDestroyAudioProbe.frames[4].voices[0].gain === 0.022 && enemyDestroyAudioProbe.frames[5].voices[0].gain === 0.022, "the enemy destruction tail should span frames four through thirteen");
assert(enemyDestroyAudioProbe.frames[6].voices[0] === null, "enemy destruction noise should stop on frame fourteen");
const enemyDestroyAudioLifecycleProbe = api.debugEnemyDestroyAudioLifecycleProbe();
assert(enemyDestroyAudioLifecycleProbe.lethalHit.active && enemyDestroyAudioLifecycleProbe.lethalHit.frame === 0 && enemyDestroyAudioLifecycleProbe.lethalHit.audible && enemyDestroyAudioLifecycleProbe.lethalHit.wave === "noise-long", "a lethal player shot should start enemy destruction noise at frame zero");
assert(enemyDestroyAudioLifecycleProbe.lethalHit.hit && enemyDestroyAudioLifecycleProbe.lethalHit.bulletRemoved && enemyDestroyAudioLifecycleProbe.lethalHit.enemyAlive && enemyDestroyAudioLifecycleProbe.lethalHit.enemyDestroying && enemyDestroyAudioLifecycleProbe.lethalHit.enemyKilled === 0 && enemyDestroyAudioLifecycleProbe.lethalHit.explosionCount === 1 && !enemyDestroyAudioLifecycleProbe.lethalHit.enemyHitActive, "a lethal shot should retain the enemy slot during destruction and avoid the surviving-armored-hit pulse cue");
assert(enemyDestroyAudioLifecycleProbe.secondEnvelope.active && enemyDestroyAudioLifecycleProbe.secondEnvelope.frame === 2 && enemyDestroyAudioLifecycleProbe.secondEnvelope.gain === 0.045, "enemy destruction should switch to its second envelope on frame two");
assert(enemyDestroyAudioLifecycleProbe.tailEnvelope.active && enemyDestroyAudioLifecycleProbe.tailEnvelope.frame === 4 && enemyDestroyAudioLifecycleProbe.tailEnvelope.gain === 0.022, "enemy destruction should enter its ten-frame tail on frame four");
assert(enemyDestroyAudioLifecycleProbe.paused.active && enemyDestroyAudioLifecycleProbe.paused.frame === 4 && enemyDestroyAudioLifecycleProbe.paused.paused && !enemyDestroyAudioLifecycleProbe.paused.audible, "pause should mute and freeze enemy destruction noise");
assert(enemyDestroyAudioLifecycleProbe.finalFrame.active && enemyDestroyAudioLifecycleProbe.finalFrame.frame === 13 && enemyDestroyAudioLifecycleProbe.finalFrame.audible, "enemy destruction noise should resume and remain active through frame thirteen");
assert(!enemyDestroyAudioLifecycleProbe.end.active && enemyDestroyAudioLifecycleProbe.end.frame === 14, "enemy destruction noise should end exactly on frame fourteen");
assert(enemyDestroyAudioLifecycleProbe.grenade.active && enemyDestroyAudioLifecycleProbe.grenade.frame === 0 && enemyDestroyAudioLifecycleProbe.grenade.activeEnemies === 0 && enemyDestroyAudioLifecycleProbe.grenade.destroyingEnemies === 2 && enemyDestroyAudioLifecycleProbe.grenade.spawningAlive && enemyDestroyAudioLifecycleProbe.grenade.enemyKilled === 0 && enemyDestroyAudioLifecycleProbe.grenade.explosionCount === 0, "one grenade cue should move active enemies into retained destruction states while preserving spawning enemies");
assert(enemyDestroyAudioLifecycleProbe.noActiveTargets.active && enemyDestroyAudioLifecycleProbe.noActiveTargets.frame === 0 && enemyDestroyAudioLifecycleProbe.noActiveTargets.spawningAlive && enemyDestroyAudioLifecycleProbe.noActiveTargets.enemyKilled === 0 && enemyDestroyAudioLifecycleProbe.noActiveTargets.explosionCount === 0, "a grenade should start one destruction cue even when its only target is still spawning");
assert(!enemyDestroyAudioLifecycleProbe.stageCleanup.active && enemyDestroyAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending enemy destruction noise");
const playerDestroyAudioProbe = api.debugPlayerDestroyAudioProbe();
assert(playerDestroyAudioProbe.durationFrames === 26 && playerDestroyAudioProbe.voiceDurations.join(",") === "26", "player destruction audio should contain one twenty-six-frame noise voice");
assert(playerDestroyAudioProbe.waves.join(",") === "noise-long", "player destruction audio should retain its long-period noise replacement voice");
assert(playerDestroyAudioProbe.frames.slice(0, 16).every((frame) => frame.voices[0].frequency === 1762), "player destruction should retain the original noise timer rate throughout all audible frames");
assert(playerDestroyAudioProbe.frames.slice(0, 16).map((frame) => frame.voices[0].gain).join(",") === "0.05,0.05,0.0467,0.0467,0.0433,0.0433,0.04,0.04,0.0367,0.0367,0.0333,0.0333,0.03,0.03,0.0267,0.0267", "player destruction should preserve all eight descending volume stages");
assert(playerDestroyAudioProbe.frames[16].voices[0] === null, "player destruction noise should stop on frame twenty-six");
const playerDestroyAudioLifecycleProbe = api.debugPlayerDestroyAudioLifecycleProbe();
assert(playerDestroyAudioLifecycleProbe.playerHit.active && playerDestroyAudioLifecycleProbe.playerHit.frame === 0 && playerDestroyAudioLifecycleProbe.playerHit.audible && playerDestroyAudioLifecycleProbe.playerHit.wave === "noise-long", "an enemy bullet destroying a player should start player-destruction noise at frame zero");
assert(playerDestroyAudioLifecycleProbe.playerHit.hit && playerDestroyAudioLifecycleProbe.playerHit.bulletRemoved && !playerDestroyAudioLifecycleProbe.playerHit.playerAlive && playerDestroyAudioLifecycleProbe.playerHit.playerDestroying && playerDestroyAudioLifecycleProbe.playerHit.playerRespawn === 24 && playerDestroyAudioLifecycleProbe.playerHit.explosionCount === 1, "the lethal player hit should create one bullet impact while retaining the destruction picture on the player state");
assert(playerDestroyAudioLifecycleProbe.volume14.active && playerDestroyAudioLifecycleProbe.volume14.frame === 4 && playerDestroyAudioLifecycleProbe.volume14.gain === 0.0467, "player destruction should enter its second volume stage on frame four");
assert(playerDestroyAudioLifecycleProbe.volume13.active && playerDestroyAudioLifecycleProbe.volume13.frame === 8 && playerDestroyAudioLifecycleProbe.volume13.gain === 0.0433, "player destruction should enter its third volume stage on frame eight");
assert(playerDestroyAudioLifecycleProbe.paused.active && playerDestroyAudioLifecycleProbe.paused.frame === 8 && playerDestroyAudioLifecycleProbe.paused.paused && !playerDestroyAudioLifecycleProbe.paused.audible, "pause should mute and freeze player-destruction noise");
assert(playerDestroyAudioLifecycleProbe.finalFrame.active && playerDestroyAudioLifecycleProbe.finalFrame.frame === 25 && playerDestroyAudioLifecycleProbe.finalFrame.gain === 0.0267 && playerDestroyAudioLifecycleProbe.finalFrame.audible, "player destruction should resume and remain audible through frame twenty-five");
assert(!playerDestroyAudioLifecycleProbe.end.active && playerDestroyAudioLifecycleProbe.end.frame === 26, "player destruction should end exactly on frame twenty-six");
assert(!playerDestroyAudioLifecycleProbe.shielded.active && playerDestroyAudioLifecycleProbe.shielded.hit && playerDestroyAudioLifecycleProbe.shielded.bulletRemoved && playerDestroyAudioLifecycleProbe.shielded.playerAlive && playerDestroyAudioLifecycleProbe.shielded.explosionCount === 0, "an invulnerable player hit should consume the bullet without starting destruction noise");
assert(playerDestroyAudioLifecycleProbe.baseHit.active && playerDestroyAudioLifecycleProbe.baseHit.frame === 0 && playerDestroyAudioLifecycleProbe.baseHit.baseHitActive && playerDestroyAudioLifecycleProbe.baseHit.baseHitFrame === 0 && playerDestroyAudioLifecycleProbe.baseHit.baseHitAudible && playerDestroyAudioLifecycleProbe.baseHit.screen === "playing" && playerDestroyAudioLifecycleProbe.baseHit.baseDestroyTimer === 39 && !playerDestroyAudioLifecycleProbe.baseHit.baseAlive && playerDestroyAudioLifecycleProbe.baseHit.bulletRemoved && playerDestroyAudioLifecycleProbe.baseHit.explosionCount === 0, "destroying the base should start both destruction voices and load the original pre-banner counter without a generic bullet impact");
assert(playerDestroyAudioLifecycleProbe.gameOverContinuation.active && playerDestroyAudioLifecycleProbe.gameOverContinuation.frame === 1 && playerDestroyAudioLifecycleProbe.gameOverContinuation.baseHitActive && playerDestroyAudioLifecycleProbe.gameOverContinuation.baseHitFrame === 1 && playerDestroyAudioLifecycleProbe.gameOverContinuation.screen === "playing" && playerDestroyAudioLifecycleProbe.gameOverContinuation.baseDestroyTimer === 38, "both base-triggered destruction voices should continue during the base explosion countdown");
assert(playerDestroyAudioLifecycleProbe.simultaneousProgress.frame === 10 && playerDestroyAudioLifecycleProbe.simultaneousProgress.enemyDestroyActive && playerDestroyAudioLifecycleProbe.simultaneousProgress.enemyDestroyFrame === 13 && !playerDestroyAudioLifecycleProbe.simultaneousProgress.enemyDestroyAudible, "a masked enemy-destruction event should continue consuming its own frame lifetime");
assert(playerDestroyAudioLifecycleProbe.enemySuppressedEnd.active && playerDestroyAudioLifecycleProbe.enemySuppressedEnd.frame === 11 && !playerDestroyAudioLifecycleProbe.enemySuppressedEnd.enemyDestroyActive && playerDestroyAudioLifecycleProbe.enemySuppressedEnd.enemyDestroyFrame === 14, "the masked enemy event should end while player-destruction noise continues");
assert(!playerDestroyAudioLifecycleProbe.stageCleanup.active && playerDestroyAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending player-destruction noise");
const baseHitAudioProbe = api.debugBaseHitAudioProbe();
assert(baseHitAudioProbe.durationFrames === 27 && baseHitAudioProbe.voiceDurations.join(",") === "27", "base destruction audio should contain one twenty-seven-frame pulse voice");
assert(baseHitAudioProbe.waves.join(",") === "square", "base destruction audio should retain its pulse-two replacement voice");
assert(baseHitAudioProbe.frames.filter((frame) => frame.frame < 27 && frame.frame % 3 === 0).map((frame) => frame.voices[0].frequency).join(",") === "261,246,196,155,131,123,98,78,65", "base destruction should preserve the original nine-note descending pitch order");
assert(baseHitAudioProbe.frames[0].voices[0].frequency === 261 && baseHitAudioProbe.frames[1].voices[0].frequency === 261 && baseHitAudioProbe.frames[16].voices[0].frequency === 65 && baseHitAudioProbe.frames[17].voices[0].frequency === 65, "the first and final base-destruction notes should each span all three frames");
assert(baseHitAudioProbe.frames[18].voices[0] === null, "base destruction audio should stop on frame twenty-seven");
const baseHitAudioLifecycleProbe = api.debugBaseHitAudioLifecycleProbe();
assert(baseHitAudioLifecycleProbe.triggered.active && baseHitAudioLifecycleProbe.triggered.frame === 0 && baseHitAudioLifecycleProbe.triggered.frequency === 261 && baseHitAudioLifecycleProbe.triggered.audible, "a real base hit should start its first pulse-two note at frame zero");
assert(baseHitAudioLifecycleProbe.triggered.hit && !baseHitAudioLifecycleProbe.triggered.baseAlive && baseHitAudioLifecycleProbe.triggered.bulletRemoved && baseHitAudioLifecycleProbe.triggered.explosionCount === 0 && baseHitAudioLifecycleProbe.triggered.baseDestroyTimer === 39 && baseHitAudioLifecycleProbe.triggered.playerDestroyActive && baseHitAudioLifecycleProbe.triggered.playerDestroyFrame === 0, "destroying the base should remove the bullet, load 0x27, and start both original destruction events");
assert(baseHitAudioLifecycleProbe.triggered.screen === "playing" && baseHitAudioLifecycleProbe.triggered.movementAudioMode === "none", "base destruction should remain on the active battlefield during its pre-banner countdown");
assert(baseHitAudioLifecycleProbe.gameOverContinuation.active && baseHitAudioLifecycleProbe.gameOverContinuation.frame === 1 && baseHitAudioLifecycleProbe.gameOverContinuation.playerDestroyActive && baseHitAudioLifecycleProbe.gameOverContinuation.playerDestroyFrame === 1 && baseHitAudioLifecycleProbe.gameOverContinuation.baseDestroyTimer === 38, "both destruction events should continue on the first base-explosion frame");
assert(baseHitAudioLifecycleProbe.finalFrame.active && baseHitAudioLifecycleProbe.finalFrame.frame === 26 && baseHitAudioLifecycleProbe.finalFrame.frequency === 65 && baseHitAudioLifecycleProbe.finalFrame.audible && !baseHitAudioLifecycleProbe.finalFrame.playerDestroyActive && baseHitAudioLifecycleProbe.finalFrame.playerDestroyFrame === 26, "the base pulse should outlast player noise and remain audible through frame twenty-six");
assert(!baseHitAudioLifecycleProbe.end.active && baseHitAudioLifecycleProbe.end.frame === 27 && baseHitAudioLifecycleProbe.end.screen === "playing" && baseHitAudioLifecycleProbe.end.baseDestroyTimer === 12, "base destruction audio should end exactly on frame twenty-seven while the visual countdown continues");
assert(baseHitAudioLifecycleProbe.lowerPriorityProgress.active && baseHitAudioLifecycleProbe.lowerPriorityProgress.frame === 4 && !baseHitAudioLifecycleProbe.lowerPriorityProgress.steelHitActive && baseHitAudioLifecycleProbe.lowerPriorityProgress.steelHitFrame === 4 && baseHitAudioLifecycleProbe.lowerPriorityProgress.enemyHitActive && baseHitAudioLifecycleProbe.lowerPriorityProgress.enemyHitFrame === 4, "masked lower-priority impact events should keep consuming their own frame lifetimes");
assert(baseHitAudioLifecycleProbe.lowerPriorityEnd.active && baseHitAudioLifecycleProbe.lowerPriorityEnd.frame === 5 && !baseHitAudioLifecycleProbe.lowerPriorityEnd.enemyHitActive && baseHitAudioLifecycleProbe.lowerPriorityEnd.enemyHitFrame === 5, "the masked armored-hit event should end while base destruction continues");
assert(baseHitAudioLifecycleProbe.paused.active && baseHitAudioLifecycleProbe.paused.frame === 0 && baseHitAudioLifecycleProbe.paused.paused && !baseHitAudioLifecycleProbe.paused.audible, "pause should mute and freeze base-destruction audio");
assert(baseHitAudioLifecycleProbe.resumed.active && baseHitAudioLifecycleProbe.resumed.frame === 0 && !baseHitAudioLifecycleProbe.resumed.paused && baseHitAudioLifecycleProbe.resumed.audible, "resuming should restore the retained first base-destruction note");
assert(baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.active && baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.frame === 26 && !baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.audible && baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.powerUpAppearFrame === 26, "a masked base event should still reach its final frame while the appearance cue continues");
assert(!baseHitAudioLifecycleProbe.appearanceMaskedEnd.active && baseHitAudioLifecycleProbe.appearanceMaskedEnd.frame === 27 && baseHitAudioLifecycleProbe.appearanceMaskedEnd.powerUpAppearActive && baseHitAudioLifecycleProbe.appearanceMaskedEnd.powerUpAppearFrame === 27, "base destruction should end silently beneath the longer appearance cue");
assert(!baseHitAudioLifecycleProbe.stageCleanup.active && baseHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending base-destruction audio");
const playerShootAudioProbe = api.debugPlayerShootAudioProbe();
assert(playerShootAudioProbe.durationFrames === 15 && playerShootAudioProbe.voiceDurations.join(",") === "15", "player shooting audio should contain one fifteen-frame voice");
assert(playerShootAudioProbe.waves.join(",") === "square", "player shooting audio should retain its pulse-like replacement voice");
assert(playerShootAudioProbe.frames[0].voices[0].frequency === 1165 && playerShootAudioProbe.frames[1].voices[0].frequency === 1165, "player shooting audio should hold its single pitch through frame fourteen");
assert(playerShootAudioProbe.frames[2].voices[0] === null, "player shooting audio should stop on frame fifteen");
const playerShootAudioLifecycleProbe = api.debugPlayerShootAudioLifecycleProbe();
assert(playerShootAudioLifecycleProbe.playerStart.active && playerShootAudioLifecycleProbe.playerStart.frame === 0 && playerShootAudioLifecycleProbe.playerStart.audible && playerShootAudioLifecycleProbe.playerStart.bulletCount === 1, "a successful player shot should create one bullet and start its cue at frame zero");
assert(playerShootAudioLifecycleProbe.failedRetrigger.frame === 5 && playerShootAudioLifecycleProbe.failedRetrigger.bulletCount === 1, "a rejected player shot should not restart the active shooting cue");
assert(playerShootAudioLifecycleProbe.beforePause.active && playerShootAudioLifecycleProbe.beforePause.frame === 14, "player shooting audio should remain active through frame fourteen");
assert(playerShootAudioLifecycleProbe.paused.paused && playerShootAudioLifecycleProbe.paused.frame === 14, "pause should mute and freeze player shooting audio without discarding its frame");
assert(!playerShootAudioLifecycleProbe.end.active && playerShootAudioLifecycleProbe.end.frame === 15, "resuming should finish the final shooting frame exactly on frame fifteen");
assert(!playerShootAudioLifecycleProbe.enemyShot.active && playerShootAudioLifecycleProbe.enemyShot.frame === 0 && playerShootAudioLifecycleProbe.enemyShot.bulletCount === 1, "an enemy shot should create its bullet without starting player shooting audio");
assert(playerShootAudioLifecycleProbe.iceSuppressedEnd.active && playerShootAudioLifecycleProbe.iceSuppressedEnd.frame === 4 && !playerShootAudioLifecycleProbe.iceSuppressedEnd.iceActive && playerShootAudioLifecycleProbe.iceSuppressedEnd.iceFrame === 4, "a shot-masked ice cue should expire after four frames while the shot continues");
assert(!playerShootAudioLifecycleProbe.stageStartSuppressedEnd.active && playerShootAudioLifecycleProbe.stageStartSuppressedEnd.frame === 15, "a stage-start-masked shot should still consume its fifteen-frame lifetime");
assert(!playerShootAudioLifecycleProbe.bonusLifeSuppressedEnd.active && playerShootAudioLifecycleProbe.bonusLifeSuppressedEnd.frame === 15, "a bonus-life-masked shot should still consume its fifteen-frame lifetime");
assert(!playerShootAudioLifecycleProbe.stageCleanup.active && playerShootAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear any pending player shooting cue");
const movementIceAudioProbe = api.debugMovementIceAudioProbe();
assert(movementIceAudioProbe.durationFrames === 4 && movementIceAudioProbe.voiceDurations.join(",") === "4", "ice movement audio should contain one four-frame voice");
assert(movementIceAudioProbe.waves.join(",") === "square", "ice movement audio should retain its pulse-like replacement voice");
assert(movementIceAudioProbe.frames.slice(0, 4).map((frame) => frame.voices[0].frequency).join(",") === "279,349,415,523", "ice movement audio should rise through four one-frame notes");
assert(movementIceAudioProbe.frames[4].voices[0] === null, "ice movement audio should stop on frame four");
const movementIceAudioLifecycleProbe = api.debugMovementIceAudioLifecycleProbe();
assert(movementIceAudioLifecycleProbe.start.active && movementIceAudioLifecycleProbe.start.frame === 0 && movementIceAudioLifecycleProbe.start.audible, "entering ice movement should trigger the cue at frame zero");
assert(movementIceAudioLifecycleProbe.start.movementAudioMode === "enemy", "the pulse-one ice cue should remain independent from the pulse-two movement loop");
assert(!movementIceAudioLifecycleProbe.stageStartSuppressedEnd.active && movementIceAudioLifecycleProbe.stageStartSuppressedEnd.frame === 4, "a stage-start-masked ice cue should still consume its four-frame lifetime");
assert(!movementIceAudioLifecycleProbe.bonusLifeSuppressedEnd.active && movementIceAudioLifecycleProbe.bonusLifeSuppressedEnd.frame === 4, "a bonus-life-masked ice cue should still consume its four-frame lifetime");
const bonusLifeAudioProbe = api.debugBonusLifeAudioProbe();
assert(bonusLifeAudioProbe.durationFrames === 60, "bonus-life audio should use the original sixty-frame event lifetime");
assert(bonusLifeAudioProbe.voiceDurations.join(",") === "60,54", "bonus-life pulse voices should preserve their distinct sixty- and fifty-four-frame lengths");
assert(bonusLifeAudioProbe.waves.join(",") === "square,square", "bonus-life audio should retain two pulse-like replacement voices");
assert(bonusLifeAudioProbe.frames[0].voices.every(Boolean) && bonusLifeAudioProbe.frames[1].voices[1].frequency === 523, "both bonus-life voices should begin together and hold the two-frame opening pulse");
assert(bonusLifeAudioProbe.frames[2].voices[1].frequency === 784, "the second bonus-life voice should enter its six-frame phrase on frame two");
assert(bonusLifeAudioProbe.frames[4].voices[0].frequency === 784, "the first bonus-life voice should advance after its opening six-frame note");
assert(bonusLifeAudioProbe.frames[6].voices[0].frequency === 988, "the first bonus-life voice should enter its final eighteen-frame note on frame forty-two");
assert(bonusLifeAudioProbe.frames[7].voices.every(Boolean), "both bonus-life voices should remain active through frame fifty-three");
assert(Boolean(bonusLifeAudioProbe.frames[8].voices[0]) && bonusLifeAudioProbe.frames[8].voices[1] === null, "the second bonus-life voice should release the movement pulse channel on frame fifty-four");
assert(Boolean(bonusLifeAudioProbe.frames[9].voices[0]) && bonusLifeAudioProbe.frames[10].voices.every((voice) => voice === null), "the lead bonus-life voice should hold through frame fifty-nine and stop on frame sixty");
const bonusLifeAudioLifecycleProbe = api.debugBonusLifeAudioLifecycleProbe();
const powerUpPickupAudioProbe = api.debugPowerUpPickupAudioProbe();
assert(powerUpPickupAudioProbe.durationFrames === 39 && powerUpPickupAudioProbe.voiceDurations.join(",") === "39", "power-up pickup audio should contain one thirty-nine-frame voice");
assert(powerUpPickupAudioProbe.waves.join(",") === "square", "power-up pickup audio should retain its pulse-like replacement voice");
assert(powerUpPickupAudioProbe.frames[0].voices[0].frequency === 988 && powerUpPickupAudioProbe.frames[1].voices[0].frequency === 988, "the first pickup note should hold through its three-frame interval");
assert(powerUpPickupAudioProbe.frames[2].voices[0].frequency === 659, "the pickup phrase should advance on frame three");
assert(powerUpPickupAudioProbe.frames[4].voices[0].frequency === 784 && powerUpPickupAudioProbe.frames[5].voices[0].frequency === 784, "the final pickup note should span frames thirty-six through thirty-eight");
assert(powerUpPickupAudioProbe.frames[6].voices[0] === null, "the pickup voice should stop on frame thirty-nine");
const powerUpPickupAudioLifecycleProbe = api.debugPowerUpPickupAudioLifecycleProbe();
assert(powerUpPickupAudioLifecycleProbe.start.active && powerUpPickupAudioLifecycleProbe.start.audible && powerUpPickupAudioLifecycleProbe.start.movementAudioMode === "none", "ordinary pickup audio should start audibly and reserve the movement pulse channel");
assert(powerUpPickupAudioLifecycleProbe.beforePause.frame === 38 && powerUpPickupAudioLifecycleProbe.beforePause.active, "pickup audio should remain active through frame thirty-eight");
assert(powerUpPickupAudioLifecycleProbe.paused.paused && powerUpPickupAudioLifecycleProbe.paused.frame === 38, "pause should mute and freeze pickup audio");
assert(!powerUpPickupAudioLifecycleProbe.end.active && powerUpPickupAudioLifecycleProbe.end.frame === 39 && powerUpPickupAudioLifecycleProbe.end.movementAudioMode === "enemy", "pickup audio should finish on frame thirty-nine and restore movement audio");
assert(!powerUpPickupAudioLifecycleProbe.suppressedEnd.active && powerUpPickupAudioLifecycleProbe.suppressedEnd.frame === 39, "a suppressed pickup event should still consume its complete thirty-nine-frame lifetime");
assert(powerUpPickupAudioLifecycleProbe.suppressedEnd.bonusLifeActive && powerUpPickupAudioLifecycleProbe.suppressedEnd.bonusLifeFrame === 39 && powerUpPickupAudioLifecycleProbe.suppressedEnd.movementAudioMode === "none", "bonus-life pulse priority should remain after the silent pickup event expires");
const powerUpAppearAudioProbe = api.debugPowerUpAppearAudioProbe();
assert(powerUpAppearAudioProbe.durationFrames === 32 && powerUpAppearAudioProbe.voiceDurations.join(",") === "32", "power-up appearance audio should contain one thirty-two-frame voice");
assert(powerUpAppearAudioProbe.waves.join(",") === "square", "power-up appearance audio should retain its pulse-like replacement voice");
assert(powerUpAppearAudioProbe.frames[0].voices[0].frequency === 392 && powerUpAppearAudioProbe.frames[1].voices[0].frequency === 392, "the first appearance note should hold through frame three");
assert(powerUpAppearAudioProbe.frames[2].voices[0].frequency === 330 && powerUpAppearAudioProbe.frames[3].voices[0].frequency === 330, "the appearance phrase should advance on frame four");
assert(powerUpAppearAudioProbe.frames[4].voices[0].frequency === 392 && powerUpAppearAudioProbe.frames[5].voices[0].frequency === 494, "the appearance phrase should retain its four-frame note cadence through frame twenty-seven");
assert(powerUpAppearAudioProbe.frames[6].voices[0].frequency === 523 && powerUpAppearAudioProbe.frames[7].voices[0].frequency === 523, "the final appearance note should span frames twenty-eight through thirty-one");
assert(powerUpAppearAudioProbe.frames[8].voices[0] === null, "the appearance voice should stop on frame thirty-two");
const powerUpAppearAudioLifecycleProbe = api.debugPowerUpAppearAudioLifecycleProbe();
assert(powerUpAppearAudioLifecycleProbe.spawned && powerUpAppearAudioLifecycleProbe.start.powerUpType === "star", "a carrier release should create its configured power-up");
assert(powerUpAppearAudioLifecycleProbe.start.active && powerUpAppearAudioLifecycleProbe.start.frame === 0 && powerUpAppearAudioLifecycleProbe.start.audible && powerUpAppearAudioLifecycleProbe.start.movementAudioMode === "none", "a successful carrier release should start the appearance cue and reserve the movement pulse channel");
assert(powerUpAppearAudioLifecycleProbe.beforePause.active && powerUpAppearAudioLifecycleProbe.beforePause.frame === 15, "the appearance cue should advance through its first fifteen frames");
assert(powerUpAppearAudioLifecycleProbe.paused.paused && powerUpAppearAudioLifecycleProbe.paused.frame === 15, "pause should mute and freeze the appearance cue");
assert(powerUpAppearAudioLifecycleProbe.beforeEnd.active && powerUpAppearAudioLifecycleProbe.beforeEnd.frame === 31, "the appearance cue should remain active through frame thirty-one after resume");
assert(!powerUpAppearAudioLifecycleProbe.end.active && powerUpAppearAudioLifecycleProbe.end.frame === 32 && powerUpAppearAudioLifecycleProbe.end.movementAudioMode === "enemy", "frame thirty-two should end the appearance cue and restore movement audio");
assert(!powerUpAppearAudioLifecycleProbe.suppressedEnd.active && powerUpAppearAudioLifecycleProbe.suppressedEnd.frame === 32, "a masked appearance event should still consume its full thirty-two-frame lifetime");
assert(powerUpAppearAudioLifecycleProbe.suppressedEnd.pickupActive && powerUpAppearAudioLifecycleProbe.suppressedEnd.pickupFrame === 32 && powerUpAppearAudioLifecycleProbe.suppressedEnd.movementAudioMode === "none", "pickup-channel priority should remain after the masked appearance cue expires");
assert(powerUpAppearAudioLifecycleProbe.noSpotSpawned === false && !powerUpAppearAudioLifecycleProbe.noSpot.active && powerUpAppearAudioLifecycleProbe.noSpot.powerUpType === null, "a map with no reachable power-up location should not create an item or an empty appearance cue");
const pauseAudioProbe = api.debugPauseAudioProbe();
assert(pauseAudioProbe.durationFrames === 36 && pauseAudioProbe.voiceDurations.join(",") === "36", "pause audio should contain one thirty-six-frame voice");
assert(pauseAudioProbe.waves.join(",") === "square", "pause audio should retain its pulse-like replacement voice");
assert(pauseAudioProbe.frames[0].voices[0].frequency === 659 && pauseAudioProbe.frames[1].voices[0].frequency === 659, "the first pause note should hold through frame three");
assert(pauseAudioProbe.frames[2].voices[0].frequency === 740 && pauseAudioProbe.frames[3].voices[0].frequency === 740, "the pause phrase should advance on frame four");
assert(pauseAudioProbe.frames[4].voices[0].frequency === 784 && pauseAudioProbe.frames[5].voices[0].frequency === 1175, "the six short pause notes should retain their four-frame cadence");
assert(pauseAudioProbe.frames[6].voices[0].frequency === 988 && pauseAudioProbe.frames[7].voices[0].frequency === 988, "the pause tail should span frames twenty-four through thirty-five");
assert(pauseAudioProbe.frames[8].voices[0] === null, "the pause voice should stop on frame thirty-six");
const pauseAudioLifecycleProbe = api.debugPauseAudioLifecycleProbe();
assert(
  pauseAudioLifecycleProbe.exitedEarly &&
    pauseAudioLifecycleProbe.earlyResume.active &&
    pauseAudioLifecycleProbe.earlyResume.stageStartAudibility.join(",") === "true,true,false" &&
    pauseAudioLifecycleProbe.earlyResume.bonusLifeAudibility.join(",") === "true,false" &&
    !pauseAudioLifecycleProbe.earlyResume.powerUpPickupAudible &&
    !pauseAudioLifecycleProbe.earlyResume.powerUpAppearAudible &&
    pauseAudioLifecycleProbe.earlyResume.movementAudioMode === "none",
  "an unfinished pause cue should retain second-pulse priority after an early resume"
);
firstManifest.events.stageStart.durationFrames = -1;
assert.notEqual(api.audioManifest().events.stageStart.durationFrames, -1);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-diagnostics.js"),
  "utf8"
);
const scoreDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-score-diagnostics.js"),
  "utf8"
);
const stageBonusDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-stage-bonus-diagnostics.js"),
  "utf8"
);
const movementDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-movement-diagnostics.js"),
  "utf8"
);
const movementLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-movement-lifecycle-diagnostics.js"),
  "utf8"
);
const brickHitDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-brick-hit-diagnostics.js"),
  "utf8"
);
const brickHitLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-brick-hit-lifecycle-diagnostics.js"),
  "utf8"
);
const steelHitDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-steel-hit-diagnostics.js"),
  "utf8"
);
const steelHitLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-steel-hit-lifecycle-diagnostics.js"),
  "utf8"
);
const enemyHitDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-enemy-hit-diagnostics.js"),
  "utf8"
);
const enemyHitLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-enemy-hit-lifecycle-diagnostics.js"),
  "utf8"
);
const enemyDestroyDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-enemy-destroy-diagnostics.js"),
  "utf8"
);
const enemyDestroyLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-enemy-destroy-lifecycle-diagnostics.js"),
  "utf8"
);
const playerDestroyLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-player-destroy-lifecycle-diagnostics.js"),
  "utf8"
);
const baseHitLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-base-hit-lifecycle-diagnostics.js"),
  "utf8"
);
const playerDestroyDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-player-destroy-diagnostics.js"),
  "utf8"
);
const baseHitDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-base-hit-diagnostics.js"),
  "utf8"
);
const playerShootDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-player-shoot-diagnostics.js"),
  "utf8"
);
const stageStartDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-stage-start-diagnostics.js"),
  "utf8"
);
const bonusLifeDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-bonus-life-diagnostics.js"),
  "utf8"
);
const bonusLifeLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-bonus-life-lifecycle-diagnostics.js"),
  "utf8"
);
const powerUpPickupDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-power-up-pickup-diagnostics.js"),
  "utf8"
);
const powerUpPickupLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-power-up-pickup-lifecycle-diagnostics.js"),
  "utf8"
);
const powerUpAppearDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-power-up-appear-diagnostics.js"),
  "utf8"
);
const powerUpAppearLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-power-up-appear-lifecycle-diagnostics.js"),
  "utf8"
);
const pauseDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-pause-diagnostics.js"),
  "utf8"
);
const pauseLifecycleDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-pause-lifecycle-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createAudioDiagnostics(state, deps)"));
for (const name of AUDIO_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}()`), false);
  const owner = name.startsWith("debugScoreCountAudio")
    ? scoreDiagnosticsSource
    : name.startsWith("debugStageBonusAudio")
      ? stageBonusDiagnosticsSource
      : name === "debugMovementAudioProbe" || name === "debugMovementIceAudioProbe"
        ? movementDiagnosticsSource
        : name === "debugMovementIceAudioLifecycleProbe"
         ? movementLifecycleDiagnosticsSource
         : name === "debugBrickHitAudioProbe"
           ? brickHitDiagnosticsSource
           : name === "debugBrickHitAudioLifecycleProbe"
           ? brickHitLifecycleDiagnosticsSource
           : name === "debugSteelHitAudioProbe"
             ? steelHitDiagnosticsSource
             : name === "debugSteelHitAudioLifecycleProbe"
             ? steelHitLifecycleDiagnosticsSource
             : name === "debugEnemyHitAudioProbe"
               ? enemyHitDiagnosticsSource
               : name === "debugEnemyHitAudioLifecycleProbe"
                 ? enemyHitLifecycleDiagnosticsSource
                : name === "debugEnemyDestroyAudioProbe"
                 ? enemyDestroyDiagnosticsSource
                 : name === "debugEnemyDestroyAudioLifecycleProbe"
                 ? enemyDestroyLifecycleDiagnosticsSource
                 : name === "debugPlayerDestroyAudioProbe"
                  ? playerDestroyDiagnosticsSource
                  : name === "debugPlayerDestroyAudioLifecycleProbe"
                    ? playerDestroyLifecycleDiagnosticsSource
                  : name === "debugBaseHitAudioProbe"
                    ? baseHitDiagnosticsSource
                    : name === "debugBaseHitAudioLifecycleProbe"
                      ? baseHitLifecycleDiagnosticsSource
                    : name === "debugPlayerShootAudioProbe"
                      ? playerShootDiagnosticsSource
                      : name === "debugStageStartAudioProbe"
                         ? stageStartDiagnosticsSource
                         : name === "debugBonusLifeAudioProbe"
                           ? bonusLifeDiagnosticsSource
                           : name === "debugBonusLifeAudioLifecycleProbe"
                             ? bonusLifeLifecycleDiagnosticsSource
                           : name === "debugPowerUpPickupAudioProbe"
                             ? powerUpPickupDiagnosticsSource
                             : name === "debugPowerUpPickupAudioLifecycleProbe"
                               ? powerUpPickupLifecycleDiagnosticsSource
                             : name === "debugPowerUpAppearAudioProbe"
                               ? powerUpAppearDiagnosticsSource
                               : name === "debugPowerUpAppearAudioLifecycleProbe"
                                 ? powerUpAppearLifecycleDiagnosticsSource
                               : name === "debugPauseAudioProbe"
                                ? pauseDiagnosticsSource
                                : name === "debugPauseAudioLifecycleProbe"
                                  ? pauseLifecycleDiagnosticsSource
          : diagnosticsSource;
  assert.equal(owner.includes(`${name}()`), true);
}
assert.equal(diagnosticsSource.includes("debugScoreCountAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugStageBonusAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugMovementAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugMovementIceAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugBrickHitAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugBrickHitAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugSteelHitAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugSteelHitAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugEnemyHitAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugEnemyHitAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugEnemyDestroyAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugEnemyDestroyAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPlayerDestroyAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPlayerDestroyAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugBaseHitAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugBaseHitAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPlayerShootAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugStageStartAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugBonusLifeAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugBonusLifeAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPowerUpPickupAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPowerUpPickupAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPowerUpAppearAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPowerUpAppearAudioLifecycleProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPauseAudioProbe()"), false);
assert.equal(diagnosticsSource.includes("debugPauseAudioLifecycleProbe()"), false);
assert.equal(debugSource.includes("function startScoreCountAudio()"), false);
assert(debugSource.split(/\r?\n/).length < 6500);

console.log("audio-diagnostics integration test passed");
